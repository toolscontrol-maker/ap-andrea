import fs from 'fs';
import path from 'path';

const projectRoot = 'c:\\\\Users\\\\angel chisvert\\\\Desktop\\\\ANDREA APP';
const mobileRoot = path.join(projectRoot, 'apps', 'mobile');

// ─────────────────────────────────────────────────────────────────────────────
// 1. UPDATE CloudSyncEngine.ts
// ─────────────────────────────────────────────────────────────────────────────
const cloudSyncPath = path.join(mobileRoot, 'src', 'services', 'cloud-sync', 'CloudSyncEngine.ts');
let cloudSync = fs.readFileSync(cloudSyncPath, 'utf8');

// Ensure mapRitualSeedFromDb exists
if (!cloudSync.includes('mapRitualSeedFromDb')) {
  const mapperInsert = `  public mapRitualSeedFromDb(row: any): RitualSeed {
    return {
      id: row.id,
      coupleId: row.couple_id || COUPLE_ID,
      authorId: row.author_id || row.authorId,
      date: row.date || (row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
      type: row.type || 'gratitude_note',
      title: row.title || 'Momento compartido',
      body: row.body || '',
      imageUrl: row.image_url || row.imageUrl || row.photoUrl || undefined,
      photoUrl: row.image_url || row.imageUrl || row.photoUrl || undefined,
      mood: row.mood || 'love',
      isSharedWithPartner: row.is_shared_with_partner !== undefined ? row.is_shared_with_partner : true,
      partnerResponded: Boolean(row.partner_responded),
      createdAt: row.created_at || new Date().toISOString(),
    };
  }

  public mapEventFromDb`;
  cloudSync = cloudSync.replace('  public mapEventFromDb', mapperInsert);
}

// Ensure fetchFullCloudState loads ritual_seeds
cloudSync = cloudSync.replace(
  /const \[\s*\{ data: profilesData \},\s*\{ data: wishesData \},\s*\{ data: placesData \},\s*\{ data: mapPlacesData \},\s*\{ data: eventsData \},\s*\] = await Promise\.all\(\[\s*supabase\.from\('profiles'\)\.select\('\*'\)\.eq\('couple_id', COUPLE_ID\),\s*supabase\.from\('wishes'\)\.select\('\*'\)\.eq\('couple_id', COUPLE_ID\),\s*supabase\.from\('saved_places'\)\.select\('\*'\)\.eq\('couple_id', COUPLE_ID\),\s*supabase\.from\('map_places'\)\.select\('\*'\)\.eq\('couple_id', COUPLE_ID\),\s*supabase\.from\('couple_events'\)\.select\('\*'\)\.eq\('couple_id', COUPLE_ID\),\s*\]\);/,
  `const [
        { data: profilesData },
        { data: wishesData },
        { data: placesData },
        { data: mapPlacesData },
        { data: eventsData },
        { data: ritualSeedsData },
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('couple_id', COUPLE_ID),
        supabase.from('wishes').select('*').eq('couple_id', COUPLE_ID),
        supabase.from('saved_places').select('*').eq('couple_id', COUPLE_ID),
        supabase.from('map_places').select('*').eq('couple_id', COUPLE_ID),
        supabase.from('couple_events').select('*').eq('couple_id', COUPLE_ID),
        supabase.from('ritual_seeds').select('*').eq('couple_id', COUPLE_ID),
      ]);`
);

cloudSync = cloudSync.replace(
  /coupleEvents: eventsData && eventsData\.length > 0 \? eventsData\.map\(e => this\.mapEventFromDb\(e\)\) : null,\s*\};/,
  `coupleEvents: eventsData && eventsData.length > 0 ? eventsData.map(e => this.mapEventFromDb(e)) : null,
        ritualSeeds: ritualSeedsData && ritualSeedsData.length > 0 ? ritualSeedsData.map(s => this.mapRitualSeedFromDb(s)) : null,
      };`
);

// Add syncRitualSeed method if not present
if (!cloudSync.includes('syncRitualSeed')) {
  const syncRitualCode = `  // ── 6. RITUAL SEEDS ──
  public async syncRitualSeed(seed: RitualSeed) {
    this.broadcastLocal('ritual_seeds', 'UPDATE', seed);
    try {
      if (this.isSupabaseConfigured()) {
        await supabase.from('ritual_seeds').upsert({
          id: seed.id,
          couple_id: COUPLE_ID,
          author_id: seed.authorId,
          date: seed.date || new Date().toISOString().split('T')[0],
          type: seed.type,
          title: seed.title || 'Momento compartido',
          body: seed.body || '',
          mood: seed.mood || 'love',
          image_url: seed.photoUrl || seed.imageUrl || null,
          is_shared_with_partner: seed.isSharedWithPartner ?? true,
          partner_responded: seed.partnerResponded ?? false,
          created_at: seed.createdAt || new Date().toISOString(),
        }, { onConflict: 'id' });
      }
    } catch (e) {
      console.warn('[CloudSync] Ritual seed sync error:', e);
    }
  }

  // ── 5. PROFILES & PHOTOS ──`;
  cloudSync = cloudSync.replace('  // ── 5. PROFILES & PHOTOS ──', syncRitualCode);
}

