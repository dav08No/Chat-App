-- 1. conversations
create table public.conversations (
  id uuid not null default gen_random_uuid(),
  title text null,
  is_group boolean not null default false,
  created_by uuid null,
  last_message_at timestamptz null,
  created_at timestamptz not null default now(),
  constraint conversations_pkey primary key (id),
  constraint conversations_created_by_fkey
    foreign key (created_by)
    references auth.users (id)
    on delete set null
);

create index if not exists idx_conversations_last_time
  on public.conversations (last_message_at desc nulls last, created_at desc);


-- 2. profiles
create table public.profiles (
  id uuid not null,
  display_name text null,
  avatar_url text null,
  created_at timestamptz not null default now(),
  constraint profiles_pkey primary key (id),
  constraint profiles_display_name_key unique (display_name),
  constraint profiles_id_fkey
    foreign key (id)
    references auth.users (id)
    on delete cascade
);

create index if not exists idx_profiles_created_at
  on public.profiles (created_at desc);


-- 3. members
create table public.members (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  conversation_id uuid not null,
  role text not null default 'member'::text,
  last_read_at timestamptz null,
  joined_at timestamptz not null default now(),
  constraint members_pkey primary key (id),
  constraint members_user_id_conversation_id_key unique (user_id, conversation_id),
  constraint members_conversation_id_fkey
    foreign key (conversation_id)
    references public.conversations (id)
    on delete cascade,
  constraint members_user_id_fkey
    foreign key (user_id)
    references auth.users (id)
    on delete cascade
);

create index if not exists idx_members_user
  on public.members (user_id);

create index if not exists idx_members_conversation
  on public.members (conversation_id);


-- 4. direct_messages
create table public.direct_messages (
  conversation_id uuid not null,
  user_a uuid not null,
  user_b uuid not null,
  pair_key text not null,
  constraint direct_messages_pkey primary key (conversation_id),
  constraint direct_messages_pair_key_key unique (pair_key),
  constraint direct_messages_conversation_id_fkey
    foreign key (conversation_id)
    references public.conversations (id)
    on delete cascade,
  constraint direct_messages_user_a_fkey
    foreign key (user_a)
    references auth.users (id),
  constraint direct_messages_user_b_fkey
    foreign key (user_b)
    references auth.users (id),
  constraint dm_users_distinct check (user_a <> user_b)
);


-- 5. messages
create table public.messages (
  id uuid not null default gen_random_uuid(),
  conversation_id uuid not null,
  sender_id uuid not null,
  content text not null,
  edited_at timestamptz null,
  deleted_at timestamptz null,
  created_at timestamptz not null default now(),
  constraint messages_pkey primary key (id),
  constraint messages_conversation_id_fkey
    foreign key (conversation_id)
    references public.conversations (id)
    on delete cascade,
  constraint messages_sender_id_fkey
    foreign key (sender_id)
    references auth.users (id)
    on delete cascade
);

create index if not exists idx_messages_conv_time
  on public.messages (conversation_id, created_at desc);

create index if not exists idx_messages_sender
  on public.messages (sender_id);
