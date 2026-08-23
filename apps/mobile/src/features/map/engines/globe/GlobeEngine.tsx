import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { MapPlace } from '@andrea/types';
import { COUNTRY_FLAGS } from '../../utils/formatters';

interface GlobeEngineProps {
  places: MapPlace[];
  selectedPlaceId: string | null;
  onSelectPlaceId: (id: string) => void;
  onTapBackground?: () => void;
}

export function GlobeEngine({
  places,
  selectedPlaceId,
  onSelectPlaceId,
  onTapBackground,
}: GlobeEngineProps) {
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
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
      touch-action: none;
    }
    html, body, #globe-container {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: radial-gradient(circle at center, #1B1528 0%, #08060D 100%);
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
    }
    
    #globe-hint {
      position: absolute;
      top: 110px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 11.5px;
      font-weight: 700;
      color: #1E252B;
      pointer-events: none;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.4);
      white-space: nowrap;
      z-index: 10;
    }
  </style>
</head>
<body>
  <div id="globe-container">
    <div id="globe-hint">🌍 Rota con un dedo · Pellizca con dos para zoom</div>
  </div>

  <script>
    const places = ${placesJson};
    let selectedId = "${selectedPlaceId || ''}";
    const flags = ${flagsJson};

    const container = document.getElementById('globe-container');
    let width = window.innerWidth;
    let height = window.innerHeight;

    // 1. Scene & Perspective Camera (Unit Scale: Earth Radius = 1.0)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.2);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Illumination
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.95);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xFFF6E8, 1.3);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    // 4. Starfield Particles
    const starsGeo = new THREE.BufferGeometry();
    const starCoords = [];
    for (let i = 0; i < 700; i++) {
      starCoords.push(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30
      );
    }
    starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xEAE2F8, size: 0.04, transparent: true, opacity: 0.8 });
    scene.add(new THREE.Points(starsGeo, starsMat));

    // 5. Earth Sphere (Radius = 1.0)
    const earthRadius = 1.0;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    
    // Clean Procedural Earth Texture
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1D3B58';
    ctx.fillRect(0, 0, 1024, 512);
    ctx.fillStyle = '#4E7356';
    ctx.beginPath();
    ctx.arc(260, 180, 75, 0, Math.PI * 2);
    ctx.arc(320, 360, 55, 0, Math.PI * 2);
    ctx.arc(520, 180, 75, 0, Math.PI * 2);
    ctx.arc(540, 310, 65, 0, Math.PI * 2);
    ctx.arc(740, 190, 95, 0, Math.PI * 2);
    ctx.arc(840, 360, 45, 0, Math.PI * 2);
    ctx.fill();
    const proceduralTexture = new THREE.CanvasTexture(canvas);

    const earthMat = new THREE.MeshPhongMaterial({
      map: proceduralTexture,
      shininess: 20,
      specular: new THREE.Color(0x222222),
    });

    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';
    textureLoader.load(
      'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
      (tex) => {
        earthMat.map = tex;
        earthMat.needsUpdate = true;
      }
    );

    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // Atmospheric Glow Layer
    const haloGeo = new THREE.SphereGeometry(earthRadius * 1.025, 64, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x87AFC7,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide,
    });
    earthGroup.add(new THREE.Mesh(haloGeo, haloMat));

    // Lat/Lng -> 3D Vector converter
    function latLngToVector3(lat, lng, radius = 1.0) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = (radius * Math.sin(phi) * Math.sin(theta));
      const y = (radius * Math.cos(phi));
      return new THREE.Vector3(x, y, z);
    }

    const pinMeshes = [];
    const positions3D = [];

    // Proportional 3D Pins (0.026 - 0.038)
    places.forEach(p => {
      const pos = latLngToVector3(p.lat, p.lng, earthRadius);
      positions3D.push(pos);

      const isSelected = p.id === selectedId;
      const markerRadius = isSelected ? 0.038 : 0.026;

      const pinGeo = new THREE.SphereGeometry(markerRadius, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xFFB84D : (p.category === 'primer_encuentro' ? 0xCBA86A : 0xE86A58),
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos.clone().multiplyScalar(1.03));
      pinMesh.userData = { place: p };

      const stemGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.035);
      const stemMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.position.copy(pos.clone().multiplyScalar(1.015));
      stemMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());

      earthGroup.add(pinMesh);
      earthGroup.add(stemMesh);
      pinMeshes.push(pinMesh);
    });

    // Elevated 3D Bézier Arcs
    for (let i = 0; i < positions3D.length - 1; i++) {
      const start = positions3D[i];
      const end = positions3D[i + 1];
      const distance = start.distanceTo(end);
      
      const mid = start.clone().add(end).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(earthRadius + Math.min(0.3, distance * 0.35));

      const curve = new THREE.QuadraticBezierCurve3(
        start.clone().multiplyScalar(1.015),
        mid,
        end.clone().multiplyScalar(1.015)
      );
      const curvePoints = curve.getPoints(40);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const curveMat = new THREE.LineBasicMaterial({
        color: 0xCBA86A,
        transparent: true,
        opacity: 0.8,
        linewidth: 2,
      });
      earthGroup.add(new THREE.Line(curveGeo, curveMat));
    }

    // ==========================================
    // NATIVE MOBILE TOUCH & PINCH CONTROLLER
    // ==========================================
    let isDragging = false;
    let previousTouchPosition = { x: 0, y: 0 };
    let touchStartTime = 0;
    let touchStartPos = { x: 0, y: 0 };
    let initialPinchDistance = null;
    let initialCameraDistance = camera.position.z;
    let rotationVelocity = { x: 0, y: 0.002 };

    const MIN_DISTANCE = 1.35;
    const MAX_DISTANCE = 5.0;

    function getTouchDistance(t1, t2) {
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    container.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        isDragging = true;
        touchStartTime = Date.now();
        touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        previousTouchPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        rotationVelocity = { x: 0, y: 0 };
      } else if (e.touches.length === 2) {
        isDragging = false;
        initialPinchDistance = getTouchDistance(e.touches[0], e.touches[1]);
        initialCameraDistance = camera.position.length();
      }
    }, { passive: false });

    container.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (e.touches.length === 1 && isDragging) {
        const deltaX = e.touches[0].clientX - previousTouchPosition.x;
        const deltaY = e.touches[0].clientY - previousTouchPosition.y;

        earthGroup.rotation.y += deltaX * 0.006;
        earthGroup.rotation.x += deltaY * 0.006;
        earthGroup.rotation.x = Math.max(-1.1, Math.min(1.1, earthGroup.rotation.x));

        rotationVelocity = { x: deltaY * 0.003, y: deltaX * 0.003 };
        previousTouchPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2 && initialPinchDistance) {
        const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
        const scale = initialPinchDistance / currentDistance;
        const targetDist = initialCameraDistance * scale;
        const clampedDist = Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, targetDist));
        camera.position.setLength(clampedDist);
      }
    }, { passive: false });

    const raycaster = new THREE.Raycaster();
    const touchCoords = new THREE.Vector2();

    container.addEventListener('touchend', (e) => {
      if (isDragging) {
        const touchDuration = Date.now() - touchStartTime;
        const lastTouch = e.changedTouches[0];
        const moveDist = Math.hypot(
          lastTouch.clientX - touchStartPos.x,
          lastTouch.clientY - touchStartPos.y
        );

        // Tap detected if duration < 300ms and movement < 10px
        if (touchDuration < 300 && moveDist < 10) {
          const rect = renderer.domElement.getBoundingClientRect();
          touchCoords.x = ((lastTouch.clientX - rect.left) / rect.width) * 2 - 1;
          touchCoords.y = -((lastTouch.clientY - rect.top) / rect.height) * 2 + 1;

          raycaster.setFromCamera(touchCoords, camera);
          const intersects = raycaster.intersectObjects(pinMeshes);

          if (intersects.length > 0) {
            const hitPlace = intersects[0].object.userData.place;
            if (hitPlace) {
              window.parent.postMessage({ type: 'SELECT_PLACE_ID', placeId: hitPlace.id }, '*');
            }
          } else {
            window.parent.postMessage({ type: 'TAP_BACKGROUND' }, '*');
          }
        }
      }

      if (e.touches.length === 0) {
        isDragging = false;
        initialPinchDistance = null;
      }
    });

    // Also support mouse for emulator
    let isMouseDown = false;
    container.addEventListener('mousedown', (e) => {
      isMouseDown = true;
      previousTouchPosition = { x: e.clientX, y: e.clientY };
      touchStartTime = Date.now();
      touchStartPos = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mousemove', (e) => {
      if (!isMouseDown) return;
      const deltaX = e.clientX - previousTouchPosition.x;
      const deltaY = e.clientY - previousTouchPosition.y;
      earthGroup.rotation.y += deltaX * 0.006;
      earthGroup.rotation.x += deltaY * 0.006;
      earthGroup.rotation.x = Math.max(-1.1, Math.min(1.1, earthGroup.rotation.x));
      previousTouchPosition = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', (e) => {
      if (!isMouseDown) return;
      isMouseDown = false;
      const moveDist = Math.hypot(e.clientX - touchStartPos.x, e.clientY - touchStartPos.y);
      if (Date.now() - touchStartTime < 300 && moveDist < 10) {
        const rect = renderer.domElement.getBoundingClientRect();
        touchCoords.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        touchCoords.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(touchCoords, camera);
        const intersects = raycaster.intersectObjects(pinMeshes);
        if (intersects.length > 0) {
          const hitPlace = intersects[0].object.userData.place;
          if (hitPlace) {
            window.parent.postMessage({ type: 'SELECT_PLACE_ID', placeId: hitPlace.id }, '*');
          }
        }
      }
    });

    // Zoom Function for Floating Buttons
    function zoomGlobe(direction) {
      const factor = direction === 'in' ? 0.8 : 1.25;
      const currentDist = camera.position.length();
      const newDist = Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, currentDist * factor));
      camera.position.setLength(newDist);
    }

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);
      if (!isDragging && !isMouseDown) {
        earthGroup.rotation.y += 0.0015; // Slow ambient orbit
      }
      renderer.render(scene, camera);
    }
    animate();

    // Window Resize Handler
    window.addEventListener('resize', () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });

    // Message Listener for Zoom
    window.addEventListener('message', (event) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'ZOOM_IN') {
        zoomGlobe('in');
      } else if (data.type === 'ZOOM_OUT') {
        zoomGlobe('out');
      }
    });
  </script>
</body>
</html>
    `;
  }, [places, selectedPlaceId]);

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

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <iframe
          ref={iframeRef as any}
          srcDoc={htmlContent}
          style={styles.iframe as any}
          title="Globe 3D Engine"
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
    backgroundColor: '#08060D',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    display: 'block',
  },
  fallback: {
    flex: 1,
    backgroundColor: '#08060D',
  },
});
