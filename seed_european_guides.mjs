import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const COUNTRIES = [
  {
    id: 'greece',
    name: 'Greece',
    desc: 'An ancient sanctuary of turquoise waters, whitewashed villages, and monumental history.',
    tag: 'Culture',
    hero_img: '/images/hero_greece_oia.webp',
    is_featured: true,
    capital: 'Athens',
    currency: 'Euro (€)',
    language: 'Greek',
    time_zone: 'GMT+2',
    best_time: 'May - Oct',
    emergency_police: '100',
    emergency_ambulance: '166',
    emergency_embassy: 'Contact local embassy in Athens.',
    experience_title: 'Santorini Sunset Sailing',
    experience_desc: 'Sail around the volcanic caldera of Santorini at golden hour.',
    experience_img: '/images/hero_greece_oia.webp',
    sections_data: {
      flagEmoji: '🇬🇷',
      heroSubtitle: 'Land of Gods & Turquoise Seas',
      averageTemp: '14°C - 29°C',
      visaInfo: 'Schengen Area entry rules apply.',
      countryIntro: 'Greece is home to thousands of islands throughout the Aegean and Ionian seas, influential in ancient times, often called the cradle of Western civilization.',
      overviewImg: '/images/hero_greece_oia.webp',
      bestTimePeak: { months: 'July - August', temp: '26°C - 35°C', daylight: '14 - 15 hours', ideal: 'Island partying, beach relaxation, watersports' },
      bestTimeShoulder: { months: 'May - June / Sept - Oct', temp: '18°C - 25°C', daylight: '12 - 14 hours', ideal: 'Sightseeing, lower prices, warm seas' },
      bestTimeOffPeak: { months: 'November - April', temp: '8°C - 15°C', daylight: '9 - 10 hours', ideal: 'Historic ruins without crowds, city trips' },
      holidaysSpring: 'Orthodox Good Friday & Easter',
      holidaysSummer: 'Dormition of the Virgin (Aug 15)',
      holidaysAutumn: 'Ochi Day (Oct 28)',
      holidaysWinter: 'Christmas Day (Dec 25)',
      visaFreeRegions: ['EU/EEA Citizens', 'USA', 'Canada', 'Australia', 'UK'],
      visaFreeConditions: ['Valid passport for 3 months beyond stay', 'Maximum 90 days stay'],
      visaRequiredWho: ['Citizens of non-Schengen visa-required countries'],
      visaRequiredHow: ['Apply for Schengen visa with flight/hotel bookings at Greek consulate.'],
      customsTobacco: '200 Cigarettes',
      customsAlcohol: '1L Spirits',
      customsGifts: 'Up to €430 value',
      customsCash: 'Declare over €10,000',
      vaccinesTitle: 'Routine Vaccinations',
      vaccinesDesc: 'Ensure standard vaccinations are up to date.',
      insuranceTitle: 'Travel Medical Insurance',
      insuranceDesc: 'Highly recommended for non-EU travelers.',
      safetyImg: '/images/coastal_beach.webp',
      healthTipsTitle: 'Safe Tap Water',
      healthTipsDesc: 'Tap water is safe in Athens/major cities, buy bottled on islands.',
      safetyAssistanceTitle: 'Tourist Police',
      safetyAssistanceDesc: 'Call 171 for English-speaking tourist police.',
      soloFemaleTitle: 'Safe & Welcoming',
      soloFemaleDesc: 'Very safe for solo travelers with standard precautions.',
      soloFemaleTags: ['SAFE', 'WELCOMING', 'HOSPITABLE'],
      cultureImg: '/images/hero_greece_oia.webp',
      cultureExperienceTitle: 'Historic Acropolis Tour',
      cultureExperienceDesc: 'Explore the parthenon and ancient ruins of Athens.',
      cultureHighlight1Title: 'Slow Dining Culture',
      cultureHighlight1Desc: 'Dinner starts late (9-10 PM) and is enjoyed for hours.',
      cultureHighlight2Title: 'Philoxenia',
      cultureHighlight2Desc: 'The Greek concept of hospitality towards strangers.',
      conductGuide: [
        { label: 'Church Attire', desc: 'Cover shoulders and knees in monasteries.' },
        { label: 'Tipping', desc: 'Not mandatory; 5-10% is appreciated for good service.' }
      ],
      usefulPhrases: [
        { phrase: 'Kalimera', translation: 'Good morning' },
        { phrase: 'Efharisto', translation: 'Thank you' }
      ],
      logisticsImg: '/images/coastal_beach.webp',
      logisticsCurrencyDesc: 'Euro. Credit cards widely accepted.',
      drivingRules: 'Right side',
      drivingRulesTags: ['Drive on the right', 'International Driving Permit required'],
      transportTags: ['Ferries for islands', 'KTEL regional buses', 'Athens Metro'],
      plugType: 'Type C / F',
      voltage: '230V / 50Hz',
      essentialApps: ['Google Maps', 'Ferryhopper', 'Beat (Taxis)'],
      experiencesImg: '/images/hero_greece_oia.webp',
      mustTryFoods: ['Moussaka', 'Greek Salad', 'Souvlaki', 'Gyros'],
      alcoholLaws: 'Minimum age is 18. No open containers in specific public areas.',
      localRules: [
        { emoji: '🚭', title: 'SMOKING BAN', desc: 'Banned in indoor public spaces.' }
      ],
      videoTitle: 'Greece: 10 Days Itinerary',
      videoUrl: 'https://youtube.com',
      videoThumbnail: '/images/hero_greece_oia.webp',
      videoDesc: 'Visual guide to Athens, Mykonos, and Santorini.',
      bucketList: [
        { title: 'Acropolis of Athens', desc: 'Explore the iconic ancient citadel and historical Parthenon.', tag: 'HERITAGE', type: 'heritage', img: '/images/hero_city.webp' },
        { title: 'Caldera Sailing', desc: 'Cruise around the gorgeous volcanic caldera of Santorini.', tag: 'COAST', type: 'coast', img: '/images/hero_greece_oia.webp' },
        { title: 'Meteora Monasteries', desc: 'Visit historic monasteries built atop towering sandstone pillars.', tag: 'LANDMARK', type: 'landmark', img: '/images/why_mountains.webp' },
        { title: 'Mykonos Windmills', desc: 'Stroll around windmills overlooking the blue Aegean sea.', tag: 'CULTURE', type: 'culture', img: '/images/coastal_beach.webp' },
        { title: 'Samaria Gorge Hike', desc: 'Hike through one of Europe\'s longest canyons in Crete.', tag: 'NATURE', type: 'nature', img: '/images/why_mountains.webp' }
      ],
      uniqueAccommodations: [
        { title: 'Santorini Cave Houses', desc: 'Stay in traditional whitewashed cave suites carved into volcanic cliffs.', img: '/images/hero_greece_oia.webp' },
        { title: 'Cycladic Windmills', desc: 'Rent a converted historic windmill with 360-degree ocean views.', img: '/images/coastal_beach.webp' },
        { title: 'Eco-Stone Villas', desc: 'Experience rustic mountain living in hand-crafted stone villas.', img: '/images/why_mountains.webp' },
        { title: 'Valis Luxury Resort', desc: 'Premium suites overlooking the gorgeous Pagasetic Gulf.', img: '/images/coastal_beach.webp' }
      ],
      entryImg: '/images/hero_greece_oia.webp'
    },
    cities: [
      { name: 'Athens', desc: 'Historic capital with ancient temples, bustling plakas, and world-class museums.', img_url: '/images/hero_city.webp' },
      { name: 'Santorini', desc: 'Iconic volcanic island famous for whitewashed houses and stunning sunsets.', img_url: '/images/hero_greece_oia.webp' },
      { name: 'Mykonos', desc: 'Vibrant island known for gorgeous beaches and lively summer nightlife.', img_url: '/images/coastal_beach.webp' }
    ]
  },
  {
    id: 'ireland',
    name: 'Ireland',
    desc: 'A rich landscape of rugged coastlines, historic stone castles, and welcoming cultural pubs.',
    tag: 'Adventure',
    hero_img: '/images/how_london.webp',
    is_featured: true,
    capital: 'Dublin',
    currency: 'Euro (€)',
    language: 'English, Irish',
    time_zone: 'GMT',
    best_time: 'Jun - Aug',
    emergency_police: '112',
    emergency_ambulance: '112',
    emergency_embassy: 'Contact local embassy in Dublin.',
    experience_title: 'Wild Atlantic Way Tour',
    experience_desc: 'Drive along one of the longest defined coastal routes in the world.',
    experience_img: '/images/how_london.webp',
    sections_data: {
      flagEmoji: '🇮🇪',
      heroSubtitle: 'The Emerald Isle',
      averageTemp: '8°C - 19°C',
      visaInfo: 'Separate Irish visa rules apply (Not part of Schengen).',
      countryIntro: 'Ireland is an island in the North Atlantic, known for its lush green hills, dramatic ocean cliffs, and cozy heritage pub culture.',
      overviewImg: '/images/how_london.webp',
      bestTimePeak: { months: 'June - August', temp: '15°C - 20°C', daylight: '15 - 17 hours', ideal: 'Sightseeing, outdoor hiking, festivals' },
      bestTimeShoulder: { months: 'April - May / Sept - Oct', temp: '10°C - 15°C', daylight: '11 - 13 hours', ideal: 'Road trips, lower crowd levels, photography' },
      bestTimeOffPeak: { months: 'November - March', temp: '4°C - 9°C', daylight: '8 - 9 hours', ideal: 'Cosy pubs, museum visits, winter walks' },
      holidaysSpring: 'St. Patrick\'s Day (March 17), Easter Monday',
      holidaysSummer: 'June/August Bank Holidays',
      holidaysAutumn: 'October Bank Holiday',
      holidaysWinter: 'Christmas Day (Dec 25), St. Stephen\'s Day (Dec 26)',
      visaFreeRegions: ['EU/EEA Citizens', 'UK (CTA)', 'USA', 'Canada', 'Australia'],
      visaFreeConditions: ['Valid passport', 'Maximum 90 days stay for tourists'],
      visaRequiredWho: ['Citizens requiring a short-stay C visa.'],
      visaRequiredHow: ['Apply online at Irish Immigration Service website.'],
      customsTobacco: '200 Cigarettes',
      customsAlcohol: '1L Spirits or 4L Wine',
      customsGifts: 'Up to €430 value',
      customsCash: 'Declare over €10,000',
      vaccinesTitle: 'Routine Vaccinations',
      vaccinesDesc: 'Ensure MMR, DPT are up to date.',
      insuranceTitle: 'Travel Medical Insurance',
      insuranceDesc: 'Highly recommended for medical evacuation.',
      safetyImg: '/images/why_mountains.webp',
      healthTipsTitle: 'Clean Tap Water',
      healthTipsDesc: 'Tap water is completely safe across the entire country.',
      safetyAssistanceTitle: 'Garda Síochána',
      safetyAssistanceDesc: 'Call 999 or 112 for the local police service.',
      soloFemaleTitle: 'Extremely Safe',
      soloFemaleDesc: 'Highly safe country for solo female travelers.',
      soloFemaleTags: ['SAFE', 'FRIENDLY', 'COMMUNITY'],
      cultureImg: '/images/how_london.webp',
      cultureExperienceTitle: 'Traditional Pub Music Session',
      cultureExperienceDesc: 'Enjoy live Irish traditional music over a pint of stout.',
      cultureHighlight1Title: 'Cead Mile Failte',
      cultureHighlight1Desc: 'Translates to "a hundred thousand welcomes".',
      cultureHighlight2Title: 'Pub Socialising',
      cultureHighlight2Desc: 'Pubs are local community hubs for all generations.',
      conductGuide: [
        { label: 'Buying Rounds', desc: 'In a group, it is standard to buy a round of drinks for the group.' },
        { label: 'Tipping', desc: '10% in restaurants is standard for good service.' }
      ],
      usefulPhrases: [
        { phrase: 'Slainte', translation: 'Cheers' },
        { phrase: 'Go raibh maith agat', translation: 'Thank you' }
      ],
      logisticsImg: '/images/why_mountains.webp',
      logisticsCurrencyDesc: 'Euro (€) in Republic, Pound (£) in Northern Ireland.',
      drivingRules: 'Left side',
      drivingRulesTags: ['Drive on the left', 'Narrow rural roads'],
      transportTags: ['Irish Rail (Iarnrod Eireann)', 'Local Bus Éireann', 'Car rentals'],
      plugType: 'Type G',
      voltage: '230V / 50Hz',
      essentialApps: ['Google Maps', 'TFI Live (Public Transit)', 'FreeNow (Taxis)'],
      experiencesImg: '/images/how_london.webp',
      mustTryFoods: ['Irish Stew', 'Soda Bread', 'Guinness', 'Colcannon'],
      alcoholLaws: 'Minimum age is 18. Off-license sales end at 10 PM.',
      localRules: [
        { emoji: '🚭', title: 'SMOKING BAN', desc: 'Banned in all indoor public spaces.' }
      ],
      videoTitle: 'Exploring the Wild Atlantic Way',
      videoUrl: 'https://youtube.com',
      videoThumbnail: '/images/why_mountains.webp',
      videoDesc: 'Scenic tour of Cliffs of Moher and Ring of Kerry.',
      bucketList: [
        { title: 'Cliffs of Moher', desc: 'Stand on the edge of the soaring sea cliffs overlooking the Atlantic.', tag: 'COAST', type: 'coast', img: '/images/why_mountains.webp' },
        { title: 'Trinity College Library', desc: 'Walk through the breathtaking Long Room library in Dublin.', tag: 'HERITAGE', type: 'heritage', img: '/images/how_london.webp' },
        { title: 'Killarney Lakes', desc: 'Take a boat trip across the historic scenic lakes of Kerry.', tag: 'NATURE', type: 'nature', img: '/images/why_mountains.webp' },
        { title: 'Rock of Cashel', desc: 'Explore a spectacular group of medieval buildings set on limestone.', tag: 'LANDMARK', type: 'landmark', img: '/images/how_london.webp' }
      ],
      uniqueAccommodations: [
        { title: 'Irish Castle Estates', desc: 'Stay in authentic, grand medieval castles set on lush green parks.', img: '/images/how_london.webp' },
        { title: 'Coastal Lightkeeper Cottages', desc: 'Sleep in refurbished lighthouse keeper cottages on wild cliffs.', img: '/images/coastal_beach.webp' },
        { title: 'Thatched Roof Cottages', desc: 'Cozy, traditional white-walled cottages with authentic fireplaces.', img: '/images/why_mountains.webp' }
      ],
      entryImg: '/images/how_london.webp'
    },
    cities: [
      { name: 'Dublin', desc: 'Vibrant capital with historic libraries, pubs, and Guinness Storehouse.', img_url: '/images/how_london.webp' },
      { name: 'Galway', desc: 'Artistic bohemian city on the west coast, known for live music.', img_url: '/images/coastal_beach.webp' },
      { name: 'Killarney', desc: 'Gateway to Ring of Kerry and Killarney National Park lakes.', img_url: '/images/why_mountains.webp' }
    ]
  },
  {
    id: 'italy',
    name: 'Italy',
    desc: 'The ultimate guide to the rolling hills, hidden vineyards, and the slow life of the Italian countryside.',
    tag: 'Editorial',
    hero_img: '/images/guide_italy.webp',
    is_featured: true,
    capital: 'Rome',
    currency: 'Euro (€)',
    language: 'Italian',
    time_zone: 'GMT+1',
    best_time: 'Apr - Jun',
    emergency_police: '113',
    emergency_ambulance: '118',
    emergency_embassy: 'Contact local embassy in Rome.',
    experience_title: 'Tuscan Wine Tasting',
    experience_desc: 'Indulge in authentic winemaking tours and tasting inside historic cellars.',
    experience_img: '/images/guide_italy.webp',
    sections_data: {
      flagEmoji: '🇮🇹',
      heroSubtitle: 'La Dolce Vita',
      averageTemp: '12°C - 26°C',
      visaInfo: 'Schengen Area rules apply.',
      countryIntro: 'Italy is a Mediterranean country in Southern Europe. It is home to many UNESCO World Heritage Sites, historic Roman relics, and incredible cuisine.',
      overviewImg: '/images/guide_italy.webp',
      bestTimePeak: { months: 'July - August', temp: '24°C - 32°C', daylight: '14 - 15 hours', ideal: 'Coastal beaches, summer holidays, festivals' },
      bestTimeShoulder: { months: 'April - June / Sept - Oct', temp: '15°C - 22°C', daylight: '11 - 13 hours', ideal: 'City sightseeing, wine tasting, photography' },
      bestTimeOffPeak: { months: 'November - February', temp: '5°C - 12°C', daylight: '9 - 10 hours', ideal: 'Skiing in Alps, empty museums, indoor dining' },
      holidaysSpring: 'Easter Monday, Liberation Day (Apr 25)',
      holidaysSummer: 'Ferragosto (Aug 15)',
      holidaysAutumn: 'All Saints Day (Nov 1)',
      holidaysWinter: 'Christmas Day (Dec 25), St. Stephen\'s Day (Dec 26)',
      visaFreeRegions: ['EU/EEA Citizens', 'USA', 'Canada', 'Australia', 'UK'],
      visaFreeConditions: ['Passport valid for 3 months beyond stay', 'Stay up to 90 days'],
      visaRequiredWho: ['Citizens of non-exempt countries.'],
      visaRequiredHow: ['Apply for Schengen visa through local Italian consulate.'],
      customsTobacco: '200 Cigarettes',
      customsAlcohol: '1L Spirits or 4L Wine',
      customsGifts: 'Up to €430 value',
      customsCash: 'Declare over €10,000',
      vaccinesTitle: 'Routine Vaccinations',
      vaccinesDesc: 'Ensure MMR, DPT are up to date.',
      insuranceTitle: 'Travel Medical Insurance',
      insuranceDesc: 'Highly recommended for emergency medical coverage.',
      safetyImg: '/images/guide_italy.webp',
      healthTipsTitle: 'Safe Tap Water',
      healthTipsDesc: 'Tap water (Nasoni fountains) is safe and cold in Rome and major cities.',
      safetyAssistanceTitle: 'Carabinieri',
      safetyAssistanceDesc: 'Call 112 for the national gendarmerie force.',
      soloFemaleTitle: 'Safe & Pleasant',
      soloFemaleDesc: 'Generally very safe; apply standard vigilance in crowded train stations.',
      soloFemaleTags: ['SAFE', 'HOSPITABLE', 'WELL-LIT'],
      cultureImg: '/images/guide_italy.webp',
      cultureExperienceTitle: 'Uffizi Gallery Tour',
      cultureExperienceDesc: 'Explore masterpieces of the Renaissance in Florence.',
      cultureHighlight1Title: 'Slow Food Dining',
      cultureHighlight1Desc: 'Meals are seen as an art form to be enjoyed slowly.',
      cultureHighlight2Title: 'Historic Heritage',
      cultureHighlight2Desc: 'Cradle of Roman Empire and Renaissance art.',
      conductGuide: [
        { label: 'Church Dress Code', desc: 'Cover shoulders and knees inside churches.' },
        { label: 'Tipping', desc: 'Not standard; "servizio" or "coperto" is often on the bill.' }
      ],
      usefulPhrases: [
        { phrase: 'Grazie', translation: 'Thank you' },
        { phrase: 'Per favore', translation: 'Please' }
      ],
      logisticsImg: '/images/guide_italy.webp',
      logisticsCurrencyDesc: 'Euro. Credit cards widely accepted.',
      drivingRules: 'Right side',
      drivingRulesTags: ['Drive on the right', 'Avoid ZTL restricted zones in city centres'],
      transportTags: ['Trenitalia and Italo rail', 'Local Metros', 'Sita buses'],
      plugType: 'Type C / L / F',
      voltage: '230V / 50Hz',
      essentialApps: ['Google Maps', 'Trenitalia', 'TheFork (Reservations)'],
      experiencesImg: '/images/guide_italy.webp',
      mustTryFoods: ['Pizza Napoletana', 'Gelato', 'Cacio e Pepe', 'Tiramisu'],
      alcoholLaws: 'Legal age is 18. Public drinking in glass is banned at night in some cities.',
      localRules: [
        { emoji: '🚭', title: 'SMOKING BAN', desc: 'Banned in indoor public spaces.' }
      ],
      videoTitle: 'Best of Italy Itinerary Guide',
      videoUrl: 'https://youtube.com',
      videoThumbnail: '/images/guide_italy.webp',
      videoDesc: 'Tour covering Rome, Florence, Venice, and Amalfi Coast.',
      bucketList: [
        { title: 'Colosseum Expedition', desc: 'Walk the historic arena floor where gladiators fought.', tag: 'HERITAGE', type: 'heritage', img: '/images/guide_italy.webp' },
        { title: 'Amalfi Drive', desc: 'Navigate the narrow cliffside roads overlooking turquoise seas.', tag: 'COAST', type: 'coast', img: '/images/how_positano.webp' },
        { title: 'Venetian Gondola', desc: 'Glide down the historic canals of Venice under ancient bridges.', tag: 'CULTURE', type: 'culture', img: '/images/coastal_beach.webp' },
        { title: 'Tuscan Wine Roads', desc: 'Tour rolling vineyards and medieval hill towns of Chianti.', tag: 'LANDMARK', type: 'landmark', img: '/images/guide_italy.webp' }
      ],
      uniqueAccommodations: [
        { title: 'Historic Tuscan Villas', desc: 'Elegant country estates surrounded by olive groves and vineyards.', img: '/images/guide_italy.webp' },
        { title: 'Cave Hotels of Matera', desc: 'Luxurious modern rooms carved into ancient limestone caverns.', img: '/images/why_mountains.webp' },
        { title: 'Positano Cliff Resorts', desc: 'Spectacular suites hanging over the colorful houses of Positano.', img: '/images/how_positano.webp' }
      ],
      entryImg: '/images/guide_italy.webp'
    },
    cities: [
      { name: 'Rome', desc: 'Ancient capital of historic ruins, Vatican Art, and Colosseum vistas.', img_url: '/images/guide_italy.webp' },
      { name: 'Florence', desc: 'Cradle of Renaissance, home to Uffizi Gallery and David statue.', img_url: '/images/how_london.webp' },
      { name: 'Venice', desc: 'Stunning city built on 118 islands, linked by canals and bridges.', img_url: '/images/coastal_beach.webp' }
    ]
  },
  {
    id: 'spain',
    name: 'Spain',
    desc: 'A vibrant Mediterranean destination of culture, history, tapas, and sun.',
    tag: 'Culture',
    hero_img: '/images/card_madrid.webp',
    is_featured: true,
    capital: 'Madrid',
    currency: 'Euro (€)',
    language: 'Spanish',
    time_zone: 'GMT+1',
    best_time: 'May - Sept',
    emergency_police: '112',
    emergency_ambulance: '112',
    emergency_embassy: 'Contact local embassy in Madrid.',
    experience_title: 'Flamenco Dancing Show',
    experience_desc: 'Enjoy traditional live music and expressive flamenco in Seville.',
    experience_img: '/images/card_madrid.webp',
    sections_data: {
      flagEmoji: '🇪🇸',
      heroSubtitle: 'Land of Passion & Sun',
      averageTemp: '14°C - 28°C',
      visaInfo: 'Schengen Area tourist rules apply.',
      countryIntro: 'Spain is a diverse country in Southwestern Europe, known for its historic Moorish relics, sunny beaches, and social tapas culture.',
      overviewImg: '/images/card_madrid.webp',
      bestTimePeak: { months: 'June - August', temp: '22°C - 32°C', daylight: '14 - 16 hours', ideal: 'Beaches, nightlife, outdoor festivals' },
      bestTimeShoulder: { months: 'April - May / Oct', temp: '15°C - 22°C', daylight: '11 - 13 hours', ideal: 'City sightseeing, hiking, road trips' },
      bestTimeOffPeak: { months: 'November - February', temp: '8°C - 15°C', daylight: '9 - 10 hours', ideal: 'Empty museums, winter sports in Sierra Nevada' },
      holidaysSpring: 'Semana Santa (Holy Week), Labour Day (May 1)',
      holidaysSummer: 'Assumption of Mary (Aug 15)',
      holidaysAutumn: 'Hispanic Day (Oct 12), All Saints Day (Nov 1)',
      holidaysWinter: 'Constitution Day (Dec 6), Christmas Day (Dec 25)',
      visaFreeRegions: ['EU/EEA Citizens', 'USA', 'Canada', 'Australia', 'UK'],
      visaFreeConditions: ['Passport valid for 3 months beyond stay', 'Stay up to 90 days'],
      visaRequiredWho: ['Citizens of countries without Schengen exemption.'],
      visaRequiredHow: ['Apply at Spanish consulate with flight and accommodation proof.'],
      customsTobacco: '200 Cigarettes',
      customsAlcohol: '1L Spirits',
      customsGifts: 'Up to €430 value',
      customsCash: 'Declare over €10,000',
      vaccinesTitle: 'Routine Vaccinations',
      vaccinesDesc: 'Ensure standard vaccinations are current.',
      insuranceTitle: 'Travel Medical Insurance',
      insuranceDesc: 'Highly recommended for medical protection.',
      safetyImg: '/images/card_barcelona.webp',
      healthTipsTitle: 'Safe Tap Water',
      healthTipsDesc: 'Tap water is safe in major cities, drink bottled in rural regions.',
      safetyAssistanceTitle: 'National Police',
      safetyAssistanceDesc: 'Call 091 for local police assistance.',
      soloFemaleTitle: 'Safe & Welcoming',
      soloFemaleDesc: 'Generally very safe for solo female travelers; watch out for pickpockets in Barcelona.',
      soloFemaleTags: ['SAFE', 'HOSPITABLE', 'WELL-LIT'],
      cultureImg: '/images/card_madrid.webp',
      cultureExperienceTitle: 'Sagrada Familia Tour',
      cultureExperienceDesc: 'Explore Gaudi\'s magnificent cathedral in Barcelona.',
      cultureHighlight1Title: 'Tapas Sharing Culture',
      cultureHighlight1Desc: 'Food is a social activity; sharing is normal.',
      cultureHighlight2Title: 'Late Dining Hours',
      cultureHighlight2Desc: 'Dinner rarely starts before 9:00 PM.',
      conductGuide: [
        { label: 'Tipping', desc: '10% is standard in tourist spots but not mandatory.' },
        { label: 'Cathedrals', desc: 'Dress respectfully in historic cathedrals.' }
      ],
      usefulPhrases: [
        { phrase: 'Hola', translation: 'Hello' },
        { phrase: 'Gracias', translation: 'Thank you' }
      ],
      logisticsImg: '/images/card_barcelona.webp',
      logisticsCurrencyDesc: 'Euro. Contactless payments accepted everywhere.',
      drivingRules: 'Right side',
      drivingRulesTags: ['Drive on the right', 'Tolls, speed limits apply'],
      transportTags: ['AVE High-speed Train', 'Local Bus', 'Metro Systems'],
      plugType: 'Type C / F',
      voltage: '230V / 50Hz',
      essentialApps: ['Google Maps', 'Renfe (Trains)', 'Cabify (Rides)'],
      experiencesImg: '/images/card_madrid.webp',
      mustTryFoods: ['Paella', 'Jamon Iberico', 'Churros', 'Tapas'],
      alcoholLaws: 'Legal age is 18. Drinking on streets (Botellon) is restricted.',
      localRules: [
        { emoji: '🚭', title: 'SMOKING BAN', desc: 'Smoking is banned in all indoor public spaces.' }
      ],
      videoTitle: 'Spain: 10 Days Itinerary',
      videoUrl: 'https://youtube.com',
      videoThumbnail: '/images/card_barcelona.webp',
      videoDesc: 'Exploring Madrid, Seville, and Barcelona.',
      bucketList: [
        { title: 'Sagrada Familia', desc: 'Admire Antoni Gaudi\'s unfinished modernist architectural masterpiece.', tag: 'LANDMARK', type: 'landmark', img: '/images/card_barcelona.webp' },
        { title: 'Alhambra Palace', desc: 'Walk through the breathtaking Moorish fortress and gardens in Granada.', tag: 'HERITAGE', type: 'heritage', img: '/images/card_madrid.webp' },
        { title: 'Ibiza Sunset Sailing', desc: 'Cruise the pristine waters of the Balearic Islands.', tag: 'COAST', type: 'coast', img: '/images/coastal_beach.webp' },
        { title: 'Caminito del Rey', desc: 'Walk the dramatic cliffside aerial path of Malaga.', tag: 'NATURE', type: 'nature', img: '/images/why_mountains.webp' }
      ],
      uniqueAccommodations: [
        { title: 'Historic Parador Hotels', desc: 'Stay in converted medieval castles, palaces, and monasteries.', img: '/images/card_madrid.webp' },
        { title: 'Andalucian Cave Suites', desc: 'Traditional whitewashed cave rooms in the hills of Granada.', img: '/images/why_mountains.webp' },
        { title: 'Mediterranean Fincas', desc: 'Rustic farmhouse estates surrounded by orange orchards.', img: '/images/coastal_beach.webp' }
      ],
      entryImg: '/images/card_madrid.webp'
    },
    cities: [
      { name: 'Madrid', desc: 'Capital with grand plazas, royal palaces, and world-famous museums.', img_url: '/images/card_madrid.webp' },
      { name: 'Barcelona', desc: 'Mediterranean city famous for Gaudi\'s architecture and beaches.', img_url: '/images/card_barcelona.webp' },
      { name: 'Seville', desc: 'Birthplace of flamenco, boasting historic Moorish palaces.', img_url: '/images/coastal_beach.webp' }
    ]
  },
  {
    id: 'finland',
    name: 'Finland',
    desc: 'A pristine wilderness of silent northern lakes, pine forests, and the magical Northern Lights.',
    tag: 'Nature',
    hero_img: '/images/why_mountains.webp',
    is_featured: true,
    capital: 'Helsinki',
    currency: 'Euro (€)',
    language: 'Finnish, Swedish',
    time_zone: 'GMT+2',
    best_time: 'Dec - Mar',
    emergency_police: '112',
    emergency_ambulance: '112',
    emergency_embassy: 'Contact local embassy in Helsinki.',
    experience_title: 'Northern Lights Safari',
    experience_desc: 'Track the magical aurora borealis in Lapland with an expert guide.',
    experience_img: '/images/why_mountains.webp',
    sections_data: {
      flagEmoji: '🇫🇮',
      heroSubtitle: 'The Happiest Nation on Earth',
      averageTemp: '-5°C - 20°C',
      visaInfo: 'Schengen Area rules apply.',
      countryIntro: 'Finland is a Nordic country in Northern Europe. It features thousands of lakes and islands, pristine national parks, and is home to the magical Santa Claus in Lapland.',
      overviewImg: '/images/why_mountains.webp',
      bestTimePeak: { months: 'December - March', temp: '-15°C - -5°C', daylight: '4 - 6 hours', ideal: 'Skiing, Northern Lights, husky sledding' },
      bestTimeShoulder: { months: 'June - August', temp: '15°C - 22°C', daylight: '18 - 24 hours', ideal: 'Midnight sun, lakeside saunas, hiking' },
      bestTimeOffPeak: { months: 'September - November', temp: '2°C - 10°C', daylight: '8 - 10 hours', ideal: 'Autumn colors (Ruska), picking berries, indoor cozy living' },
      holidaysSpring: 'Easter, May Day (Vappu - May 1)',
      holidaysSummer: 'Midsummer (Juhannus - late June)',
      holidaysAutumn: 'All Saints Day',
      holidaysWinter: 'Independence Day (Dec 6), Christmas Day (Dec 25)',
      visaFreeRegions: ['EU/EEA Citizens', 'USA', 'Canada', 'Australia', 'UK'],
      visaFreeConditions: ['Passport valid for 3 months beyond stay', 'Stay up to 90 days'],
      visaRequiredWho: ['Citizens requiring Schengen visa.'],
      visaRequiredHow: ['Apply at Finnish embassy with travel itinerary and insurance.'],
      customsTobacco: '200 Cigarettes',
      customsAlcohol: '1L Spirits or 4L Wine',
      customsGifts: 'Up to €430 value',
      customsCash: 'Declare over €10,000',
      vaccinesTitle: 'Routine Vaccinations',
      vaccinesDesc: 'Ensure routine vaccines are current.',
      insuranceTitle: 'Travel Medical Insurance',
      insuranceDesc: 'Highly recommended for cold climates and outdoor activities.',
      safetyImg: '/images/why_mountains.webp',
      healthTipsTitle: 'Pristine Tap Water',
      healthTipsDesc: 'Tap water is exceptionally clean and drinkable everywhere.',
      safetyAssistanceTitle: 'Rescue Services',
      safetyAssistanceDesc: 'Call 112 for immediate emergency rescue services.',
      soloFemaleTitle: 'Exceptionally Safe',
      soloFemaleDesc: 'Ranked as one of the safest countries globally; solo female travelers can travel with ease.',
      soloFemaleTags: ['SAFE', 'QUIET', 'RESPONSIBLE'],
      cultureImg: '/images/why_mountains.webp',
      cultureExperienceTitle: 'Wood-fired Sauna',
      cultureExperienceDesc: 'Relax in a traditional Finnish sauna followed by a lake dip.',
      cultureHighlight1Title: 'Everyman\'s Right',
      cultureHighlight1Desc: 'Freedom to roam, forage, and enjoy nature responsibly.',
      cultureHighlight2Title: 'Sisu',
      cultureHighlight2Desc: 'The Finnish concept of grit, resilience, and hard work.',
      conductGuide: [
        { label: 'Sauna Etiquette', desc: 'Saunas are social but quiet places. Going naked is standard but optional.' },
        { label: 'Punctuality', desc: 'Finns value punctuality; always arrive on time.' }
      ],
      usefulPhrases: [
        { phrase: 'Hei', translation: 'Hello' },
        { phrase: 'Kiitos', translation: 'Thank you' }
      ],
      logisticsImg: '/images/why_mountains.webp',
      logisticsCurrencyDesc: 'Euro. Cash is rarely used; cards accepted everywhere.',
      drivingRules: 'Right side',
      drivingRulesTags: ['Drive on the right', 'Winter tires mandatory in winter'],
      transportTags: ['VR National Railways', 'Local Helsinki Metro', 'Buses'],
      plugType: 'Type C / F',
      voltage: '230V / 50Hz',
      essentialApps: ['Google Maps', 'HSL (Helsinki Transit)', 'VR Mobile (Trains)'],
      experiencesImg: '/images/why_mountains.webp',
      mustTryFoods: ['Karjalanpiirakka (Pie)', 'Reindeer meat', 'Salmon soup', 'Lakkakakku'],
      alcoholLaws: 'Legal age is 18 for mild drinks, 20 for strong spirits. Sold in Alko shops.',
      localRules: [
        { emoji: '🚭', title: 'SMOKING RESTRICTIONS', desc: 'Banned in indoor and close outdoor public spots.' }
      ],
      videoTitle: 'Lapland & Helsinki: The Winter Wonders',
      videoUrl: 'https://youtube.com',
      videoThumbnail: '/images/why_mountains.webp',
      videoDesc: 'Winter tour of Rovaniemi, Helsinki, and snowy Lapland.',
      bucketList: [
        { title: 'Lapland Northern Lights', desc: 'Sleep under the aurora borealis in a heated glass igloo.', tag: 'NATURE', type: 'nature', img: '/images/why_mountains.webp' },
        { title: 'Helsinki Cathedral', desc: 'Admire the monumental white neoclassical cathedral.', tag: 'LANDMARK', type: 'landmark', img: '/images/hero_city.webp' },
        { title: 'Midnight Sun Sauna', desc: 'Experience a wood-fired sauna and lake swim in midsummer.', tag: 'CULTURE', type: 'culture', img: '/images/coastal_beach.webp' }
      ],
      uniqueAccommodations: [
        { title: 'Glass Aurora Igloos', desc: 'Watch the northern lights dance from your glass-roofed dome.', img: '/images/why_mountains.webp' },
        { title: 'Lakeside Log Cabins', desc: 'Rustic wooden cabins with private wood-fired saunas.', img: '/images/why_mountains.webp' },
        { title: 'Ice Hotels of Kemi', desc: 'Sleep on ice beds inside a snow fortress rebuilt every winter.', img: '/images/why_mountains.webp' }
      ],
      entryImg: '/images/why_mountains.webp'
    },
    cities: [
      { name: 'Helsinki', desc: 'Seaside capital with beautiful architecture, parks, and design districts.', img_url: '/images/hero_city.webp' },
      { name: 'Rovaniemi', desc: 'Official hometown of Santa Claus, located on the Arctic Circle.', img_url: '/images/why_mountains.webp' },
      { name: 'Tampere', desc: 'Sauna capital of the world, situated between two scenic lakes.', img_url: '/images/coastal_beach.webp' }
    ]
  },
  {
    id: 'switzerland',
    name: 'Switzerland',
    desc: 'Majestic snow-capped peaks, crystal clear lakes, and luxury lakeside resorts.',
    tag: 'Adventure',
    hero_img: '/images/alpine_mountains.webp',
    is_featured: true,
    capital: 'Bern',
    currency: 'Swiss Franc (CHF)',
    language: 'German, French, Italian',
    time_zone: 'GMT+1',
    best_time: 'Jun - Sept',
    emergency_police: '117',
    emergency_ambulance: '144',
    emergency_embassy: 'Contact local embassy in Bern.',
    experience_title: 'Glacier Express Ride',
    experience_desc: 'Ride the world\'s slowest express train through breathtaking alpine valleys.',
    experience_img: '/images/alpine_mountains.webp',
    sections_data: {
      flagEmoji: '🇨🇭',
      heroSubtitle: 'Alpine Wonder & Precision',
      averageTemp: '2°C - 23°C',
      visaInfo: 'Schengen Area rules apply (Not an EU member).',
      countryIntro: 'Switzerland is a mountainous Central European country, home to numerous lakes, villages, and the high peaks of the Alps.',
      overviewImg: '/images/alpine_mountains.webp',
      bestTimePeak: { months: 'June - September', temp: '16°C - 24°C', daylight: '13 - 15 hours', ideal: 'Alpine hiking, lake swimming, sightseeing' },
      bestTimeShoulder: { months: 'December - March', temp: '-5°C - 5°C', daylight: '8 - 10 hours', ideal: 'Skiing, snowboarding, winter festivals' },
      bestTimeOffPeak: { months: 'October - November', temp: '5°C - 12°C', daylight: '9 - 11 hours', ideal: 'Museums, empty cable cars, autumn landscapes' },
      holidaysSpring: 'Good Friday, Ascension Day, Whit Monday',
      holidaysSummer: 'Swiss National Day (Aug 1)',
      holidaysAutumn: 'Federal Day of Thanksgiving',
      holidaysWinter: 'Christmas Day (Dec 25), Boxing Day (Dec 26)',
      visaFreeRegions: ['EU/EEA Citizens', 'USA', 'Canada', 'Australia', 'UK'],
      visaFreeConditions: ['Passport valid for 3 months beyond stay', 'Stay up to 90 days'],
      visaRequiredWho: ['Citizens requiring Schengen visa.'],
      visaRequiredHow: ['Apply at Swiss embassy with travel and funds proof.'],
      customsTobacco: '250 Cigarettes',
      customsAlcohol: '1L Spirits or 5L Wine (under 18%)',
      customsGifts: 'Up to CHF 300 value',
      customsCash: 'Declare cash over CHF 10,000',
      vaccinesTitle: 'Routine Vaccinations',
      vaccinesDesc: 'Ensure routine vaccines are current.',
      insuranceTitle: 'Travel Medical Insurance',
      insuranceDesc: 'Highly recommended due to extremely high medical costs.',
      safetyImg: '/images/alpine_mountains.webp',
      healthTipsTitle: 'Pure Mountain Water',
      healthTipsDesc: 'Tap and fountain water is completely clean and drinkable everywhere.',
      safetyAssistanceTitle: 'Rega Air Rescue',
      safetyAssistanceDesc: 'Call 1414 for helicopter search and rescue.',
      soloFemaleTitle: 'Extremely Safe',
      soloFemaleDesc: 'Very high safety rating; solo travelers can explore all areas safely.',
      soloFemaleTags: ['SAFE', 'CLEAN', 'EFFICIENT'],
      cultureImg: '/images/alpine_mountains.webp',
      cultureExperienceTitle: 'Traditional Fondue Dinner',
      cultureExperienceDesc: 'Enjoy hot melted cheese fondue in a cozy mountain chalet.',
      cultureHighlight1Title: 'Multilingualism',
      cultureHighlight1Desc: 'Four national languages spoken across different cantons.',
      cultureHighlight2Title: 'Swiss Quality & Precision',
      cultureHighlight2Desc: 'Renowned for watchmaking, trains, and chocolate.',
      conductGuide: [
        { label: 'Quiet Hours', desc: 'Keep noise low after 10:00 PM, especially in apartments.' },
        { label: 'Tipping', desc: 'Service is included; round up small change in cafés.' }
      ],
      usefulPhrases: [
        { phrase: 'Gruezi', translation: 'Hello (Swiss German)' },
        { phrase: 'Merci', translation: 'Thank you' }
      ],
      logisticsImg: '/images/alpine_mountains.webp',
      logisticsCurrencyDesc: 'Swiss Franc (CHF). Cards are standard payment methods.',
      drivingRules: 'Right side',
      drivingRulesTags: ['Drive on the right', 'Vignette highway sticker required'],
      transportTags: ['SBB CFF FFS Train Network', 'Postal Buses', 'Mountain Cable Cars'],
      plugType: 'Type J / C',
      voltage: '230V / 50Hz',
      essentialApps: ['Google Maps', 'SBB Mobile (Trains)', 'MeteoSwiss (Weather)'],
      experiencesImg: '/images/alpine_mountains.webp',
      mustTryFoods: ['Cheese Fondue', 'Rosti', 'Raclette', 'Swiss Chocolate'],
      alcoholLaws: 'Minimum age is 16 for beer/wine, 18 for spirits.',
      localRules: [
        { emoji: '🚭', title: 'SMOKING BAN', desc: 'Banned in indoor public areas and stations.' }
      ],
      videoTitle: 'Switzerland: 7 Days Travel Guide',
      videoUrl: 'https://youtube.com',
      videoThumbnail: '/images/alpine_mountains.webp',
      videoDesc: 'Visual guide to Zurich, Zermatt, and Interlaken.',
      bucketList: [
        { title: 'Matterhorn Summit Vistas', desc: 'See the iconic jagged pyramid peak of Zermatt.', tag: 'NATURE', type: 'nature', img: '/images/alpine_mountains.webp' },
        { title: 'Jungfraujoch Train', desc: 'Ride the railway to the top of Europe at 3,454 meters.', tag: 'LANDMARK', type: 'landmark', img: '/images/why_mountains.webp' },
        { title: 'Chapel Bridge Stroll', desc: 'Walk across the historic 14th-century wooden bridge of Lucerne.', tag: 'HERITAGE', type: 'heritage', img: '/images/how_london.webp' }
      ],
      uniqueAccommodations: [
        { title: 'Alpine Chalets', desc: 'Luxury timber mountain chalets with panoramic views of the Alps.', img: '/images/alpine_mountains.webp' },
        { title: 'Lakeside Grand Hotels', desc: 'Historic luxury palaces on the banks of Lake Geneva or Lucerne.', img: '/images/how_london.webp' },
        { title: 'Mountain Cable Huts', desc: 'Sleep in high-altitude hikers\' huts accessible only by trail.', img: '/images/why_mountains.webp' }
      ],
      entryImg: '/images/alpine_mountains.webp'
    },
    cities: [
      { name: 'Zurich', desc: 'Cosmopolitan city known for finance, lake views, and old town streets.', img_url: '/images/hero_city.webp' },
      { name: 'Geneva', desc: 'French-speaking hub of global diplomacy on the shores of Lake Geneva.', img_url: '/images/coastal_beach.webp' },
      { name: 'Lucerne', desc: 'Gateway to central Switzerland, famous for Kapellbrucke bridge.', img_url: '/images/alpine_mountains.webp' }
    ]
  },
  {
    id: 'croatia',
    name: 'Croatia',
    desc: 'Sun-drenched rocky beaches, medieval walled towns, and deep forest national parks.',
    tag: 'Editorial',
    hero_img: '/images/coastal_beach.webp',
    is_featured: true,
    capital: 'Zagreb',
    currency: 'Euro (€)',
    language: 'Croatian',
    time_zone: 'GMT+1',
    best_time: 'Jun - Sept',
    emergency_police: '112',
    emergency_ambulance: '112',
    emergency_embassy: 'Contact local embassy in Zagreb.',
    experience_title: 'Dubrovnik Wall Walk',
    experience_desc: 'Explore the monumental medieval stone walls of the old town.',
    experience_img: '/images/coastal_beach.webp',
    sections_data: {
      flagEmoji: '🇭🇷',
      heroSubtitle: 'Pearl of the Adriatic',
      averageTemp: '10°C - 27°C',
      visaInfo: 'Schengen Area tourist rules apply.',
      countryIntro: 'Croatia is a Mediterranean country in Southeast Europe, boasting an extensive Adriatic coastline, over a thousand islands, and rich historic architecture.',
      overviewImg: '/images/coastal_beach.webp',
      bestTimePeak: { months: 'July - August', temp: '22°C - 30°C', daylight: '14 - 15 hours', ideal: 'Island hopping, swimming, sailing, nightlife' },
      bestTimeShoulder: { months: 'May - June / September', temp: '18°C - 24°C', daylight: '12 - 14 hours', ideal: 'National parks, lower crowd levels, warm sea temperatures' },
      bestTimeOffPeak: { months: 'October - April', temp: '5°C - 13°C', daylight: '8 - 10 hours', ideal: 'Sightseeing in Zagreb, hot thermal springs' },
      holidaysSpring: 'Easter Monday, Statehood Day (May 30)',
      holidaysSummer: 'Victory Day (Aug 5), Assumption of Mary (Aug 15)',
      holidaysAutumn: 'All Saints Day (Nov 1)',
      holidaysWinter: 'Christmas Day (Dec 25), St. Stephen\'s Day (Dec 26)',
      visaFreeRegions: ['EU/EEA Citizens', 'USA', 'Canada', 'Australia', 'UK'],
      visaFreeConditions: ['Passport valid for 3 months beyond stay', 'Stay up to 90 days'],
      visaRequiredWho: ['Citizens requiring Schengen visa.'],
      visaRequiredHow: ['Apply at Croatian consulate or VFS center with bookings.'],
      customsTobacco: '200 Cigarettes',
      customsAlcohol: '1L Spirits',
      customsGifts: 'Up to €430 value',
      customsCash: 'Declare over €10,000',
      vaccinesTitle: 'Routine Vaccinations',
      vaccinesDesc: 'Ensure standard vaccinations are up to date.',
      insuranceTitle: 'Travel Medical Insurance',
      insuranceDesc: 'Highly recommended for medical evacuation coverage.',
      safetyImg: '/images/coastal_beach.webp',
      healthTipsTitle: 'Safe Tap Water',
      healthTipsDesc: 'Tap water is safe and of high quality across the entire country.',
      safetyAssistanceTitle: 'Emergency Help',
      safetyAssistanceDesc: 'Call 112 for the general emergency dispatch center.',
      soloFemaleTitle: 'Safe & Friendly',
      soloFemaleDesc: 'Generally very safe; take standard precautions in beach resorts at night.',
      soloFemaleTags: ['SAFE', 'HOSPITABLE', 'WELL-LIT'],
      cultureImg: '/images/coastal_beach.webp',
      cultureExperienceTitle: 'Plitvice Lakes Hiking',
      cultureExperienceDesc: 'Walk along boardwalks over magnificent cascading turquoise lakes.',
      cultureHighlight1Title: 'Cafe Culture',
      cultureHighlight1Desc: 'Spica is the social tradition of drinking coffee for hours.',
      cultureHighlight2Title: 'Glagolitic Heritage',
      cultureHighlight2Desc: 'Historical alphabet distinct to the Croatian region.',
      conductGuide: [
        { label: 'Dress', desc: 'Dress appropriately when entering old churches.' },
        { label: 'Tipping', desc: '10% in restaurants is standard and appreciated.' }
      ],
      usefulPhrases: [
        { phrase: 'Bok', translation: 'Hello / Bye' },
        { phrase: 'Hvala', translation: 'Thank you' }
      ],
      logisticsImg: '/images/coastal_beach.webp',
      logisticsCurrencyDesc: 'Euro. Credit cards widely accepted in hotels/shops.',
      drivingRules: 'Right side',
      drivingRulesTags: ['Drive on the right', 'Headlights mandatory in winter'],
      transportTags: ['Jadrolinija ferry network', 'Intercity buses', 'Car rentals'],
      plugType: 'Type C / F',
      voltage: '230V / 50Hz',
      essentialApps: ['Google Maps', 'HAK (Road Conditions)', 'Uber (Major Cities)'],
      experiencesImg: '/images/coastal_beach.webp',
      mustTryFoods: ['Peka (Baked dish)', 'Black Risotto', 'Truffles (Istria)', 'Seafood'],
      alcoholLaws: 'Minimum age is 18. Strict zero-tolerance for drink driving.',
      localRules: [
        { emoji: '🚭', title: 'SMOKING BAN', desc: 'Banned in indoor public venues.' }
      ],
      videoTitle: 'Croatia: The Adriatic Coast Guide',
      videoUrl: 'https://youtube.com',
      videoThumbnail: '/images/coastal_beach.webp',
      videoDesc: 'Exploring Zagreb, Plitvice Lakes, and Dubrovnik.',
      bucketList: [
        { title: 'Dubrovnik Old Town Walls', desc: 'Stroll the monumental 2-kilometer stone defensive wall.', tag: 'HERITAGE', type: 'heritage', img: '/images/coastal_beach.webp' },
        { title: 'Plitvice Lakes Boardwalks', desc: 'Hike among 16 interconnected cascading emerald lakes.', tag: 'NATURE', type: 'nature', img: '/images/why_mountains.webp' },
        { title: 'Hvar Island Beach Clubbing', desc: 'Relax in stylish seaside beach bars overlooking the Adriatic.', tag: 'COAST', type: 'coast', img: '/images/coastal_beach.webp' }
      ],
      uniqueAccommodations: [
        { title: 'Adriatic Lighthouse Escapes', desc: 'Rent a private historic lighthouse on a secluded rocky islet.', img: '/images/coastal_beach.webp' },
        { title: 'Stone Walled Heritage Villas', desc: 'Restored medieval stone houses in quiet Dalmatian villages.', img: '/images/coastal_beach.webp' },
        { title: 'Seaside Olive Farm Estates', desc: 'Modern cabins situated inside active centuries-old olive orchards.', img: '/images/coastal_beach.webp' }
      ],
      entryImg: '/images/coastal_beach.webp'
    },
    cities: [
      { name: 'Zagreb', desc: 'Charming capital known for historic upper town and cafe culture.', img_url: '/images/hero_city.webp' },
      { name: 'Dubrovnik', desc: 'Stunning walled city, famous Game of Thrones filming site.', img_url: '/images/coastal_beach.webp' },
      { name: 'Split', desc: 'Bustling port city built around Roman Emperor Diocletian\'s Palace.', img_url: '/images/marrakech.webp' }
    ]
  },
  {
    id: 'austria',
    name: 'Austria',
    desc: 'Grand palaces, rich musical heritage of Mozart, and breathtaking Tyrolean mountain passes.',
    tag: 'Culture',
    hero_img: '/images/alpine_mountains.webp',
    is_featured: true,
    capital: 'Vienna',
    currency: 'Euro (€)',
    language: 'German',
    time_zone: 'GMT+1',
    best_time: 'Jun - Aug',
    emergency_police: '133',
    emergency_ambulance: '144',
    emergency_embassy: 'Contact local embassy in Vienna.',
    experience_title: 'Classical Concert in Vienna',
    experience_desc: 'Listen to Mozart and Strauss inside a historic palace hall.',
    experience_img: '/images/alpine_mountains.webp',
    sections_data: {
      flagEmoji: '🇦🇹',
      heroSubtitle: 'Imperial Grandeur & Symphonies',
      averageTemp: '0°C - 24°C',
      visaInfo: 'Schengen Area rules apply.',
      countryIntro: 'Austria is a landlocked Central European country, characterized by grand Baroque architecture, imperial history, and alpine terrain.',
      overviewImg: '/images/alpine_mountains.webp',
      bestTimePeak: { months: 'June - August', temp: '18°C - 26°C', daylight: '14 - 15 hours', ideal: 'Hiking, outdoor dining, lake swimming, music festivals' },
      bestTimeShoulder: { months: 'September - October', temp: '10°C - 18°C', daylight: '11 - 13 hours', ideal: 'Wine tasting in vineyards, foliage, museum visits' },
      bestTimeOffPeak: { months: 'December - March', temp: '-3°C - 5°C', daylight: '8 - 9 hours', ideal: 'Skiing, Christmas markets in Vienna, cozy coffee houses' },
      holidaysSpring: 'Easter Monday, National Holiday (May 1)',
      holidaysSummer: 'Assumption of Mary (Aug 15)',
      holidaysAutumn: 'National Day (Oct 26), All Saints Day (Nov 1)',
      holidaysWinter: 'Christmas Day (Dec 25), St. Stephen\'s Day (Dec 26)',
      visaFreeRegions: ['EU/EEA Citizens', 'USA', 'Canada', 'Australia', 'UK'],
      visaFreeConditions: ['Passport valid for 3 months beyond stay', 'Stay up to 90 days'],
      visaRequiredWho: ['Citizens requiring Schengen visa.'],
      visaRequiredHow: ['Apply at Austrian consulate with accommodation proof.'],
      customsTobacco: '200 Cigarettes',
      customsAlcohol: '1L Spirits',
      customsGifts: 'Up to €430 value',
      customsCash: 'Declare over €10,000',
      vaccinesTitle: 'Routine Vaccinations',
      vaccinesDesc: 'Ensure routine vaccines are current.',
      insuranceTitle: 'Travel Medical Insurance',
      insuranceDesc: 'Highly recommended for winter sports and hiking activities.',
      safetyImg: '/images/alpine_mountains.webp',
      healthTipsTitle: 'Safe Tap Water',
      healthTipsDesc: 'Tap water comes from pure mountain springs and is clean everywhere.',
      safetyAssistanceTitle: 'Federal Police',
      safetyAssistanceDesc: 'Call 133 for national police dispatch.',
      soloFemaleTitle: 'Extremely Safe',
      soloFemaleDesc: 'Very high safety rating; solo female travelers can navigate comfortably.',
      soloFemaleTags: ['SAFE', 'CLEAN', 'ORGANIZED'],
      cultureImg: '/images/alpine_mountains.webp',
      cultureExperienceTitle: 'Schonbrunn Palace Tour',
      cultureExperienceDesc: 'Explore the summer residence of the Habsburg monarchs.',
      cultureHighlight1Title: 'Coffee House Culture',
      cultureHighlight1Desc: 'A traditional social institution listed by UNESCO.',
      cultureHighlight2Title: 'Musical Heritage',
      cultureHighlight2Desc: 'Home of classical masters like Mozart and Beethoven.',
      conductGuide: [
        { label: 'Quiet Hours', desc: 'Keep noise low on Sundays and after 10 PM.' },
        { label: 'Tipping', desc: 'Service is included; standard tipping is 5-10%.' }
      ],
      usefulPhrases: [
        { phrase: 'Guten Tag', translation: 'Hello' },
        { phrase: 'Danke', translation: 'Thank you' }
      ],
      logisticsImg: '/images/alpine_mountains.webp',
      logisticsCurrencyDesc: 'Euro. Credit cards widely accepted.',
      drivingRules: 'Right side',
      drivingRulesTags: ['Drive on the right', 'Vignette toll sticker required for highways'],
      transportTags: ['ÖBB National Railways', 'Vienna U-Bahn Metro', 'Postbus'],
      plugType: 'Type C / F',
      voltage: '230V / 50Hz',
      essentialApps: ['Google Maps', 'ÖBB Scotty (Trains)', 'Wien Mobil (Vienna Transit)'],
      experiencesImg: '/images/alpine_mountains.webp',
      mustTryFoods: ['Wiener Schnitzel', 'Sacher Torte', 'Apfelstrudel', 'Tafelspitz'],
      alcoholLaws: 'Legal age is 16 for beer/wine, 18 for strong spirits.',
      localRules: [
        { emoji: '🚭', title: 'SMOKING RESTRICTIONS', desc: 'Banned in indoor public venues.' }
      ],
      videoTitle: 'Austria Travel Itinerary Guide',
      videoUrl: 'https://youtube.com',
      videoThumbnail: '/images/alpine_mountains.webp',
      videoDesc: 'Exploring Vienna, Salzburg, and Austrian Alps.',
      bucketList: [
        { title: 'Schönbrunn Palace', desc: 'Walk the imperial gardens of the majestic Habsburg summer palace.', tag: 'HERITAGE', type: 'heritage', img: '/images/alpine_mountains.webp' },
        { title: 'Hallstatt Lakeside Stroll', desc: 'Visit the world-famous alpine village overlooking calm waters.', tag: 'LANDMARK', type: 'landmark', img: '/images/why_mountains.webp' },
        { title: 'Grossglockner High Road', desc: 'Drive the spectacular mountain pass under Austria\'s highest peak.', tag: 'NATURE', type: 'nature', img: '/images/alpine_mountains.webp' }
      ],
      uniqueAccommodations: [
        { title: 'Imperial Vienna Hotels', desc: 'Opulent historic hotels with crystal chandeliers and luxury spas.', img: '/images/alpine_mountains.webp' },
        { title: 'Tyrolean Timber Chalets', desc: 'Cozy wooden alpine lodges nestled in quiet meadows.', img: '/images/alpine_mountains.webp' },
        { title: 'Lakeside Castles', desc: 'Charming historic castles overlooking Lake Wörthersee.', img: '/images/why_mountains.webp' }
      ],
      entryImg: '/images/alpine_mountains.webp'
    },
    cities: [
      { name: 'Vienna', desc: 'Imperial capital known for palaces, classical music, and coffee houses.', img_url: '/images/hero_city.webp' },
      { name: 'Salzburg', desc: 'Birthplace of Mozart, surrounded by scenic alpine peaks.', img_url: '/images/coastal_beach.webp' },
      { name: 'Innsbruck', desc: 'Capital of Tyrol, famous for winter sports and alpine scenery.', img_url: '/images/alpine_mountains.webp' }
    ]
  },
  {
    id: 'iceland',
    name: 'Iceland',
    desc: 'A dramatic landscape of active volcanoes, geysers, thermal lagoons, and black sand beaches.',
    tag: 'Nature',
    hero_img: '/images/why_mountains.webp',
    is_featured: true,
    capital: 'Reykjavik',
    currency: 'Icelandic Króna (ISK)',
    language: 'Icelandic',
    time_zone: 'GMT',
    best_time: 'Jun - Aug',
    emergency_police: '112',
    emergency_ambulance: '112',
    emergency_embassy: 'Contact local embassy in Reykjavik.',
    experience_title: 'Blue Lagoon Spa Visit',
    experience_desc: 'Soak in the mineral-rich geothermal waters of the Blue Lagoon.',
    experience_img: '/images/why_mountains.webp',
    sections_data: {
      flagEmoji: '🇮🇸',
      heroSubtitle: 'Land of Fire & Ice',
      averageTemp: '-2°C - 13°C',
      visaInfo: 'Schengen Area rules apply.',
      countryIntro: 'Iceland is a Nordic island country defined by its dramatic landscape with hot springs, active geysers, waterfalls, and massive ice glaciers.',
      overviewImg: '/images/why_mountains.webp',
      bestTimePeak: { months: 'June - August', temp: '10°C - 15°C', daylight: '20 - 24 hours', ideal: 'Midnight sun, puffin watching, highland hiking' },
      bestTimeShoulder: { months: 'September - October / April - May', temp: '2°C - 8°C', daylight: '11 - 13 hours', ideal: 'Northern Lights, lower crowds, autumn colors' },
      bestTimeOffPeak: { months: 'November - March', temp: '-5°C - 3°C', daylight: '4 - 6 hours', ideal: 'Ice caves exploration, heavy snow landscapes, auroras' },
      holidaysSpring: 'Maundy Thursday, Easter Monday',
      holidaysSummer: 'National Day (June 17), Commerce Day (August)',
      holidaysAutumn: 'First Day of Winter (October)',
      holidaysWinter: 'Christmas Day (Dec 25), Boxing Day (Dec 26)',
      visaFreeRegions: ['EU/EEA Citizens', 'USA', 'Canada', 'Australia', 'UK'],
      visaFreeConditions: ['Passport valid for 3 months beyond stay', 'Stay up to 90 days'],
      visaRequiredWho: ['Citizens requiring Schengen visa.'],
      visaRequiredHow: ['Apply at Icelandic embassy with flights and travel insurance.'],
      customsTobacco: '200 Cigarettes',
      customsAlcohol: '1L Spirits & 0.75L Wine',
      customsGifts: 'Up to ISK 88,000 value',
      customsCash: 'No limits but declare large cash values over €10,000',
      vaccinesTitle: 'Routine Vaccinations',
      vaccinesDesc: 'Ensure routine vaccines are current.',
      insuranceTitle: 'Travel Medical Insurance',
      insuranceDesc: 'Highly recommended for extreme weather and hiking rescue.',
      safetyImg: '/images/why_mountains.webp',
      healthTipsTitle: 'Safe Tap Water',
      healthTipsDesc: 'Tap water is among the cleanest in the world; do not buy bottled water.',
      safetyAssistanceTitle: 'SafeTravel Iceland',
      safetyAssistanceDesc: 'Check safetravel.is for road closures and weather alerts.',
      soloFemaleTitle: 'Safest Country in the World',
      soloFemaleDesc: 'Consistently ranked #1 on Global Peace Index; exceptionally safe for solo travelers.',
      soloFemaleTags: ['SAFE', 'PEACEFUL', 'PRISTINE'],
      cultureImg: '/images/why_mountains.webp',
      cultureExperienceTitle: 'Golden Circle Road Trip',
      cultureExperienceDesc: 'Explore Geysir, Gullfoss waterfall, and Thingvellir park.',
      cultureHighlight1Title: 'Saga Literature',
      cultureHighlight1Desc: 'Rich historical prose describing medieval settlement.',
      cultureHighlight2Title: 'Environmentalism',
      cultureHighlight2Desc: 'Nearly 100% of electricity is from geothermal and hydro energy.',
      conductGuide: [
        { label: 'Off-road Driving', desc: 'Strictly illegal and carries massive fines to protect soil.' },
        { label: 'Pool Hygiene', desc: 'You must shower naked before entering public pools.' }
      ],
      usefulPhrases: [
        { phrase: 'Góðan daginn', translation: 'Good morning' },
        { phrase: 'Takk', translation: 'Thank you' }
      ],
      logisticsImg: '/images/why_mountains.webp',
      logisticsCurrencyDesc: 'Icelandic Króna (ISK). Cash is virtually obsolete; cards are standard.',
      drivingRules: 'Right side',
      drivingRulesTags: ['Drive on the right', 'F-roads require 4WD vehicles'],
      transportTags: ['No railway network', 'Strætó bus network', 'Car rentals'],
      plugType: 'Type C / F',
      voltage: '230V / 50Hz',
      essentialApps: ['Google Maps', 'SafeTravel', 'Parka (parking payments)'],
      experiencesImg: '/images/why_mountains.webp',
      mustTryFoods: ['Skyr (Yogurt)', 'Icelandic Lamb', 'Fermented Shark', 'Seafood'],
      alcoholLaws: 'Legal age is 20. Sold only in state-run Vínbúðin shops.',
      localRules: [
        { emoji: '🚭', title: 'SMOKING RESTRICTIONS', desc: 'Banned in indoor public venues.' }
      ],
      videoTitle: 'Iceland: Ultimate Ring Road Itinerary',
      videoUrl: 'https://youtube.com',
      videoThumbnail: '/images/why_mountains.webp',
      videoDesc: 'Visual guide to waterfalls, glaciers, and black sands.',
      bucketList: [
        { title: 'Golden Circle Explorer', desc: 'See the Geysir hot springs and mighty Gullfoss waterfall.', tag: 'NATURE', type: 'nature', img: '/images/why_mountains.webp' },
        { title: 'Reynisfjara Black Sands', desc: 'Walk the volcanic black sand beach with basalt column cliffs.', tag: 'COAST', type: 'coast', img: '/images/why_mountains.webp' },
        { title: 'Jökulsárlón Glacier', desc: 'Watch massive blue icebergs float out towards the ocean.', tag: 'LANDMARK', type: 'landmark', img: '/images/why_mountains.webp' }
      ],
      uniqueAccommodations: [
        { title: 'Icelandic Glass Cabins', desc: 'Premium minimalist cabins with panoramic glass bedroom views.', img: '/images/why_mountains.webp' },
        { title: 'Geothermal Spa Resorts', desc: 'Luxury suites with private access to hot thermal spring pools.', img: '/images/why_mountains.webp' },
        { title: 'Fjord Farmhouses', desc: 'Traditional turf-roofed houses nestled at the base of steep fjords.', img: '/images/why_mountains.webp' }
      ],
      entryImg: '/images/why_mountains.webp'
    },
    cities: [
      { name: 'Reykjavik', desc: 'Quirky capital city with colorful buildings, nightlife, and design shops.', img_url: '/images/hero_city.webp' },
      { name: 'Akureyri', desc: 'Capital of the North, situated in a gorgeous deep fjord.', img_url: '/images/why_mountains.webp' },
      { name: 'Vik', desc: 'Small coastal village known for black sand beaches and puffin cliffs.', img_url: '/images/coastal_beach.webp' }
    ]
  },
  {
    id: 'malta',
    name: 'Malta',
    desc: 'Stone-walled ancient fortresses, megalithic temples, and crystal-clear lagoon beaches.',
    tag: 'Culture',
    hero_img: '/images/coastal_beach.webp',
    is_featured: true,
    capital: 'Valletta',
    currency: 'Euro (€)',
    language: 'Maltese, English',
    time_zone: 'GMT+1',
    best_time: 'May - Oct',
    emergency_police: '112',
    emergency_ambulance: '112',
    emergency_embassy: 'Contact local embassy in Valletta.',
    experience_title: 'Blue Lagoon Gozo Tour',
    experience_desc: 'Boat tour to the stunning crystal clear waters of the Blue Lagoon.',
    experience_img: '/images/coastal_beach.webp',
    sections_data: {
      flagEmoji: '🇲🇹',
      heroSubtitle: 'Fortress Island of the Mediterranean',
      averageTemp: '12°C - 30°C',
      visaInfo: 'Schengen Area rules apply.',
      countryIntro: 'Malta is an archipelago in the central Mediterranean, situated between Sicily and the North African coast, known for historical sites related to a succession of rulers.',
      overviewImg: '/images/coastal_beach.webp',
      bestTimePeak: { months: 'July - August', temp: '25°C - 34°C', daylight: '14 - 15 hours', ideal: 'Beach swimming, night clubs, summer festas' },
      bestTimeShoulder: { months: 'May - June / Sept - Oct', temp: '19°C - 26°C', daylight: '12 - 13 hours', ideal: 'Sightseeing in Valletta, walking historic Mdina' },
      bestTimeOffPeak: { months: 'November - April', temp: '10°C - 16°C', daylight: '9 - 10 hours', ideal: 'Historical museum tours, empty beaches' },
      holidaysSpring: 'Good Friday, St. Joseph\'s Day (March 19)',
      holidaysSummer: 'Feast of the Assumption (Aug 15)',
      holidaysAutumn: 'Victory Day (Sept 8), Republic Day (Dec 13)',
      holidaysWinter: 'Christmas Day (Dec 25), New Year\'s Day (Jan 1)',
      visaFreeRegions: ['EU/EEA Citizens', 'USA', 'Canada', 'Australia', 'UK'],
      visaFreeConditions: ['Passport valid for 3 months beyond stay', 'Stay up to 90 days'],
      visaRequiredWho: ['Citizens requiring Schengen visa.'],
      visaRequiredHow: ['Apply at Maltese embassy with travel insurance and hotel reservations.'],
      customsTobacco: '200 Cigarettes',
      customsAlcohol: '1L Spirits',
      customsGifts: 'Up to €430 value',
      customsCash: 'Declare over €10,000',
      vaccinesTitle: 'Routine Vaccinations',
      vaccinesDesc: 'Ensure routine vaccines are current.',
      insuranceTitle: 'Travel Medical Insurance',
      insuranceDesc: 'Highly recommended for travel health protection.',
      safetyImg: '/images/coastal_beach.webp',
      healthTipsTitle: 'Safe Tap Water',
      healthTipsDesc: 'Tap water is safe but heavily desalinated; bottled water is preferred for taste.',
      safetyAssistanceTitle: 'Emergency Police',
      safetyAssistanceDesc: 'Call 112 for general local emergency help.',
      soloFemaleTitle: 'Very Safe',
      soloFemaleDesc: 'High safety rating; solo female travelers can navigate all areas comfortably.',
      soloFemaleTags: ['SAFE', 'ENGLISH-SPEAKING', 'MEDITERRANEAN'],
      cultureImg: '/images/coastal_beach.webp',
      cultureExperienceTitle: 'Valletta Historic City Tour',
      cultureExperienceDesc: 'Walk through the fortified capital city built by the Knights of St. John.',
      cultureHighlight1Title: 'Megalithic Temples',
      cultureHighlight1Desc: 'Some of the oldest free-standing structures on Earth.',
      cultureHighlight2Title: 'Local Festas',
      cultureHighlight2Desc: 'Village patron saint feasts with fireworks and street bands.',
      conductGuide: [
        { label: 'Dress Code', desc: 'Cover shoulders and knees in churches.' },
        { label: 'Tipping', desc: '10% in restaurants is standard and appreciated.' }
      ],
      usefulPhrases: [
        { phrase: 'Bonġu', translation: 'Hello / Good morning' },
        { phrase: 'Grazzi', translation: 'Thank you' }
      ],
      logisticsImg: '/images/coastal_beach.webp',
      logisticsCurrencyDesc: 'Euro. Credit cards widely accepted in restaurants and hotels.',
      drivingRules: 'Left side',
      drivingRulesTags: ['Drive on the left', 'Narrow urban streets'],
      transportTags: ['Malta Public Transport buses', 'Ferries between Gozo/Malta', 'Car rentals'],
      plugType: 'Type G',
      voltage: '230V / 50Hz',
      essentialApps: ['Google Maps', 'Tallinja (Buses)', 'Bolt / eCabs (Rides)'],
      experiencesImg: '/images/coastal_beach.webp',
      mustTryFoods: ['Pastizzi (Pastry)', 'Rabbit Stew (Fenkata)', 'Ftira bread', 'Kinnie drink'],
      alcoholLaws: 'Minimum age is 17. No open containers in specific city streets.',
      localRules: [
        { emoji: '🚭', title: 'SMOKING BAN', desc: 'Smoking is banned in all indoor public spaces.' }
      ],
      videoTitle: 'Malta & Gozo: 5 Days Itinerary Guide',
      videoUrl: 'https://youtube.com',
      videoThumbnail: '/images/coastal_beach.webp',
      videoDesc: 'Exploring Valletta, Mdina, and the Blue Lagoon.',
      bucketList: [
        { title: 'St. John\'s Co-Cathedral', desc: 'Admire the gold-gilded interiors and Caravaggio masterpieces.', tag: 'HERITAGE', type: 'heritage', img: '/images/coastal_beach.webp' },
        { title: 'Blue Lagoon Gozo', desc: 'Swim in the crystal-clear azure waters of the Comino channel.', tag: 'COAST', type: 'coast', img: '/images/coastal_beach.webp' },
        { title: 'Mdina Silent Streets', desc: 'Stroll the quiet medieval stone-walled noble capital at night.', tag: 'LANDMARK', type: 'landmark', img: '/images/how_london.webp' }
      ],
      uniqueAccommodations: [
        { title: 'Palazzo Boutique Hotels', desc: 'Stay in converted 17th-century palaces inside historic Valletta.', img: '/images/how_london.webp' },
        { title: 'Gozo Farmhouses', desc: 'Rustic limestone villas with private outdoor pools and orchards.', img: '/images/coastal_beach.webp' },
        { title: 'Seaside Yacht Charters', desc: 'Sleep aboard a chartered luxury sailboat docked in the Grand Harbour.', img: '/images/coastal_beach.webp' }
      ],
      entryImg: '/images/coastal_beach.webp'
    },
    cities: [
      { name: 'Valletta', desc: 'Fortified capital with historical museums, palaces, and scenic views.', img_url: '/images/hero_city.webp' },
      { name: 'Mdina', desc: 'Quiet, walled medieval city in the heart of Malta with silent streets.', img_url: '/images/how_london.webp' },
      { name: 'Mellieha', desc: 'Northern village known for sandy beaches and Popeye Village.', img_url: '/images/coastal_beach.webp' }
    ]
  }
]

