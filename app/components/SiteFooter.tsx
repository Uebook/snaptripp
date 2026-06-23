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
  const supportLinks = [...links.filter(link => link.category === 'Support')]

  return (
    <footer className="site-footer-premium">
      <div className="footer-top-section">
        <div className="footer-container">
          
          <div className="footer-logo-col">
            <Link href="/" className="footer-logo-text">
              SnapTrip
            </Link>
          </div>

          <div className="footer-info">
            <p className="footer-desc">
              {settings.description}
            </p>
            <div className="follow-us">
              <h4>Follow Us</h4>
              <div className="footer-social">
                {settings.facebook_url && (
                  <a href={formatUrl(settings.facebook_url)} className="social-icon" target="_blank" rel="noopener noreferrer">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  </a>
                )}
                {settings.instagram_url && (
                  <a href={formatUrl(settings.instagram_url)} className="social-icon" target="_blank" rel="noopener noreferrer">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                )}
                {settings.linkedin_url && (
                  <a href={formatUrl(settings.linkedin_url)} className="social-icon" target="_blank" rel="noopener noreferrer">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"></path></svg>
                  </a>
                )}
              </div>
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
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <span>© {new Date().getFullYear()} SnapTrip. All Rights Reserved.</span>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms Of Use</Link>
          <span>Made with love for travelers</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .site-footer-premium {
          background: #FFFFFF;
          color: #334155;
          font-family: var(--font-sans, system-ui, sans-serif);
          border-top: 1px solid #E2E8F0;
        }
        .footer-top-section {
          padding: 80px 40px;
        }
        .site-footer-premium .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 40px;
        }
        .site-footer-premium .footer-logo-text {
          font-size: 1.5rem;
          font-weight: 800;
          color: #002B5B;
          text-decoration: none;
        }
        .site-footer-premium .footer-info {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .site-footer-premium .footer-desc {
          color: #475569;
          line-height: 1.6;
          font-size: 0.95rem;
          margin: 0;
        }
        .site-footer-premium .follow-us h4 {
          color: #334155;
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 16px;
          margin-top: 0;
        }
        .site-footer-premium .footer-social {
          display: flex;
          gap: 16px;
        }
        .site-footer-premium .social-icon {
          color: #FBBF24;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .site-footer-premium .social-icon:hover {
          color: #D97706;
          transform: translateY(-2px);
        }
        .site-footer-premium .footer-nav {
          display: contents;
        }
        .site-footer-premium .footer-col h4 {
          margin-top: 0;
          margin-bottom: 20px;
          font-weight: 700;
          font-size: 0.95rem;
          color: #FBBF24;
        }
        .site-footer-premium .footer-col ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .site-footer-premium .footer-col a {
          text-decoration: none;
          color: #475569;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }
        .site-footer-premium .footer-col a:hover {
          color: #FBBF24;
        }
        .site-footer-premium .footer-bottom {
          background: #002B5B;
          color: #F8FAFC;
          padding: 30px 40px;
        }
        .site-footer-premium .footer-bottom-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
        }
        .site-footer-premium .footer-bottom-container span,
        .site-footer-premium .footer-bottom-container a {
          color: #F8FAFC;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .site-footer-premium .footer-bottom-container a:hover {
          opacity: 0.8;
        }
        @media (max-width: 992px) {
          .site-footer-premium .footer-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .site-footer-premium .footer-container {
            grid-template-columns: 1fr;
          }
          .site-footer-premium .footer-bottom-container {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
        }
      `}} />
    </footer>
  )
}
