import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDev } from '../../src/context/DevContext';
import { IntroShootingAnimation } from '../../src/components/auth/IntroShootingAnimation';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/tokens';
import { triggerHaptic } from '../../src/utils/haptics';
import { Mail, ArrowRight, Lock } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { loginWithEmail, isCloudConnected } = useDev();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isShootingPaused, setIsShootingPaused] = useState(false);

  const handleLogin = async (customEmail?: string) => {
    const targetEmail = (customEmail || email).trim();
    if (!targetEmail) {
      triggerHaptic('error');
      Alert.alert('Email Requerido', 'Por favor, introduce tu correo electrónico para continuar.');
      return;
    }

    triggerHaptic('medium');
    setLoading(true);

    try {
      const success = await loginWithEmail(targetEmail);
      if (success) {
        triggerHaptic('success');
        router.replace('/(tabs)/home');
      }
    } catch (e: any) {
      triggerHaptic('error');
      Alert.alert('Error al acceder', 'Ha ocurrido un error al validar tu acceso.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLoginTonet = () => {
    setEmail('hwrtseo@gmail.com');
    handleLogin('hwrtseo@gmail.com');
  };

  const handleQuickLoginAndrea = () => {
    setEmail('andrea@amor.com');
    handleLogin('andrea@amor.com');
  };

  return (
    <View style={styles.container}>
      {/* 🎞️ Fullscreen Shooting Animation (0.3s frame speed) */}
      <IntroShootingAnimation
        intervalMs={300}
        isPaused={isShootingPaused}
        onTogglePause={() => setIsShootingPaused(prev => !prev)}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <View style={styles.cardContainer}>
          {/* Glass Card */}
          <View style={styles.glassCard}>
            <View style={styles.cardHeader}>
              <View style={styles.lockBadge}>
                <Lock size={12} color="#D4AF37" />
                <Text style={styles.lockBadgeText}>ACCESO PRIVADO</Text>
              </View>
              <Text style={styles.cardTitle}>Bienvenido a Casa</Text>
              <Text style={styles.cardSubtitle}>
                Introduce tu correo para acceder al atlas íntimo
              </Text>
            </View>

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Mail size={18} color="rgba(255, 255, 255, 0.6)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="ej. hwrtseo@gmail.com"
                placeholderTextColor="rgba(255, 255, 255, 0.35)"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="go"
                onSubmitEditing={() => handleLogin()}
              />
            </View>

            {/* Main Submit Button */}
            <TouchableOpacity
              style={[styles.btnPrimary, loading && styles.btnDisabled]}
              onPress={() => handleLogin()}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#0F0E0D" />
              ) : (
                <View style={styles.btnPrimaryContent}>
                  <Text style={styles.btnPrimaryText}>Entrar a Nuestro Espacio</Text>
                  <ArrowRight size={16} color="#0F0E0D" />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>O ACCESO DIRECTO</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Quick 1-Tap Partner Selectors */}
            <View style={styles.quickAccessRow}>
              <TouchableOpacity
                style={styles.quickBtn}
                onPress={handleQuickLoginTonet}
                activeOpacity={0.8}
              >
                <Text style={styles.quickBtnIcon}>👤</Text>
                <View>
                  <Text style={styles.quickBtnTitle}>Tonet</Text>
                  <Text style={styles.quickBtnSub}>hwrtseo@gmail.com</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickBtn, styles.quickBtnAndrea]}
                onPress={handleQuickLoginAndrea}
                activeOpacity={0.8}
              >
                <Text style={styles.quickBtnIcon}>🌸</Text>
                <View>
                  <Text style={styles.quickBtnTitle}>Andrea</Text>
                  <Text style={styles.quickBtnSub}>Perfil Privado</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Cloud Status Footer */}
            <View style={styles.cardFooter}>
              <View style={[styles.statusDot, { backgroundColor: isCloudConnected ? '#34C759' : '#FF9500' }]} />
              <Text style={styles.footerStatusText}>
                {isCloudConnected ? '🟢 Supabase Cloud en Tiempo Real' : '☁️ Almacenamiento Local Seguro'}
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0E0D',
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
  },
  glassCard: {
    backgroundColor: 'rgba(24, 22, 20, 0.88)',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.55,
    shadowRadius: 32,
    elevation: 20,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    gap: 6,
    marginBottom: 10,
  },
  lockBadgeText: {
    fontFamily: Typography.family.medium,
    fontSize: 10,
    letterSpacing: 1.5,
    color: '#D4AF37',
    fontWeight: '700',
  },
  cardTitle: {
    fontFamily: Typography.family.bold,
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: Typography.family.regular,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontFamily: Typography.family.regular,
    fontSize: 14,
    color: '#FFFFFF',
  },
  btnPrimary: {
    backgroundColor: '#FAF8F5',
    borderRadius: 16,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnPrimaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnPrimaryText: {
    fontFamily: Typography.family.bold,
    fontSize: 15,
    color: '#0F0E0D',
    letterSpacing: 0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    fontFamily: Typography.family.medium,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1.2,
  },
  quickAccessRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  quickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  quickBtnAndrea: {
    borderColor: 'rgba(224, 86, 102, 0.25)',
    backgroundColor: 'rgba(224, 86, 102, 0.08)',
  },
  quickBtnIcon: {
    fontSize: 18,
  },
  quickBtnTitle: {
    fontFamily: Typography.family.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  quickBtnSub: {
    fontFamily: Typography.family.regular,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  footerStatusText: {
    fontFamily: Typography.family.medium,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.55)',
  },
});
