import fs from 'fs';
import path from 'path';

const API_KEY = 'AIzaSyCoOQUfW0CwUpJGBElhUy2T3fy0_znH73Q';
const mapConstantsPath = path.join(process.cwd(), 'apps', 'mobile', 'src', 'components', 'map', 'map.constants.ts');

const placesToGeocode = [
  {
    id: 'milestone-nos-conocimos',
    type: 'memory',
    title: 'Donde nos conocimos',
    query: 'Entrada Rico 6, Valencia, España',
    description: 'La noche mágica del 23 de noviembre de 2024 donde cruzamos miradas y nos conocimos por primera vez. Esa noche empezó nuestra historia.',
    date: '2024-11-23',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop',
  },
  {
    id: 'milestone-primera-cita',
    type: 'restaurant',
    title: 'Nuestra Primera Cita · Alqueria del Pou',
    query: "Alqueria del Pou, Entrada del Pou d'Aparisi, 2, Valencia",
    description: 'Nuestra primera cita oficial en el restaurante Alqueria del Pou. Risas, confidencias y donde supimos que queríamos estar juntos.',
    date: '2024-12-05',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop',
  },
  {
    id: 'memory-pasta-passione',
    type: 'restaurant',
    title: 'Primera vez en un italiano · Pasta e Passione',
    query: 'Pasta e Passione, Carrer dels Juristes, 5, Valencia',
    description: 'El 13 de diciembre de 2024. La primera vez que fuimos juntos a un restaurante italiano en Valencia. Pasta deliciosa y risas infinitas.',
    date: '2024-12-13',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop',
  },
  {
    id: 'memory-tercera-cita-virgen',
    type: 'memory',
    title: 'Nuestra Tercera Cita · Paseo por Plaza de la Virgen',
    query: 'Plaza de la Virgen, Valencia, España',
    description: 'El 15 de diciembre de 2024 paseando por la calle y la Plaza de la Virgen iluminada, sintiendo cada vez más complicidad y magia.',
    date: '2024-12-15',
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop',
  },
  {
    id: 'memory-primera-foto-padres',
    type: 'memory',
    title: 'La primera foto que le enviamos a sus padres',
    query: 'Plaza de la Reina, Valencia, España',
    description: 'El 27 de diciembre de 2024 (dos semanas después de las primeras citas): la primera fotografía que compartimos con la familia con toda la ilusión del mundo.',
    date: '2024-12-27',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop',
  },
  {
    id: 'memory-honest-greens',
    type: 'restaurant',
    title: 'Cuando descubrimos Honest Greens',
    query: 'Honest Greens, Carrer dels Cavallers, 24, Valencia',
    description: 'El 30 de diciembre de 2024: el día que descubrimos nuestro rincón favorito de comida rica y saludable en la calle Caballeros.',
    date: '2024-12-30',
    imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop',
  },
  {
    id: 'memory-etapa-canet',
    type: 'trip',
    title: "Nuestra etapa en Canet d'en Berenguer",
    query: "Platja de Canet d'en Berenguer, Valencia, España",
    description: 'Desde el 5 de enero de 2025 hasta noviembre de 2025: meses maravillosos viviendo junto al mar, atardeceres y paseos infinitos.',
    date: '2025-01-05',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop',
  },
  {
    id: 'memory-segundo-airbnb',
    type: 'memory',
    title: 'Nuestro Segundo Airbnb Romántico',
    query: 'Carrer de la Bosseria, Valencia, España',
    description: 'Del 21 al 23 de enero de 2025. Un recuerdo sumamente especial para los dos: fue aquí donde nos dimos cuenta de que estábamos profundamente enamorados el uno del otro.',
    date: '2025-01-21',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop',
  },
  {
    id: 'restaurant-don-salvatore',
    type: 'restaurant',
    title: 'Cena en Ristorante Don Salvatore',
    query: "Ristorante Don Salvatore, Carrer del Comte d'Altea, 48, Valencia",
    description: 'El 22 de enero de 2025 cenando pasta auténtica italiana en Don Salvatore durante nuestros días de Airbnb.',
    date: '2025-01-22',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop',
  },
  {
    id: 'memory-conocer-padres-manises',
    type: 'memory',
    title: 'Primera vez que fui a conocer a sus padres',
    query: 'Carrer Xàtiva, 25, 46940 Manises, Valencia, España',
    description: 'El 28 de enero de 2025 en Carrer Xàtiva 25, Manises. Una tarde llena de emoción, acogida y el comienzo de muchísimos momentos con su familia.',
    date: '2025-01-28',
    imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop',
  },
  {
    id: 'memory-merienda-mercado-colon',
    type: 'restaurant',
    title: 'Sitio que nos encantó merendar · Mercado de Colón',
    query: 'Mercado de Colón, Carrer de Jorge Juan, 19, Valencia',
    description: 'El 11 de febrero de 2025: merienda deliciosa y café en nuestro rincón favorito cerca del Mercado de Colón.',
    date: '2025-02-11',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop',
  },
  {
    id: 'memory-tercer-mejor-airbnb',
    type: 'memory',
    title: 'Nuestro Tercer y Mejor Airbnb Romántico',
    query: 'Paseo de la Alameda, Valencia, España',
    description: 'Del 13 al 16 de febrero de 2025. El mejor fin de semana de nuestras vidas: San Valentín, complicidad absoluta y nuestro compromiso oficial de empezar a salir juntos.',
    date: '2025-02-13',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop',
  },
  {
    id: 'restaurant-casa-daragona-sanvalentin',
    type: 'restaurant',
    title: "San Valentín en Ristorante Casa d'Aragona",
    query: "Casa d'Aragona, Carrer de Císcar, 12, Valencia",
    description: "El 14 de febrero de 2025: cena romántica de San Valentín a la luz de las velas en Casa d'Aragona.",
    date: '2025-02-14',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop',
  },
  {
    id: 'milestone-primer-beso-pareja',
    type: 'memory',
    title: 'Primer Beso & Donde Empezamos a Salir',
    query: "Paseo de la Alameda, 44, Valencia, España",
    description: "El 15 de febrero de 2025 en el Paseo de la Alameda, 44. El rincón mágico de nuestro primer beso y donde Tonet le pidió salir a Andrea. El comienzo oficial de nuestro camino juntos.",
    date: '2025-02-15',
    imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&auto=format&fit=crop',
  },
  {
    id: 'place-casa-tonet',
    type: 'memory',
    title: 'Casa de Tonet · Conde de Real',
    query: 'Calle Conde de Real, 16, Valencia, España',
    description: 'Nuestro hogar y refugio de amor compartido en Valencia.',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop',
  },
  {
    id: 'restaurant-latte-farina',
    type: 'restaurant',
    title: 'Cuando fuimos a Latte & Farina',
    query: 'Latte & Farina, Plaza del Miracle del Mocadoret, 6, Valencia',
    description: 'El 10 de mayo de 2025: comida italiana deliciosa y postres artesanales en una de las plazas más bonitas del centro.',
    date: '2025-05-10',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop',
  },
  {
    id: 'restaurant-casa-daragona-mayo',
    type: 'restaurant',
    title: "Cena en Casa d'Aragona (Mayo)",
    query: "Casa d'Aragona, Carrer de Císcar, 12, Valencia",
    description: "El 11 de mayo de 2025: otra cena inolvidable compartiendo pasta fresca en Casa d'Aragona.",
    date: '2025-05-11',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop',
  },
  {
    id: 'restaurant-le-favole',
    type: 'restaurant',
    title: 'Cuando fuimos a Ristorante Le Favole',
    query: "Le Favole, Carrer de l'Hedra, 4, Valencia",
    description: 'En el verano de 2025: noche cálida de risas, confidencias y gastronomía italiana en la terraza de Le Favole.',
    date: '2025-07-15',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop',
  }
];

