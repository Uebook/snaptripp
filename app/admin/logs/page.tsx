export default function AdminLogs() {
  return (
    <div>
      <div className="admin-grid">
        <div className="admin-card">
          <h3>Reports & Logs</h3>
          <div>User activity logs, admin actions, exports</div>
        </div>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Type</th>
            <th>Action</th>
            <th>Actor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>2026-01-24 10:32</td>
            <td>User</td>
            <td>Trip created</td>
            <td>Priya Sharma</td>
          </tr>
          <tr>
            <td>2026-01-24 10:45</td>
            <td>Admin</td>
            <td>Review approved</td>
            <td>Admin A</td>
          </tr>
        </tbody>
      </table>
      <button className="admin-button" style={{ marginTop: '12px' }}>Export CSV</button>
    </div>
  )
}
