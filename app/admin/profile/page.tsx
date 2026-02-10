export default function AdminProfile() {
    const admin = {
        name: 'Admin User',
        role: 'Super Administrator',
        email: 'admin@snaptrip.com',
        avatar: 'A',
        joined: 'Jan 2024'
    }

    return (
        <div className="admin-dashboard">
            <div className="admin-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) 2fr' }}>
                <div className="admin-card" style={{ textAlign: 'center' }}>
                    <div className="admin-avatar" style={{ width: '100px', height: '100px', fontSize: '40px', margin: '0 auto 24px auto', borderRadius: '24px' }}>
                        {admin.avatar}
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>{admin.name}</h2>
                    <p className="card-label" style={{ marginBottom: '24px' }}>{admin.role}</p>

                    <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '24px', textAlign: 'left' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <div className="card-label">Email</div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>{admin.email}</div>
                        </div>
                        <div>
                            <div className="card-label">Member Since</div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>{admin.joined}</div>
                        </div>
                    </div>
                </div>

                <div className="admin-card">
                    <h3 style={{ marginBottom: '32px' }}>Account Settings</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '500px' }}>
                        <div>
                            <label className="card-label" style={{ display: 'block' }}>Full Name</label>
                            <input className="admin-search" style={{ width: '100%', background: '#fff' }} defaultValue={admin.name} />
                        </div>
                        <div>
                            <label className="card-label" style={{ display: 'block' }}>Email Address</label>
                            <input className="admin-search" style={{ width: '100%', background: '#fff' }} defaultValue={admin.email} />
                        </div>

                        <div style={{ marginTop: '16px', paddingTop: '32px', borderTop: '1px solid var(--admin-border)' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '20px' }}>Security</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label className="card-label" style={{ display: 'block' }}>Current Password</label>
                                    <input className="admin-search" type="password" style={{ width: '100%', background: '#fff' }} placeholder="••••••••" />
                                </div>
                                <div>
                                    <label className="card-label" style={{ display: 'block' }}>New Password</label>
                                    <input className="admin-search" type="password" style={{ width: '100%', background: '#fff' }} placeholder="Min. 8 characters" />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '24px' }}>
                            <button className="admin-button">Update My Profile</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
