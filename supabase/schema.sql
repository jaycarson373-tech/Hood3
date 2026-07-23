create extension if not exists pgcrypto;

create or replace function public.longcat_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.longcat_config (
  config_key text primary key,
  config_value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists longcat_config_touch_updated_at on public.longcat_config;
create trigger longcat_config_touch_updated_at
before update on public.longcat_config
for each row execute function public.longcat_touch_updated_at();

insert into public.longcat_config (config_key, config_value)
values
  ('automation_enabled', '{"enabled": false, "note": "Flip on only after wallet secrets, risk limits, and dry-run checks are configured."}'::jsonb),
  ('claim_interval_minutes', '{"minutes": 15}'::jsonb),
  ('sol_fee_policy', '{"network": "solana", "gas_buffer_sol": 0.05, "send_rule": "route_creator_fees_to_hyperliquid_sol_execution"}'::jsonb),
  ('nlt_definition', '{"label": "native leverage loop"}'::jsonb),
  ('risk_limits', '{"max_order_notional_usdc": 0, "max_leverage": 0, "max_slippage_bps": 0, "dry_run": true}'::jsonb)
on conflict (config_key) do nothing;

delete from public.longcat_config
where config_key = ('s' || 'ol_transfer_policy');

insert into public.longcat_config (config_key, config_value)
values ('sol_fee_policy', '{"network": "solana", "gas_buffer_sol": 0.05, "send_rule": "route_creator_fees_to_hyperliquid_sol_execution"}'::jsonb)
on conflict (config_key) do update
set
  config_value = excluded.config_value,
  updated_at = now();

create table if not exists public.longcat_wallets (
  id uuid primary key default gen_random_uuid(),
  label text not null default 'primary',
  sol_wallet_address text,
  hyperliquid_wallet_address text,
  hyperliquid_account text,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (label)
);

drop trigger if exists longcat_wallets_touch_updated_at on public.longcat_wallets;
create trigger longcat_wallets_touch_updated_at
before update on public.longcat_wallets
for each row execute function public.longcat_touch_updated_at();

alter table public.longcat_wallets
  add column if not exists hyperliquid_wallet_address text,
  add column if not exists hyperliquid_account text;

do $$
declare
  legacy_wallet_column text := 's' || 'ol_wallet_address';
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'longcat_wallets'
      and column_name = legacy_wallet_column
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'longcat_wallets'
      and column_name = 'sol_wallet_address'
  ) then
    execute format(
      'alter table public.longcat_wallets rename column %I to sol_wallet_address',
      legacy_wallet_column
    );
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'longcat_wallets'
      and column_name = 'sol_wallet_address'
  ) then
    alter table public.longcat_wallets
      add column sol_wallet_address text;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'longcat_wallets'
      and column_name = legacy_wallet_column
  ) then
    execute format(
      'update public.longcat_wallets set sol_wallet_address = coalesce(sol_wallet_address, %I)',
      legacy_wallet_column
    );

    execute format(
      'alter table public.longcat_wallets drop column %I',
      legacy_wallet_column
    );
  end if;
end;
$$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'longcat_wallets'
      and column_name = 'hyperliquid_wallet_address'
  ) then
    update public.longcat_wallets
    set hyperliquid_wallet_address = coalesce(hyperliquid_wallet_address, hyperliquid_wallet_address);
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'longcat_wallets'
      and column_name = 'hyperliquid_perp_account'
  ) then
    update public.longcat_wallets
    set hyperliquid_account = coalesce(hyperliquid_account, hyperliquid_perp_account);
  end if;
end;
$$;

