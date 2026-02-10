import Link from 'next/link'

export default function SiteHeader() {
  return (
    <header className="home-header">
      <div className="home-nav">
        <div className="home-logo">
          <span className="logo-badge">✈</span>
          SnapTrip
        </div>
        <nav className="home-links">
          <a href="#destinations">Destinations</a>
          <a href="#features">How It Works</a>
          <a href="#why">About</a>
          <a href="#blogs">Blog</a>
          <Link href="/planner">Planner</Link>
          <Link href="/explore">Explore</Link>
        </nav>
        <button className="home-cta">Get Started</button>
      </div>
    </header>
  )
}
