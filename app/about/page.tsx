'use client'

import React from 'react';
import SiteHeader from '@/app/components/SiteHeader';
import SiteFooter from '@/app/components/SiteFooter';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb', fontFamily: "'Inter', sans-serif" }}>
            <SiteHeader />

            {/* Hero Section */}
            <section style={{
                backgroundColor: '#0a192f',
                color: 'white',
                padding: '100px 20px',
                textAlign: 'center',
                backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(34, 211, 238, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255, 193, 7, 0.05) 0%, transparent 50%)'
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
                        Our Story
                    </span>
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '20px', fontWeight: '800', lineHeight: '1.1' }}>
                        Our Journey <span style={{ color: '#ffc107' }}>Starts Here</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', opacity: 0.9, lineHeight: '1.6', marginBottom: '40px' }}>
                        SnapTrip was born from a simple idea: making travel planning as exciting as the trip itself. We use AI to turn your dreams into reality.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '40px' }}>
                        <div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ffc107' }}>50k+</div>
                            <div style={{ fontSize: '14px', opacity: 0.7 }}>Happy Travelers</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ffc107' }}>120+</div>
                            <div style={{ fontSize: '14px', opacity: 0.7 }}>Countries Explored</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ffc107' }}>5M+</div>
                            <div style={{ fontSize: '14px', opacity: 0.7 }}>Places Discovered</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section style={{ padding: '100px 20px', backgroundColor: 'white' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#0a192f', fontWeight: '800' }}>Our Mission</h2>
                        <p style={{ fontSize: '1.1rem', color: '#475569', lineHeight: '1.8', marginBottom: '30px' }}>
                            We aim to democratize travel planning by leveraging cutting-edge AI technology. We believe everyone deserves a personalized, stress-free travel experience that respects their time and budget.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {['Personalized Itineraries', 'Local Expertise', 'Easy to Use'].map((item) => (
                                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontSize: '1.05rem', color: '#0a192f', fontWeight: '600' }}>
                                    <span style={{ color: '#ffc107' }}>✓</span> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div style={{
                        height: '400px',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '24px',
                        backgroundImage: 'url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200&auto=format&fit=crop)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                    }} />
                </div>
            </section>

            {/* How it Works (Short) */}
            <section style={{ padding: '100px 20px', backgroundColor: '#f8fafc' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '60px', color: '#0a192f', fontWeight: '800' }}>How SnapTrip Works</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px' }}>
                        {[
                            { step: '01', title: 'Choose Destination', desc: 'Pick any country or city you want to explore.' },
                            { step: '02', title: 'Set Preferences', desc: 'Tell us your style, duration, and interests.' },
                            { step: '03', title: 'AI Generation', desc: 'Our AI crafts the perfect itinerary in seconds.' },
                            { step: '04', title: 'Enjoy Your Trip', desc: 'Focus on the experience, we handle the plan.' }
                        ].map((item) => (
                            <div key={item.step} style={{ backgroundColor: 'white', padding: '40px 30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'left' }}>
                                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ffc107', marginBottom: '15px' }}>{item.step}</div>
                                <h4 style={{ fontSize: '1.25rem', marginBottom: '10px', color: '#0a192f' }}>{item.title}</h4>
                                <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: '1.6' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: '100px 20px', backgroundColor: '#ffc107', textAlign: 'center' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#0a192f', fontWeight: '800' }}>Ready for Your Next Adventure?</h2>
                    <p style={{ fontSize: '1.2rem', color: '#0a192f', opacity: 0.8, marginBottom: '40px' }}>
                        Join thousands of travelers who plan their trips with SnapTrip.
                    </p>
                    <Link href="/" style={{
                        backgroundColor: '#0a192f',
                        color: 'white',
                        padding: '16px 40px',
                        borderRadius: '12px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        display: 'inline-block',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                    }}>
                        Get Started for Free
                    </Link>
                </div>
            </section>

            <SiteFooter />
        </div>
    );
}
