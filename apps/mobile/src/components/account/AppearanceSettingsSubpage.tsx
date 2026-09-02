import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Colors, THEME_PALETTES, ThemePalette } from '../../theme/colors';
import { Spacing, Radii, Typography } from '../../theme/tokens';
import { triggerHaptic } from '../../utils/haptics';
import { IconCheck, IconSliders, IconSparkles } from '../ui/Icons';
import { Badge } from '../ui/Badge';
import { useDev } from '../../context/DevContext';

interface AppearanceSettingsSubpageProps {
  currentPalette?: ThemePalette;
  onSelectPalette?: (palette: ThemePalette) => void;
  onClose: () => void;
}

export function AppearanceSettingsSubpage({
  onClose,
}: AppearanceSettingsSubpageProps) {
  const { themePalette, setThemePalette, visualEffects, setVisualEffect } = useDev();
  const currentTheme = THEME_PALETTES[themePalette] || THEME_PALETTES.atelier;

  const palettesList: { id: ThemePalette; name: string; desc: string; colors: string[] }[] = [
    {
      id: 'atelier',
      name: 'Atelier Calme',
      desc: 'Blanco perla, crema y coral cálido. El look original y romántico.',
      colors: ['#FFF8F2', '#EF826A', '#3A2F38', '#FBE0DA'],
    },
    {
      id: 'velvet',
      name: 'Rosa Terciopelo',
      desc: 'Tonos rubor sedoso, frambuesa y fresa empolvada.',
      colors: ['#FFF0F3', '#E05666', '#38262C', '#FCDCE1'],
    },
    {
      id: 'lavender',
      name: 'Lavanda Silvestre',
      desc: 'Lilas provenzales, violeta etéreo y noche suave.',
      colors: ['#F4EFFF', '#8A6FC9', '#2F293A', '#ECE4FB'],
    },
    {
      id: 'olive',
      name: 'Salvia & Olivo',
      desc: 'Frescura botánica, tonos salvia y tierra mediterránea.',
      colors: ['#EDF4ED', '#4E8752', '#243026', '#D6EAD8'],
    },
    {
      id: 'bordeaux',
      name: 'Burdeos Romance',
      desc: 'Granate elegante, vino tinto y rosa suave.',
      colors: ['#F7ECEF', '#9E2A3B', '#332024', '#F4D3D9'],
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* PALETTES SELECTOR */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Paleta de Color y Tema</Text>
        <Text style={styles.sectionSubtitle}>Selecciona el ambiente visual de toda la aplicación</Text>
      </View>

      <View style={styles.groupCard}>
        {palettesList.map((p, index) => {
          const isSelected = currentPalette === p.id;
          return (
            <React.Fragment key={p.id}>
              {index > 0 && <View style={styles.divider} />}
              <TouchableOpacity
                style={[styles.paletteRow, isSelected && styles.paletteRowSelected]}
                activeOpacity={0.8}
                onPress={() => {
                  triggerHaptic('selection');
                  setThemePalette(p.id);
                }}
              >
                <View style={styles.paletteColorDots}>
                  {p.colors.map((c, i) => (
                    <View key={i} style={[styles.colorDot, { backgroundColor: c }]} />
                  ))}
                </View>

                <View style={styles.paletteTextCol}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.paletteName, isSelected && { color: currentTheme.primary, fontWeight: '700' }]}>
                      {p.name}
                    </Text>
                    {isSelected && <Badge variant="primary" size="sm">Activo</Badge>}
                  </View>
                  <Text style={styles.paletteDesc}>{p.desc}</Text>
                </View>

                {isSelected && (
                  <View style={[styles.checkCircle, { backgroundColor: currentTheme.primary }]}>
                    <IconCheck size={14} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                )}
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </View>

      {/* VISUAL EFFECTS & APPLE HIG STYLING */}
      <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
        <Text style={styles.sectionTitle}>Efectos Visuales & Estilo</Text>
        <Text style={styles.sectionSubtitle}>Detalles de diseño inspirados en iOS 18</Text>
      </View>

      <View style={styles.groupCard}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextCol}>
            <Text style={styles.toggleTitle}>Efecto Glassmorphism & Translucidez</Text>
            <Text style={styles.toggleDesc}>Fondos con desenfoque suave y materiales sutiles</Text>
          </View>
          <Switch
            value={visualEffects.glassEffect}
            onValueChange={(val) => {
              triggerHaptic('selection');
              setVisualEffect('glassEffect', val);
            }}
            trackColor={{ false: '#E6DFD5', true: currentTheme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.toggleRow}>
          <View style={styles.toggleTextCol}>
            <Text style={styles.toggleTitle}>Bordes Squircle Continuos</Text>
            <Text style={styles.toggleDesc}>Curvatura superelíptica Apple en tarjetas y modales</Text>
          </View>
          <Switch
            value={visualEffects.continuousSquircle}
            onValueChange={(val) => {
              triggerHaptic('selection');
              setVisualEffect('continuousSquircle', val);
            }}
            trackColor={{ false: '#E6DFD5', true: currentTheme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.toggleRow}>
          <View style={styles.toggleTextCol}>
            <Text style={styles.toggleTitle}>Gradientes Ambientales Suaves</Text>
            <Text style={styles.toggleDesc}>Auras de luz cálida en la cabecera del Nido</Text>
          </View>
          <Switch
            value={visualEffects.subtleGradients}
            onValueChange={(val) => {
              triggerHaptic('selection');
              setVisualEffect('subtleGradients', val);
            }}
            trackColor={{ false: '#E6DFD5', true: currentTheme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.toggleRow}>
          <View style={styles.toggleTextCol}>
            <Text style={styles.toggleTitle}>Tarjetas Compactas</Text>
            <Text style={styles.toggleDesc}>Mayor densidad de contenido con menor espaciado</Text>
          </View>
          <Switch
            value={visualEffects.compactCards}
            onValueChange={(val) => {
              triggerHaptic('selection');
              setVisualEffect('compactCards', val);
            }}
            trackColor={{ false: '#E6DFD5', true: currentTheme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h3,
    fontSize: 16,
    color: '#1E252B',
  },
  sectionSubtitle: {
    ...Typography.caption,
    color: '#766B72',
    marginTop: 2,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
    overflow: 'hidden',
  },
  paletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  paletteRowSelected: {
    backgroundColor: 'rgba(224, 86, 102, 0.04)',
  },
  paletteColorDots: {
    flexDirection: 'row',
    gap: 4,
    marginRight: Spacing.md,
    backgroundColor: '#FAF7F2',
    padding: 6,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.06)',
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
    fontWeight: '600',
    color: '#1E252B',
  },
  paletteDesc: {
    fontSize: 12,
    color: '#766B72',
    marginTop: 2,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(58, 47, 56, 0.06)',
    marginLeft: Spacing.md,
  },
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
    color: '#1E252B',
  },
  toggleDesc: {
    fontSize: 12,
    color: '#766B72',
    marginTop: 2,
  },
});
