import { Stack } from 'expo-router';
import { Colors } from '../../../src/theme/colors';

export default function CalendarStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.light.background },
        headerTintColor: Colors.light.text,
        contentStyle: { backgroundColor: Colors.light.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Calendario', headerShown: false }} />
      <Stack.Screen name="new" options={{ title: 'Añadir Fecha o Evento', presentation: 'modal' }} />
    </Stack>
  );
}
