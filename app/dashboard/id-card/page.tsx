'use client'

import React from 'react'
import TravelerIDCard from '@/app/components/TravelerIDCard'

export default function TravelerIDCardPage() {
    return (
        <div style={{ padding: 'clamp(20px, 5vw, 40px)', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc', minHeight: '100vh' }}>
            <div style={{ width: '100%', maxWidth: '900px', marginBottom: '30px', textAlign: 'left' }}>
                <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 'bold', color: '#0a192f', margin: 0 }}>My Traveler ID</h1>
                <p style={{ fontSize: 'clamp(12px, 2vw, 14px)', color: '#64748b', marginTop: '5px' }}>Your premium passport to the world. Share your verified travel footprint.</p>
            </div>

            <TravelerIDCard />
        </div>
    )
}
