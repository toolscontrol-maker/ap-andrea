import fs from 'fs';
import path from 'path';

const modalPath = 'c:\\Users\\angel chisvert\\Desktop\\ANDREA APP\\apps\\mobile\\src\\components\\map\\AddPlaceLocationModal.tsx';
let content = fs.readFileSync(modalPath, 'utf8');

// Replace imports
content = content.replace(
  /import\s*\{\s*searchMapboxPlaces[\s\S]*?\}\s*from\s*['"]\.\.\/\.\.\/services\/mapboxGeocoding['"];/,
  `import {
  searchGooglePlaces,
  reverseGeocodeGoogleCoordinates,
  GeocodingResult,
} from '../../services/googlePlacesGeocoding';
import { loadGoogleMapsSDK, ANDREA_GOOGLE_MAP_STYLES } from '../../lib/googleMaps';`
);

// Replace search hook
content = content.replace(
  /const res = await searchMapboxPlaces\(searchQuery, \{[\s\S]*?\}\);/,
  `const res = await searchGooglePlaces(searchQuery, {
        country: searchContext === 'valencia' ? 'es' : undefined,
        proximity: searchContext === 'valencia' ? [-0.3763, 39.4699] : undefined,
      });`
);

// Replace initMiniMap
const oldMiniMapRegex = /async function initMiniMap\(\) \{[\s\S]*?mapboxInstanceRef\.current = map;\s*\}/;
const newMiniMapCode = `async function initMiniMap() {
      if (!mapContainerRef.current) return;

      const googleMaps = await loadGoogleMapsSDK();
      if (!isMounted || !mapContainerRef.current || !googleMaps) return;

      // Clean old instance
      if (markerInstanceRef.current && markerInstanceRef.current.setMap) {
        markerInstanceRef.current.setMap(null);
        markerInstanceRef.current = null;
      }

      const center = { lat: selectedCoordinates[1], lng: selectedCoordinates[0] };
      const map = new googleMaps.Map(mapContainerRef.current, {
        center,
        zoom: locationPrecision === 'city' ? 11 : 16,
        styles: ANDREA_GOOGLE_MAP_STYLES,
        disableDefaultUI: true,
        gestureHandling: 'greedy',
        backgroundColor: '#FFF8F2',
      });

      const markerColor = type === 'restaurant' ? '#F4C95D' : '#EF826A';
      const markerIcon = type === 'restaurant' ? '🍽️' : '📍';

      const pinSvg = '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="16" fill="' + markerColor + '" stroke="#FFFFFF" stroke-width="2.5" filter="drop-shadow(0 3px 8px rgba(58,47,56,0.16))"/><text x="20" y="24" text-anchor="middle" font-size="14">' + markerIcon + '</text></svg>';

      const marker = new googleMaps.Marker({
        position: center,
        map,
        draggable: true,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(pinSvg),
          scaledSize: new googleMaps.Size(40, 40),
          anchor: new googleMaps.Point(20, 20),
        },
      });

      markerInstanceRef.current = marker;

      marker.addListener('dragend', async () => {
        const pos = marker.getPosition();
        if (!pos) return;
        const lng = pos.lng();
        const lat = pos.lat();
        setSelectedCoordinates([lng, lat]);
        setLocationSource('manual_pin');
        setIsReverseGeocoding(true);
        const rev = await reverseGeocodeGoogleCoordinates([lng, lat]);
        if (rev) {
          setVerifiedAddress(rev.formattedAddress);
          setVerifiedCity(rev.city || 'Valencia');
          setVerifiedCountry(rev.country || 'España');
        }
        setIsReverseGeocoding(false);
      });

      map.addListener('click', async (e: any) => {
        if (!e.latLng) return;
        const lng = e.latLng.lng();
        const lat = e.latLng.lat();
        marker.setPosition(e.latLng);
        setSelectedCoordinates([lng, lat]);
        setLocationSource('manual_pin');
        setIsReverseGeocoding(true);
        const rev = await reverseGeocodeGoogleCoordinates([lng, lat]);
        if (rev) {
          setVerifiedAddress(rev.formattedAddress);
          setVerifiedCity(rev.city || 'Valencia');
          setVerifiedCountry(rev.country || 'España');
        }
        setIsReverseGeocoding(false);
      });

      mapboxInstanceRef.current = map;
    }`;

content = content.replace(oldMiniMapRegex, newMiniMapCode);

// Replace cleanup
content = content.replace(
  /if \(mapboxInstanceRef\.current\) \{\s*mapboxInstanceRef\.current\.remove\(\);\s*mapboxInstanceRef\.current = null;\s*\}/g,
  `if (markerInstanceRef.current && markerInstanceRef.current.setMap) {
        markerInstanceRef.current.setMap(null);
        markerInstanceRef.current = null;
      }`
);

fs.writeFileSync(modalPath, content, 'utf8');
console.log('✅ AddPlaceLocationModal updated to Google Maps.');
