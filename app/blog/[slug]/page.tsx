'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'
import Link from 'next/link'
import styles from '../blog.module.css'

const MOCK_BLOGS = [
  {
    title: 'Hidden Gems in the Mediterranean',
    slug: 'hidden-gems-mediterranean',
    content: `
      <p>The Mediterranean is home to some of the world's most famous destinations, but beyond the crowded streets of Santorini and the bustling beaches of the Amalfi Coast lie hidden gems waiting to be discovered.</p>
      <h2>1. Procida, Italy</h2>
      <p>While neighboring Capri and Ischia get most of the attention, Procida remains a colorful, authentic escape. Its pastel-hued houses and quiet marinas offer a glimpse into traditional Italian island life.</p>
      <h2>2. Kas, Turkey</h2>
      <p>Nestled on Turkey's turquoise coast, Kas is a bohemian paradise. It's famous for its crystal-clear waters, ancient ruins, and a vibrant local market that comes alive every week.</p>
      <h2>3. Mellieha, Malta</h2>
      <p>Mellieha offers some of the best beaches in Malta, along with stunning views of the countryside. It's the perfect spot for those looking to combine relaxation with historical exploration.</p>
    `,
    category: 'Destinations',
    date: 'Feb 5, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=1200&auto=format&fit=crop'
  },
  {
    title: 'Budget Travel: Europe on $50/Day',
    slug: 'budget-travel-europe',
    content: `
      <p>Europe doesn't have to be expensive. With a bit of planning and some insider knowledge, you can explore the continent's most beautiful cities on a modest budget.</p>
      <h2>Travel Off-Season</h2>
      <p>Prices for accommodation and flights drop significantly outside of the peak summer months. Consider visiting in spring or autumn for a more affordable and less crowded experience.</p>
      <h2>Use Public Transport</h2>
      <p>Europe has some of the best public transport networks in the world. Instead of taxis or car rentals, use trains, buses, and metro systems to get around.</p>
      <h2>Eat Like a Local</h2>
      <p>Avoid restaurants in tourist hotspots. Instead, explore local markets and backstreet bistros where you can find delicious, authentic food at a fraction of the cost.</p>
    `,
    category: 'Travel Tips',
    date: 'Feb 3, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200&auto=format&fit=crop'
  },
  {
    title: 'Best Mountains to Visit in 2026',
    slug: 'best-mountains-2026',
    content: `
      <p>For adventure seekers and nature lovers, there's nothing quite like the majesty of a mountain range. Here are our top picks for mountain destinations in 2026.</p>
      <h2>1. The Dolomites, Italy</h2>
      <p>Famous for their unique limestone peaks and stunning alpine meadows, the Dolomites offer incredible hiking in the summer and world-class skiing in the winter.</p>
      <h2>2. Torres del Paine, Chile</h2>
      <p>This Chilean national park is a dream for trekkers. Its granite towers, turquoise lakes, and vast glaciers provide a truly epic backdrop for any adventure.</p>
      <h2>3. Banff National Park, Canada</h2>
      <p>Banff is a year-round destination with something for everyone. From the iconic Lake Louise to the rugged peaks of the Rockies, it's a place of unparalleled natural beauty.</p>
    `,
    category: 'Adventure',
    date: 'Jan 28, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop'
  },
  {
    title: 'The Art of Solo Travel: A Guide',
    slug: 'solo-travel-guide',
    content: `
      <p>Traveling alone can be one of the most rewarding experiences of your life. It offers complete freedom, the chance to meet new people, and an opportunity for deep self-discovery.</p>
      <h2>Start Small</h2>
      <p>If you're nervous about your first solo trip, start with a weekend getaway to a nearby city. This will help you build confidence before embarking on a longer journey.</p>
      <h2>Stay in Hostels</h2>
      <p>Hostels are great for solo travelers as they provide a social environment where it's easy to meet other people. Many offer private rooms if you're not ready for a dorm.</p>
      <h2>Trust Your Instincts</h2>
      <p>Safety is paramount when traveling alone. Trust your gut and be aware of your surroundings at all times.</p>
    `,
    category: 'Guide',
    date: 'Jan 20, 2026',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop'
  },
  {
    title: 'Top 10 Street Foods in Southeast Asia',
    slug: 'southeast-asia-street-food',
    content: `
      <p>Southeast Asia is a food lover's paradise, and some of the best meals you'll ever have will be from a street stall.</p>
      <h2>1. Pad Thai, Thailand</h2>
      <p>A classic for a reason. This stir-fried noodle dish is a perfect balance of sweet, sour, and savory flavors.</p>
      <h2>2. Pho, Vietnam</h2>
      <p>This fragrant noodle soup is a staple of Vietnamese cuisine. It's often served with fresh herbs, lime, and chili for an extra kick.</p>
      <h2>3. Nasi Goreng, Indonesia</h2>
      <p>Indonesian fried rice is typically served with a fried egg on top and a side of prawn crackers. It's simple, filling, and delicious.</p>
    `,
    category: 'Food',
    date: 'Jan 15, 2026',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop'
  },
  {
    title: 'Sustainable Travel: Why it Matters',
    slug: 'sustainable-travel-importance',
    content: `
      <p>As the world becomes more aware of the impact of travel on the environment, sustainable travel is more important than ever.</p>
      <h2>Support Local Communities</h2>
      <p>Choose locally-owned accommodation, eat at independent restaurants, and hire local guides. This ensures that your money stays within the community you're visiting.</p>
      <h2>Reduce Your Carbon Footprint</h2>
      <p>Consider alternatives to flying when possible, such as trains or buses. When you do fly, consider carbon offsetting your journey.</p>
      <h2>Respect Nature</h2>
      <p>Stay on marked trails, dispose of waste properly, and avoid activities that exploit animals.</p>
    `,
    category: 'Nature',
    date: 'Jan 10, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200&auto=format&fit=crop'
  }
]

