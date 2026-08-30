import { WishlistItem, Place, CoupleEvent, RitualSeed, FeelingEntry } from '@andrea/types';
import { AndreaMapPlace } from '../types/map';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AndreaRepository, DateRange } from './AndreaRepository';
import { defaultLocalRepository } from './LocalAndreaRepository';

export class SupabaseAndreaRepository implements AndreaRepository {
  private coupleId: string | null = null;

  constructor(coupleId?: string) {
    if (coupleId) this.coupleId = coupleId;
  }

  public setCoupleId(coupleId: string | null) {
    this.coupleId = coupleId;
  }

  private ensureConfigured(): boolean {
    return isSupabaseConfigured() && Boolean(this.coupleId);
  }

  async getWishes(): Promise<WishlistItem[]> {
    if (!this.ensureConfigured()) return defaultLocalRepository.getWishes();
    const { data, error } = await supabase
      .from('wishes')
      .select('*')
      .eq('couple_id', this.coupleId!)
      .order('created_at', { ascending: false });

    if (error || !data) return defaultLocalRepository.getWishes();
    return data.map((w: any) => ({
      id: w.id,
      coupleId: w.couple_id,
      ownerUserId: w.owner_user_id,
      createdByUserId: w.created_by,
      title: w.title,
      description: w.description,
      type: w.type,
      status: w.status,
      visibility: w.visibility,
      sourceUrl: w.source_url,
      brand: w.brand,
      estimatedPrice: w.price,
      currency: w.currency,
      restaurantId: w.place_id,
      createdAt: w.created_at,
      updatedAt: w.updated_at,
    }));
  }

  async saveWish(item: WishlistItem): Promise<void> {
    await defaultLocalRepository.saveWish(item);
    if (!this.ensureConfigured()) return;

    await supabase.from('wishes').upsert({
      id: item.id,
      couple_id: this.coupleId,
      owner_user_id: item.ownerUserId,
      created_by: item.createdByUserId || item.ownerUserId,
      title: item.title,
      description: item.description,
      type: item.type,
      status: item.status,
      visibility: item.visibility,
      source_url: item.sourceUrl,
      brand: item.brand,
      price: item.estimatedPrice,
      currency: item.currency,
      place_id: item.restaurantId,
      updated_at: new Date().toISOString(),
    });
  }

  async updateWish(id: string, patch: Partial<WishlistItem>): Promise<void> {
    await defaultLocalRepository.updateWish(id, patch);
    if (!this.ensureConfigured()) return;

    const payload: any = { updated_at: new Date().toISOString() };
    if (patch.title !== undefined) payload.title = patch.title;
    if (patch.description !== undefined) payload.description = patch.description;
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.type !== undefined) payload.type = patch.type;
    if (patch.estimatedPrice !== undefined) payload.price = patch.estimatedPrice;

