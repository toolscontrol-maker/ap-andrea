import fs from 'fs';
import path from 'path';

const projectRoot = 'c:\\Users\\angel chisvert\\Desktop\\ANDREA APP';
const mobileRoot = path.join(projectRoot, 'apps', 'mobile');

// ── 1. apps/mobile/src/types/map.ts ──
const typesMapTs = `export type MapPlaceType =
  | 'memory'        // Recuerdo especial
  | 'restaurant'    // Restaurante / Cafetería
  | 'stage'         // Etapa (Canet, Comte del Real)
  | 'date'          // Cita con 1 o 2 destinos
  | 'trip'          // Viaje fuera de España / Escapada
  | 'future_place'  // Sueño futuro
  | 'surprise'      // Sorpresa
  | 'important_date';

export type LocationSource =
  | 'google_places'
  | 'mapbox_search'
  | 'manual_pin'
  | 'device_location'
  | 'city_centroid'
  | 'imported'
  | 'legacy_mock';

export type LocationPrecision =
  | 'exact'
  | 'approximate'
  | 'city'
  | 'hidden'
  | 'none';

export interface VerifiedLocation {
  latitude: number;
  longitude: number;
  source: LocationSource;
  precision: LocationPrecision;
  verifiedByUser: boolean;
  verifiedAt?: string;
  name?: string;
  formattedAddress?: string;
  city?: string;
  countryCode?: string;
  originalQuery?: string;
  provider: 'google' | 'mapbox';
}

export interface AndreaMapPlace {
  id: string;
  type: MapPlaceType;

  title: string;
  subtitle?: string;
  description?: string;

  latitude: number;
  longitude: number;
  precision: LocationPrecision;
  source?: LocationSource;
  verifiedByUser?: boolean;
  formattedAddress?: string;
  city?: string;

  imageUrl?: string;
  photos?: string[];
  date?: string;
  isPrivate?: boolean;
  isRevealed?: boolean;

  color?: string;
  encryptedPayload?: string;

  // ── Etapa ──
  startDate?: string;
  endDate?: string;
  isOngoing?: boolean;
  stageSummary?: string;

  // ── Recuerdo ──
  hasDateRange?: boolean;
  dateRangeEnd?: string;
  emotionTag?: string;

  // ── Cita ──
  invitedBy?: 'tonet' | 'andrea' | 'both';
  destination1?: string;
  destination2?: string;
  restaurantId?: string;

  // ── Viaje ──
  accommodation?: string; // Dónde nos alojamos
  tripDurationDays?: number;
  visitedPlaces?: string[]; // Restaurantes y sitios visitados
}

export interface MapBounds {
  ne: [number, number]; // [lng, lat]
  sw: [number, number]; // [lng, lat]
}

export interface MapCameraState {
  latitude: number;
  longitude: number;
  zoom: number;
}
`;
fs.writeFileSync(path.join(mobileRoot, 'src', 'types', 'map.ts'), typesMapTs, 'utf8');

