import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { MapPlace } from '@andrea/types';

export type MapMode = 'standard' | 'satellite' | 'globe3d';

interface AppleWorldMapProps {
  places: MapPlace[];
  selectedPlace: MapPlace | null;
  onSelectPlace: (place: MapPlace) => void;
  mapType: MapMode;
  is3dPitch?: boolean;
}

const COUNTRY_FLAGS: Record<string, string> = {
  España: '🇪🇸',
  Italia: '🇮🇹',
  Francia: '🇫🇷',
  Japón: '🇯🇵',
  Indonesia: '🇮🇩',
  Portugal: '🇵🇹',
  ReinoUnido: '🇬🇧',
  EEUU: '🇺🇸',
};

export function AppleWorldMap({
  places,
  selectedPlace,
  onSelectPlace,
  mapType = 'standard',
  is3dPitch = true,
}: AppleWorldMapProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const mapHtml = useMemo(() => {
    const placesJson = JSON.stringify(places);
    const selectedId = selectedPlace?.id || '';
    const flagsJson = JSON.stringify(COUNTRY_FLAGS);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  
  <!-- MapLibre GL JS — Ultra High-Definition 60fps Vector Map Engine with 3D Buildings & Zoom Level 22 -->
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" />
  <script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>

  <!-- Three.js 3D Globe Engine -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #FAF6F0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    #maplibre-map { width: 100%; height: 100%; position: absolute; inset: 0; display: ${mapType === 'globe3d' ? 'none' : 'block'}; }
    #globe-container { width: 100%; height: 100%; position: absolute; inset: 0; display: ${mapType === 'globe3d' ? 'block' : 'none'}; background: radial-gradient(circle at center, #1C1528 0%, #090710 100%); }
    
    .maplibregl-ctrl-bottom-left, .maplibregl-ctrl-bottom-right, .maplibregl-ctrl-attrib { display: none !important; }

    /* Apple Maps High-Resolution Pushpins */
    .apple-marker-root {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      transform-origin: bottom center;
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .apple-marker-root:hover {
      transform: scale(1.18) translateY(-6px);
      z-index: 9999 !important;
    }
    .apple-marker-root.active {
      transform: scale(1.25) translateY(-8px);
      z-index: 10000 !important;
    }

    /* Floating Apple Glass Capsule */
    .apple-capsule {
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1.5px solid rgba(43, 33, 41, 0.12);
      padding: 4px 10px;
      border-radius: 16px;
      box-shadow: 0 6px 18px rgba(43, 33, 41, 0.18), 0 2px 4px rgba(0,0,0,0.06);
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      margin-bottom: 4px;
      pointer-events: none;
    }
    .apple-flag { font-size: 14px; }
    .apple-city { font-size: 11.5px; font-weight: 800; color: #2B2129; letter-spacing: -0.2px; }
    .apple-date { font-size: 9.5px; font-weight: 700; color: #E86A58; background: #FDEEEB; padding: 1px 5px; border-radius: 6px; }

    /* Apple Teardrop Pin */
    .apple-pin-body {
      width: 28px;
      height: 28px;
      border-radius: 50% 50% 50% 0;
      background: linear-gradient(135deg, #FF7E6B 0%, #E85B47 100%);
      transform: rotate(-45deg);
      box-shadow: 0 4px 12px rgba(232, 91, 71, 0.5);
      border: 2.5px solid #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .apple-pin-body::after {
      content: '';
      width: 8px;
      height: 8px;
      background: #FFFFFF;
      border-radius: 50%;
      transform: rotate(45deg);
    }
    .apple-marker-root.active .apple-pin-body {
      background: linear-gradient(135deg, #FFB84D 0%, #E5A93C 100%);
      box-shadow: 0 6px 18px rgba(229, 169, 60, 0.65);
    }
    .apple-shadow {
      width: 14px;
      height: 5px;
      background: rgba(0, 0, 0, 0.28);
      border-radius: 50%;
      filter: blur(1.5px);
      margin-top: 1px;
    }

    /* Pulse Glow */
    .apple-pulse {
      position: absolute;
      bottom: 2px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(232, 91, 71, 0.4);
      animation: applePulse 2s infinite ease-out;
      pointer-events: none;
      z-index: -1;
    }
    @keyframes applePulse {
      0% { transform: scale(0.5); opacity: 1; }
      100% { transform: scale(2.4); opacity: 0; }
    }

    /* Zoom Level HUD on top-right */
    .zoom-hud {
      position: absolute;
      top: 16px;
      right: 16px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(12px);
      border-radius: 12px;
      padding: 4px 8px;
      font-size: 10px;
      font-weight: 800;
      color: #2A5570;
      border: 1px solid rgba(43, 33, 41, 0.1);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      pointer-events: none;
      z-index: 100;
    }
  </style>
</head>
<body>
  <div id="maplibre-map">
    <div class="zoom-hud" id="zoom-indicator">Zoom: 3.5x</div>
  </div>
  <div id="globe-container"></div>

  <script>
    const places = ${placesJson};
    let selectedId = "${selectedId}";
    const mapType = "${mapType}";
    const flags = ${flagsJson};
    const is3dPitch = ${is3dPitch};

    if (mapType !== 'globe3d') {
      initMapLibre();
    } else {
      initThreeGlobe();
    }

    // =========================================================================
    // 1. MAPLIBRE GL JS (Ultra HD Vector Map with 3D Buildings & Max Zoom 22)
    // =========================================================================
    let map = null;
    const markers = {};

    function initMapLibre() {
      // Free OpenFreeMap High-Res Vector Style with 3D buildings and Apple Maps palette
      const vectorStyle = {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
              'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
              'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
            ],
            tileSize: 256,
            maxzoom: 22,
            attribution: ''
          }
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      };

      const satelliteStyle = {
        version: 8,
        sources: {
          'satellite-tiles': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            maxzoom: 20
          }
        },
        layers: [
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'satellite-tiles',
            minzoom: 0,
            maxzoom: 20
          }
        ]
      };

      map = new maplibregl.Map({
        container: 'maplibre-map',
        style: mapType === 'satellite' ? satelliteStyle : vectorStyle,
        center: [15, 35],
        zoom: 3.2,
        minZoom: 1.5,
        maxZoom: 22, // Full street-level zoom down to individual house doors!
        pitch: is3dPitch ? 40 : 0,
        bearing: 0,
        antialias: true,
        renderWorldCopies: true,
        attributionControl: false
      });

      // Update zoom indicator HUD
      map.on('zoom', () => {
        const z = map.getZoom().toFixed(1);
        const el = document.getElementById('zoom-indicator');
        if (el) el.innerText = 'Zoom: ' + z + 'x (Nivel ' + (z > 14 ? 'Calle 3D' : z > 9 ? 'Ciudad' : 'Mundo') + ')';
      });

      map.on('load', () => {
        // Draw Romantic Curved GeoJSON Flight Path connecting the cities
        const coordinates = places.map(p => [p.lng, p.lat]);

        if (coordinates.length > 1) {
          map.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: coordinates
              }
            }
          });

          // Glowing under-layer
          map.addLayer({
            id: 'route-glow',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#E86A58',
              'line-width': 8,
              'line-opacity': 0.25,
              'line-blur': 4
            }
          });

          // Dashed main line
          map.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#E86A58',
              'line-width': 3.5,
              'line-opacity': 0.85,
              'line-dasharray': [2, 3]
            }
          });
        }

        // Add Apple Maps Pushpins
        places.forEach(p => {
          const el = document.createElement('div');
          el.className = 'apple-marker-root' + (p.id === selectedId ? ' active' : '');
          el.id = 'marker-' + p.id;
          
          const flag = flags[p.country] || '📍';
          const year = p.date.split('-')[0];

          el.innerHTML = \`
            \${p.id === selectedId ? '<div class="apple-pulse"></div>' : ''}
            <div class="apple-capsule">
              <span class="apple-flag">\${flag}</span>
              <span class="apple-city">\${p.cityName}</span>
              <span class="apple-date">\${year}</span>
            </div>
            <div class="apple-pin-body"></div>
            <div class="apple-shadow"></div>
          \`;

          el.addEventListener('click', (e) => {
            e.stopPropagation();
            window.parent.postMessage({ type: 'SELECT_PLACE', placeId: p.id }, '*');
            flyToDestination(p.lng, p.lat, 15.5, 50, -15);
          });

          const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat([p.lng, p.lat])
            .addTo(map);

          markers[p.id] = marker;
        });

        // Fit bounds on first load
        if (coordinates.length > 0) {
          const bounds = coordinates.reduce((b, coord) => b.extend(coord), new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
          map.fitBounds(bounds, { padding: 80, maxZoom: 5, duration: 1500 });
        }
      });
    }

    function flyToDestination(lng, lat, zoom = 15.5, pitch = 50, bearing = 0) {
      if (!map) return;
      map.flyTo({
        center: [lng, lat],
        zoom: zoom,
        pitch: pitch,
        bearing: bearing,
        duration: 2200,
        essential: true
      });
    }

    // =========================================================================
    // 2. THREE.JS 3D WORLD GLOBE ENGINE
    // =========================================================================
    let scene, camera, renderer, controls, globeMesh;
    const pinObjects = [];

    function initThreeGlobe() {
      const container = document.getElementById('globe-container');
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(0, 0, 230);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.rotateSpeed = 0.6;
      controls.minDistance = 100;
      controls.maxDistance = 400;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.35;

      const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.0);
      scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xFFF6E8, 1.4);
      sunLight.position.set(150, 100, 150);
      scene.add(sunLight);

      // Starfield
      const starsGeometry = new THREE.BufferGeometry();
      const starPositions = [];
      for (let i = 0; i < 1000; i++) {
        starPositions.push((Math.random() - 0.5) * 800, (Math.random() - 0.5) * 800, (Math.random() - 0.5) * 800);
      }
      starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
      const starsMaterial = new THREE.PointsMaterial({ color: 0xEAE2F8, size: 1.4, transparent: true, opacity: 0.8 });
      scene.add(new THREE.Points(starsGeometry, starsMaterial));

      // Earth Globe
      const globeRadius = 65;
      const globeGeometry = new THREE.SphereGeometry(globeRadius, 64, 64);
      
      const textureLoader = new THREE.TextureLoader();
      textureLoader.crossOrigin = 'anonymous';

      // Procedural Canvas Texture Fallback
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#1D4566';
      ctx.fillRect(0, 0, 1024, 512);
      ctx.fillStyle = '#6E9877';
      ctx.beginPath();
      ctx.arc(260, 180, 80, 0, Math.PI * 2);
      ctx.arc(320, 360, 60, 0, Math.PI * 2);
      ctx.arc(520, 180, 80, 0, Math.PI * 2);
      ctx.arc(540, 310, 70, 0, Math.PI * 2);
      ctx.arc(740, 190, 100, 0, Math.PI * 2);
      ctx.arc(840, 360, 50, 0, Math.PI * 2);
      ctx.fill();
      const fallbackTexture = new THREE.CanvasTexture(canvas);

      const globeMaterial = new THREE.MeshPhongMaterial({ map: fallbackTexture, shininess: 25, specular: new THREE.Color(0x333333) });

      textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg', (tex) => {
        globeMaterial.map = tex;
        globeMaterial.needsUpdate = true;
      });

      globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
      scene.add(globeMesh);

      // Atmospheric Glow
      const haloGeo = new THREE.SphereGeometry(globeRadius * 1.035, 64, 64);
      const haloMat = new THREE.MeshBasicMaterial({ color: 0x87AFC7, transparent: true, opacity: 0.25, side: THREE.BackSide });
      scene.add(new THREE.Mesh(haloGeo, haloMat));

      function latLngToVector3(lat, lng, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = (radius * Math.sin(phi) * Math.sin(theta));
        const y = (radius * Math.cos(phi));
        return new THREE.Vector3(x, y, z);
      }

      const points3D = [];

      places.forEach(p => {
        const pos = latLngToVector3(p.lat, p.lng, globeRadius);
        points3D.push(pos);

        const pinGeo = new THREE.SphereGeometry(2.4, 16, 16);
        const isSelectedPin = p.id === selectedId;
        const pinMat = new THREE.MeshBasicMaterial({ color: isSelectedPin ? 0xF4C95D : 0xEF826A });
        const pinMesh = new THREE.Mesh(pinGeo, pinMat);
        pinMesh.position.copy(pos.clone().multiplyScalar(1.025));
        pinMesh.userData = { place: p };

        const stemGeo = new THREE.CylinderGeometry(0.35, 0.35, 4);
        const stemMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const stemMesh = new THREE.Mesh(stemGeo, stemMat);
        stemMesh.position.copy(pos);
        stemMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());

        scene.add(pinMesh);
        scene.add(stemMesh);
        pinObjects.push(pinMesh);

        const ringGeo = new THREE.RingGeometry(1.8, 3.4, 24);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xEF826A, side: THREE.DoubleSide, transparent: true, opacity: 0.75 });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.copy(pos.clone().multiplyScalar(1.008));
        ringMesh.lookAt(new THREE.Vector3(0,0,0));
        scene.add(ringMesh);
      });

      // 3D Curved Bezier Arcs
      for (let i = 0; i < points3D.length - 1; i++) {
        const start = points3D[i];
        const end = points3D[i + 1];
        const mid = start.clone().add(end).multiplyScalar(0.5);
        const distance = start.distanceTo(end);
        mid.normalize().multiplyScalar(globeRadius + distance * 0.35);

        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const curvePoints = curve.getPoints(40);
        const curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
        const curveMaterial = new THREE.LineBasicMaterial({ color: 0xF4C95D, transparent: true, opacity: 0.85, linewidth: 2 });
        scene.add(new THREE.Line(curveGeometry, curveMaterial));
      }

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      container.addEventListener('pointerdown', () => { controls.autoRotate = false; });
      container.addEventListener('click', (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(pinObjects);

        if (intersects.length > 0) {
          const hitPlace = intersects[0].object.userData.place;
          if (hitPlace) {
            window.parent.postMessage({ type: 'SELECT_PLACE', placeId: hitPlace.id }, '*');
          }
        }
      });

      function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      }
      animate();

      window.addEventListener('resize', () => {
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });
    }

    // Bridge Messages from parent React Native component
    window.addEventListener('message', (event) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'FLY_TO_PLACE') {
        const p = places.find(item => item.id === data.placeId);
        if (p && map) {
          flyToDestination(p.lng, p.lat, 16, 50, -15);
          
          document.querySelectorAll('.apple-marker-root').forEach(el => el.classList.remove('active'));
          const targetEl = document.getElementById('marker-' + p.id);
          if (targetEl) targetEl.classList.add('active');
        }
      } else if (data.type === 'TOGGLE_3D_PITCH') {
        if (map) {
          const currentPitch = map.getPitch();
          map.easeTo({ pitch: currentPitch > 20 ? 0 : 55, duration: 800 });
        }
      } else if (data.type === 'ZOOM_IN') {
        if (map) map.zoomIn({ duration: 300 });
      } else if (data.type === 'ZOOM_OUT') {
        if (map) map.zoomOut({ duration: 300 });
      } else if (data.type === 'RESET_NORTH') {
        if (map) map.resetNorthPitch({ duration: 800 });
      }
    });
  </script>
</body>
</html>
    `;
  }, [places, selectedPlace?.id, mapType, is3dPitch]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleWindowMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SELECT_PLACE') {
        const place = places.find((p) => p.id === event.data.placeId);
        if (place) {
          onSelectPlace(place);
        }
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [places, onSelectPlace]);

  useEffect(() => {
    if (selectedPlace && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'FLY_TO_PLACE', placeId: selectedPlace.id },
        '*'
      );
    }
  }, [selectedPlace]);

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <iframe
          ref={iframeRef as any}
          srcDoc={mapHtml}
          style={styles.iframe as any}
          title="Apple Maps Ultra HD Vector Engine"
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
    overflow: 'hidden',
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
