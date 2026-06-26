import React from 'react'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Fetch data on the server
export const revalidate = 60

export async function generateMetadata() {
  const { data: page } = await supabaseAdmin.from('pages').select('title, meta_description').eq('slug', 'terms').single()
  return {
    title: page?.title || 'Terms of Use',
    description: page?.meta_description || 'Our Terms of Use'
  }
}

function decodeHTMLEntities(text: string) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function getFormattedContent(content: string) {
  if (!content) return '';
  if (content.includes('&lt;') || content.includes('&gt;')) {
    let cleaned = content
      .replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '')
      .replace(/<p>\s*&nbsp;\s*<\/p>/gi, '')
      .replace(/<p>\s*<\/p>/gi, '');
    cleaned = cleaned.replace(/<p>/gi, '').replace(/<\/p>/gi, '');
    return decodeHTMLEntities(cleaned);
  }
  return content;
}

export default async function TermsOfUsePage() {
  const { data: page } = await supabaseAdmin.from('pages').select('title, content').eq('slug', 'terms').single()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FAFAFA' }}>
      <SiteHeader />
      <main style={{ flex: 1, padding: '40px 20px', maxWidth: '800px', margin: '0 auto', color: '#1E293B', lineHeight: '1.8', width: '100%' }}>
        {page ? (
          <>
            <div 
              className="cms-content" 
              dangerouslySetInnerHTML={{ __html: getFormattedContent(page.content || '') }} 
            />
          </>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>Terms of Use</h1>
            <p>Content is currently being updated. Please check back later.</p>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
