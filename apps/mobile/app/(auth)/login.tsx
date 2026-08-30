import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDev } from '../../src/context/DevContext';
import { IntroShootingAnimation } from '../../src/components/auth/IntroShootingAnimation';
import { Typography } from '../../src/theme/tokens';
import { triggerHaptic } from '../../src/utils/haptics';
import { Mail, Lock, ArrowRight, KeyRound } from 'lucide-react-native';

const PRIVATE_ACCESS_KEY = '611171571';

export default function LoginScreen() {
  const router = useRouter();
  const { loginWithEmail } = useDev();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isShootingPaused, setIsShootingPaused] = useState(false);

  const handleLogin = async (customEmail?: string, customPassword?: string) => {
    setErrorMessage(null);
    const targetEmail = (customEmail || email).trim();
    const targetPassword = (customPassword || password).trim();

    if (!targetEmail) {
      triggerHaptic('error');
      setErrorMessage('Por favor, introduce tu correo electrónico.');
      return;
    }

    if (!targetPassword) {
      triggerHaptic('error');
      setErrorMessage('Introduce la contraseña privada (611171571).');
      return;
    }

    // Validación estricta de contraseña privada
    if (targetPassword !== PRIVATE_ACCESS_KEY) {
      triggerHaptic('error');
      setErrorMessage('Contraseña incorrecta. Introduce la clave privada (611171571).');
      return;
    }

    triggerHaptic('medium');
    setLoading(true);

    try {
      const success = await loginWithEmail(targetEmail);
      if (success) {
        triggerHaptic('success');
        if (Platform.OS === 'web') {
          // Navegación garantizada en navegadores web
          router.replace('/(tabs)/home');
        } else {
          router.replace('/(tabs)/home');
        }
      } else {
        setErrorMessage('No se pudo validar el acceso. Inténtalo de nuevo.');
      }
    } catch (e: any) {
      triggerHaptic('error');
      setErrorMessage('Error al acceder. Revisa la conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLoginTonet = () => {
    setEmail('hwrtseo@gmail.com');
    setPassword(PRIVATE_ACCESS_KEY);
    handleLogin('hwrtseo@gmail.com', PRIVATE_ACCESS_KEY);
  };

  const handleQuickLoginAndrea = () => {
    setEmail('andrea@amor.com');
    setPassword(PRIVATE_ACCESS_KEY);
    handleLogin('andrea@amor.com', PRIVATE_ACCESS_KEY);
  };

  return (
    <View style={styles.container}>
      {/* 🎞️ Fullscreen Shooting Animation (0.3s frame speed, limpio y sin flashes) */}
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
          {/* Glass Card Centrada */}
          <View style={styles.glassCard}>
            <View style={styles.cardHeader}>
              <View style={styles.lockBadge}>
                <Lock size={12} color="#D4AF37" />
                <Text style={styles.lockBadgeText}>ACCESO PRIVADO</Text>
              </View>
              <Text style={styles.cardTitle}>Bienvenido a Casa</Text>
              <Text style={styles.cardSubtitle}>
                Introduce tus credenciales para acceder a nuestro espacio
              </Text>
            </View>

            {/* Inline Error Banner if any */}
            {errorMessage && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
              </View>
            )}

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Mail size={18} color="rgba(255, 255, 255, 0.6)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo (ej. hwrtseo@gmail.com)"
                placeholderTextColor="rgba(255, 255, 255, 0.35)"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (errorMessage) setErrorMessage(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <KeyRound size={18} color="rgba(255, 255, 255, 0.6)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña privada (611171571)"
                placeholderTextColor="rgba(255, 255, 255, 0.35)"
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  if (errorMessage) setErrorMessage(null);
                }}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
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
              <Text style={styles.dividerText}>O ACCESO RÁPIDO</Text>
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
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    minHeight: Platform.OS === 'web' ? '100vh' : '100%',
    backgroundColor: '#0F0E0D',
    position: 'relative',
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    zIndex: 10,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  glassCard: {
    backgroundColor: 'rgba(20, 18, 16, 0.90)',
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
  errorBox: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.35)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: Typography.family.medium,
    fontSize: 12,
    color: '#FF453A',
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
    marginBottom: 12,
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
    marginTop: 4,
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
});
