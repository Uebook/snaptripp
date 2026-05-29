import React, { useState } from 'react'

export interface Place {
  id: number
  title: string
  city: string
  country: string
  location_lat: number
  location_lng: number
  categoryName?: string
  description?: string
  image_url?: string
  reviewsCount?: number
  openingHours_0_hours?: string
}

export interface PlaceDetailsModalProps {
  place: Place
  onClose: () => void
  dayPlans: any[]
  onAddToItinerary?: (place: Place, dayIdx?: number) => void
  isPlaceInPlanGlobal?: (placeId: number) => boolean
  onRemoveFromPlan?: (placeId: number) => void
  readonly?: boolean
}

export default function PlaceDetailsModal({ 
  place, 
  onClose, 
  dayPlans, 
  onAddToItinerary, 
  isPlaceInPlanGlobal, 
  onRemoveFromPlan,
  readonly = false 
}: PlaceDetailsModalProps) {
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | ''>('')
  const [activeTab, setActiveTab] = useState<'hours' | 'duration' | 'fee'>('hours')
  const isAdded = isPlaceInPlanGlobal ? isPlaceInPlanGlobal(place.id) : false

  return (
    <div className="place-modal-overlay" onClick={onClose}>
      <div className="place-modal-content" onClick={e => e.stopPropagation()}>
        <button className="place-modal-close" onClick={onClose}>✕</button>
        
        {/* Header Image */}
        <div className="place-modal-header" style={{ backgroundImage: `url(${place.image_url || ''})` }}>
          {!place.image_url && <div className="place-modal-no-img">No Image Available</div>}
          <div className="place-modal-header-overlay" />
          <div className="place-modal-header-content">
            <span className="place-modal-category">{place.categoryName || 'Attraction'}</span>
            <h2 className="place-modal-title">{place.title}</h2>
            <div className="place-modal-meta">
              <span className="place-modal-rating">⭐ 4.9 ({place.reviewsCount || 480} reviews)</span>
              <span>📍 {place.city || place.country}</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="place-modal-body">
          <div className="place-modal-desc">
            <h3>About</h3>
            <p>{place.description || 'Explore this highly-rated attraction on your upcoming trip.'}</p>
          </div>
          
          <div className="place-modal-tabs-container">
            <div className="place-modal-tabs">
              <button 
                className={`place-tab-btn ${activeTab === 'hours' ? 'active' : ''}`}
                onClick={() => setActiveTab('hours')}
              >
                🕒 Hours
              </button>
              <button 
                className={`place-tab-btn ${activeTab === 'duration' ? 'active' : ''}`}
                onClick={() => setActiveTab('duration')}
              >
                ⏳ Duration
              </button>
              <button 
                className={`place-tab-btn ${activeTab === 'fee' ? 'active' : ''}`}
                onClick={() => setActiveTab('fee')}
              >
                🎟️ Fee
              </button>
            </div>
            
            <div className="place-tab-content">
              {activeTab === 'hours' && (
                <div className="tab-pane-hours">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#1E293B', width: '100%' }}>
                    {[0, 1, 2, 3, 4, 5, 6].map(i => {
                      const day = (place as any)[`openingHours_${i}_day`];
                      const hours = (place as any)[`openingHours_${i}_hours`];
                      if (day && hours) {
                        return (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #F1F5F9' }}>
                            <span style={{ color: '#64748B', fontWeight: 500 }}>{day}</span>
                            <span style={{ textAlign: 'right', fontWeight: 600 }}>{hours}</span>
                          </div>
                        )
                      }
                      return null;
                    })}
                    {!(place as any).openingHours_0_hours && <span style={{ color: '#64748B' }}>09:00 AM - 06:00 PM</span>}
                  </div>
                </div>
              )}
              {activeTab === 'duration' && (
                <div className="tab-pane-simple">
                  <strong style={{ display: 'block', marginBottom: '4px', color: '#031B4E' }}>Suggested Duration</strong>
                  <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#1E293B' }}>1 - 2 hours</p>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Perfect for a morning or afternoon visit.</span>
                </div>
              )}
              {activeTab === 'fee' && (
                <div className="tab-pane-simple">
                  <strong style={{ display: 'block', marginBottom: '4px', color: '#031B4E' }}>Entry Fee</strong>
                  <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#1E293B' }}>Usually varies, check locally</p>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Prices may change based on season or age group.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {!readonly && (
          <div className="place-modal-actions">
            {isAdded ? (
              <button 
                className="btn-modal-remove"
                onClick={() => {
                  if (onRemoveFromPlan) onRemoveFromPlan(place.id)
                  onClose()
                }}
              >
                Remove from Itinerary
              </button>
            ) : (
              <div className="modal-add-group">
                <select 
                  className="modal-day-select"
                  value={selectedDayIdx}
                  onChange={(e) => setSelectedDayIdx(e.target.value === '' ? '' : Number(e.target.value))}
                >
                  <option value="">Auto-assign day</option>
                  {dayPlans.map((day, idx) => (
                    <option key={day.id} value={idx}>{day.title}</option>
                  ))}
                </select>
                <button 
                  className="btn-modal-add"
                  onClick={() => {
                    if (onAddToItinerary) onAddToItinerary(place, selectedDayIdx === '' ? undefined : selectedDayIdx as number)
                    onClose()
                  }}
                >
                  Add to Itinerary
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .place-modal-overlay {
          position: fixed; inset: 0; background: rgba(3, 27, 78, 0.4);
          z-index: 1000; display: flex; align-items: center; justify-content: center;
          padding: 20px; backdrop-filter: blur(4px);
        }
        .place-modal-content {
          background: #FFFFFF; border-radius: 24px; width: 100%; max-width: 540px;
          overflow: hidden; position: relative; box-shadow: 0 24px 48px rgba(3, 27, 78, 0.1);
          animation: modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes modalPop { 0% { opacity: 0; transform: scale(0.96) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        .place-modal-close {
          position: absolute; top: 16px; right: 16px; width: 32px; height: 32px;
          border-radius: 50%; background: rgba(0,0,0,0.5); color: #FFF; border: none;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
          z-index: 10; font-size: 14px; transition: background 0.2s;
        }
        .place-modal-close:hover { background: rgba(0,0,0,0.8); }
        .place-modal-header {
          height: 240px; background-size: cover; background-position: center;
          position: relative; display: flex; flex-direction: column; justify-content: flex-end;
          background-color: #E2E8F0;
        }
        .place-modal-no-img {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          color: #94A3B8; font-weight: 600; font-size: 14px; z-index: 0;
        }
        .place-modal-header-overlay {
          position: absolute; inset: 0; background: linear-gradient(to top, rgba(3,27,78,0.9) 0%, rgba(3,27,78,0) 100%); z-index: 1;
        }
        .place-modal-header-content {
          position: relative; z-index: 2; padding: 24px; color: #FFF;
        }
        .place-modal-category {
          display: inline-block; padding: 4px 10px; background: rgba(255,255,255,0.2);
          backdrop-filter: blur(8px); border-radius: 6px; font-size: 11px; font-weight: 700;
          letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 8px;
        }
        .place-modal-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 800; margin: 0 0 8px; line-height: 1.2; }
        .place-modal-meta { display: flex; align-items: center; gap: 16px; font-size: 13px; font-weight: 500; opacity: 0.9; }
        .place-modal-body { padding: 24px; }
        .place-modal-desc h3 { font-size: 14px; font-weight: 800; color: #031B4E; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .place-modal-desc p { font-size: 14px; color: #4B5563; line-height: 1.6; margin: 0 0 24px; }
        .place-modal-tabs-container { margin-top: 16px; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; }
        .place-modal-tabs { display: flex; background: #F8FAFC; border-bottom: 1px solid #E5E7EB; }
        .place-tab-btn { flex: 1; padding: 12px; border: none; background: transparent; font-size: 13px; font-weight: 600; color: #64748B; cursor: pointer; transition: all 0.2s; border-bottom: 2px solid transparent; }
        .place-tab-btn:hover { color: #031B4E; background: #F1F5F9; }
        .place-tab-btn.active { color: #F6B800; border-bottom-color: #F6B800; background: #FFF; }
        .place-tab-content { padding: 20px; background: #FFF; min-height: 120px; }
        .tab-pane-simple p { margin-bottom: 4px; }
        .place-modal-actions { padding: 20px 24px; background: #FAFAFA; border-top: 1px solid #E5E7EB; display: flex; justify-content: flex-end; }
        .btn-modal-remove { padding: 12px 24px; background: #FEE2E2; color: #EF4444; border: 1px solid #FECACA; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; width: 100%; }
        .btn-modal-remove:hover { background: #FECACA; }
        .modal-add-group { display: flex; gap: 12px; width: 100%; }
        .modal-day-select { flex: 1; padding: 0 16px; border: 1px solid #E5E7EB; border-radius: 10px; background: #FFF; font-size: 14px; color: #031B4E; font-weight: 600; outline: none; transition: border-color 0.2s; }
        .modal-day-select:focus { border-color: #F6B800; }
        .btn-modal-add { flex: 1; padding: 12px 24px; background: #F6B800; color: #031B4E; border: none; border-radius: 10px; font-weight: 800; font-size: 14px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(246, 184, 0, 0.3); }
        .btn-modal-add:hover { background: #F59E0B; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(246, 184, 0, 0.4); }
      `}</style>
    </div>
  )
}
