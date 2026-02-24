'use client'

import { useState } from 'react'
import { MapItem } from './HierarchicalMap'

interface ItinerarySidebarProps {
  item: MapItem | null
  onClose: () => void
  onAddToItinerary?: (item: MapItem) => void
  loading?: boolean
}

export default function ItinerarySidebar({ item, onClose, onAddToItinerary, loading = false }: ItinerarySidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  if (!item) return null

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const renderItem = (it: MapItem, level: number = 0) => {
    const hasChildren = it.children && it.children.length > 0
    const sectionId = `${it.type}-${it.id}`
    const isExpanded = expandedSections.has(sectionId)

    // Get image for places
    const placeImage = it.type === 'place' && it.data?.images?.[0] || it.data?.imageUrl

    return (
      <div key={it.id} style={{ marginLeft: `${level * 20}px`, marginBottom: '0.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem',
          background: level === 0 ? '#f8f9fa' : '#fff',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          cursor: hasChildren ? 'pointer' : 'default'
        }}
          onClick={() => hasChildren && toggleSection(sectionId)}
          draggable={!hasChildren} // Only leaf nodes (places) are draggable
          onDragStart={(e) => {
            if (!hasChildren) {
              e.dataTransfer.setData('application/json', JSON.stringify(it))
              e.dataTransfer.effectAllowed = 'copy'
            }
          }}
        >
          {placeImage && (
            <img
              src={placeImage}
              alt={it.name}
              style={{
                width: '60px',
                height: '60px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginRight: '0.75rem',
                flexShrink: 0
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, fontSize: '1rem', color: '#333' }}>
              {it.name}
            </h4>
            <span style={{
              fontSize: '0.75rem',
              color: '#666',
              textTransform: 'capitalize'
            }}>
              {it.type}
            </span>
            {it.type === 'place' && it.data?.rating && (
              <div style={{
                fontSize: '0.75rem',
                color: '#888',
                marginTop: '0.25rem'
              }}>
                ⭐ {it.data.rating.toFixed(1)}
              </div>
            )}
          </div>
          {hasChildren && (
            <span style={{ fontSize: '1.2rem', color: '#667eea' }}>
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
          {it.type === 'place' && onAddToItinerary && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAddToItinerary(it)
              }}
              style={{
                marginLeft: '0.5rem',
                padding: '0.25rem 0.75rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              Add
            </button>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div style={{ marginTop: '0.5rem' }}>
            {it.children!.map(child => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: 0,
      width: '400px',
      height: '100vh',
      background: 'white',
      boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
      zIndex: 1000,
      overflowY: 'auto',
      padding: '1.5rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #e0e0e0'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>
          {item.name}
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ×
        </button>
      </div>

      <div>
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            color: '#666'
          }}>
            Loading...
          </div>
        ) : item.children && item.children.length > 0 ? (
          <div>
            {item.type === 'city' && item.children[0]?.type === 'place' && (
              <h3 style={{
                fontSize: '1.1rem',
                marginBottom: '1rem',
                color: '#667eea',
                fontWeight: '600'
              }}>
                Top 5 Itinerary
              </h3>
            )}
            {item.type === 'state' && item.children[0]?.type === 'city' && (
              <h3 style={{
                fontSize: '1.1rem',
                marginBottom: '1rem',
                color: '#667eea',
                fontWeight: '600'
              }}>
                Cities
              </h3>
            )}
            {item.children.map(child => renderItem(child))}
          </div>
        ) : (
          <div>
            {item.data && (
              <div>
                {/* Image Gallery for places */}
                {item.type === 'place' && (item.data.images?.length > 0 || item.data.imageUrl) && (
                  <div style={{ marginBottom: '1rem' }}>
                    {item.data.images && item.data.images.length > 1 ? (
                      <div>
                        <img
                          src={item.data.images[0]}
                          alt={item.name}
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            marginBottom: '0.5rem'
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(4, 1fr)',
                          gap: '0.5rem'
                        }}>
                          {item.data.images.slice(1, 5).map((img: string, idx: number) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`${item.name} ${idx + 2}`}
                              style={{
                                width: '100%',
                                height: '60px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      (item.data.images?.[0] || item.data.imageUrl) && (
                        <img
                          src={item.data.images?.[0] || item.data.imageUrl}
                          alt={item.name}
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            marginBottom: '1rem'
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      )
                    )}
                  </div>
                )}
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Details</h3>
                {item.data.description && (
                  <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.5' }}>{item.data.description}</p>
                )}
                {item.data.rating && (
                  <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                    ⭐ {item.data.rating.toFixed(1)} {item.data.reviewCount ? `(${item.data.reviewCount} reviews)` : ''}
                  </p>
                )}
                {item.data.address && (
                  <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                    📍 {item.data.address}
                  </p>
                )}
                {item.data.phone && (
                  <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                    ☎️ {item.data.phone}
                  </p>
                )}
                {item.data.website && (
                  <a
                    href={item.data.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      marginTop: '0.5rem',
                      color: '#667eea',
                      textDecoration: 'none',
                      fontSize: '0.9rem'
                    }}
                  >
                    Visit Website →
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
