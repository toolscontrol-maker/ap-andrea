-- ====================================================================
-- ANDREA APP — SUPABASE FUNCTIONS & RPC MIGRATION (002_functions_and_rpc.sql)
-- Vector search RPCs, couple pairing, daily questions helper & triggers
-- ====================================================================

-- 1. AUTO-UPDATE UPDATED_AT TRIGGER
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply trigger to tables with updated_at
drop trigger if exists trigger_profiles_updated_at on public.profiles;
create trigger trigger_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists trigger_user_keys_updated_at on public.user_keys;
create trigger trigger_user_keys_updated_at
  before update on public.user_keys
  for each row execute function public.handle_updated_at();

drop trigger if exists trigger_entries_updated_at on public.entries;
create trigger trigger_entries_updated_at
  before update on public.entries
  for each row execute function public.handle_updated_at();

drop trigger if exists trigger_aya_consents_updated_at on public.aya_consents;
create trigger trigger_aya_consents_updated_at
  before update on public.aya_consents
  for each row execute function public.handle_updated_at();

drop trigger if exists trigger_subscriptions_updated_at on public.subscriptions;
create trigger trigger_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();

-- 2. PGVECTOR MATCH AYA ENTRIES RPC
-- Searches embeddings for relevant entries with strict double-consent verification
create or replace function public.match_aya_entries (
  query_embedding vector(1536),
  couple_id_param text,
  match_threshold float default 0.70,
  match_count int default 10,
  consent_scope text default 'shared_only',
  requesting_user_id uuid default null
)
returns table (
  id uuid,
  type entry_type_enum,
  entry_date date,
  mood_tag text,
  location_name text,
  similarity float
)
language plpgsql
security definer
as $$
declare
  has_double_consent boolean;
begin
  -- Verify active double consent
  select (user1_consent and user2_consent) into has_double_consent
  from public.aya_consents
  where couple_id = couple_id_param;

  if has_double_consent is not true then
    return;
  end if;

  -- Filter entries strictly by consent scope & couple ownership
  return query
  select
    e.id,
    e.type,
    e.entry_date,
    e.mood_tag,
    e.location_name,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.entries e
  left join public.aya_context_cache c on c.couple_id = e.couple_id
  where e.couple_id = couple_id_param
    and e.aya_consent_both = true
    and (
      (consent_scope = 'shared_only' and e.visibility = 'shared')
      or (consent_scope = 'shared_and_my_private' and (e.visibility = 'shared' or e.author_id = requesting_user_id))
      or (consent_scope = 'all_consented')
    )
  order by similarity desc
  limit match_count;
end;
$$;

-- 3. PAIRING WORKFLOW RPC (Atomic Couple Pairing)
create or replace function public.pair_with_partner(
  p_pairing_code text,
  p_encryption_pubkey text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  current_user_id uuid := auth.uid();
  target_partner record;
  computed_couple_id text;
begin
  if current_user_id is null then
    return jsonb_build_object('success', false, 'error', 'No autenticado');
  end if;

  -- Find partner by pairing code
  select * into target_partner
  from public.profiles
  where pairing_code = upper(trim(p_pairing_code))
    and id != current_user_id
    and partner_id is null;

  if target_partner.id is null then
    return jsonb_build_object('success', false, 'error', 'Código de vinculación no válido o expirado');
  end if;

  -- Compute deterministic couple_id
  computed_couple_id := md5(
    least(current_user_id::text, target_partner.id::text) || ':' ||
    greatest(current_user_id::text, target_partner.id::text)
  );

  -- Link both profiles
  update public.profiles
  set partner_id = target_partner.id,
      paired_at = now(),
      encryption_pubkey = coalesce(p_encryption_pubkey, encryption_pubkey)
  where id = current_user_id;

  update public.profiles
  set partner_id = current_user_id,
      paired_at = now()
  where id = target_partner.id;

  -- Create or get couple_keys entry
  insert into public.couple_keys (couple_id, user1_id, user2_id)
  values (
    computed_couple_id,
    least(current_user_id, target_partner.id),
    greatest(current_user_id, target_partner.id)
  )
  on conflict (couple_id) do nothing;

  -- Initialize aya consents record
  insert into public.aya_consents (couple_id, user1_consent, user2_consent)
  values (computed_couple_id, false, false)
  on conflict (couple_id) do nothing;

  return jsonb_build_object(
    'success', true,
    'couple_id', computed_couple_id,
    'partner_id', target_partner.id,
    'partner_name', target_partner.name,
    'partner_pubkey', target_partner.encryption_pubkey
  );
end;
$$;

-- 4. DAILY QUESTION HELPER (Select deterministic question of the day for couple)
create or replace function public.get_today_question(p_couple_id text)
returns table (
  id uuid,
  question_text text,
  category text,
  order_index int,
  my_answer jsonb,
  partner_answer jsonb,
  both_answered boolean
)
language plpgsql
security definer
as $$
declare
  curr_user_id uuid := auth.uid();
  total_questions int;
  selected_offset int;
  q_rec record;
  my_ans record;
  partner_ans record;
begin
  select count(*) into total_questions from public.daily_questions where active = true;
  if total_questions = 0 then return; end if;

  -- Determine question by day of year and couple hash
  selected_offset := (extract(doy from current_date)::int + ('x' || substr(p_couple_id, 1, 4))::bit(16)::int) % total_questions;

  select * into q_rec
  from public.daily_questions
  where active = true
  order by order_index asc
  offset selected_offset
  limit 1;

  -- Check my answer
  select * into my_ans
  from public.daily_answers
  where question_id = q_rec.id and couple_id = p_couple_id and user_id = curr_user_id;

  -- Check partner answer
  select * into partner_ans
  from public.daily_answers
  where question_id = q_rec.id and couple_id = p_couple_id and user_id != curr_user_id;

  return query
  select
    q_rec.id,
    q_rec.question_text,
    q_rec.category,
    q_rec.order_index,
    case when my_ans.id is not null then jsonb_build_object(
      'answered_at', my_ans.answered_at,
      'encrypted_answer', my_ans.encrypted_answer,
      'answer_nonce', my_ans.answer_nonce
    ) else null end as my_answer,
    case when partner_ans.id is not null and my_ans.id is not null then jsonb_build_object(
      'answered_at', partner_ans.answered_at,
      'encrypted_answer', partner_ans.encrypted_answer,
      'answer_nonce', partner_ans.answer_nonce
    ) else null end as partner_answer,
    (my_ans.id is not null and partner_ans.id is not null) as both_answered;
end;
$$;
