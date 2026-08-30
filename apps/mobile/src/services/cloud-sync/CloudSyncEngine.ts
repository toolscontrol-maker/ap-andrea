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
      category: row.category || 'cita',
      moodTag: row.mood_tag || row.moodTag || 'love',
      photos: Array.isArray(row.photos) ? row.photos : [],
      authorId: row.author_id || row.authorId,
      locationPrecision: row.location_precision || row.locationPrecision || 'exact',
      visibility: row.visibility || 'couple',
      isMilestone: row.is_milestone !== undefined ? row.is_milestone : false,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
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
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('couple_id', COUPLE_ID),
        supabase.from('wishes').select('*').eq('couple_id', COUPLE_ID),
        supabase.from('saved_places').select('*').eq('couple_id', COUPLE_ID),
        supabase.from('map_places').select('*').eq('couple_id', COUPLE_ID),
        supabase.from('couple_events').select('*').eq('couple_id', COUPLE_ID),
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
        });
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
          cover_image_url: place.coverImageUrl,
          photos: place.photos,
          visits: place.visits,
          updated_at: new Date().toISOString(),
        });
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
    this.broadcastLocal('map_places', 'UPDATE', mapPlace);
    try {
      if (this.isSupabaseConfigured()) {
        await supabase.from('map_places').upsert({
          id: mapPlace.id,
          couple_id: COUPLE_ID,
          author_id: mapPlace.authorId,
          title: mapPlace.title,
          subtitle: mapPlace.subtitle,
          city_name: mapPlace.cityName,
          country: mapPlace.country,
          country_code: mapPlace.countryCode,
          lat: mapPlace.lat || mapPlace.latitude,
          lng: mapPlace.lng || mapPlace.longitude,
          date: mapPlace.date,
          story: mapPlace.story || mapPlace.description,
          category: mapPlace.category || mapPlace.type,
          mood_tag: mapPlace.moodTag,
          photos: mapPlace.photos || (mapPlace.imageUrl ? [mapPlace.imageUrl] : []),
          location_precision: mapPlace.locationPrecision || mapPlace.precision,
          visibility: mapPlace.visibility || 'couple',
          is_milestone: mapPlace.isMilestone ?? false,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('[CloudSync] Map place sync error:', e);
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
        });
      }
    } catch (e) {
      console.warn('[CloudSync] Event sync error:', e);
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
      if (this.isSupabaseConfigured()) {
        const filePath = `${COUPLE_ID}/${Date.now()}_${fileName}`;
        
        // If web data url
        if (fileBase64OrUri.startsWith('data:')) {
          const res = await fetch(fileBase64OrUri);
          const blob = await res.blob();
          const { error } = await supabase.storage.from('andrea-media').upload(filePath, blob, {
            contentType: blob.type || 'image/jpeg',
            upsert: true,
          });
          if (!error) {
            const { data } = supabase.storage.from('andrea-media').getPublicUrl(filePath);
            return data.publicUrl;
          }
        }
      }
    } catch (e) {
      console.warn('[CloudSync] Photo upload error, using direct URI:', e);
    }
    return fileBase64OrUri;
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
