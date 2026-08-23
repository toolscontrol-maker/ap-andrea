import { MapPlace } from '@andrea/types';
import { TimelineMilestone } from './map.types';
import { formatDateLong } from '../utils/formatters';
import { calculateHaversineDistanceKm } from '../utils/coordinates';

export function generateTimelineMilestones(places: MapPlace[]): TimelineMilestone[] {
  if (places.length === 0) return [];

  const sorted = [...places].sort((a, b) => a.date.localeCompare(b.date));
  const milestones: TimelineMilestone[] = [];
  let cumDistance = 0;

  for (let i = 0; i < sorted.length; i++) {
    const place = sorted[i];
    if (i > 0) {
      cumDistance += calculateHaversineDistanceKm(
        sorted[i - 1].lat,
        sorted[i - 1].lng,
        place.lat,
        place.lng
      );
    }

    let narrative = `Momento en ${place.cityName}.`;
    if (place.category === 'primer_encuentro') {
      narrative = `Donde empezó toda nuestra historia.`;
    } else if (place.category === 'viaje') {
      narrative = `Nuestra escapada inolvidable a ${place.cityName}.`;
    } else if (place.category === 'cita') {
      narrative = `Aquella velada especial en ${place.cityName}.`;
    } else if (place.category === 'escapada') {
      narrative = `Desconexión y complicidad en ${place.cityName}.`;
    }

    milestones.push({
      date: place.date,
      formattedDate: formatDateLong(place.date),
      narrativeText: narrative,
      places: [place],
      cumulativeDistanceKm: cumDistance,
    });
  }

  return milestones;
}
