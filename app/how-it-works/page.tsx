'use client'

import React from 'react';
import SiteHeader from '@/app/components/SiteHeader';
import SiteFooter from '@/app/components/SiteFooter';
import Link from 'next/link';

export default function HowItWorksPage() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb', fontFamily: "'Inter', sans-serif" }}>
            <SiteHeader />

            {/* Hero Section */}
            <section style={{
                backgroundColor: '#0a192f',
                color: 'white',
                padding: '120px 20px',
                textAlign: 'center',
                backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(34, 211, 238, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(255, 193, 7, 0.05) 0%, transparent 40%)'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <span style={{
                        backgroundColor: 'rgba(255, 193, 7, 0.1)',
                        color: '#ffc107',
                        padding: '8px 20px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        display: 'inline-block',
                        marginBottom: '20px'
                    }}>
                        The Magic Behind The Trip
                    </span>
                    <h1 style={{ fontSize: '4rem', marginBottom: '24px', fontWeight: '800', lineHeight: '1.1' }}>
                        How SnapTrip <span style={{ color: '#22d3ee' }}>Works</span>
                    </h1>
                    <p style={{ fontSize: '1.3rem', opacity: 0.9, lineHeight: '1.6', marginBottom: '40px' }}>
                        Discover how our AI engine processes millions of data points to create your personalized travel masterpiece in seconds.
                    </p>
                    <Link href="/" style={{
                        backgroundColor: '#ffc107',
                        color: '#0a192f',
                        padding: '18px 44px',
                        borderRadius: '12px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        display: 'inline-block',
                        boxShadow: '0 10px 20px rgba(246, 184, 0, 0.2)'
                    }}>
                        Try AI Planner Now
                    </Link>
                </div>
            </section>

            {/* AI Magic Section */}
            <section style={{ padding: '100px 20px', backgroundColor: 'white' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
                    <div style={{
                        height: '500px',
                        backgroundColor: '#0a192f',
                        borderRadius: '32px',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.1)'
                    }}>
                        {/* Decorative AI Elements */}
                        <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(34, 211, 238, 0.1)', filter: 'blur(50px)' }}></div>
                        <div style={{ zIndex: 2, textAlign: 'center' }}>
                            <div style={{ fontSize: '5rem', marginBottom: '10px' }}>🧠</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22d3ee' }}>Processing Data...</div>
                        </div>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '24px', color: '#0a192f', fontWeight: '800' }}>The AI Travel Engine</h2>
                        <p style={{ fontSize: '1.15rem', color: '#475569', lineHeight: '1.8', marginBottom: '30px' }}>
                            Our proprietary travel AI doesn&apos;t just pick random spots. It understands your personality, checks local events, analyzes weather patterns, and optimizes routes to ensure every moment of your trip is purposeful.
                        </p>
                        <div style={{ display: 'grid', gap: '20px' }}>
                            {[
                                { title: 'Deep Learning', desc: 'Analyzes millions of user reviews and travel blogs.' },
                                { title: 'Route Optimization', desc: 'Minimizes travel time between attractions.' },
                                { title: 'Tailored Balance', desc: 'Matches the intensity to your chosen relaxed or intense style.' }
                            ].map((feature) => (
                                <div key={feature.title} style={{ display: 'flex', gap: '20px' }}>
                                    <div style={{ backgroundColor: '#f1f5f9', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#ffc107', fontWeight: 'bold' }}>✓</div>
                                    <div>
                                        <h4 style={{ fontSize: '1.1rem', marginBottom: '5px', color: '#0a192f' }}>{feature.title}</h4>
                                        <p style={{ fontSize: '0.95rem', color: '#64748b' }}>{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Steps Section */}
            <section style={{ padding: '100px 20px', backgroundColor: '#f8fafc' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.8rem', marginBottom: '16px', color: '#0a192f', fontWeight: '800' }}>Simple 3-Step Process</h2>
                    <p style={{ fontSize: '1.15rem', color: '#64748b', marginBottom: '60px' }}>From &quot;Where should I go?&quot; to &quot;I&apos;m ready!&quot; in under a minute.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', position: 'relative' }}>
                        {/* Step 1 */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', backgroundColor: 'white', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 25px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', color: '#0ea5e9' }}>📍</div>
                            <h3 style={{ fontSize: '1.4rem', marginBottom: '15px', color: '#0a192f' }}>Choose Destination</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.6' }}>Select any country or city from our global database of travel hotspots.</p>
                        </div>
                        {/* Step 2 */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', backgroundColor: 'white', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 25px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', color: '#ffc107' }}>⚙️</div>
                            <h3 style={{ fontSize: '1.4rem', marginBottom: '15px', color: '#0a192f' }}>Set Your Vibe</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.6' }}>Define your pace, duration, and whether you prefer nature or deep culture.</p>
                        </div>
                        {/* Step 3 */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', backgroundColor: 'white', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 25px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', color: '#10b981' }}>🗺️</div>
                            <h3 style={{ fontSize: '1.4rem', marginBottom: '15px', color: '#0a192f' }}>AI Generates Plan</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.6' }}>Our AI builds a custom itinerary with map integration and daily schedules.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why It's Smarter Section */}
            <section style={{ padding: '100px 20px', backgroundColor: 'white' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.8rem', marginBottom: '60px', color: '#0a192f', fontWeight: '800' }}>Why AI Is Smarter Than Manual Planning</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px', textAlign: 'left' }}>
                        <div style={{ padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', background: '#fff' }}>
                            <h4 style={{ fontSize: '1.3rem', marginBottom: '15px', color: '#0a192f', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ color: '#0ea5e9' }}>⌛</span> Saves 20+ Hours
                            </h4>
                            <p style={{ color: '#64748b', lineHeight: '1.7' }}>
                                Skip the countless tabs and spreadsheet nightmares. SnapTrip does the research and organization for you instantly.
                            </p>
                        </div>
                        <div style={{ padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', background: '#fff' }}>
                            <h4 style={{ fontSize: '1.3rem', marginBottom: '15px', color: '#0a192f', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ color: '#ffc107' }}>💎</span> Discover Hidden Gems
                            </h4>
                            <p style={{ color: '#64748b', lineHeight: '1.7' }}>
                                Our AI identifies off-the-beaten-path locations that aren&apos;t in the standard top 10 lists but match your specific tastes.
                            </p>
                        </div>
                        <div style={{ padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', background: '#fff' }}>
                            <h4 style={{ fontSize: '1.3rem', marginBottom: '15px', color: '#0a192f', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ color: '#10b981' }}>📉</span> Live Optimization
                            </h4>
                            <p style={{ color: '#64748b', lineHeight: '1.7' }}>
                                We consider daily openings, seasonal trends, and geographical logic to ensure your route actually makes sense.
                            </p>
                        </div>
                        <div style={{ padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', background: '#fff' }}>
                            <h4 style={{ fontSize: '1.3rem', marginBottom: '15px', color: '#0a192f', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ color: '#ec4899' }}>🔄</span> Fully Editable
                            </h4>
                            <p style={{ color: '#64748b', lineHeight: '1.7' }}>
                                The AI provides the foundation, but you have total control. Swap places, change dates, and refine until it&apos;s perfect.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section style={{ padding: '120px 20px', backgroundColor: '#0a192f', textAlign: 'center', color: 'white' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '3rem', marginBottom: '24px', fontWeight: '800' }}>Stop Planning, Start Exploring</h2>
                    <p style={{ fontSize: '1.25rem', opacity: 0.8, marginBottom: '40px' }}>
                        Your next unforgettable adventure is just a few clicks away. Let our AI take the lead.
                    </p>
                    <Link href="/" style={{
                        backgroundColor: '#ffc107',
                        color: '#0a192f',
                        padding: '18px 44px',
                        borderRadius: '12px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        display: 'inline-block'
                    }}>
                        Get Started for Free
                    </Link>
                </div>
            </section>

            <SiteFooter />
        </div>
    );
}
