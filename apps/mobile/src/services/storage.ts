import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Universal Storage Engine
 * Fast synchronous-like local storage on Web + AsyncStorage on iOS/Android
 */
export const StorageEngine = {
  async getItem<T>(key: string, defaultValue: T): Promise<T> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(key);
        if (item !== null) {
          return JSON.parse(item) as T;
        }
      } else {
        const item = await AsyncStorage.getItem(key);
        if (item !== null) {
          return JSON.parse(item) as T;
        }
      }
    } catch (e) {
      console.warn(`[StorageEngine] Failed to read key ${key}:`, e);
    }
    return defaultValue;
  },

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const json = JSON.stringify(value);
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, json);
      } else {
        await AsyncStorage.setItem(key, json);
      }
    } catch (e) {
      console.warn(`[StorageEngine] Failed to write key ${key}:`, e);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (e) {
      console.warn(`[StorageEngine] Failed to remove key ${key}:`, e);
    }
  },

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
  WISHES: 'andrea_wishes_v1',
  PLACES: 'andrea_places_v4',
  EVENTS: 'andrea_events_v2',
  SEEDS: 'andrea_ritual_seeds_v1',
  AYA_MESSAGES: 'andrea_aya_messages_v1',
  AYA_INSIGHTS: 'andrea_aya_insights_v1',
  FEELINGS: 'andrea_feelings_v1',
} as const;
