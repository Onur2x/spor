-- FitPro PWA - Database Schema
-- Run this in Supabase SQL Editor

create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  age int,
  height_cm numeric,
  weight_kg numeric,
  sex text check (sex in ('male', 'female')) default 'male',
  goal text check (goal in ('muscle', 'fat', 'recomp', 'strength', 'fitness', 'performance')) default 'muscle',
  level text check (level in ('beginner', 'novice', 'intermediate', 'advanced', 'athlete')) default 'beginner',
  days_per_week int default 3 check (days_per_week between 2 and 6),
  weekdays int[] default '{0,2,4}',
  equipment text check (equipment in ('gym', 'home', 'bodyweight')) default 'gym',
  session_minutes int default 60 check (session_minutes in (30, 45, 60, 75, 90, 120)),
  activity text check (activity in ('low', 'moderate', 'high', 'very_high')) default 'moderate',
  target_kcal int,
  target_protein_g int,
  target_carbs_g int,
  target_fat_g int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Exercises library with GIF URLs
create table if not exists public.exercises (
  id text primary key,
  name text not null,
  name_tr text,
  muscle_group text not null,
  muscle_group_tr text,
  equipment text not null,
  pattern text not null,
  gif_url text,
  gif_url_alt text,
  instructions_tr text,
  instructions_en text,
  tips_tr text,
  sets int default 3,
  min_reps int default 8,
  max_reps int default 12,
  rest_seconds int default 90,
  is_compound boolean default false,
  difficulty int default 1 check (difficulty between 1 and 5),
  created_at timestamptz default now()
);

-- Workouts (sessions)
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_date date not null,
  name text,
  split_name text,
  status text default 'in_progress' check (status in ('in_progress', 'completed', 'skipped')),
  started_at timestamptz default now(),
  completed_at timestamptz,
  duration_seconds int,
  notes text,
  created_at timestamptz default now()
);

-- Workout sets (detailed tracking)
create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id text not null references public.exercises(id),
  set_number int not null,
  weight_kg numeric,
  reps int,
  rir int check (rir between 0 and 10),
  rpe numeric check (rpe between 1 and 10),
  completed boolean default false,
  is_warmup boolean default false,
  rest_taken_seconds int,
  created_at timestamptz default now()
);

-- Body measurements
create table if not exists public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_at date not null,
  weight_kg numeric,
  body_fat_pct numeric,
  waist_cm numeric,
  chest_cm numeric,
  arm_cm numeric,
  forearm_cm numeric,
  thigh_cm numeric,
  calf_cm numeric,
  neck_cm numeric,
  shoulder_cm numeric,
  created_at timestamptz default now(),
  unique(user_id, measured_at)
);

-- Personal records (PRs)
create table if not exists public.personal_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id text not null references public.exercises(id),
  record_type text not null check (record_type in ('e1rm', 'max_weight', 'max_reps', 'max_volume')),
  value numeric not null,
  achieved_at timestamptz default now(),
  unique(user_id, exercise_id, record_type)
);

-- Recovery logs
create table if not exists public.recovery_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_at date not null,
  sleep_hours numeric check (sleep_hours between 0 and 24),
  sleep_quality int check (sleep_quality between 1 and 10),
  energy int check (energy between 1 and 10),
  soreness int check (soreness between 1 and 10),
  stress int check (stress between 1 and 10),
  hrv int,
  resting_hr int,
  mood int check (mood between 1 and 10),
  notes text,
  created_at timestamptz default now(),
  unique(user_id, logged_at)
);

-- Nutrition daily totals
create table if not exists public.nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_at date not null,
  calories int default 0,
  protein_g numeric default 0,
  carbs_g numeric default 0,
  fat_g numeric default 0,
  fiber_g numeric default 0,
  water_ml int default 0,
  notes text,
  created_at timestamptz default now(),
  unique(user_id, logged_at)
);

-- Food logs (individual meals)
create table if not exists public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_at date not null,
  meal_type text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout', 'photo_ai')) default 'snack',
  meal_name text,
  calories int,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  items jsonb default '[]'::jsonb,
  confidence text,
  photo_url text,
  notes text,
  created_at timestamptz default now()
);

-- User exercise progress (for progression tracking)
create table if not exists public.exercise_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id text not null references public.exercises(id),
  current_weight_kg numeric,
  current_reps int,
  current_sets int,
  current_rir int,
  last_updated timestamptz default now(),
  unique(user_id, exercise_id)
);