// ── 2. apps/mobile/src/components/map/map.constants.ts ──
const mapConstantsTs = `import { AndreaMapPlace, MapCameraState } from '../../types/map';

export const DEFAULT_MAP_CAMERA: MapCameraState = {
  latitude: 39.4699,
  longitude: -0.3763,
  zoom: 12.5,
};

export const MAP_CLUSTER_CONFIG = {
  radius: 58,
  maxZoom: 16,
  showIndividualPinsAtZoom: 13,
  showShortLabelAtZoom: 16,
} as const;

export const DEMO_MAP_PLACES: AndreaMapPlace[] = [
  // 1. Donde nos conocimos
  {
    id: 'milestone-nos-conocimos',
    type: 'memory',
    title: 'Donde nos conocimos',
    subtitle: 'Ent. Rico, 6, Quatre Carreres, 46013 Valencia, Spain',
    description: 'La noche mágica del 23 de noviembre de 2024 donde cruzamos miradas y nos conocimos por primera vez. Esa noche empezó nuestra historia.',
    latitude: 39.450132,
    longitude: -0.353479,
    precision: 'exact',
    date: '2024-11-23',
    source: 'google_places',
    verifiedByUser: true,
    formattedAddress: 'Ent. Rico, 6, Quatre Carreres, 46013 Valencia, Spain',
    city: 'Valencia',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop'
    ],
    emotionTag: 'Magia & Destino',
  },

  // 2. Primera Cita · Alqueria del Pou
  {
    id: 'milestone-primera-cita',
    type: 'date',
    title: 'Nuestra Primera Cita · Alqueria del Pou',
    subtitle: "Ent. Rico, 6, Quatre Carreres, 46013 Valencia, Spain",
    description: 'Nuestra primera cita oficial en el restaurante Alqueria del Pou. Risas, confidencias y donde supimos que queríamos estar juntos.',
    latitude: 39.450084,
    longitude: -0.353529,
    precision: 'exact',
    date: '2024-12-05',
    source: 'google_places',
    verifiedByUser: true,
    formattedAddress: "Ent. Rico, 6, Quatre Carreres, 46013 Valencia, Spain",
    city: 'Valencia',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop'
    ],
    invitedBy: 'tonet',
    destination1: "Restaurante Alqueria del Pou",
    destination2: "Paseo nocturno por la huerta de Valencia",
  },

  // 3. Primer Italiano · Pasta e Passione
  {
    id: 'memory-pasta-passione',
    type: 'restaurant',
    title: 'Primera vez en un italiano · Pasta e Passione',
    subtitle: 'C/ dels Juristes, 5, Ciutat Vella, 46001 València, Valencia, Spain',
    description: 'El 13 de diciembre de 2024. La primera vez que fuimos juntos a un restaurante italiano en Valencia. Pasta deliciosa y risas infinitas.',
    latitude: 39.475574,
    longitude: -0.376467,
    precision: 'exact',
    date: '2024-12-13',
    source: 'google_places',
    verifiedByUser: true,
    formattedAddress: 'C/ dels Juristes, 5, Ciutat Vella, 46001 València, Valencia, Spain',
    city: 'València',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop'
    ],
  },

  // 4. Tercera Cita · Plaza de la Virgen
  {
    id: 'memory-tercera-cita-virgen',
    type: 'memory',
    title: 'Nuestra Tercera Cita · Paseo por Plaza de la Virgen',
    subtitle: 'Plaça de la Mare de Déu, Ciutat Vella, València, Valencia, Spain',
    description: 'El 15 de diciembre de 2024 paseando por la calle y la Plaza de la Virgen iluminada, sintiendo cada vez más complicidad y magia.',
    latitude: 39.476283,
    longitude: -0.375531,
    precision: 'exact',
    date: '2024-12-15',
    source: 'google_places',
    verifiedByUser: true,
    formattedAddress: 'Plaça de la Mare de Déu, Ciutat Vella, València, Valencia, Spain',
    city: 'València',
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop'
    ],
    emotionTag: 'Complicidad & Ternura',
  },

  // 5. Primera foto enviada a los padres
  {
    id: 'memory-primera-foto-padres',
    type: 'memory',
    title: 'La primera foto que le enviamos a sus padres',
    subtitle: 'C/ de Sant Martí, 1, Ciutat Vella, 46002 València, Valencia, Spain',
    description: 'El 27 de diciembre de 2024 (dos semanas después de las primeras citas): la primera fotografía que compartimos con la familia con toda la ilusión del mundo.',
    latitude: 39.473465,
    longitude: -0.375701,
    precision: 'exact',
    date: '2024-12-27',
    source: 'google_places',
    verifiedByUser: true,
    formattedAddress: 'C/ de Sant Martí, 1, Ciutat Vella, 46002 València, Valencia, Spain',
    city: 'València',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop'
    ],
    emotionTag: 'Ilusión compartida',
  },

  // 6. Honest Greens
  {
    id: 'memory-honest-greens',
    type: 'restaurant',
    title: 'Cuando descubrimos Honest Greens',
    subtitle: 'C/ dels Cavallers, 24, Ciutat Vella, 46001 València, Valencia, Spain',
    description: 'El 30 de diciembre de 2024: el día que descubrimos nuestro rincón favorito de comida rica y saludable en la calle Caballeros.',
    latitude: 39.476716,
    longitude: -0.378041,
    precision: 'exact',
    date: '2024-12-30',
    source: 'google_places',
    verifiedByUser: true,
    formattedAddress: 'C/ dels Cavallers, 24, Ciutat Vella, 46001 València, Valencia, Spain',
    city: 'València',
    imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop'
    ],
  },

  // 7. Etapa en Canet d'en Berenguer (ETAPA)
  {
    id: 'memory-etapa-canet',
    type: 'stage',
    title: "Nuestra etapa en Canet d'en Berenguer",
    subtitle: "Platja de Canet d'en Berenguer, 46529 Canet d'en Berenguer, Valencia, Spain",
    description: 'Desde el 5 de enero de 2025 hasta noviembre de 2025: meses maravillosos viviendo juntos frente al mar, atardeceres dorados y paseos infinitos por la playa.',
    latitude: 39.685539,
    longitude: -0.206677,
    precision: 'exact',
    date: '2025-01-05',
    startDate: '2025-01-05',
    endDate: '2025-11-01',
    isOngoing: false,
    stageSummary: 'Convivencia y vida junto al mar mediterráneo',
    source: 'google_places',
    verifiedByUser: true,
    formattedAddress: "46529 Canet d'en Berenguer, Valencia, Spain",
    city: "Canet d'en Berenguer",
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&auto=format&fit=crop'
    ],
  },

  // 8. Segundo Airbnb Romántico
  {
    id: 'memory-segundo-airbnb',
    type: 'memory',
    title: 'Nuestro Segundo Airbnb Romántico',
    subtitle: 'Carrer de la Bosseria, Ciutat Vella, 46001 València, Valencia, Spain',
    description: 'Del 21 al 23 de enero de 2025. Un recuerdo sumamente especial para los dos: fue aquí donde nos dimos cuenta de que estábamos profundamente enamorados el uno del otro.',
    latitude: 39.475282,
    longitude: -0.379935,
    precision: 'exact',
    date: '2025-01-21',
    hasDateRange: true,
    dateRangeEnd: '2025-01-23',
    source: 'google_places',
    verifiedByUser: true,
    formattedAddress: 'Carrer de la Bosseria, Ciutat Vella, 46001 València, Valencia, Spain',
    city: 'València',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop'
    ],
    emotionTag: 'Donde supimos que estábamos enamorados',
  },

  // 9. Don Salvatore
  {
    id: 'restaurant-don-salvatore',
    type: 'restaurant',
    title: 'Cena en Ristorante Don Salvatore',
    subtitle: "Carrer del Comte d'Altea, 48, L'Eixample, 46005 València, Valencia, Spain",
    description: 'El 22 de enero de 2025 cenando pasta auténtica italiana en Don Salvatore durante nuestros días de Airbnb.',
    latitude: 39.467094,
    longitude: -0.365227,
    precision: 'exact',
    date: '2025-01-22',
    source: 'google_places',
    verifiedByUser: true,
    formattedAddress: "Carrer del Comte d'Altea, 48, L'Eixample, 46005 València, Valencia, Spain",
    city: 'València',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop'
    ],
  },

  // 10. Conocer a los padres en Manises
  {
    id: 'memory-conocer-padres-manises',
    type: 'memory',
    title: 'Primera vez que fui a conocer a sus padres',
    subtitle: 'Carrer Xàtiva, 25, 46940 Manises, Valencia, Spain',
    description: 'El 28 de enero de 2025 en Carrer Xàtiva 25, Manises. Una tarde llena de emoción, acogida y el comienzo de muchísimos momentos con su familia.',
    latitude: 39.496584,
    longitude: -0.472972,
    precision: 'exact',
    date: '2025-01-28',
    source: 'google_places',
    verifiedByUser: true,
    formattedAddress: 'Carrer Xàtiva, 25, 46940 Manises, Valencia, Spain',
    city: 'Manises',
    imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop'
    ],
    emotionTag: 'Acogida & Familia',
  },

  // 11. Merienda Mercado de Colón
  {
    id: 'memory-merienda-mercado-colon',
    type: 'date',
    title: 'Sitio que nos encantó merendar · Mercado de Colón',
    subtitle: "Carrer de Jorge Juan, 19, L'Eixample, 46004 València, Valencia, Spain",
    description: 'El 11 de febrero de 2025: merienda deliciosa y café en nuestro rincón favorito cerca del Mercado de Colón.',
    latitude: 39.468969,
    longitude: -0.368355,
    precision: 'exact',
    date: '2025-02-11',
    invitedBy: 'both',
    destination1: 'Mercado de Colón',
    destination2: 'Paseo por Jorge Juan y Calle Colón',
    source: 'google_places',
    verifiedByUser: true,
    formattedAddress: "Carrer de Jorge Juan, 19, L'Eixample, 46004 València, Valencia, Spain",
    city: 'València',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop'
    ],
  },

  // 12. Tercer y Mejor Airbnb Romántico
  {
    id: 'memory-tercer-mejor-airbnb',
    type: 'memory',
    title: 'Nuestro Tercer y Mejor Airbnb Romántico',
    subtitle: 'Pg. de l\'Albereda, València, Valencia, Spain',
    description: 'Del 13 al 16 de febrero de 2025. El mejor fin de semana de nuestras vidas: San Valentín, complicidad absoluta y nuestro compromiso oficial de empezar a salir juntos.',
    latitude: 39.464377,
    longitude: -0.358492,
    precision: 'exact',
    date: '2025-02-13',
    hasDateRange: true,
    dateRangeEnd: '2025-02-16',
    source: 'google_places',
    verifiedByUser: true,
    formattedAddress: 'Pg. de l\'Albereda, València, Valencia, Spain',
    city: 'València',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop'
    ],
    emotionTag: 'Inolvidable · San Valentín',
  },

  // 13. Casa d'Aragona (San Valentín)
  {
    id: 'restaurant-casa-daragona-sanvalentin',
    type: 'restaurant',
    title: "San Valentín en Ristorante Casa d'Aragona",
    subtitle: "Carrer de Ciscar, 12, L'Eixample, 46005 València, Valencia, Spain",
    description: "El 14 de febrero de 2025: cena romántica de San Valentín a la luz de las velas en Casa d'Aragona.",
    latitude: 39.466880,
    longitude: -0.366384,
    precision: 'exact',
    date: '2025-02-14',
    source: 'google_places',
    verifiedByUser: true,
    formattedAddress: "Carrer de Ciscar, 12, L'Eixample, 46005 València, Valencia, Spain",
    city: 'València',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop'
    ],
  },

  // 14. Primer Beso & Empezamos a Salir (Aniversario Oficial)
  {
    id: 'milestone-primer-beso-pareja',
    type: 'memory',
    title: 'Primer Beso & Donde Empezamos a Salir',
    subtitle: "Pg. de l'Albereda, 44, Camins al Grau, 46023 València, Valencia, Spain",
    description: "El 15 de febrero de 2025 en el Paseo de la Alameda, 44. El rincón mágico de nuestro primer beso y donde Tonet le pidió salir a Andrea. El comienzo oficial de nuestro camino juntos.",
    latitude: 39.458650,
    longitude: -0.350807,
    precision: 'exact',
    date: '2025-02-15',
    source: 'google_places',
    verifiedByUser: true,
    formattedAddress: "Pg. de l'Albereda, 44, Camins al Grau, 46023 València, Valencia, Spain",
    city: 'València',
    imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&auto=format&fit=crop'
    ],
    emotionTag: 'Aniversario Oficial & Primer Beso',
  },

  // 15. Casa de Tonet · Conde de Real (ETAPA)
  {
    id: 'place-casa-tonet',
    type: 'stage',
    title: 'Nuestra etapa en Carrer Comte del Real',
    subtitle: 'Carrer Comte Del Real, 16, 46194 Real, Valencia, Spain',
    description: 'Calle Conde de Real, 16. Nuestro hogar y refugio de amor compartido donde viví y construimos innumerables momentos juntos.',
    latitude: 39.335177,
    longitude: -0.611326,
    precision: 'exact',
    date: '2025-03-01',
    startDate: '2025-03-01',
    isOngoing: true,
    stageSummary: 'Nuestro hogar y refugio de amor compartido',
    source: 'google_places',
    verifiedByUser: true,
    formattedAddress: 'Carrer Comte Del Real, 16, 46194 Real, Valencia, Spain',
    city: 'Real',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop'
    ],
  },

  // 16. Latte & Farina
  {
    id: 'restaurant-latte-farina',
    type: 'restaurant',
    title: 'Cuando fuimos a Latte & Farina',
    subtitle: 'Pl. del Miracle del Mocadoret, 6, Ciutat Vella, 46001 València, Valencia, Spain',
    description: 'El 10 de mayo de 2025: comida italiana deliciosa y postres artesanales en una de las plazas más bonitas del centro.',
    latitude: 39.474352,
    longitude: -0.376296,
    precision: 'exact',
    date: '2025-05-10',
    source: 'google_places',
    verifiedByUser: true,
    formattedAddress: 'Pl. del Miracle del Mocadoret, 6, Ciutat Vella, 46001 València, Valencia, Spain',
    city: 'València',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop'
    ],
  },

  // 17. Casa d'Aragona (Mayo)
  {
    id: 'restaurant-casa-daragona-mayo',
    type: 'restaurant',
    title: "Cena en Casa d'Aragona (Mayo)",
    subtitle: "Carrer de Ciscar, 12, L'Eixample, 46005 València, Valencia, Spain",
    description: "El 11 de mayo de 2025: otra cena inolvidable compartiendo pasta fresca en Casa d'Aragona.",
    latitude: 39.466880,
    longitude: -0.366384,
    precision: 'exact',
    date: '2025-05-11',
    source: 'google_places',
    verifiedByUser: true,
    formattedAddress: "Carrer de Ciscar, 12, L'Eixample, 46005 València, Valencia, Spain",
    city: 'València',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop'
    ],
  },

  // 18. Le Favole (Verano)
  {
    id: 'restaurant-le-favole',
    type: 'restaurant',
    title: 'Cuando fuimos a Ristorante Le Favole',
    subtitle: "C/ de l'Hedra, 5, Ciutat Vella, 46001 València, Valencia, Spain",
    description: 'En el verano de 2025: noche cálida de risas, confidencias y gastronomía italiana en la terraza de Le Favole.',
    latitude: 39.472237,
    longitude: -0.378451,
    precision: 'exact',
    date: '2025-07-15',
    source: 'google_places',
    verifiedByUser: true,
    formattedAddress: "C/ de l'Hedra, 5, Ciutat Vella, 46001 València, Valencia, Spain",
    city: 'València',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop'
    ],
  }
];
`;
fs.writeFileSync(path.join(mobileRoot, 'src', 'components', 'map', 'map.constants.ts'), mapConstantsTs, 'utf8');

