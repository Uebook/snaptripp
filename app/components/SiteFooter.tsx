import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer style={{
      backgroundColor: '#0a192f',
      color: 'white',
      padding: '80px 20px 40px',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '60px' }}>
        {/* Brand Column */}
        <div>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
            <div style={{ backgroundColor: '#ffc107', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '18px' }}>
              🚀
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>SnapTrip</span>
          </Link>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '30px' }}>
            Transforming the way you explore the world with AI-powered personalized itineraries. Plan your dream trip in seconds.
          </p>
          <div style={{ display: 'flex', gap: '15px' }}>
            <a href="#" style={{ color: 'white', fontSize: '1.2rem', opacity: 0.6 }}>𝕏</a>
            <a href="#" style={{ color: 'white', fontSize: '1.2rem', opacity: 0.6 }}>📸</a>
            <a href="#" style={{ color: 'white', fontSize: '1.2rem', opacity: 0.6 }}>📘</a>
            <a href="#" style={{ color: 'white', fontSize: '1.2rem', opacity: 0.6 }}>📺</a>
          </div>
        </div>

        {/* Explore Column */}
        <div>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '25px', fontWeight: '700' }}>Explore</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {['How it Works', 'Planner', 'Explore Map'].map((item) => {
              const href = item === 'How it Works' ? '/how-it-works' : `/${item.toLowerCase().replace(' ', '-')}`;
              return (
                <li key={item} style={{ marginBottom: '15px' }}>
                  <Link href={href} style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }}>
                    {item}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Company Column */}
        <div>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '25px', fontWeight: '700' }}>Company</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {['About Us', 'Latest Blog', 'Contact', 'Travel Guides'].map((item) => {
              const href = item === 'About Us' ? '/about' : item === 'Latest Blog' ? '/blog' : `/${item.toLowerCase().replace(' ', '-')}`;
              return (
                <li key={item} style={{ marginBottom: '15px' }}>
                  <Link href={href} style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }}>
                    {item}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Newsletter Column */}
        <div>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '25px', fontWeight: '700' }}>Stay Updated</h4>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.5' }}>
            Subscribe for travel tips and personalized recommendations.
          </p>
          <div style={{ position: 'relative' }}>
            <input
              type="email"
              placeholder="Your email"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                outline: 'none'
              }}
            />
            <button style={{
              position: 'absolute',
              right: '5px',
              top: '5px',
              bottom: '5px',
              backgroundColor: '#ffc107',
              border: 'none',
              borderRadius: '6px',
              padding: '0 15px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div style={{ maxWidth: '1200px', margin: '60px auto 0', padding: '30px 0 0', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)' }}>
        <p>© 2026 SnapTrip AI. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '30px' }}>
          <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</Link>
          <Link href="/cookies" style={{ color: 'inherit', textDecoration: 'none' }}>Cookie Policy</Link>
        </div>
      </div>
    </footer>
  )
}