export default function BlogDetailsPage() {
  const { slug } = useParams()
  const [blog, setBlog] = useState<any>(null)
  const [allBlogs, setAllBlogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBlogData = async () => {
      try {
        const allRes = await fetch('/api/blogs')
        const allData = await allRes.json()
        let databaseBlogs: any[] = []
        if (allRes.ok && allData.blogs) {
          const published = allData.blogs.filter((b: any) => b.status !== 'Draft')
          databaseBlogs = published.map((b: any) => ({
            title: b.title,
            slug: b.slug,
            excerpt: b.excerpt,
            content: b.content,
            category: b.category,
            date: new Date(b.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            readTime: b.read_time,
            image: b.image_url
          }))
          setAllBlogs(databaseBlogs)
          const currentBlog = databaseBlogs.find((b) => b.slug === slug)
          setBlog(currentBlog || null)
        } else {
          setAllBlogs(MOCK_BLOGS)
          setBlog(MOCK_BLOGS.find((b) => b.slug === slug) || null)
        }
      } catch (err) {
        console.warn('Failed to load blog data from DB, falling back to mocks:', err)
        setAllBlogs(MOCK_BLOGS)
        setBlog(MOCK_BLOGS.find((b) => b.slug === slug) || null)
      } finally {
        setLoading(false)
      }
    }
    if (slug) loadBlogData()
  }, [slug])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
        <SiteHeader />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Loading article details...</div>
        </div>
        <SiteFooter />
      </div>
    )
  }

  if (!blog) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
        <SiteHeader />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 20px' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#031B4E', marginBottom: '20px', fontFamily: "var(--font-serif)" }}>Story Not Found</h1>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>Sorry, the blog post you are looking for doesn&apos;t exist.</p>
            <Link href="/blog" style={{ color: '#031B4E', fontWeight: 'bold', textDecoration: 'underline' }}>Back to Dispatch</Link>
          </div>
        </div>
        <SiteFooter />
      </div>
    )
  }

  const relatedBlogs = allBlogs.filter((b) => b.slug !== slug).slice(0, 3)

  return (
    <div className={styles.container}>
      <SiteHeader />

      {/* Article Cover Hero */}
      <section className={styles.detailHero} style={{ backgroundImage: `url(${blog.image})` }}>
        <div className={styles.detailOverlay} />
        <div className={styles.detailHeroContent}>
          <span className={styles.detailTag}>{blog.category}</span>
          <h1 className={styles.detailTitle}>{blog.title}</h1>
          <div className={styles.detailMeta}>
            <span>{blog.date}</span>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
            <span>{blog.readTime}</span>
          </div>
        </div>
      </section>

      {/* Article Content Layout */}
      <main className={styles.articleLayout}>
        <nav className={styles.breadcrumbs}>
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/blog">Blog</Link>
          <span>/</span>
          <span style={{ opacity: 0.7 }}>{blog.title}</span>
        </nav>

        <article className={styles.prose}>
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </article>

        {/* Share Socials */}
        <div className={styles.shareSection}>
          <span className={styles.shareTitle}>Share this story</span>
          <div className={styles.shareRow}>
            {['𝕏', '📸', '📘'].map((icon) => (
              <button key={icon} className={styles.shareBtn} aria-label={`Share on ${icon}`}>
                {icon}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Related Stories Grid */}
      {relatedBlogs.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.relatedContainer}>
            <div className={styles.relatedHeader}>
              <h2 className={styles.relatedTitle}>More Stories</h2>
              <Link href="/blog" className={styles.relatedLink}>View All Stories →</Link>
            </div>
            <div className={styles.relatedGrid}>
              {relatedBlogs.map((related) => (
                <Link key={related.slug} href={`/blog/${related.slug}`} className={styles.blogCard}>
                  <div className={styles.imageWrapper}>
                    <img src={related.image} alt={related.title} className={styles.cardImage} />
                    <span className={styles.cardTag}>{related.category}</span>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.metaRow}>
                      <span>{related.date}</span>
                      <div className={styles.metaDot} />
                      <span>{related.readTime}</span>
                    </div>
                    <h3 className={styles.cardTitle}>{related.title}</h3>
                    <p className={styles.excerpt}>{related.excerpt}</p>
                    <div className={styles.readLink}>
                      Read More
                      <span className={styles.readLinkArrow}>→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  )
}
