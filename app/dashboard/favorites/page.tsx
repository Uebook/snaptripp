'use client'

import Link from 'next/link'

export default function FavoritesPage() {
  return (
    <div className="favorites-container animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Saved Destinations</h1>
        <p className="page-subtitle">Your personal collection of world-class inspirations.</p>
      </header>

      <div className="empty-favorites-card">
        <div className="empty-icon">⭐</div>
        <h2>Your gallery is waiting</h2>
        <p>Explore the world and star your favorite destinations to see them here.</p>
        <Link href="/explore" className="btn-gold-luxe">Begin Exploration</Link>
      </div>

      <style jsx global>{`
        .favorites-container a { text-decoration: none !important; color: inherit; }
        .favorites-container { padding: 64px 48px; max-width: 1000px; margin: 0 auto; }
        .page-title { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 900; color: #031B4E; margin: 0 0 12px; letter-spacing: -1.5px; }
        .page-subtitle { color: #64748B; font-size: 18px; margin-bottom: 72px; font-weight: 500; }

        .empty-favorites-card {
          background: white; padding: 120px 40px; border-radius: 40px; text-align: center;
          border: 1px solid #F1F5F9; box-shadow: 0 15px 40px rgba(3, 27, 78, 0.05);
        }
        .empty-icon { font-size: 80px; margin-bottom: 32px; color: #D4AF37; opacity: 0.25; }
        
        h2 { font-family: 'Playfair Display', serif; font-size: 32px; color: #031B4E; margin-bottom: 16px; font-weight: 800; }
        p { color: #64748B; margin-bottom: 40px; font-size: 16px; }

        .btn-gold-luxe { 
          display: inline-block; background: #D4AF37; color: white !important; padding: 16px 48px; 
          border-radius: 14px; text-decoration: none !important; font-weight: 800; 
          box-shadow: 0 10px 25px rgba(212, 175, 55, 0.25); transition: all 0.3s;
        }
        .btn-gold-luxe:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(212, 175, 55, 0.35); }

        .animate-fade-in { animation: fadeIn 0.8s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        @media (max-width: 768px) {
          .favorites-container { padding: 40px 20px; }
          .page-title { font-size: 32px; letter-spacing: -1px; text-align: center; }
          .page-subtitle { font-size: 15px; margin-bottom: 40px; text-align: center; }
          .empty-favorites-card { padding: 60px 20px; border-radius: 24px; }
          .empty-icon { font-size: 60px; margin-bottom: 24px; }
          h2 { font-size: 24px; }
          p { font-size: 14px; margin-bottom: 24px; }
          .btn-gold-luxe { padding: 14px 32px; font-size: 14px; width: 100%; max-width: 280px; box-sizing: border-box; text-align: center; }
        }
      `}</style>
    </div>
  )
}