-- Indexes for performance
create index if not exists idx_workout_sets_user_created on public.workout_sets(user_id, created_at desc);
create index if not exists idx_workout_sets_workout on public.workout_sets(workout_id);
create index if not exists idx_measurements_user_date on public.body_measurements(user_id, measured_at desc);
create index if not exists idx_recovery_user_date on public.recovery_logs(user_id, logged_at desc);
create index if not exists idx_nutrition_user_date on public.nutrition_logs(user_id, logged_at desc);
create index if not exists idx_food_logs_user_date on public.food_logs(user_id, logged_at desc);
create index if not exists idx_exercises_muscle on public.exercises(muscle_group);
create index if not exists idx_exercises_equipment on public.exercises(equipment);
create index if not exists idx_workouts_user_date on public.workouts(user_id, workout_date desc);
create index if not exists idx_exercise_progress_user on public.exercise_progress(user_id);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_sets enable row level security;
alter table public.body_measurements enable row level security;
alter table public.personal_records enable row level security;
alter table public.recovery_logs enable row level security;
alter table public.nutrition_logs enable row level security;
alter table public.food_logs enable row level security;
alter table public.exercise_progress enable row level security;

-- Policies
do $$ begin
  create policy profiles_self on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy exercises_read on public.exercises for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy workouts_self on public.workouts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy sets_self on public.workout_sets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy measurements_self on public.body_measurements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy prs_self on public.personal_records for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy recovery_self on public.recovery_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy nutrition_self on public.nutrition_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy food_logs_self on public.food_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy exercise_progress_self on public.exercise_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Trigger to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- Seed exercises with Turkish names and GIF URLs (using free GIF sources)
