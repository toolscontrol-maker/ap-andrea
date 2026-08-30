import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Supercluster from 'supercluster';
import { AndreaMapPlace, MapBounds, MapCameraState } from '../../types/map';
import { MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE_URL } from '../../lib/mapbox';
import { DEFAULT_MAP_CAMERA, MAP_CLUSTER_CONFIG } from './map.constants';
import { groupMapPlaces, MapPlaceGroup } from '../../features/places/groupMapPlaces';
import { triggerHaptic } from '../../utils/haptics';

export interface AndreaMapProps {
  places: AndreaMapPlace[];
  selectedPlaceId?: string | null;
  selectedGroupId?: string | null;
  initialCamera?: MapCameraState;
  activeFilters?: string[];
  onPlacePress?: (place: AndreaMapPlace) => void;
  onGroupPress?: (group: MapPlaceGroup) => void;
  onCameraIdle?: (bounds: MapBounds) => void;
  onAddPlacePress?: () => void;
}

export function AndreaMap({
  places,
  selectedPlaceId,
  selectedGroupId,
  initialCamera = DEFAULT_MAP_CAMERA,
  onPlacePress,
  onGroupPress,
  onCameraIdle,
}: AndreaMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const idleTimeoutRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [currentZoom, setCurrentZoom] = useState<number>(initialCamera.zoom);

  // 1. Filter out unrevealed secret places
  const visiblePlaces = useMemo(() => {
    return places.filter((p) => {
      if (p.precision === 'none') return false;
      if (p.precision === 'hidden' && p.isRevealed === false) return false;
      return true;
    });
  }, [places]);

  // 2. Group places by exact spot or proximity <= 20 meters
  const placeGroups = useMemo(() => {
    return groupMapPlaces(visiblePlaces);
  }, [visiblePlaces]);

  // 3. Build Supercluster Index with custom properties
  const clusterIndex = useMemo(() => {
    const geojsonFeatures: GeoJSON.Feature<GeoJSON.Point, any>[] = placeGroups.map((group) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [group.longitude, group.latitude],
      },
      properties: {
        id: group.id,
        kind: group.kind,
        itemCount: group.itemCount,
        dominantType: group.dominantType,
        title: group.title,
        group: group,
        memoryCount: group.items.filter((i) => i.type === 'memory').length,
        restaurantCount: group.items.filter((i) => i.type === 'restaurant').length,
        tripCount: group.items.filter((i) => i.type === 'trip' || i.type === 'future_place').length,
        surpriseCount: group.items.filter((i) => i.type === 'surprise').length,
      },
    }));

    const sc = new Supercluster({
      radius: MAP_CLUSTER_CONFIG.radius,
      maxZoom: MAP_CLUSTER_CONFIG.maxZoom,
      map: (props: any) => ({
        memoryCount: props.memoryCount || 0,
        restaurantCount: props.restaurantCount || 0,
        tripCount: props.tripCount || 0,
        surpriseCount: props.surpriseCount || 0,
      }),
      reduce: (accumulated: any, props: any) => {
        accumulated.memoryCount += props.memoryCount;
        accumulated.restaurantCount += props.restaurantCount;
        accumulated.tripCount += props.tripCount;
        accumulated.surpriseCount += props.surpriseCount;
      },
    });

    sc.load(geojsonFeatures);
    return sc;
  }, [placeGroups]);

  // 4. Dynamic Mapbox GL JS Loader
  useEffect(() => {
    if (!containerRef.current || !MAPBOX_ACCESS_TOKEN || typeof window === 'undefined') return;

    let isCancelled = false;

    const loadMapboxGL = async () => {
      if (!document.getElementById('mapbox-gl-css')) {
        const link = document.createElement('link');
        link.id = 'mapbox-gl-css';
        link.rel = 'stylesheet';
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css';
        document.head.appendChild(link);
      }

      if (!(window as any).mapboxgl) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.js';
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Mapbox GL JS'));
          document.head.appendChild(script);
        });
      }

      if (isCancelled || !containerRef.current) return;

      const mapboxgl = (window as any).mapboxgl;
      mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: MAPBOX_STYLE_URL,
        center: [initialCamera.longitude, initialCamera.latitude],
        zoom: initialCamera.zoom,
        pitch: 25,
        attributionControl: false,
      });

      map.on('load', () => {
        if (!isCancelled) setIsMapReady(true);
      });

      const updateZoomState = () => {
        if (!isCancelled && map) {
          setCurrentZoom(map.getZoom());
        }
      };

      map.on('zoom', updateZoomState);
      map.on('move', updateZoomState);

      map.on('moveend', () => {
        updateZoomState();
        if (!onCameraIdle) return;
        if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);

        idleTimeoutRef.current = setTimeout(() => {
          try {
            const bounds = map.getBounds();
            if (bounds) {
              onCameraIdle({
                ne: [bounds.getNorthEast().lng, bounds.getNorthEast().lat],
                sw: [bounds.getSouthWest().lng, bounds.getSouthWest().lat],
              });
            }
          } catch (err) {
            // Safe catch
          }
        }, 300);
      });

      mapRef.current = map;
      setTimeout(() => {
        if (!isCancelled) setIsMapReady(true);
      }, 200);
    };

    loadMapboxGL();

    return () => {
      isCancelled = true;
      setIsMapReady(false);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initialCamera.latitude, initialCamera.longitude, initialCamera.zoom, onCameraIdle]);

  // 5. Render Clustered & Hierarchical Apple-Style Markers
  const renderMarkers = useCallback(() => {
    const map = mapRef.current;
    const mapboxgl = typeof window !== 'undefined' ? (window as any).mapboxgl : null;
    if (!map || !mapboxgl || !clusterIndex) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Get map bounding box and current integer zoom
    const bounds = map.getBounds();
    const zoom = Math.floor(map.getZoom());
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];

    const clustersAndPoints = clusterIndex.getClusters(bbox, zoom);

    clustersAndPoints.forEach((feature) => {
      const [lng, lat] = feature.geometry.coordinates;
      const isCluster = feature.properties.cluster === true;

      // ── CASE A: GEOGRAPHIC CLUSTER ──
      if (isCluster) {
        const clusterId = feature.id as number;
        const count = feature.properties.point_count;
        const memCount = feature.properties.memoryCount || 0;
        const restCount = feature.properties.restaurantCount || 0;
        const tripCount = feature.properties.tripCount || 0;
        const surpriseCount = feature.properties.surpriseCount || 0;

        const svgSparkle = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

        let clusterBg = '#5C9F9A';
        if (memCount >= restCount && memCount >= tripCount && memCount > 0) {
          clusterBg = '#E05666'; // Coral primary
        } else if (restCount >= memCount && restCount >= tripCount && restCount > 0) {
          clusterBg = '#D4AF37'; // Butter / Gold
        } else if (surpriseCount > 0) {
          clusterBg = '#C47089'; // Deep Coral
        }

        const size = Math.min(54, Math.max(46, 44 + Math.log2(count) * 3));

        const clusterEl = document.createElement('div');
        clusterEl.className = 'andrea-map-cluster-marker';
        clusterEl.style.width = `${size}px`;
        clusterEl.style.height = `${size}px`;
        clusterEl.style.borderRadius = '50%';
        clusterEl.style.backgroundColor = clusterBg;
        clusterEl.style.border = '2px solid rgba(255, 248, 242, 0.95)';
        clusterEl.style.boxShadow = `0 6px 16px rgba(0, 0, 0, 0.5), 0 0 12px ${clusterBg}60`;
        clusterEl.style.display = 'flex';
        clusterEl.style.alignItems = 'center';
        clusterEl.style.justifyContent = 'center';
        clusterEl.style.cursor = 'pointer';
        clusterEl.style.pointerEvents = 'auto';
        clusterEl.style.userSelect = 'none';
        clusterEl.style.transform = 'scale(1)';
        clusterEl.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
        clusterEl.style.zIndex = '50';

        // Content: SVG + Count
        clusterEl.innerHTML = `
          <div style="display:flex;align-items:center;gap:3px;color:#FFFFFF;font-family:Inter,sans-serif;font-weight:700;font-size:13px;">
            ${svgSparkle}
            <span>${count}</span>
          </div>
        `;

        clusterEl.addEventListener('mouseenter', () => {
          clusterEl.style.transform = 'scale(1.08)';
        });
        clusterEl.addEventListener('mouseleave', () => {
          clusterEl.style.transform = 'scale(1)';
        });

        clusterEl.addEventListener('click', (e) => {
          e.stopPropagation();
          triggerHaptic('medium');
          try {
            const expansionZoom = clusterIndex.getClusterExpansionZoom(clusterId);
            map.easeTo({
              center: [lng, lat],
              zoom: Math.min(expansionZoom, 17),
              duration: 450,
            });
          } catch (err) {
            map.easeTo({
              center: [lng, lat],
              zoom: Math.min(map.getZoom() + 2, 17),
              duration: 450,
            });
          }
        });

        const marker = new mapboxgl.Marker({ element: clusterEl, anchor: 'center' })
          .setLngLat([lng, lat])
          .addTo(map);

        markersRef.current.push(marker);
        return;
      }

      // ── CASE B: SAME-PLACE GROUP OR INDIVIDUAL PLACE ──
      const group = feature.properties.group as MapPlaceGroup;
      if (!group) return;

      const isSamePlaceGroup = group.kind === 'same_place_group';
      const singlePlace = group.items[0];

      // Check if selected
      const isSelected =
        (selectedGroupId && selectedGroupId === group.id) ||
        (selectedPlaceId && group.items.some((item) => item.id === selectedPlaceId));

      // Color and icon mapping
      let color = '#5C9F9A';
      let svgIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;

      if (group.dominantType === 'memory') {
        color = '#E05666';
        svgIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
      } else if (group.dominantType === 'restaurant') {
        color = '#D4AF37';
        svgIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><line x1="15" y1="2" x2="15" y2="22"/><path d="M6 2v20"/><path d="M4 2h4"/></svg>`;
      } else if (group.dominantType === 'trip' || group.dominantType === 'future_place') {
        color = '#5C9F9A';
        svgIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`;
      } else if (group.dominantType === 'surprise') {
        color = '#C47089';
        svgIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/></svg>`;
      } else if (group.dominantType === 'important_date') {
        color = '#D4AF37';
        svgIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
      }

      // Root Container
      const rootEl = document.createElement('div');
      rootEl.className = 'andrea-pin-marker-wrapper';
      rootEl.style.display = 'flex';
      rootEl.style.flexDirection = 'column';
      rootEl.style.alignItems = 'center';
      rootEl.style.justifyContent = 'center';
      rootEl.style.cursor = 'pointer';
      rootEl.style.pointerEvents = 'auto';
      rootEl.style.userSelect = 'none';
      rootEl.style.transform = isSelected ? 'scale(1.15)' : 'scale(1)';
      rootEl.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
      rootEl.style.zIndex = isSelected ? '1000' : '15';

      // 1. Orb
      const orbEl = document.createElement('div');
      const orbSize = isSelected ? 42 : isSamePlaceGroup ? 42 : 36;
      orbEl.style.width = `${orbSize}px`;
      orbEl.style.height = `${orbSize}px`;
      orbEl.style.borderRadius = '50%';
      orbEl.style.backgroundColor = color;
      orbEl.style.border = isSelected
        ? '2.5px solid #FFFFFF'
        : '1.5px solid rgba(255, 248, 242, 0.95)';
      orbEl.style.boxShadow = isSelected
        ? `0 0 0 4px rgba(224, 86, 102, 0.45), 0 8px 18px rgba(0, 0, 0, 0.7)`
        : '0 4px 10px rgba(0, 0, 0, 0.5)';
      orbEl.style.display = 'flex';
      orbEl.style.alignItems = 'center';
      orbEl.style.justifyContent = 'center';
      orbEl.style.color = '#FFFFFF';
      orbEl.style.position = 'relative';

      if (isSamePlaceGroup) {
        orbEl.innerHTML = `
          ${svgIcon}
          <div style="position:absolute;top:-5px;right:-6px;background:#0A1426;color:#FFF;font-family:Inter,sans-serif;font-size:9px;font-weight:700;border-radius:9px;padding:1px 5px;border:1.5px solid rgba(255,248,242,0.95);">
            +${group.itemCount}
          </div>
        `;
      } else {
        orbEl.innerHTML = svgIcon;
      }

      rootEl.appendChild(orbEl);

      // 2. SHORT LABEL RULE: ONLY SHOW LABEL IF THIS PIN IS SELECTED!
      if (isSelected) {
        const labelEl = document.createElement('div');
        labelEl.style.marginTop = '6px';
        labelEl.style.padding = '4px 9px';
        labelEl.style.backgroundColor = 'rgba(8, 16, 32, 0.92)';
        labelEl.style.backdropFilter = 'blur(12px)';
        labelEl.style.borderRadius = '8px';
        labelEl.style.border = '1px solid rgba(255, 248, 242, 0.2)';
        labelEl.style.textAlign = 'center';
        labelEl.style.color = '#FFFFFF';
        labelEl.style.fontFamily = 'Inter, sans-serif';
        labelEl.style.fontSize = '11px';
        labelEl.style.fontWeight = '600';
        labelEl.style.lineHeight = '14px';
        labelEl.style.maxWidth = '140px';
        labelEl.style.whiteSpace = 'normal';
        labelEl.style.wordBreak = 'break-word';
        labelEl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.6)';

        const rawTitle = isSamePlaceGroup
          ? `${group.title || 'Mismo rincón'} (${group.itemCount})`
          : singlePlace.title;

        // Truncate cleanly to 36 chars max
        labelEl.innerText =
          rawTitle.length > 36 ? rawTitle.substring(0, 34) + '...' : rawTitle;

        rootEl.appendChild(labelEl);
      }

      // Click Interaction
      rootEl.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic('medium');

        if (isSamePlaceGroup) {
          onGroupPress ? onGroupPress(group) : onPlacePress && onPlacePress(group.items[0]);
        } else {
          onPlacePress && onPlacePress(singlePlace);
        }
      });

      const marker = new mapboxgl.Marker({ element: rootEl, anchor: 'center' })
        .setLngLat([lng, lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [clusterIndex, selectedPlaceId, selectedGroupId, onPlacePress, onGroupPress]);

  // Re-render markers on zoom/move/places change
  useEffect(() => {
    if (!isMapReady) return;
    renderMarkers();
  }, [isMapReady, currentZoom, placeGroups, selectedPlaceId, selectedGroupId, renderMarkers]);

  // Re-render on map moveend
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    const onMoveEnd = () => {
      renderMarkers();
    };

    map.on('moveend', onMoveEnd);
    return () => {
      map.off('moveend', onMoveEnd);
    };
  }, [isMapReady, renderMarkers]);

  // Fly to selected place
  useEffect(() => {
    if (selectedPlaceId && mapRef.current) {
      const selected = places.find((p) => p.id === selectedPlaceId);
      if (selected) {
        mapRef.current.flyTo({
          center: [selected.longitude, selected.latitude],
          zoom: Math.max(mapRef.current.getZoom(), 15),
          duration: 700,
          essential: true,
        });
      }
    }
  }, [selectedPlaceId, places]);

  if (!MAPBOX_ACCESS_TOKEN) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Falta EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN</Text>
        <Text style={styles.errorSubtitle}>
          Configúralo en apps/mobile/.env para renderizar el mapa de Mapbox.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          backgroundColor: '#071124',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#071124',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#071124',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B81',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    maxWidth: 320,
  },
});
