import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';

export interface NotificationPreferences {
  enabled: boolean;
  hearts: boolean;
  wishes: boolean;
  surprises: boolean;
  daily_checkin: boolean;
  weekly_album: boolean;
  calendar: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  hearts: true,
  wishes: true,
  surprises: true,
  daily_checkin: true,
  weekly_album: true,
  calendar: true,
};

const STORAGE_KEY_PREFS = '@andrea_notification_preferences_v1';
const STORAGE_KEY_TOKEN = '@andrea_push_subscription_token_v1';

class PushNotificationService {
  private preferences: NotificationPreferences = DEFAULT_NOTIFICATION_PREFERENCES;
  private isSupported: boolean = false;
  private isRegistered: boolean = false;

  constructor() {
    this.checkSupport();
    this.loadPreferences();
  }

  public checkSupport(): boolean {
    if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
      this.isSupported = true;
    } else {
      this.isSupported = false;
    }
    return this.isSupported;
  }

  public getPermissionStatus(): NotificationPermission {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  }

  public async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!this.checkSupport()) return null;
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      this.isRegistered = true;
      return registration;
    } catch (err) {
      console.warn('⚠️ [PushNotificationService] Error registrando service worker:', err);
      return null;
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (!this.checkSupport()) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await this.registerServiceWorker();
        this.preferences.enabled = true;
        await this.savePreferences(this.preferences);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('⚠️ [PushNotificationService] Error solicitando permiso:', err);
      return false;
    }
  }

  public async loadPreferences(): Promise<NotificationPreferences> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY_PREFS);
      if (raw) {
        this.preferences = { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(raw) };
      }
    } catch {
      this.preferences = DEFAULT_NOTIFICATION_PREFERENCES;
    }
    return this.preferences;
  }

  public async savePreferences(prefs: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    this.preferences = { ...this.preferences, ...prefs };
    try {
      await AsyncStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(this.preferences));
    } catch (err) {
      console.warn('⚠️ [PushNotificationService] Error guardando preferencias:', err);
    }
    return this.preferences;
  }

  public getPreferences(): NotificationPreferences {
    return this.preferences;
  }

  public async showLocalNotification(params: {
    title: string;
    body: string;
    tag?: string;
    url?: string;
    category?: keyof Omit<NotificationPreferences, 'enabled'>;
  }): Promise<void> {
    if (!this.preferences.enabled) return;
    if (params.category && !this.preferences[params.category]) return;

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        // Try Service Worker registration first (required for iOS PWA & modern browsers)
        if ('serviceWorker' in navigator) {
          try {
            let reg: ServiceWorkerRegistration | null = null;
            try {
              reg = await navigator.serviceWorker.ready;
            } catch {}

            if (!reg) {
              reg = await navigator.serviceWorker.getRegistration();
            }

            if (!reg) {
              reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
            }

            if (reg && typeof reg.showNotification === 'function') {
              await reg.showNotification(params.title, {
                body: params.body,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: params.tag || `andrea-${Date.now()}`,
                data: { url: params.url || '/' },
                vibrate: [200, 100, 200],
              } as any);
              return;
            }
          } catch (swErr) {
            console.warn('⚠️ [PushNotificationService] SW Notification error:', swErr);
          }
        }

        // Fallback to window.Notification if constructor is available
        try {
          if (typeof window.Notification === 'function') {
            new Notification(params.title, {
              body: params.body,
              icon: '/favicon.ico',
              tag: params.tag || `andrea-${Date.now()}`,
            });
          }
        } catch (winErr) {
          console.warn('⚠️ [PushNotificationService] Window Notification error:', winErr);
        }
      }
    }
  }

  public async triggerTestNotification(): Promise<void> {
    const perm = await this.requestPermission();
    if (perm) {
      await this.showLocalNotification({
        title: '❤️ Andrea & Tonet',
        body: '¡Notificaciones configuradas con éxito en tu iPhone! Recibirás aquí cada latido, sorpresa y deseo.',
        tag: 'test-notification',
      });
    }
  }
}

export const pushNotificationService = new PushNotificationService();
