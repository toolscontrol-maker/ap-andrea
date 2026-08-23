export interface RandomDateIdea {
  id: string;
  title: string;
  category: 'cena' | 'aventura' | 'casa' | 'cultural' | 'sorpresa';
  budgetLevel: 'gratis' | 'moderado' | 'especial';
  setting: 'exterior' | 'interior' | 'mixto';
  duration: '1-2h' | 'tarde' | 'noche' | 'dia_completo';
  description: string;
  suggestedTime: string;
}

export const RANDOM_DATES_POOL: RandomDateIdea[] = [
  {
    id: 'rd-1',
    title: 'Picnic al atardecer con quesos y vino',
    category: 'cena',
    budgetLevel: 'moderado',
    setting: 'exterior',
    duration: '1-2h',
    description: 'Comprad pan artesano, vuestros quesos favoritos, una botella de vino y buscad un parque o mirador bonito para ver la puesta de sol.',
    suggestedTime: '20:00',
  },
  {
    id: 'rd-2',
    title: 'Noche de cocina a ciegas en casa',
    category: 'casa',
    budgetLevel: 'moderado',
    setting: 'interior',
    duration: 'tarde',
    description: 'Uno elige el plato principal y el otro el postre sin decir qué es hasta que esté servido en la mesa con velas.',
    suggestedTime: '20:30',
  },
  {
    id: 'rd-3',
    title: 'Ruta de librerías y café lento',
    category: 'cultural',
    budgetLevel: 'gratis',
    setting: 'mixto',
    duration: 'tarde',
    description: 'Visitad dos librerías con encanto, elegid un libro o cómic para el otro y leed los primeros capítulos en una cafetería tranquila.',
    suggestedTime: '17:30',
  },
  {
    id: 'rd-4',
    title: 'Paseo nocturno y helado artesano',
    category: 'aventura',
    budgetLevel: 'moderado',
    setting: 'exterior',
    duration: '1-2h',
    description: 'Caminad por el centro de la ciudad de noche cuando las calles se vacían y terminad con un helado de vuestros sabores favoritos.',
    suggestedTime: '22:00',
  },
  {
    id: 'rd-5',
    title: 'Maratón de juegos de mesa y mantas',
    category: 'casa',
    budgetLevel: 'gratis',
    setting: 'interior',
    duration: 'noche',
    description: 'Preparad chocolate caliente o té, poned vuestra playlist favorita y jugad a vuestros juegos de mesa favoritos.',
    suggestedTime: '21:00',
  },
  {
    id: 'rd-6',
    title: 'Desayuno especial fuera en un rincón nuevo',
    category: 'cena',
    budgetLevel: 'moderado',
    setting: 'interior',
    duration: '1-2h',
    description: 'Madrugad un poco el sábado o domingo y probad esa cafetería con tostadas o bollería artesanal que tenéis pendiente.',
    suggestedTime: '10:00',
  },
  {
    id: 'rd-7',
    title: 'Cena elegante en un restaurante sorpresa',
    category: 'sorpresa',
    budgetLevel: 'especial',
    setting: 'interior',
    duration: 'noche',
    description: 'Arreglaos para una noche romántica en un restaurante con luz tenue y brindad por vuestro camino juntos.',
    suggestedTime: '21:30',
  },
];

export function getRandomDateIdea(
  excludeId?: string,
  filterSetting?: 'all' | 'interior' | 'exterior',
  filterBudget?: 'all' | 'gratis' | 'moderado' | 'especial'
): RandomDateIdea {
  let pool = RANDOM_DATES_POOL.filter((i) => i.id !== excludeId);
  if (filterSetting && filterSetting !== 'all') {
    pool = pool.filter((i) => i.setting === filterSetting || i.setting === 'mixto');
  }
  if (filterBudget && filterBudget !== 'all') {
    pool = pool.filter((i) => i.budgetLevel === filterBudget);
  }
  if (pool.length === 0) pool = RANDOM_DATES_POOL;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
