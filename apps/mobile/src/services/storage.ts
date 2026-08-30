import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ValidatorFn<T> = (value: unknown) => value is T;
export type MigrationFn<OldType, NewType> = (oldValue: OldType) => NewType;

export interface StorageExportPayload {
  version: number;
  exportedAt: string;
  client: string;
  keys: Record<string, any>;
}

/**
 * Universal & Robust Storage Engine for Andrea App
 * Supports:
 * - Graceful fallback on corrupt JSON (never crashes the app or wipes other keys)
 * - Optional schema validator on read
 * - Automatic migration pipeline between key versions with local backup
 * - Atomic-like updateItem helper
 * - Local data backup, restore, export, and import
 */
export const StorageEngine = {
  /**
   * Reads raw string from platform storage
   */
  async getRaw(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.warn(`[StorageEngine] Failed to getRaw for key "${key}":`, e);
      return null;
    }
  },

  /**
   * Writes raw string to platform storage
   */
  async setRaw(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn(`[StorageEngine] Failed to setRaw for key "${key}":`, e);
    }
  },

  /**
   * Safely parses JSON with schema validation and fallback
   */
  safeParse<T>(raw: string | null, defaultValue: T, validator?: ValidatorFn<T>): T {
    if (raw === null || raw === undefined || raw === '') {
      return defaultValue;
    }

    try {
      const parsed = JSON.parse(raw);
      if (validator && !validator(parsed)) {
        console.warn(`[StorageEngine] Validation failed for data. Using fallback default.`);
        return defaultValue;
      }
      return parsed as T;
    } catch (err) {
      console.warn(`[StorageEngine] Corrupt JSON detected. Using fallback default without crashing.`, err);
      return defaultValue;
    }
  },

  /**
   * Retrieves an item with schema validation and corrupt-data recovery
   */
  async getItem<T>(key: string, defaultValue: T, validator?: ValidatorFn<T>): Promise<T> {
    try {
      const raw = await this.getRaw(key);
      return this.safeParse<T>(raw, defaultValue, validator);
    } catch (e) {
      console.warn(`[StorageEngine] Failed to read key "${key}":`, e);
      return defaultValue;
    }
  },

  /**
   * Persists an item safely as JSON
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const json = JSON.stringify(value);
      await this.setRaw(key, json);
    } catch (e) {
      console.warn(`[StorageEngine] Failed to write key "${key}":`, e);
    }
  },

  /**
   * Atomically updates an item using a transform function
   */
  async updateItem<T>(key: string, updater: (prev: T) => T, defaultValue: T, validator?: ValidatorFn<T>): Promise<T> {
    const current = await this.getItem<T>(key, defaultValue, validator);
    const updated = updater(current);
    await this.setItem<T>(key, updated);
    return updated;
  },

  /**
   * Removes a single key
   */
  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (e) {
      console.warn(`[StorageEngine] Failed to remove key "${key}":`, e);
    }
  },

  /**
   * Creates a backup copy of a key prior to major migrations
   */
  async backupKey(key: string): Promise<string | null> {
    try {
      const raw = await this.getRaw(key);
      if (raw !== null) {
        const backupKey = `${key}_backup_${Date.now()}`;
        await this.setRaw(backupKey, raw);
        return backupKey;
      }
    } catch (e) {
      console.warn(`[StorageEngine] Backup failed for key "${key}":`, e);
    }
    return null;
  },

  /**
   * Returns a list of all backup keys
   */
  async getBackupKeys(baseKey?: string): Promise<string[]> {
    const backupKeys: string[] = [];
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.includes('_backup_')) {
            if (!baseKey || k.startsWith(baseKey)) {
              backupKeys.push(k);
            }
          }
        }
      } else {
        const allKeys = await AsyncStorage.getAllKeys();
        for (const k of allKeys) {
          if (k.includes('_backup_')) {
            if (!baseKey || k.startsWith(baseKey)) {
              backupKeys.push(k);
            }
          }
        }
      }
    } catch (e) {
      console.warn('[StorageEngine] Failed to retrieve backup keys:', e);
    }
    return backupKeys.sort().reverse();
  },

  /**
   * Restores data from a backup key into the target key
   */
  async restoreBackup(backupKey: string, targetKey: string): Promise<boolean> {
    try {
      const raw = await this.getRaw(backupKey);
      if (raw === null) return false;
      await this.setRaw(targetKey, raw);
      return true;
    } catch (e) {
      console.warn(`[StorageEngine] Failed to restore backup from "${backupKey}":`, e);
      return false;
    }
  },

  /**
   * Migrates data from an older key version to a target key version safely
   */
  async migrateKey<OldType, NewType>(
    sourceKey: string,
    targetKey: string,
    migrationFn: MigrationFn<OldType, NewType>,
    defaultValue: NewType,
    validator?: ValidatorFn<NewType>
  ): Promise<NewType> {
    try {
      const existingTargetRaw = await this.getRaw(targetKey);
      if (existingTargetRaw !== null) {
        return this.safeParse<NewType>(existingTargetRaw, defaultValue, validator);
      }

      const sourceRaw = await this.getRaw(sourceKey);
      if (sourceRaw === null) {
        return defaultValue;
      }

      await this.backupKey(sourceKey);

      const parsedOld = JSON.parse(sourceRaw) as OldType;
      const migrated = migrationFn(parsedOld);

      if (validator && !validator(migrated)) {
        console.warn(`[StorageEngine] Migration produced invalid schema for "${targetKey}". Falling back.`);
        return defaultValue;
      }

      await this.setItem<NewType>(targetKey, migrated);
      return migrated;
    } catch (err) {
      console.warn(`[StorageEngine] Migration failed from "${sourceKey}" to "${targetKey}":`, err);
      return defaultValue;
    }
  },

  /**
   * Exports all app keys as a downloadable JSON string
   */
  async exportAllLocalData(): Promise<string> {
    const exportBundle: StorageExportPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      client: 'Andrea App (Local Beta)',
      keys: {},
    };

    const targetKeys = Object.values(STORAGE_KEYS);
    for (const key of targetKeys) {
      const raw = await this.getRaw(key);
      if (raw !== null) {
        try {
          exportBundle.keys[key] = JSON.parse(raw);
        } catch {
          exportBundle.keys[key] = raw;
        }
      }
    }

    return JSON.stringify(exportBundle, null, 2);
  },

  /**
   * Imports all app keys from an exported JSON bundle
   */
  async importAllLocalData(jsonString: string): Promise<{ success: boolean; importedKeys: number; error?: string }> {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object' || !parsed.keys || typeof parsed.keys !== 'object') {
        return { success: false, importedKeys: 0, error: 'El archivo no tiene el formato de copia de seguridad válido de Andrea App.' };
      }

      let count = 0;
      for (const [key, value] of Object.entries(parsed.keys)) {
        await this.setItem(key, value);
        count++;
      }

      return { success: true, importedKeys: count };
    } catch (err: any) {
      return { success: false, importedKeys: 0, error: err?.message || 'Error al procesar el archivo JSON.' };
    }
  },

  /**
   * Returns storage summary stats for settings
   */
  async getStorageStats(): Promise<{ lastUpdated: string; totalItems: number; counts: Record<string, number> }> {
    const wishes = await this.getItem<any[]>(STORAGE_KEYS.WISHES, []);
    const places = await this.getItem<any[]>(STORAGE_KEYS.PLACES, []);
    const events = await this.getItem<any[]>(STORAGE_KEYS.EVENTS, []);
    const seeds = await this.getItem<any[]>(STORAGE_KEYS.SEEDS, []);
    const feelings = await this.getItem<any[]>(STORAGE_KEYS.FEELINGS, []);

    const counts = {
      wishes: wishes.length,
      places: places.length,
      events: events.length,
      ritualSeeds: seeds.length,
      feelings: feelings.length,
    };

    const totalItems = Object.values(counts).reduce((acc, c) => acc + c, 0);

    return {
      lastUpdated: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      totalItems,
      counts,
    };
  },

  /**
   * Clears all storage data (for development/reset flows)
   */
  async clearAllData(): Promise<void> {
    try {
      const targetKeys = Object.values(STORAGE_KEYS);
      for (const k of targetKeys) {
        await this.removeItem(k);
      }
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      } else {
        await AsyncStorage.clear();
      }
    } catch (e) {
      console.warn('[StorageEngine] Failed to clear storage:', e);
    }
  },
};

export const STORAGE_KEYS = {
  ACTIVE_USER: 'andrea_active_user_v1',
  ACTIVE_ROLE: 'andrea_active_dev_role',
  WISHES: 'andrea_wishes_v1',
  PLACES: 'andrea_places_v4',
  EVENTS: 'andrea_events_v2',
  SEEDS: 'andrea_ritual_seeds_v1',
  AYA_MESSAGES: 'andrea_aya_messages_v1',
  AYA_INSIGHTS: 'andrea_aya_insights_v1',
  FEELINGS: 'andrea_feelings_v1',
  MAP_PLACES: 'andrea_map_places_v4',
  BETA_NOTICE_ACCEPTED: 'andrea_beta_notice_accepted_v1',
  DEMO_MODE_FLAG: 'andrea_demo_mode_enabled_v1',
} as const;
