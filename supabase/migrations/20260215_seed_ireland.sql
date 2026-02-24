INSERT INTO destinations (name, type, overview, bucket_list, local_foods, local_phrases, transportation_info, cover_image_url)
VALUES (
  'Ireland',
  'country',
  'Ireland is a land of myth and legend, known for its lush green landscapes, rugged coastlines, and warm hospitality. From the bustling streets of Dublin to the serene beauty of the Wild Atlantic Way, it offers a rich blend of history, culture, and nature.',
  '[
    {"text": "Visit the Cliffs of Moher", "image_url": "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7"},
    {"text": "Kiss the Blarney Stone", "image_url": null},
    {"text": "Drive the Ring of Kerry", "image_url": null}
  ]'::jsonb,
  '[
    {"name": "Irish Stew", "description": "A hearty stew made with lamb, potatoes, carrots, and onions.", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Irish_stew_2009.jpg/800px-Irish_stew_2009.jpg"},
    {"name": "Soda Bread", "description": "A dense, unleavened bread made with baking soda.", "image_url": null}
  ]'::jsonb,
  '[
    {"phrase": "Dia dhuit", "translation": "Hello", "pronunciation": "dee-a gwitch"},
    {"phrase": "Sláinte", "translation": "Cheers", "pronunciation": "slawn-cha"}
  ]'::jsonb,
  'Public transport (buses and trains) connects major cities. For rural areas, renting a car is highly recommended to explore at your own pace.',
  'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7'
)
ON CONFLICT (name, type) DO UPDATE SET
  overview = EXCLUDED.overview,
  bucket_list = EXCLUDED.bucket_list,
  local_foods = EXCLUDED.local_foods,
  local_phrases = EXCLUDED.local_phrases,
  transportation_info = EXCLUDED.transportation_info,
  cover_image_url = EXCLUDED.cover_image_url;
