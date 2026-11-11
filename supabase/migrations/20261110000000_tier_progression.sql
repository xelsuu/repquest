alter table public.workouts
  add column if not exists exercise_name text,
  add column if not exists weight numeric,
  add column if not exists reps integer,
  add column if not exists is_pr boolean not null default false,
  add column if not exists xp_awarded integer not null default 5;

alter table public.workouts
  add constraint workouts_weight_nonnegative check (weight is null or weight >= 0),
  add constraint workouts_reps_positive check (reps is null or reps > 0),
  add constraint workouts_xp_valid check (xp_awarded in (5, 8));
