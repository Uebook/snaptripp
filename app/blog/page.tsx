'use client'

import React, { useState, useEffect } from 'react'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'
import Link from 'next/link'
import styles from './blog.module.css'

const MOCK_BLOGS = [
  {
    title: 'Hidden Gems in the Mediterranean',
    slug: 'hidden-gems-mediterranean',
    excerpt: 'Discover secret beaches, charming villages, and authentic local experiences away from tourist crowds.',
    category: 'Destinations',
    date: 'Feb 5, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Budget Travel: Europe on $50/Day',
    slug: 'budget-travel-europe',
    excerpt: 'Learn how to explore Europe without breaking the bank with our expert money-saving tips and tricks.',
    category: 'Travel Tips',
    date: 'Feb 3, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Best Mountains to Visit in 2026',
    slug: 'best-mountains-2026',
    excerpt: 'From the Alps to the Himalayas, explore the most breathtaking mountain destinations for adventure seekers.',
    category: 'Adventure',
    date: 'Jan 28, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'The Art of Solo Travel: A Guide',
    slug: 'solo-travel-guide',
    excerpt: 'Everything you need to know about traveling alone, from safety tips to meeting new people along the way.',
    category: 'Guide',
    date: 'Jan 20, 2026',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Top 10 Street Foods in Southeast Asia',
    slug: 'southeast-asia-street-food',
    excerpt: 'A culinary journey through the vibrant markets and street stalls of Bangkok, Hanoi, and beyond.',
    category: 'Food',
    date: 'Jan 15, 2026',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Sustainable Travel: Why it Matters',
    slug: 'sustainable-travel-importance',
    excerpt: 'How to reduce your carbon footprint and support local communities during your next vacation.',
    category: 'Nature',
    date: 'Jan 10, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop'
  }
]

const CATEGORIES = ['All', 'Destinations', 'Travel Tips', 'Adventure', 'Food', 'Nature', 'Guide']

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [blogs, setBlogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const res = await fetch('/api/admin/blogs')
        const data = await res.json()
        if (res.ok && data.blogs) {
          const published = data.blogs.filter((b: any) => b.status !== 'Draft')
          const formatted = published.map((b: any) => ({
            title: b.title,
            slug: b.slug,
            excerpt: b.excerpt,
            category: b.category,
            date: new Date(b.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            readTime: b.read_time,
            image: b.image_url
          }))
          setBlogs(formatted)
        } else {
          setBlogs(MOCK_BLOGS)
        }
      } catch (err) {
        console.warn('Failed to fetch from DB, falling back to mock blogs:', err)
        setBlogs(MOCK_BLOGS)
      } finally {
        setLoading(false)
      }
    }
    loadBlogs()
  }, [])

  const filteredBlogs = activeCategory === 'All'
    ? blogs
    : blogs.filter((b) => b.category === activeCategory)

  return (
    <div className={styles.container}>
      <SiteHeader />

      {/* Hero Header Area */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroTag}>The Dispatch</span>
          <h1 className={styles.heroTitle}>Travel Stories & <span>Curated Guides</span></h1>
          <p className={styles.heroDesc}>
            Immersive narratives, expert travel tips, and cultural insights from curious minds wandering across the globe.
          </p>
        </div>
      </section>

      {/* Categories Navigator */}
      <div className={styles.categoriesNav}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`${styles.categoryBtn} ${activeCategory === cat ? styles.active : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Blog Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0', color: '#64748b', minHeight: '30vh', alignItems: 'center' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Loading Dispatch stories...</div>
        </div>
      ) : (
        <section className={styles.blogGrid}>
          {filteredBlogs.map((blog) => (
            <Link key={blog.slug} href={`/blog/${blog.slug}`} className={styles.blogCard}>
              <div className={styles.imageWrapper}>
                <img src={blog.image} alt={blog.title} className={styles.cardImage} />
                <span className={styles.cardTag}>{blog.category}</span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.metaRow}>
                  <span>{blog.date}</span>
                  <div className={styles.metaDot} />
                  <span>{blog.readTime}</span>
                </div>
                <h3 className={styles.cardTitle}>{blog.title}</h3>
                <p className={styles.excerpt}>{blog.excerpt}</p>
                <div className={styles.readLink}>
                  Read More
                  <span className={styles.readLinkArrow}>→</span>
                </div>
              </div>
            </Link>
          ))}
          {filteredBlogs.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
              No stories published in this category yet.
            </div>
          )}
        </section>
      )}

      <SiteFooter />
    </div>
  )
}
