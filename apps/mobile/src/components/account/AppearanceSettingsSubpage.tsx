import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Platform } from 'react-native';
import { Colors, THEME_PALETTES, ThemePalette, ACCENT_SWATCHES } from '../../theme/colors';
import { Spacing, Radii, Typography } from '../../theme/tokens';
import { triggerHaptic } from '../../utils/haptics';
import { IconCheck, IconSliders, IconSparkles, IconHeart } from '../ui/Icons';
import { Badge } from '../ui/Badge';
import { useDev, ThemePaletteId } from '../../context/DevContext';

interface AppearanceSettingsSubpageProps {
  onClose?: () => void;
}

export function AppearanceSettingsSubpage({
  onClose,
}: AppearanceSettingsSubpageProps) {
  const {
    themePalette,
    setThemePalette,
    customAccentColor,
    setCustomAccentColor,
    visualEffects,
    setVisualEffect,
    currentDevUser,
    partnerDevUser,
  } = useDev();

  const currentTheme = THEME_PALETTES[themePalette] || THEME_PALETTES.atelier;
  const activePrimary = customAccentColor || currentTheme.primary;

  const palettesList = Object.values(THEME_PALETTES);

  const hapticOptions = [
    { id: 'off' as const, label: 'Desactivada' },
    { id: 'soft' as const, label: 'Suave' },
    { id: 'medium' as const, label: 'Media' },
    { id: 'crisp' as const, label: 'Nítida (iOS)' },
  ];

  const fontOptions = [
    { id: 'modern' as const, label: 'Moderna (SF Pro)', desc: 'Limpia, elegante y minimalista' },
    { id: 'editorial' as const, label: 'Editorial (New York)', desc: 'Títulos con serif romántico' },
    { id: 'playful' as const, label: 'Redondeada (Sweet)', desc: 'Trazos suaves y cariñosos' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.background }]} contentContainerStyle={styles.content}>
      {/* ── LIVE INTERACTIVE PREVIEW CARD ── */}
      <View
        style={[
          styles.previewCard,
          {
            backgroundColor: currentTheme.surface,
            borderColor: currentTheme.border,
            borderRadius: visualEffects.continuousSquircle ? 28 : 16,
            ...(visualEffects.glassEffect && Platform.OS === 'web'
              ? ({
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  boxShadow: `0 12px 32px 0 ${activePrimary}22, inset 0 1px 0 rgba(255, 255, 255, 0.45)`,
                } as any)
              : {}),
          },
        ]}
      >
        {visualEffects.subtleGradients && (
          <View
            style={[
              styles.previewAuraGlow,
              { backgroundColor: activePrimary, opacity: 0.12 },
            ]}
          />
        )}

        <View style={styles.previewHeaderRow}>
          <View style={styles.previewBadgeRow}>
            <View style={[styles.previewActiveIndicator, { backgroundColor: activePrimary }]} />
            <Text style={[styles.previewTagText, { color: currentTheme.textSecondary }]}>
              Vista Previa en Vivo · {currentTheme.name}
            </Text>
          </View>
          <View style={[styles.previewSamplePill, { backgroundColor: `${activePrimary}18` }]}>
            <IconSparkles size={11} color={activePrimary} />
            <Text style={[styles.previewPillText, { color: activePrimary }]}>iOS 18 HIG</Text>
          </View>
        </View>

        {/* Live Mini Couple Header Preview */}
        <View style={styles.previewCoupleRow}>
          <View style={styles.previewAvatarPair}>
            <View style={[styles.previewAvatarCircle, { backgroundColor: activePrimary }]}>
              <Text style={styles.previewAvatarLetter}>{currentDevUser.avatarLetter || 'T'}</Text>
            </View>
            <View style={[styles.previewAvatarCircle, styles.previewAvatarOverlapped, { backgroundColor: currentTheme.textSecondary }]}>
              <Text style={styles.previewAvatarLetter}>{partnerDevUser.avatarLetter || 'A'}</Text>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.previewCoupleTitle, { color: currentTheme.text }]}>
              {currentDevUser.name} & {partnerDevUser.name}
            </Text>
            <Text style={[styles.previewCoupleSubtitle, { color: currentTheme.textSecondary }]}>
              Nido de Amor · Atmósfera activa
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => triggerHaptic('selection')}
            style={[styles.previewHeartButton, { backgroundColor: activePrimary }]}
          >
            <IconHeart size={16} color="#FFFFFF" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        {/* Live Color Harmony Swatches in Card */}
        <View style={styles.previewSwatchesBar}>
          <View style={[styles.previewSwatchChip, { backgroundColor: currentTheme.background }]}>
            <Text style={[styles.previewSwatchLabel, { color: currentTheme.text }]}>Fondo</Text>
          </View>
          <View style={[styles.previewSwatchChip, { backgroundColor: currentTheme.surfaceElevated, borderColor: currentTheme.border, borderWidth: 1 }]}>
            <Text style={[styles.previewSwatchLabel, { color: currentTheme.text }]}>Superficie</Text>
          </View>
          <View style={[styles.previewSwatchChip, { backgroundColor: activePrimary }]}>
            <Text style={[styles.previewSwatchLabel, { color: '#FFFFFF' }]}>Acento</Text>
          </View>
        </View>
      </View>

      {/* ── 8 AESTHETIC THEME PRESETS ── */}
      <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Paletas & Atmósferas</Text>
        <Text style={[styles.sectionSubtitle, { color: currentTheme.textSecondary }]}>
          8 atmósferas artesanales diseñadas para cambiar radicalmente la experiencia
        </Text>
      </View>

      <View style={[styles.groupCard, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border, borderRadius: visualEffects.continuousSquircle ? 24 : 14 }]}>
        {palettesList.map((p, index) => {
          const isSelected = themePalette === p.id;
          return (
            <React.Fragment key={p.id}>
              {index > 0 && <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />}
              <TouchableOpacity
                style={[
                  styles.paletteRow,
                  isSelected && { backgroundColor: `${activePrimary}0A` },
                ]}
                activeOpacity={0.8}
                onPress={() => {
                  triggerHaptic('selection');
                  setThemePalette(p.id as ThemePaletteId);
                }}
              >
                {/* 4-Color Swatch Dots */}
                <View style={[styles.paletteColorDots, { backgroundColor: currentTheme.background, borderColor: currentTheme.border }]}>
                  {p.colors.map((c, i) => (
                    <View key={i} style={[styles.colorDot, { backgroundColor: c }]} />
                  ))}
                </View>

                {/* Name and description */}
                <View style={styles.paletteTextCol}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.paletteName, { color: isSelected ? activePrimary : currentTheme.text, fontWeight: isSelected ? '700' : '600' }]}>
                      {p.name}
                    </Text>
                    {isSelected && (
                      <View style={[styles.activeBadgePill, { backgroundColor: `${activePrimary}20` }]}>
                        <Text style={[styles.activeBadgeText, { color: activePrimary }]}>Activo</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.paletteDesc, { color: currentTheme.textSecondary }]}>{p.subtitle}</Text>
                </View>

                {/* Selection Checkmark */}
                {isSelected && (
                  <View style={[styles.checkCircle, { backgroundColor: activePrimary }]}>
                    <IconCheck size={14} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                )}
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </View>

      {/* ── CUSTOM ACCENT COLOR TUNER ── */}
      <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Color de Acento Personalizado</Text>
          {customAccentColor && (
            <TouchableOpacity
              onPress={() => {
                triggerHaptic('light');
                setCustomAccentColor(null);
              }}
              style={styles.resetAccentButton}
            >
              <Text style={[styles.resetAccentText, { color: activePrimary }]}>Restablecer</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.sectionSubtitle, { color: currentTheme.textSecondary }]}>
          Personaliza los botones, iconos de latido y detalles con tu color preferido
        </Text>
      </View>

      <View style={[styles.groupCard, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border, padding: Spacing.md, borderRadius: visualEffects.continuousSquircle ? 24 : 14 }]}>
        <View style={styles.accentGrid}>
          {ACCENT_SWATCHES.map((swatch) => {
            const isSwatchActive = customAccentColor === swatch.hex || (!customAccentColor && currentTheme.primary === swatch.hex);
            return (
              <TouchableOpacity
                key={swatch.id}
                activeOpacity={0.8}
                onPress={() => {
                  triggerHaptic('selection');
                  setCustomAccentColor(swatch.hex);
                }}
                style={[
                  styles.accentSwatchButton,
                  { backgroundColor: swatch.hex },
                  isSwatchActive && styles.accentSwatchButtonActive,
                ]}
              >
                {isSwatchActive && (
                  <IconCheck size={16} color="#FFFFFF" strokeWidth={3} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── VISUAL EFFECTS & APPLE HIG STYLING ── */}
      <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Efectos Visuales & Estilo iOS 18</Text>
        <Text style={[styles.sectionSubtitle, { color: currentTheme.textSecondary }]}>
          Comportamiento del motor visual, desenfoques y física de esquinas
        </Text>
      </View>

      <View style={[styles.groupCard, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border, borderRadius: visualEffects.continuousSquircle ? 24 : 14 }]}>
        {/* Glassmorphism Toggle */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextCol}>
            <Text style={[styles.toggleTitle, { color: currentTheme.text }]}>Efecto Glassmorphism & Translucidez</Text>
            <Text style={[styles.toggleDesc, { color: currentTheme.textSecondary }]}>Fondos con desenfoque suave y materiales sutiles</Text>
          </View>
          <Switch
            value={visualEffects.glassEffect}
            onValueChange={(val) => {
              triggerHaptic('selection');
              setVisualEffect('glassEffect', val);
            }}
            trackColor={{ false: '#E6DFD5', true: activePrimary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />

        {/* Squircle Toggle */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextCol}>
            <Text style={[styles.toggleTitle, { color: currentTheme.text }]}>Bordes Squircle Continuos Apple G2</Text>
            <Text style={[styles.toggleDesc, { color: currentTheme.textSecondary }]}>Curvatura superelíptica Apple en tarjetas y modales</Text>
          </View>
          <Switch
            value={visualEffects.continuousSquircle}
            onValueChange={(val) => {
              triggerHaptic('selection');
              setVisualEffect('continuousSquircle', val);
            }}
            trackColor={{ false: '#E6DFD5', true: activePrimary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />

        {/* Ambient Gradients Toggle */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextCol}>
            <Text style={[styles.toggleTitle, { color: currentTheme.text }]}>Gradientes Ambientales Suaves</Text>
            <Text style={[styles.toggleDesc, { color: currentTheme.textSecondary }]}>Auras de luz cálida en la cabecera del Nido</Text>
          </View>
          <Switch
            value={visualEffects.subtleGradients}
            onValueChange={(val) => {
              triggerHaptic('selection');
              setVisualEffect('subtleGradients', val);
            }}
            trackColor={{ false: '#E6DFD5', true: activePrimary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />

        {/* Compact Cards Toggle */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextCol}>
            <Text style={[styles.toggleTitle, { color: currentTheme.text }]}>Tarjetas Compactas</Text>
            <Text style={[styles.toggleDesc, { color: currentTheme.textSecondary }]}>Mayor densidad de contenido con menor espaciado</Text>
          </View>
          <Switch
            value={visualEffects.compactCards}
            onValueChange={(val) => {
              triggerHaptic('selection');
              setVisualEffect('compactCards', val);
            }}
            trackColor={{ false: '#E6DFD5', true: activePrimary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* ── HAPTIC FEEDBACK TUNER ── */}
      <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Respuesta Háptica Táctil</Text>
        <Text style={[styles.sectionSubtitle, { color: currentTheme.textSecondary }]}>
          Intensidad de vibración física al tocar el corazón y enviar latidos
        </Text>
      </View>

      <View style={[styles.hapticSegmentedRow, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border, borderRadius: visualEffects.continuousSquircle ? 20 : 12 }]}>
        {hapticOptions.map((opt) => {
          const isActive = (visualEffects.hapticFeedback || 'medium') === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              activeOpacity={0.8}
              onPress={() => {
                triggerHaptic(opt.id === 'crisp' ? 'notificationSuccess' : 'selection');
                setVisualEffect('hapticFeedback', opt.id);
              }}
              style={[
                styles.hapticSegmentedBtn,
                isActive && [styles.hapticSegmentedBtnActive, { backgroundColor: activePrimary }],
              ]}
            >
              <Text
                style={[
                  styles.hapticSegmentedText,
                  { color: isActive ? '#FFFFFF' : currentTheme.textSecondary },
                  isActive && { fontWeight: '700' },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── TYPOGRAPHY PAIRING SELECTOR ── */}
      <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Estilo Tipográfico</Text>
        <Text style={[styles.sectionSubtitle, { color: currentTheme.textSecondary }]}>
          Sensación editorial y balance de fuentes de lectura
        </Text>
      </View>

      <View style={[styles.groupCard, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border, borderRadius: visualEffects.continuousSquircle ? 24 : 14 }]}>
        {fontOptions.map((font, index) => {
          const isActive = (visualEffects.fontStyle || 'modern') === font.id;
          return (
            <React.Fragment key={font.id}>
              {index > 0 && <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  triggerHaptic('selection');
                  setVisualEffect('fontStyle', font.id);
                }}
                style={[
                  styles.paletteRow,
                  isActive && { backgroundColor: `${activePrimary}0A` },
                ]}
              >
                <View style={styles.paletteTextCol}>
                  <Text style={[styles.paletteName, { color: isActive ? activePrimary : currentTheme.text, fontWeight: isActive ? '700' : '600' }]}>
                    {font.label}
                  </Text>
                  <Text style={[styles.paletteDesc, { color: currentTheme.textSecondary }]}>{font.desc}</Text>
                </View>
                {isActive && (
                  <View style={[styles.checkCircle, { backgroundColor: activePrimary }]}>
                    <IconCheck size={14} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                )}
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  /* Preview Card */
  previewCard: {
    padding: Spacing.lg,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Spacing.md,
  },
  previewAuraGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  previewBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewActiveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  previewTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  previewSamplePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
  },
  previewPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  previewCoupleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  previewAvatarPair: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  previewAvatarOverlapped: {
    marginLeft: -12,
  },
  previewAvatarLetter: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  previewCoupleTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  previewCoupleSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  previewHeartButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  previewSwatchesBar: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Spacing.md,
  },
  previewSwatchChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewSwatchLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  /* Section Header */
  sectionHeader: {
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h3,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    ...Typography.caption,
    marginTop: 2,
    lineHeight: 16,
  },
  resetAccentButton: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  resetAccentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  /* Group Card */
  groupCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  paletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  paletteColorDots: {
    flexDirection: 'row',
    gap: 4,
    marginRight: Spacing.md,
    padding: 6,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  paletteTextCol: {
    flex: 1,
  },
  paletteName: {
    fontSize: 15,
  },
  paletteDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  activeBadgePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    marginLeft: Spacing.md,
  },
  /* Accent Swatches Grid */
  accentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  accentSwatchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  accentSwatchButtonActive: {
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.1 }],
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  /* Toggles */
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  toggleTextCol: {
    flex: 1,
    marginRight: Spacing.md,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  toggleDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  /* Haptic Segmented Control */
  hapticSegmentedRow: {
    flexDirection: 'row',
    padding: 4,
    borderWidth: 1,
    gap: 4,
  },
  hapticSegmentedBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hapticSegmentedBtnActive: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  hapticSegmentedText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
