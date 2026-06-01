import React from 'react'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Fetch data on the server
export const revalidate = 60 // Revalidate every 60 seconds

export async function generateMetadata() {
  const { data: page } = await supabaseAdmin.from('pages').select('title, meta_description').eq('slug', 'privacy').single()
  return {
    title: page?.title || 'Privacy Policy',
    description: page?.meta_description || 'Our Privacy Policy'
  }
}

export default async function PrivacyPolicyPage() {
  const { data: page } = await supabaseAdmin.from('pages').select('title, content').eq('slug', 'privacy').single()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FAFAFA' }}>
      <SiteHeader />
      <main style={{ flex: 1, padding: '80px 20px', maxWidth: '800px', margin: '0 auto', color: '#1E293B', lineHeight: '1.8', width: '100%' }}>
        {page ? (
          <>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '24px', color: '#0F172A', fontFamily: 'var(--font-playfair)' }}>
              {page.title}
            </h1>
            <div 
              className="cms-content" 
              dangerouslySetInnerHTML={{ __html: page.content || '' }} 
            />
          </>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>Privacy Policy</h1>
            <p>Content is currently being updated. Please check back later.</p>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
