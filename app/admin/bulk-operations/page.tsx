'use client'
import { useState } from 'react'

export default function AdminBulkOperations() {
    const [uploads, setUploads] = useState([
        { id: 1, filename: 'users_batch_01.xlsx', type: 'Users', status: 'Completed', date: '2026-02-05' },
        { id: 2, filename: 'cities_update.csv', type: 'Locations', status: 'Processing', date: '2026-02-07' },
    ])

    return (
        <div className="admin-dashboard">
            <div className="admin-grid">
                <div className="admin-card">
                    <h3>File Upload</h3>
                    <p className="card-label">Drag and drop your files to bulk import data</p>
                    <div style={{
                        marginTop: '24px',
                        padding: '48px',
                        border: '2px dashed var(--admin-border)',
                        borderRadius: '20px',
                        textAlign: 'center',
                        background: '#f8fafc',
                        transition: 'all 0.2s'
                    }} className="upload-zone">
                        <input type="file" id="file-upload" style={{ display: 'none' }} />
                        <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                            <div style={{ color: 'var(--admin-accent)', marginBottom: '16px' }}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                            </div>
                            <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--admin-text)' }}>Drop files here or click to browse</div>
                            <div className="card-label" style={{ marginTop: '8px' }}>Maximum file size: 50MB (XLSX, CSV)</div>
                        </label>
                    </div>
                    <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                        <select className="admin-search" style={{ flex: 1 }}>
                            <option>Import Type: Users</option>
                            <option>Import Type: Locations</option>
                        </select>
                        <button className="admin-button">Start Import Process</button>
                    </div>
                </div>

                <div className="admin-card">
                    <h3>Upload History</h3>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>File</th>
                                <th>Type</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {uploads.map(u => (
                                <tr key={u.id}>
                                    <td style={{ fontWeight: '600' }}>{u.filename}</td>
                                    <td>{u.type}</td>
                                    <td>
                                        <span className={`badge ${u.status === 'Completed' ? 'success' : 'warning'}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button className="admin-button outline" style={{ width: '100%', marginTop: '20px' }}>View Full History</button>
                </div>
            </div>

            <div className="admin-card" style={{ marginTop: '32px' }}>
                <h3>Recently Processed Items</h3>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Source</th>
                            <th>Status</th>
                            <th>Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>#10821</td>
                            <td style={{ fontWeight: '600' }}>Johnathan Doe</td>
                            <td>users_batch_01.xlsx</td>
                            <td><span className="badge success">Imported</span></td>
                            <td>User created successfully</td>
                        </tr>
                        <tr>
                            <td>#10822</td>
                            <td style={{ fontWeight: '600' }}>Jane Samantha</td>
                            <td>users_batch_01.xlsx</td>
                            <td><span className="badge danger">Failed</span></td>
                            <td>Invalid email format</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
