import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { Colors } from '../../theme/colors';
import { Typography, Spacing, Radii } from '../../theme/tokens';

interface LoginScreenProps {
  onNavigateRegister: () => void;
  onContinueOffline: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateRegister, onContinueOffline }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Campos requeridos', 'Por favor ingresa tu email y contraseña.');
      return;
    }
    setIsSubmitting(true);
    const res = await signIn(email.trim(), password);
    setIsSubmitting(false);
    if (res.error) {
      Alert.alert('No se pudo iniciar sesión', res.error);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.appTitle}>Andrea</Text>
        <Text style={styles.subtitle}>Espacio Íntimo para Parejas</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="ejemplo@andrea.app"
            placeholderTextColor="#999"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.btnPrimary} activeOpacity={0.8} onPress={handleLogin} disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.btnPrimaryText}>Acceder a vuestro espacio</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnLink} activeOpacity={0.7} onPress={onNavigateRegister}>
            <Text style={styles.btnLinkText}>¿No tienes cuenta? Regístrate aquí</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.btnSecondary} activeOpacity={0.7} onPress={onContinueOffline}>
            <Text style={styles.btnSecondaryText}>Continuar en Modo Local / Demo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  appTitle: {
    fontFamily: Typography.family.bold,
    fontSize: 28,
    color: Colors.light.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Typography.family.regular,
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.xl,
  },
  form: {
    gap: Spacing.sm,
  },
  label: {
    fontFamily: Typography.family.medium,
    fontSize: 13,
    color: Colors.light.textPrimary,
    marginTop: Spacing.xs,
  },
  input: {
    backgroundColor: '#F7F6F3',
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontFamily: Typography.family.regular,
    fontSize: 15,
    color: Colors.light.textPrimary,
  },
  btnPrimary: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  btnPrimaryText: {
    fontFamily: Typography.family.semiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  btnLink: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    marginTop: 4,
  },
  btnLinkText: {
    fontFamily: Typography.family.medium,
    fontSize: 13,
    color: Colors.light.primary,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.sm,
    gap: 8,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(58, 47, 56, 0.08)',
  },
  dividerText: {
    fontFamily: Typography.family.regular,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  btnSecondary: {
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.15)',
    borderRadius: Radii.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnSecondaryText: {
    fontFamily: Typography.family.medium,
    fontSize: 13,
    color: Colors.light.textPrimary,
  },
});
