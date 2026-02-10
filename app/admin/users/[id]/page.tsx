export default function UserDetail({ params }: { params: { id: string } }) {
    // In a real app, you would fetch user data based on params.id
    const user = {
        id: params.id,
        name: params.id === '1' ? 'Priya Sharma' : 'Alex Carter',
        email: params.id === '1' ? 'priya@example.com' : 'alex@example.com',
        status: params.id === '1' ? 'Active' : 'Blocked',
        joined: '2025-05-12',
        lastActive: params.id === '1' ? '2026-01-24' : '2026-01-10',
        bio: 'Travel enthusiast and blogger.',
        trips: [
            { id: 1, destination: 'Italy', date: '2025-08-15', status: 'Completed' },
            { id: 2, destination: 'Japan', date: '2025-11-20', status: 'Completed' },
        ]
    }

    return (
        <div className="user-detail">
            <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>User Detail: {user.name}</h2>
                    <span className={`badge ${user.status === 'Active' ? 'success' : 'danger'}`}>{user.status}</span>
                </div>
                <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Joined:</strong> {user.joined}</p>
                        <p><strong>Last Active:</strong> {user.lastActive}</p>
                    </div>
                    <div>
                        <p><strong>Bio:</strong> {user.bio}</p>
                    </div>
                </div>
            </div>

            <div className="admin-card" style={{ marginTop: '24px' }}>
                <h3>Trip History</h3>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Destination</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {user.trips.map(trip => (
                            <tr key={trip.id}>
                                <td>{trip.destination}</td>
                                <td>{trip.date}</td>
                                <td><span className="badge success">{trip.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <button className="admin-button">Edit User</button>
                <button className="admin-button outline">Resend Verification</button>
                <button className={`admin-button ${user.status === 'Active' ? 'outline' : ''}`}>
                    {user.status === 'Active' ? 'Block User' : 'Unblock User'}
                </button>
            </div>
        </div>
    )
}
