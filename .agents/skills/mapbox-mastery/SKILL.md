---
name: mapbox-mastery
description: >-
  Comprehensive spatial intelligence & Mapbox engineering toolkit for Web (Mapbox GL JS / react-map-gl)
  and Mobile (React Native / @rnmapbox/maps / Expo). Covers custom Mapbox Studio styles, vector tilesets,
  GeoJSON layer pipelines, expression syntax, 3D terrain & globe projection, camera choreography,
  clustering, geocoding & directions, spatial privacy (obfuscation/jitter), and performance optimization.
---

# 🗺️ Mapbox & Spatial Intelligence Mastery

This skill equips Antigravity with production-ready recipes, architectural patterns, and performance techniques for building high-end map applications across Web and Mobile.

---

## 📚 Architectural References

1. **[Mapbox GL JS & Web Spatial Engine](./references/mapbox-gl-js-web.md)**:
   - WebGL map lifecycle, container bindings, and dynamic script/style loaders.
   - Layer architecture: `symbol`, `circle`, `fill-extrusion`, `line`, `heatmap`, `raster-dem` 3D terrain, `sky` atmospheric rendering, and globe projection (`projection: { name: 'globe' }`).
   - Expressions & Data-Driven Styling: `['interpolate', ...]`, `['step', ...]`, `['case', ...]`, `['match', ...]`, `['get', ...]`.
   - High-performance GeoJSON sources with `cluster: true`, `clusterRadius`, and `clusterMaxZoom`.

2. **[React Native & `@rnmapbox/maps` Native Suite](./references/rnmapbox-native.md)**:
   - `@rnmapbox/maps` components: `MapView`, `Camera`, `ShapeSource`, `SymbolLayer`, `CircleLayer`, `PointAnnotation`, `Callout`, `UserLocation`.
   - Expo config plugin integration with `app.config.ts`, Gradle credentials, and iOS CocoaPods `.netrc` authentication.
   - Camera animations (`flyTo`, `setCamera`, spring physics, heading, pitch, zoom constraints).
   - Platform isolation pattern (`.web.tsx` vs `.native.tsx`) ensuring 0 native bundle leaks in Web SSR/Metro.

3. **[Spatial Privacy & Cryptographic Geolocation](./references/spatial-privacy-cryptography.md)**:
   - 5-Tier Location Precision model: `exact`, `approximate` (jitter/grid blur), `city` (centroid), `hidden` (unrevealed secret until unlock date), `none`.
   - Spatial math with Turf.js: Haversine distance, centroid calculation, bounding box expansion, polygon containment.
   - Zero-Knowledge bounding box queries: Querying encrypted spatial records from Supabase without exposing exact coordinates to the database.

4. **[Mapbox Studio & Editorial Design System](./references/studio-and-style-spec.md)**:
   - *Quiet Luxury* Cartography: Warm stone canvases (`#FAF7F2`), subtle landuse tinting, muted highway hierarchies, and hairline borders.
   - Custom vector tilesets, Mapbox Style Specification JSON, custom sprite sheets, and glyph font stack hosting.
   - Dynamic style switching without flickering or dropping active marker state.

5. **[Geocoding, Routing & Offline Maps](./references/geocoding-routing-navigation.md)**:
   - Forward & Reverse Geocoding via Mapbox Geocoding API v6 / Search Box.
   - Directions API v5: Route polylines, polyline decoding, duration/distance calculations, waypoint optimization.
   - Offline Tile Packs: Defining bounding boxes, downloading vector tiles for offline trips, and storage quota management.

---

## 📐 Golden Rules of Map Development

1. **Security & Tokens**:
   - Runtime public token: `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` (`pk.*`).
   - Downloads/build token: `MAPBOX_DOWNLOADS_TOKEN` / `RNMAPBOX_MAPS_DOWNLOAD_TOKEN` (`sk.*`) — **NEVER** expose to the client or commit to version control.
   - Always validate tokens early with user-friendly error diagnostics.

2. **Cross-Platform Separation**:
   - Never import `@rnmapbox/maps` inside web code or shared files without platform boundaries (`.native.tsx` / `.web.tsx`).
   - On web, load Mapbox GL JS dynamically or via standard ESM to prevent Metro AST bundler conflicts with dynamic imports.

3. **Performance & Memory**:
   - Always call `map.remove()` or cleanly unmount map instances to prevent WebGL context leaks (browsers limit active WebGL contexts to 8–16).
   - Use GeoJSON layers (`ShapeSource` + `SymbolLayer`) for >50 markers instead of raw React DOM elements/PointAnnotations.
   - Apply a 300ms debounce on camera idle / region change handlers to avoid hammering backends with bounding box queries.
