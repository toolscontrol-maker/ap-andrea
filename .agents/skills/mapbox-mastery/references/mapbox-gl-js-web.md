# 🌐 Mapbox GL JS & Web Spatial Engine Guide

Comprehensive reference for building fast, responsive WebGL maps using Mapbox GL JS v3, custom shaders, dynamic layers, and expression syntax.

---

## 1. WebGL Map Lifecycle & Safe Injection

In modern React / Expo Web environments, loading Mapbox GL JS dynamically ensures complete compatibility with bundlers and SSR frameworks:

```ts
import { useEffect, useRef } from 'react';

export function useMapboxGL(containerRef: React.RefObject<HTMLElement>, styleUrl: string, token: string) {
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || !token) return;

    let isCancelled = false;

    const init = async () => {
      // 1. Inject Mapbox CSS
      if (!document.getElementById('mapbox-gl-css')) {
        const link = document.createElement('link');
        link.id = 'mapbox-gl-css';
        link.rel = 'stylesheet';
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css';
        document.head.appendChild(link);
      }

      // 2. Inject Mapbox JS script if not present
      if (!(window as any).mapboxgl) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.js';
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Mapbox script load failed'));
          document.head.appendChild(script);
        });
      }

      if (isCancelled || !containerRef.current) return;

      const mapboxgl = (window as any).mapboxgl;
      mapboxgl.accessToken = token;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: styleUrl,
        center: [-0.3763, 39.4699], // [lng, lat]
        zoom: 12,
        pitch: 30,
        attributionControl: false,
      });

      mapRef.current = map;
    };

    init();

    return () => {
      isCancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [styleUrl, token]);

  return mapRef;
}
```

---

## 2. Expression Syntax & Data-Driven Styling

Mapbox expressions allow dynamic styling directly in the WebGL pipeline without re-rendering layers:

### A. Zoom-Based Interpolation (`interpolate`)
Smoothly scale marker radius and line widths based on zoom level:
```json
[
  "interpolate",
  ["linear"],
  ["zoom"],
  8, 4,
  14, 12,
  18, 24
]
```

### B. Categorical Match (`match`)
Assign colors dynamically based on property type:
```json
[
  "match",
  ["get", "place_type"],
  "memory", "#E86A58",
  "restaurant", "#CBA86A",
  "trip", "#8E77C6",
  "surprise", "#C74A38",
  "#4A7C9B"
]
```

### C. Step-Based Clustering (`step`)
Vary cluster circle radius and colors based on `point_count`:
```json
[
  "step",
  ["get", "point_count"],
  "#E86A58",
  10, "#CBA86A",
  30, "#8E77C6"
]
```

---

## 3. High-Performance GeoJSON Layer Pipeline

When rendering hundreds or thousands of pins, avoid React DOM markers and use native WebGL GeoJSON layers:

```ts
map.on('load', () => {
  // 1. Add Clustered Source
  map.addSource('couple-places', {
    type: 'geojson',
    data: geojsonData,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50,
  });

  // 2. Add Cluster Circles
  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'couple-places',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#E86A58',
        10, '#CBA86A',
        25, '#8E77C6',
      ],
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        18,
        10, 24,
        25, 30,
      ],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#FFFFFF',
    },
  });

  // 3. Add Cluster Count Labels
  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'couple-places',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': ['get', 'point_count_abbreviated'],
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12,
    },
    paint: {
      'text-color': '#FFFFFF',
    },
  });

  // 4. Add Individual Unclustered Points
  map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'couple-places',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': [
        'match',
        ['get', 'type'],
        'memory', '#E86A58',
        'restaurant', '#CBA86A',
        'trip', '#8E77C6',
        '#4A7C9B',
      ],
      'circle-radius': 8,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#FFFFFF',
    },
  });
});
```

---

## 4. 3D Terrain, Sky, and Atmosphere

Activate 3D elevation and realistic horizon sky gradients:

```ts
map.on('style.load', () => {
  // 1. Add 3D Terrain Elevation
  map.addSource('mapbox-dem', {
    type: 'raster-dem',
    url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
    tileSize: 512,
    maxzoom: 14,
  });
  map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.3 });

  // 2. Add Atmospheric Sky Layer
  map.addLayer({
    id: 'sky',
    type: 'sky',
    paint: {
      'sky-type': 'atmosphere',
      'sky-atmosphere-sun': [0.0, 0.0],
      'sky-atmosphere-sun-intensity': 15,
    },
  });
});
```