async function seed() {
  console.log('Seeding European Guides...')
  
  for (const c of COUNTRIES) {
    console.log(`Upserting country: ${c.name} (${c.id})`)
    
    // 1. Upsert country guide record
    const { error: guideErr } = await supabase
      .from('country_guides')
      .upsert({
        id: c.id,
        name: c.name,
        desc: c.desc,
        tag: c.tag,
        hero_img: c.hero_img,
        is_featured: c.is_featured,
        capital: c.capital,
        currency: c.currency,
        language: c.language,
        time_zone: c.time_zone,
        best_time: c.best_time,
        emergency_police: c.emergency_police,
        emergency_ambulance: c.emergency_ambulance,
        emergency_embassy: c.emergency_embassy,
        experience_title: c.experience_title,
        experience_desc: c.experience_desc,
        experience_img: c.experience_img,
        sections_data: c.sections_data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })

    if (guideErr) {
      console.log(`Error upserting country guide for ${c.name}:`, guideErr)
      continue
    }

    // 2. Insert default cards (About, Snapshot, Best Time)
    await supabase.from('country_guide_cards').delete().eq('country_id', c.id)
    const { error: cardsErr } = await supabase
      .from('country_guide_cards')
      .insert([
        {
          country_id: c.id,
          icon_name: 'about',
          title: 'About',
          desc: c.desc,
          display_order: 0
        },
        {
          country_id: c.id,
          icon_name: 'snapshot',
          title: 'Travel Snapshot',
          desc: `Experience the unique lifestyle of ${c.name}. Immerse yourself in the culinary sights, historic relics, and warm local hospitality.`,
          display_order: 1
        },
        {
          country_id: c.id,
          icon_name: 'clock',
          title: 'Best Time to Visit',
          desc: `The optimal months to visit ${c.name} are ${c.best_time}. During these months you will experience pleasant weather and high cultural activity.`,
          display_order: 2
        }
      ])
    if (cardsErr) console.log(`Error inserting cards for ${c.name}:`, cardsErr)

    // 3. Insert default items (connectivity & etiquette)
    await supabase.from('country_guide_items').delete().eq('country_id', c.id)
    const { error: itemsErr } = await supabase
      .from('country_guide_items')
      .insert([
        {
          country_id: c.id,
          type: 'connectivity',
          title: 'SIM & Data Plans',
          desc: c.sections_data.simConnectivity || 'Local SIM cards are available at the airport or eSIM through popular travel apps.',
          display_order: 0
        },
        {
          country_id: c.id,
          type: 'connectivity',
          title: 'Transport Apps',
          desc: `Common transport applications like ${c.sections_data.essentialApps.join(', ')} are highly recommended.`,
          display_order: 1
        },
        ...c.sections_data.conductGuide.map((item, idx) => ({
          country_id: c.id,
          type: 'etiquette',
          title: item.label,
          desc: item.desc,
          display_order: idx
        }))
      ])
    if (itemsErr) console.log(`Error inserting items for ${c.name}:`, itemsErr)

    // 4. Insert cities
    await supabase.from('country_guide_cities').delete().eq('country_id', c.id)
    const { error: citiesErr } = await supabase
      .from('country_guide_cities')
      .insert(c.cities.map((city, idx) => ({
        country_id: c.id,
        name: city.name,
        desc: city.desc,
        img_url: city.img_url,
        display_order: idx
      })))
    if (citiesErr) console.log(`Error inserting cities for ${c.name}:`, citiesErr)
  }

  console.log('Seeding completed successfully!')
}

seed()
