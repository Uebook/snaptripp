'use client'
import './home.css'
import 'leaflet/dist/leaflet.css'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  const destinationImages = [
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1443926818681-717d074a57af?q=80&w=1200&auto=format&fit=crop'
  ]
  const blogImages = [
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop'
  ]
  const audienceImages = [
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop'
  ]
  const testimonialImages = [
    'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop'
  ]
  return (
    <main className="home-root">
      <SiteHeader />

      <section className="hero">
        <div className="hero-left">
          <div className="pill">AI-Powered Travel Planning</div>
          <h1>
            Plan Your <br /> Dream Trip <br /> in <span className="highlight">Seconds</span>
          </h1>
          <p>
            SnapTrip turns your travel ideas into smart, personalised itineraries instantly
            with cutting-edge AI technology.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={() => router.push('/plan')}>
              Start Planning
            </button>
            <button className="secondary">Watch Demo</button>
          </div>
        </div>
        <div className="hero-right">
          <div className="quick-search">
            <h3>Quick Search</h3>
            <label>Where do you want to go?</label>
            <input placeholder="Select Destination" />
            <div className="quick-row">
              <div>
                <label>Check In</label>
                <input placeholder="mm/dd/yyyy" />
              </div>
              <div>
                <label>Check Out</label>
                <input placeholder="mm/dd/yyyy" />
              </div>
            </div>
            <div className="quick-grid">
              <button>Adventure</button>
              <button>Relaxation</button>
              <button>Cultural</button>
              <button>Luxury</button>
            </div>
            <button className="primary full">Generate Itinerary</button>
          </div>
        </div>
      </section>

      <section id="destinations" className="section light">
        <div className="section-title">
          <span className="pill soft">Top Destinations</span>
          <h2>Countries People Love the Most!</h2>
          <p>Explore the world&apos;s most stunning destinations with AI-powered recommendations</p>
        </div>
        <div className="destination-grid">
          {[
            { name: 'Greece', stat: '245 Trips Planned', tags: ['Islands', 'History', 'Beach'] },
            { name: 'Italy', stat: '312 Tours Available', tags: ['Art', 'Food', 'Culture'] },
            { name: 'Spain', stat: '189 Tours Available', tags: ['Fiesta', 'Coast', 'Tapas'] },
            { name: 'France', stat: '278 Tours Available', tags: ['Romance', 'Wine', 'Fashion'] },
            { name: 'Portugal', stat: '156 Tours Available', tags: ['Surf', 'Porto', 'Tiles'] },
            { name: 'Croatia', stat: '134 Tours Available', tags: ['Adriatic', 'Islands', 'Nature'] }
          ].map((item, idx) => (
            <div className="destination-card" key={item.name}>
              <div
                className="destination-image"
                style={{ backgroundImage: `url(${destinationImages[idx]})` }}
              />
              <div className="destination-overlay" />
              <div className="destination-content">
                <h4>{item.name}</h4>
                <p>{item.stat}</p>
                <div className="tag-row">
                  {item.tags.map((t) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              </div>
              <button className="arrow-btn">➜</button>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="section">
        <div className="section-title">
          <span className="pill">Features</span>
          <h2>How Snaptrip Helps You</h2>
        </div>
        <div className="feature-grid">
          {[
            'Pick Destination',
            'Choose Dates',
            'Build Itinerary',
            'Add Places',
            'Ready to Go'
          ].map((t) => (
            <div className="feature" key={t}>
              <div className="feature-icon" />
              <h4>{t}</h4>
              <p>Simple steps to plan your perfect trip.</p>
            </div>
          ))}
        </div>
      </section>

      <section id="why" className="section light">
        <div className="two-col">
          <div>
            <h2>Why Choose Snaptrip?</h2>
            <p>
              Create personalized itineraries, explore popular places, and manage
              your travel timelines with ease.
            </p>
            <ul className="list">
              <li>AI-assisted planning</li>
              <li>Local recommendations</li>
              <li>Collaborative trips</li>
            </ul>
          </div>
          <div className="image-panel" />
        </div>
      </section>

      <section className="section features-highlight">
        <div className="section-title">
          <span className="pill soft">Our Features</span>
          <h2>
            What Sets Us <span className="accent">Apart</span>
          </h2>
        </div>
        <div className="feature-cards">
          {[
            { title: 'Effortless Planning', text: 'AI does the work. You enjoy the journey.', tone: 'blue', icon: '✨' },
            { title: 'No Middlemen', text: 'Direct connections to authentic experiences.', tone: 'gold', icon: '⬡' },
            { title: 'Cultural Immersion', text: 'Experience destinations like a local.', tone: 'purple', icon: '🌍' },
            { title: 'Curated Experience', text: 'Hand‑picked by travel experts.', tone: 'pink', icon: '♦' },
            { title: 'Offline Access', text: 'Travel without internet worries.', tone: 'green', icon: '⬇' },
            { title: 'Share Stories', text: 'Create beautiful travel memories.', tone: 'orange', icon: '↗' }
          ].map((card) => (
            <div className={`feature-card ${card.tone}`} key={card.title}>
              <div className="icon-box">{card.icon}</div>
              <h4>{card.title}</h4>
              <p>{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section light">
        <div className="section-title">
          <span className="pill">Who it&apos;s for</span>
          <h2>Who Is It For?</h2>
        </div>
        <div className="card-grid">
          {['Adventure Seekers', 'Busy Professionals', 'Family Trips'].map((t, idx) => (
            <div className="card" key={t}>
              <div
                className="card-img"
                style={{ backgroundImage: `url(${audienceImages[idx]})` }}
              />
              <h4>{t}</h4>
              <p>Tailored experiences for every traveler.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section testimonials">
        <div className="section-title">
          <span className="pill soft">Testimonials</span>
          <h2>
            What Travellers Say<br />About <span className="accent-gold">SnapTrip</span>
          </h2>
        </div>
        <div className="testimonial-grid">
          {[
            {
              quote:
                '“SnapTrip made planning my Greece vacation incredibly easy! The AI understood exactly what I wanted.”',
              name: 'Sarah Mitchell',
              role: 'Travel Blogger',
              tone: 'blue'
            },
            {
              quote:
                '“As a busy professional, I don’t have time for planning. SnapTrip gave me a complete Italy itinerary in minutes!”',
              name: 'James Rodriguez',
              role: 'Entrepreneur',
              tone: 'gold'
            },
            {
              quote:
                '“The cultural recommendations were perfect! I experienced Spain like a local. SnapTrip exceeded expectations.”',
              name: 'Emma Thompson',
              role: 'Photographer',
              tone: 'purple'
            }
          ].map((t, idx) => (
            <div className={`testimonial-card ${t.tone}`} key={t.name}>
              <div className="stars">★★★★★</div>
              <p className="quote">{t.quote}</p>
              <div className="person">
                <div
                  className="avatar"
                  style={{ backgroundImage: `url(${testimonialImages[idx]})` }}
                />
                <div>
                  <strong>{t.name}</strong>
                  <div className="role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="blogs" className="section light">
        <div className="section-title">
          <span className="pill soft">Blogs</span>
          <h2>Our Latest Blogs</h2>
          <p>Discover travel tips, destination guides, and inspiring stories from around the world</p>
        </div>
        <div className="blog-grid">
          {[
            {
              title: 'Hidden Gems in the Mediterranean',
              excerpt: 'Discover secret beaches, charming villages, and authentic local experiences away from tourist crowds.',
              category: 'Destinations',
              date: 'Feb 5, 2026',
              readTime: '5 min read',
              image: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=800&auto=format&fit=crop'
            },
            {
              title: 'Budget Travel: Europe on $50/Day',
              excerpt: 'Learn how to explore Europe without breaking the bank with our expert money-saving tips and tricks.',
              category: 'Travel Tips',
              date: 'Feb 3, 2026',
              readTime: '7 min read',
              image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop'
            },
            {
              title: 'Best Mountains to Visit in 2026',
              excerpt: 'From the Alps to the Himalayas, explore the most breathtaking mountain destinations for adventure seekers.',
              category: 'Adventure',
              date: 'Jan 28, 2026',
              readTime: '6 min read',
              image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop'
            }
          ].map((blog) => (
            <div className="blog-card" key={blog.title}>
              <div className="blog-image" style={{ backgroundImage: `url(${blog.image})` }}>
                <span className="blog-category">{blog.category}</span>
              </div>
              <div className="blog-content">
                <div className="blog-meta">
                  <span className="blog-date">{blog.date}</span>
                  <span className="blog-dot">•</span>
                  <span className="blog-read-time">{blog.readTime}</span>
                </div>
                <h3>{blog.title}</h3>
                <p>{blog.excerpt}</p>
                <button className="blog-read-more">
                  Read More →
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="blog-cta">
          <button className="primary">View All Blogs</button>
        </div>
      </section>

      <section className="cta">
        <div>
          <h2>Your Travel Journey Starts Here</h2>
          <p>Sign up to receive curated itineraries and updates.</p>
        </div>
        <div className="cta-form">
          <input placeholder="Enter your email" />
          <button className="primary">Subscribe</button>
        </div>
      </section>

      <SiteFooter />

    </main>
  )
}
