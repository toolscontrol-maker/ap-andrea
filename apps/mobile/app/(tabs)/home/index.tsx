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
  IconCalendar,
  IconHeart
} from '../../../src/components/ui/Icons';
import { Colors } from '../../../src/theme/colors';
import { Spacing, Radii, Shadows, Typography } from '../../../src/theme/tokens';
import { DailyRitualType } from '@andrea/types';

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
    Alert.alert('🌱 Momento Sembrado', 'Se ha guardado en vuestro archivo compartido.');
  };

  return (
    <ScreenWrapper>
      {/* ── DYNAMIC ISLAND HEADER PILL ── */}
      <DynamicIsland />

      {/* ── HIGH-FASHION EDITORIAL HEADER (ACNE STUDIOS / APPLE GLASS) ── */}
      <View style={styles.headerBlock}>
        <View style={styles.headerTopMeta}>
          <Text style={styles.vintageHeaderTag}>[ NIDO // ARCHIVE ]</Text>
          <Text style={styles.vintageHeaderDate}>EST. 2023 · VALENCIA</Text>
        </View>

        <View style={styles.headerMainRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingTitle}>
              {currentDevUser.name} & {partnerDevUser.name}
            </Text>
            <Text style={styles.greetingSubtitle}>
              Archivo íntimo · 1.284 días juntos
            </Text>
          </View>

          <View style={styles.avatarPair}>
            <Image
              source={{ uri: currentDevUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop' }}
              style={styles.avatarImg}
            />
            <Image
              source={{ uri: partnerDevUser.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop' }}
              style={[styles.avatarImg, styles.avatarImgPartner]}
            />
          </View>
        </View>
      </View>

      {/* ── DAILY RITUAL: SEMILLA DEL DÍA (EDITORIAL MONOCHROME & GLASS) ── */}
      <TiltedCard style={styles.ritualCard} variant="elevated">
        <View style={styles.ritualCardHeader}>
          <View style={styles.ritualTopRow}>
            <Text style={styles.cardIndexTag}>[ 01 ] // RITUAL DEL DÍA</Text>
            <Badge variant="vintage">SIN PRISAS</Badge>
          </View>
          <Text style={styles.ritualCardTitle}>Semilla de Conexión</Text>
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
              GRATITUD
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
              PREGUNTA
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ritualTab, activeRitualType === 'daily_photo' && styles.ritualTabActive]}
            onPress={() => setActiveRitualType('daily_photo')}
          >
            <Text style={[styles.ritualTabText, activeRitualType === 'daily_photo' && styles.ritualTabTextActive]}>
              FOTO DEL DÍA
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
              <Text style={styles.ritualQuestionBadge}>
                [ PREGUNTA · {currentQuestion.category.toUpperCase()} ]
              </Text>
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
              <Text style={styles.ritualPrivacyHint}>Cifrado Zero-Knowledge</Text>
            </View>
            <Button
              variant="primary"
              size="sm"
              onPress={handlePlantSeed}
              iconRight={<IconSparkles size={13} color="#FFFFFF" />}
            >
              Sembrar
            </Button>
          </View>
        </View>
      </TiltedCard>

      {/* ── UPCOMING DATE (AGENDA MINIMALIST MANIFEST) ── */}
      {nextUpcomingEvent && (
        <View style={styles.sectionBlock}>
          <SectionHeader
            tag="[ 02 ] // PRÓXIMA CITA"
            title="En vuestra Agenda"
            subtitle="Planes y momentos reservados para los dos"
            action={
              <Button
                variant="ghost"
                size="sm"
                onPress={() => router.push('/(tabs)/calendar')}
              >
                Ver todo →
              </Button>
            }
          />
          {(() => {
            const isOwner = nextUpcomingEvent.ownerId === currentDevUser.id;
            const eventView = isOwner ? nextUpcomingEvent.ownerView : nextUpcomingEvent.partnerView;
            const isSurprise = nextUpcomingEvent.eventType === 'surprise';

            return (
              <TiltedCard style={styles.upcomingCard} variant="elevated">
                <View style={styles.upcomingDateBadge}>
                  <Text style={styles.upcomingDayNumber}>
                    {new Date(nextUpcomingEvent.date).getDate()}
                  </Text>
                  <Text style={styles.upcomingMonthName}>
                    {new Date(nextUpcomingEvent.date).toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.upcomingDetails}>
                  <View style={styles.upcomingHeaderRow}>
                    <Badge variant={isSurprise ? 'primary' : 'neutral'}>
                      {isSurprise ? 'SORPRESA' : 'CITA'}
                    </Badge>
                    <Text style={styles.upcomingTime}>{nextUpcomingEvent.time || '21:00'}</Text>
                  </View>
                  <Text style={styles.upcomingTitle}>{eventView.title}</Text>
                  {eventView.locationName && (
                    <Text style={styles.upcomingSubtitle}>📍 {eventView.locationName}</Text>
                  )}
                </View>
              </TiltedCard>
            );
          })()}
        </View>
      )}

      {/* ── PARTNER WISHES DISCOVERY ── */}
      {partnerWishes.length > 0 && (
        <View style={styles.sectionBlock}>
          <SectionHeader
            tag="[ 03 ] // ILUSIONES"
            title={`Deseos de ${partnerDevUser.name}`}
            subtitle="Detalles e ideas para sorprenderle"
            action={
              <Button
                variant="ghost"
                size="sm"
                onPress={() => router.push('/(tabs)/wishes')}
              >
                Catálogo →
              </Button>
            }
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalWishesScroll}
          >
            {partnerWishes.map((wish, index) => (
              <TiltedCard key={wish.id} style={styles.wishMiniCard} variant="elevated">
                {wish.externalImageUrl ? (
                  <Image source={{ uri: wish.externalImageUrl }} style={styles.wishMiniImage} />
                ) : (
                  <View style={styles.wishMiniPlaceholder}>
                    <IconGift size={20} color={Colors.light.textMuted} />
                  </View>
                )}
                <View style={styles.wishMiniContent}>
                  <Text style={styles.wishMiniTag}>[ 0{index + 1} ] · {wish.type?.toUpperCase()}</Text>
                  <Text style={styles.wishMiniTitle} numberOfLines={1}>
                    {wish.title}
                  </Text>
                  {wish.brand && (
                    <Text style={styles.wishMiniBrand} numberOfLines={1}>
                      {wish.brand}
                    </Text>
                  )}
                  <TouchableOpacity
                    style={styles.btnMiniSurprise}
                    onPress={() => {
                      convertWishToSurprise(wish.id, `Sorpresa de ${currentDevUser.name}`);
                      Alert.alert('Sorpresa en marcha', `Se ha programado en la Agenda.`);
                    }}
                  >
                    <Text style={styles.btnMiniSurpriseText}>Hacer sorpresa →</Text>
                  </TouchableOpacity>
                </View>
              </TiltedCard>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={{ height: Spacing['3xl'] }} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    marginBottom: Spacing.xl,
    paddingTop: Spacing.xs,
  },
  headerTopMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(17, 17, 17, 0.06)',
  },
  vintageHeaderTag: {
    ...Typography.vintageTag,
    color: Colors.light.text,
  },
  vintageHeaderDate: {
    ...Typography.vintageTag,
    color: Colors.light.textMuted,
  },
  headerMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
  },
  greetingTitle: {
    ...Typography.display,
    color: Colors.light.text,
    fontSize: 26,
    lineHeight: 32,
  },
  greetingSubtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  avatarPair: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarImgPartner: {
    marginLeft: -14,
  },
  ritualCard: {
    padding: Spacing.lg,
    borderRadius: Radii.xl,
    backgroundColor: '#FFFFFF',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.07)',
    ...Shadows.md,
  },
  ritualCardHeader: {
    marginBottom: Spacing.md,
  },
  ritualTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  cardIndexTag: {
    ...Typography.vintageTag,
    color: Colors.light.text,
  },
  ritualCardTitle: {
    ...Typography.h2,
    color: Colors.light.text,
    marginBottom: 2,
  },
  ritualCardSubtitle: {
    ...Typography.body,
    fontSize: 12.5,
    color: Colors.light.textSecondary,
  },
  ritualSelectorRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  ritualTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: Radii.full,
    backgroundColor: Colors.light.backgroundWarm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.08)',
  },
  ritualTabActive: {
    backgroundColor: '#111111',
    borderColor: '#111111',
  },
  ritualTabText: {
    ...Typography.vintageTag,
    fontSize: 9.5,
    color: Colors.light.textSecondary,
  },
  ritualTabTextActive: {
    color: '#FFFFFF',
  },
  ritualPromptBox: {
    backgroundColor: Colors.light.backgroundWarm,
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.06)',
  },
  ritualQuestionBadge: {
    ...Typography.vintageTag,
    fontSize: 9,
    color: Colors.light.textMuted,
    marginBottom: 4,
  },
  ritualPromptText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.light.text,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
  },
  ritualTextInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.09)',
    borderRadius: Radii.md,
    padding: Spacing.sm + 2,
    fontSize: 13.5,
    color: Colors.light.text,
    minHeight: 65,
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
    fontSize: 11,
    color: Colors.light.textMuted,
  },
  sectionBlock: {
    marginBottom: Spacing.xl,
  },
  upcomingCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: Radii.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.07)',
    gap: Spacing.md,
    ...Shadows.sm,
  },
  upcomingDateBadge: {
    width: 48,
    height: 52,
    borderRadius: Radii.md,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingDayNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  upcomingMonthName: {
    ...Typography.vintageTag,
    fontSize: 9,
    color: '#E0E0E0',
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
    ...Typography.vintageTag,
    fontSize: 10,
    color: Colors.light.textMuted,
  },
  upcomingTitle: {
    ...Typography.h3,
    color: Colors.light.text,
  },
  upcomingSubtitle: {
    ...Typography.body,
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  horizontalWishesScroll: {
    gap: Spacing.sm,
  },
  wishMiniCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.07)',
    overflow: 'hidden',
    ...Shadows.sm,
  },
  wishMiniImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#F5F5F0',
  },
  wishMiniPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#F5F5F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishMiniContent: {
    padding: Spacing.sm + 2,
  },
  wishMiniTag: {
    ...Typography.vintageTag,
    fontSize: 8.5,
    color: Colors.light.textMuted,
    marginBottom: 2,
  },
  wishMiniTitle: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.light.text,
  },
  wishMiniBrand: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.light.textMuted,
    marginTop: 1,
    marginBottom: Spacing.xs,
  },
  btnMiniSurprise: {
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(17, 17, 17, 0.06)',
  },
  btnMiniSurpriseText: {
    ...Typography.vintageTag,
    fontSize: 9,
    color: Colors.light.text,
  },
});
