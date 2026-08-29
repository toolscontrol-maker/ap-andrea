# 📱 React Native & `@rnmapbox/maps` Native Architecture

Comprehensive guide for configuring, building, and optimizing Mapbox in React Native, Expo Prebuild, and EAS Build on iOS and Android.

---

## 1. Expo Configuration (`app.config.ts`)

Configure `@rnmapbox/maps` plugin with secret download credentials:

```ts
import { ExpoConfig, ConfigContext } from 'expo/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  plugins: [
    'expo-router',
    [
      '@rnmapbox/maps/app.plugin.js',
      {
        RNMapboxMapsImpl: 'mapbox',
        RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOADS_TOKEN,
      },
    ],
  ],
  extra: {
    mapboxAccessToken: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN,
    mapboxStyleUrl: process.env.EXPO_PUBLIC_MAPBOX_STYLE_URL || 'mapbox://styles/mapbox/light-v11',
  },
});
```

---

## 2. Token Security & Credentials Management

- **Public Runtime Token (`pk.*`)**: Passed via `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`. Safe to bundle in client binary.
- **Private Downloads Token (`sk.*`)**:
  - Scope: `DOWNLOADS:READ`.
  - Android: Plugin injects token into `android/gradle.properties` (`MAPBOX_DOWNLOADS_TOKEN=sk...`).
  - iOS: Injects into `~/.netrc` for CocoaPods Mapbox download (`machine api.mapbox.com login mapbox password sk...`).
  - **NEVER** expose this token in client code or Git repository.

---

## 3. High-Performance Native Components

### A. Declarative MapView & Smooth Camera
```tsx
import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';

export function NativeMap({ places, onSelectPlace }) {
  const cameraRef = useRef<Mapbox.Camera>(null);

  const handleFlyTo = (longitude: number, latitude: number) => {
    cameraRef.current?.setCamera({
      centerCoordinate: [longitude, latitude],
      zoomLevel: 15,
      animationDuration: 1200,
      animationMode: 'flyTo',
    });
  };

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        styleURL="mapbox://styles/mapbox/light-v11"
        logoEnabled={false}
        attributionEnabled={false}
        compassEnabled={true}
        scaleBarEnabled={false}
      >
        <Mapbox.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: [-0.3763, 39.4699],
            zoomLevel: 12,
          }}
        />

        {/* High Performance ShapeSource with Clustering */}
        <Mapbox.ShapeSource
          id="places-source"
          cluster
          clusterRadius={50}
          clusterMaxZoomLevel={14}
          shape={placesGeoJSON}
          onPress={(e) => {
            const feature = e.features[0];
            if (feature?.properties?.id) {
              onSelectPlace(feature.properties.id);
            }
          }}
        >
          {/* Cluster Circle Layer */}
          <Mapbox.CircleLayer
            id="clusteredPoints"
            belowLayerID="pointCount"
            filter={['has', 'point_count']}
            style={{
              circleColor: ['step', ['get', 'point_count'], '#E86A58', 10, '#CBA86A', 25, '#8E77C6'],
              circleRadius: ['step', ['get', 'point_count'], 20, 10, 26, 25, 32],
              circleStrokeWidth: 2,
              circleStrokeColor: '#FFFFFF',
            }}
          />

          {/* Cluster Label Layer */}
          <Mapbox.SymbolLayer
            id="pointCount"
            filter={['has', 'point_count']}
            style={{
              textField: ['get', 'point_count_abbreviated'],
              textSize: 12,
              textColor: '#FFFFFF',
              textFont: ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            }}
          />

          {/* Unclustered Individual Points */}
          <Mapbox.CircleLayer
            id="singlePoints"
            filter={['!', ['has', 'point_count']]}
            style={{
              circleColor: ['match', ['get', 'type'], 'memory', '#E86A58', 'restaurant', '#CBA86A', '#8E77C6'],
              circleRadius: 8,
              circleStrokeWidth: 2,
              circleStrokeColor: '#FFFFFF',
            }}
          />
        </Mapbox.ShapeSource>
      </Mapbox.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
```

---

## 4. Platform Separation Pattern

To ensure Web SSR and Expo Web Bundling remain 100% clean and never try to bundle native C++/Obj-C binaries:
1. Create `Component.web.tsx` for web execution.
2. Create `Component.native.tsx` for iOS/Android execution.
3. Keep `Component.tsx` as a re-export without top-level native imports.
