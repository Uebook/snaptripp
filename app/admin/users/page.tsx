import { supabaseAdmin } from '@/lib/supabaseAdmin'
import Link from 'next/link'
import ExportCSVButton from './ExportCSVButton'
import AddUserModal from './AddUserModal'
import BlockUserButton from './BlockUserButton'

export const revalidate = 0

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1
  const limit = 10
  const offset = (page - 1) * limit
  const query = typeof searchParams.q === 'string' ? searchParams.q : ''

  let users: any[] = []
  let totalUsers = 0
  let errorMessage: string | null = null

  try {
    // Fetch Users (Profiles) bypassing RLS, with pagination
    let baseQuery = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (query) {
      baseQuery = baseQuery.or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
    }

    const { data: profiles, count, error: profileError } = await baseQuery

    if (profileError) {
      console.error('Profile Error Details:', profileError)
      throw new Error(`Profile Error: ${profileError.message || JSON.stringify(profileError)}`)
    }

    if (count !== null) {
      totalUsers = count
    }

    if (profiles) {
      // Fetch auth user data for the visible profiles to check ban status
      const authUsersPromises = profiles.map(p => supabaseAdmin.auth.admin.getUserById(p.id))
      const authUsersRes = await Promise.all(authUsersPromises)

      const authUsersMap = authUsersRes.reduce((acc, res) => {
        if (res.data?.user) {
          acc[res.data.user.id] = res.data.user
        }
        return acc
      }, {} as any)

      users = profiles.map(profile => {
        const authUser = authUsersMap[profile.id]
        const isBlocked = authUser?.banned_until != null

        return {
          id: profile.id,
          name: profile.full_name || 'Anonymous User',
          email: profile.email || 'N/A',
          isBlocked,
          status: isBlocked ? 'Blocked' : 'Active',
          lastActive: profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A',
          badge: isBlocked ? 'danger' : 'success'
        }
      })
    }
  } catch (error: any) {
    console.error('Error fetching admin users data:', error)
    errorMessage = error.message || String(error)
  }

  const totalPages = Math.ceil(totalUsers / limit)

  return (
    <div className="admin-dashboard">
      {errorMessage && (
        <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#991b1b', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <strong>Error loading data:</strong> {errorMessage}
        </div>
      )}
      <div className="admin-grid">
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>User Management</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <AddUserModal />
              <ExportCSVButton />
            </div>
          </div>
          <form action="/admin/users" method="GET" style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <input name="q" defaultValue={query} className="admin-search" placeholder="Search users by name or email..." style={{ flex: 1 }} />
            <button type="submit" className="admin-button outline">Search</button>
            {query && (
              <Link href="/admin/users" className="admin-button outline" style={{ textDecoration: 'none' }}>Clear Filter</Link>
            )}
          </form>
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: '32px' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Status</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map(user => (
                <tr key={user.id}>
                  <td>
                    <Link href={`/admin/users/${user.id}`} className="user-link">
                      {user.name}
                      <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>{user.email}</span>
                    </Link>
                  </td>
                  <td><span className={`badge ${user.badge}`}>{user.status}</span></td>
                  <td>{user.lastActive}</td>
                  <td style={{ display: 'flex', gap: '8px' }}>
                    <Link href={`/admin/users/${user.id}`} className="admin-button outline" style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none' }}>
                      View
                    </Link>
                    <BlockUserButton userId={user.id} isBlocked={user.isBlocked} />
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>No users found.</td></tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', borderTop: '1px solid var(--admin-border)', paddingTop: '16px' }}>
          <span style={{ fontSize: '14px', color: '#64748b' }}>
            Showing {totalUsers > 0 ? offset + 1 : 0} to {Math.min(offset + limit, totalUsers)} of {totalUsers} users
          </span>
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link
                href={`/admin/users?page=${Math.max(1, page - 1)}${query ? `&q=${encodeURIComponent(query)}` : ''}`}
                className={`admin-button outline ${page === 1 ? 'disabled' : ''}`}
                style={{ padding: '6px 12px', fontSize: '14px', textDecoration: 'none', pointerEvents: page === 1 ? 'none' : 'auto', opacity: page === 1 ? 0.5 : 1 }}
              >
                Previous
              </Link>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <Link
                    key={pageNum}
                    href={`/admin/users?page=${pageNum}${query ? `&q=${encodeURIComponent(query)}` : ''}`}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      textDecoration: 'none',
                      background: pageNum === page ? 'var(--admin-primary)' : 'transparent',
                      color: pageNum === page ? '#fff' : 'var(--admin-text)',
                      fontWeight: pageNum === page ? '600' : 'normal',
                    }}
                  >
                    {pageNum}
                  </Link>
                ))}
              </div>
              <Link
                href={`/admin/users?page=${Math.min(totalPages, page + 1)}${query ? `&q=${encodeURIComponent(query)}` : ''}`}
                className={`admin-button outline ${page === totalPages ? 'disabled' : ''}`}
                style={{ padding: '6px 12px', fontSize: '14px', textDecoration: 'none', pointerEvents: page === totalPages ? 'none' : 'auto', opacity: page === totalPages ? 0.5 : 1 }}
              >
                Next
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
