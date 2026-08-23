import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { MapPlace } from '@andrea/types';
import { COUNTRY_FLAGS } from '../../utils/formatters';

interface MapLibreEngineProps {
  places: MapPlace[];
  selectedPlaceId: string | null;
  onSelectPlaceId: (id: string) => void;
  onTapBackground?: () => void;
  styleMode: 'standard' | 'satellite';
  is3dPitch?: boolean;
}

export function MapLibreEngine({
  places,
  selectedPlaceId,
  onSelectPlaceId,
  onTapBackground,
  styleMode,
  is3dPitch = true,
}: MapLibreEngineProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const htmlContent = useMemo(() => {
    const placesJson = JSON.stringify(places);
    const flagsJson = JSON.stringify(COUNTRY_FLAGS);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" />
  <script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
    }
    html, body, #map {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #FAF6F0;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
    }
    .maplibregl-ctrl-bottom-left, .maplibregl-ctrl-bottom-right, .maplibregl-ctrl-attrib { display: none !important; }

    /* 44x44pt Touch Target Wrapper for iPhone */
    .apple-pin-touch-wrapper {
      min-width: 44px;
      min-height: 44px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      cursor: pointer;
      transform-origin: bottom center;
      transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .apple-pin-touch-wrapper:active,
    .apple-pin-touch-wrapper.active {
      transform: scale(1.22) translateY(-6px);
      z-index: 10000 !important;
    }

    /* City Label Capsule */
    .apple-pin-capsule {
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(43, 33, 41, 0.12);
      padding: 3.5px 8px;
      border-radius: 12px;
      box-shadow: 0 3px 10px rgba(43, 33, 41, 0.15);
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
      margin-bottom: 2px;
      pointer-events: none;
    }
    .apple-pin-flag { font-size: 11px; }
    .apple-pin-city { font-size: 10.5px; font-weight: 800; color: #1E252B; }

    /* 28pt Coral Pin */
    .apple-pin-head {
      width: 26px;
      height: 26px;
      border-radius: 50% 50% 50% 0;
      background: linear-gradient(135deg, #FF7E6B 0%, #E86A58 100%);
      transform: rotate(-45deg);
      box-shadow: 0 3px 8px rgba(232, 106, 88, 0.45);
      border: 2px solid #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .apple-pin-head::after {
      content: '';
      width: 6px;
      height: 6px;
      background: #FFFFFF;
      border-radius: 50%;
      transform: rotate(45deg);
    }
    .apple-pin-touch-wrapper.active .apple-pin-head {
      background: linear-gradient(135deg, #FFB84D 0%, #E5A93C 100%);
      box-shadow: 0 5px 14px rgba(229, 169, 60, 0.6);
      width: 32px;
      height: 32px;
    }
    .apple-pin-touch-wrapper.milestone .apple-pin-head {
      background: linear-gradient(135deg, #FFD272 0%, #D49D35 100%);
    }

    .apple-pin-shadow {
      width: 10px;
      height: 4px;
      background: rgba(0, 0, 0, 0.25);
      border-radius: 50%;
      filter: blur(1.5px);
      margin-top: 1px;
    }

    .apple-pulse-halo {
      position: absolute;
      bottom: 2px;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: rgba(232, 106, 88, 0.35);
      animation: pinHalo 2s infinite ease-out;
      pointer-events: none;
      z-index: -1;
    }
    @keyframes pinHalo {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(2.2); opacity: 0; }
    }
  </style>
</head>
<body>
  <div id="map"></div>

  <script>
    const places = ${placesJson};
    let selectedId = "${selectedPlaceId || ''}";
    const styleMode = "${styleMode}";
    const flags = ${flagsJson};
    const is3dPitch = ${is3dPitch};

    const vectorStyle = {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
            'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
          ],
          tileSize: 256,
          maxzoom: 22
        }
      },
      layers: [{ id: 'osm-layer', type: 'raster', source: 'osm-tiles', minzoom: 0, maxzoom: 22 }]
    };

    const satelliteStyle = {
      version: 8,
      sources: {
        'satellite-tiles': {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          maxzoom: 20
        }
      },
      layers: [{ id: 'satellite-layer', type: 'raster', source: 'satellite-tiles', minzoom: 0, maxzoom: 20 }]
    };

    const map = new maplibregl.Map({
      container: 'map',
      style: styleMode === 'satellite' ? satelliteStyle : vectorStyle,
      center: [15, 35],
      zoom: 3.2,
      minZoom: 1.5,
      maxZoom: 22,
      pitch: is3dPitch ? 35 : 0,
      bearing: 0,
      dragPan: true,
      scrollZoom: true,
      doubleClickZoom: true,
      touchZoomRotate: true,
      attributionControl: false
    });

    const markerMap = {};

    map.on('load', () => {
      // Dotted journey route line
      const coords = places.map(p => [p.lng, p.lat]);
      if (coords.length > 1) {
        map.addSource('journey-route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: coords }
          }
        });

        map.addLayer({
          id: 'route-glow',
          type: 'line',
          source: 'journey-route',
          paint: { 'line-color': '#E86A58', 'line-width': 6, 'line-opacity': 0.22, 'line-blur': 2.5 }
        });

        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'journey-route',
          paint: { 'line-color': '#E86A58', 'line-width': 2.8, 'line-opacity': 0.8, 'line-dasharray': [2, 3] }
        });
      }

      // Add 44pt touchable markers
      places.forEach(p => {
        const el = document.createElement('div');
        const isMilestone = p.category === 'primer_encuentro' || p.isMilestone;
        el.className = 'apple-pin-touch-wrapper' + (p.id === selectedId ? ' active' : '') + (isMilestone ? ' milestone' : '');
        el.id = 'pin-' + p.id;

        const flag = flags[p.country] || '📍';

        el.innerHTML = \`
          \${p.id === selectedId ? '<div class="apple-pulse-halo"></div>' : ''}
          <div class="apple-pin-capsule">
            <span class="apple-pin-flag">\${flag}</span>
            <span class="apple-pin-city">\${p.cityName}</span>
          </div>
          <div class="apple-pin-head"></div>
          <div class="apple-pin-shadow"></div>
        \`;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          window.parent.postMessage({ type: 'SELECT_PLACE_ID', placeId: p.id }, '*');
          flyToPlace(p.lng, p.lat, 15);
        });

        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([p.lng, p.lat])
          .addTo(map);

        markerMap[p.id] = marker;
      });

      if (coords.length > 0) {
        const bounds = coords.reduce((b, c) => b.extend(c), new maplibregl.LngLatBounds(coords[0], coords[0]));
        map.fitBounds(bounds, { padding: 60, maxZoom: 5, duration: 1000 });
      }
    });

    map.on('click', () => {
      window.parent.postMessage({ type: 'TAP_BACKGROUND' }, '*');
    });

    function flyToPlace(lng, lat, zoom = 15) {
      map.flyTo({
        center: [lng, lat],
        zoom: zoom,
        pitch: is3dPitch ? 40 : 0,
        duration: 1800,
        essential: true
      });
    }

    // Message Listener for Zoom, Pitch and Navigation
    window.addEventListener('message', (event) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'FLY_TO_PLACE') {
        const p = places.find(item => item.id === data.placeId);
        if (p) {
          flyToPlace(p.lng, p.lat, 15);
          document.querySelectorAll('.apple-pin-touch-wrapper').forEach(el => el.classList.remove('active'));
          const targetEl = document.getElementById('pin-' + p.id);
          if (targetEl) targetEl.classList.add('active');
        }
      } else if (data.type === 'TOGGLE_3D_PITCH') {
        const cur = map.getPitch();
        map.easeTo({ pitch: cur > 20 ? 0 : 45, duration: 800 });
      } else if (data.type === 'ZOOM_IN') {
        map.zoomIn({ duration: 300 });
      } else if (data.type === 'ZOOM_OUT') {
        map.zoomOut({ duration: 300 });
      } else if (data.type === 'FIT_ALL_BOUNDS') {
        const coords = places.map(p => [p.lng, p.lat]);
        if (coords.length > 0) {
          const bounds = coords.reduce((b, c) => b.extend(c), new maplibregl.LngLatBounds(coords[0], coords[0]));
          map.fitBounds(bounds, { padding: 60, maxZoom: 5, duration: 1000 });
        }
      }
    });
  </script>
</body>
</html>
    `;
  }, [places, selectedPlaceId, styleMode, is3dPitch]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SELECT_PLACE_ID') {
        onSelectPlaceId(event.data.placeId);
      } else if (event.data?.type === 'TAP_BACKGROUND') {
        onTapBackground?.();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSelectPlaceId, onTapBackground]);

  useEffect(() => {
    if (selectedPlaceId && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'FLY_TO_PLACE', placeId: selectedPlaceId },
        '*'
      );
    }
  }, [selectedPlaceId]);

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <iframe
          ref={iframeRef as any}
          srcDoc={htmlContent}
          style={styles.iframe as any}
          title="MapLibre Engine"
        />
      ) : (
        <View style={styles.fallback} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#FAF6F0',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    display: 'block',
  },
  fallback: {
    flex: 1,
    backgroundColor: '#FAF6F0',
  },
});
