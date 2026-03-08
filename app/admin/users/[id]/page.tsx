import { supabaseAdmin } from '@/lib/supabaseAdmin'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import TripTimelineRow from './TripTimelineRow'

export const revalidate = 0

export default async function UserDetail({ params }: { params: { id: string } }) {
    const { id } = params

    // Fetch profile
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

    if (profileError || !profile) {
        notFound()
    }

    // Fetch trips for timeline with full itinerary details
    const { data: trips, error: tripsError } = await supabaseAdmin
        .from('trips')
        .select(`
            *,
            days:trip_days(
                *,
                items:trip_items(*)
            )
        `)
        .eq('user_id', id)
        .order('created_at', { ascending: false })

    if (tripsError) {
        console.error('Error fetching trips for user:', tripsError)
    }

    const userTrips = trips || []

    return (
        <div className="user-detail">
            <div style={{ marginBottom: '20px' }}>
                <Link href="/admin/users" style={{ color: 'var(--admin-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back to Users
                </Link>
            </div>

            <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--admin-sidebar)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                                {(profile.full_name || 'U')[0].toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h2 style={{ margin: 0 }}>{profile.full_name || 'Anonymous User'}</h2>
                            <span style={{ color: '#64748b', fontSize: '14px' }}>@{profile.username || 'No username'}</span>
                        </div>
                    </div>
                    <span className="badge success">Active User</span>
                </div>

                <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px', borderTop: '1px solid var(--admin-border)', paddingTop: '24px' }}>
                    <div>
                        <h4 style={{ marginBottom: '16px', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact & Info</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong style={{ color: 'inherit' }}>ID:</strong> <span style={{ color: '#64748b' }}>{profile.id}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong style={{ color: 'inherit' }}>Email:</strong> <span style={{ color: '#64748b' }}>{profile.email || 'N/A'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong style={{ color: 'inherit' }}>Location:</strong> <span style={{ color: '#64748b' }}>{profile.location || 'N/A'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong style={{ color: 'inherit' }}>Website:</strong>
                                {profile.website ? (
                                    <a href={profile.website} target="_blank" rel="noreferrer" style={{ color: 'var(--admin-primary)', textDecoration: 'none' }}>{profile.website}</a>
                                ) : (
                                    <span style={{ color: '#64748b' }}>N/A</span>
                                )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong style={{ color: 'inherit' }}>Joined:</strong> <span style={{ color: '#64748b' }}>{new Date(profile.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '16px', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>About</h4>
                        <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#64748b', margin: 0, padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                            {profile.bio || 'This user has not provided a bio.'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="admin-card" style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3>Trip Timeline</h3>
                    <span className="badge" style={{ background: 'var(--admin-sidebar)', color: '#fff' }}>{userTrips.length} Trips</span>
                </div>

                {userTrips.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: '#64748b', fontSize: '14px' }}>
                        No trips found for this user.
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Trip Title</th>
                                <th>Destination</th>
                                <th>Duration</th>
                                <th>Created On</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userTrips.map((trip: any) => (
                                <TripTimelineRow key={trip.id} trip={trip} />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
