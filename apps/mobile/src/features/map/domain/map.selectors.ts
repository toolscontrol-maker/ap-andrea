import { MapPlace } from '@andrea/types';
import { MapFilter } from './map.types';

export function filterPlaces(
  places: MapPlace[],
  filter: MapFilter,
  timelineCursorDate?: string | null
): MapPlace[] {
  return places.filter((p) => {
    // 1. Timeline Scrubber filter (only show places up to timelineCursorDate)
    if (timelineCursorDate && p.date > timelineCursorDate) {
      return false;
    }

    // 2. Category filter
    if (filter.category !== 'all' && p.category !== filter.category) {
      return false;
    }

    // 3. Author filter
    if (filter.authorId !== 'all' && p.authorId !== filter.authorId) {
      return false;
    }

    // 4. Mood Tag filter
    if (filter.moodTag !== 'all' && p.moodTag !== filter.moodTag) {
      return false;
    }

    // 5. Photos only filter
    if (filter.onlyWithPhotos && (!p.photos || p.photos.length === 0)) {
      return false;
    }

    // 6. Future plans filter
    if (filter.onlyFuturePlans && !p.isFuturePlan) {
      return false;
    }

    // 7. Date range filter
    if (filter.dateRange === 'this_year') {
      const currentYear = new Date().getFullYear().toString();
      if (!p.date.startsWith(currentYear)) return false;
    } else if (filter.dateRange === 'last_year') {
      const lastYear = (new Date().getFullYear() - 1).toString();
      if (!p.date.startsWith(lastYear)) return false;
    }

    return true;
  });
}
