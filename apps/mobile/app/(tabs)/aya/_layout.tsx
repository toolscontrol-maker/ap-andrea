import { Stack } from 'expo-router';
import { Colors } from '../../../src/theme/colors';

export default function AyaLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.light.background },
        headerTintColor: Colors.light.text,
        contentStyle: { backgroundColor: Colors.light.background },
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
