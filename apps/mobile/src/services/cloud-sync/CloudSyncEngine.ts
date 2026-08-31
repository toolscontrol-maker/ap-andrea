import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { WishlistItem, Place, CoupleEvent, RitualSeed } from '@andrea/types';
import { DevUser } from '../../context/DevContext';
import { Platform } from 'react-native';

export type SyncEntity = 'profiles' | 'wishes' | 'saved_places' | 'map_places' | 'couple_events' | 'ritual_seeds' | 'feelings';

export interface CloudSyncListener {
  onEntityChange: (entity: SyncEntity, eventType: 'INSERT' | 'UPDATE' | 'DELETE', payload: any) => void;
  onConnectionChange: (isConnected: boolean, statusText: string) => void;
}

const COUPLE_ID = 'andrea-tonet';

function encodePlaceMetadata(place: any): string {
  const meta = {
    startDate: place.startDate,
    endDate: place.endDate,
    isOngoing: place.isOngoing,
    stageSummary: place.stageSummary,
    hasDateRange: place.hasDateRange,
    dateRangeEnd: place.dateRangeEnd,
    emotionTag: place.emotionTag,
    invitedBy: place.invitedBy,
    destination1: place.destination1,
    destination2: place.destination2,
    accommodation: place.accommodation,
    tripDurationDays: place.tripDurationDays,
    visitedPlaces: place.visitedPlaces,
  };
  return JSON.stringify(meta);
}

function decodePlaceMetadata(moodTag: any): any {
  if (!moodTag) return {};
  if (typeof moodTag === 'object') return moodTag;
  try {
    if (typeof moodTag === 'string' && moodTag.startsWith('{')) {
      return JSON.parse(moodTag);
    }
  } catch {}
  return { emotionTag: moodTag };
}

class CloudSyncEngineService {
  private channel: any = null;
  private listeners: Set<CloudSyncListener> = new Set();
  private isConnected: boolean = false;
  private syncStatus: string = 'Iniciando...';
  private broadcastChannel: any = null;

  constructor() {
    this.initBroadcastChannel();
  }

