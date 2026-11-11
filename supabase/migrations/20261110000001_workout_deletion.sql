drop policy if exists "Users can delete own workouts" on public.workouts;

create policy "Users can delete own workouts"
on public.workouts
for delete
to authenticated
using (auth.uid() = user_id);
