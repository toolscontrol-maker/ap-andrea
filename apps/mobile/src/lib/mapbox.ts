import Constants from 'expo-constants';
import Mapbox from '@rnmapbox/maps';

const extra = Constants.expoConfig?.extra ?? {};

export const MAPBOX_ACCESS_TOKEN = (process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  extra.mapboxAccessToken) as string | undefined;

export const MAPBOX_STYLE_URL =
  (process.env.EXPO_PUBLIC_MAPBOX_STYLE_URL ||
    extra.mapboxStyleUrl ||
    'mapbox://styles/mapbox/light-v11') as string;

// Safe runtime validation in development
if (!MAPBOX_ACCESS_TOKEN && __DEV__) {
  throw new Error(
    'Falta EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN. Configúralo en apps/mobile/.env.'
  );
}

if (MAPBOX_ACCESS_TOKEN && Mapbox && Mapbox.setAccessToken) {
  Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);
}

export { Mapbox };