  private initBroadcastChannel() {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('andrea_tonet_p2p_sync');
        this.broadcastChannel.onmessage = (event: MessageEvent) => {
          if (event.data && event.data.entity && event.data.eventType) {
            this.notifyListeners(event.data.entity, event.data.eventType, event.data.payload);
          }
        };
      } catch (e) {
        console.warn('[CloudSync] BroadcastChannel not supported in this environment');
      }
    }
  }

  public subscribe(listener: CloudSyncListener) {
    this.listeners.add(listener);
    listener.onConnectionChange(this.isConnected, this.syncStatus);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(entity: SyncEntity, eventType: 'INSERT' | 'UPDATE' | 'DELETE', payload: any) {
    for (const l of this.listeners) {
      try {
        l.onEntityChange(entity, eventType, payload);
      } catch (e) {
        console.error('[CloudSync] Error notifying listener:', e);
      }
    }
  }

  private setConnectionState(connected: boolean, status: string) {
    this.isConnected = connected;
    this.syncStatus = status;
    for (const l of this.listeners) {
      try {
        l.onConnectionChange(connected, status);
      } catch (e) {
        console.error('[CloudSync] Error notifying connection listener:', e);
      }
    }
  }

  // ── Database to TypeScript CamelCase Mappers ──
  public mapProfileFromDb(row: any): DevUser {
    return {
      id: row.id,
      name: row.name || (row.role_key === 'user1' ? 'Tonet' : 'Andrea'),
      avatar: row.avatar || (row.name ? row.name[0].toUpperCase() : (row.role_key === 'user1' ? 'T' : 'A')),
      avatarPhoto: row.avatar_photo || row.avatarPhoto || undefined,
      roleDescription: row.role_description || row.roleDescription || '',
    };
  }

  public mapWishFromDb(row: any): WishlistItem {
    return {
      id: row.id,
      coupleId: row.couple_id || COUPLE_ID,
      ownerUserId: row.owner_user_id || row.ownerUserId,
      createdByUserId: row.created_by_user_id || row.createdByUserId,
      title: row.title,
      description: row.description,
      type: row.type || 'other',
      status: row.status || 'dreaming',
      visibility: row.visibility || 'shared',
      brand: row.brand,
      sourceUrl: row.source_url || row.sourceUrl,
      externalImageUrl: row.external_image_url || row.externalImageUrl,
      images: Array.isArray(row.images) ? row.images : [],
      estimatedPrice: row.estimated_price !== null && row.estimated_price !== undefined ? Number(row.estimated_price) : undefined,
      currency: row.currency || 'EUR',
      priceNote: row.price_note || row.priceNote,
      color: row.color,
      size: row.size,
      desiredFor: row.desired_for || row.desiredFor,
      occasion: row.occasion,
      tags: Array.isArray(row.tags) ? row.tags : [],
      isForSelf: row.is_for_self !== undefined ? row.is_for_self : true,
      phoneNumber: row.phone_number || row.phoneNumber,
      restaurantId: row.restaurant_id || row.restaurantId,
      createdAt: row.created_at || row.createdAt || new Date().toISOString(),
      updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
    };
  }

  public mapSavedPlaceFromDb(row: any): Place {
    return {
      id: row.id,
      coupleId: row.couple_id || COUPLE_ID,
      createdByUserId: row.created_by_user_id || row.createdByUserId,
      name: row.name,
      category: row.category || 'restaurant',
      status: row.status || 'favorite',
      address: row.address,
      city: row.city || 'Valencia',
      country: row.country || 'España',
      countryCode: row.country_code || row.countryCode || 'ES',
      phoneNumber: row.phone_number || row.phoneNumber,
      googleMapsUrl: row.google_maps_url || row.googleMapsUrl,
      latitude: Number(row.latitude) || 39.4699,
      longitude: Number(row.longitude) || -0.3763,
      cuisine: Array.isArray(row.cuisine) ? row.cuisine : [],
      priceLevel: row.price_level !== undefined ? row.price_level : 2,
      vibe: row.vibe || 'romantico',
      tags: Array.isArray(row.tags) ? row.tags : [],
      ratingPersonal: row.rating_personal !== undefined ? Number(row.rating_personal) : 5,
      note: row.note,
      coverImageUrl: row.cover_image_url || row.coverImageUrl || '',
      photos: Array.isArray(row.photos) ? row.photos : [],
      visits: Array.isArray(row.visits) ? row.visits : [],
      createdAt: row.created_at || row.createdAt || new Date().toISOString(),
      updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
    };
  }

  public mapMapPlaceFromDb(row: any): any {
    const meta = decodePlaceMetadata(row.mood_tag || row.moodTag);
    return {
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      cityName: row.city_name || row.cityName || 'Valencia',
      country: row.country || 'España',
      countryCode: row.country_code || row.countryCode || 'ES',
      lat: Number(row.lat) || 39.4699,
      lng: Number(row.lng) || -0.3763,
      date: row.date,
      story: row.story,
      category: row.category || 'memory',
      moodTag: row.mood_tag || row.moodTag || 'love',
      photos: Array.isArray(row.photos) ? row.photos : [],
      authorId: row.author_id || row.authorId,
      locationPrecision: row.location_precision || row.locationPrecision || 'exact',
      visibility: row.visibility || 'couple',
      isMilestone: row.is_milestone !== undefined ? row.is_milestone : false,
      startDate: meta.startDate,
      endDate: meta.endDate,
      isOngoing: meta.isOngoing,
      stageSummary: meta.stageSummary,
      hasDateRange: meta.hasDateRange,
      dateRangeEnd: meta.dateRangeEnd,
      emotionTag: meta.emotionTag,
      invitedBy: meta.invitedBy,
      destination1: meta.destination1,
      destination2: meta.destination2,
      accommodation: meta.accommodation,
      tripDurationDays: meta.tripDurationDays,
      visitedPlaces: meta.visitedPlaces,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
    };
  }

  public mapRitualSeedFromDb(row: any): RitualSeed {
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

  public mapEventFromDb(row: any): CoupleEvent {
    return {
      id: row.id,
      coupleId: row.couple_id || COUPLE_ID,
      ownerId: row.owner_id || row.ownerId,
      partnerId: row.partner_id || row.partnerId,
      eventType: row.event_type || row.eventType,
      date: row.date,
      time: row.time,
      actualStartAt: row.actual_start_at || row.actualStartAt,
      ownerView: row.owner_view || row.ownerView || {},
      partnerView: row.partner_view || row.partnerView || {},
      revealPolicy: row.reveal_policy || row.revealPolicy || 'immediate',
      visibility: row.visibility || 'shared',
      status: row.status || 'completed',
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
    };
  }

  /**
   * Initializes Supabase Realtime WebSocket connection and registers event listeners
   */
  public async initializeRealtime() {
    try {
      const configured = this.isSupabaseConfigured();

      if (!configured) {
        this.setConnectionState(true, 'Almacenamiento Local Seguro (P2P Activo)');
        return;
      }

      this.setConnectionState(false, 'Conectando a la nube...');

      if (this.channel) {
        supabase.removeChannel(this.channel);
      }

      this.channel = supabase
        .channel('andrea-tonet-cloud-room')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', filter: `couple_id=eq.${COUPLE_ID}` },
          (payload: any) => {
            const table = payload.table as SyncEntity;
            const eventType = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE';
            const rawRecord = eventType === 'DELETE' ? payload.old : payload.new;
            let mappedRecord = rawRecord;
            if (rawRecord) {
              if (table === 'profiles') mappedRecord = this.mapProfileFromDb(rawRecord);
              else if (table === 'wishes') mappedRecord = this.mapWishFromDb(rawRecord);
              else if (table === 'saved_places') mappedRecord = this.mapSavedPlaceFromDb(rawRecord);
              else if (table === 'map_places') mappedRecord = this.mapMapPlaceFromDb(rawRecord);
              else if (table === 'couple_events') mappedRecord = this.mapEventFromDb(rawRecord);
              else if (table === 'ritual_seeds') mappedRecord = this.mapRitualSeedFromDb(rawRecord);
            }
            this.notifyListeners(table, eventType, mappedRecord);
          }
        )
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            this.setConnectionState(true, 'En la nube (Tiempo Real Activo)');
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            this.setConnectionState(false, 'Reconectando con la nube...');
          }
        });
    } catch (err: any) {
      console.warn('[CloudSync] Realtime initialization error:', err);
      this.setConnectionState(true, 'Almacenamiento Local Seguro');
    }
  }

  /**
   * Fetches full cloud state for cold-start hydration
   */
  public async fetchFullCloudState() {
    if (!this.isSupabaseConfigured()) return null;
    try {
      const [
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
      ]);

      let user1: DevUser | null = null;
      let user2: DevUser | null = null;

      if (profilesData && profilesData.length > 0) {
        for (const p of profilesData) {
          const mapped = this.mapProfileFromDb(p);
          if (p.role_key === 'user1' || p.name?.toLowerCase().includes('tonet')) {
            user1 = mapped;
          } else if (p.role_key === 'user2' || p.name?.toLowerCase().includes('andrea')) {
            user2 = mapped;
          }
        }
      }

      return {
        users: user1 || user2 ? { user1, user2 } : null,
        wishes: wishesData && wishesData.length > 0 ? wishesData.map(w => this.mapWishFromDb(w)) : null,
        savedPlaces: placesData && placesData.length > 0 ? placesData.map(p => this.mapSavedPlaceFromDb(p)) : null,
        mapPlaces: mapPlacesData && mapPlacesData.length > 0 ? mapPlacesData.map(m => this.mapMapPlaceFromDb(m)) : null,
        coupleEvents: eventsData && eventsData.length > 0 ? eventsData.map(e => this.mapEventFromDb(e)) : null,
        ritualSeeds: ritualSeedsData && ritualSeedsData.length > 0 ? ritualSeedsData.map(s => this.mapRitualSeedFromDb(s)) : null,
      };
    } catch (e) {
      console.warn('[CloudSync] Error fetching full cloud state:', e);
      return null;
    }
  }

  /**
   * Broadcasts mutation locally and syncs to Supabase
   */
  private broadcastLocal(entity: SyncEntity, eventType: 'INSERT' | 'UPDATE' | 'DELETE', payload: any) {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ entity, eventType, payload });
      } catch (e) {
        // ignore
      }
    }
  }

  // ── 1. WISHES ──
  public async syncWish(wish: WishlistItem) {
    this.broadcastLocal('wishes', 'UPDATE', wish);
    try {
      if (this.isSupabaseConfigured()) {
        await supabase.from('wishes').upsert({
          id: wish.id,
          couple_id: COUPLE_ID,
          owner_user_id: wish.ownerUserId,
          created_by_user_id: wish.createdByUserId,
          title: wish.title,
          description: wish.description,
          type: wish.type,
          status: wish.status,
          visibility: wish.visibility,
          brand: wish.brand,
          source_url: wish.sourceUrl,
          external_image_url: wish.externalImageUrl,
          images: wish.images,
          estimated_price: wish.estimatedPrice,
          currency: wish.currency,
          price_note: wish.priceNote,
          color: wish.color,
          size: wish.size,
          desired_for: wish.desiredFor,
          occasion: wish.occasion,
          tags: wish.tags,
          is_for_self: wish.isForSelf,
          phone_number: wish.phoneNumber,
          restaurant_id: wish.restaurantId,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      }
    } catch (e) {
      console.warn('[CloudSync] Wish sync error:', e);
    }
  }

  public async deleteWish(wishId: string) {
    this.broadcastLocal('wishes', 'DELETE', { id: wishId });
    try {
      if (this.isSupabaseConfigured()) {
        await supabase.from('wishes').delete().eq('id', wishId);
      }
    } catch (e) {
      console.warn('[CloudSync] Wish delete error:', e);
    }
  }

  // ── 2. PLACES / RESTAURANTS ──
  public async syncSavedPlace(place: Place) {
    let coverUrl = place.coverImageUrl;
    if (coverUrl && (coverUrl.startsWith('data:') || coverUrl.startsWith('blob:'))) {
      try {
        coverUrl = await this.uploadMediaImage(coverUrl, `place_cover_${place.id}_${Date.now()}.jpg`);
        place.coverImageUrl = coverUrl;
      } catch (err) {
        console.warn('[CloudSync] Error uploading place cover:', err);
      }
    }

    let uploadedPhotos: string[] = [];
    const rawPhotos = place.photos && place.photos.length > 0 ? place.photos : (coverUrl ? [coverUrl] : []);
    for (let i = 0; i < rawPhotos.length; i++) {
      let p = rawPhotos[i];
      if (p && (p.startsWith('data:') || p.startsWith('blob:'))) {
        try {
          p = await this.uploadMediaImage(p, `place_photo_${place.id}_${i}_${Date.now()}.jpg`);
        } catch (err) {
          console.warn('[CloudSync] Error uploading place photo:', err);
        }
      }
      if (p) uploadedPhotos.push(p);
    }
    place.photos = uploadedPhotos;

    this.broadcastLocal('saved_places', 'UPDATE', place);
    try {
      if (this.isSupabaseConfigured()) {
        await supabase.from('saved_places').upsert({
          id: place.id,
          couple_id: COUPLE_ID,
          created_by_user_id: place.createdByUserId,
          name: place.name,
          category: place.category,
          status: place.status,
          address: place.address,
          city: place.city,
          country: place.country,
          country_code: place.countryCode,
          phone_number: place.phoneNumber,
          google_maps_url: place.googleMapsUrl,
          latitude: place.latitude,
          longitude: place.longitude,
          cuisine: place.cuisine,
          price_level: place.priceLevel,
          vibe: place.vibe,
          tags: place.tags,
          rating_personal: place.ratingPersonal,
          note: place.note,
          cover_image_url: coverUrl || '',
          photos: uploadedPhotos,
          visits: place.visits,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      }
    } catch (e) {
      console.warn('[CloudSync] Place sync error:', e);
    }
  }

  public async deleteSavedPlace(placeId: string) {
    this.broadcastLocal('saved_places', 'DELETE', { id: placeId });
    try {
      if (this.isSupabaseConfigured()) {
        await supabase.from('saved_places').delete().eq('id', placeId);
      }
    } catch (e) {
      console.warn('[CloudSync] Place delete error:', e);
    }
  }

  // ── 3. MAP PLACES / ATLAS ──
  public async syncMapPlace(mapPlace: any) {
    let coverUrl = mapPlace.imageUrl || (mapPlace.photos && mapPlace.photos[0]) || null;
    if (coverUrl && (coverUrl.startsWith('data:') || coverUrl.startsWith('blob:'))) {
      try {
        coverUrl = await this.uploadMediaImage(coverUrl, `map_cover_${mapPlace.id}_${Date.now()}.jpg`);
        mapPlace.imageUrl = coverUrl;
      } catch (err) {
        console.warn('[CloudSync] Error uploading map cover:', err);
      }
    }

    let uploadedPhotos: string[] = [];
    const rawPhotos = mapPlace.photos && mapPlace.photos.length > 0 ? mapPlace.photos : (coverUrl ? [coverUrl] : []);
    for (let i = 0; i < rawPhotos.length; i++) {
      let p = rawPhotos[i];
      if (p && (p.startsWith('data:') || p.startsWith('blob:'))) {
        try {
          p = await this.uploadMediaImage(p, `map_photo_${mapPlace.id}_${i}_${Date.now()}.jpg`);
        } catch (err) {
          console.warn('[CloudSync] Error uploading map photo:', err);
        }
      }
      if (p) uploadedPhotos.push(p);
    }
    mapPlace.photos = uploadedPhotos;
    if (!mapPlace.imageUrl && uploadedPhotos.length > 0) {
      mapPlace.imageUrl = uploadedPhotos[0];
    }

    this.broadcastLocal('map_places', 'UPDATE', mapPlace);
    try {
      if (this.isSupabaseConfigured()) {
        const metaStr = encodePlaceMetadata(mapPlace);
        await supabase.from('map_places').upsert({
          id: mapPlace.id,
          couple_id: COUPLE_ID,
          author_id: mapPlace.authorId,
          title: mapPlace.title,
          subtitle: mapPlace.subtitle || mapPlace.formattedAddress,
          city_name: mapPlace.city || mapPlace.cityName || 'Valencia',
          country: 'España',
          country_code: 'ES',
          lat: mapPlace.latitude || mapPlace.lat,
          lng: mapPlace.longitude || mapPlace.lng,
          date: mapPlace.date,
          story: mapPlace.description || mapPlace.story,
          category: mapPlace.type || mapPlace.category,
          mood_tag: metaStr,
          photos: uploadedPhotos,
          location_precision: mapPlace.precision || mapPlace.locationPrecision || 'exact',
          visibility: mapPlace.visibility || 'couple',
          is_milestone: mapPlace.isMilestone ?? false,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      }
    } catch (e) {
      console.warn('[CloudSync] Map place sync error:', e);
    }
  }

  public async deleteMapPlace(placeId: string) {
    this.broadcastLocal('map_places', 'DELETE', { id: placeId });
    try {
      if (this.isSupabaseConfigured()) {
        await supabase.from('map_places').delete().eq('id', placeId);
      }
    } catch (e) {
      console.warn('[CloudSync] Map place delete error:', e);
    }
  }

  // ── 4. COUPLE EVENTS ──
  public async syncCoupleEvent(event: CoupleEvent) {
    this.broadcastLocal('couple_events', 'UPDATE', event);
    try {
      if (this.isSupabaseConfigured()) {
        await supabase.from('couple_events').upsert({
          id: event.id,
          couple_id: COUPLE_ID,
          owner_id: event.ownerId,
          partner_id: event.partnerId,
          event_type: event.eventType,
          date: event.date,
          time: event.time,
          actual_start_at: event.actualStartAt,
          owner_view: event.ownerView,
          partner_view: event.partnerView,
          reveal_policy: event.revealPolicy,
          visibility: event.visibility,
          status: event.status,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      }
    } catch (e) {
      console.warn('[CloudSync] Event sync error:', e);
    }
  }

  // ── 6. RITUAL SEEDS & DAILY CHECK-INS ──
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

  public async syncDailyMeetingCheckIn(checkIn: any) {
    try {
      if (this.isSupabaseConfigured()) {
        const seedPayload: RitualSeed = {
          id: `checkin-${checkIn.date}`,
          coupleId: COUPLE_ID,
          authorId: 'system',
          date: checkIn.date,
          type: 'daily_reflection',
          title: checkIn.confirmedMet ? '🖤 Encuentro confirmado' : checkIn.wontSee ? '⏳ Día sin encuentro' : 'Registro diario',
          body: JSON.stringify(checkIn),
          mood: checkIn.confirmedMet ? 'love' : 'calm',
          isSharedWithPartner: true,
          partnerResponded: Boolean(checkIn.tonetResponse && checkIn.andreaResponse),
          createdAt: checkIn.updatedAt || new Date().toISOString(),
        };
        await this.syncRitualSeed(seedPayload);
      }
    } catch (e) {
      console.warn('[CloudSync] Check-in sync error:', e);
    }
  }

  public async syncWeeklyPhoto(weekEntry: any) {
    try {
      if (this.isSupabaseConfigured()) {
        const seedPayload: RitualSeed = {
          id: `weekly-photo-${weekEntry.weekId}`,
          coupleId: COUPLE_ID,
          authorId: 'system',
          date: new Date().toISOString().split('T')[0],
          type: 'photo_prompt',
          title: `📸 Semana en Fotos: ${weekEntry.weekRangeLabel}`,
          body: JSON.stringify(weekEntry),
          photoUrl: weekEntry.photoTogether || weekEntry.photoTonet || weekEntry.photoAndrea,
          imageUrl: weekEntry.photoTogether || weekEntry.photoTonet || weekEntry.photoAndrea,
          mood: 'love',
          isSharedWithPartner: true,
          partnerResponded: true,
          createdAt: weekEntry.updatedAt || new Date().toISOString(),
        };
        await this.syncRitualSeed(seedPayload);
      }
    } catch (e) {
      console.warn('[CloudSync] Weekly photo sync error:', e);
    }
  }

  public async syncHeartbeat(senderUserId: string, senderName: string) {
    const payload = {
      senderUserId,
      senderName,
      timestamp: Date.now(),
    };
    this.broadcastLocal('feelings', 'INSERT', payload);
    try {
      if (this.isSupabaseConfigured()) {
        const seedPayload: RitualSeed = {
          id: `heartbeat-${Date.now()}`,
          coupleId: COUPLE_ID,
          authorId: senderUserId,
          date: new Date().toISOString().split('T')[0],
          type: 'daily_reflection',
          title: `💓 Latido de amor de ${senderName}`,
          body: `Latido enviado con amor`,
          mood: 'love',
          isSharedWithPartner: true,
          partnerResponded: false,
          createdAt: new Date().toISOString(),
        };
        await this.syncRitualSeed(seedPayload);
      }
    } catch (e) {
      console.warn('[CloudSync] Heartbeat sync error:', e);
    }
  }

  // ── 5. PROFILES & PHOTOS ──
  public async syncUserProfile(userId: string, roleKey: 'user1' | 'user2', profile: Partial<DevUser>) {
    const photo = profile.avatarPhoto || (profile as any).avatar_photo || null;
    const name = profile.name || (roleKey === 'user1' ? 'Tonet' : 'Andrea');
    const avatar = profile.avatar || name[0].toUpperCase();

    const payloadToBroadcast = {
      id: userId,
      role_key: roleKey,
      name,
      avatar,
      avatarPhoto: photo || undefined,
      avatar_photo: photo || undefined,
      roleDescription: profile.roleDescription || '',
    };

    this.broadcastLocal('profiles', 'UPDATE', payloadToBroadcast);

    try {
      if (this.isSupabaseConfigured()) {
        await supabase.from('profiles').upsert({
          id: userId,
          couple_id: COUPLE_ID,
          role_key: roleKey,
          name,
          avatar,
          avatar_photo: photo,
          role_description: profile.roleDescription || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      }
    } catch (e) {
      console.warn('[CloudSync] Profile sync error:', e);
    }
  }

  /**
   * Upload image file to Supabase Storage and return public URL
   */
  public async uploadMediaImage(fileBase64OrUri: string, fileName: string): Promise<string> {
    try {
      if (!fileBase64OrUri || typeof fileBase64OrUri !== 'string') return fileBase64OrUri;

      // If it's already an uploaded HTTP URL from supabase storage, return directly
      if (fileBase64OrUri.startsWith('http://') || fileBase64OrUri.startsWith('https://')) {
        if (!fileBase64OrUri.includes('localhost') && !fileBase64OrUri.includes('127.0.0.1')) {
          return fileBase64OrUri;
        }
      }

      if (this.isSupabaseConfigured()) {
        const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `${COUPLE_ID}/${Date.now()}_${cleanName}`;
        
        // Handle data URI, blob URI, file URI, content URI, or ph URI
        if (
          fileBase64OrUri.startsWith('data:') ||
          fileBase64OrUri.startsWith('blob:') ||
          fileBase64OrUri.startsWith('file:') ||
          fileBase64OrUri.startsWith('content:') ||
          fileBase64OrUri.startsWith('ph:')
        ) {
          const res = await fetch(fileBase64OrUri);
          const blob = await res.blob();
          const contentType = blob.type || 'image/jpeg';
          const { error } = await supabase.storage.from('andrea-media').upload(filePath, blob, {
            contentType,
            upsert: true,
          });
          if (!error) {
            const { data } = supabase.storage.from('andrea-media').getPublicUrl(filePath);
            if (data?.publicUrl) {
              return data.publicUrl;
            }
          } else {
            console.warn('[CloudSync] Upload to storage failed:', error);
          }
        }
      }
    } catch (e) {
      console.warn('[CloudSync] Photo upload error, using direct URI:', e);
    }
    return fileBase64OrUri;
  }

  public async uploadMediaBlob(blobOrFile: Blob | File, fileName: string, contentType?: string): Promise<string> {
    try {
      if (this.isSupabaseConfigured()) {
        const filePath = `${COUPLE_ID}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${fileName}`;
        const type = contentType || (blobOrFile as any).type || 'image/jpeg';
        const { error } = await supabase.storage.from('andrea-media').upload(filePath, blobOrFile, {
          contentType: type,
          upsert: true,
        });
        if (!error) {
          const { data } = supabase.storage.from('andrea-media').getPublicUrl(filePath);
          return data.publicUrl;
        } else {
          console.warn('[CloudSync] Blob upload error from storage:', error);
        }
      }
    } catch (e) {
      console.warn('[CloudSync] Blob upload error:', e);
    }
    return '';
  }

  public isSupabaseConfigured(): boolean {
    return isSupabaseConfigured();
  }

  public getStatusText(): string {
    return this.syncStatus;
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }
}

export const CloudSyncEngine = new CloudSyncEngineService();
