import Link from 'next/link'

export default function AdminUsers() {
  const users = [
    { id: 1, name: 'Priya Sharma', status: 'Active', trips: 12, lastActive: '2026-01-24', badge: 'success' },
    { id: 2, name: 'Alex Carter', status: 'Blocked', trips: 2, lastActive: '2026-01-10', badge: 'danger' },
  ]

  return (
    <div className="admin-dashboard">
      <div className="admin-grid">
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>User Management</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="admin-button">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
                Add User
              </button>
              <button className="admin-button outline">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Export CSV
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input className="admin-search" placeholder="Search users by name, email or ID..." style={{ flex: 1 }} />
            <button className="admin-button outline">Filter</button>
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: '32px' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Status</th>
              <th>Trips</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <Link href={`/admin/users/${user.id}`} className="user-link">{user.name}</Link>
                </td>
                <td><span className={`badge ${user.badge}`}>{user.status}</span></td>
                <td>{user.trips}</td>
                <td>{user.lastActive}</td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <Link href={`/admin/users/${user.id}`} className="admin-button outline" style={{ padding: '6px 12px', fontSize: '12px' }}>
                    View
                  </Link>
                  <button className="admin-button outline" style={{ padding: '6px 12px', fontSize: '12px', color: user.status === 'Active' ? 'var(--admin-danger)' : 'var(--admin-success)' }}>
                    {user.status === 'Active' ? 'Block' : 'Unblock'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-card" style={{ marginTop: '32px' }}>
        <h3>User Trip History</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Trip</th>
              <th>Destination</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: '600' }}>Priya Sharma</td>
              <td>Summer Escape</td>
              <td>Italy</td>
              <td>2026-02-12</td>
              <td><span className="badge success">Completed</span></td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }}>Alex Carter</td>
              <td>Weekend Getaway</td>
              <td>Spain</td>
              <td>2026-01-20</td>
              <td><span className="badge danger">Cancelled</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
