import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const MAPBOX_ACCESS_TOKEN = (process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  extra.mapboxAccessToken) as string | undefined;

export const MAPBOX_STYLE_URL =
  (process.env.EXPO_PUBLIC_MAPBOX_STYLE_URL ||
    extra.mapboxStyleUrl ||
    'mapbox://styles/mapbox/light-v11') as string;

// Safe runtime validation in development
if (!MAPBOX_ACCESS_TOKEN && typeof __DEV__ !== 'undefined' && __DEV__) {
  console.warn(
    'Falta EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN. Configúralo en apps/mobile/.env.'
  );
}

// In web, @rnmapbox/maps is not used
export const Mapbox = null;
