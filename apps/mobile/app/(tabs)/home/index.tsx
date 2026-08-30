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
import {
  IconLock,
  IconSparkles,
  IconGift,
  IconCalendar
} from '../../../src/components/ui/Icons';
import { Colors } from '../../../src/theme/colors';
import { Spacing, Radii, Shadows, Typography } from '../../../src/theme/tokens';
import { DailyRitualType } from '@andrea/types';
import { triggerHaptic } from '../../../src/utils/haptics';

export default function HomeScreen() {
  const router = useRouter();
  const {
    currentDevUser,
    partnerDevUser,
    ritualSeeds,
    weeklySummary,
    coupleEvents,
    wishes,
    addRitualSeed,
    getRandomAyaQuestion,
    convertWishToSurprise
  } = useDev();

  const [activeRitualType, setActiveRitualType] = useState<DailyRitualType>('gratitude_note');
  const [ritualInputText, setRitualInputText] = useState('');
  const [uploadedPhotoUri, setUploadedPhotoUri] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(getRandomAyaQuestion());
  const [isSeedSubmitted, setIsSeedSubmitted] = useState(false);

  // Dynamic days calculation from 15 Feb 2025
  const ANNIVERSARY_DATE = new Date('2025-02-15');
  const now = new Date();
  const daysTogether = Math.max(1, Math.floor((now.getTime() - ANNIVERSARY_DATE.getTime()) / (1000 * 60 * 60 * 24)));

  const nextUpcomingEvent = coupleEvents.find((e) => e.status === 'scheduled');
  const partnerWishes = wishes.filter((w) => w.ownerUserId === partnerDevUser.id && w.status !== 'fulfilled');

  const handlePlantSeed = () => {
    if (!ritualInputText.trim() && !uploadedPhotoUri) {
      Alert.alert('Escribe unas palabras', 'Comparte una pequeña nota o pensamiento de hoy.');
      return;
    }

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

    setRitualInputText('');
    setUploadedPhotoUri(null);
    setIsSeedSubmitted(true);
    setTimeout(() => setIsSeedSubmitted(false), 3000);
    Alert.alert('🌱 Momento Sembrado', 'Se ha guardado en vuestra memoria compartida.');
  };

  return (
    <ScreenWrapper>
      {/* ── DYNAMIC ISLAND HEADER PILL ── */}
      <DynamicIsland />

      {/* ── GREETING & AMBIENT HEADER (PERSONAL ENFOCADO EN TI) ── */}
      <View style={styles.headerBlock}>
        <View style={styles.greetingTextGroup}>
          <Text style={styles.greetingEyebrow}>TU ESPACIO PERSONAL</Text>
          <Text style={styles.greetingTitle}>
            Hola, {currentDevUser.name}
          </Text>
          <Text style={styles.greetingSubtitle}>
            Un día bonito para ti y vuestra historia.
          </Text>
        </View>
      </View>

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
                    onPress={() => {
                      convertWishToSurprise(wish.id, `Preparado desde el Nido de Inicio.`);
                      Alert.alert('Sorpresa Agendada', `Has preparado en secreto "${wish.title}".`);
                    }}
                  >
                    <Text style={styles.btnPeekSurpriseText}>Preparar sorpresa</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </ScrollView>
        </View>
      )}
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
    marginBottom: Spacing.xl,
  },
  upcomingCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: Radii.xl,
    backgroundColor: '#FFFFFF',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.05)',
    ...Shadows.subtle,
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
