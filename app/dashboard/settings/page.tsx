'use client'

export default function SettingsPage() {
    return (
        <div className="settings-container animate-fade-in">
            <header className="page-header">
                <h1 className="page-title">Account Settings</h1>
                <p className="page-subtitle">Refine your preferences and security parameters.</p>
            </header>

            <div className="settings-grid">
                <section className="settings-section-luxe">
                    <h3 className="section-title">Notifications</h3>
                    <div className="setting-row">
                        <div className="setting-info">
                            <span className="setting-label">Trip Updates</span>
                            <span className="setting-desc">Receive alerts for itinerary changes and flight updates.</span>
                        </div>
                        <div className="toggle-placeholder"></div>
                    </div>
                    <div className="setting-row">
                        <div className="setting-info">
                            <span className="setting-label">Discovery Newsletter</span>
                            <span className="setting-desc">Exclusive luxury destination guides and travel tips.</span>
                        </div>
                        <div className="toggle-placeholder"></div>
                    </div>
                </section>

                <section className="settings-section-luxe">
                    <h3 className="section-title">Privacy & Security</h3>
                    <div className="setting-row">
                        <div className="setting-info">
                            <span className="setting-label">Profile Visibility</span>
                            <span className="setting-desc">Make your itineraries visible to the global SnapTrip community.</span>
                        </div>
                        <div className="toggle-placeholder"></div>
                    </div>
                    <button className="btn-red-outline-luxe">Delete Account</button>
                </section>
            </div>

            <style jsx global>{`
        .settings-container a { text-decoration: none !important; color: inherit; }
        .settings-container { padding: 64px 48px; max-width: 1000px; margin: 0 auto; }
        .page-title { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 900; color: #031B4E; margin: 0 0 12px; letter-spacing: -1.5px; }
        .page-subtitle { color: #64748B; font-size: 18px; margin-bottom: 56px; font-weight: 500; }

        .settings-section-luxe {
          background: white; padding: 40px; border-radius: 28px; border: 1px solid #F1F5F9;
          margin-bottom: 32px; box-shadow: 0 10px 30px rgba(3, 27, 78, 0.04);
        }

        .section-title {
          font-family: 'Playfair Display', serif; font-size: 24px; color: #031B4E;
          margin: 0 0 32px; font-weight: 800; border-bottom: 1px solid #F1F5F9; padding-bottom: 16px;
        }

        .setting-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 24px 0; border-bottom: 1px solid rgba(241, 245, 249, 0.8);
        }
        .setting-row:last-of-type { border-bottom: none; }

        .setting-label { display: block; font-weight: 800; color: #031B4E; font-size: 16px; margin-bottom: 6px; }
        .setting-desc { display: block; font-size: 14px; color: #64748B; font-weight: 500; }

        .toggle-placeholder {
          width: 52px; height: 28px; background: #E2E8F0; border-radius: 14px; cursor: pointer;
          transition: all 0.2s;
        }
        .toggle-placeholder:hover { background: #CBD5E1; }

        .btn-red-outline-luxe {
          margin-top: 24px; background: transparent; border: 1.5px solid #FECACA;
          color: #EF4444 !important; padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: all 0.2s; text-decoration: none !important;
        }
        .btn-red-outline-luxe:hover { background: #FEF2F2; border-color: #EF4444; }

        .animate-fade-in { animation: fadeIn 0.8s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        @media (max-width: 768px) {
          .settings-container { padding: 40px 20px; }
          .page-title { font-size: 32px; letter-spacing: -1px; text-align: center; }
          .page-subtitle { font-size: 15px; margin-bottom: 40px; text-align: center; }
          .settings-section-luxe { padding: 24px 20px; border-radius: 20px; margin-bottom: 24px; }
          .section-title { font-size: 20px; margin-bottom: 24px; padding-bottom: 12px; }
          .setting-row { padding: 20px 0; gap: 16px; }
          .setting-label { font-size: 15px; }
          .setting-desc { font-size: 13px; }
          .btn-red-outline-luxe { width: 100%; text-align: center; box-sizing: border-box; margin-top: 16px; }
        }
      `}</style>
        </div>
    )
}
