import { Tabs } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { Layout, Typography, Shadows } from '../../src/theme/tokens';
import { Platform } from 'react-native';
import {
  IconHome,
  IconHeart,
  IconCalendar,
  IconMapPin,
  IconUser
} from '../../src/components/ui/Icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#111111',
        tabBarInactiveTintColor: '#8E8C88',
        tabBarStyle: {
          backgroundColor: Platform.OS === 'web' ? 'rgba(250, 249, 246, 0.85)' : '#FFFFFF',
          ...(Platform.OS === 'web'
            ? ({
                backdropFilter: 'blur(30px) saturate(180%)',
                WebkitBackdropFilter: 'blur(30px) saturate(180%)',
              } as any)
            : {}),
          borderTopColor: 'rgba(17, 17, 17, 0.07)',
          borderTopWidth: 1,
          borderRadius: 0,
          height: Layout.tabBarHeight,
          paddingBottom: Platform.OS === 'web' ? 12 : 14,
          paddingTop: 8,
          ...Shadows.glass,
        },
        tabBarLabelStyle: {
          ...Typography.vintageTag,
          fontSize: 9,
          letterSpacing: 1.4,
          marginTop: 2,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Nido',
          tabBarIcon: ({ color, focused }) => (
            <IconHome
              size={19}
              color={color}
              strokeWidth={focused ? 2.2 : 1.6}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wishes"
        options={{
          title: 'Deseos',
          tabBarIcon: ({ color, focused }) => (
            <IconHeart
              size={19}
              color={color}
              strokeWidth={focused ? 2.2 : 1.6}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, focused }) => (
            <IconCalendar
              size={19}
              color={color}
              strokeWidth={focused ? 2.2 : 1.6}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color, focused }) => (
            <IconMapPin
              size={19}
              color={color}
              strokeWidth={focused ? 2.2 : 1.6}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Cuenta',
          tabBarIcon: ({ color, focused }) => (
            <IconUser
              size={19}
              color={color}
              strokeWidth={focused ? 2.2 : 1.6}
            />
          ),
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
  );
}
