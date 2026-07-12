-- Doca — schema inicial: perfis, documentos, conversas/mensagens e créditos.
-- Corre este ficheiro no SQL Editor do teu projeto Supabase (Dashboard > SQL Editor > New query).

create extension if not exists "pgcrypto";

-- ── Tipos ─────────────────────────────────────────────────────────────
create type doc_kind as enum ('word', 'slides', 'sheet', 'pdf');
create type doc_status as enum ('draft', 'generating', 'ready');
create type credit_tx_type as enum ('bonus', 'purchase', 'consumption', 'adjustment');
create type user_plan as enum ('student', 'professional');

-- ── Configuração da app (linha única, editável no painel) ──────────────
create table public.app_config (
  id boolean primary key default true,
  signup_bonus_credits integer not null default 5,
  constraint app_config_singleton check (id)
);

insert into public.app_config (id, signup_bonus_credits)
values (true, 5)
on conflict (id) do nothing;

-- ── Perfis (estende auth.users) ─────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text,
  plan user_plan not null default 'student',
  audience text,
  credits_balance integer not null default 0,
  created_at timestamptz not null default now()
);

-- ── Documentos ───────────────────────────────────────────────────────
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind doc_kind not null,
  title text not null default 'Documento sem título',
  content jsonb,
  status doc_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index documents_user_id_idx on public.documents (user_id);

-- ── Conversas ────────────────────────────────────────────────────────
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  document_id uuid references public.documents (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index conversations_user_id_idx on public.conversations (user_id);
create index conversations_document_id_idx on public.conversations (document_id);

-- ── Mensagens ────────────────────────────────────────────────────────
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index messages_conversation_id_idx on public.messages (conversation_id);

-- ── Transações de créditos (auditoria) ──────────────────────────────────
create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type credit_tx_type not null,
  amount integer not null,
  description text,
  created_at timestamptz not null default now()
);

create index credit_transactions_user_id_idx on public.credit_transactions (user_id);

-- ── updated_at automático em documents ──────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger documents_set_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

-- ── Perfil + créditos de boas-vindas ao registar ────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bonus integer;
begin
  select signup_bonus_credits into v_bonus from public.app_config where id = true;
  v_bonus := coalesce(v_bonus, 0);

  insert into public.profiles (id, email, name, credits_balance)
  values (new.id, new.email, new.raw_user_meta_data ->> 'name', v_bonus);

  if v_bonus > 0 then
    insert into public.credit_transactions (user_id, type, amount, description)
    values (new.id, 'bonus', v_bonus, 'Créditos grátis de boas-vindas');
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Row Level Security ───────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.app_config enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "documents_select_own" on public.documents
  for select using (auth.uid() = user_id);

create policy "documents_insert_own" on public.documents
  for insert with check (auth.uid() = user_id);

create policy "documents_update_own" on public.documents
  for update using (auth.uid() = user_id);

create policy "documents_delete_own" on public.documents
  for delete using (auth.uid() = user_id);

create policy "conversations_select_own" on public.conversations
  for select using (auth.uid() = user_id);

create policy "conversations_insert_own" on public.conversations
  for insert with check (auth.uid() = user_id);

create policy "conversations_delete_own" on public.conversations
  for delete using (auth.uid() = user_id);

create policy "messages_select_own" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and c.user_id = auth.uid()
    )
  );

create policy "messages_insert_own" on public.messages
  for insert with check (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and c.user_id = auth.uid()
    )
  );

create policy "credit_transactions_select_own" on public.credit_transactions
  for select using (auth.uid() = user_id);

create policy "app_config_select_all" on public.app_config
  for select using (true);

-- ── RPC: consumir 1 crédito de forma atómica ────────────────────────────
create or replace function public.consume_credit(
  p_document_id uuid default null,
  p_description text default 'Geração de documento'
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
begin
  update public.profiles
    set credits_balance = credits_balance - 1
    where id = auth.uid() and credits_balance > 0
    returning credits_balance into v_balance;

  if v_balance is null then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;

  insert into public.credit_transactions (user_id, type, amount, description)
  values (auth.uid(), 'consumption', -1, coalesce(p_description, 'Geração de documento'));

  return v_balance;
end;
$$;

grant execute on function public.consume_credit(uuid, text) to authenticated;

-- ── RPC: créditos de teste manuais (temporário, até M-Pesa/e-Mola) ──────
create or replace function public.add_test_credits(p_amount integer default 5)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
begin
  if p_amount is null or p_amount <= 0 or p_amount > 50 then
    raise exception 'INVALID_AMOUNT';
  end if;

  update public.profiles
    set credits_balance = credits_balance + p_amount
    where id = auth.uid()
    returning credits_balance into v_balance;

  insert into public.credit_transactions (user_id, type, amount, description)
  values (auth.uid(), 'adjustment', p_amount, 'Créditos de teste (adicionados manualmente)');

  return v_balance;
end;
$$;

grant execute on function public.add_test_credits(integer) to authenticated;
