import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const GOOGLE_MAPS_API_KEY =
  (process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
    extra.googleMapsApiKey ||
    'AIzaSyCoOQUfW0CwUpJGBElhUy2T3fy0_znH73Q') as string;

/**
 * Editorial Warm Quiet-Luxury Google Maps Styling
 * Tailored to match Andrea Design System (Cream, Sage, Soft Blush, Charcoal)
 */
export const ANDREA_GOOGLE_MAP_STYLES = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#FBF8F4' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6A5F68' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#FFFFFF' }, { weight: 3 }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3A2F38' }, { weight: 'bold' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#766B72' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#EAF2EB' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#5B7A62' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#FFFFFF' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: 'rgba(58, 47, 56, 0.08)' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#F5EFE8' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#EFE6DB' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: 'rgba(58, 47, 56, 0.12)' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#F0ECE8' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#E8F0F7' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#7D96A8' }],
  },
];

let googleMapsPromise: Promise<any> | null = null;

export function loadGoogleMapsSDK(): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.resolve(null);
  }

  if ((window as any).google && (window as any).google.maps) {
    return Promise.resolve((window as any).google.maps);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve((window as any).google.maps));
      existingScript.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = 'https://maps.googleapis.com/maps/api/js?key=' + GOOGLE_MAPS_API_KEY + '&libraries=places,geometry,marker&loading=async&v=weekly';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if ((window as any).google && (window as any).google.maps) {
        resolve((window as any).google.maps);
      } else {
        reject(new Error('Google Maps SDK loaded but google.maps is not defined.'));
      }
    };

    script.onerror = (err) => {
      console.error('[GoogleMaps] Error loading script:', err);
      reject(err);
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}
