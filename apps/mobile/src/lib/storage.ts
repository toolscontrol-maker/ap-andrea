import { StorageEngine } from '../services/storage';

export const SecureStorage = {
  async getItem(key: string): Promise<string | null> {
    return StorageEngine.getRaw(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    return StorageEngine.setRaw(key, value);
  },

  async removeItem(key: string): Promise<void> {
    return StorageEngine.removeItem(key);
  }
};
