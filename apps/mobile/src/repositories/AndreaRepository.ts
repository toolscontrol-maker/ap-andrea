import { WishlistItem, Place, CoupleEvent, RitualSeed, FeelingEntry } from '@andrea/types';
import { AndreaMapPlace } from '../types/map';

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
}

export interface AndreaRepository {
  // Wishes
  getWishes(): Promise<WishlistItem[]>;
  saveWish(item: WishlistItem): Promise<void>;
  updateWish(id: string, patch: Partial<WishlistItem>): Promise<void>;
  deleteWish(id: string): Promise<void>;

  // Places & Restaurants
  getPlaces(): Promise<Place[]>;
  savePlace(place: Place): Promise<void>;
  updatePlace(id: string, patch: Partial<Place>): Promise<void>;
  deletePlace(id: string): Promise<void>;

  // Couple Events & Dates
  getEvents(range?: DateRange): Promise<CoupleEvent[]>;
  saveEvent(event: CoupleEvent): Promise<void>;
  updateEvent(id: string, patch: Partial<CoupleEvent>): Promise<void>;
  deleteEvent(id: string): Promise<void>;

  // Ritual Seeds
  getRitualEntries(): Promise<RitualSeed[]>;
  saveRitualEntry(entry: RitualSeed): Promise<void>;

  // Feelings
  getFeelings(): Promise<FeelingEntry[]>;
  saveFeeling(entry: FeelingEntry): Promise<void>;

  // Map Places
  getMapPlaces(): Promise<AndreaMapPlace[]>;
  saveMapPlace(place: AndreaMapPlace): Promise<void>;

  // Backup & Local Migration Tools
  exportAllData(): Promise<string>;
  importAllData(jsonString: string): Promise<{ success: boolean; importedKeys: number; error?: string }>;
  clearAllData(): Promise<void>;
}
