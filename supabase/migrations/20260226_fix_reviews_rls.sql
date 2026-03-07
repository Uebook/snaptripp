
-- Allow public read access to traveler_reviews for Chart Map stats
create policy "Allow public read access to traveler_reviews"
  on traveler_reviews for select
  using ( true );

-- Ensure authenticated users can still insert
-- (The original creation script might have missed this or it's restricted)
create policy "Users can insert their own reviews"
  on traveler_reviews for insert
  with check ( auth.uid() = user_id );

-- Force schema reload
NOTIFY pgrst, 'reload schema';
