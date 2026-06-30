'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface ExploreSettings {
  hero_tagline: string
  hero_title: string
  quote_text: string
  quote_author: string
  hero_bg_image: string
}

interface CountryGuide {
  id: string
  name: string
  desc: string
  tag: string
  hero_img: string
  is_featured: boolean
  capital: string
  currency: string
  language: string
  time_zone: string
  best_time: string
  emergency_police: string
  emergency_ambulance: string
  emergency_embassy: string
  experience_title: string
  experience_desc: string
  experience_img: string
}

interface GuideDetails {
  cards: { title: string; desc: string; icon_name: string }[]
  connectivity: { title: string; desc: string }[]
  etiquette: { title: string; desc: string }[]
  cities: { name: string; desc: string; img_url: string }[]
}

export default function AdminExplorePage() {
  const [activeTab, setActiveTab] = useState<'settings' | 'guides'>('settings')

  // Tab 1 Explore Settings States
  const [settings, setSettings] = useState<ExploreSettings>({
    hero_tagline: '',
    hero_title: '',
    quote_text: '',
    quote_author: '',
    hero_bg_image: ''
  })
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [settingsMessage, setSettingsMessage] = useState({ text: '', type: '' })

  // Tab 2 Guides States
  const [guides, setGuides] = useState<CountryGuide[]>([])
  const [isLoadingGuides, setIsLoadingGuides] = useState(false)

  // Add/Edit Guide General Modal
  const [isGeneralModalOpen, setIsGeneralModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [generalModalTab, setGeneralModalTab] = useState<'base' | 'overview' | 'entry' | 'safety' | 'culture' | 'logistics' | 'experiences'>('base')
  const [currentGuide, setCurrentGuide] = useState<Partial<CountryGuide & { sections_data?: any }>>({
    id: '',
    name: '',
    desc: '',
    tag: 'Culture',
    hero_img: '/images/guide_hero.webp',
    is_featured: false,
    capital: '',
    currency: '',
    language: '',
    time_zone: '',
    best_time: '',
    emergency_police: '',
    emergency_ambulance: '',
    emergency_embassy: '',
    experience_title: '',
    experience_desc: '',
    experience_img: '/images/guide_hero.webp',
    sections_data: {}
  })
  const [generalModalError, setGeneralModalError] = useState('')
  const [isSavingGeneral, setIsSavingGeneral] = useState(false)

  // CSV Import States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importParsedRows, setImportParsedRows] = useState<any[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState('')
  const [importError, setImportError] = useState('')

  // Nested Details Editor Modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [activeDetailsGuideId, setActiveDetailsGuideId] = useState('')
  const [details, setDetails] = useState<GuideDetails>({
    cards: [],
    connectivity: [],
    etiquette: [],
    cities: []
  })
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isSavingDetails, setIsSavingDetails] = useState(false)
  const [detailsModalError, setDetailsModalError] = useState('')

  // Upload States
  const [uploadingHeroImg, setUploadingHeroImg] = useState(false)
  const [uploadingExpImg, setUploadingExpImg] = useState(false)
  const [uploadingCityImg, setUploadingCityImg] = useState<Record<number, boolean>>({})

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'hero_img' | 'experience_img' | 'city_img',
    cityIdx?: number
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (type === 'hero_img') setUploadingHeroImg(true)
    else if (type === 'experience_img') setUploadingExpImg(true)
    else if (type === 'city_img' && cityIdx !== undefined) {
      setUploadingCityImg(prev => ({ ...prev, [cityIdx]: true }))
    }

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `explore-${type}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const filePath = fileName

      const { error: uploadError } = await supabase.storage
        .from('carousel')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('carousel')
        .getPublicUrl(filePath)

      if (type === 'hero_img') {
        setCurrentGuide(prev => ({ ...prev, hero_img: publicUrl }))
      } else if (type === 'experience_img') {
        setCurrentGuide(prev => ({ ...prev, experience_img: publicUrl }))
      } else if (type === 'city_img' && cityIdx !== undefined) {
        updateCityField(cityIdx, 'img_url', publicUrl)
      }
    } catch (error: any) {
      alert('Error uploading file: ' + error.message)
    } finally {
      if (type === 'hero_img') setUploadingHeroImg(false)
      else if (type === 'experience_img') setUploadingExpImg(false)
      else if (type === 'city_img' && cityIdx !== undefined) {
        setUploadingCityImg(prev => ({ ...prev, [cityIdx]: false }))
      }
    }
  }

  const renderImageUploader = (
    label: string,
    value: string,
    onUrlChange: (url: string) => void,
    onRemove: () => void,
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    isUploading: boolean
  ) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontWeight: '600', fontSize: '13px', color: 'var(--admin-muted)' }}>{label}</label>
        <div className="image-upload-section">
          {value ? (
            <div className="image-preview-box" style={{ backgroundImage: `url(${value})` }}>
              <button type="button" className="remove-preview-btn" onClick={onRemove}>
                &times;
              </button>
            </div>
          ) : (
            <div className="image-upload-options">
              <input
                type="text"
                placeholder="Paste image URL (e.g. /images/guide_france.webp)"
                className="image-upload-input"
                value={value}
                onChange={e => onUrlChange(e.target.value)}
              />
              <div className="image-upload-or">Or upload local file</div>
              <div className="file-input-wrapper">
                <button type="button" className="browse-btn">
                  Browse Image
                </button>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input-hidden"
                  onChange={onFileChange}
                />
                {isUploading && <div className="upload-spinner"></div>}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchSettings()
    fetchGuides()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/explore/settings', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data.settings) {
          setSettings(data.settings)
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err)
    }
  }

  const fetchGuides = async () => {
    setIsLoadingGuides(true)
    try {
      const res = await fetch('/api/admin/explore/guides', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data.guides) {
          setGuides(data.guides)
        }
      }
    } catch (err) {
      console.error('Error fetching guides:', err)
    } finally {
      setIsLoadingGuides(false)
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingSettings(true)
    setSettingsMessage({ text: '', type: '' })

    try {
      const res = await fetch('/api/admin/explore/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      const data = await res.json()
      if (res.ok) {
        setSettingsMessage({ text: 'Settings saved successfully!', type: 'success' })
        setSettings(data.settings)
      } else {
        setSettingsMessage({ text: data.error || 'Failed to save settings.', type: 'danger' })
      }
    } catch (err) {
      setSettingsMessage({ text: 'A network error occurred.', type: 'danger' })
    } finally {
      setIsSavingSettings(false)
    }
  }

  const handleOpenAddGeneralModal = () => {
    setCurrentGuide({
      id: '',
      name: '',
      desc: '',
      tag: 'Culture',
      hero_img: '/images/guide_hero.webp',
      is_featured: false,
      capital: '',
      currency: '',
      language: '',
      time_zone: '',
      best_time: '',
      emergency_police: '112',
      emergency_ambulance: '112',
      emergency_embassy: 'Contact your local embassy.',
      experience_title: 'Sightseeing Tour',
      experience_desc: 'Discover local highlights with a guided exploration.',
      experience_img: '/images/guide_hero.webp',
      sections_data: {}
    })
    setIsEditMode(false)
    setGeneralModalError('')
    setGeneralModalTab('base')
    setIsGeneralModalOpen(true)
  }

  const handleOpenEditGeneralModal = (guide: CountryGuide) => {
    setCurrentGuide({
      ...guide,
      sections_data: (guide as any).sections_data || {}
    })
    setIsEditMode(true)
    setGeneralModalError('')
    setGeneralModalTab('base')
    setIsGeneralModalOpen(true)
  }

  // CSV Parsing and Processing Functions
  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/)
    if (lines.length === 0) return []
    
    const headers = parseCSVLine(lines[0])
    const results: any[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      const values = parseCSVLine(line)
      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      results.push(row)
    }
    return results
  }

  const parseCSVLine = (line: string) => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result.map(v => {
      if (v.startsWith('"') && v.endsWith('"')) {
        return v.substring(1, v.length - 1)
      }
      return v
    })
  }

  const mapCsvRowToGuide = (row: any): Partial<CountryGuide & { sections_data?: any }> => {
    const guide: any = {
      id: row.id || '',
      name: row.name || '',
      desc: row.desc || '',
      tag: row.tag || 'Culture',
      hero_img: row.hero_img || '/images/guide_hero.webp',
      is_featured: row.is_featured === 'true' || row.is_featured === '1',
      capital: row.capital || '',
      currency: row.currency || '',
      language: row.language || '',
      time_zone: row.time_zone || '',
      best_time: row.best_time || '',
      emergency_police: row.emergency_police || '112',
      emergency_ambulance: row.emergency_ambulance || '112',
      emergency_embassy: row.emergency_embassy || '',
      experience_title: row.experience_title || '',
      experience_desc: row.experience_desc || '',
      experience_img: row.experience_img || '/images/guide_hero.webp',
      sections_data: {}
    }

    const parseList = (str: string) => str ? str.split(';').map(s => s.trim()) : []
    const parseJson = (str: string, fallback: any) => {
      try {
        return str ? JSON.parse(str) : fallback
      } catch {
        return fallback
      }
    }

    guide.sections_data = {
      flagEmoji: row.flagEmoji || '',
      heroSubtitle: row.heroSubtitle || '',
      averageTemp: row.averageTemp || '',
      visaInfo: row.visaInfo || '',
      countryIntro: row.countryIntro || '',
      overviewImg: row.overviewImg || '',
      bestTimePeak: {
        months: row.bestTimePeak_months || '',
        temp: row.bestTimePeak_temp || '',
        daylight: row.bestTimePeak_daylight || '',
        ideal: row.bestTimePeak_ideal || ''
      },
      bestTimeShoulder: {
        months: row.bestTimeShoulder_months || '',
        temp: row.bestTimeShoulder_temp || '',
        daylight: row.bestTimeShoulder_daylight || '',
        ideal: row.bestTimeShoulder_ideal || ''
      },
      bestTimeOffPeak: {
        months: row.bestTimeOffPeak_months || '',
        temp: row.bestTimeOffPeak_temp || '',
        daylight: row.bestTimeOffPeak_daylight || '',
        ideal: row.bestTimeOffPeak_ideal || ''
      },
      holidaysSpring: row.holidaysSpring || '',
      holidaysSummer: row.holidaysSummer || '',
      holidaysAutumn: row.holidaysAutumn || '',
      holidaysWinter: row.holidaysWinter || '',
      visaFreeRegions: parseList(row.visaFreeRegions),
      visaFreeConditions: parseList(row.visaFreeConditions),
      visaRequiredWho: parseList(row.visaRequiredWho),
      visaRequiredHow: parseList(row.visaRequiredHow),
      customsTobacco: row.customsTobacco || '',
      customsAlcohol: row.customsAlcohol || '',
      customsGifts: row.customsGifts || '',
      customsCash: row.customsCash || '',
      vaccinesTitle: row.vaccinesTitle || '',
      vaccinesDesc: row.vaccinesDesc || '',
      insuranceTitle: row.insuranceTitle || '',
      insuranceDesc: row.insuranceDesc || '',
      safetyImg: row.safetyImg || '',
      healthTipsTitle: row.healthTipsTitle || '',
      healthTipsDesc: row.healthTipsDesc || '',
      safetyAssistanceTitle: row.safetyAssistanceTitle || '',
      safetyAssistanceDesc: row.safetyAssistanceDesc || '',
      soloFemaleTitle: row.soloFemaleTitle || '',
      soloFemaleDesc: row.soloFemaleDesc || '',
      soloFemaleTags: parseList(row.soloFemaleTags),
      cultureImg: row.cultureImg || '',
      cultureExperienceTitle: row.cultureExperienceTitle || '',
      cultureExperienceDesc: row.cultureExperienceDesc || '',
      cultureHighlight1Title: row.cultureHighlight1Title || '',
      cultureHighlight1Desc: row.cultureHighlight1Desc || '',
      cultureHighlight2Title: row.cultureHighlight2Title || '',
      cultureHighlight2Desc: row.cultureHighlight2Desc || '',
      conductGuide: parseJson(row.conductGuide, null) || [
        { label: 'Tipping', desc: row.conductGuide_tipping || '10% is standard in restaurants.' },
        { label: 'Religion', desc: row.conductGuide_religion || 'Respectful attire when visiting temples.' },
        { label: 'Punctuality', desc: row.conductGuide_punctuality || 'Be on time for formal guides.' },
        { label: 'Environment', desc: row.conductGuide_environment || 'Protect nature and use marked paths.' }
      ],
      usefulPhrases: parseJson(row.usefulPhrases, null) || [
        { phrase: row.usefulPhrases_phrase1 || 'Hello', translation: row.usefulPhrases_trans1 || 'Greeting' },
        { phrase: row.usefulPhrases_phrase2 || 'Thank you', translation: row.usefulPhrases_trans2 || 'Gratitude' }
      ],
      logisticsImg: row.logisticsImg || '',
      logisticsCurrencyDesc: row.logisticsCurrencyDesc || '',
      drivingRulesTags: parseList(row.drivingRulesTags),
      transportTags: parseList(row.transportTags),
      plugType: row.plugType || '',
      voltage: row.voltage || '',
      essentialApps: parseList(row.essentialApps),
      experiencesImg: row.experiencesImg || '',
      mustTryFoods: parseList(row.mustTryFoods),
      alcoholLaws: row.alcoholLaws || '',
      localRules: parseJson(row.localRules, null) || [
        { emoji: row.localRules_rule1_emoji || '🚭', title: row.localRules_rule1_title || 'SMOKING BAN', desc: row.localRules_rule1_desc || 'Strictly prohibited in enclosed spaces.' },
        { emoji: row.localRules_rule2_emoji || '🛍️', title: row.localRules_rule2_title || 'SHOPPING BAGS', desc: row.localRules_rule2_desc || 'Reusable bags are standard.' },
        { emoji: row.localRules_rule3_emoji || '⚖️', title: row.localRules_rule3_title || 'LOCAL FINES', desc: row.localRules_rule3_desc || 'Heavy fines apply for littering.' }
      ],
      videoTitle: row.videoTitle || '',
      videoUrl: row.videoUrl || '',
      videoThumbnail: row.videoThumbnail || '',
      videoDesc: row.videoDesc || ''
    }

    return guide
  }

  const downloadSampleCSV = () => {
    const headers = [
      'id', 'name', 'desc', 'tag', 'hero_img', 'is_featured', 'capital', 'currency', 'language', 'time_zone', 'best_time',
      'emergency_police', 'emergency_ambulance', 'emergency_embassy', 'experience_title', 'experience_desc', 'experience_img',
      'flagEmoji', 'heroSubtitle', 'averageTemp', 'visaInfo', 'countryIntro', 'overviewImg',
      'bestTimePeak_months', 'bestTimePeak_temp', 'bestTimePeak_daylight', 'bestTimePeak_ideal',
      'bestTimeShoulder_months', 'bestTimeShoulder_temp', 'bestTimeShoulder_daylight', 'bestTimeShoulder_ideal',
      'bestTimeOffPeak_months', 'bestTimeOffPeak_temp', 'bestTimeOffPeak_daylight', 'bestTimeOffPeak_ideal',
      'holidaysSpring', 'holidaysSummer', 'holidaysAutumn', 'holidaysWinter',
      'visaFreeRegions', 'visaFreeConditions', 'visaRequiredWho', 'visaRequiredHow',
      'customsTobacco', 'customsAlcohol', 'customsGifts', 'customsCash',
      'vaccinesTitle', 'vaccinesDesc', 'insuranceTitle', 'insuranceDesc',
      'safetyImg', 'healthTipsTitle', 'healthTipsDesc', 'safetyAssistanceTitle', 'safetyAssistanceDesc',
      'soloFemaleTitle', 'soloFemaleDesc', 'soloFemaleTags',
      'cultureImg', 'cultureExperienceTitle', 'cultureExperienceDesc',
      'cultureHighlight1Title', 'cultureHighlight1Desc', 'cultureHighlight2Title', 'cultureHighlight2Desc',
      'conductGuide_tipping', 'conductGuide_religion', 'conductGuide_punctuality', 'conductGuide_environment',
      'usefulPhrases_phrase1', 'usefulPhrases_trans1', 'usefulPhrases_phrase2', 'usefulPhrases_trans2',
      'logisticsImg', 'logisticsCurrencyDesc', 'drivingRulesTags', 'transportTags', 'plugType', 'voltage', 'essentialApps',
      'experiencesImg', 'mustTryFoods', 'alcoholLaws',
      'localRules_rule1_emoji', 'localRules_rule1_title', 'localRules_rule1_desc',
      'localRules_rule2_emoji', 'localRules_rule2_title', 'localRules_rule2_desc',
      'localRules_rule3_emoji', 'localRules_rule3_title', 'localRules_rule3_desc',
      'videoTitle', 'videoUrl', 'videoThumbnail', 'videoDesc'
    ]

    const spainRow = [
      'spain', 'Spain', 'A vibrant Mediterranean destination of culture, history, and sun.', 'Culture', '/images/explore_spain.webp', 'true', 'Madrid', 'Euro (€)', 'Spanish', 'GMT+1', 'May - Sept',
      '112', '112', 'Contact local embassy', 'Flamenco Dancing', 'Enjoy a traditional live show in Seville.', '/images/spain_flamenco.webp',
      '🇪🇸', 'Land of Passion & Sun', '14°C - 28°C', 'Visa-free for 90 days', 'Welcome to Spain. Explore tapas, beaches, and historic landmarks.', '/images/spain_intro.webp',
      'June - August', '22°C - 32°C', '14 - 16 hours', 'Beaches, nightlife, outdoor festivals',
      'April - May / Oct', '15°C - 22°C', '11 - 13 hours', 'City sight-seeing, hiking, travel routing',
      'Nov - Feb', '8°C - 15°C', '9 - 10 hours', 'Skiing, empty museums, indoor experiences',
      'Easter Monday', 'Assumption Day (Aug 15)', 'Hispanic Day (Oct 12)', 'Christmas Day',
      'Schengen Area Countries; USA; Canada; UK', 'Tourism or business under 90 days; Valid passport', 'Non-Schengen passport holders from visa-required nations', 'Apply at nearest Spanish consulate with flight bookings',
      '200 Cigarettes', '1L Spirits', 'Gifts value to €430', 'Declare over €10,000',
      'Routine Vaccinations', 'Tetanus, MMR, Hepatitis A suggested.', 'Travel Medical Insurance', 'Highly advised for medical emergencies.',
      '/images/spain_safety.webp', 'Drink bottled water in rural areas', 'Tap water is generally safe in cities.', 'Tourist Police S.A.T.E', 'Available in major tourist cities for assistance.',
      'Extremely Safe & Welcoming', 'Generally very safe for solo female travellers with standard vigilance.', 'SAFE; HOSPITABLE; WELL-LIT',
      '/images/spain_culture.webp', 'Tapas Crawl (Ir de Tapas)', 'Order single plates with drinks and move between bars.',
      'Tapas Sharing Culture', 'Food is a social activity; sharing is normal.', 'Late Dining Hours', 'Dinner rarely starts before 9:00 PM.',
      '10% is standard in tourist spots', 'Respectful behavior in cathedrals', 'Arrive on time for dining reservations', 'Do not litter in natural reserves',
      'Hola', 'Hello', 'Gracias', 'Thank you',
      '/images/spain_logistics.webp', 'Contactless payments accepted everywhere', 'Tolls, speed limits', 'High-speed Train; Local Bus; Taxi', 'Type G plug', '230V / 50Hz', 'Renfe App; Cabify; Google Maps',
      '/images/spain_food.webp', 'Paella Valenciana; Jamon Iberico; Churros', 'Alcohol is only sold to ages 18 and older.',
      '🚭', 'NO SMOKING', 'Smoking is banned in all indoor public spaces.',
      '🛍️', 'PLASTIC BAG FEE', 'Small charge applies to supermarket bags.',
      '⚖️', 'NO ALCOHOL ON STREETS', 'Drinking in open public spaces is banned in some cities.',
      'Perfect 10 Days Spain Itinerary', 'https://youtube.com', '/images/spain_video.webp', 'A visual tour of Madrid, Seville, Barcelona, and intermediate cities.'
    ]

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), spainRow.map(v => `"${v.replace(/"/g, '""')}"`).join(',')].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "snaptrip_country_guides_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      try {
        const parsed = parseCSV(text)
        setImportParsedRows(parsed)
        setImportProgress(`Loaded CSV with ${parsed.length} rows. Click "Start Import" to verify and save them.`)
      } catch (err) {
        setImportError('Failed to parse CSV file. Ensure it is comma separated.')
      }
    }
    reader.readAsText(file)
  }

  const handleStartImport = async () => {
    setIsImporting(true)
    setImportError('')
    
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < importParsedRows.length; i++) {
      const rawRow = importParsedRows[i]
      const guideData = mapCsvRowToGuide(rawRow)

      if (!guideData.id || !guideData.name) {
        errorCount++
        setImportProgress(p => p + `\nRow ${i + 1} skipped (Missing ID or Name).`)
        continue
      }

      setImportProgress(`Importing ${guideData.name} (${i + 1}/${importParsedRows.length})...`)

      try {
        const exists = guides.some(g => g.id === guideData.id)
        const method = exists ? 'PUT' : 'POST'

        const res = await fetch('/api/admin/explore/guides', {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(guideData)
        })

        if (res.ok) {
          successCount++
        } else {
          const errJson = await res.json()
          errorCount++
          console.error(`Failed to import ${guideData.name}:`, errJson.error)
        }
      } catch (err) {
        errorCount++
        console.error(`Network error importing ${guideData.name}:`, err)
      }
    }

    setIsImporting(false)
    setImportProgress(`Import completed! Successfully imported/updated ${successCount} guides. Errors: ${errorCount}.`)
    fetchGuides()
  }

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingGeneral(true)
    setGeneralModalError('')

    try {
      const method = isEditMode ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/explore/guides', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentGuide)
      })

      const data = await res.json()
      if (res.ok) {
        setIsGeneralModalOpen(false)
        fetchGuides()
      } else {
        setGeneralModalError(data.error || 'Failed to save country guide.')
      }
    } catch (err) {
      setGeneralModalError('A network error occurred.')
    } finally {
      setIsSavingGeneral(false)
    }
  }

  const handleDeleteGuide = async (id: string) => {
    if (!confirm('Are you sure you want to delete this country guide? This will also delete all its cities, etiquette guidelines, and cards.')) return

    try {
      const res = await fetch(`/api/admin/explore/guides?id=${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchGuides()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete guide.')
      }
    } catch (err) {
      alert('A network error occurred.')
    }
  }

  const handleToggleFeatured = async (guide: CountryGuide) => {
    try {
      const updated = { ...guide, is_featured: !guide.is_featured }
      const res = await fetch('/api/admin/explore/guides', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      })
      if (res.ok) {
        fetchGuides()
      }
    } catch (err) {
      console.error('Error toggling featured state:', err)
    }
  }

  // Details Modal Loader
  const handleOpenDetailsModal = async (countryId: string) => {
    setActiveDetailsGuideId(countryId)
    setDetailsModalError('')
    setIsLoadingDetails(true)
    setIsDetailsModalOpen(true)

    try {
      const res = await fetch(`/api/admin/explore/guides/details?country_id=${countryId}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setDetails({
          cards: data.cards || [],
          connectivity: data.connectivity || [],
          etiquette: data.etiquette || [],
          cities: data.cities || []
        })
      }
    } catch (err) {
      setDetailsModalError('Failed to load sub-details.')
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingDetails(true)
    setDetailsModalError('')

    try {
      const res = await fetch('/api/admin/explore/guides/details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country_id: activeDetailsGuideId,
          ...details
        })
      })

      if (res.ok) {
        setIsDetailsModalOpen(false)
      } else {
        const data = await res.json()
        setDetailsModalError(data.error || 'Failed to save details.')
      }
    } catch (err) {
      setDetailsModalError('A network error occurred.')
    } finally {
      setIsSavingDetails(false)
    }
  }

  // Nested Child Updaters
  const updateCardField = (idx: number, field: string, val: string) => {
    const updated = [...details.cards]
    updated[idx] = { ...updated[idx], [field]: val }
    setDetails({ ...details, cards: updated })
  }

  const addDetailItem = (type: 'connectivity' | 'etiquette') => {
    const updated = [...details[type]]
    updated.push({ title: '', desc: '' })
    setDetails({ ...details, [type]: updated })
  }

  const updateItemField = (type: 'connectivity' | 'etiquette', idx: number, field: string, val: string) => {
    const updated = [...details[type]]
    updated[idx] = { ...updated[idx], [field]: val }
    setDetails({ ...details, [type]: updated })
  }

  const removeDetailItem = (type: 'connectivity' | 'etiquette', idx: number) => {
    const updated = [...details[type]]
    updated.splice(idx, 1)
    setDetails({ ...details, [type]: updated })
  }

  const addCity = () => {
    const updated = [...details.cities]
    updated.push({ name: '', desc: '', img_url: '/images/hero_city.webp' })
    setDetails({ ...details, cities: updated })
  }

  const updateCityField = (idx: number, field: string, val: string) => {
    const updated = [...details.cities]
    updated[idx] = { ...updated[idx], [field]: val }
    setDetails({ ...details, cities: updated })
  }

  const removeCity = (idx: number) => {
    const updated = [...details.cities]
    updated.splice(idx, 1)
    setDetails({ ...details, cities: updated })
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Submenu Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('settings')}
          className={`admin-button ${activeTab === 'settings' ? '' : 'outline'}`}
          style={{ padding: '10px 20px', borderRadius: '10px' }}
        >
          Explore Headers & Quotes
        </button>
        <button
          onClick={() => setActiveTab('guides')}
          className={`admin-button ${activeTab === 'guides' ? '' : 'outline'}`}
          style={{ padding: '10px 20px', borderRadius: '10px' }}
        >
          Country Guides List
        </button>
      </div>

      {/* Tab 1: Headers & Quotes Settings */}
      {activeTab === 'settings' && (
        <div className="admin-card">
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Explore Page Settings</h3>

          {settingsMessage.text && (
            <div className={`badge ${settingsMessage.type}`} style={{ display: 'block', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px' }}>
              {settingsMessage.text}
            </div>
          )}

          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: '600', fontSize: '14px', color: 'var(--admin-muted)' }}>Hero Tagline</label>
                <input
                  type="text"
                  value={settings.hero_tagline}
                  onChange={e => setSettings({ ...settings, hero_tagline: e.target.value })}
                  required
                  style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: '600', fontSize: '14px', color: 'var(--admin-muted)' }}>Hero Title</label>
                <input
                  type="text"
                  value={settings.hero_title}
                  onChange={e => setSettings({ ...settings, hero_title: e.target.value })}
                  required
                  style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '600', fontSize: '14px', color: 'var(--admin-muted)' }}>Marcel Proust Quote Text</label>
              <textarea
                value={settings.quote_text}
                onChange={e => setSettings({ ...settings, quote_text: e.target.value })}
                rows={3}
                required
                style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '600', fontSize: '14px', color: 'var(--admin-muted)' }}>Quote Author Signature</label>
              <input
                type="text"
                value={settings.quote_author}
                onChange={e => setSettings({ ...settings, quote_author: e.target.value })}
                required
                style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '600', fontSize: '14px', color: 'var(--admin-muted)' }}>Hero Background Image</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <input
                  type="text"
                  value={settings.hero_bg_image || ''}
                  onChange={e => setSettings({ ...settings, hero_bg_image: e.target.value })}
                  placeholder="e.g. /images/guide_hero.webp"
                  style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', flexGrow: 1, boxSizing: 'border-box' }}
                />
                <div style={{ position: 'relative' }}>
                  <input
                    type="file"
                    accept="image/*"
                    id="explore-hero-image-file"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setUploadingHeroImg(true)
                      try {
                        const fileExt = file.name.split('.').pop()
                        const fileName = `explore-hero-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
                        const { error } = await supabase.storage.from('carousel').upload(fileName, file)
                        if (error) throw error
                        const { data: { publicUrl } } = supabase.storage.from('carousel').getPublicUrl(fileName)
                        setSettings({ ...settings, hero_bg_image: publicUrl })
                      } catch (err: any) {
                        alert('Upload failed: ' + err.message)
                      } finally {
                        setUploadingHeroImg(false)
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="explore-hero-image-file"
                    className="admin-button outline"
                    style={{ padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', display: 'inline-block', fontSize: '14px', margin: 0 }}
                  >
                    {uploadingHeroImg ? 'Uploading...' : 'Upload Image'}
                  </label>
                </div>
              </div>
              {settings.hero_bg_image && (
                <div style={{ marginTop: '8px', border: '1px dashed var(--admin-border)', padding: '8px', borderRadius: '12px', display: 'inline-block', background: '#fff' }}>
                  <img src={settings.hero_bg_image} alt="Hero Preview" style={{ maxHeight: '100px', borderRadius: '8px', display: 'block' }} />
                </div>
              )}
            </div>

            <button type="submit" disabled={isSavingSettings} className="admin-button" style={{ alignSelf: 'flex-start' }}>
              {isSavingSettings ? 'Saving Settings...' : 'Save Settings'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Country Guides List */}
      {activeTab === 'guides' && (
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Country Guides</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="admin-button outline" onClick={() => {
                setImportParsedRows([])
                setImportProgress('')
                setImportError('')
                setIsImportModalOpen(true)
              }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Import CSV
              </button>
              <button className="admin-button" onClick={handleOpenAddGeneralModal} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add New Country
              </button>
            </div>
          </div>

          {isLoadingGuides ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-muted)' }}>Loading country guides...</div>
          ) : guides.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-muted)' }}>No guides found. Click Add New Country above to start!</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Country ID</th>
                  <th>Name</th>
                  <th>Tag</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {guides.map((guide) => (
                  <tr key={guide.id}>
                    <td><code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '13px' }}>{guide.id}</code></td>
                    <td style={{ fontWeight: '600' }}>{guide.name}</td>
                    <td><span className="badge warning">{guide.tag}</span></td>
                    <td>
                      <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={guide.is_featured}
                          onChange={() => handleToggleFeatured(guide)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                      </label>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="admin-button outline" onClick={() => handleOpenEditGeneralModal(guide)} style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '8px' }}>
                          Edit Base
                        </button>
                        <button className="admin-button outline" onClick={() => handleOpenDetailsModal(guide.id)} style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '8px', color: 'var(--admin-accent)' }}>
                          Edit Sub-Sections
                        </button>
                        <button className="admin-button outline" onClick={() => handleDeleteGuide(guide.id)} style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '8px', color: 'var(--admin-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal 1: Add/Edit Base General Info */}
      {/* Modal 1: Add/Edit Base General Info */}
      {isGeneralModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto' }}>
          <div className="admin-card" style={{ width: '800px', padding: '32px', margin: '40px auto', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '85vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{isEditMode ? 'Edit Country Guide' : 'Create Country Guide'}</span>
              <span style={{ fontSize: '13px', color: 'var(--admin-muted)', fontWeight: 'normal' }}>ID: <code>{currentGuide.id || 'new'}</code></span>
            </h3>

            {generalModalError && (
              <div className="badge danger" style={{ display: 'block', padding: '10px 14px', borderRadius: '8px' }}>
                {generalModalError}
              </div>
            )}

            {/* Modal Tab Navigation */}
            <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '10px', overflowX: 'auto' }}>
              {[
                { id: 'base', label: '1. General' },
                { id: 'overview', label: '2. Overview Tab' },
                { id: 'entry', label: '3. Entry Tab' },
                { id: 'safety', label: '4. Safety Tab' },
                { id: 'culture', label: '5. Culture Tab' },
                { id: 'logistics', label: '6. Logistics Tab' },
                { id: 'experiences', label: '7. Experiences Tab' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setGeneralModalTab(tab.id as any)}
                  className={`admin-button ${generalModalTab === tab.id ? '' : 'outline'}`}
                  style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px', whiteSpace: 'nowrap' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveGeneral} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* helper method to update nested JSON */}
              {(() => {
                const sections = currentGuide.sections_data || {}
                const updateSec = (key: string, val: any) => {
                  setCurrentGuide(prev => ({
                    ...prev,
                    sections_data: {
                      ...(prev.sections_data || {}),
                      [key]: val
                    }
                  }))
                }

                const addBucketItem = () => {
                  const list = [...(sections.bucketList || [])]
                  list.push({ title: '', desc: '', tag: 'LANDMARK', type: 'landmark', img: '/images/hero_city.webp' })
                  updateSec('bucketList', list)
                }

                const updateBucketItem = (idx: number, field: string, value: any) => {
                  const list = [...(sections.bucketList || [])]
                  list[idx] = { ...list[idx], [field]: value }
                  updateSec('bucketList', list)
                }

                const removeBucketItem = (idx: number) => {
                  const list = [...(sections.bucketList || [])]
                  list.splice(idx, 1)
                  updateSec('bucketList', list)
                }

                const addAccomItem = () => {
                  const list = [...(sections.uniqueAccommodations || [])]
                  list.push({ title: '', desc: '', img: '/images/how_london.webp' })
                  updateSec('uniqueAccommodations', list)
                }

                const updateAccomItem = (idx: number, field: string, value: any) => {
                  const list = [...(sections.uniqueAccommodations || [])]
                  list[idx] = { ...list[idx], [field]: value }
                  updateSec('uniqueAccommodations', list)
                }

                const removeAccomItem = (idx: number) => {
                  const list = [...(sections.uniqueAccommodations || [])]
                  list.splice(idx, 1)
                  updateSec('uniqueAccommodations', list)
                }

                return (
                  <div>
                    {/* TAB 1: Base General Info */}
                    {generalModalTab === 'base' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontWeight: '600', fontSize: '13px', color: 'var(--admin-muted)' }}>Country ID (unique slug)</label>
                            <input
                              type="text"
                              value={currentGuide.id || ''}
                              onChange={e => setCurrentGuide({ ...currentGuide, id: e.target.value })}
                              disabled={isEditMode}
                              placeholder="e.g. spain"
                              required
                              style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', width: '100%', boxSizing: 'border-box' }}
                            />
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontWeight: '600', fontSize: '13px', color: 'var(--admin-muted)' }}>Country Name</label>
                            <input
                              type="text"
                              value={currentGuide.name || ''}
                              onChange={e => setCurrentGuide({ ...currentGuide, name: e.target.value })}
                              placeholder="e.g. Spain"
                              required
                              style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', width: '100%', boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontWeight: '600', fontSize: '13px', color: 'var(--admin-muted)' }}>Editorial Tag</label>
                            <select
                              value={currentGuide.tag || 'Culture'}
                              onChange={e => setCurrentGuide({ ...currentGuide, tag: e.target.value })}
                              style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', height: '42px', width: '100%', boxSizing: 'border-box' }}
                            >
                              <option value="Culture">Culture</option>
                              <option value="Editorial">Editorial</option>
                              <option value="Lifestyle">Lifestyle</option>
                              <option value="Vintage">Vintage</option>
                            </select>
                          </div>

                          {renderImageUploader(
                            'Featured Image Path',
                            currentGuide.hero_img || '',
                            url => setCurrentGuide({ ...currentGuide, hero_img: url }),
                            () => setCurrentGuide({ ...currentGuide, hero_img: '' }),
                            e => handleFileUpload(e, 'hero_img'),
                            uploadingHeroImg
                          )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontWeight: '600', fontSize: '13px', color: 'var(--admin-muted)' }}>Overview Description</label>
                          <textarea
                            value={currentGuide.desc || ''}
                            onChange={e => setCurrentGuide({ ...currentGuide, desc: e.target.value })}
                            rows={2}
                            required
                            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
                          />
                        </div>

                        <h4 style={{ fontSize: '14px', fontWeight: '700', borderBottom: '1px solid var(--admin-border)', paddingBottom: '6px', margin: '8px 0 4px 0' }}>Stats Snapshot</h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                          <input type="text" placeholder="Capital" value={currentGuide.capital || ''} onChange={e => setCurrentGuide({ ...currentGuide, capital: e.target.value })} required style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px' }} />
                          <input type="text" placeholder="Currency" value={currentGuide.currency || ''} onChange={e => setCurrentGuide({ ...currentGuide, currency: e.target.value })} required style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px' }} />
                          <input type="text" placeholder="Language" value={currentGuide.language || ''} onChange={e => setCurrentGuide({ ...currentGuide, language: e.target.value })} required style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <input type="text" placeholder="Time Zone" value={currentGuide.time_zone || ''} onChange={e => setCurrentGuide({ ...currentGuide, time_zone: e.target.value })} required style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px' }} />
                          <input type="text" placeholder="Best Time to Visit" value={currentGuide.best_time || ''} onChange={e => setCurrentGuide({ ...currentGuide, best_time: e.target.value })} required style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px' }} />
                        </div>

                        <h4 style={{ fontSize: '14px', fontWeight: '700', borderBottom: '1px solid var(--admin-border)', paddingBottom: '6px', margin: '8px 0 4px 0' }}>Emergency & Safety</h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <input type="text" placeholder="Police Line" value={currentGuide.emergency_police || ''} onChange={e => setCurrentGuide({ ...currentGuide, emergency_police: e.target.value })} required style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px' }} />
                          <input type="text" placeholder="Ambulance Line" value={currentGuide.emergency_ambulance || ''} onChange={e => setCurrentGuide({ ...currentGuide, emergency_ambulance: e.target.value })} required style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px' }} />
                        </div>
                        <input type="text" placeholder="Embassy Guidance" value={currentGuide.emergency_embassy || ''} onChange={e => setCurrentGuide({ ...currentGuide, emergency_embassy: e.target.value })} required style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px', width: '100%', boxSizing: 'border-box' }} />

                        <h4 style={{ fontSize: '14px', fontWeight: '700', borderBottom: '1px solid var(--admin-border)', paddingBottom: '6px', margin: '8px 0 4px 0' }}>Traditional Experience Feature</h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontWeight: '600', fontSize: '13px', color: 'var(--admin-muted)' }}>Experience Title</label>
                            <input type="text" placeholder="Experience Title" value={currentGuide.experience_title || ''} onChange={e => setCurrentGuide({ ...currentGuide, experience_title: e.target.value })} required style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', width: '100%', boxSizing: 'border-box' }} />
                          </div>
                          {renderImageUploader(
                            'Experience Image Path',
                            currentGuide.experience_img || '',
                            url => setCurrentGuide({ ...currentGuide, experience_img: url }),
                            () => setCurrentGuide({ ...currentGuide, experience_img: '' }),
                            e => handleFileUpload(e, 'experience_img'),
                            uploadingExpImg
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                          <label style={{ fontWeight: '600', fontSize: '13px', color: 'var(--admin-muted)' }}>Experience Description</label>
                          <textarea placeholder="Experience Description" value={currentGuide.experience_desc || ''} onChange={e => setCurrentGuide({ ...currentGuide, experience_desc: e.target.value })} required rows={2} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
                        </div>
                      </div>
                    )}

                    {/* TAB 2: Overview Tab */}
                    {generalModalTab === 'overview' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontWeight: '600', fontSize: '13px', color: 'var(--admin-muted)' }}>1.1 Country Introduction Paragraph</label>
                          <textarea
                            value={sections.countryIntro || ''}
                            onChange={e => updateSec('countryIntro', e.target.value)}
                            rows={3}
                            placeholder="Detailed intro text..."
                            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
                          />
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontWeight: '600', fontSize: '13px', color: 'var(--admin-muted)' }}>Overview Segment Image URL</label>
                          <input
                            type="text"
                            value={sections.overviewImg || ''}
                            onChange={e => updateSec('overviewImg', e.target.value)}
                            placeholder="/images/explore_spain.webp"
                            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', fontSize: '14px', background: '#f8fafc', width: '100%', boxSizing: 'border-box' }}
                          />
                        </div>

                        <h4 style={{ fontSize: '14px', fontWeight: '700', borderBottom: '1px solid var(--admin-border)', paddingBottom: '6px', margin: '8px 0 4px 0' }}>1.2 Best Time Parameter Details</h4>
                        
                        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                          <strong>Peak Summer Season</strong>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                            <input type="text" placeholder="Months (e.g. Jun - Aug)" value={sections.bestTimePeak?.months || ''} onChange={e => updateSec('bestTimePeak', { ...(sections.bestTimePeak || {}), months: e.target.value })} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                            <input type="text" placeholder="Temp (e.g. 15°C - 20°C)" value={sections.bestTimePeak?.temp || ''} onChange={e => updateSec('bestTimePeak', { ...(sections.bestTimePeak || {}), temp: e.target.value })} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                            <input type="text" placeholder="Daylight (e.g. 17 - 19h)" value={sections.bestTimePeak?.daylight || ''} onChange={e => updateSec('bestTimePeak', { ...(sections.bestTimePeak || {}), daylight: e.target.value })} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                            <input type="text" placeholder="Ideal For" value={sections.bestTimePeak?.ideal || ''} onChange={e => updateSec('bestTimePeak', { ...(sections.bestTimePeak || {}), ideal: e.target.value })} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                          </div>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                          <strong>Shoulder Spring/Autumn Season</strong>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                            <input type="text" placeholder="Months" value={sections.bestTimeShoulder?.months || ''} onChange={e => updateSec('bestTimeShoulder', { ...(sections.bestTimeShoulder || {}), months: e.target.value })} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                            <input type="text" placeholder="Temp" value={sections.bestTimeShoulder?.temp || ''} onChange={e => updateSec('bestTimeShoulder', { ...(sections.bestTimeShoulder || {}), temp: e.target.value })} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                            <input type="text" placeholder="Daylight" value={sections.bestTimeShoulder?.daylight || ''} onChange={e => updateSec('bestTimeShoulder', { ...(sections.bestTimeShoulder || {}), daylight: e.target.value })} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                            <input type="text" placeholder="Ideal For" value={sections.bestTimeShoulder?.ideal || ''} onChange={e => updateSec('bestTimeShoulder', { ...(sections.bestTimeShoulder || {}), ideal: e.target.value })} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                          </div>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                          <strong>Off-Peak Winter Season</strong>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                            <input type="text" placeholder="Months" value={sections.bestTimeOffPeak?.months || ''} onChange={e => updateSec('bestTimeOffPeak', { ...(sections.bestTimeOffPeak || {}), months: e.target.value })} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                            <input type="text" placeholder="Temp" value={sections.bestTimeOffPeak?.temp || ''} onChange={e => updateSec('bestTimeOffPeak', { ...(sections.bestTimeOffPeak || {}), temp: e.target.value })} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                            <input type="text" placeholder="Daylight" value={sections.bestTimeOffPeak?.daylight || ''} onChange={e => updateSec('bestTimeOffPeak', { ...(sections.bestTimeOffPeak || {}), daylight: e.target.value })} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                            <input type="text" placeholder="Ideal For" value={sections.bestTimeOffPeak?.ideal || ''} onChange={e => updateSec('bestTimeOffPeak', { ...(sections.bestTimeOffPeak || {}), ideal: e.target.value })} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                          </div>
                        </div>

                        <h4 style={{ fontSize: '14px', fontWeight: '700', borderBottom: '1px solid var(--admin-border)', paddingBottom: '6px', margin: '8px 0 4px 0' }}>1.3 Public Holidays Lists</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <input type="text" placeholder="Spring Holidays" value={sections.holidaysSpring || ''} onChange={e => updateSec('holidaysSpring', e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px' }} />
                          <input type="text" placeholder="Summer Holidays" value={sections.holidaysSummer || ''} onChange={e => updateSec('holidaysSummer', e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px' }} />
                          <input type="text" placeholder="Autumn Holidays" value={sections.holidaysAutumn || ''} onChange={e => updateSec('holidaysAutumn', e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px' }} />
                          <input type="text" placeholder="Winter Holidays" value={sections.holidaysWinter || ''} onChange={e => updateSec('holidaysWinter', e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px' }} />
                        </div>

                        {/* 1.4 Bucket List Manager */}
                        <div style={{ marginTop: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>1.4 Bucket List Items</h4>
                            <button type="button" onClick={addBucketItem} style={{ background: 'none', border: 'none', color: 'var(--admin-accent)', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>+ Add Item</button>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--admin-border)', padding: '10px', borderRadius: '10px' }}>
                            {(sections.bucketList || []).length === 0 && <p style={{ fontSize: '12px', color: 'var(--admin-muted)', margin: 0, textAlign: 'center' }}>No bucket list items added yet. Fallback values will be used.</p>}
                            {(sections.bucketList || []).map((item: any, idx: number) => (
                              <div key={idx} style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid var(--admin-border)', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                  <input type="text" placeholder="Title" value={item.title || ''} onChange={e => updateBucketItem(idx, 'title', e.target.value)} required style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                                  <input type="text" placeholder="Tag (e.g. COAST)" value={item.tag || ''} onChange={e => updateBucketItem(idx, 'tag', e.target.value)} required style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                                  <select value={item.type || 'landmark'} onChange={e => updateBucketItem(idx, 'type', e.target.value)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }}>
                                    <option value="coast">Coast</option>
                                    <option value="landmark">Landmark</option>
                                    <option value="heritage">Heritage</option>
                                    <option value="culture">Culture</option>
                                    <option value="nature">Nature</option>
                                  </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                                  <input type="text" placeholder="Description" value={item.desc || ''} onChange={e => updateBucketItem(idx, 'desc', e.target.value)} required style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                                  <input type="text" placeholder="Image Path/URL" value={item.img || ''} onChange={e => updateBucketItem(idx, 'img', e.target.value)} required style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                                </div>
                                <button type="button" onClick={() => removeBucketItem(idx)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'none', border: 'none', color: 'var(--admin-danger)', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>×</button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 1.5 Unique Accommodation Manager */}
                        <div style={{ marginTop: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>1.5 Unique Accommodations</h4>
                            <button type="button" onClick={addAccomItem} style={{ background: 'none', border: 'none', color: 'var(--admin-accent)', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>+ Add Item</button>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--admin-border)', padding: '10px', borderRadius: '10px' }}>
                            {(sections.uniqueAccommodations || []).length === 0 && <p style={{ fontSize: '12px', color: 'var(--admin-muted)', margin: 0, textAlign: 'center' }}>No unique accommodations added yet. Fallback values will be used.</p>}
                            {(sections.uniqueAccommodations || []).map((item: any, idx: number) => (
                              <div key={idx} style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid var(--admin-border)', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                  <input type="text" placeholder="Title" value={item.title || ''} onChange={e => updateAccomItem(idx, 'title', e.target.value)} required style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                                  <input type="text" placeholder="Image Path/URL" value={item.img || ''} onChange={e => updateAccomItem(idx, 'img', e.target.value)} required style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                                </div>
                                <textarea placeholder="Description" value={item.desc || ''} onChange={e => updateAccomItem(idx, 'desc', e.target.value)} required rows={2} style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', resize: 'none', width: '100%', boxSizing: 'border-box' }} />
                                <button type="button" onClick={() => removeAccomItem(idx)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'none', border: 'none', color: 'var(--admin-danger)', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>×</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 3: Entry Requirements */}
                    {generalModalTab === 'entry' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--admin-muted)' }}>Flag Emoji</label>
                            <input type="text" placeholder="e.g. 🇪🇸" value={sections.flagEmoji || ''} onChange={e => updateSec('flagEmoji', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '13px', width: '100%', boxSizing: 'border-box' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--admin-muted)' }}>Hero Subtitle</label>
                            <input type="text" placeholder="e.g. Land of Passion" value={sections.heroSubtitle || ''} onChange={e => updateSec('heroSubtitle', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '13px', width: '100%', boxSizing: 'border-box' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--admin-muted)' }}>Average Temp (Hero)</label>
                            <input type="text" placeholder="e.g. 14°C - 26°C" value={sections.averageTemp || ''} onChange={e => updateSec('averageTemp', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '13px', width: '100%', boxSizing: 'border-box' }} />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--admin-muted)' }}>Visa Short Info (Hero)</label>
                            <input type="text" placeholder="e.g. Visa-free for 90 days" value={sections.visaInfo || ''} onChange={e => updateSec('visaInfo', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '13px', width: '100%', boxSizing: 'border-box' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--admin-muted)' }}>Entry Image URL</label>
                            <input type="text" placeholder="/images/spain_entry.webp" value={sections.entryImg || ''} onChange={e => updateSec('entryImg', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '13px', width: '100%', boxSizing: 'border-box' }} />
                          </div>
                        </div>

                        <h4 style={{ fontSize: '14px', fontWeight: '700', borderBottom: '1px solid var(--admin-border)', paddingBottom: '6px', margin: '8px 0 4px 0' }}>Visa Details Lists (Comma separated values)</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '11px', color: 'var(--admin-muted)' }}>Visa-Free Eligible Regions</label>
                            <textarea rows={2} value={sections.visaFreeRegions ? sections.visaFreeRegions.join(', ') : ''} onChange={e => updateSec('visaFreeRegions', e.target.value.split(',').map(s => s.trim()))} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', color: 'var(--admin-muted)' }}>Visa-Free Conditions</label>
                            <textarea rows={2} value={sections.visaFreeConditions ? sections.visaFreeConditions.join(', ') : ''} onChange={e => updateSec('visaFreeConditions', e.target.value.split(',').map(s => s.trim()))} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', color: 'var(--admin-muted)' }}>Visa-Required Who Needs</label>
                            <textarea rows={2} value={sections.visaRequiredWho ? sections.visaRequiredWho.join(', ') : ''} onChange={e => updateSec('visaRequiredWho', e.target.value.split(',').map(s => s.trim()))} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', color: 'var(--admin-muted)' }}>Visa-Required How to Apply</label>
                            <textarea rows={2} value={sections.visaRequiredHow ? sections.visaRequiredHow.join(', ') : ''} onChange={e => updateSec('visaRequiredHow', e.target.value.split(',').map(s => s.trim()))} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
                          </div>
                        </div>

                        <h4 style={{ fontSize: '14px', fontWeight: '700', borderBottom: '1px solid var(--admin-border)', paddingBottom: '6px', margin: '8px 0 4px 0' }}>Customs Duty-Free Limits</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                          <input type="text" placeholder="Tobacco" value={sections.customsTobacco || ''} onChange={e => updateSec('customsTobacco', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                          <input type="text" placeholder="Alcohol" value={sections.customsAlcohol || ''} onChange={e => updateSec('customsAlcohol', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                          <input type="text" placeholder="Gifts" value={sections.customsGifts || ''} onChange={e => updateSec('customsGifts', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                          <input type="text" placeholder="Cash" value={sections.customsCash || ''} onChange={e => updateSec('customsCash', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                        </div>

                        <h4 style={{ fontSize: '14px', fontWeight: '700', borderBottom: '1px solid var(--admin-border)', paddingBottom: '6px', margin: '8px 0 4px 0' }}>Health Requirements</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <input type="text" placeholder="Vaccines Title" value={sections.vaccinesTitle || ''} onChange={e => updateSec('vaccinesTitle', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                            <textarea placeholder="Vaccines Desc" rows={2} value={sections.vaccinesDesc || ''} onChange={e => updateSec('vaccinesDesc', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', resize: 'vertical' }} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <input type="text" placeholder="Insurance Title" value={sections.insuranceTitle || ''} onChange={e => updateSec('insuranceTitle', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                            <textarea placeholder="Insurance Desc" rows={2} value={sections.insuranceDesc || ''} onChange={e => updateSec('insuranceDesc', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', resize: 'vertical' }} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 4: Safety & Security */}
                    {generalModalTab === 'safety' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontWeight: '600', fontSize: '13px', color: 'var(--admin-muted)' }}>Safety Segment Image URL</label>
                          <input type="text" placeholder="/images/safety.webp" value={sections.safetyImg || ''} onChange={e => updateSec('safetyImg', e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px', width: '100%', boxSizing: 'border-box' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--admin-muted)' }}>Health Tips</label>
                            <input type="text" placeholder="Title" value={sections.healthTipsTitle || ''} onChange={e => updateSec('healthTipsTitle', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                            <textarea placeholder="Description" rows={3} value={sections.healthTipsDesc || ''} onChange={e => updateSec('healthTipsDesc', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', resize: 'vertical' }} />
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--admin-muted)' }}>Tourist Assistance</label>
                            <input type="text" placeholder="Title" value={sections.safetyAssistanceTitle || ''} onChange={e => updateSec('safetyAssistanceTitle', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                            <textarea placeholder="Description" rows={3} value={sections.safetyAssistanceDesc || ''} onChange={e => updateSec('safetyAssistanceDesc', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', resize: 'vertical' }} />
                          </div>
                        </div>

                        <h4 style={{ fontSize: '14px', fontWeight: '700', borderBottom: '1px solid var(--admin-border)', paddingBottom: '6px', margin: '8px 0 4px 0' }}>Solo Female Travel Banner</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <input type="text" placeholder="Header Title (e.g. Extremely Safe)" value={sections.soloFemaleTitle || ''} onChange={e => updateSec('soloFemaleTitle', e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px' }} />
                          <input type="text" placeholder="Highlight Tags (Comma separated, e.g. RELIABLE, WELL-LIT)" value={sections.soloFemaleTags ? sections.soloFemaleTags.join(', ') : ''} onChange={e => updateSec('soloFemaleTags', e.target.value.split(',').map(s => s.trim()))} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px' }} />
                        </div>
                        <textarea placeholder="Solo female travel details paragraph..." rows={2} value={sections.soloFemaleDesc || ''} onChange={e => updateSec('soloFemaleDesc', e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px', width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
                      </div>
                    )}

                    {/* TAB 5: Culture & Conduct */}
                    {generalModalTab === 'culture' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--admin-muted)' }}>Culture Segment Image URL</label>
                            <input type="text" placeholder="/images/culture.webp" value={sections.cultureImg || ''} onChange={e => updateSec('cultureImg', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '13px', width: '100%', boxSizing: 'border-box' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--admin-muted)' }}>Culture Experience Title</label>
                            <input type="text" placeholder="Traditional Flamenco" value={sections.cultureExperienceTitle || ''} onChange={e => updateSec('cultureExperienceTitle', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '13px', width: '100%', boxSizing: 'border-box' }} />
                          </div>
                        </div>
                        <textarea placeholder="Culture experience description..." rows={2} value={sections.cultureExperienceDesc || ''} onChange={e => updateSec('cultureExperienceDesc', e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px', width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />

                        <h4 style={{ fontSize: '14px', fontWeight: '700', borderBottom: '1px solid var(--admin-border)', paddingBottom: '6px', margin: '8px 0 4px 0' }}>Culture Highlights (2 Boxes)</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <input type="text" placeholder="Highlight 1 Title" value={sections.cultureHighlight1Title || ''} onChange={e => updateSec('cultureHighlight1Title', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                            <textarea placeholder="Highlight 1 Description" rows={2} value={sections.cultureHighlight1Desc || ''} onChange={e => updateSec('cultureHighlight1Desc', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', resize: 'vertical' }} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <input type="text" placeholder="Highlight 2 Title" value={sections.cultureHighlight2Title || ''} onChange={e => updateSec('cultureHighlight2Title', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                            <textarea placeholder="Highlight 2 Description" rows={2} value={sections.cultureHighlight2Desc || ''} onChange={e => updateSec('cultureHighlight2Desc', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', resize: 'vertical' }} />
                          </div>
                        </div>

                        <h4 style={{ fontSize: '14px', fontWeight: '700', borderBottom: '1px solid var(--admin-border)', paddingBottom: '6px', margin: '8px 0 4px 0' }}>Useful Phrases (Comma-separated title & description pairs)</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <input type="text" placeholder="Phrase 1 (e.g. Hola)" value={sections.usefulPhrases?.[0]?.phrase || ''} onChange={e => {
                              const arr = [...(sections.usefulPhrases || [{phrase: '', translation: ''}, {phrase: '', translation: ''}])];
                              arr[0] = { ...arr[0], phrase: e.target.value };
                              updateSec('usefulPhrases', arr);
                            }} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', width: '100%', boxSizing: 'border-box', marginBottom: '6px' }} />
                            <input type="text" placeholder="Translation 1 (e.g. Hello)" value={sections.usefulPhrases?.[0]?.translation || ''} onChange={e => {
                              const arr = [...(sections.usefulPhrases || [{phrase: '', translation: ''}, {phrase: '', translation: ''}])];
                              arr[0] = { ...arr[0], translation: e.target.value };
                              updateSec('usefulPhrases', arr);
                            }} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', width: '100%', boxSizing: 'border-box' }} />
                          </div>
                          <div>
                            <input type="text" placeholder="Phrase 2 (e.g. Gracias)" value={sections.usefulPhrases?.[1]?.phrase || ''} onChange={e => {
                              const arr = [...(sections.usefulPhrases || [{phrase: '', translation: ''}, {phrase: '', translation: ''}])];
                              arr[1] = { ...arr[1], phrase: e.target.value };
                              updateSec('usefulPhrases', arr);
                            }} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', width: '100%', boxSizing: 'border-box', marginBottom: '6px' }} />
                            <input type="text" placeholder="Translation 2 (e.g. Thank you)" value={sections.usefulPhrases?.[1]?.translation || ''} onChange={e => {
                              const arr = [...(sections.usefulPhrases || [{phrase: '', translation: ''}, {phrase: '', translation: ''}])];
                              arr[1] = { ...arr[1], translation: e.target.value };
                              updateSec('usefulPhrases', arr);
                            }} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', width: '100%', boxSizing: 'border-box' }} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 6: Logistics */}
                    {generalModalTab === 'logistics' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--admin-muted)' }}>Logistics Image URL</label>
                            <input type="text" placeholder="/images/logistics.webp" value={sections.logisticsImg || ''} onChange={e => updateSec('logisticsImg', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '13px', width: '100%', boxSizing: 'border-box' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--admin-muted)' }}>Driving side rules (e.g. Left side)</label>
                            <input type="text" placeholder="e.g. Drive on the right" value={sections.drivingRules || ''} onChange={e => updateSec('drivingRules', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '13px', width: '100%', boxSizing: 'border-box' }} />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>Currency Details Paragraph</label>
                            <textarea rows={2} placeholder="Payments details..." value={sections.logisticsCurrencyDesc || ''} onChange={e => updateSec('logisticsCurrencyDesc', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>Driving tag warnings (Comma-separated, e.g. Tolls, AP-7)</label>
                            <textarea rows={2} placeholder="Tolls, speed limits" value={sections.drivingRulesTags ? sections.drivingRulesTags.join(', ') : ''} onChange={e => updateSec('drivingRulesTags', e.target.value.split(',').map(s => s.trim()))} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>Local Transport tags (Comma-separated)</label>
                            <input type="text" placeholder="Metro, Bus, High-speed Rail" value={sections.transportTags ? sections.transportTags.join(', ') : ''} onChange={e => updateSec('transportTags', e.target.value.split(',').map(s => s.trim()))} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '13px', width: '100%', boxSizing: 'border-box' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>Essential Apps list (Comma-separated)</label>
                            <input type="text" placeholder="Uber, Google Maps, Renfe" value={sections.essentialApps ? sections.essentialApps.join(', ') : ''} onChange={e => updateSec('essentialApps', e.target.value.split(',').map(s => s.trim()))} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '13px', width: '100%', boxSizing: 'border-box' }} />
                          </div>
                        </div>

                        <h4 style={{ fontSize: '14px', fontWeight: '700', borderBottom: '1px solid var(--admin-border)', paddingBottom: '6px', margin: '8px 0 4px 0' }}>Electricity Plug Type</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <input type="text" placeholder="Plug description (e.g. Type C & F plug)" value={sections.plugType || ''} onChange={e => updateSec('plugType', e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px' }} />
                          <input type="text" placeholder="Voltage (e.g. 230V / 50Hz)" value={sections.voltage || ''} onChange={e => updateSec('voltage', e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px' }} />
                        </div>
                      </div>
                    )}

                    {/* TAB 7: Experiences */}
                    {generalModalTab === 'experiences' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--admin-muted)' }}>Must-Try Food List (Comma-separated)</label>
                            <input type="text" placeholder="Paella, Tapas, Sangria" value={sections.mustTryFoods ? sections.mustTryFoods.join(', ') : ''} onChange={e => updateSec('mustTryFoods', e.target.value.split(',').map(s => s.trim()))} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '13px', width: '100%', boxSizing: 'border-box' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--admin-muted)' }}>Experiences Banner Image</label>
                            <input type="text" placeholder="/images/food.webp" value={sections.experiencesImg || ''} onChange={e => updateSec('experiencesImg', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '13px', width: '100%', boxSizing: 'border-box' }} />
                          </div>
                        </div>

                        <div>
                          <label style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>Alcohol Laws Details</label>
                          <textarea rows={2} placeholder="Trading hours, age limits..." value={sections.alcoholLaws || ''} onChange={e => updateSec('alcoholLaws', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
                        </div>

                        <h4 style={{ fontSize: '14px', fontWeight: '700', borderBottom: '1px solid var(--admin-border)', paddingBottom: '6px', margin: '8px 0 4px 0' }}>Video Resource Details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <input type="text" placeholder="Video Title" value={sections.videoTitle || ''} onChange={e => updateSec('videoTitle', e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px' }} />
                          <input type="text" placeholder="YouTube Video URL" value={sections.videoUrl || ''} onChange={e => updateSec('videoUrl', e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <input type="text" placeholder="Thumbnail URL" value={sections.videoThumbnail || ''} onChange={e => updateSec('videoThumbnail', e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px' }} />
                          <input type="text" placeholder="Video Description" value={sections.videoDesc || ''} onChange={e => updateSec('videoDesc', e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px' }} />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px', borderTop: '1px solid var(--admin-border)', paddingTop: '16px' }}>
                <button type="button" onClick={() => setIsGeneralModalOpen(false)} className="admin-button outline" style={{ padding: '10px 20px', borderRadius: '10px' }}>Cancel</button>
                <button type="submit" disabled={isSavingGeneral} className="admin-button" style={{ padding: '10px 20px', borderRadius: '10px' }}>
                  {isSavingGeneral ? 'Saving...' : 'Save Guide Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Sub-Sections Editor */}
      {isDetailsModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="admin-card" style={{ width: '750px', padding: '32px', margin: '20px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
              Edit Guide sub-sections for: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{activeDetailsGuideId}</code>
            </h3>

            {detailsModalError && (
              <div className="badge danger" style={{ display: 'block', padding: '10px 14px', borderRadius: '8px' }}>
                {detailsModalError}
              </div>
            )}

            {isLoadingDetails ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--admin-muted)' }}>Loading country details...</div>
            ) : (
              <form onSubmit={handleSaveDetails} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* 3 Quick Cards */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', borderBottom: '1px solid var(--admin-border)', paddingBottom: '6px', margin: '0 0 12px 0' }}>Overview Cards (Must be exactly 3)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    {details.cards.map((card, idx) => (
                      <div key={idx} style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid var(--admin-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <strong>Card {idx + 1}</strong>
                        <input type="text" placeholder="Title" value={card.title} onChange={e => updateCardField(idx, 'title', e.target.value)} required style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                        <textarea placeholder="Description" value={card.desc} onChange={e => updateCardField(idx, 'desc', e.target.value)} required rows={4} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', resize: 'none' }} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Connectivity & Etiquette items */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {/* Connectivity list */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>Connectivity & Transport</h4>
                      <button type="button" onClick={() => addDetailItem('connectivity')} style={{ background: 'none', border: 'none', color: 'var(--admin-accent)', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>+ Add</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                      {details.connectivity.map((item, idx) => (
                        <div key={idx} style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1px solid var(--admin-border)', display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
                          <input type="text" placeholder="Header" value={item.title} onChange={e => updateItemField('connectivity', idx, 'title', e.target.value)} required style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                          <textarea placeholder="Instruction" value={item.desc} onChange={e => updateItemField('connectivity', idx, 'desc', e.target.value)} required rows={2} style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', resize: 'none' }} />
                          <button type="button" onClick={() => removeDetailItem('connectivity', idx)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'none', border: 'none', color: 'var(--admin-danger)', cursor: 'pointer', fontSize: '12px' }}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Etiquette list */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>Local Etiquette</h4>
                      <button type="button" onClick={() => addDetailItem('etiquette')} style={{ background: 'none', border: 'none', color: 'var(--admin-accent)', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>+ Add</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                      {details.etiquette.map((item, idx) => (
                        <div key={idx} style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1px solid var(--admin-border)', display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
                          <input type="text" placeholder="Header" value={item.title} onChange={e => updateItemField('etiquette', idx, 'title', e.target.value)} required style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px' }} />
                          <textarea placeholder="Instruction" value={item.desc} onChange={e => updateItemField('etiquette', idx, 'desc', e.target.value)} required rows={2} style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', resize: 'none' }} />
                          <button type="button" onClick={() => removeDetailItem('etiquette', idx)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'none', border: 'none', color: 'var(--admin-danger)', cursor: 'pointer', fontSize: '12px' }}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Cities */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>Must-Visit Cities</h4>
                    <button type="button" onClick={addCity} style={{ background: 'none', border: 'none', color: 'var(--admin-accent)', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>+ Add City</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                    {details.cities.map((city, idx) => (
                      <div key={idx} style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid var(--admin-border)', display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <input type="text" placeholder="City Name" value={city.name} onChange={e => updateCityField(idx, 'name', e.target.value)} required style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', width: '100%', boxSizing: 'border-box' }} />
                          
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <input type="text" placeholder="Image URL or Path" value={city.img_url} onChange={e => updateCityField(idx, 'img_url', e.target.value)} required style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', flex: 1 }} />
                            <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
                              <button type="button" className="admin-button outline" style={{ padding: '6px 10px', borderRadius: '6px', fontSize: '11px', whiteSpace: 'nowrap' }}>
                                {uploadingCityImg[idx] ? '...' : 'Upload'}
                              </button>
                              <input
                                type="file"
                                accept="image/*"
                                style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                                onChange={e => handleFileUpload(e, 'city_img', idx)}
                                disabled={!!uploadingCityImg[idx]}
                              />
                            </div>
                          </div>
                        </div>
                        <textarea placeholder="Description" value={city.desc} onChange={e => updateCityField(idx, 'desc', e.target.value)} required rows={2} style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--admin-border)', fontSize: '12px', resize: 'none', width: '100%', boxSizing: 'border-box' }} />
                        <button type="button" onClick={() => removeCity(idx)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'none', border: 'none', color: 'var(--admin-danger)', cursor: 'pointer', fontSize: '12px' }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button type="button" onClick={() => setIsDetailsModalOpen(false)} className="admin-button outline" style={{ padding: '10px 20px', borderRadius: '10px' }}>Cancel</button>
                  <button type="submit" disabled={isSavingDetails} className="admin-button" style={{ padding: '10px 20px', borderRadius: '10px' }}>
                    {isSavingDetails ? 'Saving Sub-Sections...' : 'Save Sub-Sections'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Modal 3: CSV Import Modal */}
      {isImportModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto' }}>
          <div className="admin-card" style={{ width: '600px', padding: '32px', margin: '40px auto', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '85vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Import Country Guides from CSV</h3>
            
            <p style={{ fontSize: '13px', color: 'var(--admin-muted)', margin: 0 }}>
              Upload a comma-separated `.csv` file matching the travel guide schema definitions. You can download the dynamic template below.
            </p>

            <button type="button" onClick={downloadSampleCSV} className="admin-button outline" style={{ alignSelf: 'flex-start', fontSize: '12px', padding: '6px 12px' }}>
              📥 Download Sample CSV Template
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', border: '1px dashed var(--admin-border)', padding: '20px', borderRadius: '12px', textAlign: 'center', background: '#f8fafc' }}>
              <input type="file" accept=".csv" onChange={handleCsvFileChange} disabled={isImporting} style={{ fontSize: '14px', margin: '0 auto' }} />
            </div>

            {importError && (
              <div className="badge danger" style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '13px' }}>
                {importError}
              </div>
            )}

            {importProgress && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px', borderRadius: '8px', fontSize: '13px', whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}>
                {importProgress}
              </div>
            )}

            {importParsedRows.length > 0 && (
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '700', margin: '0 0 6px 0' }}>Parsed Entries Preview ({importParsedRows.length})</h4>
                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--admin-border)', borderRadius: '8px', fontSize: '12px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '1px solid var(--admin-border)' }}>
                        <th style={{ padding: '6px' }}>Slug ID</th>
                        <th style={{ padding: '6px' }}>Name</th>
                        <th style={{ padding: '6px' }}>Capital</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importParsedRows.map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                          <td style={{ padding: '6px' }}><code>{row.id || 'N/A'}</code></td>
                          <td style={{ padding: '6px' }}>{row.name || 'N/A'}</td>
                          <td style={{ padding: '6px' }}>{row.capital || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px', borderTop: '1px solid var(--admin-border)', paddingTop: '16px' }}>
              <button type="button" onClick={() => setIsImportModalOpen(false)} disabled={isImporting} className="admin-button outline" style={{ padding: '10px 20px', borderRadius: '10px' }}>Close</button>
              <button type="button" onClick={handleStartImport} disabled={isImporting || importParsedRows.length === 0} className="admin-button" style={{ padding: '10px 20px', borderRadius: '10px' }}>
                {isImporting ? 'Importing...' : 'Start Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
