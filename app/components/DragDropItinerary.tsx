'use client'

import { useState } from 'react'
import { MapItem } from './HierarchicalMap'

interface DragDropItineraryProps {
  selectedItems: MapItem[]
  onRemoveItem: (id: string) => void
  onReorderItems: (items: MapItem[]) => void
  onGenerateTimeline: () => void
}

export default function DragDropItinerary({ 
  selectedItems, 
  onRemoveItem, 
  onReorderItems,
  onGenerateTimeline 
}: DragDropItineraryProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  const handleDragStart = (id: string) => {
    setDraggedItem(id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (!draggedItem) return

    const draggedIndex = selectedItems.findIndex(item => item.id === draggedItem)
    if (draggedIndex === -1) return

    const newItems = [...selectedItems]
    const [removed] = newItems.splice(draggedIndex, 1)
    newItems.splice(targetIndex, 0, removed)
    
    onReorderItems(newItems)
    setDraggedItem(null)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      zIndex: 1001,
      padding: '1rem',
      maxHeight: '200px',
      overflowY: 'auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>
          My Itinerary ({selectedItems.length} items)
        </h3>
        {selectedItems.length > 0 && (
          <button
            onClick={onGenerateTimeline}
            style={{
              padding: '0.5rem 1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Generate Timeline
          </button>
        )}
      </div>

      <div style={{
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
        {selectedItems.length === 0 ? (
          <p style={{ color: '#999', fontStyle: 'italic' }}>
            Drag places here to build your itinerary
          </p>
        ) : (
          selectedItems.map((item, index) => {
            const itemImage = item.data?.images?.[0] || item.data?.imageUrl
            return (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                style={{
                  padding: '0.5rem',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '2px solid #667eea',
                  cursor: 'move',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  minWidth: '200px',
                  maxWidth: '250px'
                }}
              >
                {itemImage && (
                  <img 
                    src={itemImage} 
                    alt={item.name}
                    style={{
                      width: '50px',
                      height: '50px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      flexShrink: 0
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                )}
                <span style={{ 
                  fontSize: '0.85rem', 
                  fontWeight: '600', 
                  color: '#333',
                  flex: 1
                }}>
                  {index + 1}. {item.name}
                </span>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  ×
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
