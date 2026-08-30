import fs from 'fs';
import path from 'path';

const projectRoot = 'c:\\\\Users\\\\angel chisvert\\\\Desktop\\\\ANDREA APP';
const mobileRoot = path.join(projectRoot, 'apps', 'mobile');
const devContextPath = path.join(mobileRoot, 'src', 'context', 'DevContext.tsx');
let devContextContent = fs.readFileSync(devContextPath, 'utf8');

// Replace loadStoredData to unblock UI immediately
const oldLoadRegex = /\/\/ 1\. Initial load from persistent storage \+ cloud hydration[\s\S]*?loadStoredData\(\);\s*\}, \[\]\);/;
const newLoad = `// 1. Initial load from persistent storage + background cloud hydration
  useEffect(() => {
    async function loadStoredData() {
      try {
        // 1. Purge legacy sessions
        StorageEngine.setItem('andrea_auth_session_v5', null);
        StorageEngine.setItem('andrea_auth_session_v6', null);

        const [
          savedRole,
          savedWishes,
          savedPlacesData,
          savedEvents,
          savedSeeds,
          savedEntries,
          savedUsers,
          savedAuth,
          savedTheme,
        ] = await Promise.all([
          StorageEngine.getItem<'user1' | 'user2'>(STORAGE_KEYS.ACTIVE_USER, 'user2'),
          StorageEngine.getItem<WishlistItem[] | null>(STORAGE_KEYS.WISHES, null),
          StorageEngine.getItem<Place[] | null>(STORAGE_KEYS.PLACES, null),
          StorageEngine.getItem<CoupleEvent[] | null>(STORAGE_KEYS.EVENTS, null),
          StorageEngine.getItem<RitualSeed[] | null>(STORAGE_KEYS.SEEDS, null),
          StorageEngine.getItem<DiaryEntryUI[] | null>('andrea_entries_v5', null),
          StorageEngine.getItem<{ user1: DevUser; user2: DevUser } | null>('andrea_users_v5', null),
          StorageEngine.getItem<{ email: string; role: 'user1' | 'user2'; timestamp?: number } | null>(AUTH_SESSION_KEY, null),
          StorageEngine.getItem<'atelier' | 'velvet' | 'lavender' | 'olive' | 'bordeaux' | null>('andrea_theme_palette_v5', null),
        ]);

        if (savedTheme) {
          setThemePaletteState(savedTheme);
        }

        // Validate 24-hour expiration window
        if (savedAuth && savedAuth.email && savedAuth.timestamp) {
          const elapsed = Date.now() - savedAuth.timestamp;
          if (elapsed < SESSION_MAX_AGE_MS) {
            setIsAuthenticated(true);
            setCurrentEmail(savedAuth.email);
            if (savedAuth.role) setActiveRole(savedAuth.role);
          } else {
            console.log('[DevContext] Session expired (>24h). Auto-logging out.');
            await StorageEngine.setItem(AUTH_SESSION_KEY, null);
            setIsAuthenticated(false);
            setCurrentEmail(null);
          }
        } else {
          setIsAuthenticated(false);
          setCurrentEmail(null);
        }

        if (savedWishes !== null && Array.isArray(savedWishes)) setWishes(savedWishes);
        if (savedPlacesData !== null && Array.isArray(savedPlacesData)) setSavedPlaces(savedPlacesData);
        if (savedEvents !== null && Array.isArray(savedEvents)) setCoupleEvents(savedEvents);
        if (savedSeeds !== null && Array.isArray(savedSeeds)) setRitualSeeds(savedSeeds);
        if (savedEntries !== null && Array.isArray(savedEntries)) setEntries(savedEntries);
        if (savedUsers && (savedUsers.user1 || savedUsers.user2)) {
          setUsers((prev) => ({
            user1: { ...prev.user1, ...(savedUsers.user1 || {}) },
            user2: { ...prev.user2, ...(savedUsers.user2 || {}) },
          }));
        }
      } catch (e) {
        console.warn('Error loading persisted local data:', e);
      } finally {
        // INSTANTLY UNBLOCK UI (renders LoginScreen on new devices in <5ms with 0 hang)
        setIsLoaded(true);
      }

      // 2. Fetch remote state from Supabase Cloud asynchronously in background
      if (CloudSyncEngine.isSupabaseConfigured()) {
        try {
          const cloudState = await CloudSyncEngine.fetchFullCloudState();
          if (cloudState) {
            if (cloudState.users) {
              setUsers((prev) => {
                const merged = {
                  user1: { ...prev.user1, ...(cloudState.users.user1 || {}) },
                  user2: { ...prev.user2, ...(cloudState.users.user2 || {}) },
                };
                try {
                  StorageEngine.setItem('andrea_users_v5', merged);
                } catch {
                  // ignore
                }
                return merged;
              });
            }
            if (cloudState.wishes && cloudState.wishes.length > 0) setWishes(cloudState.wishes);
            if (cloudState.savedPlaces && cloudState.savedPlaces.length > 0) setSavedPlaces(cloudState.savedPlaces);
            if (cloudState.mapPlaces && cloudState.mapPlaces.length > 0) setMapPlaces(cloudState.mapPlaces);
            if (cloudState.coupleEvents && cloudState.coupleEvents.length > 0) setCoupleEvents(cloudState.coupleEvents);
          }
        } catch (cloudErr) {
          console.warn('[DevContext] Background Cloud hydration error:', cloudErr);
        }
      }
    }

    loadStoredData();
  }, []);`;

devContextContent = devContextContent.replace(oldLoadRegex, newLoad);
fs.writeFileSync(devContextPath, devContextContent, 'utf8');
console.log('✅ Updated DevContext.tsx to instantly unblock LoginScreen');
`;

fs.writeFileSync(path.join(projectRoot, 'scratch', 'unblock_instant_login.mjs'), unblockContent, 'utf8');
