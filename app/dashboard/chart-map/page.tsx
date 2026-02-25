'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const ChartMap = dynamic(() => import('@/app/components/ChartMap'), {
    ssr: false,
    loading: () => <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '16px' }}>Loading world map...</div>
})

export default function ChartMapPage() {
    return (
        <div style={{ height: 'calc(100vh - 40px)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0a192f', margin: 0 }}>Global Footprint Map</h1>
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>Track and visualize your travel history across the globe.</p>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
                <ChartMap />
            </div>
        </div>
    )
}
