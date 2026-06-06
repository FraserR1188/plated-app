-- ================================================================
-- plated. — Supabase Database Schema
-- ================================================================
-- HOW TO USE:
-- 1. Go to your Supabase project dashboard
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "New query"
-- 4. Paste this entire file in and click "Run"
-- ================================================================

create extension if not exists "uuid-ossp";

-- ── MEAL ENTRIES ─────────────────────────────────────────────
-- One row per meal logged. Each row belongs to a user.

create table if not exists meal_entries (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  date         date not null,
  logged_at    timestamptz not null default now(),
  name         text not null,
  calories     numeric(8,2) not null default 0,
  protein      numeric(8,2) not null default 0,
  carbs        numeric(8,2) not null default 0,
  fat          numeric(8,2) not null default 0,
  source       text not null default 'manual',
  barcode      text,
  off_id       text,
  serving_g    numeric(8,2)
);

create index if not exists meal_entries_user_date
  on meal_entries(user_id, date desc);

-- ── GOALS ────────────────────────────────────────────────────
-- One row per user storing their daily nutrition targets.

create table if not exists goals (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  calories     integer not null default 2000,
  protein      integer not null default 150,
  carbs        integer not null default 200,
  fat          integer not null default 65,
  updated_at   timestamptz not null default now()
);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
-- This ensures users can only ever see and edit their own data.

alter table meal_entries enable row level security;
alter table goals enable row level security;

create policy "Users can read own entries"
  on meal_entries for select using (auth.uid() = user_id);

create policy "Users can insert own entries"
  on meal_entries for insert with check (auth.uid() = user_id);

create policy "Users can delete own entries"
  on meal_entries for delete using (auth.uid() = user_id);

create policy "Users can read own goals"
  on goals for select using (auth.uid() = user_id);

create policy "Users can upsert own goals"
  on goals for insert with check (auth.uid() = user_id);

create policy "Users can update own goals"
  on goals for update using (auth.uid() = user_id);
