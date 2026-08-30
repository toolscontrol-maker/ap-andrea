import { loadGoogleMapsSDK, GOOGLE_MAPS_API_KEY } from '../lib/googleMaps';

export interface GeocodingResult {
  id: string;
  name: string;
  formattedAddress: string;
  city?: string;
  country?: string;
  coordinates: [number, number]; // [longitude, latitude] !!
  featureType: string;
  relevance: number;
  category?: string;
  placeId?: string;
  rating?: number;
  userRatingsTotal?: number;
  photoUrl?: string;
}

export interface SearchOptions {
  proximity?: [number, number]; // [longitude, latitude]
  country?: string; // e.g. 'es'
  types?: string;
}

/**
 * Search places using Google Places Autocomplete / Geocoder
 */
export async function searchGooglePlaces(
  query: string,
  options?: SearchOptions
): Promise<GeocodingResult[]> {
  const q = query.trim();
  if (!q) return [];

  try {
    const googleMaps = await loadGoogleMapsSDK();
    if (!googleMaps) {
      return searchGooglePlacesViaRest(q, options);
    }

    const geocoder = new googleMaps.Geocoder();
    const centerLat = options?.proximity ? options.proximity[1] : 39.4699;
    const centerLng = options?.proximity ? options.proximity[0] : -0.3763;

    return new Promise((resolve) => {
      geocoder.geocode(
        {
          address: q,
          componentRestrictions: { country: options?.country || 'es' },
          bounds: new googleMaps.LatLngBounds(
            new googleMaps.LatLng(centerLat - 0.25, centerLng - 0.25),
            new googleMaps.LatLng(centerLat + 0.25, centerLng + 0.25)
          ),
        },
        (results: any[], status: string) => {
          if (status !== 'OK' || !results || results.length === 0) {
            resolve([]);
            return;
          }

          const parsed: GeocodingResult[] = results.slice(0, 6).map((item, index) => {
            const lat = item.geometry.location.lat();
            const lng = item.geometry.location.lng();
            const addressComponents = item.address_components || [];

            let city = 'Valencia';
            let country = 'España';

            for (const comp of addressComponents) {
              if (comp.types.includes('locality')) city = comp.long_name;
              if (comp.types.includes('country')) country = comp.long_name;
            }

            const name = item.formatted_address.split(',')[0] || q;

            return {
              id: item.place_id || ('gplace-' + index + '-' + Date.now()),
              placeId: item.place_id,
              name,
              formattedAddress: item.formatted_address,
              city,
              country,
              coordinates: [lng, lat],
              featureType: item.types?.[0] || 'poi',
              relevance: 1 - index * 0.1,
            };
          });

          resolve(parsed);
        }
      );
    });
  } catch (err) {
    console.warn('[GooglePlaces] Search failed, fallback:', err);
    return searchGooglePlacesViaRest(q, options);
  }
}

/**
 * Fallback REST search
 */
async function searchGooglePlacesViaRest(
  query: string,
  options?: SearchOptions
): Promise<GeocodingResult[]> {
  try {
    const lat = options?.proximity ? options.proximity[1] : 39.4699;
    const lng = options?.proximity ? options.proximity[0] : -0.3763;
    const url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(query) + '&components=country:es&key=' + GOOGLE_MAPS_API_KEY;

    const res = await fetch(url);
    const data = await res.json();
    if (!data.results || data.results.length === 0) return [];

    return data.results.slice(0, 6).map((item: any, idx: number) => {
      const lat = item.geometry.location.lat;
      const lng = item.geometry.location.lng;
      return {
        id: item.place_id || ('rest-' + idx),
        name: item.formatted_address.split(',')[0] || query,
        formattedAddress: item.formatted_address,
        city: 'Valencia',
        country: 'España',
        coordinates: [lng, lat],
        featureType: item.types?.[0] || 'poi',
        relevance: 1,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Reverse Geocode: [lng, lat] -> Real address string
 */
export async function reverseGeocodeGoogleCoordinates(
  coordinates: [number, number]
): Promise<GeocodingResult | null> {
  const [lng, lat] = coordinates;

  try {
    const googleMaps = await loadGoogleMapsSDK();
    if (!googleMaps) return null;

    const geocoder = new googleMaps.Geocoder();

    return new Promise((resolve) => {
      geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
        if (status !== 'OK' || !results || results.length === 0) {
          resolve(null);
          return;
        }

        const best = results[0];
        let city = 'Valencia';
        let country = 'España';

        for (const comp of best.address_components || []) {
          if (comp.types.includes('locality')) city = comp.long_name;
          if (comp.types.includes('country')) country = comp.long_name;
        }

        resolve({
          id: best.place_id || ('rev-' + Date.now()),
          name: best.formatted_address.split(',')[0] || 'Punto seleccionado',
          formattedAddress: best.formatted_address,
          city,
          country,
          coordinates: [lng, lat],
          featureType: best.types?.[0] || 'address',
          relevance: 1.0,
        });
      });
    });
  } catch (err) {
    console.warn('[GooglePlaces] Reverse geocoding failed:', err);
    return null;
  }
}
