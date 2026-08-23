-- ====================================================================
-- ANDREA APP — SEED DAILY QUESTIONS (003_seed_daily_questions.sql)
-- Catálogo enriquecido de preguntas de conexión diaria para parejas
-- ====================================================================

insert into public.daily_questions (question_text, category, order_index) values
-- Gratitud & Aprecio
('¿Qué pequeño gesto mío hoy te hizo sonreír o sentirte querido/a?', 'gratitud', 1),
('¿Qué cualidad admiras hoy de nuestra forma de comunicarnos?', 'gratitud', 2),
('¿Cuál es un recuerdo reciente juntos que revivirías una y otra vez?', 'gratitud', 3),
('¿De qué manera te he apoyado en los últimos días que haya significado mucho para ti?', 'gratitud', 4),
('¿Qué detalle de mi personalidad te enamoró al principio y sigues valorando hoy?', 'gratitud', 5),

-- Intimidad & Emoción
('¿Qué emoción ha estado más presente en tu interior a lo largo de este día?', 'intimidad', 6),
('¿Hay algo que sientas hoy pero no te hayas atrevido a decirme en voz alta?', 'intimidad', 7),
('¿Qué tipo de abrazo o contacto físico necesitas de mí en este momento?', 'intimidad', 8),
('¿Cómo te sientes con respecto al espacio que tenemos para la intimidad y el descanso?', 'intimidad', 9),
('¿Cuál es una fantasía o deseo de aventura que te gustaría explorar juntos?', 'intimidad', 10),

-- Necesidades & Apoyo
('¿Qué necesitas de mí esta semana para sentirte con menos carga o estrés?', 'necesidades', 11),
('¿Hay alguna conversación pendiente que te gustaría que tengamos con calma y cariño?', 'necesidades', 12),
('¿En qué área de tu vida personal sientes que necesitas más ánimo o comprensión?', 'necesidades', 13),
('¿Cómo puedo hacerte sentir más escuchado/a cuando me cuentas tus preocupaciones?', 'necesidades', 14),

-- Futuro & Sueños Compartidos
('Si pudiéramos planear una escapada de fin de semana sorpresa, ¿a qué tipo de lugar iríamos?', 'futuro', 15),
('¿Qué meta o proyecto personal te entusiasma más alcanzar en los próximos seis meses?', 'futuro', 16),
('¿Cómo te imaginas nuestro hogar o rutina ideal dentro de tres años?', 'futuro', 17),
('¿Qué tradición o hábito nuevo te gustaría que construyéramos juntos?', 'futuro', 18),

-- Cotidiano & Diversión
('¿Cuál ha sido el momento más divertido o absurdo de tu día de hoy?', 'diversion', 19),
('Si hoy fuéramos a cocinar juntos algo especial sin preocuparnos por el tiempo, ¿qué sería?', 'diversion', 20),
('¿Qué canción describe mejor la energía con la que te has levantado hoy?', 'diversion', 21),
('Si tuviéramos una tarde libre entera sin pantallas ni obligaciones, ¿qué haríamos?', 'diversion', 22),

-- Valores & Reflexión Profunda
('¿Qué valor fundamental consideras que es el pilar de nuestra relación?', 'valores', 23),
('¿De qué forma sientes que hemos crecido y madurado como pareja desde que empezamos?', 'valores', 24),
('¿Qué lección importante sobre el amor o la paciencia has aprendido en nuestro camino?', 'valores', 25),
('Si hoy fuera nuestro último día juntos en la tierra, ¿qué querrías que celebráramos?', 'valores', 26)
on conflict do nothing;
