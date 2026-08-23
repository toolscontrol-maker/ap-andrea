import { Stack } from 'expo-router';
import { Colors } from '../../src/theme/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.light.background },
        headerTintColor: Colors.light.text,
        contentStyle: { backgroundColor: Colors.light.background }
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Iniciar Sesión', headerShown: false }} />
      <Stack.Screen name="register" options={{ title: 'Crear Cuenta', headerShown: false }} />
      <Stack.Screen name="pair" options={{ title: 'Vincular Pareja', headerBackVisible: false }} />
    </Stack>
  );
}
