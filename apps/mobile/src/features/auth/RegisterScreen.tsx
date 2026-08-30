import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { Colors } from '../../theme/colors';
import { Typography, Spacing, Radii } from '../../theme/tokens';

interface RegisterScreenProps {
  onNavigateLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateLogin }) => {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña corta', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setIsSubmitting(true);
    const res = await signUp(email.trim(), password, name.trim());
    setIsSubmitting(false);
    if (res.error) {
      Alert.alert('Error al registrarse', res.error);
    } else {
      Alert.alert('✨ Cuenta Creada', 'Te hemos registrado con éxito. Ya puedes vincularte con tu pareja.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.appTitle}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Comienza vuestro espacio compartido en Andrea</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Tu Nombre</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Tonet o Andrea"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />

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
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.btnPrimary} activeOpacity={0.8} onPress={handleRegister} disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.btnPrimaryText}>Crear Cuenta</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnLink} activeOpacity={0.7} onPress={onNavigateLogin}>
            <Text style={styles.btnLinkText}>¿Ya tienes cuenta? Inicia sesión aquí</Text>
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
    fontSize: 26,
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
});
