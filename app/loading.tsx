'use client'

export default function Loading() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        position: 'relative',
        width: '80px',
        height: '80px',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: '4px solid #f3f4f6',
          borderRadius: '50%',
        }}></div>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: '4px solid #EAB308',
          borderRadius: '50%',
          borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite',
        }}></div>
      </div>
      <h2 style={{
        marginTop: '24px',
        fontSize: '18px',
        fontWeight: 600,
        color: '#1e293b',
        fontFamily: 'var(--font-playfair), serif',
        letterSpacing: '0.5px'
      }}>
        Loading SnapTrip...
      </h2>
      <p style={{
        marginTop: '8px',
        fontSize: '14px',
        color: '#64748b'
      }}>
        Preparing your next journey
      </p>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
