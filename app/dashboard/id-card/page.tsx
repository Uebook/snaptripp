'use client'

import React from 'react'
import TravelerIDCard from '@/app/components/TravelerIDCard'

export default function TravelerIDCardPage() {
    return (
        <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc', minHeight: '100vh' }}>
            <div style={{ width: '100%', maxWidth: '900px', marginBottom: '30px', textAlign: 'left' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0a192f', margin: 0 }}>My Traveler ID</h1>
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>Your premium passport to the world. Share your verified travel footprint.</p>
            </div>

            <TravelerIDCard />

            <div style={{ marginTop: '40px', display: 'flex', gap: '20px' }}>
                <button style={{
                    padding: '12px 30px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#0a192f',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    📥 Download as PNG
                </button>
                <button style={{
                    padding: '12px 30px',
                    borderRadius: '12px',
                    border: '1px solid #0a192f',
                    background: 'white',
                    color: '#0a192f',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}>
                    🔗 Copy Profile Link
                </button>
            </div>
        </div>
    )
}
