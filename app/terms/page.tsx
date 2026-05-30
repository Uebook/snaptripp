'use client'

import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'

export default function TermsOfUsePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FAFAFA' }}>
      <SiteHeader />
      <main style={{ flex: 1, padding: '80px 20px', maxWidth: '800px', margin: '0 auto', color: '#1E293B', lineHeight: '1.8' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '24px', color: '#0F172A', fontFamily: 'var(--font-playfair)' }}>
          Terms of Use
        </h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '40px', color: '#475569' }}>
          Last updated: October 2023
        </p>
        
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px', color: '#0F172A' }}>1. Acceptance of Terms</h2>
          <p style={{ marginBottom: '16px' }}>
            By accessing and using SnapTrip, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use our service.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px', color: '#0F172A' }}>2. Use of Service</h2>
          <p style={{ marginBottom: '16px' }}>
            SnapTrip provides a platform for curating and booking travel experiences. You agree to use our services only for lawful purposes. You must not use our platform in any way that causes damage to the website or impairment of the availability or accessibility of SnapTrip.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px', color: '#0F172A' }}>3. User Accounts</h2>
          <p style={{ marginBottom: '16px' }}>
            To access certain features of the platform, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. SnapTrip reserves the right to terminate accounts, edit or remove content, and cancel bookings at our sole discretion.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px', color: '#0F172A' }}>4. Bookings and Payments</h2>
          <p style={{ marginBottom: '16px' }}>
            All bookings made through SnapTrip are subject to availability and the specific terms and conditions of the travel service providers (airlines, hotels, etc.). SnapTrip acts as an intermediary and is not liable for failures by third-party providers. Payments must be made in full at the time of booking unless stated otherwise.
          </p>
        </section>
        
        <section>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px', color: '#0F172A' }}>5. Contact Information</h2>
          <p style={{ marginBottom: '16px' }}>
            For any inquiries regarding these Terms of Use, please reach out to us at <a href="mailto:legal@snaptrip.com" style={{ color: '#EAB308', textDecoration: 'none', fontWeight: 600 }}>legal@snaptrip.com</a>.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
