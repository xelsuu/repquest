with ordered_workouts as (
  select
    id,
    row_number() over (
      partition by user_id, lower(trim(exercise_name))
      order by created_at asc, id asc
    ) as workout_number,
    lag(weight) over (
      partition by user_id, lower(trim(exercise_name))
      order by created_at asc, id asc
    ) as previous_weight,
    lag(reps) over (
      partition by user_id, lower(trim(exercise_name))
      order by created_at asc, id asc
    ) as previous_reps,
    weight,
    reps
  from public.workouts
  where exercise_name is not null
)
update public.workouts as workouts
set
  is_pr = ordered_workouts.workout_number = 1
    or ordered_workouts.weight > ordered_workouts.previous_weight
    or (
      ordered_workouts.weight = ordered_workouts.previous_weight
      and ordered_workouts.reps > ordered_workouts.previous_reps
    ),
  xp_awarded = case
    when ordered_workouts.workout_number = 1
      or ordered_workouts.weight > ordered_workouts.previous_weight
      or (
        ordered_workouts.weight = ordered_workouts.previous_weight
        and ordered_workouts.reps > ordered_workouts.previous_reps
      )
    then 8
    else 5
  end
from ordered_workouts
where workouts.id = ordered_workouts.id;
