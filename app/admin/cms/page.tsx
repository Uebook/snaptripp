export default function AdminCMS() {
  return (
    <div>
      <div className="admin-grid">
        <div className="admin-card">
          <h3>Static Pages</h3>
          <div>About, Privacy, Terms</div>
          <button className="admin-button" style={{ marginTop: '12px' }}>Create Page</button>
        </div>
        <div className="admin-card">
          <h3>Settings & Toggles</h3>
          <div>Feature flags & app settings</div>
          <div style={{ marginTop: '12px' }}>
            <label><input type="checkbox" defaultChecked /> Enable Blogs</label><br />
            <label><input type="checkbox" defaultChecked /> Enable Reviews</label><br />
            <label><input type="checkbox" /> Beta Features</label>
          </div>
        </div>
        <div className="admin-card">
          <h3>Email Templates</h3>
          <div>Manage system email templates</div>
          <button className="admin-button" style={{ marginTop: '12px' }}>New Template</button>
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: '24px' }}>
        <h3>Static Pages Data</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Page</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>About Us</td>
              <td><span className="badge success">Published</span></td>
              <td>2026-01-18</td>
              <td><button className="admin-button outline">Edit</button></td>
            </tr>
            <tr>
              <td>Privacy Policy</td>
              <td><span className="badge success">Published</span></td>
              <td>2026-01-12</td>
              <td><button className="admin-button outline">Edit</button></td>
            </tr>
            <tr>
              <td>Terms & Conditions</td>
              <td><span className="badge success">Published</span></td>
              <td>2026-01-10</td>
              <td><button className="admin-button outline">Edit</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="admin-card" style={{ marginTop: '24px' }}>
        <h3>Email Templates Data</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Template</th>
              <th>Trigger</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Welcome Email</td>
              <td>New user signup</td>
              <td>2026-01-05</td>
              <td><button className="admin-button outline">Edit</button></td>
            </tr>
            <tr>
              <td>Trip Reminder</td>
              <td>48 hrs before trip</td>
              <td>2026-01-02</td>
              <td><button className="admin-button outline">Edit</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
