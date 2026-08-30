import { Tabs, Redirect } from 'expo-router';
import { View } from 'react-native';
import { useDev } from '../../src/context/DevContext';
import { GlobalProfileAvatar } from '../../src/components/GlobalProfileAvatar';
import { FloatingGlassTabBar } from '../../src/components/navigation/FloatingGlassTabBar';

export default function TabLayout() {
  const { isAuthenticated, isLoaded } = useDev();

  if (isLoaded && !isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Permanent Fixed Top-Right Circular Profile Avatar */}
      <GlobalProfileAvatar />

      <Tabs
        tabBar={(props) => <FloatingGlassTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Nido',
          }}
        />
        <Tabs.Screen
          name="wishes"
          options={{
            title: 'Deseos',
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Calendario',
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Mapa',
          }}
        />
        {/* Hide Account from bottom bar, accessed via top-right profile avatar */}
        <Tabs.Screen
          name="account"
          options={{
            href: null,
          }}
        />
        {/* Retain aya & surprises routes internally without displaying separate tabs */}
        <Tabs.Screen
          name="aya"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="surprises"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </View>
  );
}
