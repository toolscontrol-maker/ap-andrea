import { WishlistItem, Place, CoupleEvent, RitualSeed, FeelingEntry } from '@andrea/types';
import { AndreaMapPlace } from '../../types/map';
import { StorageEngine, STORAGE_KEYS } from '../storage';
import { AndreaRepository, DateRange } from './AndreaRepository';

/**
 * Local implementation of AndreaRepository using StorageEngine (LocalStorage on Web / AsyncStorage on Native)
 */
export class LocalAndreaRepository implements AndreaRepository {
  // Wishes
  async getWishes(): Promise<WishlistItem[]> {
    return StorageEngine.getItem<WishlistItem[]>(STORAGE_KEYS.WISHES, []);
  }

  async saveWish(item: WishlistItem): Promise<void> {
    await StorageEngine.updateItem<WishlistItem[]>(
      STORAGE_KEYS.WISHES,
      (list) => {
        const idx = list.findIndex((w) => w.id === item.id);
        if (idx >= 0) {
          const next = [...list];
          next[idx] = item;
          return next;
        }
        return [item, ...list];
      },
      []
    );
  }

  async deleteWish(id: string): Promise<void> {
    await StorageEngine.updateItem<WishlistItem[]>(
      STORAGE_KEYS.WISHES,
      (list) => list.filter((w) => w.id !== id),
      []
    );
  }

  // Places
  async getPlaces(): Promise<Place[]> {
    return StorageEngine.getItem<Place[]>(STORAGE_KEYS.PLACES, []);
  }

  async savePlace(place: Place): Promise<void> {
    await StorageEngine.updateItem<Place[]>(
      STORAGE_KEYS.PLACES,
      (list) => {
        const idx = list.findIndex((p) => p.id === place.id);
        if (idx >= 0) {
          const next = [...list];
          next[idx] = place;
          return next;
        }
        return [place, ...list];
      },
      []
    );
  }

  async deletePlace(id: string): Promise<void> {
    await StorageEngine.updateItem<Place[]>(
      STORAGE_KEYS.PLACES,
      (list) => list.filter((p) => p.id !== id),
      []
    );
  }

  // Events
  async getEvents(range?: DateRange): Promise<CoupleEvent[]> {
    const allEvents = await StorageEngine.getItem<CoupleEvent[]>(STORAGE_KEYS.EVENTS, []);
    if (!range) return allEvents;

    return allEvents.filter((e) => {
      if (range.start && e.date < range.start) return false;
      if (range.end && e.date > range.end) return false;
      return true;
    });
  }

  async saveEvent(event: CoupleEvent): Promise<void> {
    await StorageEngine.updateItem<CoupleEvent[]>(
      STORAGE_KEYS.EVENTS,
      (list) => {
        const idx = list.findIndex((e) => e.id === event.id);
        if (idx >= 0) {
          const next = [...list];
          next[idx] = event;
          return next;
        }
        return [event, ...list];
      },
      []
    );
  }

  async deleteEvent(id: string): Promise<void> {
    await StorageEngine.updateItem<CoupleEvent[]>(
      STORAGE_KEYS.EVENTS,
      (list) => list.filter((e) => e.id !== id),
      []
    );
  }

  // Ritual Seeds
  async getRitualSeeds(): Promise<RitualSeed[]> {
    return StorageEngine.getItem<RitualSeed[]>(STORAGE_KEYS.SEEDS, []);
  }

  async saveRitualSeed(seed: RitualSeed): Promise<void> {
    await StorageEngine.updateItem<RitualSeed[]>(
      STORAGE_KEYS.SEEDS,
      (list) => {
        const idx = list.findIndex((s) => s.id === seed.id);
        if (idx >= 0) {
          const next = [...list];
          next[idx] = seed;
          return next;
        }
        return [seed, ...list];
      },
      []
    );
  }

  // Feelings
  async getFeelings(): Promise<FeelingEntry[]> {
    return StorageEngine.getItem<FeelingEntry[]>(STORAGE_KEYS.FEELINGS, []);
  }

  async saveFeeling(entry: FeelingEntry): Promise<void> {
    await StorageEngine.updateItem<FeelingEntry[]>(
      STORAGE_KEYS.FEELINGS,
      (list) => [entry, ...list],
      []
    );
  }

  // Map Places
  async getMapPlaces(): Promise<AndreaMapPlace[]> {
    return StorageEngine.getItem<AndreaMapPlace[]>(STORAGE_KEYS.MAP_PLACES, []);
  }

  async saveMapPlace(place: AndreaMapPlace): Promise<void> {
    await StorageEngine.updateItem<AndreaMapPlace[]>(
      STORAGE_KEYS.MAP_PLACES,
      (list) => {
        const idx = list.findIndex((p) => p.id === place.id);
        if (idx >= 0) {
          const next = [...list];
          next[idx] = place;
          return next;
        }
        return [place, ...list];
      },
      []
    );
  }

  // Backup & Storage Tools
  async exportAllData(): Promise<string> {
    return StorageEngine.exportAllLocalData();
  }

  async importAllData(jsonString: string): Promise<{ success: boolean; importedKeys: number; error?: string }> {
    return StorageEngine.importAllLocalData(jsonString);
  }

  async clearAllData(): Promise<void> {
    return StorageEngine.clearAllData();
  }
}

export const defaultLocalRepository = new LocalAndreaRepository();
