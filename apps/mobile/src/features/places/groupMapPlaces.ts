import { AndreaMapPlace, MapPlaceType } from '../../types/map';

export const SAME_PLACE_DISTANCE_METERS = 20;

export interface MapPlaceGroup {
  id: string;
  kind: 'single' | 'same_place_group';
  longitude: number;
  latitude: number;
  title?: string;
  dominantType: MapPlaceType;
  itemCount: number;
  items: AndreaMapPlace[];
}

/**
 * Calculates geographical distance in meters between two [longitude, latitude] coordinates using the Haversine formula.
 */
export function getDistanceInMeters(
  coord1: [number, number], // [lng, lat]
  coord2: [number, number]  // [lng, lat]
): number {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;

  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Normalizes an address string for string equality matching.
 */
function normalizeAddress(addr?: string): string {
  if (!addr) return '';
  return addr
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[,\.\-\/\\#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Computes dominant MapPlaceType for a group based on frequency and couple memory hierarchy.
 */
function getDominantType(items: AndreaMapPlace[]): MapPlaceType {
  if (items.length === 1) return items[0].type;

  const counts: Partial<Record<MapPlaceType, number>> = {};
  for (const item of items) {
    counts[item.type] = (counts[item.type] || 0) + 1;
  }

  // Priority order if count ties
  const priorityOrder: MapPlaceType[] = [
    'memory',
    'restaurant',
    'surprise',
    'important_date',
    'trip',
    'future_place',
  ];

  let maxCount = -1;
  let bestType: MapPlaceType = 'memory';

  for (const t of priorityOrder) {
    const c = counts[t] || 0;
    if (c > maxCount) {
      maxCount = c;
      bestType = t;
    }
  }

  return bestType;
}

/**
 * Groups places that belong to the same spot, same address, or are within SAME_PLACE_DISTANCE_METERS (20m).
 * Never arbitrarily jitters or shifts coordinates.
 */
export function groupMapPlaces(places: AndreaMapPlace[]): MapPlaceGroup[] {
  if (!places || places.length === 0) return [];

  const groups: MapPlaceGroup[] = [];
  const assigned = new Set<string>();

  for (let i = 0; i < places.length; i++) {
    const p1 = places[i];
    if (assigned.has(p1.id)) continue;

    const groupItems: AndreaMapPlace[] = [p1];
    assigned.add(p1.id);

    const normAddr1 = normalizeAddress(p1.formattedAddress || p1.subtitle);

    for (let j = i + 1; j < places.length; j++) {
      const p2 = places[j];
      if (assigned.has(p2.id)) continue;

      const normAddr2 = normalizeAddress(p2.formattedAddress || p2.subtitle);

      // Check same address if non-trivial
      const hasSameAddress =
        normAddr1.length > 5 && normAddr2.length > 5 && normAddr1 === normAddr2;

      // Check proximity distance <= 20 meters
      const distance = getDistanceInMeters(
        [p1.longitude, p1.latitude],
        [p2.longitude, p2.latitude]
      );

      if (hasSameAddress || distance <= SAME_PLACE_DISTANCE_METERS) {
        groupItems.push(p2);
        assigned.add(p2.id);
      }
    }

    const itemCount = groupItems.length;
    const kind = itemCount > 1 ? 'same_place_group' : 'single';
    const dominantType = getDominantType(groupItems);

    groups.push({
      id: kind === 'same_place_group' ? `group-${p1.id}-${itemCount}` : p1.id,
      kind,
      longitude: p1.longitude,
      latitude: p1.latitude,
      title: kind === 'same_place_group' ? (p1.formattedAddress || p1.title) : p1.title,
      dominantType,
      itemCount,
      items: groupItems,
    });
  }

  return groups;
}
