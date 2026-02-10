'use client'

export default function AdminAuth() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f2f8ff',
      color: '#0b2a4a',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#ffffff',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 8px 20px rgba(11, 42, 74, 0.08)'
      }}>
        <h2>Admin Login</h2>
        <p style={{ color: '#6b88a5' }}>Secure access for admins</p>
        <input placeholder="Email" style={{ width: '100%', marginTop: '12px', padding: '10px', borderRadius: '8px', border: '1px solid #cfe3ff' }} />
        <input placeholder="Password" type="password" style={{ width: '100%', marginTop: '12px', padding: '10px', borderRadius: '8px', border: '1px solid #cfe3ff' }} />
        <button className="admin-button" style={{ width: '100%', marginTop: '16px' }}>Sign in</button>
      </div>
    </div>
  )
}
