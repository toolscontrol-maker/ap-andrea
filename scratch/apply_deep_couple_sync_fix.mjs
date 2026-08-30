import fs from 'fs';
import path from 'path';

const projectRoot = 'c:\\\\Users\\\\angel chisvert\\\\Desktop\\\\ANDREA APP';
const mobileRoot = path.join(projectRoot, 'apps', 'mobile');

// 1. DevContext.tsx
const devContextPath = path.join(mobileRoot, 'src', 'context', 'DevContext.tsx');
let devContext = fs.readFileSync(devContextPath, 'utf8');

// Replace all occurrences of 'demo-couple-id' with 'andrea-tonet'
devContext = devContext.replaceAll("'demo-couple-id'", "'andrea-tonet'");

// Update updateUserProfile to upload photo to Supabase storage BEFORE setting state & syncing
const oldUpdateProfile = `  const updateUserProfile = async (userId: string, updates: Partial<DevUser>) => {
    const isUser1 = userId === DEV_USERS.user1.id || (updates.name && updates.name.toLowerCase().includes('tonet'));
    const roleKey: 'user1' | 'user2' = isUser1 ? 'user1' : 'user2';
    const targetUserId = isUser1 ? DEV_USERS.user1.id : DEV_USERS.user2.id;

    setUsers((prev) => {
      const currentUser = isUser1 ? prev.user1 : prev.user2;
      const updatedUser: DevUser = {
        ...currentUser,
        ...updates,
        id: targetUserId,
        avatar: updates.name ? updates.name[0].toUpperCase() : currentUser.avatar,
      };
      const updated = {
        user1: isUser1 ? updatedUser : prev.user1,
        user2: !isUser1 ? updatedUser : prev.user2,
      };
      StorageEngine.setItem('andrea_users_v5', updated);
      CloudSyncEngine.syncUserProfile(targetUserId, roleKey, updatedUser);
      return updated;
    });
  };`;

const newUpdateProfile = `  const updateUserProfile = async (userId: string, updates: Partial<DevUser>) => {
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

    setUsers((prev) => {
      const currentUser = isUser1 ? prev.user1 : prev.user2;
      const updatedUser: DevUser = {
        ...currentUser,
        ...updates,
        avatarPhoto: finalPhoto !== undefined ? finalPhoto : currentUser.avatarPhoto,
        id: targetUserId,
        avatar: updates.name ? updates.name[0].toUpperCase() : currentUser.avatar,
      };
      const updated = {
        user1: isUser1 ? updatedUser : prev.user1,
        user2: !isUser1 ? updatedUser : prev.user2,
      };
      StorageEngine.setItem('andrea_users_v5', updated);
      CloudSyncEngine.syncUserProfile(targetUserId, roleKey, updatedUser);
      return updated;
    });
  };`;

devContext = devContext.replace(oldUpdateProfile, newUpdateProfile);
fs.writeFileSync(devContextPath, devContext, 'utf8');
console.log('✅ Updated DevContext.tsx: Replaced demo-couple-id and fixed updateUserProfile storage upload');

// 2. useCouple.ts
const useCouplePath = path.join(mobileRoot, 'src', 'hooks', 'useCouple.ts');
let useCouple = fs.readFileSync(useCouplePath, 'utf8');
useCouple = useCouple.replaceAll("'demo-couple-id'", "'andrea-tonet'");
fs.writeFileSync(useCouplePath, useCouple, 'utf8');
console.log('✅ Updated useCouple.ts: Set coupleId to andrea-tonet');
