import { Stack } from 'expo-router';
import { Colors } from '../../../src/theme/colors';

export default function SurprisesStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.light.background },
        headerTintColor: Colors.light.text,
        contentStyle: { backgroundColor: Colors.light.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Sorpresas', headerShown: false }} />
      <Stack.Screen name="new" options={{ title: 'Nueva Sorpresa / Regalo', presentation: 'modal' }} />
    </Stack>
  );
}
