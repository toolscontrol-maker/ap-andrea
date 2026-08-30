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
            position: 'absolute',
            bottom: Platform.OS === 'web' ? 24 : 28,
            left: 0,
            right: 0,
            maxWidth: 290,
            marginHorizontal: 'auto',
            height: 60,
            borderRadius: 30,
            backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.76)' : 'rgba(255, 255, 255, 0.88)',
            ...(Platform.OS === 'web'
              ? ({
                  backdropFilter: 'blur(32px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(32px) saturate(200%)',
                } as any)
              : {}),
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.85)',
            shadowColor: 'rgba(20, 18, 16, 0.16)',
            shadowOffset: { width: 0, height: 12 },
            shadowRadius: 28,
            shadowOpacity: 1,
            elevation: 16,
            paddingBottom: 0,
            paddingTop: 0,
            alignItems: 'center',
            justifyContent: 'space-around',
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
