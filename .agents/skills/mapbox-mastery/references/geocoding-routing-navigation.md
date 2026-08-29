# 📍 Geocoding, Directions & Offline Maps

Complete guide for integrating search, route calculation, and offline trip packaging in Mapbox.

---

## 1. Mapbox Geocoding & Search API

### Forward Geocoding (Text ➔ Coordinates)
```ts
export async function searchPlace(query: string, accessToken: string) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${accessToken}&types=poi,address,neighborhood,place&language=es&limit=5`;
  const res = await fetch(url);
  const data = await res.json();
  return data.features.map((f: any) => ({
    id: f.id,
    name: f.text,
    fullName: f.place_name,
    coordinates: f.center, // [lng, lat]
  }));
}
```

### Reverse Geocoding (Coordinates ➔ Address / City)
```ts
export async function reverseGeocode(longitude: number, latitude: number, accessToken: string) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken}&types=neighborhood,locality,place,address&language=es`;
  const res = await fetch(url);
  const data = await res.json();
  return data.features[0]?.place_name || 'Ubicación seleccionada';
}
```

---

## 2. Directions API (Trip Routes & Polyline Decoding)

Retrieve driving/walking/cycling routes between two points with turn-by-turn geometry:

```ts
export async function getTripRoute(
  origin: [number, number], // [lng, lat]
  destination: [number, number],
  profile: 'walking' | 'driving' | 'cycling' = 'walking',
  accessToken: string
) {
  const coordinates = `${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;
  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinates}?geometries=geojson&overview=full&steps=true&access_token=${accessToken}`;

  const res = await fetch(url);
  const data = await res.json();
  const route = data.routes[0];

  return {
    distanceMeters: route.distance,
    durationSeconds: route.duration,
    geojsonLine: route.geometry, // GeoJSON LineString
  };
}
```

---

## 3. Offline Maps (Native Tile Packs)

In React Native with `@rnmapbox/maps`, pre-download tile packs for vacations and trips with zero cellular coverage:

```ts
import Mapbox from '@rnmapbox/maps';

export async function downloadTripOfflinePack(
  packName: string,
  bounds: [[number, number], [number, number]], // [[ne_lng, ne_lat], [sw_lng, sw_lat]]
  minZoom = 10,
  maxZoom = 16
) {
  const options = {
    name: packName,
    styleURL: 'mapbox://styles/mapbox/light-v11',
    bounds,
    minZoom,
    maxZoom,
  };

  await Mapbox.offlineManager.createPack(options, (region, status) => {
    console.log(`Descarga offline: ${status.percentage}% completado`);
  });
}
```
