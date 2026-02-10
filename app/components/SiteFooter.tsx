import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div>
        <h3>SnapTrip</h3>
        <p>Plan smarter, travel better.</p>
      </div>
      <div>
        <h4>Quick Links</h4>
        <a href="#features">Features</a>
        <a href="#why">Why Snaptrip</a>
        <Link href="/planner">Planner</Link>
        <Link href="/explore">Explore</Link>
      </div>
      <div>
        <h4>Support</h4>
        <a href="#">Help</a>
        <a href="#">Contact</a>
        <a href="#">FAQs</a>
      </div>
    </footer>
  )
}
