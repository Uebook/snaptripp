-- 1. Create blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  category text not null,
  read_time text not null,
  image_url text not null,
  status text not null default 'Published',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- If the table already exists, run this to add the column:
-- ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS status text not null default 'Published';

-- 2. Enable RLS
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- 3. Select policy (allow everyone to read blogs)
DROP POLICY IF EXISTS "Allow public read access to blogs" ON public.blogs;
CREATE POLICY "Allow public read access to blogs"
  ON public.blogs FOR SELECT
  USING (true);

-- 4. Write policy (allow authenticated users to manage blogs)
DROP POLICY IF EXISTS "Allow authenticated users to manage blogs" ON public.blogs;
CREATE POLICY "Allow authenticated users to manage blogs"
  ON public.blogs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Seed initial data
INSERT INTO public.blogs (title, slug, excerpt, content, category, read_time, image_url)
VALUES 
(
  'Hidden Gems in the Mediterranean',
  'hidden-gems-mediterranean',
  'Discover secret beaches, charming villages, and authentic local experiences away from tourist crowds.',
  '<p>The Mediterranean is home to some of the world''s most famous destinations, but beyond the crowded streets of Santorini and the bustling beaches of the Amalfi Coast lie hidden gems waiting to be discovered.</p><h2>1. Procida, Italy</h2><p>While neighboring Capri and Ischia get most of the attention, Procida remains a colorful, authentic escape. Its pastel-hued houses and quiet marinas offer a glimpse into traditional Italian island life.</p><h2>2. Kas, Turkey</h2><p>Nestled on Turkey''s turquoise coast, Kas is a bohemian paradise. It''s famous for its crystal-clear waters, ancient ruins, and a vibrant local market that comes alive every week.</p><h2>3. Mellieha, Malta</h2><p>Mellieha offers some of the best beaches in Malta, along with stunning views of the countryside. It''s the perfect spot for those looking to combine relaxation with historical exploration.</p>',
  'Destinations',
  '5 min read',
  'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=800&auto=format&fit=crop'
),
(
  'Budget Travel: Europe on $50/Day',
  'budget-travel-europe',
  'Learn how to explore Europe without breaking the bank with our expert money-saving tips and tricks.',
  '<p>Europe doesn''t have to be expensive. With a bit of planning and some insider knowledge, you can explore the continent''s most beautiful cities on a modest budget.</p><h2>Travel Off-Season</h2><p>Prices for accommodation and flights drop significantly outside of the peak summer months. Consider visiting in spring or autumn for a more affordable and less crowded experience.</p><h2>Use Public Transport</h2><p>Europe has some of the best public transport networks in the world. Instead of taxis or car rentals, use trains, buses, and metro systems to get around.</p><h2>Eat Like a Local</h2><p>Avoid restaurants in tourist hotspots. Instead, explore local markets and backstreet bistros where you can find delicious, authentic food at a fraction of the cost.</p>',
  'Travel Tips',
  '7 min read',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop'
),
(
  'Best Mountains to Visit in 2026',
  'best-mountains-2026',
  'From the Alps to the Himalayas, explore the most breathtaking mountain destinations for adventure seekers.',
  '<p>For adventure seekers and nature lovers, there''s nothing quite like the majesty of a mountain range. Here are our top picks for mountain destinations in 2026.</p><h2>1. The Dolomites, Italy</h2><p>Famous for their unique limestone peaks and stunning alpine meadows, the Dolomites offer incredible hiking in the summer and world-class skiing in the winter.</p><h2>2. Torres del Paine, Chile</h2><p>This Chilean national park is a dream for trekkers. Its granite towers, turquoise lakes, and vast glaciers provide a truly epic backdrop for any adventure.</p><h2>3. Banff National Park, Canada</h2><p>Banff is a year-round destination with something for everyone. From the iconic Lake Louise to the rugged peaks of the Rockies, it''s a place of unparalleled natural beauty.</p>',
  'Adventure',
  '6 min read',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop'
),
(
  'The Art of Solo Travel: A Guide',
  'solo-travel-guide',
  'Everything you need to know about traveling alone, from safety tips to meeting new people along the way.',
  '<p>Traveling alone can be one of the most rewarding experiences of your life. It offers complete freedom, the chance to meet new people, and an opportunity for deep self-discovery.</p><h2>Start Small</h2><p>If you''re nervous about your first solo trip, start with a weekend getaway to a nearby city. This will help you build confidence before embarking on a longer journey.</p><h2>Stay in Hostels</h2><p>Hostels are great for solo travelers as they provide a social environment where it''s easy to meet other people. Many offer private rooms if you''re not ready for a dorm.</p><h2>Trust Your Instincts</h2><p>Safety is paramount when traveling alone. Trust your gut and be aware of your surroundings at all times.</p>',
  'Guide',
  '8 min read',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop'
),
(
  'Top 10 Street Foods in Southeast Asia',
  'southeast-asia-street-food',
  'A culinary journey through the vibrant markets and street stalls of Bangkok, Hanoi, and beyond.',
  '<p>Southeast Asia is a food lover''s paradise, and some of the best meals you''ll ever have will be from a street stall.</p><h2>1. Pad Thai, Thailand</h2><p>A classic for a reason. This stir-fried noodle dish is a perfect balance of sweet, sour, and savory flavors.</p><h2>2. Pho, Vietnam</h2><p>This fragrant noodle soup is a staple of Vietnamese cuisine. It''s often served with fresh herbs, lime, and chili for an extra kick.</p><h2>3. Nasi Goreng, Indonesia</h2><p>Indonesian fried rice is typically served with a fried egg on top and a side of prawn crackers. It''s simple, filling, and delicious.</p>',
  'Food',
  '10 min read',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop'
),
(
  'Sustainable Travel: Why it Matters',
  'sustainable-travel-importance',
  'How to reduce your carbon footprint and support local communities during your next vacation.',
  '<p>As the world becomes more aware of the impact of travel on the environment, sustainable travel is more important than ever.</p><h2>Support Local Communities</h2><p>Choose locally-owned accommodation, eat at independent restaurants, and hire local guides. This ensures that your money stays within the community you''re visiting.</p><h2>Reduce Your Carbon Footprint</h2><p>Consider alternatives to flying when possible, such as trains or buses. When you do fly, consider carbon offsetting your journey.</p><h2>Respect Nature</h2><p>Stay on marked trails, dispose of waste properly, and avoid activities that exploit animals.</p>',
  'Nature',
  '6 min read',
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop'
)
ON CONFLICT (slug) DO NOTHING;

-- 6. Force schema reload
NOTIFY pgrst, 'reload schema';
