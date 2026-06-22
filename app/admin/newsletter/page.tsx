import { supabaseAdmin } from '@/lib/supabaseAdmin'
import NewsletterTable from './NewsletterTable'

// Set revalidate to 0 to always fetch fresh data on the server
export const revalidate = 0

export default async function AdminNewsletter() {
  let subscribers: any[] = []
  let errorMsg = ''

  try {
    const { data, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      if (error.code === '42P01') {
        errorMsg = 'The newsletter_subscribers table does not exist. Please run the database migration (supabase db push) to create it.'
      } else {
        errorMsg = error.message
      }
    } else {
      subscribers = data || []
    }
  } catch (err: any) {
    errorMsg = err.message
  }

  return (
    <div className="admin-dashboard">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, color: '#0b2a4a' }}>Newsletter Subscribers</h1>
          <p style={{ color: 'var(--admin-muted)', marginTop: '8px', fontSize: '15px' }}>Manage all your newsletter subscriptions.</p>
        </div>
      </div>

      {errorMsg ? (
        <div className="admin-card">
          <div style={{ padding: '20px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontWeight: '500' }}>
            Database Error: {errorMsg}
          </div>
        </div>
      ) : (
        <NewsletterTable subscribers={subscribers} />
      )}
    </div>
  )
}
