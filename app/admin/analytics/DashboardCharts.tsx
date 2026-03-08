'use client'

import {
       BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
       LineChart, Line, AreaChart, Area,
       PieChart, Pie, Legend
} from 'recharts'

const COLORS = ['#0f172a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#84cc16']

export function TopDestinationsChart({ data }: { data: any[] }) {
       if (!data || data.length === 0) return <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>No destination data available.</div>

       return (
              <div style={{ width: '100%', height: 350 }}>
                     <ResponsiveContainer>
                            <BarChart
                                   data={data}
                                   margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                                   layout="vertical"
                            >
                                   <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                   <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                   <YAxis dataKey="country" type="category" width={100} tick={{ fontSize: 13, fill: '#334155', fontWeight: 500 }} axisLine={false} tickLine={false} />
                                   <Tooltip
                                          cursor={{ fill: '#f1f5f9' }}
                                          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                   />
                                   <Bar dataKey="count" name="Trips Planned" fill="#0f172a" radius={[0, 4, 4, 0]}>
                                          {data.map((entry, index) => (
                                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                          ))}
                                   </Bar>
                            </BarChart>
                     </ResponsiveContainer>
              </div>
       )
}

export function UserGrowthChart({ data }: { data: any[] }) {
       if (!data || data.length === 0) return <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>No growth data available.</div>

       return (
              <div style={{ width: '100%', height: 350 }}>
                     <ResponsiveContainer>
                            <AreaChart
                                   data={data}
                                   margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                            >
                                   <defs>
                                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                 <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                 <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                          </linearGradient>
                                   </defs>
                                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                   <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                                   <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} dx={-10} />
                                   <Tooltip
                                          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                   />
                                   <Area type="monotone" dataKey="users" name="New Signups" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                            </AreaChart>
                     </ResponsiveContainer>
              </div>
       )
}

export function ActiveUsersPieChart({ activeCount, inactiveCount }: { activeCount: number, inactiveCount: number }) {
       const data = [
              { name: 'Active Users', value: activeCount },
              { name: 'Inactive Users', value: inactiveCount },
       ]

       const PIE_COLORS = ['#10b981', '#94a3b8']

       if (activeCount === 0 && inactiveCount === 0) return <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>No user activity data available.</div>

       return (
              <div style={{ width: '100%', height: 300 }}>
                     <ResponsiveContainer>
                            <PieChart>
                                   <Pie
                                          data={data}
                                          cx="50%"
                                          cy="50%"
                                          innerRadius={80}
                                          outerRadius={110}
                                          paddingAngle={5}
                                          dataKey="value"
                                          stroke="none"
                                   >
                                          {data.map((entry, index) => (
                                                 <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                          ))}
                                   </Pie>
                                   <Tooltip
                                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                          itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                                   />
                                   <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '14px', color: '#475569' }} />
                            </PieChart>
                     </ResponsiveContainer>
              </div>
       )
}
