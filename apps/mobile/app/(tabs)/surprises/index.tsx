import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useDev } from '../../../src/context/DevContext';
import { Colors } from '../../../src/theme/colors';
import { Radii, Shadows, Spacing, Typography } from '../../../src/theme/tokens';
import { ScreenWrapper, SectionHeader, SegmentedControl, Card, Badge, Button, EmptyState } from '../../../src/components/ui';
import { DiaryEntryUI, DecryptedSurpriseContent } from '@andrea/types';

type KanbanStatus = 'idea' | 'comprando' | 'listo' | 'entregado';

export default function SurprisesScreen() {
  const [activeKanban, setActiveKanban] = useState<KanbanStatus>('idea');
  const { surprises, currentDevUser, partnerDevUser, updateSurpriseStatus } = useDev();
  const router = useRouter();

  const mySurprises = surprises.filter((e) => {
    const c = e.content as DecryptedSurpriseContent;
    const matchesStatus = (c.status || 'idea') === activeKanban;
    if (activeKanban === 'entregado') return matchesStatus;
    return matchesStatus && e.authorId === currentDevUser.id;
  });

  const getStatusCount = (status: KanbanStatus) => {
    return surprises.filter((e) => {
      const c = e.content as DecryptedSurpriseContent;
      if (status === 'entregado') return (c.status || 'idea') === status;
      return (c.status || 'idea') === status && e.authorId === currentDevUser.id;
    }).length;
  };

  const handleAdvanceStatus = (item: DiaryEntryUI, currentStatus: string) => {
    let nextStatus: KanbanStatus = 'comprando';
    if (currentStatus === 'idea') nextStatus = 'comprando';
    else if (currentStatus === 'comprando') nextStatus = 'listo';
    else if (currentStatus === 'listo') nextStatus = 'entregado';

    updateSurpriseStatus(item.id, nextStatus);
  };

  const getOccasionBadgeVariant = (occasion?: string): 'primary' | 'secondary' | 'sage' | 'butter' | 'mistBlue' => {
    switch (occasion) {
      case 'aniversario': return 'primary';
      case 'cumpleaños': return 'butter';
      case 'reconciliación': return 'sage';
      default: return 'secondary';
    }
  };

  return (
    <ScreenWrapper>
      {/* Section Header */}
      <SectionHeader
        title="Caja de Sorpresas"
        subtitle={`Prepara gestos y detalles con ilusión para ${partnerDevUser.name}`}
        action={
          <Button
            variant="primary"
            size="sm"
            onPress={() => router.push('/(tabs)/surprises/new')}
          >
            + Preparar
          </Button>
        }
      />

      {/* Secret Vault Banner */}
      <View style={styles.vaultCard}>
        <View style={styles.vaultIconCircle}>
          <Text style={styles.vaultEmoji}>🎁</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.vaultTitle}>VAULT SECRETO DE PAREJA</Text>
          <Text style={styles.vaultSub}>
            Tus planes están guardados como borrador privado en este dispositivo. {partnerDevUser.name} no los verá hasta el día de la entrega.
          </Text>
        </View>
      </View>

      {/* Kanban Column Selector */}
      <SegmentedControl<KanbanStatus>
        options={[
          { id: 'idea', label: '💡 Ideas', badgeCount: getStatusCount('idea') },
          { id: 'comprando', label: '✨ En marcha', badgeCount: getStatusCount('comprando') },
          { id: 'listo', label: '🎁 Listos', badgeCount: getStatusCount('listo') },
          { id: 'entregado', label: '💌 Entregados', badgeCount: getStatusCount('entregado') },
        ]}
        selected={activeKanban}
        onSelect={setActiveKanban}
        activeColor={Colors.light.surfaceElevated}
        activeTextColor={Colors.light.primaryDark}
      />

      {/* Content List */}
      {mySurprises.length === 0 ? (
        <EmptyState
          emoji={activeKanban === 'idea' ? '🎁' : activeKanban === 'comprando' ? '✨' : activeKanban === 'listo' ? '🎉' : '💌'}
          title={activeKanban === 'idea' ? `Guarda una idea secreta para ${partnerDevUser.name}` : 'Sin detalles en esta fase'}
          subtitle={
            activeKanban === 'idea'
              ? 'Una escapada sorpresa, un libro que mencionó de pasada o una cena romántica. El valor está en el cariño, no en el precio.'
              : 'Mueve tus ideas a esta fase a medida que vayas preparando el detalle.'
          }
          actionText="+ Anotar idea secreta"
          onAction={() => router.push('/(tabs)/surprises/new')}
          actionVariant="primary"
          iconBgColor={Colors.light.primaryLight}
        />
      ) : (
        mySurprises.map((item) => {
          const c = item.content as DecryptedSurpriseContent;
          const isMine = item.authorId === currentDevUser.id;

          return (
            <View key={item.id} style={styles.surpriseCard}>
              {/* Card Top Ribbon */}
              <View style={styles.cardHeader}>
                <Badge variant={getOccasionBadgeVariant(c.occasion)} size="sm">
                  {c.occasion || 'Sin ocasión'}
                </Badge>
                <Text style={styles.cardDate}>📅 {item.date}</Text>
              </View>

              {/* Title & Description */}
              <Text style={styles.cardTitle}>{c.title}</Text>
              <Text style={styles.cardDesc}>{c.description}</Text>

              {/* Budget Badge */}
              {c.budgetRange ? (
                <View style={styles.budgetBox}>
                  <Text style={styles.budgetLabel}>Presupuesto estimado:</Text>
                  <Text style={styles.budgetValue}>€{c.budgetRange[0]} – €{c.budgetRange[1]}</Text>
                </View>
              ) : null}

              {/* Footer with Advance Button */}
              <View style={styles.cardFooter}>
                <Text style={styles.authorBadge}>
                  {isMine ? `Preparado por ti para ${partnerDevUser.name}` : `Preparado por ${partnerDevUser.name}`}
                </Text>

                {isMine && c.status !== 'entregado' && (
                  <TouchableOpacity
                    style={styles.advanceBtn}
                    onPress={() => handleAdvanceStatus(item, c.status || 'idea')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.advanceBtnText}>
                      {c.status === 'idea' ? 'Poner en marcha ➔' : c.status === 'comprando' ? 'Marcar listo 🎁' : 'Entregar ❤️'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  vaultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EA',
    borderWidth: 1.5,
    borderColor: 'rgba(229, 169, 60, 0.4)',
    borderRadius: Radii['2xl'],
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  vaultIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.light.butter,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.butter,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 2,
  },
  vaultEmoji: {
    fontSize: 20,
  },
  vaultTitle: {
    ...Typography.overline,
    color: '#8A6812',
    letterSpacing: 1.1,
    fontSize: 10,
  },
  vaultSub: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  surpriseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii['2xl'],
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardDate: {
    ...Typography.caption,
    color: Colors.light.textMuted,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  cardDesc: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 21,
  },
  budgetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.light.sageLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radii.sm,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  budgetLabel: {
    ...Typography.caption,
    color: Colors.light.sageDark,
  },
  budgetValue: {
    ...Typography.captionBold,
    color: Colors.light.sageDark,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.light.divider,
    paddingTop: Spacing.md,
  },
  authorBadge: {
    ...Typography.caption,
    color: Colors.light.textMuted,
  },
  advanceBtn: {
    backgroundColor: Colors.light.butterDark,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 3,
    borderRadius: Radii.lg,
    ...Shadows.subtle,
  },
  advanceBtnText: {
    ...Typography.captionBold,
    color: '#FFFFFF',
    fontSize: 11,
  },
});