    await supabase.from('wishes').update(payload).eq('id', id);
  }

  async deleteWish(id: string): Promise<void> {
    await defaultLocalRepository.deleteWish(id);
    if (!this.ensureConfigured()) return;

    await supabase.from('wishes').delete().eq('id', id);
  }

  async getPlaces(): Promise<Place[]> {
    if (!this.ensureConfigured()) return defaultLocalRepository.getPlaces();
    const { data, error } = await supabase
      .from('places')
      .select('*, place_visits(*)')
      .eq('couple_id', this.coupleId!)
      .order('created_at', { ascending: false });

    if (error || !data) return defaultLocalRepository.getPlaces();
    return data.map((p: any) => ({
      id: p.id,
      coupleId: p.couple_id,
      createdByUserId: p.created_by,
      name: p.name,
      category: p.category,
      status: p.is_favorite ? 'favorite' : 'want_to_go',
      address: p.address,
      city: p.city,
      country: p.country,
      latitude: Number(p.lat),
      longitude: Number(p.lng),
      phoneNumber: p.phone_number,
      website: p.website,
      bookingUrl: p.booking_url,
      visits: (p.place_visits || []).map((v: any) => ({
        id: v.id,
        date: v.visited_at,
        title: v.title,
        note: v.note,
      })),
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));
  }

  async savePlace(place: Place): Promise<void> {
    await defaultLocalRepository.savePlace(place);
    if (!this.ensureConfigured()) return;

    await supabase.from('places').upsert({
      id: place.id,
      couple_id: this.coupleId,
      created_by: place.createdByUserId || (supabase.auth.getUser() as any)?.id,
      name: place.name,
      category: place.category,
      address: place.address,
      city: place.city,
      country: place.country,
      lat: place.latitude,
      lng: place.longitude,
      phone_number: place.phoneNumber,
      is_favorite: place.status === 'favorite',
      updated_at: new Date().toISOString(),
    });
  }

  async updatePlace(id: string, patch: Partial<Place>): Promise<void> {
    await defaultLocalRepository.updatePlace(id, patch);
    if (!this.ensureConfigured()) return;

    const payload: any = { updated_at: new Date().toISOString() };
    if (patch.name !== undefined) payload.name = patch.name;
    if (patch.status !== undefined) payload.is_favorite = patch.status === 'favorite';
    if (patch.address !== undefined) payload.address = patch.address;

    await supabase.from('places').update(payload).eq('id', id);
  }

  async deletePlace(id: string): Promise<void> {
    await defaultLocalRepository.deletePlace(id);
    if (!this.ensureConfigured()) return;

    await supabase.from('places').delete().eq('id', id);
  }

  async getEvents(range?: DateRange): Promise<CoupleEvent[]> {
    if (!this.ensureConfigured()) return defaultLocalRepository.getEvents(range);
    let query = supabase.from('events').select('*').eq('couple_id', this.coupleId!);
    if (range?.start) query = query.gte('starts_at', range.start);
    if (range?.end) query = query.lte('starts_at', range.end);

    const { data, error } = await query.order('starts_at', { ascending: true });
    if (error || !data) return defaultLocalRepository.getEvents(range);

    return data.map((e: any) => ({
      id: e.id,
      coupleId: e.couple_id,
      ownerId: e.created_by,
      partnerId: '',
      eventType: e.type,
      date: e.starts_at ? e.starts_at.split('T')[0] : '',
      time: e.starts_at ? e.starts_at.split('T')[1]?.substring(0, 5) : '',
      actualStartAt: e.starts_at,
      ownerView: { title: e.title, subtitle: e.description },
      partnerView: { title: e.title, subtitle: e.description },
      revealPolicy: e.reveal_policy,
      visibility: e.visibility,
      status: 'scheduled',
      createdAt: e.created_at,
      updatedAt: e.updated_at,
    }));
  }

  async saveEvent(event: CoupleEvent): Promise<void> {
    await defaultLocalRepository.saveEvent(event);
    if (!this.ensureConfigured()) return;

    await supabase.from('events').upsert({
      id: event.id,
      couple_id: this.coupleId,
      created_by: event.ownerId,
      type: event.eventType,
      title: event.ownerView.title,
      description: event.ownerView.subtitle,
      starts_at: event.actualStartAt || (event.date + 'T' + (event.time || '20:00') + ':00'),
      visibility: event.visibility,
      reveal_policy: event.revealPolicy,
      updated_at: new Date().toISOString(),
    });
  }

  async updateEvent(id: string, patch: Partial<CoupleEvent>): Promise<void> {
    await defaultLocalRepository.updateEvent(id, patch);
    if (!this.ensureConfigured()) return;

    const payload: any = { updated_at: new Date().toISOString() };
    if (patch.ownerView?.title) payload.title = patch.ownerView.title;
    if (patch.ownerView?.subtitle) payload.description = patch.ownerView.subtitle;

    await supabase.from('events').update(payload).eq('id', id);
  }

  async deleteEvent(id: string): Promise<void> {
    await defaultLocalRepository.deleteEvent(id);
    if (!this.ensureConfigured()) return;

    await supabase.from('events').delete().eq('id', id);
  }

  async getRitualEntries(): Promise<RitualSeed[]> {
    if (!this.ensureConfigured()) return defaultLocalRepository.getRitualEntries();
    const { data, error } = await supabase
      .from('ritual_entries')
      .select('*')
      .eq('couple_id', this.coupleId!)
      .order('created_at', { ascending: false });

    if (error || !data) return defaultLocalRepository.getRitualEntries();
    return data.map((r: any) => ({
      id: r.id,
      coupleId: r.couple_id,
      authorId: r.created_by,
      date: r.date,
      type: r.type,
      title: r.title,
      body: r.body,
      mood: r.mood,
      createdAt: r.created_at,
    }));
  }

  async saveRitualEntry(entry: RitualSeed): Promise<void> {
    await defaultLocalRepository.saveRitualEntry(entry);
    if (!this.ensureConfigured()) return;

    await supabase.from('ritual_entries').upsert({
      id: entry.id,
      couple_id: this.coupleId,
      created_by: entry.authorId,
      date: entry.date,
      type: entry.type,
      title: entry.title,
      body: entry.body,
      mood: entry.mood,
    });
  }

  async getFeelings(): Promise<FeelingEntry[]> {
    return defaultLocalRepository.getFeelings();
  }

  async saveFeeling(entry: FeelingEntry): Promise<void> {
    await defaultLocalRepository.saveFeeling(entry);
  }

  async getMapPlaces(): Promise<AndreaMapPlace[]> {
    return defaultLocalRepository.getMapPlaces();
  }

  async saveMapPlace(place: AndreaMapPlace): Promise<void> {
    await defaultLocalRepository.saveMapPlace(place);
  }

  async exportAllData(): Promise<string> {
    return defaultLocalRepository.exportAllData();
  }

  async importAllData(jsonString: string): Promise<{ success: boolean; importedKeys: number; error?: string }> {
    return defaultLocalRepository.importAllData(jsonString);
  }

  async clearAllData(): Promise<void> {
    return defaultLocalRepository.clearAllData();
  }
}
