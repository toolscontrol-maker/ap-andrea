/**
 * Haversine formula to compute great-circle distance between two GPS coordinates in kilometers.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Total geodesic distance traveled across a sequence of sorted places.
 */
export function calculateTotalRouteDistance(places: { lat: number; lng: number }[]): number {
  if (places.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < places.length - 1; i++) {
    total += calculateHaversineDistanceKm(
      places[i].lat,
      places[i].lng,
      places[i + 1].lat,
      places[i + 1].lng
    );
  }
  return total;
}
