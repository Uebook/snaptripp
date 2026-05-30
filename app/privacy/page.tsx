'use client'

import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'

export default function PrivacyPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FAFAFA' }}>
      <SiteHeader />
      <main style={{ flex: 1, padding: '80px 20px', maxWidth: '800px', margin: '0 auto', color: '#1E293B', lineHeight: '1.8' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '24px', color: '#0F172A', fontFamily: 'var(--font-playfair)' }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '40px', color: '#475569' }}>
          Last updated: October 2023
        </p>
        
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px', color: '#0F172A' }}>1. Information We Collect</h2>
          <p style={{ marginBottom: '16px' }}>
            When you use SnapTrip, we collect the personal information you provide to us, such as your name, email address, and travel preferences. We also collect data about how you interact with our platform to improve your curated journeys.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px', color: '#0F172A' }}>2. How We Use Your Data</h2>
          <p style={{ marginBottom: '16px' }}>
            We use your data to:
          </p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px' }}>
            <li>Personalize your travel itineraries and recommendations.</li>
            <li>Process your bookings and send you important confirmations.</li>
            <li>Communicate with you regarding updates, offers, and travel advisories.</li>
            <li>Improve our platform's user experience and security.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px', color: '#0F172A' }}>3. Data Sharing and Security</h2>
          <p style={{ marginBottom: '16px' }}>
            Your privacy is our priority. We do not sell your personal data to third parties. We only share necessary information with our trusted travel partners (like airlines and hotels) to fulfill your bookings. We use industry-standard encryption to protect your account and payment details.
          </p>
        </section>
        
        <section>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px', color: '#0F172A' }}>4. Contact Us</h2>
          <p style={{ marginBottom: '16px' }}>
            If you have any questions or concerns about our Privacy Policy or how your data is handled, please contact our support team at <a href="mailto:privacy@snaptrip.com" style={{ color: '#EAB308', textDecoration: 'none', fontWeight: 600 }}>privacy@snaptrip.com</a>.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
