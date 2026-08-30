import { TimelineItem } from './calendar.types';
import { CoupleEvent, MapPlace, WishlistItem, DiaryEntryUI } from '@andrea/types';

/**
 * Aggregates all sources of couple history into a rich, sorted chronological timeline
 */
export function buildOurStoryTimeline(params: {
  coupleEvents?: CoupleEvent[];
  mapPlaces?: MapPlace[];
  wishes?: WishlistItem[];
  entries?: DiaryEntryUI[];
}): TimelineItem[] {
  const items: TimelineItem[] = [];

  // 1. Foundational Milestones
  items.push({
    id: 'timeline-met',
    kind: 'milestone',
    date: '2024-11-23',
    time: '23:30',
    title: 'Donde nos conocimos',
    subtitle: 'Ent. Rico, 6, Quatre Carreres · Valencia',
    description: 'La noche mágica donde cruzamos miradas por primera vez y empezó nuestra historia.',
    locationName: 'Ent. Rico, 6, 46013 Valencia',
    emoji: '🪩',
    badgeLabel: 'Primer Encuentro',
    badgeColor: '#D4AF37',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop',
    chapterTitle: 'Capítulo I: El Comienzo',
  });

  items.push({
    id: 'timeline-first-date',
    kind: 'restaurant',
    date: '2024-12-05',
    time: '21:00',
    title: 'Nuestra Primera Cita · Alqueria del Pou',
    subtitle: "Entrada del Pou d'Aparisi, 2, Quatre Carreres · Valencia",
    description: 'Nuestra primera cita oficial en el restaurante Alqueria del Pou. Risas, confidencias y donde supimos que queríamos estar juntos.',
    locationName: 'Alqueria del Pou, Valencia',
    emoji: '🍽️',
    badgeLabel: 'Primera Cita',
    badgeColor: '#E05666',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop',
    chapterTitle: 'Capítulo I: El Comienzo',
  });

  items.push({
    id: 'timeline-kiss-official',
    kind: 'milestone',
    date: '2025-02-15',
    time: '22:00',
    title: 'Primer Beso & Empezamos a Salir',
    subtitle: "Pg. de l'Albereda, 44, Camins al Grau · Valencia",
    description: "El rincón mágico de nuestro primer beso y donde Tonet le pidió salir a Andrea. El comienzo oficial de nuestro camino juntos.",
    locationName: "Pg. de l'Albereda, 44, Valencia",
    emoji: '💋',
    badgeLabel: 'Aniversario Oficial',
    badgeColor: '#E05666',
    imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&auto=format&fit=crop',
    chapterTitle: 'Capítulo II: Nosotros',
  });

  // 2. Map Places & Trips
  if (params.mapPlaces) {
    params.mapPlaces.forEach((p) => {
      if (
        p.id.includes('room') ||
        p.id.includes('pou') ||
        p.id.includes('anniversary') ||
        p.id.includes('nos-conocimos') ||
        p.id.includes('primera-cita') ||
        p.id.includes('primer-beso')
      ) {
        return;
      }

      items.push({
        id: `map-${p.id}`,
        kind: p.category === 'cita' ? 'restaurant' : 'trip',
        date: p.date || '2025-06-15',
        title: p.title,
        subtitle: `${p.cityName || ''}, ${p.country || ''}`,
        description: p.story || '',
        locationName: p.cityName,
        emoji: p.category === 'cita' ? '🍴' : '✈️',
        badgeLabel: p.category === 'cita' ? 'Restaurante' : 'Viaje',
        badgeColor: '#5C9F9A',
        imageUrl: p.photos?.[0],
      });
    });
  }

  // 3. Fulfilled Wishes
  if (params.wishes) {
    params.wishes
      .filter((w) => w.status === 'fulfilled')
      .forEach((w) => {
        items.push({
          id: `wish-${w.id}`,
          kind: 'wish_fulfilled',
          date: w.updatedAt ? w.updatedAt.split('T')[0] : '2025-05-10',
          title: `Deseo Cumplido: ${w.title}`,
          subtitle: w.brand ? `De ${w.brand}` : 'Un detalle que teníamos muchas ganas',
          description: (w as any).notes || w.brand || 'Hicimos realidad este deseo juntos.',
          emoji: '🎁',
          badgeLabel: 'Ilusión Cumplida',
          badgeColor: '#D4AF37',
          imageUrl: w.externalImageUrl || w.images?.[0],
        });
      });
  }

  // 4. Diary Entries / Shared Memories
  if (params.entries) {
    params.entries.forEach((e) => {
      const content = e.content as any;
      if (!content || !content.title) return;

      items.push({
        id: `entry-${e.id}`,
        kind: 'memory',
        date: e.date || '2025-07-20',
        title: content.title,
        subtitle: e.moodTag ? `Sentimiento: ${e.moodTag}` : undefined,
        description: content.story || content.body || '',
        emoji: '🌿',
        badgeLabel: 'Recuerdo',
        badgeColor: '#6D9E7B',
        imageUrl: content.photos?.[0],
      });
    });
  }

  // 5. Couple Events (Past & Upcoming)
  if (params.coupleEvents) {
    const todayStr = new Date().toISOString().split('T')[0];

    params.coupleEvents.forEach((ev) => {
      if (ev.id.includes('first-met') || ev.id.includes('anniversary')) return;

      const title = ev.ownerView?.title || 'Plan de Pareja';
      const isUpcoming = ev.date >= todayStr;

      items.push({
        id: `event-${ev.id}`,
        kind: ev.eventType === 'surprise' ? 'surprise_revealed' : 'event',
        date: ev.date,
        time: ev.time,
        title: title,
        subtitle: ev.ownerView?.locationName || ev.ownerView?.subtitle,
        description: ev.ownerView?.subtitle,
        locationName: ev.ownerView?.locationName,
        emoji: ev.eventType === 'surprise' ? '✦' : '🗓️',
        badgeLabel: isUpcoming ? 'Próximo Capítulo' : 'Vivido',
        badgeColor: isUpcoming ? '#E86A58' : '#4A7C9B',
        isUpcoming: isUpcoming,
        chapterTitle: isUpcoming ? 'Próximos Capítulos' : undefined,
      });
    });
  }

  // Sort chronological (oldest to newest)
  return items.sort((a, b) => a.date.localeCompare(b.date));
}
