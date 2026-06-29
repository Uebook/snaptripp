import { supabaseAdmin } from '@/lib/supabaseAdmin'
import HomeClient from './components/HomeClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  // 1. Fetch Carousel Data
  let initialCarouselData: Record<string, any> = {}
  try {
    const { data: carouselItems } = await supabaseAdmin
      .from('home_carousel')
      .select('*')
      .order('created_at', { ascending: true })

    if (carouselItems && carouselItems.length > 0) {
      carouselItems.forEach((item: any) => {
        initialCarouselData[item.country] = {
          region: item.region,
          desc: item.description,
          label: item.label,
          image: item.image_url,
          bgImage: item.bg_image_url,
          locationTag: item.location_tag
        }
      })
    }
  } catch (err) {
    console.error('Server fetch home carousel failed:', err)
  }

  // 2. Fetch Countries list
  let initialCountries: string[] = []
  try {
    const { data: placesData } = await supabaseAdmin
      .from('places')
      .select('country')
      .not('country', 'is', null)

    if (placesData) {
      initialCountries = [...new Set(placesData.map(item => item.country))]
    }
  } catch (err) {
    console.error('Server fetch countries failed:', err)
  }

  // 3. Fetch Why, Testimonials, Blogs
  let initialWhyData: any[] = []
  let initialTestimData: any[] = []
  let initialBlogsData: any[] = []

  try {
    const { data: whySnaptrip } = await supabaseAdmin
      .from('why_snaptrip')
      .select('*')
      .order('created_at', { ascending: true })
    if (whySnaptrip) initialWhyData = whySnaptrip
  } catch (err) {
    console.error('Server fetch why_snaptrip failed:', err)
  }

  try {
    const { data: testimonials } = await supabaseAdmin
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false })
    if (testimonials) initialTestimData = testimonials
  } catch (err) {
    console.error('Server fetch testimonials failed:', err)
  }

  try {
    const { data: blogs } = await supabaseAdmin
      .from('blogs')
      .select('title, slug, excerpt, category, read_time, image_url, created_at')
      .eq('status', 'Published')
      .order('created_at', { ascending: false })
      .limit(4)
    if (blogs) initialBlogsData = blogs
  } catch (err) {
    console.error('Server fetch blogs failed:', err)
  }

  return (
    <HomeClient
      initialCarouselData={initialCarouselData}
      initialCountries={initialCountries}
      initialWhyData={initialWhyData}
      initialTestimData={initialTestimData}
      initialBlogsData={initialBlogsData}
    />
  )
}
