'use client'

import React, { useState } from 'react';
import SiteHeader from '@/app/components/SiteHeader';
import SiteFooter from '@/app/components/SiteFooter';
import Link from 'next/link';

export default function BlogPage() {
    const [activeCategory, setActiveCategory] = useState('All');

    const blogs = [
        {
            title: 'Hidden Gems in the Mediterranean',
            slug: 'hidden-gems-mediterranean',
            excerpt: 'Discover secret beaches, charming villages, and authentic local experiences away from tourist crowds.',
            category: 'Destinations',
            date: 'Feb 5, 2026',
            readTime: '5 min read',
            image: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=800&auto=format&fit=crop'
        },
        {
            title: 'Budget Travel: Europe on $50/Day',
            slug: 'budget-travel-europe',
            excerpt: 'Learn how to explore Europe without breaking the bank with our expert money-saving tips and tricks.',
            category: 'Travel Tips',
            date: 'Feb 3, 2026',
            readTime: '7 min read',
            image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop'
        },
        {
            title: 'Best Mountains to Visit in 2026',
            slug: 'best-mountains-2026',
            excerpt: 'From the Alps to the Himalayas, explore the most breathtaking mountain destinations for adventure seekers.',
            category: 'Adventure',
            date: 'Jan 28, 2026',
            readTime: '6 min read',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop'
        },
        {
            title: 'The Art of Solo Travel: A Guide',
            slug: 'solo-travel-guide',
            excerpt: 'Everything you need to know about traveling alone, from safety tips to meeting new people along the way.',
            category: 'Guide',
            date: 'Jan 20, 2026',
            readTime: '8 min read',
            image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop'
        },
        {
            title: 'Top 10 Street Foods in Southeast Asia',
            slug: 'southeast-asia-street-food',
            excerpt: 'A culinary journey through the vibrant markets and street stalls of Bangkok, Hanoi, and beyond.',
            category: 'Food',
            date: 'Jan 15, 2026',
            readTime: '10 min read',
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop'
        },
        {
            title: 'Sustainable Travel: Why it Matters',
            slug: 'sustainable-travel-importance',
            excerpt: 'How to reduce your carbon footprint and support local communities during your next vacation.',
            category: 'Nature',
            date: 'Jan 10, 2026',
            readTime: '6 min read',
            image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop'
        }
    ];

    const filteredBlogs = activeCategory === 'All'
        ? blogs
        : blogs.filter(b => b.category === activeCategory);

    const categories = ['All', 'Destinations', 'Travel Tips', 'Adventure', 'Food', 'Nature'];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb', fontFamily: "'Inter', sans-serif" }}>
            <SiteHeader />

            {/* Hero Section */}
            <section style={{
                backgroundColor: '#0a192f',
                color: 'white',
                padding: '100px 20px',
                textAlign: 'center',
                backgroundImage: 'radial-gradient(circle at 50% 120%, rgba(34, 211, 238, 0.1) 0%, transparent 60%)'
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
                        Explore Our World
                    </span>
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '20px', fontWeight: '800', lineHeight: '1.1' }}>
                        Travel Stories & <span style={{ color: '#22d3ee' }}>Expert Tips</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', opacity: 0.9, lineHeight: '1.6' }}>
                        Discover hidden gems, budget guides, and inspiring adventures from our community of global travelers.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section style={{ padding: '60px 20px', flex: 1 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {/* Categories UI */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '60px', flexWrap: 'wrap' }}>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                style={{
                                    padding: '10px 24px',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    backgroundColor: activeCategory === cat ? '#0a192f' : 'white',
                                    color: activeCategory === cat ? 'white' : '#64748b',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Blog Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
                        {filteredBlogs.map((blog) => (
                            <div key={blog.title} style={{ backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
                                <div style={{
                                    height: '240px',
                                    backgroundImage: `url(${blog.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    position: 'relative'
                                }}>
                                    <span style={{
                                        position: 'absolute',
                                        top: '20px',
                                        left: '20px',
                                        backgroundColor: '#ffc107',
                                        color: '#0a192f',
                                        padding: '6px 14px',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}>
                                        {blog.category}
                                    </span>
                                </div>
                                <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#94a3b8', marginBottom: '15px' }}>
                                        <span>{blog.date}</span>
                                        <span>•</span>
                                        <span>{blog.readTime}</span>
                                    </div>
                                    <h3 style={{ fontSize: '1.4rem', color: '#0a192f', marginBottom: '15px', fontWeight: '800', lineHeight: '1.3' }}>{blog.title}</h3>
                                    <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '25px', flex: 1 }}>{blog.excerpt}</p>
                                    <Link href={`/blog/${blog.slug}`} style={{
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        color: '#0a192f',
                                        fontWeight: '800',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: 0,
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        textDecoration: 'none'
                                    }}>
                                        Read More <span style={{ color: '#ffc107', fontSize: '1.2rem' }}>→</span>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter CTA */}
            <section style={{ padding: '80px 20px', backgroundColor: '#f1f5f9' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', backgroundColor: '#0a192f', padding: '60px', borderRadius: '32px', color: 'white' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', fontWeight: '800' }}>Never Miss a Story</h2>
                    <p style={{ opacity: 0.8, marginBottom: '30px', fontSize: '1.1rem' }}>
                        Subscribe to our newsletter and get the latest travel inspiration delivered to your inbox every week.
                    </p>
                    <div style={{ display: 'flex', gap: '15px', maxWidth: '500px', margin: '0 auto' }}>
                        <input type="email" placeholder="Enter your email" style={{ flex: 1, padding: '16px 24px', borderRadius: '12px', border: 'none', outline: 'none', fontSize: '1rem' }} />
                        <button style={{ backgroundColor: '#ffc107', color: '#0a192f', padding: '16px 30px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                            Subscribe
                        </button>
                    </div>
                </div>
            </section>

            <SiteFooter />
        </div>
    );
}
