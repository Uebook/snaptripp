'use client'

import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { toPng } from 'html-to-image'
import styles from './TravelerIDCard.module.css'

export default function TravelerIDCard({ username }: { username?: string }) {
    const cardRef = useRef<HTMLDivElement>(null)
    const [userProfile, setUserProfile] = useState<any>(null)
    const [stats, setStats] = useState({
        countries: 0,
        cities: 0,
        trips: 0
    })
    const [topDestinations, setTopDestinations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchTravelerData() {
            try {
                let targetUserId: string | null = null
                let profileSlug = username || ''

                // 1. Get Target User
                if (username) {
                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('id, full_name, avatar_url, username')
                        .eq('username', username)
                        .single()

                    if (profileError || !profileData) {
                        setError('Profile not found or is private.')
                        setLoading(false)
                        return
                    }

                    targetUserId = profileData.id
                    setUserProfile({
                        name: profileData.full_name || username,
                        avatar: profileData.avatar_url || '',
                        username: profileData.username || username
                    })
                    profileSlug = profileData.username || username
                } else {
                    const { data: { session } } = await supabase.auth.getSession()
                    if (session && session.user) {
                        const { data: profileData } = await supabase
                            .from('profiles')
                            .select('id, full_name, avatar_url, username')
                            .eq('id', session.user.id)
                            .single()

                        targetUserId = session.user.id
                        setUserProfile({
                            name: profileData?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Traveler',
                            email: session.user.email,
                            avatar: profileData?.avatar_url || session.user.user_metadata?.avatar_url || '',
                            username: profileData?.username
                        })
                        profileSlug = profileData?.username || (userProfile?.name?.toLowerCase().replace(/\s+/g, '-')) || 'traveler'
                    }
                }

                if (!targetUserId) {
                    setLoading(false)
                    return
                }

                // 2. Fetch Reviews (Countries & Cities) - Using SQL directly if no API bearer needed or update API to accept userId
                const { data: reviewsData } = await supabase
                    .from('traveler_reviews')
                    .select('*')
                    .eq('user_id', targetUserId)

                let uniqueCountries = new Set<string>()
                let totalCities = 0
                let destMap = new Map<string, { count: number, cities: Set<string> }>()

                if (reviewsData) {
                    reviewsData.forEach((rev: any) => {
                        uniqueCountries.add(rev.country)

                        const cities = rev.selected_cities || []
                        totalCities += cities.length

                        if (!destMap.has(rev.country)) {
                            destMap.set(rev.country, { count: 1, cities: new Set(cities) })
                        } else {
                            const dest = destMap.get(rev.country)!
                            dest.count += 1
                            cities.forEach((c: string) => dest.cities.add(c))
                        }
                    })
                }

                // Process Top Destinations
                const sortedDest = Array.from(destMap.entries())
                    .sort((a, b) => b[1].count - a[1].count)
                    .slice(0, 3)
                    .map((entry, idx) => ({
                        rank: idx + 1,
                        name: entry[0],
                        cities: Array.from(entry[1].cities).join(', ') || 'Various locations',
                        count: `${entry[1].cities.size} cities`
                    }))

                setTopDestinations(sortedDest)

                // 3. Fetch Trips (for Trips Completed)
                const { count: tripsCount } = await supabase
                    .from('trips')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', targetUserId)

                setStats({
                    countries: uniqueCountries.size,
                    cities: totalCities,
                    trips: tripsCount || 0
                })

            } catch (err) {
                console.error("Failed to load traveler ID data", err)
            } finally {
                setLoading(false)
            }
        }

        fetchTravelerData()
    }, [username])

    if (loading) {
        return <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>Generating Traveler ID...</div>
    }

    if (error) {
        return (
            <div style={{ color: 'white', textAlign: 'center', padding: '100px 20px' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>📡 {error}</h2>
                <p style={{ opacity: 0.7 }}>The traveler may have set their profile to private or changed their handle.</p>
            </div>
        )
    }

    // Use actual username if available, fallback to a clean version of the name
    const profileSlug = username || userProfile?.username || (userProfile?.name?.toLowerCase().replace(/[^a-z0-9._]/g, '')) || 'traveler'
    const profileUrl = `${profileSlug}`

    const handleDownload = async () => {
        if (cardRef.current === null) return
        try {
            const dataUrl = await toPng(cardRef.current, { cacheBust: true, backgroundColor: '#0a192f' })
            const link = document.createElement('a')
            link.download = `traveler-id-${profileSlug}.png`
            link.href = dataUrl
            link.click()
        } catch (err) {
            console.error('oops, something went wrong!', err)
        }
    }

    const handleCopyLink = () => {
        const fullUrl = `${window.location.origin}/${profileSlug}`
        navigator.clipboard.writeText(fullUrl).then(() => {
            alert('Profile link copied to clipboard!')
        }).catch(err => {
            console.error('Failed to copy: ', err)
        })
    }

    const handleSocialShare = (platform: string) => {
        const fullUrl = encodeURIComponent(`${window.location.origin}/${profileSlug}`)
        const text = encodeURIComponent(`Check out my verified Traveler ID on SnapTrip! 🌍`)

        let url = ''
        switch (platform) {
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${fullUrl}`
                break
            case 'twitter':
                url = `https://twitter.com/intent/tweet?url=${fullUrl}&text=${text}`
                break
            case 'whatsapp':
                url = `https://api.whatsapp.com/send?text=${text}%20${fullUrl}`
                break
            case 'instagram':
                // Instagram doesn't have a direct web sharer for URL, usually handled via mobile app
                // For web, we just copy to clipboard and notify
                handleCopyLink()
                alert('Profile link copied! Share it on your Instagram story or bio. 📸')
                return
        }

        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer')
        }
    }
    return (
        <div className={styles["id-card-wrapper"]}>
            <div className={styles["id-card-container"]} ref={cardRef}>
                {/* Header */}
                <div className={styles["card-header"]}>
                    <div className={styles.brand}>
                        <div className={styles["brand-logo"]}>
                            <img src="/images/applogo.webp" alt="SnapTrip" style={{ height: '28px', width: 'auto', display: 'block' }} />
                        </div>
                        <span className={styles["brand-name"]}>SnapTrip</span>
                    </div>
                    <div className={styles["id-badge"]}>
                        🆔 TRAVELER ID
                    </div>
                </div>

                <div className={styles["card-main-grid"]}>
                    {/* Profile Section */}
                    <div className={styles["profile-section"]}>
                        <div className={styles["profile-image-container"]}>
                            {userProfile?.avatar ? (
                                <img
                                    src={userProfile.avatar}
                                    alt={userProfile?.name || "Traveler"}
                                    className={styles["profile-image"]}
                                    onError={(e: any) => {
                                        e.target.style.display = 'none'
                                        e.target.nextSibling.style.display = 'flex'
                                    }}
                                />
                            ) : null}
                            <div className={styles["dummy-icon"]} style={{ display: userProfile?.avatar ? 'none' : 'flex' }}>
                                👤
                            </div>
                        </div>
                        <h2 className={styles["profile-name"]}>{userProfile?.name || "Adventure Explorer"}</h2>
                        <p className={styles["profile-title"]}>{stats.countries > 10 ? 'Global Citizen' : 'Adventure Explorer'}</p>
                        <div className={styles["elite-badge"]}>
                            {stats.countries > 15 ? '🎖️ Platinum Traveler' : '🏅 Gold Traveler'}
                        </div>
                    </div>

                    {/* Stats & Destinations Section */}
                    <div className={styles["stats-dest-section"]}>
                        {/* Stats Row */}
                        <div className={styles["stats-grid"]}>
                            {[
                                { label: 'Countries Visited', val: stats.countries.toString(), color: '#ffc107' },
                                { label: 'Cities Explored', val: stats.cities.toString(), color: '#22d3ee' },
                                { label: 'Trips Planned', val: stats.trips.toString(), color: '#fb7185' },
                            ].map(stat => (
                                <div key={stat.label} className={styles["stat-box"]}>
                                    <div className={styles["stat-value"]} style={{ color: stat.color }}>{stat.val}</div>
                                    <div className={styles["stat-label"]}>{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Top Destinations */}
                        <div className={styles["destinations-container"]}>
                            <h3 className={styles["section-title"]}>
                                🗺️ Top Destinations
                            </h3>
                            <div className={styles["destinations-list"]}>
                                {topDestinations.length > 0 ? topDestinations.map(dest => (
                                    <div key={dest.rank} className={styles["destination-item"]}>
                                        <div className={styles["rank-circle"]}>{dest.rank}</div>
                                        <div className={styles["dest-info"]}>
                                            <div className={styles["dest-name"]}>{dest.name}</div>
                                            <div className={styles["dest-cities"]}>{dest.cities}</div>
                                        </div>
                                        <div className={styles["city-count-badge"]}>
                                            🏙️ {dest.count}
                                        </div>
                                    </div>
                                )) : (
                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Map out your adventures in the interactive chart map to see your top destinations here!</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Map & QR Section */}
                    <div className={styles["map-qr-section"]}>
                        <h3 className={styles["map-title"]}>My Travel Map</h3>
                        <div className={styles["mini-map-container"]}>
                            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=400" alt="Travel Map" className={styles["map-image"]} />
                            <div className={styles["map-overlay"]}>
                                <div className={`${styles["map-pin"]} ${styles["pin-1"]}`}>📍</div>
                                <div className={`${styles["map-pin"]} ${styles["pin-2"]}`}>📍</div>
                                <div className={`${styles["map-pin"]} ${styles["pin-3"]}`}>📍</div>
                            </div>
                        </div>

                        <div className={styles["qr-preview-container"]}>
                            <div className={styles["qr-code"]}>
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/' + profileSlug)}`} alt="QR Code" />
                            </div>
                            <div className={styles["qr-text"]}>
                                <span className={styles["qr-label"]}>Scan to view profile</span>
                                <span className={styles["qr-url"]}>snaptrip.com/{profileSlug}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions - Inside Card (No download icons) */}
                <div className={styles["card-footer"]}>
                    <div className={styles["share-text"]}>SnapTrip Premium Traveler</div>
                    <div className={styles["premium-badges"]}>
                        <span>Verified 2024</span>
                        <span>•</span>
                        <span>Global Access</span>
                    </div>
                </div>
            </div>

            {/* External Actions - Outside CardRef (Not captured in PNG) */}
            <div className={styles["external-actions"]}>
                <div className={styles["share-section"]}>
                    <span className={styles["section-label"]}>Share Your Journey</span>
                    <div className={styles["social-buttons"]}>
                        <button className={styles["social-btn"]} onClick={() => handleSocialShare('facebook')} title="Facebook">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                        </button>
                        <button className={styles["social-btn"]} onClick={() => handleSocialShare('twitter')} title="Twitter/X">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        </button>
                        <button className={styles["social-btn"]} onClick={() => handleSocialShare('whatsapp')} title="WhatsApp">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.431 5.623 1.435h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                        </button>
                        <button className={styles["social-btn"]} onClick={() => handleSocialShare('instagram')} title="Instagram">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.106.29 2.6.482.654.254 1.122.556 1.613 1.047.49.49.793.959 1.047 1.613.192.494.42 1.234.482 2.6.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.29 2.106-.482 2.6-.254.654-.556 1.122-1.047 1.613-.49.49-.959.793-1.613 1.047-.494.192-1.234.42-2.6.482-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.106-.29-2.6-.482-.654-.254-1.122-.556-1.613-1.047-.49-.49-.793-.959-1.047-1.613-.192-.494-.42-1.234-.482-2.6-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.29-2.106.482-2.6.254-.654.556-1.122 1.047-1.613.49-.49.959-.793 1.613-1.047.494-.192 1.234-.42 2.6-.482 1.266-.058 1.646-.07 4.85-.07zM12 0C8.741 0 8.333.014 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.132 5.775.072 7.053.014 8.333 0 8.741 0 12s.014 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126s1.384 1.078 2.126 1.384c.766.296 1.636.499 2.913.558C8.333 23.986 8.741 24 12 24s3.667-.014 4.947-.072c1.277-.06 2.148-.261 2.913-.558.788-.306 1.459-.717 2.126-1.384s1.078-1.384 1.384-2.126c.296-.766.499-1.636.558-2.913.058-1.28.072-1.687.072-4.947s-.014-3.667-.072-4.947c-.06-1.277-.261-2.148-.558-2.913-.306-.788-.717-1.459-1.384-2.126S18.65 1.03 17.86.724c-.765-.297-1.636-.499-2.913-.558C15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                        </button>
                    </div>
                </div>

                <div className={styles["action-group"]}>
                    <button className={styles["external-icon-btn"]} onClick={handleCopyLink} title="Copy Link">🔗 Copy Profile Link</button>
                    <button className={styles["external-download-btn"]} onClick={handleDownload}>📥 Download Card Image</button>
                </div>
            </div>
        </div>
    )
}
