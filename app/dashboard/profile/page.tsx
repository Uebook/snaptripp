'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
      }
      setLoading(false)
    }
    fetchUser()
  }, [])

  if (loading) return <div className="p-10">Loading profile...</div>

  return (
    <div className="profile-container animate-fade-in">
      <header className="profile-header">
        <h1 className="profile-title">Personal Identity</h1>
        <p className="profile-subtitle">Manage your traveler profile and account credentials.</p>
      </header>

      <div className="profile-grid">
        <div className="profile-sidebar-info">
          <div className="avatar-card-luxe">
            <div className="avatar-placeholder">
              {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <button className="change-photo-btn">Change Portrait</button>
            <div className="user-membership">
              <span className="member-label">Membership</span>
              <span className="member-tier">Luxury Explorer</span>
            </div>
          </div>
        </div>

        <div className="profile-main-form">
          <section className="form-section-luxe">
            <h3 className="section-title">Personal Details</h3>
            <div className="input-group-luxe">
              <label>Full Name</label>
              <input type="text" defaultValue={user?.user_metadata?.full_name || ''} readOnly />
            </div>
            <div className="input-group-luxe">
              <label>Professional Email</label>
              <input type="email" defaultValue={user?.email || ''} readOnly />
            </div>
          </section>

          <section className="form-section-luxe">
            <h3 className="section-title">Account Security</h3>
            <div className="input-group-luxe">
              <label>Current Password</label>
              <input type="password" value="********" readOnly />
            </div>
            <button className="btn-gold-outline-luxe">Request Password Reset</button>
          </section>

          <div className="profile-footer">
            <button className="btn-gold-luxe">Save Changes</button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .profile-container a { text-decoration: none !important; color: inherit; }
        .profile-container {
          padding: 64px 48px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .profile-title {
          font-family: 'Playfair Display', serif;
          font-size: 48px;
          font-weight: 900;
          color: #031B4E;
          margin: 0 0 12px;
          letter-spacing: -1.5px;
        }

        .profile-subtitle {
          color: #64748B;
          font-size: 18px;
          margin-bottom: 64px;
          font-weight: 500;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 48px;
        }

        .avatar-card-luxe {
          background: white;
          padding: 40px 32px;
          border-radius: 28px;
          text-align: center;
          border: 1px solid rgba(241, 245, 249, 0.8);
          box-shadow: 0 10px 40px rgba(3, 27, 78, 0.04);
        }

        .avatar-placeholder {
          width: 140px;
          height: 140px;
          background: #031B4E;
          color: #D4AF37;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 56px;
          font-weight: 900;
          margin: 0 auto 32px;
          box-shadow: 0 15px 30px rgba(3, 27, 78, 0.15);
          border: 6px solid white;
        }

        .change-photo-btn {
          background: transparent;
          border: 1.5px solid #E2E8F0;
          padding: 10px 24px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 700;
          color: #64748B;
          cursor: pointer;
          transition: all 0.2s;
        }

        .change-photo-btn:hover {
          background: #F8FAFC;
          border-color: #D4AF37;
          color: #031B4E;
        }

        .user-membership {
          margin-top: 40px;
          padding-top: 32px;
          border-top: 1px solid #F1F5F9;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .member-label { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #94A3B8; font-weight: 800; }
        .member-tier { font-size: 18px; color: #D4AF37; font-weight: 800; font-family: 'Playfair Display', serif; }

        .form-section-luxe {
          background: white;
          padding: 40px;
          border-radius: 28px;
          border: 1px solid #F1F5F9;
          margin-bottom: 32px;
          box-shadow: 0 10px 30px rgba(3, 27, 78, 0.04);
        }

        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          color: #031B4E;
          margin: 0 0 32px;
          font-weight: 800;
          border-bottom: 1px solid #F1F5F9;
          padding-bottom: 16px;
        }

        .input-group-luxe {
          margin-bottom: 24px;
        }

        .input-group-luxe label {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #64748B;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .input-group-luxe input {
          width: 100%;
          padding: 14px 20px;
          border-radius: 14px;
          border: 1px solid #E2E8F0;
          background: #F8FAFC;
          color: #031B4E;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.2s;
        }
        
        .input-group-luxe input:focus {
          border-color: #D4AF37;
          background: white;
          box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.1);
          outline: none;
        }

        .btn-gold-outline-luxe {
          background: transparent;
          border: 1.5px solid #D4AF37;
          color: #D4AF37 !important;
          padding: 14px 28px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none !important;
        }

        .btn-gold-outline-luxe:hover {
          background: rgba(212, 175, 55, 0.08);
          transform: translateY(-2px);
        }

        .profile-footer {
          margin-top: 48px;
          display: flex;
          justify-content: flex-end;
        }

        .btn-gold-luxe {
          background: #D4AF37;
          color: white !important;
          padding: 16px 48px;
          border-radius: 14px;
          border: none;
          font-weight: 800;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(212, 175, 55, 0.25);
          transition: all 0.3s;
          text-decoration: none !important;
        }

        .btn-gold-luxe:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(212, 175, 55, 0.35);
        }

        .animate-fade-in { animation: fadeIn 0.8s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  )
}
