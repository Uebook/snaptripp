import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function GET() {
       try {
              // Fetch all Users (Profiles) bypassing RLS
              const { data: profiles, error } = await supabaseAdmin
                     .from('profiles')
                     .select('*')
                     .order('updated_at', { ascending: false })

              if (error) {
                     console.error('Profile Export Error Details:', error)
                     throw new Error(`Profile Export Error: ${error.message || JSON.stringify(error)}`)
              }

              if (!profiles || profiles.length === 0) {
                     return new NextResponse('No users found to export', { status: 404 })
              }

              // Define CSV headers
              const headers = ['ID', 'Name', 'Username', 'Email', 'Location', 'Website', 'Bio', 'Joined Date']

              // Map data to CSV rows
              const csvRows = [headers.join(',')]

              profiles.forEach(profile => {
                     // Escape quotes and wrap each field in quotes to handle commas/newlines in data
                     const row = [
                            `"${profile.id}"`,
                            `"${(profile.full_name || '').replace(/"/g, '""')}"`,
                            `"${(profile.username || '').replace(/"/g, '""')}"`,
                            `"${(profile.email || '').replace(/"/g, '""')}"`,
                            `"${(profile.location || '').replace(/"/g, '""')}"`,
                            `"${(profile.website || '').replace(/"/g, '""')}"`,
                            `"${(profile.bio || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`, // Replace newlines in bio to keep it on one row safely though quotes usually handle it
                            `"${new Date(profile.updated_at || Date.now()).toLocaleDateString()}"`
                     ]
                     csvRows.push(row.join(','))
              })

              const csvContent = csvRows.join('\n')

              return new NextResponse(csvContent, {
                     status: 200,
                     headers: {
                            'Content-Type': 'text/csv; charset=utf-8',
                            'Content-Disposition': `attachment; filename="users_export_${new Date().toISOString().split('T')[0]}.csv"`
                     }
              })
       } catch (error: any) {
              console.error('Error exporting users data:', error)
              return NextResponse.json({ error: error.message || String(error) }, { status: 500 })
       }
}
