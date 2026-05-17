'use client'

import React from 'react'
import Link from 'next/link'
import styles from './verify.module.css'

export default function VerifyEmailPage() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>SnapTrip</div>
        <div className={styles.helpIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.contentWrapper}>
          
          <div className={styles.imageColumn}>
            {/* The polaroid style floating image */}
            <div className={styles.imageCard}>
              <div 
                className={styles.image} 
                style={{ backgroundImage: 'url("/images/testimonial.png")' }} /* Using testimonial placeholder */
              />
            </div>
          </div>

          <div className={styles.textColumn}>
            <div className={styles.iconWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            
            <h1 className={styles.title}>Verify your<br/>email to<br/>continue</h1>
            
            <p className={styles.description}>
              We've sent a confirmation link to your inbox. Please click the link to confirm your account and start your journey with SnapTrip.
            </p>

            <div className={styles.actionBox}>
              <div className={styles.actionHeader}>
                <span className={styles.bullet}>•</span>
                <span className={styles.actionLabel}>Didn't receive the email?</span>
              </div>
              <button className={styles.resendButton}>
                Resend Email <span className={styles.arrow}>→</span>
              </button>
            </div>

            <button className={styles.changeEmailButton}>
              Change email address
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.copyright}>© 2024 SNAPTRIP INTERNATIONAL</div>
        <div className={styles.footerLinks}>
          <Link href="/privacy">PRIVACY</Link>
          <Link href="/terms">TERMS</Link>
          <Link href="/support">SUPPORT</Link>
        </div>
      </footer>
    </div>
  )
}
