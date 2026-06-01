'use client'

import React, { useState } from 'react';
import SiteHeader from '@/app/components/SiteHeader';
import SiteFooter from '@/app/components/SiteFooter';

export default function ContactPage() {
    const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', subject: 'General Inquiry', message: '' })
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
                setFormData({ first_name: '', last_name: '', email: '', subject: 'General Inquiry', message: '' })
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
                backgroundColor: '#0a192f',
                color: 'white',
                padding: '100px 20px',
                textAlign: 'center',
                backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(34, 211, 238, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(255, 193, 7, 0.05) 0%, transparent 40%)'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <span style={{
                        backgroundColor: 'rgba(34, 211, 238, 0.1)',
                        color: '#22d3ee',
                        padding: '8px 20px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        display: 'inline-block',
                        marginBottom: '20px'
                    }}>
                        Get in Touch
                    </span>
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '20px', fontWeight: '800', lineHeight: '1.1' }}>
                        We&apos;re Here to <span style={{ color: '#ffc107' }}>Help You</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', opacity: 0.9, lineHeight: '1.6' }}>
                        Have questions about our AI planner or need help with your itinerary? Our team is available 24/7 to assist you.
                    </p>
                </div>
            </section>

            {/* Contact Cards */}
            <section style={{ padding: '60px 20px', marginTop: '-60px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                    {[
                        { icon: '✉️', label: 'Email Us', val: 'support@snaptrip.com', color: 'blue' },
                        { icon: '📞', label: 'Call Us', val: '+1 (555) 000-0000', color: 'gold' },
                        { icon: '📍', label: 'Visit Us', val: 'San Francisco, CA', color: 'purple' },
                        { icon: '🌐', label: 'Follow Us', val: '@snaptrip_ai', color: 'cyan' }
                    ].map((item) => (
                        <div key={item.label} style={{
                            backgroundColor: 'white',
                            padding: '30px',
                            borderRadius: '16px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                            textAlign: 'center',
                            border: '1px solid #f1f5f9'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '15px' }}>{item.icon}</div>
                            <h4 style={{ fontSize: '1.1rem', marginBottom: '5px', color: '#0a192f', fontWeight: '700' }}>{item.label}</h4>
                            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>{item.val}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Form Section */}
            <section style={{ padding: '60px 20px' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '60px', backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                    <div style={{ backgroundColor: '#0a192f', padding: '60px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <h3 style={{ fontSize: '2rem', marginBottom: '20px', fontWeight: '800' }}>Send us a Message</h3>
                            <p style={{ opacity: 0.8, lineHeight: '1.6', fontSize: '1.05rem' }}>
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
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: '#0a192f' }}>Email Address</label>
                                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required placeholder="john@example.com" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: '#0a192f' }}>Subject</label>
                                <select value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }}>
                                    <option value="General Inquiry">General Inquiry</option>
                                    <option value="Technical Support">Technical Support</option>
                                    <option value="Feedback">Feedback</option>
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
            <section style={{ padding: '100px 20px', backgroundColor: 'white' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '40px', color: '#0a192f', fontWeight: '800', textAlign: 'center' }}>Frequently Asked Questions</h2>
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {[
                            { q: 'Is SnapTrip free to use?', a: 'Yes! Our basic AI itinerary generator is free for all users.' },
                            { q: 'How accurate is the AI planning?', a: 'Our AI is trained on millions of travel data points to provide highly accurate and realistic recommendations.' },
                            { q: 'Can I Save my itineraries?', a: 'Absolutely! Just create a free account to save and manage all your trips in one place.' }
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