async function geocodeAll() {
  console.log('🌍 Geocodificando ubicaciones con la API oficial de Google Maps...');
  const results = [];

  for (const item of placesToGeocode) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(item.query)}&key=${API_KEY}`;
    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        const top = data.results[0];
        const lat = top.geometry.location.lat;
        const lng = top.geometry.location.lng;
        const formattedAddress = top.formatted_address;

        let city = 'Valencia';
        for (const comp of top.address_components) {
          if (comp.types.includes('locality')) city = comp.long_name;
        }

        console.log(`✅ [${item.title}] -> (${lat.toFixed(6)}, ${lng.toFixed(6)}) : ${formattedAddress}`);

        results.push({
          id: item.id,
          type: item.type,
          title: item.title,
          subtitle: formattedAddress,
          description: item.description,
          latitude: lat,
          longitude: lng,
          precision: 'exact',
          date: item.date,
          source: 'google_places',
          verifiedByUser: true,
          formattedAddress: formattedAddress,
          city: city,
          imageUrl: item.imageUrl,
        });
      } else {
        console.warn(`⚠️ No se encontró geocodificación para "${item.query}", status:`, data.status);
      }
    } catch (e) {
      console.error(`❌ Error en "${item.query}":`, e);
    }
  }

  // Generate map.constants.ts with updated exact Google Maps coordinates
  const newConstantsFile = `import { AndreaMapPlace, MapCameraState } from '../../types/map';

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

export const DEMO_MAP_PLACES: AndreaMapPlace[] = ${JSON.stringify(results, null, 2)};
`;

  fs.writeFileSync(mapConstantsPath, newConstantsFile, 'utf8');
  console.log('✅ map.constants.ts actualizado con precisión métrica de Google Maps.');
}

geocodeAll().catch(console.error);
