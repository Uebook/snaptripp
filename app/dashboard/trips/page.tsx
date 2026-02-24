'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Trip {
    id: string
    title: string
    country: string
    duration: string
    created_at: string
}

export default function TripsPage() {
    const [trips, setTrips] = useState<Trip[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTrips = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            try {
                const res = await fetch('/api/trips', {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                })
                const data = await res.json()
                if (data.success) setTrips(data.trips)
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchTrips()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this trip?')) return
        const { error } = await supabase.from('trips').delete().eq('id', id)
        if (!error) setTrips(prev => prev.filter(t => t.id !== id))
    }

    if (loading) return <div className="p-10">Searching your archives...</div>

    return (
        <div className="trips-container animate-fade-in">
            <header className="page-header">
                <div className="header-text">
                    <h1 className="page-title">My Travel Archives</h1>
                    <p className="page-subtitle">A curated collection of your past and future grand adventures.</p>
                </div>
                <Link href="/explore" className="btn-gold-luxe">+ New Expedition</Link>
            </header>

            {trips.length === 0 ? (
                <div className="empty-state-luxe">
                    <div className="empty-icon">🗺️</div>
                    <h2>Your map is uncharted</h2>
                    <p>Begin your legacy by planning your first luxury escape.</p>
                    <Link href="/explore" className="btn-sapphire-luxe">Discover Destinations</Link>
                </div>
            ) : (
                <div className="trips-grid-premium">
                    {trips.map((trip) => (
                        <div key={trip.id} className="luxe-trip-card">
                            <div className="card-top">
                                <div className="trip-status">Upcoming</div>
                                <div className="trip-location-badge">{trip.country}</div>
                            </div>
                            <div className="card-body">
                                <h3 className="card-trip-title">{trip.title}</h3>
                                <div className="card-meta">
                                    <span className="meta-item">📅 {trip.duration}</span>
                                    <span className="meta-item">✨ {new Date(trip.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="card-actions">
                                    <Link href={`/trip-map?country=${encodeURIComponent(trip.country)}&tripId=${trip.id}`} className="view-btn">
                                        Open Planner
                                    </Link>
                                    <button onClick={() => handleDelete(trip.id)} className="delete-btn">🗑️</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style jsx global>{`
        .trips-container a { text-decoration: none !important; color: inherit; }
        .trips-container { padding: 64px 48px; max-width: 1240px; margin: 0 auto; }
        
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 56px; }
        .page-title { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 900; color: #031B4E; margin: 0 0 12px; letter-spacing: -1.5px; }
        .page-subtitle { color: #64748B; font-size: 18px; margin: 0; font-weight: 500; }

        .btn-gold-luxe { 
          background: #D4AF37; color: white !important; padding: 16px 32px; border-radius: 14px; 
          text-decoration: none !important; font-weight: 700; font-size: 15px; 
          box-shadow: 0 10px 25px rgba(212, 175, 55, 0.25); transition: all 0.3s;
        }

        .btn-gold-luxe:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(212, 175, 55, 0.35); }

        .trips-grid-premium { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 32px; }

        .luxe-trip-card {
          background: white; border-radius: 28px; overflow: hidden; border: 1px solid #F1F5F9;
          box-shadow: 0 10px 40px rgba(3, 27, 78, 0.05); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .luxe-trip-card:hover { transform: translateY(-12px); box-shadow: 0 30px 60px rgba(3, 27, 78, 0.12); }

        .card-top {
          height: 180px; background: #031B4E; position: relative; padding: 24px;
          display: flex; flex-direction: column; justify-content: space-between;
          background-image: linear-gradient(rgba(3, 27, 78, 0.4), rgba(3, 27, 78, 0.8)), url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800');
          background-size: cover; background-position: center;
        }

        .trip-status {
          align-self: flex-end; background: rgba(255, 255, 255, 0.25); backdrop-filter: blur(8px);
          padding: 8px 16px; border-radius: 30px; color: white; font-size: 10px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 1.5px; border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .trip-location-badge {
          font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 800; color: white;
          text-shadow: 0 2px 15px rgba(0,0,0,0.4); letter-spacing: -0.5px;
        }

        .card-body { padding: 32px; }
        .card-trip-title { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 800; color: #031B4E; margin: 0 0 16px; }
        
        .card-meta { display: flex; gap: 20px; margin-bottom: 32px; font-size: 13px; font-weight: 700; color: #64748B; }

        .card-actions { display: flex; gap: 16px; }
        .view-btn {
          flex: 1; background: #031B4E; color: white !important; text-align: center; padding: 14px;
          border-radius: 14px; text-decoration: none !important; font-weight: 800; font-size: 13px; transition: all 0.3s;
          box-shadow: 0 5px 15px rgba(3, 27, 78, 0.2);
        }
        .view-btn:hover { background: #0A2B6E; transform: scale(1.02); }

        .delete-btn {
          width: 50px; background: #FFF1F2; border: none; border-radius: 14px;
          cursor: pointer; font-size: 20px; transition: all 0.2s; color: #E11D48;
        }
        .delete-btn:hover { background: #FFE4E6; transform: rotate(8deg); }

        .empty-state-luxe {
          background: white; padding: 120px 40px; border-radius: 40px; text-align: center;
          border: 1px solid #F1F5F9; box-shadow: 0 15px 40px rgba(3, 27, 78, 0.05);
        }
        .empty-icon { font-size: 80px; margin-bottom: 32px; filter: grayscale(1); opacity: 0.25; }

        .btn-sapphire-luxe {
          display: inline-block; background: #031B4E; color: white !important; padding: 16px 40px; 
          border-radius: 14px; text-decoration: none !important; font-weight: 800; margin-top: 24px;
          box-shadow: 0 10px 20px rgba(3, 27, 78, 0.2); transition: all 0.2s;
        }

        .animate-fade-in { animation: fadeIn 0.8s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
        </div>
    )
}