// Add realtime mapper for ritual_seeds in initializeRealtime
if (!cloudSync.includes("table === 'ritual_seeds'")) {
  cloudSync = cloudSync.replace(
    /else if \(table === 'couple_events'\) mappedRecord = this\.mapEventFromDb\(rawRecord\);/,
    `else if (table === 'couple_events') mappedRecord = this.mapEventFromDb(rawRecord);
              else if (table === 'ritual_seeds') mappedRecord = this.mapRitualSeedFromDb(rawRecord);`
  );
}

fs.writeFileSync(cloudSyncPath, cloudSync, 'utf8');
console.log('✅ Updated CloudSyncEngine.ts with ritual seeds synchronization & Realtime');

// ─────────────────────────────────────────────────────────────────────────────
// 2. UPDATE DevContext.tsx
// ─────────────────────────────────────────────────────────────────────────────
const devContextPath = path.join(mobileRoot, 'src', 'context', 'DevContext.tsx');
let devContext = fs.readFileSync(devContextPath, 'utf8');

// Ensure addRitualSeed uploads photos and calls syncRitualSeed
const oldAddRitual = `  const addRitualSeed = (seed: Partial<RitualSeed>) => {
    const newSeed: RitualSeed = {
      id: 'seed-' + Date.now(),
      coupleId: 'andrea-tonet',
      authorId: currentDevUser.id,
      date: seed.date || new Date().toISOString().split('T')[0],
      type: seed.type || 'gratitude_note',
      title: seed.title || 'Momento compartido',
      body: seed.body,
      imageUrl: seed.imageUrl || seed.photoUrl,
      photoUrl: seed.photoUrl || seed.imageUrl,
      mood: seed.mood || 'grateful',
      isSharedWithPartner: true,
      partnerResponded: false,
      createdAt: new Date().toISOString(),
    };

    setRitualSeeds((prev) => [newSeed, ...prev]);
  };`;

const newAddRitual = `  const addRitualSeed = async (seed: Partial<RitualSeed>) => {
    let finalPhoto = seed.photoUrl || seed.imageUrl;
    if (finalPhoto && (finalPhoto.startsWith('data:') || finalPhoto.startsWith('blob:'))) {
      try {
        finalPhoto = await CloudSyncEngine.uploadMediaImage(finalPhoto, \`ritual_\${Date.now()}.jpg\`);
      } catch (e) {
        console.warn('[DevContext] Ritual photo upload error:', e);
      }
    }

    const newSeed: RitualSeed = {
      id: 'seed-' + Date.now(),
      coupleId: 'andrea-tonet',
      authorId: currentDevUser.id,
      date: seed.date || new Date().toISOString().split('T')[0],
      type: seed.type || 'gratitude_note',
      title: seed.title || 'Momento compartido',
      body: seed.body || '',
      imageUrl: finalPhoto,
      photoUrl: finalPhoto,
      mood: seed.mood || 'grateful',
      isSharedWithPartner: true,
      partnerResponded: false,
      createdAt: new Date().toISOString(),
    };

    setRitualSeeds((prev) => [newSeed, ...prev]);
    await CloudSyncEngine.syncRitualSeed(newSeed);
  };`;

devContext = devContext.replace(oldAddRitual, newAddRitual);

// Update Cloud hydration in loadStoredData and loginWithEmail to also set ritualSeeds
devContext = devContext.replaceAll(
  `if (cloudState.coupleEvents && cloudState.coupleEvents.length > 0) setCoupleEvents(cloudState.coupleEvents);`,
  `if (cloudState.coupleEvents && cloudState.coupleEvents.length > 0) setCoupleEvents(cloudState.coupleEvents);
            if (cloudState.ritualSeeds && cloudState.ritualSeeds.length > 0) setRitualSeeds(cloudState.ritualSeeds);`
);

fs.writeFileSync(devContextPath, devContext, 'utf8');
console.log('✅ Updated DevContext.tsx with ritual seed syncing and full cloud hydration');
