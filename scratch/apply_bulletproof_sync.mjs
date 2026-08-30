import fs from 'fs';
import path from 'path';

const projectRoot = 'c:\\\\Users\\\\angel chisvert\\\\Desktop\\\\ANDREA APP';
const mobileRoot = path.join(projectRoot, 'apps', 'mobile');

// ─────────────────────────────────────────────────────────────────────────────
// 1. UPDATE CloudSyncEngine.ts (Handle blob: and data: uploads, log status)
// ─────────────────────────────────────────────────────────────────────────────
const cloudSyncPath = path.join(mobileRoot, 'src', 'services', 'cloud-sync', 'CloudSyncEngine.ts');
let cloudSync = fs.readFileSync(cloudSyncPath, 'utf8');

cloudSync = cloudSync.replace(
  /if \(fileBase64OrUri\.startsWith\('data:'\)\) \{/,
  `if (fileBase64OrUri.startsWith('data:') || fileBase64OrUri.startsWith('blob:')) {`
);

fs.writeFileSync(cloudSyncPath, cloudSync, 'utf8');
console.log('✅ Updated CloudSyncEngine.ts uploadMediaImage for data and blob URIs');

// ─────────────────────────────────────────────────────────────────────────────
// 2. UPDATE DevContext.tsx (Proper async updateUserProfile & addWish)
// ─────────────────────────────────────────────────────────────────────────────
const devContextPath = path.join(mobileRoot, 'src', 'context', 'DevContext.tsx');
let devContext = fs.readFileSync(devContextPath, 'utf8');

// Replace updateUserProfile
const oldUpdateProfileRegex = /const updateUserProfile = async \(userId: string, updates: Partial<DevUser>\) => \{[\s\S]*?StorageEngine\.setItem\('andrea_users_v5', updated\);\s*CloudSyncEngine\.syncUserProfile\(targetUserId, roleKey, updatedUser\);\s*return updated;\s*\}\);\s*\};/;

const newUpdateProfile = `const updateUserProfile = async (userId: string, updates: Partial<DevUser>) => {
    const isUser1 = userId === DEV_USERS.user1.id || (updates.name && updates.name.toLowerCase().includes('tonet'));
    const roleKey: 'user1' | 'user2' = isUser1 ? 'user1' : 'user2';
    const targetUserId = isUser1 ? DEV_USERS.user1.id : DEV_USERS.user2.id;

    let finalPhoto = updates.avatarPhoto;
    if (finalPhoto && (finalPhoto.startsWith('data:') || finalPhoto.startsWith('blob:'))) {
      try {
        finalPhoto = await CloudSyncEngine.uploadMediaImage(finalPhoto, \`avatar_\${roleKey}_\${Date.now()}.jpg\`);
      } catch (e) {
        console.warn('[DevContext] Upload avatar error:', e);
      }
    }

    const currentUser = isUser1 ? users.user1 : users.user2;
    const updatedUser: DevUser = {
      ...currentUser,
      ...updates,
      avatarPhoto: finalPhoto !== undefined ? finalPhoto : currentUser.avatarPhoto,
      id: targetUserId,
      avatar: updates.name ? updates.name[0].toUpperCase() : currentUser.avatar,
    };

    const nextUsers = {
      user1: isUser1 ? updatedUser : users.user1,
      user2: !isUser1 ? updatedUser : users.user2,
    };

    setUsers(nextUsers);
    await StorageEngine.setItem('andrea_users_v5', nextUsers);
    await CloudSyncEngine.syncUserProfile(targetUserId, roleKey, updatedUser);
  };`;

devContext = devContext.replace(oldUpdateProfileRegex, newUpdateProfile);

// Replace addWish
const oldAddWishRegex = /const addWish = \(wish: Partial<WishlistItem>\) => \{[\s\S]*?setWishes\(\(prev\) => \[item, \.\.\.prev\]\);\s*CloudSyncEngine\.syncWish\(item\);\s*\};/;

const newAddWish = `const addWish = async (wish: Partial<WishlistItem>) => {
    let finalExternalImage = wish.externalImageUrl;
    if (finalExternalImage && (finalExternalImage.startsWith('data:') || finalExternalImage.startsWith('blob:'))) {
      try {
        finalExternalImage = await CloudSyncEngine.uploadMediaImage(finalExternalImage, \`wish_\${Date.now()}.jpg\`);
      } catch (e) {
        console.warn('[DevContext] Wish photo upload error:', e);
      }
    }

    const newId = 'wish-' + Date.now();
    const item: WishlistItem = {
      id: newId,
      coupleId: 'andrea-tonet',
      ownerUserId: currentDevUser.id,
      createdByUserId: currentDevUser.id,
      title: wish.title || 'Deseo sin título',
      description: wish.description,
      sourceUrl: wish.sourceUrl,
      externalImageUrl: finalExternalImage,
      images: wish.images && wish.images.length > 0 ? wish.images : (finalExternalImage ? [finalExternalImage] : []),
      type: wish.type || 'other',
      status: wish.status || 'dreaming',
      brand: wish.brand,
      estimatedPrice: wish.estimatedPrice,
      isForSelf: wish.isForSelf ?? true,
      phoneNumber: wish.phoneNumber,
      visibility: 'shared',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setWishes((prev) => {
      const next = [item, ...prev];
      StorageEngine.setItem(STORAGE_KEYS.WISHES, next);
      return next;
    });
    await CloudSyncEngine.syncWish(item);
  };`;

devContext = devContext.replace(oldAddWishRegex, newAddWish);

fs.writeFileSync(devContextPath, devContext, 'utf8');
console.log('✅ Updated DevContext.tsx with bulletproof async profile and wish updates');

// ─────────────────────────────────────────────────────────────────────────────
// 3. UPDATE ProfileSettingsModal.tsx (Clickable hero avatar, resolved preset URIs)
// ─────────────────────────────────────────────────────────────────────────────
const profileModalPath = path.join(mobileRoot, 'src', 'components', 'account', 'ProfileSettingsModal.tsx');
let profileModal = fs.readFileSync(profileModalPath, 'utf8');

// Make entire avatar clickable
profileModal = profileModal.replace(
  /<View style=\{styles\.avatarWrapper\}>[\s\S]*?<\/View>/,
  `<TouchableOpacity style={styles.avatarWrapper} onPress={handleOpenPhotoEditor} activeOpacity={0.85}>
                {currentDevUser.avatarPhoto ? (
                  <Image source={{ uri: currentDevUser.avatarPhoto }} style={styles.avatarHeroImg} />
                ) : (
                  <View style={[styles.avatarHeroFallback, { backgroundColor: Colors.light.primary }]}>
                    <Text style={styles.avatarHeroText}>{currentDevUser.avatar}</Text>
                  </View>
                )}
                <View style={styles.avatarEditBadge}>
                  <IconCamera size={13} color="#FFFFFF" />
                </View>
              </TouchableOpacity>`
);

fs.writeFileSync(profileModalPath, profileModal, 'utf8');
console.log('✅ Updated ProfileSettingsModal.tsx with clickable avatar wrapper');
