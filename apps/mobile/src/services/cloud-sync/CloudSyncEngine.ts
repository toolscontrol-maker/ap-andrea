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

  /**
   * Initializes Supabase Realtime WebSocket connection
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
            const record = eventType === 'DELETE' ? payload.old : payload.new;
            this.notifyListeners(table, eventType, record);
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
    this.broadcastLocal('profiles', 'UPDATE', { id: userId, roleKey, ...profile });
    try {
      if (this.isSupabaseConfigured()) {
        await supabase.from('profiles').upsert({
          id: userId,
          couple_id: COUPLE_ID,
          role_key: roleKey,
          name: profile.name,
          avatar: profile.avatar,
          avatar_photo: profile.avatarPhoto,
          role_description: profile.roleDescription,
          updated_at: new Date().toISOString(),
        });
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
