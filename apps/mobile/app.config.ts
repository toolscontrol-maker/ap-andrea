import { ExpoConfig, ConfigContext } from 'expo/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from apps/mobile/.env
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: 'Andrea',
    slug: 'andrea-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    scheme: 'andrea',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#FAF7F2',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.andrea.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FAF7F2',
      },
      package: 'com.andrea.app',
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
      output: 'single',
    },
    plugins: [
      'expo-router',
      'expo-secure-store',
      [
        '@rnmapbox/maps/app.plugin.js',
        {
          RNMapboxMapsImpl: 'mapbox',
          RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOADS_TOKEN,
        },
      ],
    ],
    extra: {
      ...config.extra,
      mapboxAccessToken: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN,
      mapboxStyleUrl:
        process.env.EXPO_PUBLIC_MAPBOX_STYLE_URL ||
        'mapbox://styles/mapbox/light-v11',
    },
  };
};
