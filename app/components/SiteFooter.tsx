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
  linkedin_url: string
}

interface FooterLinkItem {
  label: string
  url: string
  category: string
}

export default function SiteFooter() {
    const [settings, setSettings] = useState<FooterSettings>({
    description: 'Simplifying the way you plan, organize, and experience travel — so you can focus on what truly matters: the journey.',
    phone: '',
    email: 'support@snaptrip.io',
    facebook_url: '#',
    twitter_url: '#',
    instagram_url: '#',
    linkedin_url: '#'
  })

  const formatUrl = (url: string) => {
    if (!url || url === '#') return url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  };
  
  const [links, setLinks] = useState<FooterLinkItem[]>([
    { label: 'Plan Your Trip', url: '/plan', category: 'Quick Links' },
    { label: 'Travel Map', url: '/travel-map', category: 'Quick Links' },
    { label: 'Explore Countries', url: '/explore', category: 'Quick Links' },
    { label: 'How snaptrip works', url: '/how-it-works', category: 'Quick Links' },
    { label: 'Contact Us', url: '/contact', category: 'Quick Links' },
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
            <img src="/images/applogo.webp" alt="SnapTrip" className="logo-img" style={{ height: '64px', width: 'auto' }} />
          </Link>
        </div>
        <div className="footer-info">
          <p className="footer-desc">
            {settings.description}
          </p>
          <div className="footer-contact">
            {settings.email && <p className="contact-item">{settings.email}</p>}
          </div>
          <div className="footer-social">
            {settings.facebook_url && settings.facebook_url !== '#' && (
              <a href={formatUrl(settings.facebook_url)} className="social-icon" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            )}
            {settings.twitter_url && settings.twitter_url !== '#' && (
              <a href={formatUrl(settings.twitter_url)} className="social-icon" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
              </a>
            )}
            {settings.instagram_url && settings.instagram_url !== '#' && (
              <a href={formatUrl(settings.instagram_url)} className="social-icon" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            )}
            {settings.linkedin_url && settings.linkedin_url !== '#' && (
              <a href={formatUrl(settings.linkedin_url)} className="social-icon" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"></path></svg>
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

