export default function AdminSettings() {
    return (
        <div className="admin-dashboard">
            <div className="admin-grid">
                <div className="admin-card" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div>
                            <h3>System Configuration</h3>
                            <p className="card-label" style={{ textTransform: 'none' }}>Manage global application settings and feature flags</p>
                        </div>
                        <button className="admin-button">Save All Changes</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
                        <div>
                            <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', color: 'var(--admin-text)' }}>General Settings</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label className="card-label" style={{ display: 'block' }}>Application Name</label>
                                    <input className="admin-search" style={{ width: '100%' }} defaultValue="Snaptrip" />
                                </div>
                                <div>
                                    <label className="card-label" style={{ display: 'block' }}>Support Email</label>
                                    <input className="admin-search" style={{ width: '100%' }} defaultValue="support@snaptrip.com" />
                                </div>
                                <div>
                                    <label className="card-label" style={{ display: 'block' }}>Default Language</label>
                                    <select className="admin-search" style={{ width: '100%' }}>
                                        <option>English (US)</option>
                                        <option>Hindi</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', color: 'var(--admin-text)' }}>Platform Features</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                    <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '14px' }}>AI Trip Planner</div>
                                        <div style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>Enable OpenAI-powered trip generation</div>
                                    </div>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                    <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '14px' }}>Social Reviews</div>
                                        <div style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>Allow users to post and rate locations</div>
                                    </div>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                    <input type="checkbox" style={{ width: '18px', height: '18px' }} />
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '14px' }}>Maintenance Mode</div>
                                        <div style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>Redirect all traffic to a maintenance page</div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
