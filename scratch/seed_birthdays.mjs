import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const birthdayEvents = [
  {
    id: 'cev-birthday-andrea-2025',
    couple_id: 'andrea-tonet',
    owner_id: '22222222-dddd-eeee-ffff-222222222222',
    partner_id: '11111111-aaaa-bbbb-cccc-111111111111',
    event_type: 'important_date',
    date: '2025-09-01',
    time: '00:00',
    actual_start_at: '2025-09-01T00:00:00',
    owner_view: {
      title: '🎂 Cumpleaños de Andrea (1 de Septiembre)',
      subtitle: '1 de Septiembre · El día más bonito del año para celebrar la vida de Andrea.',
      locationName: 'Valencia',
    },
    partner_view: {
      title: '🎂 Cumpleaños de Andrea (1 de Septiembre)',
      subtitle: '1 de Septiembre · El día más bonito del año para celebrar la vida de Andrea.',
      locationName: 'Valencia',
    },
    reveal_policy: 'immediate',
    visibility: 'shared',
    status: 'completed',
  },
  {
    id: 'cev-birthday-andrea-2026',
    couple_id: 'andrea-tonet',
    owner_id: '22222222-dddd-eeee-ffff-222222222222',
    partner_id: '11111111-aaaa-bbbb-cccc-111111111111',
    event_type: 'important_date',
    date: '2026-09-01',
    time: '00:00',
    actual_start_at: '2026-09-01T00:00:00',
    owner_view: {
      title: '🎂 Cumpleaños de Andrea (1 de Septiembre)',
      subtitle: '1 de Septiembre · ¡Celebrando la vida y el cumpleaños de Andrea juntos!',
      locationName: 'Valencia',
    },
    partner_view: {
      title: '🎂 Cumpleaños de Andrea (1 de Septiembre)',
      subtitle: '1 de Septiembre · ¡Celebrando la vida y el cumpleaños de Andrea juntos!',
      locationName: 'Valencia',
    },
    reveal_policy: 'immediate',
    visibility: 'shared',
    status: 'scheduled',
  },
  {
    id: 'cev-birthday-tonet-2025',
    couple_id: 'andrea-tonet',
    owner_id: '11111111-aaaa-bbbb-cccc-111111111111',
    partner_id: '22222222-dddd-eeee-ffff-222222222222',
    event_type: 'important_date',
    date: '2025-10-19',
    time: '00:00',
    actual_start_at: '2025-10-19T00:00:00',
    owner_view: {
      title: '🎂 Cumpleaños de Tonet (19 de Octubre)',
      subtitle: '19 de Octubre · Celebrando el cumpleaños de Tonet juntos con amor y risas.',
      locationName: 'Valencia',
    },
    partner_view: {
      title: '🎂 Cumpleaños de Tonet (19 de Octubre)',
      subtitle: '19 de Octubre · Celebrando el cumpleaños de Tonet juntos con amor y risas.',
      locationName: 'Valencia',
    },
    reveal_policy: 'immediate',
    visibility: 'shared',
    status: 'completed',
  },
  {
    id: 'cev-birthday-tonet-2026',
    couple_id: 'andrea-tonet',
    owner_id: '11111111-aaaa-bbbb-cccc-111111111111',
    partner_id: '22222222-dddd-eeee-ffff-222222222222',
    event_type: 'important_date',
    date: '2026-10-19',
    time: '00:00',
    actual_start_at: '2026-10-19T00:00:00',
    owner_view: {
      title: '🎂 Cumpleaños de Tonet (19 de Octubre)',
      subtitle: '19 de Octubre · ¡Celebrando un año más juntos llenos de ilusión y proyectos!',
      locationName: 'Valencia',
    },
    partner_view: {
      title: '🎂 Cumpleaños de Tonet (19 de Octubre)',
      subtitle: '19 de Octubre · ¡Celebrando un año más juntos llenos de ilusión y proyectos!',
      locationName: 'Valencia',
    },
    reveal_policy: 'immediate',
    visibility: 'shared',
    status: 'scheduled',
  },
];

async function seedBirthdays() {
  console.log('🎂 Sembrando cumpleaños en Supabase couple_events...');
  const { data, error } = await client.from('couple_events').upsert(birthdayEvents);
  if (error) {
    console.error('❌ Error sembrando cumpleaños:', error);
  } else {
    console.log('✅ ¡Cumpleaños de Andrea (1 Sept) y Tonet (19 Oct) guardados en Supabase Cloud con éxito!');
  }
}

seedBirthdays().catch(console.error);
