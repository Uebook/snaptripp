'use client'

import React, { useState } from 'react';
import { Inter } from 'next/font/google';
import './HowItWorksTabs.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export default function HowItWorksTabs() {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'support'>('itinerary');

  return (
    <section className={`hiw-tabs-section ${inter.className}`}>
      <div className="hiw-tabs-container">
        {/* Tab Header */}
        <div className="hiw-tabs-header">
          <button 
            className={`hiw-tab-btn ${activeTab === 'itinerary' ? 'active' : ''}`}
            onClick={() => setActiveTab('itinerary')}
          >
            <span className="hiw-tab-icon">📅</span> Itinerary
          </button>
          <button 
            className={`hiw-tab-btn ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => setActiveTab('support')}
          >
            <span className="hiw-tab-icon">🎧</span> Support
          </button>
        </div>

        {/* Tab Content */}
        <div className="hiw-tab-content">
          {activeTab === 'itinerary' ? (
            <div className="hiw-itinerary-content">
              {/* Timeline Line */}
              <div className="hiw-timeline-line"></div>
              
              {/* Phase 1 */}
              <div className="hiw-phase">
                <div className="hiw-phase-number">1</div>
                <div className="hiw-phase-details">
                  <div className="hiw-phase-subtitle">🗺️ PHASE ONE</div>
                  <h3 className="hiw-phase-title">Select a City: Map Discovery</h3>
                  <p className="hiw-phase-desc">
                    Begin your journey by exploring our global map interface. Pinpoint your next adventure using interactive markers that reveal real-time insights about cities worldwide, from bustling metropolises to hidden gems.
                  </p>
                  <div className="hiw-tags">
                    <span className="hiw-tag">GLOBAL RADIUS</span>
                    <span className="hiw-tag">INTERACTIVE MARKERS</span>
                  </div>
                </div>
              </div>

              {/* Phase 2 */}
              <div className="hiw-phase">
                <div className="hiw-phase-number">2</div>
                <div className="hiw-phase-details">
                  <div className="hiw-phase-subtitle">📸 PHASE TWO</div>
                  <h3 className="hiw-phase-title">Choose Attractions: Curated Landmarks</h3>
                  <p className="hiw-phase-desc">
                    Dive into a selection of curated landmarks and hidden gems. Our system analyzes millions of data points to suggest attractions tailored to your personal preferences. Add world-renowned sites or local secrets to your custom bucket list with a single click.
                  </p>
                  <div className="hiw-cards-row">
                    <div className="hiw-mini-card">
                      <div className="hiw-mini-icon">👍</div>
                      <div className="hiw-mini-text">Top Suggestion</div>
                      <div className="hiw-plus">+</div>
                    </div>
                    <div className="hiw-mini-card">
                      <div className="hiw-mini-icon">🛡️</div>
                      <div className="hiw-mini-text">Curated Landmark</div>
                      <div className="hiw-plus">+</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phase 3 */}
              <div className="hiw-phase">
                <div className="hiw-phase-number">3</div>
                <div className="hiw-phase-details">
                  <div className="hiw-phase-subtitle">⚡ PHASE THREE</div>
                  <h3 className="hiw-phase-title">Finalize Itinerary: Optimization Engine</h3>
                  <p className="hiw-phase-desc">
                    Let our advanced optimization engine handle the logistics. The platform automatically calculates the most efficient travel routes, provides precise time-on-site estimates, and generates a comprehensive day-wise breakdown. Adjust your schedule in real-time as your travel needs evolve.
                  </p>
                  <div className="hiw-ai-banner">
                    <div className="hiw-ai-icon-wrap">✨</div>
                    <div className="hiw-ai-text">
                      <strong>AI-Powered Route Optimization Active</strong>
                      <span>Intelligent scheduling engine processing your data.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="hiw-support-content">
              <div className="hiw-support-header">
                <div>
                  <h3 className="hiw-support-title">Safety Shield</h3>
                  <p className="hiw-support-desc">
                    Intelligent assistance and local resources curated based on your current geographical context for total peace of mind.
                  </p>
                </div>
                <button className="hiw-sos-btn">
                  <span className="hiw-asterisk">✱</span> GLOBAL SOS
                </button>
              </div>

              <div className="hiw-zones-grid">
                {/* Primary Zone */}
                <div className="hiw-zone-card">
                  <div className="hiw-zone-header">
                    <div className="hiw-zone-info">
                      <h4>Primary Zone</h4>
                      <div className="hiw-zone-meta">
                        <span className="hiw-meta-badge">CURRENT LOCATION</span>
                        <span className="hiw-meta-time">14:30 | EN/HI</span>
                      </div>
                    </div>
                    <div className="hiw-zone-icon">🏢</div>
                  </div>

                  <div className="hiw-emergency-numbers">
                    <div className="hiw-number-box">
                      <span className="hiw-number-label">AMBULANCE</span>
                      <span className="hiw-number-value">911</span>
                    </div>
                    <div className="hiw-number-box">
                      <span className="hiw-number-label">LOCAL POLICE</span>
                      <span className="hiw-number-value">110</span>
                    </div>
                  </div>

                  <div className="hiw-facility-info">
                    <div className="hiw-facility-title">
                      <span className="hiw-plus-icon">🏥</span> Nearby Medical Care
                    </div>
                    <div className="hiw-facility-details">
                      <div className="hiw-status-dot green"></div>
                      <div>
                        <strong>Central General Hospital</strong>
                        <span>Emergency Dept | 24/7 Support</span>
                      </div>
                    </div>
                  </div>

                  <div className="hiw-embassy-info">
                    <div className="hiw-embassy-title">🏛️ Local Embassy Info</div>
                    <p>Consular services for your home nation are located in the administrative district.</p>
                  </div>
                </div>

                {/* Transit Zone */}
                <div className="hiw-zone-card">
                  <div className="hiw-zone-header">
                    <div className="hiw-zone-info">
                      <h4>Transit Zone</h4>
                      <div className="hiw-zone-meta">
                        <span className="hiw-meta-badge transit">NEXT DESTINATION</span>
                        <span className="hiw-meta-time">17:00 | EN/FR</span>
                      </div>
                    </div>
                    <div className="hiw-zone-icon">🧭</div>
                  </div>

                  <div className="hiw-emergency-numbers">
                    <div className="hiw-number-box">
                      <span className="hiw-number-label">EMERGENCY</span>
                      <span className="hiw-number-value">119</span>
                    </div>
                    <div className="hiw-number-box">
                      <span className="hiw-number-label">SAFETY HUB</span>
                      <span className="hiw-number-value">112</span>
                    </div>
                  </div>

                  <div className="hiw-facility-info">
                    <div className="hiw-facility-title">
                      <span className="hiw-info-icon">ℹ️</span> Protocol & Guidance
                    </div>
                    <p className="hiw-protocol-text">
                      Keep your digital emergency vault synced. Medical facilities here require insurance validation.
                    </p>
                  </div>

                  <div className="hiw-verified-banner">
                    <div className="hiw-verified-icon">✔️</div>
                    <div className="hiw-verified-text">
                      <strong>Verified Safety</strong>
                      <span>Snaptrip-certified facility</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
