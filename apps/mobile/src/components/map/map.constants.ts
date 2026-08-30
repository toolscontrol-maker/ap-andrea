import { AndreaMapPlace, MapCameraState } from '../../types/map';

export const DEFAULT_MAP_CAMERA: MapCameraState = {
  latitude: 39.4699,
  longitude: -0.3763,
  zoom: 12.0,
};

export const DEMO_MAP_PLACES: AndreaMapPlace[] = [
  // 1. Don de nos conocimos
  {
    id: 'milestone-nos-conocimos',
    type: 'memory',
    title: 'Donde nos conocimos',
    subtitle: 'Ent. Rico, 6, Quatre Carreres, Valencia',
    description: 'La noche mágica del 23 de noviembre de 2024 donde cruzamos miradas y nos conocimos por primera vez. Esa noche empezó nuestra historia.',
    latitude: 39.4497,
    longitude: -0.3672,
    precision: 'exact',
    date: '2024-11-23',
    source: 'mapbox_search',
    verifiedByUser: true,
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop',
  },

  // 2. Primera Cita
  {
    id: 'milestone-primera-cita',
    type: 'restaurant',
    title: 'Nuestra Primera Cita · Alqueria del Pou',
    subtitle: "Entrada del Pou d'Aparisi, 2, Quatre Carreres, Valencia",
    description: 'Nuestra primera cita oficial en el restaurante Alqueria del Pou. Risas, confidencias y donde supimos que queríamos estar juntos.',
    latitude: 39.4491,
    longitude: -0.3664,
    precision: 'exact',
    date: '2024-12-05',
    source: 'mapbox_search',
    verifiedByUser: true,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop',
  },

  // 3. Primer Italiano · Pasta e Passione
  {
    id: 'memory-pasta-passione',
    type: 'restaurant',
    title: 'Primera vez en un italiano · Pasta e Passione',
    subtitle: 'Carrer dels Juristes, 5, Ciutat Vella, Valencia',
    description: 'El 13 de diciembre de 2024. La primera vez que fuimos juntos a un restaurante italiano en Valencia. Pasta deliciosa y risas infinitas.',
    latitude: 39.4756,
    longitude: -0.3765,
    precision: 'exact',
    date: '2024-12-13',
    source: 'mapbox_search',
    verifiedByUser: true,
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop',
  },

  // 4. Tercera Cita · Plaza de la Virgen
  {
    id: 'memory-tercera-cita-virgen',
    type: 'memory',
    title: 'Nuestra Tercera Cita · Paseo por Plaza de la Virgen',
    subtitle: 'Plaza de la Virgen, Ciutat Vella, Valencia',
    description: 'El 15 de diciembre de 2024 paseando por la calle y la Plaza de la Virgen iluminada, sintiendo cada vez más complicidad y magia.',
    latitude: 39.4766,
    longitude: -0.3750,
    precision: 'exact',
    date: '2024-12-15',
    source: 'mapbox_search',
    verifiedByUser: true,
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop',
  },

  // 5. Primera foto enviada a los padres
  {
    id: 'memory-primera-foto-padres',
    type: 'memory',
    title: 'La primera foto que le enviamos a sus padres',
    subtitle: 'Valencia Centro',
    description: 'El 27 de diciembre de 2024 (dos semanas después de las primeras citas): la primera fotografía que compartimos con la familia con toda la ilusión del mundo.',
    latitude: 39.4750,
    longitude: -0.3760,
    precision: 'approximate',
    date: '2024-12-27',
    source: 'mapbox_search',
    verifiedByUser: true,
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop',
  },

  // 6. Descubrimos Honest Greens
  {
    id: 'memory-honest-greens',
    type: 'restaurant',
    title: 'Cuando descubrimos Honest Greens',
    subtitle: 'Carrer dels Cavallers, 24, Ciutat Vella, Valencia',
    description: 'El 30 de diciembre de 2024: el día que descubrimos nuestro rincón favorito de comida rica y saludable en la calle Caballeros.',
    latitude: 39.4766,
    longitude: -0.3786,
    precision: 'exact',
    date: '2024-12-30',
    source: 'mapbox_search',
    verifiedByUser: true,
    imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop',
  },

  // 7. Etapa en Canet d'en Berenguer
  {
    id: 'memory-etapa-canet',
    type: 'trip',
    title: "Nuestra etapa en Canet d'en Berenguer",
    subtitle: "Platja de Canet d'en Berenguer, Valencia",
    description: 'Desde el 5 de enero de 2025 hasta noviembre de 2025: meses maravillosos viviendo junto al mar, atardeceres y paseos infinitos.',
    latitude: 39.6799,
    longitude: -0.2201,
    precision: 'exact',
    date: '2025-01-05',
    source: 'mapbox_search',
    verifiedByUser: true,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop',
  },

  // 8. Segundo Airbnb Romántico (Donde supimos que estábamos enamorados)
  {
    id: 'memory-segundo-airbnb',
    type: 'memory',
    title: 'Nuestro Segundo Airbnb Romántico',
    subtitle: 'Valencia Centro Histórico',
    description: 'Del 21 al 23 de enero de 2025. Un recuerdo sumamente especial para los dos: fue aquí donde nos dimos cuenta de que estábamos profundamente enamorados el uno del otro.',
    latitude: 39.4735,
    longitude: -0.3755,
    precision: 'exact',
    date: '2025-01-21',
    source: 'manual_pin',
    verifiedByUser: true,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop',
  },

  // 9. Don Salvatore
  {
    id: 'restaurant-don-salvatore',
    type: 'restaurant',
    title: 'Cena en Ristorante Don Salvatore',
    subtitle: "Carrer del Comte d'Altea, 48, L'Eixample, Valencia",
    description: 'El 22 de enero de 2025 cenando pasta auténtica italiana en Don Salvatore durante nuestros días de Airbnb.',
    latitude: 39.4671,
    longitude: -0.3652,
    precision: 'exact',
    date: '2025-01-22',
    source: 'mapbox_search',
    verifiedByUser: true,
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop',
  },

  // 10. Conocer a los padres en Manises
  {
    id: 'memory-conocer-padres-manises',
    type: 'memory',
    title: 'Primera vez que fui a conocer a sus padres',
    subtitle: 'Carrer Xàtiva, 25, 46940 Manises, Valencia',
    description: 'El 28 de enero de 2025 en Carrer Xàtiva 25, Manises. Una tarde llena de emoción, acogida y el comienzo de muchísimos momentos con su familia.',
    latitude: 39.4966,
    longitude: -0.4729,
    precision: 'exact',
    date: '2025-01-28',
    source: 'mapbox_search',
    verifiedByUser: true,
    imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop',
  },

  // 11. Merienda Mercado de Colón
  {
    id: 'memory-merienda-mercado-colon',
    type: 'restaurant',
    title: 'Sitio que nos encantó merendar · Mercado de Colón',
    subtitle: 'Carrer de Jorge Juan, 19, L\'Eixample, Valencia',
    description: 'El 11 de febrero de 2025: merienda deliciosa y café en nuestro rincón favorito cerca del Mercado de Colón.',
    latitude: 39.4691,
    longitude: -0.3691,
    precision: 'exact',
    date: '2025-02-11',
    source: 'mapbox_search',
    verifiedByUser: true,
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop',
  },

  // 12. Tercer y Mejor Airbnb Romántico
  {
    id: 'memory-tercer-mejor-airbnb',
    type: 'memory',
    title: 'Nuestro Tercer y Mejor Airbnb Romántico',
    subtitle: 'Paseo de la Alameda / Camins al Grau, Valencia',
    description: 'Del 13 al 16 de febrero de 2025. El mejor fin de semana de nuestras vidas: San Valentín, complicidad absoluta y nuestro compromiso oficial de empezar a salir juntos.',
    latitude: 39.4640,
    longitude: -0.3550,
    precision: 'exact',
    date: '2025-02-13',
    source: 'manual_pin',
    verifiedByUser: true,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop',
  },

  // 13. Casa d'Aragona (San Valentín)
  {
    id: 'restaurant-casa-daragona-sanvalentin',
    type: 'restaurant',
    title: "San Valentín en Ristorante Casa d'Aragona",
    subtitle: "Carrer de Císcar, 12, L'Eixample, Valencia",
    description: "El 14 de febrero de 2025: cena romántica de San Valentín a la luz de las velas en Casa d'Aragona.",
    latitude: 39.4669,
    longitude: -0.3664,
    precision: 'exact',
    date: '2025-02-14',
    source: 'mapbox_search',
    verifiedByUser: true,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop',
  },

  // 14. Primer Beso & Empezamos a Salir (Aniversario Oficial)
  {
    id: 'milestone-primer-beso-pareja',
    type: 'memory',
    title: 'Primer Beso & Donde Empezamos a Salir',
    subtitle: "Pg. de l'Albereda, 44, Camins al Grau, Valencia",
    description: "El 15 de febrero de 2025 en el Paseo de la Alameda, 44. El rincón mágico de nuestro primer beso y donde Ángel le pidió salir a Andrea. El comienzo oficial de nuestro camino juntos.",
    latitude: 39.4632,
    longitude: -0.3546,
    precision: 'exact',
    date: '2025-02-15',
    source: 'mapbox_search',
    verifiedByUser: true,
    imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&auto=format&fit=crop',
  },

  // 15. Casa de Ángel / Tonet
  {
    id: 'place-casa-tonet',
    type: 'memory',
    title: 'Casa de Ángel · Conde de Real',
    subtitle: 'Calle Conde de Real, 16B, Valencia',
    description: 'Nuestro hogar y refugio de amor compartido en Valencia.',
    latitude: 39.4768,
    longitude: -0.3734,
    precision: 'exact',
    source: 'mapbox_search',
    verifiedByUser: true,
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop',
  },

  // 16. Latte & Farina
  {
    id: 'restaurant-latte-farina',
    type: 'restaurant',
    title: 'Cuando fuimos a Latte & Farina',
    subtitle: 'Plaza del Miracle del Mocadoret, 6, Ciutat Vella, Valencia',
    description: 'El 10 de mayo de 2025: comida italiana deliciosa y postres artesanales en una de las plazas más bonitas del centro.',
    latitude: 39.4743,
    longitude: -0.3764,
    precision: 'exact',
    date: '2025-05-10',
    source: 'mapbox_search',
    verifiedByUser: true,
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop',
  },

  // 17. Casa d'Aragona (Mayo)
  {
    id: 'restaurant-casa-daragona-mayo',
    type: 'restaurant',
    title: "Cena en Casa d'Aragona (Mayo)",
    subtitle: "Carrer de Císcar, 12, L'Eixample, Valencia",
    description: "El 11 de mayo de 2025: otra cena inolvidable compartiendo pasta fresca en Casa d'Aragona.",
    latitude: 39.4669,
    longitude: -0.3664,
    precision: 'exact',
    date: '2025-05-11',
    source: 'mapbox_search',
    verifiedByUser: true,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop',
  },

  // 18. Le Favole (Verano)
  {
    id: 'restaurant-le-favole',
    type: 'restaurant',
    title: 'Cuando fuimos a Ristorante Le Favole',
    subtitle: "Carrer de l'Hedra, 4, Ciutat Vella, Valencia",
    description: 'En el verano de 2025: noche cálida de risas, confidencias y gastronomía italiana en la terraza de Le Favole.',
    latitude: 39.4727,
    longitude: -0.3784,
    precision: 'exact',
    date: '2025-07-15',
    source: 'mapbox_search',
    verifiedByUser: true,
    imageUrl: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=600&auto=format&fit=crop',
  },

  // 19. Casa d'Aragona (Agosto)
  {
    id: 'restaurant-casa-daragona-agosto',
    type: 'restaurant',
    title: "Noche de verano en Casa d'Aragona",
    subtitle: "Carrer de Císcar, 12, L'Eixample, Valencia",
    description: "El 15 de agosto de 2025 celebrando el verano juntos en Casa d'Aragona.",
    latitude: 39.4669,
    longitude: -0.3664,
    precision: 'exact',
    date: '2025-08-15',
    source: 'mapbox_search',
    verifiedByUser: true,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop',
  },

  // 20. 9 Meses en La Salvaora
  {
    id: 'restaurant-la-salvaora-9meses',
    type: 'restaurant',
    title: 'Celebración de 9 Meses Juntos · La Salvaora',
    subtitle: 'Carrer de Calatrava, 19, Ciutat Vella, Valencia',
    description: 'El 15 de noviembre de 2025: celebrando 9 meses de amor, complicidad y felicidad en el restaurante La Salvaora.',
    latitude: 39.4763,
    longitude: -0.3774,
    precision: 'exact',
    date: '2025-11-15',
    source: 'mapbox_search',
    verifiedByUser: true,
    imageUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&auto=format&fit=crop',
  },
];