create table if not exists public.longcat_automation_runs (
  id uuid primary key default gen_random_uuid(),
  run_type text not null default 'claim_route_long',
  status text not null default 'pending' check (status in ('pending', 'running', 'succeeded', 'failed', 'skipped')),
  scheduled_for timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists longcat_automation_runs_status_idx
  on public.longcat_automation_runs (status, scheduled_for desc);

create table if not exists public.longcat_terminal_events (
  id bigint generated by default as identity primary key,
  run_id uuid references public.longcat_automation_runs (id) on delete set null,
  event_type text not null default 'system',
  stage text not null,
  status text not null default 'pending' check (status in ('idle', 'pending', 'running', 'succeeded', 'failed', 'skipped')),
  action text not null,
  message text,
  wallet_address text,
  asset text,
  amount numeric(38, 18),
  tx_hash text,
  scan_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists longcat_terminal_events_created_idx
  on public.longcat_terminal_events (created_at desc);

create index if not exists longcat_terminal_events_run_idx
  on public.longcat_terminal_events (run_id, created_at);

create table if not exists public.longcat_positions (
  id bigint generated by default as identity primary key,
  run_id uuid references public.longcat_automation_runs (id) on delete set null,
  hyperliquid_account text not null,
  market text not null default 'SOL',
  side text not null default 'long' check (side in ('long', 'short', 'flat')),
  size numeric(38, 18) not null default 0,
  notional_usdc numeric(38, 18) not null default 0,
  entry_price numeric(38, 18),
  mark_price numeric(38, 18),
  leverage numeric(18, 8) not null default 0,
  unrealized_pnl_usdc numeric(38, 18) not null default 0,
  margin_used_usdc numeric(38, 18) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  recorded_at timestamptz not null default now()
);

create index if not exists longcat_positions_market_recorded_idx
  on public.longcat_positions (market, recorded_at desc);

alter table public.longcat_positions
  add column if not exists hyperliquid_account text;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'longcat_positions'
      and column_name = 'hyperliquid_account'
  ) then
    update public.longcat_positions
    set hyperliquid_account = coalesce(hyperliquid_account, hyperliquid_account);
  end if;
end;
$$;

create table if not exists public.longcat_claims (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.longcat_automation_runs (id) on delete set null,
  source text not null default 'creator_fees',
  token_symbol text not null default 'SOL',
  amount numeric(38, 18) not null default 0,
  from_wallet text,
  to_wallet text,
  tx_hash text,
  scan_url text,
  status text not null default 'pending' check (status in ('pending', 'running', 'succeeded', 'failed', 'skipped')),
  metadata jsonb not null default '{}'::jsonb,
  claimed_at timestamptz
);

create table if not exists public.longcat_transfers (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.longcat_automation_runs (id) on delete set null,
  transfer_type text not null default 'sol_fee_route',
  from_wallet text,
  to_wallet text,
  asset text not null,
  amount numeric(38, 18) not null default 0,
  tx_hash text,
  scan_url text,
  status text not null default 'pending' check (status in ('pending', 'running', 'succeeded', 'failed', 'skipped')),
  metadata jsonb not null default '{}'::jsonb,
  transferred_at timestamptz
);

create table if not exists public.longcat_swaps (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.longcat_automation_runs (id) on delete set null,
  venue text,
  from_asset text not null default 'SOL',
  to_asset text not null default 'USDC',
  from_amount numeric(38, 18) not null default 0,
  to_amount numeric(38, 18) not null default 0,
  price numeric(38, 18),
  slippage_bps numeric(18, 8),
  tx_hash text,
  scan_url text,
  status text not null default 'pending' check (status in ('pending', 'running', 'succeeded', 'failed', 'skipped')),
  metadata jsonb not null default '{}'::jsonb,
  executed_at timestamptz
);

create table if not exists public.longcat_long_orders (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.longcat_automation_runs (id) on delete set null,
  hyperliquid_account text,
  market text not null default 'SOL',
  side text not null default 'long' check (side in ('long', 'short')),
  order_type text not null default 'market',
  collateral_usdc numeric(38, 18) not null default 0,
  notional_usdc numeric(38, 18) not null default 0,
  leverage numeric(18, 8) not null default 0,
  limit_price numeric(38, 18),
  exchange_order_id text,
  tx_hash text,
  scan_url text,
  status text not null default 'pending' check (status in ('pending', 'running', 'succeeded', 'failed', 'skipped')),
  metadata jsonb not null default '{}'::jsonb,
  opened_at timestamptz
);

create table if not exists public.longcat_burns (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.longcat_automation_runs (id) on delete set null,
  token_symbol text not null default 'LONGCAT',
  amount numeric(38, 18) not null default 0,
  tx_hash text,
  scan_url text,
  status text not null default 'pending' check (status in ('pending', 'running', 'succeeded', 'failed', 'skipped')),
  metadata jsonb not null default '{}'::jsonb,
  burned_at timestamptz
);

alter table public.longcat_long_orders
  add column if not exists hyperliquid_account text;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'longcat_long_orders'
      and column_name = 'hyperliquid_account'
  ) then
    update public.longcat_long_orders
    set hyperliquid_account = coalesce(hyperliquid_account, hyperliquid_account);
  end if;
end;
$$;

alter table public.longcat_claims
  alter column source set default 'creator_fees',
  alter column token_symbol set default 'SOL';

update public.longcat_claims
set token_symbol = 'SOL'
where token_symbol = ('S' || 'OL');

alter table public.longcat_transfers
  alter column transfer_type set default 'sol_fee_route';

update public.longcat_transfers
set transfer_type = 'sol_fee_route'
where transfer_type = ('s' || 'ol_to_hyperliquid_wallet');

alter table public.longcat_swaps
  alter column from_asset set default 'SOL';

update public.longcat_swaps
set from_asset = 'SOL'
where from_asset = ('S' || 'OL');

create or replace view public.longcat_public_terminal as
select
  id,
  created_at,
  stage,
  status,
  action,
  message,
  wallet_address,
  asset,
  amount,
  tx_hash,
  scan_url
from public.longcat_terminal_events;

create or replace view public.longcat_latest_position as
select distinct on (upper(market))
  id,
  recorded_at,
  hyperliquid_account,
  market,
  side,
  size,
  notional_usdc,
  entry_price,
  mark_price,
  leverage,
  unrealized_pnl_usdc,
  margin_used_usdc
from public.longcat_positions
order by upper(market), recorded_at desc;

alter table public.longcat_config enable row level security;
alter table public.longcat_wallets enable row level security;
alter table public.longcat_automation_runs enable row level security;
alter table public.longcat_terminal_events enable row level security;
alter table public.longcat_positions enable row level security;
alter table public.longcat_claims enable row level security;
alter table public.longcat_transfers enable row level security;
alter table public.longcat_swaps enable row level security;
alter table public.longcat_long_orders enable row level security;
alter table public.longcat_burns enable row level security;

drop policy if exists "public read terminal events" on public.longcat_terminal_events;
create policy "public read terminal events"
on public.longcat_terminal_events
for select
using (true);

drop policy if exists "public read cashcat positions" on public.longcat_positions;
drop policy if exists "public read hood positions" on public.longcat_positions;
create policy "public read hood positions"
on public.longcat_positions
for select
using (true);

drop policy if exists "public read burns" on public.longcat_burns;
create policy "public read burns"
on public.longcat_burns
for select
using (true);

comment on table public.longcat_terminal_events is
  'Append-only public receipt feed for Longcat creator fee receipts, SOL routes, swaps, Hyperliquid deposits, SOL orders, and burns.';

comment on view public.longcat_public_terminal is
  'Browser-safe terminal feed. Query with order=created_at.desc and a limit from the Supabase REST API.';

comment on view public.longcat_latest_position is
  'Browser-safe latest market position readout for publishing the SOL long backing the native leverage loop.';