insert into public.exercises (id, name, name_tr, muscle_group, muscle_group_tr, equipment, pattern, gif_url, instructions_tr, tips_tr, sets, min_reps, max_reps, rest_seconds, is_compound, difficulty) values
-- Chest
('bench', 'Barbell Bench Press', 'Barbell Bench Press', 'Chest', 'Göğüs', 'barbell', 'push', 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2a/giphy.gif', 'Yatay benchte sırtınız düz, ayaklarınız yere basılı. Barbell''i göğüs seviyesine indirin ve yukarı itin.', 'Dirsekleri 45-75 derece açısında tutun. Omuzlarınızı yumağa sıkıştırın.', 3, 6, 10, 180, true, 3),
('incline', 'Incline Dumbbell Press', 'İncline Dumbbell Press', 'Chest', 'Üst Göğüs', 'dumbbell', 'push', 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2b/giphy.gif', '30-45 derece incline benchte dumbbell''leri omuz genişliğinde tutun, göğüs seviyesine indirin ve yukarı itin.', 'Üst göğüse odaklanmak için bench açısını 30 dereceye yakın tutun.', 3, 8, 12, 150, true, 3),
('fly', 'Cable Fly', 'Cable Fly', 'Chest', 'Göğüs', 'cable', 'isolation', 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2c/giphy.gif', 'Cable makinesinin önünde ayaklarınız omuz genişliğinde. Elleri yukarıdan aşağıya göğüs merkezinde birleştirin.', 'Dirsekleri hafifçe bükük tutun, sadece omuz eklemi hareket etsin.', 3, 10, 15, 90, false, 2),
('pushup', 'Push-up', 'Şınav', 'Chest', 'Göğüs', 'bodyweight', 'push', 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2d/giphy.gif', 'Eller omuz genişliğinde, vücut düz çizgide. Göğüs yere değene kadar indirin ve yukarı itin.', 'Core kaslarınızı sıkı tutun, beliniz çukurlama yapmasın.', 3, 8, 20, 90, true, 2),

-- Back
('latpulldown', 'Lat Pulldown', 'Lat Pulldown', 'Back', 'Sırt', 'machine', 'pull', 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2e/giphy.gif', 'Makineye oturun, barı geniş tutuşla çekin. Dirsekleri yanlarınıza çekerek barı çene seviyesine getirin.', 'Sırt kaslarınızı kullanın, biceps ile çekmeyin. Üst sırt sıkışması hissedin.', 3, 8, 12, 120, true, 2),
('row', 'Seated Cable Row', 'Seated Cable Row', 'Back', 'Sırt', 'cable', 'pull', 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2f/giphy.gif', 'Makineye oturun, ayaklar platformda. Kol kemiğini vücuda çekin, omuz bıçaklarınızı birleştirin.', 'Sırtınız düz, germe yapmayın. Sadece kol ve sırt kasları çalışsın.', 3, 8, 12, 120, true, 2),
('pullup', 'Pull-up', 'Barfiks', 'Back', 'Sırt', 'bodyweight', 'pull', 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2g/giphy.gif', 'Barı geniş tutuşla kavrayın. Çene barın üzerine çıkana kadar çekin, kontrollü indirin.', 'Zorluyorsa band yardımıyla yapın veya negatif tekrarlar uygulayın.', 3, 5, 12, 180, true, 4),
('drow', 'Dumbbell Row', 'Dumbbell Row', 'Back', 'Sırt', 'dumbbell', 'pull', 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2h/giphy.gif', 'Bir diz bench üzerinde, diğer ayak yerde. Dumbbell''i bel seviyesine çekin, dirsek vücudunuzun arkasına gitsin.', 'Sırtınız düz kalmalı, omuzunuz yukarı kalkmasın.', 3, 8, 12, 120, true, 3),

-- Shoulders
('ohp', 'Overhead Press', 'Overhead Press (Omuz Presi)', 'Shoulder', 'Omuz', 'barbell', 'push', 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2i/giphy.gif', 'Ayakta durun, barbell''i omuz seviyesinden başlayıp tam uzatana kadar yukarı itin.', 'Core sıkı, bel germeyin. Dirsekler hafif önde olsun.', 3, 5, 10, 180, true, 3),
('latraise', 'Lateral Raise', 'Yan Kaldırma', 'Shoulder', 'Yan Omuz', 'dumbbell', 'isolation', 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2j/giphy.gif', 'Ayakta, dumbbell''ler yanınızda. Elleri omuz seviyesine kadar yanlara kaldırın,controlled indirin.', 'Eller biraz önde, bilekler hafif içe dönük. Momentum kullanmayın.', 3, 10, 20, 90, false, 2),
('facerpull', 'Face Pull', 'Face Pull', 'Shoulder', 'Arka Omuz', 'cable', 'isolation', 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2k/giphy.gif', 'Cable rope ile yüz seviyesinden çekin. Dirsekler yukarı, omuz bıçakları birleşsin.', 'Arka omuz ve rotator cuff için harika. Hafif ağırlık, temiz tekerrür.', 3, 12, 20, 90, false, 2),

-- Legs
('squat', 'Barbell Squat', 'Barbell Squat', 'Legs', 'Bacak', 'barbell', 'squat', 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2l/giphy.gif', 'Barbell sırtınızın üstünde. Ayaklar omuz genişliğinde, burnu hafif dışarı. Paralel altına inip kalkın.', 'Dizleriniz ayak parmaklarınızı geçmesin. Bel düz, core sıkı.', 3, 5, 10, 240, true, 4),
('legpress', 'Leg Press', 'Leg Press', 'Legs', 'Bacak', 'machine', 'squat', 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2m/giphy.gif', 'Makineye oturun, ayaklar platformda omuz genişliğinde. Dizleri 90 dereceye indirin ve itin.', 'Alt sırt yumağından ayrılmasın. Dizleri tam kilitlemeyin.', 3, 8, 15, 150, true, 2),
('rdl', 'Romanian Deadlift', 'Romanian Deadlift', 'Hamstring', 'Arka Bacak', 'barbell', 'hinge', 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2n/giphy.gif', 'Ayaklar kalınlıkta, dizler hafif bükük. Kalça geriye giderken barbell bacaklarınızın üzerinde indirin.', 'Sırt düz, hamstring gerilimi hissedin. Bel germeyin.', 3, 6, 12, 150, true, 3),
('curlleg', 'Leg Curl', 'Leg Curl', 'Hamstring', 'Arka Bacak', 'machine', 'curl', 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2o/giphy.gif', 'Makineye yatın/oturun, ayak bilekleri pad altına. Topu kalçanıza çekin.', 'Kontrollü hareket, momentum yok. Hamstring izolasyonu.', 3, 10, 15, 90, false, 2),
('calf', 'Calf Raise', 'Dizdirme (Calf Raise)', 'Calf', 'Baldır', 'machine', 'calf', 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2p/giphy.gif', 'Ayak parmakları platform üzerinde, tallar boşta. Tallarınızı mümkün olduğunca indirin ve yukarı çıkın.', 'Altta 2 sn bekleyin, yukarıda sıkıştırın. Hızlı değil, kontrollü.', 4, 12, 20, 60, false, 1),
('hip', 'Hip Thrust', 'Hip Thrust', 'Glute', 'Kalça', 'barbell', 'hinge', 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2q/giphy.gif', 'Üst sırt bench üzerinde, barbell kalça üzerinde. Kalçayı yukarı itin, üstte sıkıştırın.', 'Dizler 90 derece, ayaklar dik. Sadece kalça çalışsın.', 3, 8, 12, 150, true, 3),
('bulgarian', 'Bulgarian Split Squat', 'Bulgarian Split Squat', 'Glute', 'Kalça/Bacak', 'dumbbell', 'squat', 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2r/giphy.gif', 'Bir ayak arkadaki benchte, öteki ayak önde. Ön bacak diz 90 dereceye indirin.', 'Denge zorluyorsa dumbbellsız başlayın. Ön bacakta hissessin.', 3, 8, 12, 120, true, 4),

-- Arms
('bcurl', 'Barbell Curl', 'Barbell Bicep Curl', 'Biceps', 'Biceps', 'barbell', 'curl', 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2s/giphy.gif', 'Ayakta, barbell ön kolunuzda. Dirsekler sabit, sadece ön kolları çekerek yukarı getirin.', 'Dirsekleriniz vücudunuzdan ayrılmasın. Sallama yapmayın.', 3, 8, 12, 90, false, 2),
('hcurl', 'Hammer Curl', 'Hammer Curl', 'Biceps', 'Biceps/Brachialis', 'dumbbell', 'curl', 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2t/giphy.gif', 'Ayakta, dumbbell''ler yanınızda, el içleri birbirine bakacak. Dirsekler sabit, yukarı çekin.', 'Brachialis için harika. Kol genişliği artırır.', 3, 10, 15, 90, false, 2),
('pushdown', 'Triceps Pushdown', 'Triceps Pushdown', 'Triceps', 'Triceps', 'cable', 'isolation', 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2u/giphy.gif', 'Cable makinesinde rope veya bar. Dirsekler yanınızda sabit, aşağı itin.', 'Sadece dirsek eklemi hareket etsin. Omuzlar hareketsiz.', 3, 10, 15, 90, false, 2),
('ohtri', 'Overhead Triceps Extension', 'Overhead Triceps Ext.', 'Triceps', 'Triceps', 'dumbbell', 'isolation', 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2v/giphy.gif', 'Dumbbell''i iki elle baş üstünde tutun. Dirsekleri bükerek arkaya indirin, uzatın.', 'Dirsekler başınızın yanında sabit kalmalı.', 3, 10, 15, 90, false, 2),

-- Core
('plank', 'Plank', 'Plank', 'Core', 'Karın', 'bodyweight', 'core', 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2w/giphy.gif', 'Ön kol üzerine yatın, vücut düz çizgide. Core sıkı tutun.', 'Bel çukurlamasın, kalça yukarı kalkmasın. Nefes kontrolü.', 3, 30, 60, 60, false, 2),
('hanging_knee_raise', 'Hanging Knee Raise', 'Asılı Kaldırma', 'Core', 'Alt Karın', 'bodyweight', 'core', 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG5qa2w5c3V2c2R2Z2R2c2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2Z2R2x/giphy.gif', 'Barfiksten asılı durun. Dizleri göğsünüze çekin, controlled indirin.', 'Sallanma yok. Alt karnı hissedin.', 3, 8, 15, 90, false, 3)
on conflict (id) do update set
  name = excluded.name,
  name_tr = excluded.name_tr,
  muscle_group = excluded.muscle_group,
  muscle_group_tr = excluded.muscle_group_tr,
  equipment = excluded.equipment,
  pattern = excluded.pattern,
  gif_url = excluded.gif_url,
  instructions_tr = excluded.instructions_tr,
  tips_tr = excluded.tips_tr,
  sets = excluded.sets,
  min_reps = excluded.min_reps,
  max_reps = excluded.max_reps,
  rest_seconds = excluded.rest_seconds,
  is_compound = excluded.is_compound,
  difficulty = excluded.difficulty;