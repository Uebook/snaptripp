-- Ensure username is present and unique
-- For existing users without a username, we generate one from full_name or id
update public.profiles
set username = lower(regexp_replace(coalesce(full_name, 'traveler'), '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(id::text, 1, 4)
where username is null;

-- Update RLS for profiles: Everyone can see basic info if public_profile is true
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( (preferences->>'public_profile')::boolean = true or auth.uid() = id );

-- Update RLS for trips: Everyone can see trips if the profile is public
create policy "Public trips are viewable by everyone if profile is public."
  on public.trips for select
  using ( 
    exists (
      select 1 from public.profiles 
      where profiles.id = trips.user_id 
      and (profiles.preferences->>'public_profile')::boolean = true
    )
    or auth.uid() = user_id
  );

-- Update RLS for traveler_reviews (used for stats)
create policy "Public reviews are viewable by everyone if profile is public."
  on public.traveler_reviews for select
  using ( 
    exists (
      select 1 from public.profiles 
      where profiles.id = traveler_reviews.user_id 
      and (profiles.preferences->>'public_profile')::boolean = true
    )
    or auth.uid() = user_id
  );
