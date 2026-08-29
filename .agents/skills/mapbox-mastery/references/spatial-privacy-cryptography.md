# 🔒 Spatial Privacy & Cryptographic Geolocation

Architectural patterns for location privacy, end-to-end encrypted spatial records, and zero-knowledge viewport queries in relationship apps.

---

## 1. 5-Tier Location Precision Model

Different types of memories and surprises require varying degrees of spatial precision to protect intimate data and preserve the magic of future plans:

| Tier | Precision | Rendering Strategy | Use Case |
| :--- | :--- | :--- | :--- |
| **`exact`** | Exact lat/lng | Precise coordinate pin | Past memories, verified restaurant addresses |
| **`approximate`** | ~500m jitter / centroid | Render within a soft circular blur area | Neighborhoods, spontaneous date spots |
| **`city`** | City / Region centroid | Center of municipality | Future trip dreams, travel wishlists |
| **`hidden`** | None until unlocked | Do **NOT** render on map until unlock timestamp | Secret surprise plans, timed anniversary gifts |
| **`none`** | Zero spatial data | Listed in memory feed only | Notes, personal reflections without physical location |

---

## 2. Spatial Jitter Algorithm (Mathematical Noise)

For `approximate` locations, generate a deterministic or pseudo-random coordinate jitter within radius $R$:

```ts
/**
 * Applies a radial displacement of maxRadiusMeters to (lat, lng)
 */
export function applySpatialJitter(
  latitude: number,
  longitude: number,
  maxRadiusMeters: number = 400
): { latitude: number; longitude: number } {
  // Earth radius in meters
  const EARTH_RADIUS = 6378137;

  // Random distance and angle
  const radius = Math.random() * maxRadiusMeters;
  const angle = Math.random() * 2 * Math.PI;

  // Coordinate offsets in radians
  const dLat = (radius * Math.cos(angle)) / EARTH_RADIUS;
  const dLng = (radius * Math.sin(angle)) / (EARTH_RADIUS * Math.cos((Math.PI * latitude) / 180));

  return {
    latitude: latitude + (dLat * 180) / Math.PI,
    longitude: longitude + (dLng * 180) / Math.PI,
  };
}
```

---

## 3. Zero-Knowledge Bounding Box Queries

In E2EE apps (like Andrea App), server databases should not know the exact contents or intimate details of pins within a bounding box.

### Architecture Flow:
1. Map viewport reports bounding box coordinates `[sw_lng, sw_lat, ne_lng, ne_lat]`.
2. Client queries Supabase using coarse spatial indexes (e.g. Geohash level 5 or grid cell ID).
3. Supabase returns encrypted blobs matching the grid cells.
4. Client decrypts payloads locally with the shared couple cryptographic key (`@andrea/crypto-core`).
5. Client decrypts exact coordinates and renders them securely on the WebGL/Native Mapbox canvas.
