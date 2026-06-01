-- Create published_places table matching places schema exactly

CREATE TABLE IF NOT EXISTS published_places (
  id bigint PRIMARY KEY,
  "country" text NOT NULL,
  "city" text,
  "website" text,
  "title" text,
  "subTitle" text,
  "reviewsCount" bigint,
  "totalScore" double precision,
  "postalCode" text,
  "phone" text,
  "description" text,
  "categoryName" text,
  "address" text,
  "image_url" text,
  
  -- Location
  "location_lat" double precision,
  "location_lng" double precision,

  -- Opening Hours (0-6)
  "openingHours_0_day" text, "openingHours_0_hours" text,
  "openingHours_1_day" text, "openingHours_1_hours" text,
  "openingHours_2_day" text, "openingHours_2_hours" text,
  "openingHours_3_day" text, "openingHours_3_hours" text,
  "openingHours_4_day" text, "openingHours_4_hours" text,
  "openingHours_5_day" text, "openingHours_5_hours" text,
  "openingHours_6_day" text, "openingHours_6_hours" text,

  -- Accessibility (ai_Acc)
  "ai_Acc_0_entrance" boolean, "ai_Acc_1_entrance" boolean, "ai_Acc_2_entrance" boolean, "ai_Acc_3_entrance" boolean, "ai_Acc_4_entrance" boolean,
  "ai_Acc_0_parking" boolean, "ai_Acc_1_parking" boolean, "ai_Acc_2_parking" boolean, "ai_Acc_3_parking" boolean, "ai_Acc_4_parking" boolean,
  "ai_Acc_0_restroom" boolean, "ai_Acc_1_restroom" boolean, "ai_Acc_2_restroom" boolean, "ai_Acc_3_restroom" boolean, "ai_Acc_4_restroom" boolean,

  -- Children (ai_Chld)
  "ai_Chld_0_kids" boolean, "ai_Chld_1_kids" boolean, "ai_Chld_2_kids" boolean, "ai_Chld_3_kids" boolean,

  -- Crowd (ai_Crwd)
  "ai_Crwd_0_lgbtq" boolean, "ai_Crwd_1_lgbtq" boolean, "ai_Crwd_2_lgbtq" boolean, "ai_Crwd_3_lgbtq" boolean,

  -- Pets (ai_Pets)
  "ai_Pets_0_dogs" boolean, "ai_Pets_1_dogs" boolean, "ai_Pets_2_dogs" boolean,

  -- Planning (ai_Plan)
  "ai_Plan_0_tickets" boolean, "ai_Plan_1_tickets" boolean, "ai_Plan_2_tickets" boolean, "ai_Plan_3_tickets" boolean,

  "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

  UNIQUE("title", "address")
);

CREATE INDEX IF NOT EXISTS idx_published_places_country ON published_places("country");
CREATE INDEX IF NOT EXISTS idx_published_places_city ON published_places("city");

NOTIFY pgrst, 'reload schema';
