import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDev } from '../../../src/context/DevContext';
import { ScreenWrapper } from '../../../src/components/ui/ScreenWrapper';
import { Card } from '../../../src/components/ui/Card';
import { Badge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import { BlurText } from '../../../src/components/ui/BlurText';
import { TiltedCard } from '../../../src/components/ui/TiltedCard';
import { StaggeredItem } from '../../../src/components/ui/StaggeredList';
import { DynamicIsland } from '../../../src/components/DynamicIsland';
import { SectionHeader } from '../../../src/components/ui/SectionHeader';
import { PhotoUploadField } from '../../../src/components/ui/PhotoUploadField';
import { ConnectedCoupleHeart } from '../../../src/components/ui/ConnectedCoupleHeart';
import {
  IconLock,
  IconSparkles,
  IconGift,
  IconCalendar,
  IconHeart
} from '../../../src/components/ui/Icons';
import { Colors } from '../../../src/theme/colors';
import { Spacing, Radii, Shadows, Typography } from '../../../src/theme/tokens';
import { DailyRitualType, WishlistItem } from '@andrea/types';
import { triggerHaptic } from '../../../src/utils/haptics';
import { CreateSurpriseFlow } from '../../../src/features/calendar/components/CreateSurpriseFlow';
import { SurpriseCreationPayload } from '../../../src/features/calendar/domain/calendar.types';

export default function HomeScreen() {
  const router = useRouter();
  const {
    currentDevUser,
    partnerDevUser,
    users,
    ritualSeeds,
    weeklySummary,
    coupleEvents,
    wishes,
    dailyCheckIns,
    weeklyPhotos,
    recordDailyMeetingCheckIn,
    recordWeeklyPhoto,
    addRitualSeed,
    addCoupleEvent,
    getRandomAyaQuestion,
    convertWishToSurprise
  } = useDev();

  const [activeRitualType, setActiveRitualType] = useState<DailyRitualType>('gratitude_note');
  const [ritualInputText, setRitualInputText] = useState('');
  const [uploadedPhotoUri, setUploadedPhotoUri] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(getRandomAyaQuestion());
  const [isSeedSubmitted, setIsSeedSubmitted] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [surpriseWishTarget, setSurpriseWishTarget] = useState<WishlistItem | null>(null);
  const [isSurpriseFlowOpen, setIsSurpriseFlowOpen] = useState(false);

  // Dynamic days calculation from 15 Feb 2025
  const ANNIVERSARY_DATE = new Date('2025-02-15');
  const now = new Date();
  const daysTogether = Math.max(1, Math.floor((now.getTime() - ANNIVERSARY_DATE.getTime()) / (1000 * 60 * 60 * 24)));

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCheckIn = dailyCheckIns?.[todayStr];
  const isUser1 = currentDevUser.name.toLowerCase().includes('tonet');
  const currentResponse = isUser1 ? todayCheckIn?.tonetResponse : todayCheckIn?.andreaResponse;

  const currentWeekId = '2026-W35';
  const currentWeekData = weeklyPhotos?.[currentWeekId] || {
    weekId: currentWeekId,
    weekRangeLabel: '25 - 31 Ago 2026',
  };

  const handleAnswerCheckIn = (response: 'seen' | 'not_seen' | 'wont_see') => {
    triggerHaptic('medium');
    recordDailyMeetingCheckIn(todayStr, response);
    if (response === 'seen') {
      Alert.alert('❤️ Registrado', 'Has indicado que os habéis visto hoy. Cuando ' + partnerDevUser.name + ' responda también, se activará el corazoncito negro 🖤 en el calendario.');
    } else if (response === 'wont_see') {
      Alert.alert('⏳ Marcado', 'Has marcado que hoy no os vais a ver.');
    } else {
      Alert.alert('🌧️ Registrado', 'Has marcado que no os habéis visto hoy.');
    }
  };

  const nextUpcomingEvent = coupleEvents.find((e) => e.status === 'scheduled');
  const partnerWishes = wishes.filter(
    (w) =>
      w.status !== 'fulfilled' &&
      (w.ownerUserId === partnerDevUser.id || (!w.isForSelf && w.createdByUserId === currentDevUser.id))
  );

  const handleOpenSurpriseForWish = (wish: WishlistItem) => {
    triggerHaptic('medium');
    setSurpriseWishTarget(wish);
    setIsSurpriseFlowOpen(true);
  };

  const handleSaveSurpriseFromWish = (payload: SurpriseCreationPayload) => {
    let calculatedRevealAt: string | undefined = undefined;
    if (payload.revealOption === 'custom_date' && payload.revealDate) {
      calculatedRevealAt = `${payload.revealDate}T${payload.revealTime || '12:00'}:00`;
    } else if (payload.revealOption === 'one_day_before') {
      calculatedRevealAt = `${payload.date}T00:00:00`;
    } else if (payload.revealOption === 'same_day_morning') {
      calculatedRevealAt = `${payload.date}T09:00:00`;
    } else if (payload.revealOption === 'specific_time') {
      calculatedRevealAt = `${payload.date}T${payload.time}:00`;
    }

    addCoupleEvent({
      eventType: 'surprise',
      surpriseCategory: payload.category,
      date: payload.date,
      time: payload.time,
      title: payload.title,
      location: payload.location,
      notes: payload.notes,
      revealPolicy: payload.revealOption === 'now' ? 'immediate' : 'scheduled',
      revealAt: calculatedRevealAt,
      visibility: 'private_until_reveal',
      partnerTeaserTitle: payload.visibilityPreset === 'total_secret'
        ? 'Sorpresa secreta'
        : 'Plan especial',
      partnerTeaserSubtitle: payload.visibilityPreset === 'visible_plan'
        ? `Plan el ${payload.date} preparado con cariño.`
        : 'Prepárate para un momento bonito juntos.',
    });

    if (surpriseWishTarget) {
      convertWishToSurprise(surpriseWishTarget.id, `Preparado desde el Nido para el ${payload.date}.`);
    }

    setSurpriseWishTarget(null);
    Alert.alert('✨ Sorpresa Preparada', `Has organizado en secreto "${payload.title}" para ${partnerDevUser.name}.`);
  };

  const handlePlantSeed = () => {
    if (!ritualInputText.trim() && !uploadedPhotoUri) {
      Alert.alert('Escribe unas palabras', 'Comparte una pequeña nota o pensamiento de hoy.');
      return;
    }

    triggerHaptic('success');

    addRitualSeed({
      type: activeRitualType,
      title:
        activeRitualType === 'gratitude_note'
          ? 'Nota de gratitud'
          : activeRitualType === 'question_answer'
          ? currentQuestion.question
          : 'Foto del día',
      body: ritualInputText.trim() || 'Foto compartida con amor',
      photoUrl: uploadedPhotoUri || undefined,
      mood: 'love'
    });

    // Also register in couple events so it is reflected in calendar & timeline
    const todayStr = new Date().toISOString().split('T')[0];
    addCoupleEvent({
      eventType: 'ritual',
      date: todayStr,
      time: new Date().toTimeString().slice(0, 5),
      title:
        activeRitualType === 'gratitude_note'
          ? '🌿 Nota de gratitud'
          : activeRitualType === 'question_answer'
          ? `💬 ${currentQuestion.question}`
          : '📷 Foto del día',
      subtitle: ritualInputText.trim() || 'Momento guardado con amor',
      notes: uploadedPhotoUri ? [uploadedPhotoUri] : undefined,
    });

    setRitualInputText('');
    setUploadedPhotoUri(null);
    setIsSeedSubmitted(true);
    setTimeout(() => setIsSeedSubmitted(false), 3000);
    Alert.alert('🌱 Momento Sembrado', 'Se ha guardado en vuestra memoria compartida y en el calendario.');
  };

  const handleSelectFeeling = (feeling: string) => {
    triggerHaptic('selection');
    setSelectedFeeling(feeling);
    Alert.alert('💖 Sentimiento Compartido', 'Has enviado un mensaje de ' + feeling + ' a ' + partnerDevUser.name + '.');
  };

  return (
    <ScreenWrapper>
      {/* ── DYNAMIC ISLAND HEADER PILL ── */}
      <DynamicIsland />

      {/* ── GREETING & AMBIENT HEADER ── */}
      <View style={styles.headerBlock}>
        <View style={styles.greetingTextGroup}>
          <Text style={styles.greetingEyebrow}>NUESTRO NIDO</Text>
          <Text style={styles.greetingTitle}>
            Hola, {currentDevUser.name}
          </Text>
          <Text style={styles.greetingSubtitle}>
            {daysTogether} días juntos construyendo nuestra historia de amor.
          </Text>
        </View>
      </View>

      {/* ── HERO CONNECTED HEART ── */}
      <View style={{ marginBottom: Spacing.lg }}>
        <ConnectedCoupleHeart
          user1Name={users?.user1?.name || 'Tonet'}
          user1Avatar={users?.user1?.avatar || 'T'}
          user1PhotoUrl={users?.user1?.avatarPhoto}
          onEditAvatar1={() => router.push('/(tabs)/account')}
          user2Name={users?.user2?.name || 'Andrea'}
          user2Avatar={users?.user2?.avatar || 'A'}
          user2PhotoUrl={users?.user2?.avatarPhoto}
          onEditAvatar2={() => router.push('/(tabs)/account')}
          currentUserName={currentDevUser.name}
          daysTogether={daysTogether}
          startDateFormatted="15 de Febrero de 2025"
        />
      </View>

      {/* ── FEELING CHECK-IN DIAL ── */}
      <Card style={[styles.ritualCard, { marginBottom: Spacing.lg }]} variant="elevated">
        <View style={styles.ritualCardHeader}>
          <View style={styles.ritualTitleGroup}>
            <Badge variant="rose">SINTONÍA</Badge>
            <Text style={styles.ritualCardTitle}>¿Cómo te sientes ahora?</Text>
          </View>
          <Text style={styles.ritualCardSubtitle}>
            Un toque sutil para conectar con {partnerDevUser.name} sin palabras.
          </Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.sm, gap: 8 }}>
          {[
            { emoji: '🥰', label: 'Cariñoso/a', key: 'love' },
            { emoji: '✨', label: 'Ilusionado/a', key: 'spark' },
            { emoji: '☕', label: 'Tranquilo/a', key: 'calm' },
            { emoji: '🫂', label: 'Mimos', key: 'cuddle' },
          ].map((f) => (
            <TouchableOpacity
              key={f.key}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 12,
                borderRadius: Radii.lg,
                backgroundColor: selectedFeeling === f.key ? '#EF826A' : '#FAF8F5',
                borderWidth: 1,
                borderColor: selectedFeeling === f.key ? '#EF826A' : 'rgba(58, 47, 56, 0.06)',
              }}
              activeOpacity={0.8}
              onPress={() => handleSelectFeeling(f.label)}
            >
              <Text style={{ fontSize: 20, marginBottom: 4 }}>{f.emoji}</Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: selectedFeeling === f.key ? '#FFFFFF' : '#3A2F38',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* ── DAILY MEETING CHECK-IN CARD (CORAZONCITO NEGRO EN CALENDARIO) ── */}
      <Card style={[styles.ritualCard, { marginBottom: 28 }]} variant="glass">
        <View style={styles.ritualCardHeader}>
          <View style={styles.ritualTitleGroup}>
            <Badge variant="primary">ENCUENTRO DIARIO</Badge>
            <Text style={styles.ritualCardTitle}>¿Nos hemos visto hoy?</Text>
          </View>
          <Text style={styles.ritualCardSubtitle}>
            Si ambos confirmáis que os habéis visto, aparecerá un corazoncito negro 🖤 en vuestro calendario.
          </Text>
        </View>

        {/* Partner Live Status Badges */}
        <View style={styles.checkInStatusRow}>
          <View style={[styles.checkInUserBadge, todayCheckIn?.tonetResponse === 'seen' && styles.checkInUserBadgeActiveSeen]}>
            <Text style={styles.checkInUserEmoji}>
              {todayCheckIn?.tonetResponse === 'seen' ? '❤️' : todayCheckIn?.tonetResponse === 'wont_see' ? '⏳' : todayCheckIn?.tonetResponse === 'not_seen' ? '🌧️' : '⏳'}
            </Text>
            <Text style={styles.checkInUserName}>
              Tonet: {todayCheckIn?.tonetResponse === 'seen' ? 'Nos vimos' : todayCheckIn?.tonetResponse === 'wont_see' ? 'No nos vemos' : todayCheckIn?.tonetResponse === 'not_seen' ? 'No nos vimos' : 'Pendiente'}
            </Text>
          </View>

          <View style={[styles.checkInUserBadge, todayCheckIn?.andreaResponse === 'seen' && styles.checkInUserBadgeActiveSeen]}>
            <Text style={styles.checkInUserEmoji}>
              {todayCheckIn?.andreaResponse === 'seen' ? '❤️' : todayCheckIn?.andreaResponse === 'wont_see' ? '⏳' : todayCheckIn?.andreaResponse === 'not_seen' ? '🌧️' : '⏳'}
            </Text>
            <Text style={styles.checkInUserName}>
              Andrea: {todayCheckIn?.andreaResponse === 'seen' ? 'Nos vimos' : todayCheckIn?.andreaResponse === 'wont_see' ? 'No nos vemos' : todayCheckIn?.andreaResponse === 'not_seen' ? 'No nos vimos' : 'Pendiente'}
            </Text>
          </View>
        </View>

        {/* Result banner if met or marked wont_see */}
        {todayCheckIn?.confirmedMet ? (
          <View style={styles.confirmedMetBanner}>
            <Text style={styles.confirmedMetText}>
              🖤 ¡Hoy os habéis visto! Marcado con corazón negro en el calendario de este mes.
            </Text>
          </View>
        ) : todayCheckIn?.wontSee ? (
          <View style={styles.wontSeeBanner}>
            <Text style={styles.wontSeeText}>
              ⏳ Marcado: Hoy no os vais a ver. ¡Mucho ánimo en el día!
            </Text>
          </View>
        ) : null}

        {/* Interactive Answer Buttons */}
        <View style={styles.checkInButtonsRow}>
          <TouchableOpacity
            style={[
              styles.btnCheckInOption,
              currentResponse === 'seen' && styles.btnCheckInOptionSelectedSeen,
            ]}
            onPress={() => handleAnswerCheckIn('seen')}
            activeOpacity={0.8}
          >
            <Text style={styles.btnCheckInEmoji}>❤️</Text>
            <Text style={[styles.btnCheckInLabel, currentResponse === 'seen' && styles.btnCheckInLabelSelected]}>
              Sí, nos vimos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.btnCheckInOption,
              currentResponse === 'not_seen' && styles.btnCheckInOptionSelected,
            ]}
            onPress={() => handleAnswerCheckIn('not_seen')}
            activeOpacity={0.8}
          >
            <Text style={styles.btnCheckInEmoji}>🌧️</Text>
            <Text style={[styles.btnCheckInLabel, currentResponse === 'not_seen' && styles.btnCheckInLabelSelected]}>
              No nos vimos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.btnCheckInOption,
              currentResponse === 'wont_see' && styles.btnCheckInOptionSelected,
            ]}
            onPress={() => handleAnswerCheckIn('wont_see')}
            activeOpacity={0.8}
          >
            <Text style={styles.btnCheckInEmoji}>⏳</Text>
            <Text style={[styles.btnCheckInLabel, currentResponse === 'wont_see' && styles.btnCheckInLabelSelected]}>
              No nos vemos
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* ── WEEKLY PHOTO RITUAL: JUNTOS Y SEPARADOS ── */}
      <Card style={[styles.ritualCard, { marginBottom: 28 }]} variant="glass">
        <View style={styles.ritualCardHeader}>
          <View style={styles.ritualTitleGroup}>
            <Badge variant="butter">ÁLBUM SEMANAL</Badge>
            <Text style={styles.ritualCardTitle}>Semana en Fotos</Text>
          </View>
          <Text style={styles.ritualCardSubtitle}>
            Una vez a la semana: 1 foto juntos y 1 foto de cada uno por separado ({currentWeekData.weekRangeLabel}).
          </Text>
        </View>

        <View style={styles.weeklyPhotosGrid}>
          {/* Photo Together */}
          <View style={styles.weeklyPhotoBox}>
            <Text style={styles.weeklyPhotoLabel}>📸 Foto Juntos</Text>
            <PhotoUploadField
              imageUri={currentWeekData.photoTogether}
              onImageChange={(uri) => recordWeeklyPhoto(currentWeekId, 'together', uri || '')}
              label="Foto Juntos"
              placeholderText="+ Subir foto juntos"
            />
          </View>

          {/* Photo Tonet */}
          <View style={styles.weeklyPhotoBox}>
            <Text style={styles.weeklyPhotoLabel}>🤳 Tonet (Separados)</Text>
            <PhotoUploadField
              imageUri={currentWeekData.photoTonet}
              onImageChange={(uri) => recordWeeklyPhoto(currentWeekId, 'tonet', uri || '')}
              label="Foto Tonet"
              placeholderText="+ Subir foto"
            />
          </View>

          {/* Photo Andrea */}
          <View style={styles.weeklyPhotoBox}>
            <Text style={styles.weeklyPhotoLabel}>🤳 Andrea (Separados)</Text>
            <PhotoUploadField
              imageUri={currentWeekData.photoAndrea}
              onImageChange={(uri) => recordWeeklyPhoto(currentWeekId, 'andrea', uri || '')}
              label="Foto Andrea"
              placeholderText="+ Subir foto"
            />
          </View>
        </View>
      </Card>

      {/* ── DAILY RITUAL: SEMILLA DEL DÍA (CERO PRESIÓN) ── */}
      <Card style={styles.ritualCard} variant="elevated">
        <View style={styles.ritualCardHeader}>
          <View style={styles.ritualTitleGroup}>
            <Badge variant="sage">RITUAL DEL DÍA</Badge>
            <Text style={styles.ritualCardTitle}>Semilla de Conexión</Text>
          </View>
          <Text style={styles.ritualCardSubtitle}>
            Sin obligaciones ni rachas: un pequeño instante para alimentar vuestra historia.
          </Text>
        </View>

        {/* Micro-Action Selector */}
        <View style={styles.ritualSelectorRow}>
          <TouchableOpacity
            style={[styles.ritualTab, activeRitualType === 'gratitude_note' && styles.ritualTabActive]}
            onPress={() => setActiveRitualType('gratitude_note')}
          >
            <Text style={[styles.ritualTabText, activeRitualType === 'gratitude_note' && styles.ritualTabTextActive]}>
              Gratitud
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ritualTab, activeRitualType === 'question_answer' && styles.ritualTabActive]}
            onPress={() => {
              setActiveRitualType('question_answer');
              setCurrentQuestion(getRandomAyaQuestion());
            }}
          >
            <Text style={[styles.ritualTabText, activeRitualType === 'question_answer' && styles.ritualTabTextActive]}>
              Pregunta
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ritualTab, activeRitualType === 'daily_photo' && styles.ritualTabActive]}
            onPress={() => setActiveRitualType('daily_photo')}
          >
            <Text style={[styles.ritualTabText, activeRitualType === 'daily_photo' && styles.ritualTabTextActive]}>
              Foto del día
            </Text>
          </TouchableOpacity>
        </View>

        {/* Active Ritual Prompt */}
        <View style={styles.ritualPromptBox}>
          {activeRitualType === 'gratitude_note' && (
            <Text style={styles.ritualPromptText}>
              "Hoy me hizo sentir querido/a cuando..."
            </Text>
          )}

          {activeRitualType === 'question_answer' && (
            <View>
              <Text style={styles.ritualQuestionBadge}>Pregunta de Andrea · {currentQuestion.category.toUpperCase()}</Text>
              <BlurText text={currentQuestion.question} style={styles.ritualPromptText} />
            </View>
          )}

          {activeRitualType === 'daily_photo' && (
            <View style={{ marginBottom: Spacing.sm }}>
              <Text style={styles.ritualPromptText}>
                "Una foto espontánea de lo que tienes delante ahora mismo."
              </Text>
              <PhotoUploadField
                imageUri={uploadedPhotoUri}
                onImageChange={setUploadedPhotoUri}
                label="Foto del momento"
                placeholderText="Toca para abrir la cámara o elegir de tu fototeca"
              />
            </View>
          )}

          <TextInput
            style={styles.ritualTextInput}
            placeholder={
              activeRitualType === 'gratitude_note'
                ? 'Escribe ese detalle bonito que notaste hoy...'
                : activeRitualType === 'question_answer'
                ? 'Tu respuesta sincera (se compartirá suavemente)...'
                : 'Escribe una dedicatoria o pie de foto (opcional)...'
            }
            placeholderTextColor={Colors.light.textMuted}
            value={ritualInputText}
            onChangeText={setRitualInputText}
            multiline
          />

          <View style={styles.ritualSubmitRow}>
            <View style={styles.privacyRow}>
              <IconLock size={12} color={Colors.light.textMuted} />
              <Text style={styles.ritualPrivacyHint}>Guardado en este dispositivo</Text>
            </View>
            <Button
              variant="primary"
              size="sm"
              onPress={handlePlantSeed}
            >
              {isSeedSubmitted ? 'Sembrado' : 'Sembrar momento'}
            </Button>
          </View>
        </View>
      </Card>

      {/* ── GENTLE WEEKLY SUMMARY (NO PUNITIVO) ── */}
      <View style={styles.weeklySummaryBox}>
        <View style={styles.weeklySummaryIconWrap}>
          <IconSparkles size={16} color={Colors.light.textGold} />
        </View>
        <View style={styles.weeklySummaryTextGroup}>
          <Text style={styles.weeklySummaryTitle}>Vuestra Semana</Text>
          <Text style={styles.weeklySummaryDesc}>{weeklySummary.gentleMessage}</Text>
        </View>
      </View>

      {/* ── UPCOMING PLAN OR ACTIVE SURPRISE ── */}
      {nextUpcomingEvent && (
        <View style={styles.sectionBlock}>
          <SectionHeader
            title="Próximo Plan en el Calendario"
            subtitle="La vida que estáis preparando juntos"
          />

          <Card style={styles.upcomingCard} variant="interactive">
            <View style={styles.upcomingDateBadge}>
              <Text style={styles.upcomingDayNumber}>{nextUpcomingEvent.date.split('-')[2]}</Text>
              <Text style={styles.upcomingMonthName}>AGO</Text>
            </View>

            <View style={styles.upcomingDetails}>
              <View style={styles.upcomingHeaderRow}>
                <Badge
                  variant={nextUpcomingEvent.eventType === 'surprise' ? 'secondary' : 'primary'}
                >
                  {nextUpcomingEvent.eventType === 'surprise' ? 'SORPRESA' : 'CITA'}
                </Badge>
                {nextUpcomingEvent.time && (
                  <Text style={styles.upcomingTime}>{nextUpcomingEvent.time} h</Text>
                )}
              </View>

              <Text style={styles.upcomingTitle}>
                {nextUpcomingEvent.ownerId === currentDevUser.id
                  ? nextUpcomingEvent.ownerView.title
                  : nextUpcomingEvent.partnerView.title}
              </Text>

              <Text style={styles.upcomingSubtitle} numberOfLines={2}>
                {nextUpcomingEvent.ownerId === currentDevUser.id
                  ? nextUpcomingEvent.ownerView.subtitle
                  : nextUpcomingEvent.partnerView.subtitle}
              </Text>

              {nextUpcomingEvent.ownerId !== currentDevUser.id && nextUpcomingEvent.partnerView.isSecret && (
                <View style={styles.secretClueBox}>
                  <Text style={styles.secretClueText}>
                    Los detalles se revelarán automáticamente cuando llegue el momento.
                  </Text>
                </View>
              )}
            </View>
          </Card>
        </View>
      )}

      {/* ── PARTNER WISHES QUICK PEEK (IDEAS PARA REGALAR O SORPRENDER) ── */}
      {partnerWishes.length > 0 && (
        <View style={styles.sectionBlock}>
          <SectionHeader
            title={`A ${partnerDevUser.name} le hace ilusión...`}
            subtitle="Deseos guardados que puedes convertir en un detalle sorpresa"
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.wishesPeekScroll}>
            {partnerWishes.map((wish) => (
              <Card key={wish.id} style={styles.wishPeekCard} variant="interactive">
                {wish.externalImageUrl && (
                  <Image source={{ uri: wish.externalImageUrl }} style={styles.wishPeekImg} />
                )}
                <View style={styles.wishPeekContent}>
                  <Badge variant="primary">Deseo</Badge>
                  <Text style={styles.wishPeekTitle} numberOfLines={2}>{wish.title}</Text>
                  {wish.estimatedPrice && (
                    <Text style={styles.wishPeekPrice}>{wish.estimatedPrice}€</Text>
                  )}
                  <TouchableOpacity
                    style={styles.btnPeekSurprise}
                    onPress={() => handleOpenSurpriseForWish(wish)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.btnPeekSurpriseText}>Preparar sorpresa ✨</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Surprise Creation Flow for Wish */}
      <CreateSurpriseFlow
        visible={isSurpriseFlowOpen}
        onClose={() => {
          setIsSurpriseFlowOpen(false);
          setSurpriseWishTarget(null);
        }}
        onSuccess={handleSaveSurpriseFromWish}
        initialTitle={surpriseWishTarget ? `Sorpresa: ${surpriseWishTarget.title}` : undefined}
        initialCategory={
          surpriseWishTarget?.type === 'restaurant'
            ? 'cena'
            : surpriseWishTarget?.type === 'trip'
            ? 'escapada'
            : 'regalo'
        }
        initialLocation={surpriseWishTarget?.brand || surpriseWishTarget?.storeName}
        initialNotes={
          surpriseWishTarget?.sourceUrl
            ? `Enlace del deseo: ${surpriseWishTarget.sourceUrl}`
            : undefined
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingTop: Spacing.xs,
  },
  greetingTextGroup: {
    flex: 1,
    paddingRight: 52,
  },
  greetingEyebrow: {
    ...Typography.overline,
    color: Colors.light.primary,
    marginBottom: 3,
  },
  greetingTitle: {
    ...Typography.h1,
    color: Colors.light.text,
  },
  greetingSubtitle: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  ritualCard: {
    padding: Spacing.lg,
    borderRadius: Radii.xl,
    backgroundColor: '#FFFFFF',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.05)',
    ...Shadows.subtle,
  },
  ritualCardHeader: {
    marginBottom: Spacing.md,
  },
  ritualTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  ritualCardTitle: {
    ...Typography.h3,
    color: Colors.light.text,
  },
  ritualCardSubtitle: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    lineHeight: 16,
  },
  // Check-in Meeting Styles
  checkInStatusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  checkInUserBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.06)',
    gap: 6,
  },
  checkInUserBadgeActiveSeen: {
    backgroundColor: '#FFF0F2',
    borderColor: 'rgba(224, 86, 102, 0.25)',
  },
  checkInUserEmoji: {
    fontSize: 14,
  },
  checkInUserName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2B2129',
    flexShrink: 1,
  },
  confirmedMetBanner: {
    backgroundColor: '#1E1B1D',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  confirmedMetText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  wontSeeBanner: {
    backgroundColor: '#FAF0E6',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(180, 130, 70, 0.2)',
  },
  wontSeeText: {
    color: '#8A5D18',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  checkInButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btnCheckInOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 14,
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
  },
  btnCheckInOptionSelectedSeen: {
    backgroundColor: '#FFF0F2',
    borderColor: Colors.light.primary,
  },
  btnCheckInOptionSelected: {
    backgroundColor: '#F0F6F2',
    borderColor: '#5E9470',
  },
  btnCheckInEmoji: {
    fontSize: 18,
    marginBottom: 3,
  },
  btnCheckInLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#574C55',
    textAlign: 'center',
  },
  btnCheckInLabelSelected: {
    color: Colors.light.primary,
  },

  // Weekly Photos Album Styles
  weeklyPhotosGrid: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  weeklyPhotoBox: {
    flex: 1,
    minWidth: 95,
  },
  weeklyPhotoLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2B2129',
    marginBottom: 6,
  },
  ritualSelectorRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 19, 18, 0.04)',
    borderRadius: Radii.full,
    padding: 3,
    marginBottom: Spacing.md,
  },
  ritualTab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: Radii.full,
    alignItems: 'center',
  },
  ritualTabActive: {
    backgroundColor: '#FFFFFF',
    ...Shadows.subtle,
  },
  ritualTabText: {
    ...Typography.caption,
    fontSize: 11.5,
    color: Colors.light.textSecondary,
  },
  ritualTabTextActive: {
    ...Typography.captionBold,
    fontSize: 11.5,
    color: Colors.light.text,
  },
  ritualPromptBox: {
    backgroundColor: '#FAF8F5',
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.04)',
  },
  ritualQuestionBadge: {
    ...Typography.captionBold,
    fontSize: 10,
    color: Colors.light.secondary,
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  ritualPromptText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.light.text,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  ritualTextInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.08)',
    borderRadius: Radii.md,
    padding: Spacing.md,
    fontSize: 13.5,
    color: Colors.light.text,
    minHeight: 68,
    textAlignVertical: 'top',
    marginBottom: Spacing.sm,
  },
  ritualSubmitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ritualPrivacyHint: {
    ...Typography.caption,
    fontSize: 10.5,
    color: Colors.light.textMuted,
  },
  weeklySummaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.light.sageLight,
    padding: Spacing.md,
    borderRadius: Radii.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(109, 158, 123, 0.2)',
  },
  weeklySummaryIconWrap: {
    width: 38,
    height: 38,
    borderRadius: Radii.full,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  weeklySummaryIcon: {
    fontSize: 18,
  },
  weeklySummaryTextGroup: {
    flex: 1,
  },
  weeklySummaryTitle: {
    ...Typography.captionBold,
    fontSize: 13,
    color: Colors.light.sageDark,
  },
  weeklySummaryDesc: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.light.text,
    marginTop: 1,
    lineHeight: 16,
  },
  sectionBlock: {
    marginBottom: 28,
  },
  upcomingCard: {
    flexDirection: 'row',
    padding: 18,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
    shadowColor: '#2B2129',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  upcomingDateBadge: {
    width: 48,
    height: 54,
    borderRadius: Radii.md,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(224, 86, 102, 0.3)',
  },
  upcomingDayNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.primaryDark,
  },
  upcomingMonthName: {
    ...Typography.captionBold,
    fontSize: 9.5,
    color: Colors.light.primaryDark,
    textTransform: 'uppercase',
  },
  upcomingDetails: {
    flex: 1,
  },
  upcomingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  upcomingTime: {
    ...Typography.caption,
    fontSize: 11.5,
    color: Colors.light.textMuted,
  },
  upcomingTitle: {
    ...Typography.headline,
    fontSize: 15,
    color: Colors.light.text,
  },
  upcomingSubtitle: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  secretClueBox: {
    marginTop: Spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: Colors.light.secondaryLight,
    borderRadius: Radii.sm,
  },
  secretClueText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.light.secondaryDark,
    fontWeight: '500',
  },
  wishesPeekScroll: {
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  wishPeekCard: {
    width: 195,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    padding: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.05)',
    ...Shadows.subtle,
  },
  wishPeekImg: {
    width: '100%',
    height: 115,
    backgroundColor: '#FAF8F5',
  },
  wishPeekContent: {
    padding: Spacing.md,
  },
  wishPeekTitle: {
    ...Typography.bodyMedium,
    fontSize: 13.5,
    color: Colors.light.text,
    marginTop: 4,
    lineHeight: 18,
  },
  wishPeekPrice: {
    ...Typography.captionBold,
    fontSize: 12,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  btnPeekSurprise: {
    marginTop: Spacing.sm,
    backgroundColor: 'rgba(138, 123, 181, 0.1)',
    paddingVertical: 6.5,
    borderRadius: Radii.full,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(138, 123, 181, 0.2)',
  },
  btnPeekSurpriseText: {
    ...Typography.captionBold,
    fontSize: 11,
    color: Colors.light.secondaryDark,
  },
});
