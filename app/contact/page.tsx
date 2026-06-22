'use client'

import React, { useState } from 'react';
import SiteHeader from '@/app/components/SiteHeader';
import SiteFooter from '@/app/components/SiteFooter';

export default function ContactPage() {
    const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', phone: '', subject: 'General Inquiry', message: '' })
    const [status, setStatus] = useState({ type: '', msg: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setStatus({ type: '', msg: '' })

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (res.ok) {
                setStatus({ type: 'success', msg: 'Message sent successfully! We will get back to you soon.' })
                setFormData({ first_name: '', last_name: '', email: '', phone: '', subject: 'General Inquiry', message: '' })
            } else {
                setStatus({ type: 'danger', msg: data.error || 'Failed to send message.' })
            }
        } catch (err) {
            setStatus({ type: 'danger', msg: 'Network error. Please try again.' })
        } finally {
            setIsSubmitting(false)
        }
    }
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb', fontFamily: "'Inter', sans-serif" }}>
            <SiteHeader />

            {/* Hero Section */}
            <section style={{
                backgroundColor: '#0f172a', /* Solid dark navy/slate */
                color: 'white',
                padding: '80px 20px 140px 20px', /* Increased bottom padding for overlap */
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <span style={{
                        backgroundColor: '#0f3a47', /* Dark teal */
                        color: '#2dd4bf', /* Light teal */
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '600',
                        display: 'inline-block',
                        marginBottom: '20px'
                    }}>
                        Get in Touch
                    </span>
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '20px', fontWeight: '800', lineHeight: '1.1', fontFamily: 'var(--font-serif)' }}>
                        We&apos;re Here to <span style={{ color: '#ffc107', fontStyle: 'italic' }}>Help You</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', opacity: 0.9, lineHeight: '1.6' }}>
                        Have questions about our AI planner or need help with your itinerary? Our team is ready to assist you.
                    </p>
                </div>
            </section>

            {/* Contact Cards */}
            <section style={{ padding: '0 20px 60px', marginTop: '-80px', position: 'relative', zIndex: 10 }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                    {[
                        { 
                            icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>, 
                            label: 'Email Us', val: 'support@snaptrip.com', color: '#a855f7', bg: '#f3e8ff' 
                        },
                        { 
                            icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>, 
                            label: 'Visit Us', val: 'San Francisco, CA', color: '#ef4444', bg: '#fee2e2' 
                        }
                    ].map((item) => (
                        <div key={item.label} style={{
                            backgroundColor: 'white',
                            padding: '30px 20px',
                            borderRadius: '16px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                            textAlign: 'center',
                            border: '1px solid #f1f5f9'
                        }}>
                            <div style={{ 
                                width: '50px', height: '50px', borderRadius: '50%', 
                                backgroundColor: item.bg, color: item.color, 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                margin: '0 auto 15px' 
                            }}>
                                {item.icon}
                            </div>
                            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#0a192f', fontWeight: '800' }}>{item.label}</h4>
                            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{item.val}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Form Section */}
            <section style={{ padding: '60px 20px' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0', backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                    <div style={{ backgroundColor: '#0f172a', padding: '60px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <h3 style={{ fontSize: '2rem', marginBottom: '20px', fontWeight: '700', fontFamily: 'var(--font-serif)' }}>Send us a Message</h3>
                            <p style={{ opacity: 0.8, lineHeight: '1.6', fontSize: '1rem', maxWidth: '80%' }}>
                                Fill out the form and our team will get back to you within 24 hours.
                            </p>
                        </div>
                        <div style={{ marginTop: '40px' }}>
                            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ color: '#ffc107', fontSize: '1.2rem' }}>⭐</div>
                                <span>Rated 4.9/5 by our users</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ color: '#ffc107', fontSize: '1.2rem' }}>⚡</div>
                                <span>Fast response time</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '60px' }}>
                        {status.msg && (
                            <div style={{ padding: '16px', borderRadius: '8px', marginBottom: '20px', backgroundColor: status.type === 'success' ? '#dcfce7' : '#fee2e2', color: status.type === 'success' ? '#166534' : '#991b1b', fontWeight: '500' }}>
                                {status.msg}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: '#0a192f' }}>First Name</label>
                                    <input type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} required placeholder="John" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: '#0a192f' }}>Last Name</label>
                                    <input type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} required placeholder="Doe" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: '#0a192f' }}>Email Address</label>
                                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required placeholder="john@example.com" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: '#0a192f' }}>Phone Number (Optional)</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <select style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', width: '80px', flexShrink: 0 }}>
                                            <option>+1</option>
                                            <option>+44</option>
                                            <option>+91</option>
                                        </select>
                                        <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="(555) 000-0000" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }} />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: '#0a192f' }}>Subject</label>
                                <select value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', appearance: 'none' }}>
                                    <option value="None">None</option>
                                    <option value="General Inquiry">General Inquiry</option>
                                    <option value="Technical Support">Technical Support</option>
                                    <option value="Feedback">Feedback</option>
                                    <option value="Suggest Feature">Suggest Feature</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: '#0a192f' }}>Message</label>
                                <textarea rows={4} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} required placeholder="How can we help you?" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', resize: 'none' }} />
                            </div>
                            <button type="submit" disabled={isSubmitting} style={{ backgroundColor: '#ffc107', color: '#0a192f', padding: '16px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '1rem', opacity: isSubmitting ? 0.7 : 1 }}>
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '40px', color: '#0a192f', fontWeight: '800', textAlign: 'center' }}>Frequently Asked Questions</h2>
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {[
                            { q: 'What is SnapTrip?', a: 'SnapTrip is an AI-powered travel planner that creates personalized itineraries in seconds. It helps you discover destinations, organize activities, and optimize your trip based on your budget and preferences.' },
                            { q: 'How does SnapTrip generate itineraries?', a: 'Our smart AI analyzes your travel dates, budget, style, and interests to suggest the best attractions, restaurants, and hidden gems. It then organizes everything into a logical, day-by-day plan.' },
                            { q: 'Can I edit my itinerary after it\'s generated?', a: 'Yes! Your itinerary is fully customizable. You can drag and drop activities, swap locations, and tweak timings until it’s exactly what you want.' },
                            { q: 'Is SnapTrip free to use?', a: 'SnapTrip offers a free version with essential planning tools. We also provide premium features for travelers looking for advanced customization and exclusive perks.' },
                            { q: 'Do I need to create an account to plan a trip?', a: 'While you can explore destinations without an account, signing up allows you to save your itineraries, edit them later, and access them across devices.' },
                            { q: 'Can I share my itinerary with friends and family?', a: 'Yes! You can easily generate a shareable link or export your itinerary as a PDF to keep your travel companions in the loop.' },
                            { q: 'Does the map feature work offline?', a: 'You can download a summary of your itinerary and maps for offline access, ensuring you always know where to go even without an internet connection.' }
                        ].map((faq) => (
                            <div key={faq.q} style={{ padding: '24px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                <h4 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#0a192f', fontWeight: '700' }}>{faq.q}</h4>
                                <p style={{ color: '#64748b', lineHeight: '1.6' }}>{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <SiteFooter />
        </div>
    );
}
