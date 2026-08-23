const MONTH_NAMES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

export function formatDateShort(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    return `${day} ${MONTH_NAMES_ES[month - 1]?.slice(0, 3)} ${year}`;
  } catch {
    return dateString;
  }
}

export function formatDateLong(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    return `${day} de ${MONTH_NAMES_ES[month - 1]} de ${year}`;
  } catch {
    return dateString;
  }
}

export function formatDistanceKm(km: number): string {
  if (km === 0) return '0 km';
  if (km < 1000) return `≈ ${km} km`;
  const formatted = (km / 1000).toFixed(1).replace('.', ',');
  return `≈ ${km.toLocaleString('es-ES')} km`;
}

export const COUNTRY_FLAGS: Record<string, string> = {
  España: '🇪🇸',
  Italia: '🇮🇹',
  Francia: '🇫🇷',
  Japón: '🇯🇵',
  Indonesia: '🇮🇩',
  Portugal: '🇵🇹',
  ReinoUnido: '🇬🇧',
  EEUU: '🇺🇸',
  Alemania: '🇩🇪',
  Grecia: '🇬🇷',
  México: '🇲🇽',
};

export function getCountryFlag(country: string): string {
  return COUNTRY_FLAGS[country] || '📍';
}
