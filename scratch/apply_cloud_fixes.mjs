import fs from 'fs';
import path from 'path';

const projectRoot = 'c:\\\\Users\\\\angel chisvert\\\\Desktop\\\\ANDREA APP';
const mobileRoot = path.join(projectRoot, 'apps', 'mobile');

// ─────────────────────────────────────────────────────────────────────────────
// 1. FIX PhotoUploadField.tsx (Support both imageUri/onImageChange and photoUrl/onPhotoSelected)
// ─────────────────────────────────────────────────────────────────────────────
const photoUploadPath = path.join(mobileRoot, 'src', 'components', 'ui', 'PhotoUploadField.tsx');
let photoUploadContent = fs.readFileSync(photoUploadPath, 'utf8');

photoUploadContent = photoUploadContent.replace(
  /export function PhotoUploadField\(\{[\s\S]*?\}\:\s*PhotoUploadFieldProps\)\s*\{/,
  `export function PhotoUploadField({
  imageUri,
  onImageChange,
  photoUrl,
  onPhotoSelected,
  label = 'Fotografía del momento',
  placeholderText = 'Toca para subir una foto o hacer una captura',
  aspect = [4, 3],
  style,
}: PhotoUploadFieldProps) {
  const effectiveImageUri = imageUri !== undefined ? imageUri : photoUrl;
  const triggerChange = (val: string | null) => {
    if (onImageChange) onImageChange(val);
    if (onPhotoSelected) onPhotoSelected(val);
  };`
);

photoUploadContent = photoUploadContent.replace(
  /onImageChange\(res\.base64 \|\| res\.uri\);/,
  `triggerChange(res.base64 || res.uri);`
);

photoUploadContent = photoUploadContent.replace(
  /onImageChange\(null\);/,
  `triggerChange(null);`
);

photoUploadContent = photoUploadContent.replace(
  /Boolean\(imageUri\)/g,
  `Boolean(effectiveImageUri)`
);

photoUploadContent = photoUploadContent.replace(
  /source=\{\{\s*uri:\s*sanitizeImageHotlink\(imageUri\)\s*\}\}/g,
  `source={{ uri: sanitizeImageHotlink(effectiveImageUri!) }}`
);

// Add interface props
photoUploadContent = photoUploadContent.replace(
  /interface PhotoUploadFieldProps\s*\{[\s\S]*?\}/,
  `interface PhotoUploadFieldProps {
  imageUri?: string | null;
  onImageChange?: (imageUri: string | null) => void;
  photoUrl?: string | null;
  onPhotoSelected?: (imageUri: string | null) => void;
  label?: string;
  placeholderText?: string;
  aspect?: [number, number];
  style?: ViewStyle;
}`
);

fs.writeFileSync(photoUploadPath, photoUploadContent, 'utf8');
console.log('✅ Updated PhotoUploadField.tsx with backward-compatible aliases');

// ─────────────────────────────────────────────────────────────────────────────
// 2. FIX apps/mobile/app/(tabs)/_layout.tsx (Never render unauthenticated or before isLoaded)
// ─────────────────────────────────────────────────────────────────────────────
const tabLayoutPath = path.join(mobileRoot, 'app', '(tabs)', '_layout.tsx');
const tabLayoutContent = `import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useDev } from '../../src/context/DevContext';
import { GlobalProfileAvatar } from '../../src/components/GlobalProfileAvatar';
import { FloatingGlassTabBar } from '../../src/components/navigation/FloatingGlassTabBar';

export default function TabLayout() {
  const { isAuthenticated, isLoaded } = useDev();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAF8F5', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#EF826A" />
      </View>
    );
  }

  if (!isAuthenticated) {
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
`;
fs.writeFileSync(tabLayoutPath, tabLayoutContent, 'utf8');
console.log('✅ Updated (tabs)/_layout.tsx with loading protection and forced login redirect');

// ─────────────────────────────────────────────────────────────────────────────
// 3. FIX apps/mobile/app/index.tsx (Root route splash and auth router)
// ─────────────────────────────────────────────────────────────────────────────
const indexScreenPath = path.join(mobileRoot, 'app', 'index.tsx');
const indexScreenContent = `import React from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useDev } from '../src/context/DevContext';
import LoginScreen from './(auth)/login';

export default function IndexScreen() {
  const { isAuthenticated, isLoaded } = useDev();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAF8F5', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#EF826A" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <LoginScreen />;
}
`;
fs.writeFileSync(indexScreenPath, indexScreenContent, 'utf8');
console.log('✅ Updated app/index.tsx with safe loading screen');

// ─────────────────────────────────────────────────────────────────────────────
// 4. FIX apps/mobile/src/context/DevContext.tsx (Upload avatars to Supabase Storage and cloud sync)
// ─────────────────────────────────────────────────────────────────────────────
const devContextPath = path.join(mobileRoot, 'src', 'context', 'DevContext.tsx');
let devContextContent = fs.readFileSync(devContextPath, 'utf8');

// Replace updateUserProfile implementation to handle data URIs
devContextContent = devContextContent.replace(
  /const updateUserProfile = async \(userId: string, updates: Partial<DevUser>\) => \{[\s\S]*?await CloudSyncEngine\.syncUserProfile\(userId, role, updatedUser\);\s*\};/,
  `const updateUserProfile = async (userId: string, updates: Partial<DevUser>) => {
    let finalPhoto = updates.avatarPhoto;
    if (finalPhoto && finalPhoto.startsWith('data:')) {
      try {
        finalPhoto = await CloudSyncEngine.uploadMediaImage(finalPhoto, \`avatar_\${userId}_\${Date.now()}.jpg\`);
      } catch (e) {
        console.warn('[DevContext] Failed to upload avatar to cloud storage:', e);
      }
    }

    const role = userId === DEV_USERS.user1.id ? 'user1' : 'user2';
    const updatedUser: DevUser = {
      ...users[role],
      ...updates,
      avatarPhoto: finalPhoto !== undefined ? finalPhoto : users[role].avatarPhoto,
      avatar: updates.name ? updates.name[0].toUpperCase() : users[role].avatar,
    };

    setUsers((prev) => {
      const next = { ...prev, [role]: updatedUser };
      StorageEngine.setItem('andrea_users_v5', next);
      return next;
    });

    await CloudSyncEngine.syncUserProfile(userId, role, updatedUser);
  };`
);

fs.writeFileSync(devContextPath, devContextContent, 'utf8');
console.log('✅ Updated DevContext.tsx with automatic Supabase storage avatar upload');
