import { MAPBOX_ACCESS_TOKEN } from '../lib/mapbox';

export interface GeocodingResult {
  id: string;
  name: string;
  formattedAddress: string;
  city?: string;
  country?: string;
  coordinates: [number, number]; // [longitude, latitude] !!
  featureType: string; // 'poi' | 'address' | 'neighborhood' | 'place' | 'locality'
  relevance: number;
  category?: string;
}

export interface SearchOptions {
  proximity?: [number, number]; // [longitude, latitude]
  country?: string; // e.g. 'ES'
  types?: string; // 'poi,address,neighborhood,place,locality'
}

export function getMapboxToken(): string {
  return (
    process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ||
    MAPBOX_ACCESS_TOKEN ||
    ''
  );
}

/**
 * Forward Geocoding: Text -> Real Mapbox Suggestions
 */
export async function searchMapboxPlaces(
  query: string,
  options?: SearchOptions
): Promise<GeocodingResult[]> {
  const q = query.trim();
  if (!q) return [];

  const token = getMapboxToken();
  if (!token) {
    console.warn('Mapbox access token is missing.');
    return [];
  }

  const params = new URLSearchParams({
    access_token: token,
    language: 'es',
    limit: '6',
    types: options?.types || 'poi,address,neighborhood,locality,place',
  });

  if (options?.proximity) {
    params.append('proximity', `${options.proximity[0]},${options.proximity[1]}`);
  } else {
    // Default proximity: Valencia, Spain [-0.3763, 39.4699]
    params.append('proximity', '-0.3763,39.4699');
  }

  if (options?.country) {
    params.append('country', options.country);
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    q
  )}.json?${params.toString()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn('Mapbox geocoding error:', res.status, res.statusText);
      return [];
    }
    const data = await res.json();
    if (!data.features || !Array.isArray(data.features)) {
      return [];
    }

    return data.features.map((f: any) => {
      // Find city / context
      const context = f.context || [];
      const placeContext = context.find((c: any) => c.id?.startsWith('place'));
      const countryContext = context.find((c: any) => c.id?.startsWith('country'));

      const city = placeContext?.text || (f.place_type?.includes('place') ? f.text : undefined);
      const country = countryContext?.text;

      return {
        id: f.id,
        name: f.text || f.place_name?.split(',')[0] || q,
        formattedAddress: f.place_name || f.text,
        city: city || 'Valencia',
        country: country || 'España',
        coordinates: f.center, // [longitude, latitude]
        featureType: f.place_type?.[0] || 'poi',
        relevance: f.relevance || 1,
        category: f.properties?.category,
      };
    });
  } catch (err) {
    console.error('Error in searchMapboxPlaces:', err);
    return [];
  }
}

/**
 * Reverse Geocoding: Coordinates [lng, lat] -> Structured Address / City
 */
export async function reverseGeocodeCoordinates(
  longitude: number,
  latitude: number
): Promise<{
  name: string;
  formattedAddress: string;
  city?: string;
  country?: string;
}> {
  const token = getMapboxToken();
  if (!token) {
    return {
      name: 'Ubicación seleccionada',
      formattedAddress: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
    };
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}&language=es&limit=1&types=address,poi,neighborhood,place`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return {
        name: 'Ubicación seleccionada',
        formattedAddress: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
      };
    }
    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) {
      return {
        name: 'Ubicación en el mapa',
        formattedAddress: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
      };
    }

    const context = feature.context || [];
    const placeContext = context.find((c: any) => c.id?.startsWith('place'));
    const countryContext = context.find((c: any) => c.id?.startsWith('country'));

    return {
      name: feature.text || feature.place_name?.split(',')[0] || 'Ubicación en el mapa',
      formattedAddress: feature.place_name,
      city: placeContext?.text || 'Valencia',
      country: countryContext?.text || 'España',
    };
  } catch (err) {
    console.error('Error in reverseGeocodeCoordinates:', err);
    return {
      name: 'Ubicación seleccionada',
      formattedAddress: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
    };
  }
}
