import { Tabs } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { Layout, Shadows } from '../../src/theme/tokens';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { GlobalProfileAvatar } from '../../src/components/GlobalProfileAvatar';

function TabEmoji({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text
        style={[
          styles.emojiText,
          focused ? styles.emojiFocused : styles.emojiUnfocused,
        ]}
      >
        {emoji}
      </Text>
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      {/* Permanent Fixed Top-Right Circular Profile Avatar */}
      <GlobalProfileAvatar />

      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: Colors.light.primary,
          tabBarInactiveTintColor: Colors.light.textMuted,
          tabBarStyle: {
            backgroundColor: Platform.OS === 'web' ? 'rgba(253, 252, 250, 0.90)' : Colors.light.surfaceElevated,
            ...(Platform.OS === 'web'
              ? ({
                  backdropFilter: 'blur(25px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(25px) saturate(180%)',
                } as any)
              : {}),
            borderTopColor: 'rgba(20, 19, 18, 0.08)',
            borderTopWidth: 1,
            borderRadius: 0,
            height: 60,
            paddingBottom: 6,
            paddingTop: 6,
            ...Shadows.md,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Nido',
            tabBarIcon: ({ focused }) => <TabEmoji emoji="🏠" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="wishes"
          options={{
            title: 'Deseos',
            tabBarIcon: ({ focused }) => <TabEmoji emoji="🎁" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Calendario',
            tabBarIcon: ({ focused }) => <TabEmoji emoji="📅" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Mapa',
            tabBarIcon: ({ focused }) => <TabEmoji emoji="📍" focused={focused} />,
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

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    paddingTop: 2,
  },
  emojiText: {
    textAlign: 'center',
  },
  emojiFocused: {
    fontSize: 22,
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  emojiUnfocused: {
    fontSize: 19,
    opacity: 0.55,
    transform: [{ scale: 0.95 }],
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.primary,
    marginTop: 3,
  },
});