// ── 3. apps/mobile/src/components/map/MapFilters.tsx ──
const mapFiltersTs = `import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Radii, Spacing } from '../../theme/tokens';
import { MapPlaceType } from '../../types/map';
import { IconSearch } from '../ui/Icons';
import { triggerHaptic } from '../../utils/haptics';

export type MapFilterKey = 'all' | 'stages' | 'memories' | 'dates' | 'restaurants' | 'trips' | 'dreams';

export const FILTER_TYPE_MAP: Record<MapFilterKey, MapPlaceType[] | 'all'> = {
  all: 'all',
  stages: ['stage'],
  memories: ['memory', 'important_date'],
  dates: ['date'],
  restaurants: ['restaurant'],
  trips: ['trip'],
  dreams: ['future_place', 'surprise'],
};

interface MapFiltersProps {
  activeFilter: MapFilterKey;
  onFilterChange: (filter: MapFilterKey) => void;
  counts?: Record<MapFilterKey, number>;
  onSearchPress?: () => void;
  topOffset?: number;
}

export function MapFilters({
  activeFilter,
  onFilterChange,
  counts,
  onSearchPress,
  topOffset = 12,
}: MapFiltersProps) {
  const filters: { key: MapFilterKey; label: string; icon: string }[] = [
    { key: 'all', label: 'Todo', icon: '✦' },
    { key: 'stages', label: 'Etapas', icon: '🏡' },
    { key: 'memories', label: 'Recuerdos', icon: '❤️' },
    { key: 'dates', label: 'Citas', icon: '🥂' },
    { key: 'restaurants', label: 'Restaurantes', icon: '🍽️' },
    { key: 'trips', label: 'Viajes', icon: '✈️' },
    { key: 'dreams', label: 'Sueños', icon: '✨' },
  ];

  return (
    <View style={[styles.container, { top: topOffset }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((f) => {
          const isActive = activeFilter === f.key;
          const count = counts ? counts[f.key] : undefined;

          return (
            <TouchableOpacity
              key={f.key}
              activeOpacity={0.75}
              onPress={() => {
                triggerHaptic('selection');
                onFilterChange(f.key);
              }}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Text style={styles.chipIcon}>{f.icon}</Text>
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {f.label}
              </Text>
              {count !== undefined && count > 0 && (
                <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                  <Text style={[styles.countText, isActive && styles.countTextActive]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 15,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
    shadowColor: '#3A2F38',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  chipActive: {
    backgroundColor: '#3A2F38',
    borderColor: '#3A2F38',
  },
  chipIcon: {
    fontSize: 13,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3A2F38',
    fontFamily: 'Inter, sans-serif',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#F5EFE8',
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#766B72',
  },
  countTextActive: {
    color: '#FFFFFF',
  },
});
`;
fs.writeFileSync(path.join(mobileRoot, 'src', 'components', 'map', 'MapFilters.tsx'), mapFiltersTs, 'utf8');

console.log('✅ Types, map.constants, and MapFilters updated.');
`;
fs.writeFileSync(path.join(projectRoot, 'scratch', 'implement_rich_place_details.mjs'), scriptContent, 'utf8');
function scriptContent() {}
