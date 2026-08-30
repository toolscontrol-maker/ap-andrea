import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useCouple } from '../../providers/CoupleProvider';
import { Colors } from '../../theme/colors';
import { Typography, Spacing, Radii } from '../../theme/tokens';

export const PairingScreen: React.FC = () => {
  const { couple, createPairingCode, redeemPairingCode } = useCouple();
  const [inputCode, setInputCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const res = await createPairingCode();
    setIsGenerating(false);
    if (res.code) {
      setGeneratedCode(res.code);
    } else {
      Alert.alert('Error', res.error || 'No se pudo generar el código');
    }
  };

  const handleRedeem = async () => {
    if (!inputCode.trim()) {
      Alert.alert('Introduce el código', 'Pega el código de 6 caracteres que te ha enviado tu pareja.');
      return;
    }
    setIsRedeeming(true);
    const res = await redeemPairingCode(inputCode.trim());
    setIsRedeeming(false);
    if (res.success) {
      Alert.alert('💕 ¡Vinculación Exitosa!', 'Ahora estáis conectados en vuestro espacio compartido.');
    } else {
      Alert.alert('Código no válido', res.error || 'Verifica el código e inténtalo de nuevo.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Vincular con tu Pareja</Text>
        <Text style={styles.desc}>
          Para compartir recuerdos, deseos y el mapa, ambos debéis estar conectados.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opción 1: Enviar código a tu pareja</Text>
          {generatedCode ? (
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{generatedCode}</Text>
              <Text style={styles.codeHint}>Válido durante 48 horas</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.btnSecondary} activeOpacity={0.8} onPress={handleGenerate} disabled={isGenerating}>
              {isGenerating ? <ActivityIndicator /> : <Text style={styles.btnSecondaryText}>Generar código de vinculación</Text>}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opción 2: Introducir código recibido</Text>
          <TextInput
            style={styles.inputCode}
            placeholder="CÓDIGO (6 LETRAS)"
            placeholderTextColor="#999"
            autoCapitalize="characters"
            maxLength={6}
            value={inputCode}
            onChangeText={(t) => setInputCode(t.toUpperCase())}
          />
          <TouchableOpacity style={styles.btnPrimary} activeOpacity={0.8} onPress={handleRedeem} disabled={isRedeeming}>
            {isRedeeming ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnPrimaryText}>Conectar Pareja</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
  },
  title: {
    fontFamily: Typography.family.bold,
    fontSize: 22,
    color: Colors.light.textPrimary,
    textAlign: 'center',
  },
  desc: {
    fontFamily: Typography.family.regular,
    fontSize: 13,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Typography.family.semiBold,
    fontSize: 14,
    color: Colors.light.textPrimary,
  },
  codeBox: {
    backgroundColor: '#F4F0EB',
    borderRadius: Radii.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  codeText: {
    fontFamily: Typography.family.bold,
    fontSize: 28,
    letterSpacing: 4,
    color: Colors.light.primary,
  },
  codeHint: {
    fontFamily: Typography.family.regular,
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  inputCode: {
    backgroundColor: '#F7F6F3',
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontFamily: Typography.family.bold,
    fontSize: 18,
    letterSpacing: 2,
    textAlign: 'center',
    color: Colors.light.textPrimary,
  },
  btnPrimary: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radii.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontFamily: Typography.family.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  btnSecondary: {
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: Radii.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnSecondaryText: {
    fontFamily: Typography.family.medium,
    fontSize: 13,
    color: Colors.light.primary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(58, 47, 56, 0.08)',
    marginVertical: Spacing.lg,
  },
});
