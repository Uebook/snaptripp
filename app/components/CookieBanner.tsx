'use client'

import React, { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user already consented
    const consent = localStorage.getItem('snaptrip-cookie-consent')
    if (!consent) {
      // Small premium delay before showing
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('snaptrip-cookie-consent', 'accepted')
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem('snaptrip-cookie-consent', 'declined')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      left: '24px',
      maxWidth: '520px',
      backgroundColor: 'rgba(15, 23, 42, 0.95)', // Slate 900
      backdropFilter: 'blur(12px)',
      color: 'white',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      animation: 'slideUp 0.4s ease-out forwards',
      fontFamily: "'Inter', sans-serif",
      margin: '0 auto',
      boxSizing: 'border-box'
    }}>
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @media (min-width: 640px) {
          div {
            left: auto !important;
          }
        }
      `}</style>
      
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div style={{
          backgroundColor: '#ffc107',
          padding: '10px',
          borderRadius: '12px',
          color: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: '700', color: '#f8fafc' }}>
            We Value Your Privacy
          </h4>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8', lineHeight: '1.5' }}>
            SnapTrip uses cookies to enhance your experience, customize content, and analyze site traffic. Read more in our <a href="/privacy" style={{ color: '#ffc107', textDecoration: 'underline', fontWeight: '500' }}>Privacy Policy</a>.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button 
          onClick={handleDecline} 
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '600',
            backgroundColor: 'transparent',
            color: '#94a3b8',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
            e.currentTarget.style.color = '#f8fafc'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = '#94a3b8'
          }}
        >
          Decline
        </button>
        <button 
          onClick={handleAccept} 
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '700',
            backgroundColor: '#ffc107',
            color: '#0f172a',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0a800'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffc107'}
        >
          Accept All
        </button>
      </div>
    </div>
  )
}
