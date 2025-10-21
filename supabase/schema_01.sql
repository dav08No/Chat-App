-- =====================================
-- CORE TABLES
-- =====================================
-- Nutzerprofile (optional, für Name, Avatar etc.)
create table
  if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    display_name text,
    avatar_url text,
    created_at timestamptz not null default now ()
  );

-- Conversations: Chat-Räume (1:1 oder Gruppen)
create table
  if not exists public.conversations (
    id uuid primary key default gen_random_uuid (),
    title text, -- nur bei Gruppen benötigt
    is_group boolean not null default false,
    created_at timestamptz not null default now ()
  );

-- Members: Verknüpft User mit einer Conversation (N:M)
create table
  if not exists public.members (
    id uuid primary key default gen_random_uuid (),
    user_id uuid not null references auth.users (id) on delete cascade,
    conversation_id uuid not null references public.conversations (id) on delete cascade,
    role text not null default 'member', -- z. B. admin/member
    joined_at timestamptz not null default now (),
    unique (user_id, conversation_id)
  );

-- Messages: einzelne Nachrichten
create table
  if not exists public.messages (
    id uuid primary key default gen_random_uuid (),
    conversation_id uuid not null references public.conversations (id) on delete cascade,
    sender_id uuid not null references auth.users (id) on delete cascade,
    content text not null,
    created_at timestamptz not null default now ()
  );

-- =====================================
-- PERFORMANCE INDICES
-- =====================================
create index if not exists idx_messages_conv_time on public.messages (conversation_id, created_at desc);

create index if not exists idx_members_user on public.members (user_id);

create index if not exists idx_members_conversation on public.members (conversation_id);

-- =====================================
-- ROW LEVEL SECURITY
-- =====================================
alter table public.profiles enable row level security;

alter table public.conversations enable row level security;

alter table public.members enable row level security;

alter table public.messages enable row level security;

-- =====================================
-- POLICIES
-- =====================================
-- profiles
create policy "profile_select_own" on public.profiles for
select
  using (auth.uid () = id);

create policy "profile_insert_own" on public.profiles for insert
with
  check (auth.uid () = id);

create policy "profile_update_own" on public.profiles for
update using (auth.uid () = id);

-- conversations
create policy "conversation_select_if_member" on public.conversations for
select
  using (
    exists (
      select
        1
      from
        public.members m
      where
        m.conversation_id = conversations.id
        and m.user_id = auth.uid ()
    )
  );

create policy "conversation_insert_any" on public.conversations for insert
with
  check (true);

-- members
create policy "member_select_if_in_conv" on public.members for
select
  using (
    exists (
      select
        1
      from
        public.members m2
      where
        m2.conversation_id = members.conversation_id
        and m2.user_id = auth.uid ()
    )
  );

create policy "member_insert_self" on public.members for insert
with
  check (auth.uid () = user_id);

-- messages
create policy "message_select_if_member" on public.messages for
select
  using (
    exists (
      select
        1
      from
        public.members m
      where
        m.conversation_id = messages.conversation_id
        and m.user_id = auth.uid ()
    )
  );

create policy "message_insert_if_member" on public.messages for insert
with
  check (
    auth.uid () = sender_id
    and exists (
      select
        1
      from
        public.members m
      where
        m.conversation_id = messages.conversation_id
        and m.user_id = auth.uid ()
    )
  );

-- =====================================
-- SAMPLE DATA (optional)
-- =====================================
-- insert into public.conversations (title, is_group) values ('Test Chat', false);