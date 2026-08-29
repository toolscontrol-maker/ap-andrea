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
import {
  IconLock,
  IconSparkles,
  IconGift,
  IconCalendar
} from '../../../src/components/ui/Icons';
import { Colors } from '../../../src/theme/colors';
import { Spacing, Radii, Shadows } from '../../../src/theme/tokens';
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
  const [currentQuestion, setCurrentQuestion] = useState(getRandomAyaQuestion());
  const [isSeedSubmitted, setIsSeedSubmitted] = useState(false);

  const nextUpcomingEvent = coupleEvents.find((e) => e.status === 'scheduled');
  const partnerWishes = wishes.filter((w) => w.ownerUserId === partnerDevUser.id && w.status !== 'fulfilled');

  const handlePlantSeed = () => {
    if (!ritualInputText.trim()) {
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
          : 'Momento compartido',
      body: ritualInputText.trim(),
      mood: 'love'
    });

    setRitualInputText('');
    setIsSeedSubmitted(true);
    setTimeout(() => setIsSeedSubmitted(false), 3000);
    Alert.alert('🌱 Momento Sembrado', 'Se ha guardado en vuestra memoria compartida.');
  };

  return (
    <ScreenWrapper>
      {/* ── DYNAMIC ISLAND HEADER PILL ── */}
      <DynamicIsland />

      {/* ── GREETING & AMBIENT HEADER ── */}
      <View style={styles.headerBlock}>
        <View>
          <Text style={styles.greetingEyebrow}>NUESTRO ESPACIO</Text>
          <Text style={styles.greetingTitle}>
            Hola, {currentDevUser.name} & {partnerDevUser.name}
          </Text>
          <Text style={styles.greetingSubtitle}>
            Cuidando vuestro archivo íntimo día a día
          </Text>
        </View>
        <View style={styles.avatarPair}>
          <View style={[styles.avatarBubble, { backgroundColor: Colors.light.primary }]}>
            <Text style={styles.avatarBubbleText}>{currentDevUser.avatar}</Text>
          </View>
          <View style={[styles.avatarBubble, styles.avatarBubblePartner, { backgroundColor: Colors.light.secondary }]}>
            <Text style={styles.avatarBubbleText}>{partnerDevUser.avatar}</Text>
          </View>
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
            <Text style={styles.ritualPromptText}>
              "Una foto espontánea de lo que tienes delante ahora mismo."
            </Text>
          )}

          <TextInput
            style={styles.ritualTextInput}
            placeholder={
              activeRitualType === 'gratitude_note'
                ? 'Escribe ese detalle bonito que notaste hoy...'
                : activeRitualType === 'question_answer'
                ? 'Tu respuesta sincera (se compartirá suavemente)...'
                : 'Pega el enlace de la foto o escribe un pie de foto...'
            }
            placeholderTextColor={Colors.light.textMuted}
            value={ritualInputText}
            onChangeText={setRitualInputText}
            multiline
          />

          <View style={styles.ritualSubmitRow}>
            <View style={styles.privacyRow}>
              <IconLock size={12} color={Colors.light.textMuted} />
              <Text style={styles.ritualPrivacyHint}>Cifrado de extremo a extremo</Text>
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
            title="Próximo Plan en la Agenda"
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
    marginBottom: Spacing.lg,
    paddingTop: Spacing.sm
  },
  greetingEyebrow: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Colors.light.primary,
    letterSpacing: 1.2,
    marginBottom: 2
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    letterSpacing: -0.4
  },
  greetingSubtitle: {
    fontSize: 12.5,
    color: Colors.light.textSecondary,
    marginTop: 2
  },
  avatarPair: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatarBubble: {
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.light.surface
  },
  avatarBubblePartner: {
    marginLeft: -10
  },
  avatarBubbleText: {
    color: Colors.light.textInverse,
    fontWeight: '700',
    fontSize: 14
  },
  ritualCard: {
    padding: Spacing.lg,
    borderRadius: Radii.xl,
    backgroundColor: Colors.light.surface,
    marginBottom: Spacing.lg
  },
  ritualCardHeader: {
    marginBottom: Spacing.md
  },
  ritualTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4
  },
  ritualCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text
  },
  ritualCardSubtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    lineHeight: 16
  },
  ritualSelectorRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md
  },
  ritualTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: Radii.full,
    backgroundColor: Colors.light.surfaceSubtle,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border
  },
  ritualTabActive: {
    backgroundColor: Colors.light.text,
    borderColor: Colors.light.text
  },
  ritualTabText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: Colors.light.textSecondary
  },
  ritualTabTextActive: {
    color: Colors.light.textInverse,
    fontWeight: '600'
  },
  ritualPromptBox: {
    backgroundColor: Colors.light.surfaceSubtle,
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.light.border
  },
  ritualQuestionBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.secondary,
    letterSpacing: 0.8,
    marginBottom: 2
  },
  ritualPromptText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
    lineHeight: 19
  },
  ritualTextInput: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radii.md,
    padding: Spacing.sm,
    fontSize: 13.5,
    color: Colors.light.text,
    minHeight: 65,
    textAlignVertical: 'top',
    marginBottom: Spacing.sm
  },
  ritualSubmitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  ritualPrivacyHint: {
    fontSize: 10.5,
    color: Colors.light.textMuted
  },
  weeklySummaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.light.sageLight,
    padding: Spacing.md,
    borderRadius: Radii.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(109, 158, 121, 0.2)'
  },
  weeklySummaryIconWrap: {
    width: 38,
    height: 38,
    borderRadius: Radii.full,
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center'
  },
  weeklySummaryIcon: {
    fontSize: 18
  },
  weeklySummaryTextGroup: {
    flex: 1
  },
  weeklySummaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.sageDark
  },
  weeklySummaryDesc: {
    fontSize: 12,
    color: Colors.light.text,
    marginTop: 1,
    lineHeight: 16
  },
  sectionBlock: {
    marginBottom: Spacing.xl
  },
  upcomingCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: Radii.xl,
    backgroundColor: Colors.light.surface,
    gap: Spacing.md
  },
  upcomingDateBadge: {
    width: 48,
    height: 54,
    borderRadius: Radii.md,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.primary
  },
  upcomingDayNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.primaryDark
  },
  upcomingMonthName: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.primaryDark
  },
  upcomingDetails: {
    flex: 1
  },
  upcomingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  upcomingTime: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textMuted
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text
  },
  upcomingSubtitle: {
    fontSize: 12.5,
    color: Colors.light.textSecondary,
    marginTop: 2
  },
  secretClueBox: {
    marginTop: Spacing.sm,
    padding: 6,
    backgroundColor: Colors.light.secondaryLight,
    borderRadius: Radii.sm
  },
  secretClueText: {
    fontSize: 11,
    color: Colors.light.secondaryDark,
    fontWeight: '500'
  },
  wishesPeekScroll: {
    gap: Spacing.md,
    paddingVertical: Spacing.xs
  },
  wishPeekCard: {
    width: 200,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    padding: 0
  },
  wishPeekImg: {
    width: '100%',
    height: 110,
    backgroundColor: Colors.light.surfaceSubtle
  },
  wishPeekContent: {
    padding: Spacing.md
  },
  wishPeekTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 4,
    lineHeight: 18
  },
  wishPeekPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textMuted,
    marginTop: 2
  },
  btnPeekSurprise: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.light.secondaryLight,
    paddingVertical: 6,
    borderRadius: Radii.sm,
    alignItems: 'center'
  },
  btnPeekSurpriseText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.secondaryDark
  }
});
