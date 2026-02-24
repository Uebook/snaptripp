'use client'

import { useState } from 'react'
import { MapItem } from './HierarchicalMap'

export interface DayPlan {
    id: string
    title: string
    items: MapItem[]
}

interface DayPlannerProps {
    days: DayPlan[]
    onUpdateDays: (days: DayPlan[]) => void
    onRemoveItem: (dayId: string, itemId: string) => void
    onGenerateTimeline: () => void
    onSaveTrip: () => void
}

export default function DayPlanner({
    days,
    onUpdateDays,
    onRemoveItem,
    onGenerateTimeline,
    onSaveTrip
}: DayPlannerProps) {
    const [draggedItem, setDraggedItem] = useState<{ dayId: string, itemIndex: number } | null>(null)
    const [dragOverDay, setDragOverDay] = useState<string | null>(null)

    const handleAddDay = () => {
        const newDay: DayPlan = {
            id: `day-${Date.now()}`,
            title: `Day ${days.length + 1}`,
            items: []
        }
        onUpdateDays([...days, newDay])
    }

    const handleRemoveDay = (dayId: string) => {
        onUpdateDays(days.filter(d => d.id !== dayId))
    }

    const handleDragStart = (e: React.DragEvent, dayId: string, itemIndex: number) => {
        setDraggedItem({ dayId, itemIndex })
        e.dataTransfer.effectAllowed = 'move'
        // Set data for potential cross-component dropping (from Sidebar to Planner)
        // Note: Sidebar items need to set distinct data to differentiate
    }

    const handleDragOver = (e: React.DragEvent, dayId: string) => {
        e.preventDefault()
        setDragOverDay(dayId)
    }

    const handleDrop = (e: React.DragEvent, targetDayId: string) => {
        e.preventDefault()
        setDragOverDay(null)

        // Check if dropping from sidebar (external)
        const sidebarItemJson = e.dataTransfer.getData('application/json')
        if (sidebarItemJson) {
            try {
                const item = JSON.parse(sidebarItemJson) as MapItem
                // Add to target day
                const newDays = days.map(day => {
                    if (day.id === targetDayId) {
                        // Avoid duplicates in the same day if needed, or allow
                        if (day.items.find(i => i.id === item.id)) return day
                        return { ...day, items: [...day.items, item] }
                    }
                    return day
                })
                onUpdateDays(newDays)
            } catch (err) {
                console.error('Failed to parse dropped item', err)
            }
            return
        }

        // Reordering within planner
        if (!draggedItem) return

        const sourceDay = days.find(d => d.id === draggedItem.dayId)
        const targetDay = days.find(d => d.id === targetDayId)

        if (!sourceDay || !targetDay) return

        const newDays = [...days]
        const sourceDayIndex = newDays.findIndex(d => d.id === draggedItem.dayId)
        const targetDayIndex = newDays.findIndex(d => d.id === targetDayId)

        // Remove from source
        const [movedItem] = newDays[sourceDayIndex].items.splice(draggedItem.itemIndex, 1)

        // Add to target (append for now, can be improved to insert at specific index)
        newDays[targetDayIndex].items.push(movedItem)

        onUpdateDays(newDays)
        setDraggedItem(null)
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            width: '350px',
            background: 'white',
            boxShadow: '2px 0 12px rgba(0,0,0,0.1)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid #e0e6ed'
        }}>
            <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid #e0e6ed',
                background: '#fff'
            }}>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    color: '#031B4E',
                    marginBottom: '0.5rem'
                }}>
                    Trip Planner
                </h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={handleAddDay}
                        style={{
                            flex: 1,
                            padding: '0.6rem',
                            background: '#f0f4f8',
                            color: '#031B4E',
                            border: '1px solid #d9e2ec',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        + Add Day
                    </button>
                    <button
                        onClick={onGenerateTimeline}
                        style={{
                            flex: 1,
                            padding: '0.6rem',
                            background: '#805ad5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        Preview
                    </button>
                    <button
                        onClick={onSaveTrip}
                        style={{
                            flex: 1,
                            padding: '0.6rem',
                            background: '#2b6cb0',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        Save
                    </button>
                </div>
            </div>

            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem'
            }}>
                {days.map((day) => (
                    <div
                        key={day.id}
                        onDragOver={(e) => handleDragOver(e, day.id)}
                        onDrop={(e) => handleDrop(e, day.id)}
                        style={{
                            background: dragOverDay === day.id ? '#f0f9ff' : '#fff',
                            border: `2px solid ${dragOverDay === day.id ? '#667eea' : '#e0e6ed'}`,
                            borderRadius: '12px',
                            marginBottom: '1rem',
                            overflow: 'hidden',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{
                            padding: '1rem',
                            background: '#f8f9fa',
                            borderBottom: '1px solid #e0e6ed',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#333' }}>
                                {day.title}
                            </h3>
                            <button
                                onClick={() => handleRemoveDay(day.id)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    padding: '0 4px'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ padding: '0.5rem', minHeight: '60px' }}>
                            {day.items.length === 0 ? (
                                <div style={{
                                    padding: '1rem',
                                    textAlign: 'center',
                                    color: '#94a3b8',
                                    fontSize: '0.85rem',
                                    border: '2px dashed #e2e8f0',
                                    borderRadius: '8px',
                                    margin: '0.5rem'
                                }}>
                                    Drag places here
                                </div>
                            ) : (
                                day.items.map((item, index) => (
                                    <div
                                        key={`${day.id}-${item.id}-${index}`}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, day.id, index)}
                                        style={{
                                            padding: '0.75rem',
                                            background: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            marginBottom: '0.5rem',
                                            display: 'flex',
                                            gap: '0.75rem',
                                            alignItems: 'center',
                                            cursor: 'grab',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                        }}
                                    >
                                        {item.data?.images?.[0] && (
                                            <img
                                                src={item.data.images[0]}
                                                alt={item.name}
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '6px',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        )}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontSize: '0.9rem',
                                                fontWeight: '600',
                                                color: '#334155',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {item.name}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                {item.data?.category || 'Place'}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onRemoveItem(day.id, item.id)}
                                            style={{
                                                color: '#cbd5e1',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '1.1rem'
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}

                <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: '0.9rem',
                    fontStyle: 'italic'
                }}>
                    Drag places from the map list into your day plans above.
                </div>
            </div>
        </div>
    )
}
