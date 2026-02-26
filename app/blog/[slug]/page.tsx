'use client'

import React from 'react';
import { useParams } from 'next/navigation';
import SiteHeader from '@/app/components/SiteHeader';
import SiteFooter from '@/app/components/SiteFooter';
import Link from 'next/link';

export default function BlogDetailsPage() {
    const { slug } = useParams();

    const blogs = [
        {
            title: 'Hidden Gems in the Mediterranean',
            slug: 'hidden-gems-mediterranean',
            content: `
                <p>The Mediterranean is home to some of the world's most famous destinations, but beyond the crowded streets of Santorini and the bustling beaches of the Amalfi Coast lie hidden gems waiting to be discovered.</p>
                <h2>1. Procida, Italy</h2>
                <p>While neighboring Capri and Ischia get most of the attention, Procida remains a colorful, authentic escape. Its pastel-hued houses and quiet marinas offer a glimpse into traditional Italian island life.</p>
                <h2>2. Kas, Turkey</h2>
                <p>Nestled on Turkey's turquoise coast, Kas is a bohemian paradise. It's famous for its crystal-clear waters, ancient ruins, and a vibrant local market that comes alive every week.</p>
                <h2>3. Mellieha, Malta</h2>
                <p>Mellieha offers some of the best beaches in Malta, along with stunning views of the countryside. It's the perfect spot for those looking to combine relaxation with historical exploration.</p>
            `,
            category: 'Destinations',
            date: 'Feb 5, 2026',
            readTime: '5 min read',
            image: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=1200&auto=format&fit=crop'
        },
        {
            title: 'Budget Travel: Europe on $50/Day',
            slug: 'budget-travel-europe',
            content: `
                <p>Europe doesn't have to be expensive. With a bit of planning and some insider knowledge, you can explore the continent's most beautiful cities on a modest budget.</p>
                <h2>Travel Off-Season</h2>
                <p>Prices for accommodation and flights drop significantly outside of the peak summer months. Consider visiting in spring or autumn for a more affordable and less crowded experience.</p>
                <h2>Use Public Transport</h2>
                <p>Europe has some of the best public transport networks in the world. Instead of taxis or car rentals, use trains, buses, and metro systems to get around.</p>
                <h2>Eat Like a Local</h2>
                <p>Avoid restaurants in tourist hotspots. Instead, explore local markets and backstreet bistros where you can find delicious, authentic food at a fraction of the cost.</p>
            `,
            category: 'Travel Tips',
            date: 'Feb 3, 2026',
            readTime: '7 min read',
            image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200&auto=format&fit=crop'
        },
        {
            title: 'Best Mountains to Visit in 2026',
            slug: 'best-mountains-2026',
            content: `
                <p>For adventure seekers and nature lovers, there's nothing quite like the majesty of a mountain range. Here are our top picks for mountain destinations in 2026.</p>
                <h2>1. The Dolomites, Italy</h2>
                <p>Famous for their unique limestone peaks and stunning alpine meadows, the Dolomites offer incredible hiking in the summer and world-class skiing in the winter.</p>
                <h2>2. Torres del Paine, Chile</h2>
                <p>This Chilean national park is a dream for trekkers. Its granite towers, turquoise lakes, and vast glaciers provide a truly epic backdrop for any adventure.</p>
                <h2>3. Banff National Park, Canada</h2>
                <p>Banff is a year-round destination with something for everyone. From the iconic Lake Louise to the rugged peaks of the Rockies, it's a place of unparalleled natural beauty.</p>
            `,
            category: 'Adventure',
            date: 'Jan 28, 2026',
            readTime: '6 min read',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop'
        },
        {
            title: 'The Art of Solo Travel: A Guide',
            slug: 'solo-travel-guide',
            content: `
                <p>Traveling alone can be one of the most rewarding experiences of your life. It offers complete freedom, the chance to meet new people, and an opportunity for deep self-discovery.</p>
                <h2>Start Small</h2>
                <p>If you're nervous about your first solo trip, start with a weekend getaway to a nearby city. This will help you build confidence before embarking on a longer journey.</p>
                <h2>Stay in Hostels</h2>
                <p>Hostels are great for solo travelers as they provide a social environment where it's easy to meet other people. Many offer private rooms if you're not ready for a dorm.</p>
                <h2>Trust Your Instincts</h2>
                <p>Safety is paramount when traveling alone. Trust your gut and be aware of your surroundings at all times.</p>
            `,
            category: 'Guide',
            date: 'Jan 20, 2026',
            readTime: '8 min read',
            image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop'
        },
        {
            title: 'Top 10 Street Foods in Southeast Asia',
            slug: 'southeast-asia-street-food',
            content: `
                <p>Southeast Asia is a food lover's paradise, and some of the best meals you'll ever have will be from a street stall.</p>
                <h2>1. Pad Thai, Thailand</h2>
                <p>A classic for a reason. This stir-fried noodle dish is a perfect balance of sweet, sour, and savory flavors.</p>
                <h2>2. Pho, Vietnam</h2>
                <p>This fragrant noodle soup is a staple of Vietnamese cuisine. It's often served with fresh herbs, lime, and chili for an extra kick.</p>
                <h2>3. Nasi Goreng, Indonesia</h2>
                <p>Indonesian fried rice is typically served with a fried egg on top and a side of prawn crackers. It's simple, filling, and delicious.</p>
            `,
            category: 'Food',
            date: 'Jan 15, 2026',
            readTime: '10 min read',
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop'
        },
        {
            title: 'Sustainable Travel: Why it Matters',
            slug: 'sustainable-travel-importance',
            content: `
                <p>As the world becomes more aware of the impact of travel on the environment, sustainable travel is more important than ever.</p>
                <h2>Support Local Communities</h2>
                <p>Choose locally-owned accommodation, eat at independent restaurants, and hire local guides. This ensures that your money stays within the community you're visiting.</p>
                <h2>Reduce Your Carbon Footprint</h2>
                <p>Consider alternatives to flying when possible, such as trains or buses. When you do fly, consider carbon offsetting your journey.</p>
                <h2>Respect Nature</h2>
                <p>Stay on marked trails, dispose of waste properly, and avoid activities that exploit animals.</p>
            `,
            category: 'Nature',
            date: 'Jan 10, 2026',
            readTime: '6 min read',
            image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200&auto=format&fit=crop'
        }
    ];

    const blog = blogs.find(b => b.slug === slug);

    if (!blog) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <SiteHeader />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 20px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ fontSize: '3rem', color: '#0a192f', marginBottom: '20px' }}>Post Not Found</h1>
                        <p style={{ color: '#64748b', marginBottom: '30px' }}>Sorry, the blog post you are looking for doesn&apos;t exist.</p>
                        <Link href="/blog" style={{ color: '#ffc107', fontWeight: 'bold' }}>Back to Blog</Link>
                    </div>
                </div>
                <SiteFooter />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', fontFamily: "'Inter', sans-serif" }}>
            <SiteHeader />

            {/* Article Hero */}
            <section style={{ position: 'relative', height: '60vh', minHeight: '400px', width: '100%' }}>
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${blog.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }} />
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, rgba(10, 25, 47, 0.4), rgba(10, 25, 47, 0.8))',
                }} />
                <div style={{
                    position: 'relative',
                    height: '100%',
                    maxWidth: '900px',
                    margin: '0 auto',
                    padding: '0 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    color: 'white',
                    textAlign: 'center'
                }}>
                    <div style={{ marginBottom: '20px' }}>
                        <span style={{
                            backgroundColor: '#ffc107',
                            color: '#0a192f',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}>
                            {blog.category}
                        </span>
                    </div>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px', lineHeight: '1.2' }}>{blog.title}</h1>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '1rem', opacity: 0.9 }}>
                        <span>{blog.date}</span>
                        <span>•</span>
                        <span>{blog.readTime}</span>
                    </div>
                </div>
            </section>

            {/* Article Content */}
            <main style={{ flex: 1, maxWidth: '800px', margin: '0 auto', padding: '80px 20px' }}>
                {/* Breadcrumbs */}
                <nav style={{ marginBottom: '40px', fontSize: '0.9rem', color: '#64748b', display: 'flex', gap: '8px' }}>
                    <Link href="/" style={{ color: '#0a192f', textDecoration: 'none' }}>Home</Link>
                    <span>/</span>
                    <Link href="/blog" style={{ color: '#0a192f', textDecoration: 'none' }}>Blog</Link>
                    <span>/</span>
                    <span style={{ opacity: 0.6 }}>{blog.title}</span>
                </nav>

                <article className="prose" style={{
                    color: '#0a192f',
                    lineHeight: '1.8',
                    fontSize: '1.2rem'
                }}>
                    <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                </article>

                {/* Share Section */}
                <div style={{ marginTop: '60px', padding: '30px 0', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontWeight: '700' }}>Share this story</h4>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        {['𝕏', '📸', '📘'].map(icon => (
                            <button key={icon} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {icon}
                            </button>
                        ))}
                    </div>
                </div>
            </main>

            {/* More Stories */}
            <section style={{ backgroundColor: '#f8fafc', padding: '100px 20px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#0a192f' }}>More Stories</h2>
                        <Link href="/blog" style={{ color: '#0a192f', fontWeight: 'bold' }}>View All →</Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
                        {blogs.filter(b => b.slug !== slug).slice(0, 3).map(related => (
                            <Link key={related.slug} href={`/blog/${related.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0', height: '100%' }}>
                                    <div style={{ height: '200px', backgroundImage: `url(${related.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                    <div style={{ padding: '25px' }}>
                                        <h4 style={{ marginBottom: '10px', fontWeight: '700' }}>{related.title}</h4>
                                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>{related.date}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <SiteFooter />

            <style jsx global>{`
                .prose h2 {
                    font-size: 2rem;
                    font-weight: 800;
                    margin: 40px 0 20px;
                    color: #0a192f;
                }
                .prose p {
                    margin-bottom: 25px;
                }
            `}</style>
        </div>
    );
}
