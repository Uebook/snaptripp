'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface FooterSettings {
  description: string
  phone: string
  email: string
  facebook_url: string
  twitter_url: string
  instagram_url: string
  youtube_url: string
}

interface FooterLinkItem {
  label: string
  url: string
  category: string
}

export default function SiteFooter() {
  const [settings, setSettings] = useState<FooterSettings>({
    description: 'Simplifying the way you plan, organize, and experience travel — so you can focus on what truly matters: the journey.',
    phone: '(123) 456-7890',
    email: 'ABC@gmail.com',
    facebook_url: '#',
    twitter_url: '#',
    instagram_url: '#',
    youtube_url: '#'
  })
  
  const [links, setLinks] = useState<FooterLinkItem[]>([
    { label: 'Plan Your Trip', url: '/plan', category: 'Quick Links' },
    { label: 'How it works', url: '/how-it-works', category: 'Quick Links' },
    { label: 'Why Us', url: '/why-us', category: 'Quick Links' },
    { label: 'Testimonial', url: '/testimonials', category: 'Quick Links' },
    { label: 'Blog', url: '/blog', category: 'Quick Links' },
    { label: 'Privacy Policy', url: '/privacy', category: 'Support' },
    { label: 'Terms Of Use', url: '/terms', category: 'Support' }
  ])

  useEffect(() => {
    async function loadFooter() {
      try {
        const res = await fetch('/api/footer-data', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (data.settings) setSettings(data.settings)
          if (data.links && data.links.length > 0) setLinks(data.links)
        }
      } catch (err) {
        console.error('Error loading dynamic footer:', err)
      }
    }
    loadFooter()
  }, [])

  const quickLinks = links.filter(link => link.category === 'Quick Links')
  const supportLinks = links.filter(link => link.category === 'Support')

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-logo-col">
          <Link href="/" className="footer-logo">
            <span className="logo-text">SnapTrip</span>
          </Link>
        </div>
        <div className="footer-info">
          <p className="footer-desc">
            {settings.description}
          </p>
          <div className="footer-contact">
            {settings.phone && <p className="contact-item">{settings.phone}</p>}
            {settings.email && <p className="contact-item">{settings.email}</p>}
          </div>
          <div className="footer-social">
            {settings.facebook_url && (
              <a href={settings.facebook_url} className="social-icon" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            )}
            {settings.twitter_url && (
              <a href={settings.twitter_url} className="social-icon" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
              </a>
            )}
            {settings.instagram_url && (
              <a href={settings.instagram_url} className="social-icon" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            )}
            {settings.youtube_url && (
              <a href={settings.youtube_url} className="social-icon" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"></path></svg>
              </a>
            )}
          </div>
        </div>

        <div className="footer-nav">
          {quickLinks.length > 0 && (
            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul>
                {quickLinks.map((link, idx) => (
                  <li key={idx}><Link href={link.url}>{link.label}</Link></li>
                ))}
              </ul>
            </div>
          )}
          {supportLinks.length > 0 && (
            <div className="footer-col">
              <h4>Support</h4>
              <ul>
                {supportLinks.map((link, idx) => (
                  <li key={idx}><Link href={link.url}>{link.label}</Link></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}

