import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ValidatorFn<T> = (value: unknown) => value is T;
export type MigrationFn<OldType, NewType> = (oldValue: OldType) => NewType;

/**
 * Universal & Robust Storage Engine for Andrea App
 * Supports:
 * - Graceful fallback on corrupt JSON (never crashes the app or wipes other keys)
 * - Optional schema validator on read
 * - Automatic migration pipeline between key versions with local backup
 * - Atomic-like updateItem helper
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
      // 1. Check if target key already exists and has valid data
      const existingTargetRaw = await this.getRaw(targetKey);
      if (existingTargetRaw !== null) {
        return this.safeParse<NewType>(existingTargetRaw, defaultValue, validator);
      }

      // 2. Read source key
      const sourceRaw = await this.getRaw(sourceKey);
      if (sourceRaw === null) {
        return defaultValue;
      }

      // 3. Backup source key before migrating
      await this.backupKey(sourceKey);

      // 4. Parse source and apply migration transform
      const parsedOld = JSON.parse(sourceRaw) as OldType;
      const migrated = migrationFn(parsedOld);

      // 5. Validate migrated data
      if (validator && !validator(migrated)) {
        console.warn(`[StorageEngine] Migration produced invalid schema for "${targetKey}". Falling back.`);
        return defaultValue;
      }

      // 6. Write target key
      await this.setItem<NewType>(targetKey, migrated);
      return migrated;
    } catch (err) {
      console.warn(`[StorageEngine] Migration failed from "${sourceKey}" to "${targetKey}":`, err);
      return defaultValue;
    }
  },

  /**
   * Clears all storage data (for development/reset flows)
   */
  async clearAllData(): Promise<void> {
    try {
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
} as const;
