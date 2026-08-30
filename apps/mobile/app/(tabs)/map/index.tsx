import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AndreaMap } from '../../../src/components/map/AndreaMap';
import { MapFilters, MapFilterKey, FILTER_TYPE_MAP } from '../../../src/components/map/MapFilters';
import { MapBottomSheet } from '../../../src/components/map/MapBottomSheet';
import { AddPlaceLocationModal } from '../../../src/components/map/AddPlaceLocationModal';
import { DEMO_MAP_PLACES } from '../../../src/components/map/map.constants';
import { groupMapPlaces, MapPlaceGroup } from '../../../src/features/places/groupMapPlaces';
import { AndreaMapPlace } from '../../../src/types/map';
import { Colors } from '../../../src/theme/colors';
import { Radii, Spacing } from '../../../src/theme/tokens';
import {
  IconPlus,
  IconLocateFixed,
  IconChevronDown,
  IconSearch,
  IconX,
  IconCompass,
  IconHeart,
  IconUtensils,
  IconSparkles,
  IconMoon,
  IconEye,
} from '../../../src/components/ui/Icons';
import { StorageEngine } from '../../../src/services/storage';
import { triggerHaptic } from '../../../src/utils/haptics';

export default function MapScreen() {
  const insets = useSafeAreaInsets();

  const [activeFilter, setActiveFilter] = useState<MapFilterKey>('all');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isAtlasMenuOpen, setIsAtlasMenuOpen] = useState(false);
  const [showOverviewCard, setShowOverviewCard] = useState(true);

  // Dynamic places state with local persistence
  const [allPlaces, setAllPlaces] = useState<AndreaMapPlace[]>(DEMO_MAP_PLACES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Add / Edit Place Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<AndreaMapPlace | null>(null);

  useEffect(() => {
    async function loadPlaces() {
      const saved = await StorageEngine.getItem<AndreaMapPlace[]>('andrea_map_places_v4', DEMO_MAP_PLACES);
      if (saved && saved.length > 0) {
        const milestoneIds = DEMO_MAP_PLACES.map((p) => p.id);
        const userAddedPlaces = saved.filter((p) => !milestoneIds.includes(p.id));
        setAllPlaces([...DEMO_MAP_PLACES, ...userAddedPlaces]);
      } else {
        setAllPlaces(DEMO_MAP_PLACES);
      }
      setIsLoaded(true);
    }
    loadPlaces();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    StorageEngine.setItem('andrea_map_places_v4', allPlaces);
  }, [allPlaces, isLoaded]);

  const filteredPlaces = useMemo(() => {
    const filterTypes = FILTER_TYPE_MAP[activeFilter];
    if (filterTypes === 'all') return allPlaces;
    return allPlaces.filter((p) => filterTypes.includes(p.type));
  }, [allPlaces, activeFilter]);

  const currentGroups = useMemo(() => {
    return groupMapPlaces(filteredPlaces);
  }, [filteredPlaces]);

  const selectedPlace = useMemo(() => {
    if (!selectedPlaceId) return null;
    return allPlaces.find((p) => p.id === selectedPlaceId) || null;
  }, [allPlaces, selectedPlaceId]);

  const selectedGroup = useMemo(() => {
    if (!selectedGroupId) return null;
    return currentGroups.find((g) => g.id === selectedGroupId) || null;
  }, [currentGroups, selectedGroupId]);

  const filterCounts = useMemo(() => {
    return {
      all: allPlaces.length,
      memories: allPlaces.filter((p) => FILTER_TYPE_MAP.memories.includes(p.type)).length,
      restaurants: allPlaces.filter((p) => FILTER_TYPE_MAP.restaurants.includes(p.type)).length,
      trips: allPlaces.filter((p) => FILTER_TYPE_MAP.trips.includes(p.type)).length,
      dreams: allPlaces.filter((p) => FILTER_TYPE_MAP.dreams.includes(p.type)).length,
    };
  }, [allPlaces]);

  const handlePlacePress = useCallback((place: AndreaMapPlace) => {
    triggerHaptic('medium');
    setSelectedGroupId(null);
    setSelectedPlaceId(place.id);
  }, []);

  const handleGroupPress = useCallback((group: MapPlaceGroup) => {
    triggerHaptic('medium');
    setSelectedPlaceId(null);
    setSelectedGroupId(group.id);
  }, []);

  const handleSelectPlaceFromGroup = useCallback((place: AndreaMapPlace) => {
    triggerHaptic('selection');
    setSelectedGroupId(null);
    setSelectedPlaceId(place.id);
  }, []);

  const handleCloseSheet = useCallback(() => {
    triggerHaptic('light');
    setSelectedPlaceId(null);
    setSelectedGroupId(null);
  }, []);

  const handleViewDetail = useCallback((place: AndreaMapPlace) => {
    Alert.alert(
      place.title,
      `${place.subtitle || place.formattedAddress || ''}\n\n${place.description || 'Sin descripción adicional.'}`
    );
  }, []);

  const handleOpenAddModal = () => {
    triggerHaptic('light');
    setEditingPlace(null);
    setIsAddModalOpen(true);
  };

  const handleEditLocation = (place: AndreaMapPlace) => {
    triggerHaptic('light');
    setSelectedPlaceId(null);
    setSelectedGroupId(null);
    setEditingPlace(place);
    setIsAddModalOpen(true);
  };

  const handleSaveVerifiedPlace = (place: AndreaMapPlace) => {
    setAllPlaces((prev) => {
      const existingIdx = prev.findIndex((p) => p.id === place.id);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = place;
        return next;
      }
      return [place, ...prev];
    });
    setSelectedGroupId(null);
    setSelectedPlaceId(place.id);
    setEditingPlace(null);
  };

  const handleRecenter = () => {
    triggerHaptic('light');
    setSelectedPlaceId(null);
    setSelectedGroupId(null);
  };

  const topOffset = Math.max(insets.top + 6, 12);
  const isSheetOpen = Boolean(selectedPlace || selectedGroup);

  return (
    <View style={styles.container}>
      {/* 1. Nocturnal Mapbox Canvas */}
      <AndreaMap
        places={filteredPlaces}
        selectedPlaceId={selectedPlaceId}
        selectedGroupId={selectedGroupId}
        onPlacePress={handlePlacePress}
        onGroupPress={handleGroupPress}
        onAddPlacePress={handleOpenAddModal}
      />

      {/* 2. Soft Nocturnal Vignette Gradient Overlay */}
      <View style={styles.vignetteOverlay} pointerEvents="none" />

      {/* 3. Floating 2-Row Header */}
      <View style={[styles.floatingHeader, { top: topOffset }]} pointerEvents="box-none">
        {/* Row 1: Central Atlas Pill Title */}
        <View style={styles.headerRow1} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.atlasTitlePill}
            activeOpacity={0.8}
            onPress={() => {
              triggerHaptic('light');
              setIsAtlasMenuOpen(true);
            }}
            accessibilityLabel="Menú de atlas"
          >
            <View style={styles.atlasTitleTextCol}>
              <View style={styles.atlasTitleMainRow}>
                <Text style={styles.atlasTitleText}>Nuestra historia</Text>
                <IconChevronDown size={13} color="rgba(255, 248, 242, 0.75)" strokeWidth={2.4} />
              </View>
              <Text style={styles.atlasSubtitleText}>
                {allPlaces.length} momentos en vuestro mapa
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Row 2: Horizontal Filter Chips Strip */}
        <View style={styles.headerRow2} pointerEvents="box-none">
          <MapFilters
            activeFilter={activeFilter}
            onFilterChange={(f) => {
              setActiveFilter(f);
            }}
            counts={filterCounts}
            onSearchPress={handleOpenAddModal}
          />
        </View>
      </View>

      {/* 4. Single Right-Hand Side Vertical Capsule */}
      <View style={[styles.sideCapsuleContainer, { top: topOffset + 96 }]} pointerEvents="box-none">
        <View style={styles.sideCapsule}>
          {selectedPlaceId || selectedGroupId ? (
            <TouchableOpacity
              style={styles.sideCapsuleBtn}
              activeOpacity={0.75}
              onPress={() => {
                triggerHaptic('light');
                setSelectedPlaceId(null);
                setSelectedGroupId(null);
              }}
              accessibilityLabel="Deseleccionar rincón"
            >
              <IconX size={18} color="rgba(255, 248, 242, 0.9)" strokeWidth={2.2} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.sideCapsuleBtn}
              activeOpacity={0.75}
              onPress={() => {
                triggerHaptic('light');
                handleRecenter();
              }}
              accessibilityLabel="Mi ubicación y centrar"
            >
              <IconLocateFixed size={18} color="rgba(255, 248, 242, 0.9)" strokeWidth={2} />
            </TouchableOpacity>
          )}

          <View style={styles.sideCapsuleDivider} />

          <TouchableOpacity
            style={styles.sideCapsuleBtn}
            activeOpacity={0.75}
            onPress={() => {
              triggerHaptic('light');
              setIsAtlasMenuOpen(true);
            }}
            accessibilityLabel="Capas y vistas del atlas"
          >
            <IconCompass size={18} color="rgba(255, 248, 242, 0.9)" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 5. Map Overview Card (Visible when NO place is selected) */}
      {!isSheetOpen && showOverviewCard && (
        <View style={styles.overviewCardWrapper} pointerEvents="box-none">
          <View style={styles.overviewCard}>
            <View style={styles.overviewCardLeft}>
              <Text style={styles.overviewCardBadge}>✦ Vuestro atlas</Text>
              <Text style={styles.overviewCardSubtitle}>
                {allPlaces.length} momentos · {currentGroups.length} lugares · 1 historia
              </Text>
            </View>
            <View style={styles.overviewCardActions}>
              <TouchableOpacity
                style={styles.overviewExploreBtn}
                activeOpacity={0.8}
                onPress={() => {
                  triggerHaptic('selection');
                  setActiveFilter('all');
                }}
              >
                <Text style={styles.overviewExploreBtnText}>Explorar →</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.overviewDismissBtn}
                activeOpacity={0.7}
                onPress={() => {
                  triggerHaptic('light');
                  setShowOverviewCard(false);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <IconX size={12} color="rgba(255, 248, 242, 0.4)" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* 6. Floating Creation CTA Pill (Above Tab Bar) */}
      {!isSheetOpen && (
        <View style={styles.creationCtaWrapper} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.creationCtaPill}
            activeOpacity={0.85}
            onPress={handleOpenAddModal}
            accessibilityLabel="Guardar momento en el mapa"
          >
            <IconPlus size={16} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.creationCtaText}>Guardar momento</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 7. Warm Light Bottom Sheet */}
      <MapBottomSheet
        place={selectedPlace}
        group={selectedGroup}
        onClose={handleCloseSheet}
        onViewDetail={handleViewDetail}
        onEditLocation={handleEditLocation}
        onSelectPlaceFromGroup={handleSelectPlaceFromGroup}
      />

      {/* 8. Atlas Quick Menu Modal */}
      <Modal
        visible={isAtlasMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAtlasMenuOpen(false)}
      >
        <TouchableOpacity
          style={styles.menuModalBackdrop}
          activeOpacity={1}
          onPress={() => setIsAtlasMenuOpen(false)}
        >
          <View style={[styles.menuModalCard, { marginTop: topOffset + 50 }]}>
            <View style={styles.menuHeaderRow}>
              <Text style={styles.menuTitle}>Vistas del Atlas</Text>
              <TouchableOpacity
                onPress={() => setIsAtlasMenuOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <IconX size={14} color="#766B72" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => {
                setActiveFilter('all');
                setIsAtlasMenuOpen(false);
              }}
            >
              <IconCompass size={17} color="#2B2129" strokeWidth={2} />
              <Text style={styles.menuItemText}>Nuestra historia completa</Text>
              <Text style={styles.menuItemBadge}>{allPlaces.length}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => {
                setActiveFilter('memories');
                setIsAtlasMenuOpen(false);
              }}
            >
              <IconHeart size={17} color="#E05666" strokeWidth={2} />
              <Text style={styles.menuItemText}>Recuerdos y citas</Text>
              <Text style={styles.menuItemBadge}>{filterCounts.memories}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => {
                setActiveFilter('restaurants');
                setIsAtlasMenuOpen(false);
              }}
            >
              <IconUtensils size={17} color="#D4AF37" strokeWidth={2} />
              <Text style={styles.menuItemText}>Restaurantes y rincones</Text>
              <Text style={styles.menuItemBadge}>{filterCounts.restaurants}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => {
                setActiveFilter('trips');
                setIsAtlasMenuOpen(false);
              }}
            >
              <IconSparkles size={17} color="#5C9F9A" strokeWidth={2} />
              <Text style={styles.menuItemText}>Viajes e ilusiones</Text>
              <Text style={styles.menuItemBadge}>{filterCounts.trips}</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <View style={styles.menuSettingRow}>
              <View style={styles.menuSettingLeft}>
                <IconMoon size={16} color="#766B72" strokeWidth={2} />
                <Text style={styles.menuSettingLabel}>Mapa nocturno</Text>
              </View>
              <Text style={styles.menuSettingStatus}>Activo</Text>
            </View>

            <View style={styles.menuSettingRow}>
              <View style={styles.menuSettingLeft}>
                <IconEye size={16} color="#766B72" strokeWidth={2} />
                <Text style={styles.menuSettingLabel}>Etiquetas al seleccionar</Text>
              </View>
              <Text style={styles.menuSettingStatus}>Activado</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 9. Real Mapbox Geocoding & Visual Pin Confirmation Modal */}
      <AddPlaceLocationModal
        visible={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPlace(null);
        }}
        onSavePlace={handleSaveVerifiedPlace}
        initialPlace={editingPlace}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#071124',
    position: 'relative',
  },
  vignetteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web'
      ? ({
          backgroundImage:
            'radial-gradient(ellipse at center, rgba(7, 17, 36, 0) 45%, rgba(7, 17, 36, 0.45) 100%)',
          pointerEvents: 'none',
        } as any)
      : {}),
    zIndex: 10,
  },
  floatingHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 90,
  },
  headerRow1: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    paddingHorizontal: 60,
  },
  atlasTitlePill: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 20, 38, 0.85)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(25px) saturate(190%)',
          WebkitBackdropFilter: 'blur(25px) saturate(190%)',
        } as any)
      : {}),
    borderWidth: 1.2,
    borderColor: 'rgba(255, 248, 242, 0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  atlasTitleTextCol: {
    alignItems: 'center',
  },
  atlasTitleMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  atlasTitleText: {
    fontSize: 14.5,
    color: '#FFFFFF',
    letterSpacing: -0.2,
    fontWeight: '600',
  },
  atlasSubtitleText: {
    fontSize: 10.5,
    color: 'rgba(255, 248, 242, 0.55)',
    marginTop: 1,
  },
  headerRow2: {
    width: '100%',
  },
  sideCapsuleContainer: {
    position: 'absolute',
    right: 16,
    zIndex: 95,
  },
  sideCapsule: {
    width: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(10, 20, 38, 0.88)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(25px) saturate(190%)',
          WebkitBackdropFilter: 'blur(25px) saturate(190%)',
        } as any)
      : {}),
    borderWidth: 1.2,
    borderColor: 'rgba(255, 248, 242, 0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 8,
    alignItems: 'center',
    paddingVertical: 4,
  },
  sideCapsuleBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideCapsuleDivider: {
    width: 22,
    height: 1,
    backgroundColor: 'rgba(255, 248, 242, 0.10)',
  },
  overviewCardWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 144 : 156,
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 85,
  },
  overviewCard: {
    width: '100%',
    maxWidth: 440,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 20, 38, 0.88)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(28px) saturate(190%)',
          WebkitBackdropFilter: 'blur(28px) saturate(190%)',
        } as any)
      : {}),
    borderWidth: 1.2,
    borderColor: 'rgba(255, 248, 242, 0.10)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  overviewCardLeft: {
    flex: 1,
  },
  overviewCardBadge: {
    fontSize: 12.5,
    color: '#FFFFFF',
    letterSpacing: -0.15,
  },
  overviewCardSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 248, 242, 0.55)',
    marginTop: 1,
  },
  overviewCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overviewExploreBtn: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(255, 248, 242, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 248, 242, 0.15)',
  },
  overviewExploreBtnText: {
    fontSize: 11,
    color: '#FFFFFF',
  },
  overviewDismissBtn: {
    padding: 4,
  },
  creationCtaWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 88 : 98,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 90,
  },
  creationCtaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: '#E05666',
    shadowColor: '#E05666',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  creationCtaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  menuModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
  },
  menuModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFCFA',
    borderRadius: 24,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 18,
  },
  menuHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(58, 47, 56, 0.06)',
  },
  menuTitle: {
    fontSize: 15,
    color: '#2B2129',
    letterSpacing: -0.2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 10,
  },
  menuItemText: {
    fontSize: 13.5,
    color: '#2B2129',
    flex: 1,
  },
  menuItemBadge: {
    fontSize: 11,
    color: '#766B72',
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(58, 47, 56, 0.08)',
    marginVertical: 6,
  },
  menuSettingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  menuSettingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuSettingLabel: {
    fontSize: 12.5,
    color: '#554A51',
  },
  menuSettingStatus: {
    fontSize: 11,
    color: '#E05666',
  },
});
