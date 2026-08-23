import { Stack } from 'expo-router';
import { Colors } from '../../../src/theme/colors';

export default function MapStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.light.background },
        headerTintColor: Colors.light.text,
        contentStyle: { backgroundColor: Colors.light.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Nuestro Mapa', headerShown: false }} />
      <Stack.Screen name="new" options={{ title: 'Añadir Lugar al Mapa', presentation: 'modal' }} />
    </Stack>
  );
}
