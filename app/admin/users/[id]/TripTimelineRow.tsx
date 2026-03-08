'use client'

import { useState } from 'react'

export default function TripTimelineRow({ trip }: { trip: any }) {
       const [expanded, setExpanded] = useState(false)

       // Defaulting status to "Upcoming" or "Planned" as seen in the travel archives
       const status = 'Planned'
       const statusBadge = 'warning'

       return (
              <>
                     <tr>
                            <td style={{ fontWeight: '500' }}>{trip.title || 'Untitled Trip'}</td>
                            <td>{trip.country || trip.destination || 'Unknown Location'}</td>
                            <td>{trip.duration || 'N/A'}</td>
                            <td>{new Date(trip.created_at).toLocaleDateString()}</td>
                            <td><span className={`badge ${statusBadge}`}>{status}</span></td>
                            <td>
                                   <button
                                          onClick={() => setExpanded(!expanded)}
                                          className="admin-button outline"
                                          style={{ padding: '4px 12px', fontSize: '12px' }}
                                   >
                                          {expanded ? 'Hide Timeline' : 'View Timeline'}
                                   </button>
                            </td>
                     </tr>
                     {expanded && (
                            <tr>
                                   <td colSpan={6} style={{ padding: '0', background: '#f8fafc', borderBottom: '1px solid var(--admin-border)' }}>
                                          <div style={{ padding: '24px', position: 'relative' }}>
                                                 <h4 style={{ margin: '0 0 16px', color: '#0f172a', fontSize: '14px' }}>Itinerary Details</h4>

                                                 {(!trip.days || trip.days.length === 0) ? (
                                                        <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>No itinerary planned for this trip.</p>
                                                 ) : (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginLeft: '8px', borderLeft: '2px solid #cbd5e1', paddingLeft: '20px' }}>
                                                               {[...trip.days]
                                                                      .sort((a, b) => a.day_index - b.day_index)
                                                                      .map((day: any) => (
                                                                             <div key={day.id} style={{ position: 'relative' }}>
                                                                                    <div style={{
                                                                                           position: 'absolute',
                                                                                           left: '-25px',
                                                                                           top: '4px',
                                                                                           width: '10px',
                                                                                           height: '10px',
                                                                                           background: 'var(--admin-primary)',
                                                                                           borderRadius: '50%',
                                                                                           border: '2px solid #fff'
                                                                                    }} />
                                                                                    <strong style={{ display: 'block', fontSize: '13px', color: '#334155', marginBottom: '8px' }}>
                                                                                           {day.title || `Day ${day.day_index + 1}`}
                                                                                    </strong>

                                                                                    {(!day.items || day.items.length === 0) ? (
                                                                                           <span style={{ fontSize: '12px', color: '#94a3b8' }}>No places added yet.</span>
                                                                                    ) : (
                                                                                           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                                                  {[...day.items]
                                                                                                         .sort((a, b) => a.order_index - b.order_index)
                                                                                                         .map((item: any) => (
                                                                                                                <div key={item.id} style={{
                                                                                                                       background: '#fff',
                                                                                                                       padding: '10px 14px',
                                                                                                                       borderRadius: '6px',
                                                                                                                       border: '1px solid #e2e8f0',
                                                                                                                       fontSize: '13px',
                                                                                                                       display: 'flex',
                                                                                                                       flexDirection: 'column',
                                                                                                                       gap: '4px'
                                                                                                                }}>
                                                                                                                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                                                              <span style={{ color: 'var(--admin-primary)' }}>📍</span>
                                                                                                                              <span style={{ fontWeight: '500', color: '#0f172a' }}>{item.custom_name || 'Location'}</span>
                                                                                                                       </div>
                                                                                                                       {item.note && (
                                                                                                                              <span style={{ color: '#64748b', fontSize: '12px', paddingLeft: '24px' }}>
                                                                                                                                     {item.note}
                                                                                                                              </span>
                                                                                                                       )}
                                                                                                                </div>
                                                                                                         ))}
                                                                                           </div>
                                                                                    )}
                                                                             </div>
                                                                      ))}
                                                        </div>
                                                 )}
                                          </div>
                                   </td>
                            </tr>
                     )}
              </>
       )
}
