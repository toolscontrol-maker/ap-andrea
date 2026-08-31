import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing, Radii, Typography } from '../../theme/tokens';
import { triggerHaptic } from '../../utils/haptics';
import { IconHeart, IconCheck, IconCalendar } from '../ui/Icons';
import { Button } from '../ui/Button';

interface CoupleMilestonesModalProps {
  onClose: () => void;
}

export function CoupleMilestonesModal({ onClose }: CoupleMilestonesModalProps) {
  const [anniversaryDate, setAnniversaryDate] = useState('2025-02-15');
  const [metDate, setMetDate] = useState('2024-11-23');
  const [firstKissDate, setFirstKissDate] = useState('2024-12-08');
  const [andreaBirthday, setAndreaBirthday] = useState('2000-09-01');
  const [tonetBirthday, setTonetBirthday] = useState('1998-10-19');
  const [customMilestoneTitle, setCustomMilestoneTitle] = useState('');
  const [customMilestoneDate, setCustomMilestoneDate] = useState('');

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    triggerHaptic('success');
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      Alert.alert('✨ Fechas Guardadas', 'Vuestros hitos y aniversarios se han actualizado.');
      onClose();
    }, 1200);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.heroIconCircle}>
          <Text style={{ fontSize: 24 }}>✨</Text>
        </View>
        <Text style={styles.heroTitle}>Hitos de Nuestra Historia</Text>
        <Text style={styles.heroDesc}>
          Las fechas fundamentales que alimentan los contadores, aniversarios y la línea temporal.
        </Text>
      </View>

      <View style={styles.groupCard}>
        {/* Anniversary */}
        <View style={styles.row}>
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 16 }}>❤️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Aniversario Oficial de Novios</Text>
            <Text style={styles.rowDesc}>15 de Febrero de 2025</Text>
          </View>
          <TextInput
            style={styles.dateInput}
            value={anniversaryDate}
            onChangeText={setAnniversaryDate}
            placeholder="AAAA-MM-DD"
          />
        </View>

        <View style={styles.divider} />

        {/* First Met */}
        <View style={styles.row}>
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 16 }}>🪩</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Donde nos conocimos</Text>
            <Text style={styles.rowDesc}>23 de Noviembre de 2024</Text>
          </View>
          <TextInput
            style={styles.dateInput}
            value={metDate}
            onChangeText={setMetDate}
            placeholder="AAAA-MM-DD"
          />
        </View>

        <View style={styles.divider} />

        {/* First Kiss */}
        <View style={styles.row}>
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 16 }}>💋</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Primer Beso</Text>
            <Text style={styles.rowDesc}>8 de Diciembre de 2024</Text>
          </View>
          <TextInput
            style={styles.dateInput}
            value={firstKissDate}
            onChangeText={setFirstKissDate}
            placeholder="AAAA-MM-DD"
          />
        </View>

        <View style={styles.divider} />

        {/* Andrea Birthday */}
        <View style={styles.row}>
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 16 }}>🎂</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Cumpleaños de Andrea</Text>
            <Text style={styles.rowDesc}>1 de Septiembre</Text>
          </View>
          <TextInput
            style={styles.dateInput}
            value={andreaBirthday}
            onChangeText={setAndreaBirthday}
            placeholder="AAAA-MM-DD"
          />
        </View>

        <View style={styles.divider} />

        {/* Tonet Birthday */}
        <View style={styles.row}>
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 16 }}>🎁</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Cumpleaños de Tonet</Text>
            <Text style={styles.rowDesc}>19 de Octubre</Text>
          </View>
          <TextInput
            style={styles.dateInput}
            value={tonetBirthday}
            onChangeText={setTonetBirthday}
            placeholder="AAAA-MM-DD"
          />
        </View>
      </View>

      {/* SAVE BUTTON */}
      {isSaved ? (
        <View style={styles.successBox}>
          <IconCheck size={18} color="#2D8A4E" strokeWidth={2.5} />
          <Text style={styles.successText}>¡Fechas guardadas correctamente!</Text>
        </View>
      ) : (
        <Button
          variant="primary"
          size="lg"
          onPress={handleSave}
          style={{ marginTop: Spacing.xl }}
        >
          Guardar Hitos de Pareja ✨
        </Button>
      )}
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
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
  },
  heroIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(224, 86, 102, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  heroTitle: {
    ...Typography.h2,
    fontSize: 18,
    color: '#1E252B',
    textAlign: 'center',
  },
  heroDesc: {
    ...Typography.body,
    fontSize: 13,
    color: '#766B72',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF7F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E252B',
  },
  rowDesc: {
    fontSize: 12,
    color: '#766B72',
    marginTop: 2,
  },
  dateInput: {
    backgroundColor: '#FAF7F2',
    borderRadius: Radii.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: '#1E252B',
    fontWeight: '600',
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.10)',
    width: 105,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(58, 47, 56, 0.06)',
    marginLeft: 56,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    backgroundColor: 'rgba(45, 138, 78, 0.12)',
    borderRadius: Radii.lg,
    marginTop: Spacing.lg,
    gap: 8,
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D8A4E',
  },
});
