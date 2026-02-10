export default function AdminModeration() {
  return (
    <div className="admin-grid">
      <div className="admin-card">
        <h3>Reviews Moderation</h3>
        <div>Approve or reject reviews</div>
        <button className="admin-button" style={{ marginTop: '12px' }}>Review Queue</button>
      </div>
      <div className="admin-card">
        <h3>Blogs Moderation</h3>
        <div>Moderate user blogs</div>
        <button className="admin-button" style={{ marginTop: '12px' }}>Blog Queue</button>
      </div>
    </div>
  )
}
