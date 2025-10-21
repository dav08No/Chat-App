-- ==============================
-- CORE TABLES
-- ==============================

-- Chats (DM oder Gruppe)
create table if not exists public.conversations (
  id               uuid primary key default gen_random_uuid(),
  title            text,                       -- nur für Gruppen relevant
  is_group         boolean not null default false,
  created_by       uuid references auth.users(id) on delete set null,
  last_message_at  timestamptz,
  created_at       timestamptz not null default now()
);

-- Teilnehmer je Chat (N:M)
create table if not exists public.members (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role            text not null default 'member',  -- 'member' | 'admin'
  last_read_at    timestamptz,
  joined_at       timestamptz not null default now(),
  unique (user_id, conversation_id)
);

-- Nachrichten
create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references auth.users(id) on delete cascade,
  content         text not null,
  edited_at       timestamptz,
  deleted_at      timestamptz,
  created_at      timestamptz not null default now()
);

-- Eindeutige 1:1 Konversation pro User-Paar
create table if not exists public.direct_messages (
  conversation_id uuid primary key references public.conversations(id) on delete cascade,
  user_a uuid not null references auth.users(id),
  user_b uuid not null references auth.users(id),
  -- generierte Spalte für Eindeutigkeitsprüfung
  pair_key text generated always as (
    case
      when user_a < user_b then user_a || '_' || user_b
      else user_b || '_' || user_a
    end
  ) stored,
  constraint dm_users_distinct check (user_a <> user_b),
  unique (pair_key)
);


-- ==============================
-- INDEXES (Performance)
-- ==============================
create index if not exists idx_members_user            on public.members(user_id);
create index if not exists idx_members_conversation    on public.members(conversation_id);
create index if not exists idx_messages_conv_time      on public.messages(conversation_id, created_at desc);
create index if not exists idx_conversations_last_time on public.conversations(last_message_at desc nulls last, created_at desc);

-- ==============================
-- RLS (Row Level Security)
-- ==============================
alter table public.conversations  enable row level security;
alter table public.members        enable row level security;
alter table public.messages       enable row level security;
alter table public.direct_messages enable row level security;

-- Conversations: sehen, wenn Mitglied; erstellen erlaubt
create policy if not exists conv_select_if_member on public.conversations
  for select using (
    exists (select 1 from public.members m
            where m.conversation_id = conversations.id
              and m.user_id = auth.uid())
  );

create policy if not exists conv_insert_any on public.conversations
  for insert with check (true);

-- Members: sehen, wenn in derselben Conversation; sich selbst hinzufügen
create policy if not exists mem_select_if_in_conv on public.members
  for select using (
    exists (select 1 from public.members m2
            where m2.conversation_id = members.conversation_id
              and m2.user_id = auth.uid())
  );

create policy if not exists mem_insert_self on public.members
  for insert with check (auth.uid() = user_id);

-- Messages: lesen/schreiben nur als Mitglied
create policy if not exists msg_select_if_member on public.messages
  for select using (
    exists (select 1 from public.members m
            where m.conversation_id = messages.conversation_id
              and m.user_id = auth.uid())
  );

create policy if not exists msg_insert_if_member on public.messages
  for insert with check (
    auth.uid() = sender_id and
    exists (select 1 from public.members m
            where m.conversation_id = messages.conversation_id
              and m.user_id = auth.uid())
  );

-- Direct messages: sichtbar/erstellbar nur für Beteiligte
create policy if not exists dm_select_if_participant on public.direct_messages
  for select using (auth.uid() in (user_a, user_b));

create policy if not exists dm_insert_if_participant on public.direct_messages
  for insert with check (auth.uid() in (user_a, user_b));

-- ==============================
-- TRIGGER: last_message_at automatisch pflegen
-- ==============================
create or replace function public.bump_last_message_at()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update public.conversations
       set last_message_at = new.created_at
     where id = new.conversation_id;
  end if;
  return null;
end$$;

drop trigger if exists trg_bump_last_message_at on public.messages;
create trigger trg_bump_last_message_at
after insert on public.messages
for each row execute function public.bump_last_message_at();

-- ==============================
-- MINIMALE SEEDS (ersetze UUIDs!)
-- ==============================
-- Hole zwei echte User-IDs aus Authentication → Users
-- select id,email from auth.users;

-- Beispiel: eine DM zwischen USER_A und USER_B erzeugen
-- (1) Conversation anlegen (is_group=false)
with conv as (
  insert into public.conversations (is_group, created_by)
  values (false, '<USER_A_UUID>')
  returning id
)
-- (2) DM-Relation mit Eindeutigkeitsgarantie
insert into public.direct_messages (conversation_id, user_a, user_b)
select c.id,
       least('<USER_A_UUID>'::uuid, '<USER_B_UUID>'::uuid),
       greatest('<USER_A_UUID>'::uuid, '<USER_B_UUID>'::uuid)
from conv c;

-- (3) Mitglieder hinzufügen (je User – wegen RLS am besten je einmal eingeloggt ausführen)
-- insert into public.members (user_id, conversation_id) values ('<USER_A_UUID>', '<CONVERSATION_UUID>');
-- insert into public.members (user_id, conversation_id) values ('<USER_B_UUID>', '<CONVERSATION_UUID>');

-- (4) Erste Nachricht senden (vom jeweiligen Sender-Login)
-- insert into public.messages (conversation_id, sender_id, content)
-- values ('<CONVERSATION_UUID>', '<USER_A_UUID>', 'Hallo 👋');
