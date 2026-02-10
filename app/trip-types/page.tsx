'use client'

import '../home.css'
import './trip-types.css'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TripTypes() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [country, setCountry] = useState('Finland')
  const [style, setStyle] = useState<'Intense' | 'Relaxed' | null>(null)
  const [duration, setDuration] = useState<'Weekend' | 'Mini' | 'Full' | null>(null)
  const [immersion, setImmersion] = useState<'Nature' | 'Culture' | null>(null)

  return (
    <main className="trip-root">
      <SiteHeader />
      <div className="trip-wrapper">
        <div className="trip-header">
          <h1>Choose Your Trip</h1>
          <p>Select a country and personalize your travel style</p>
        </div>

        <div className="progress-pill">
          <div className={`progress-dot ${step >= 1 ? 'active' : ''}`}>{step > 1 ? '✓' : '1'}</div>
          <span className="progress-line" />
          <div className={`progress-dot ${step >= 2 ? 'active' : ''}`}>{step > 2 ? '✓' : '2'}</div>
          <span className="progress-line" />
          <div className={`progress-dot ${step >= 3 ? 'active' : ''}`}>3</div>
          <span className="progress-line" />
          <div className="progress-dot star">✦</div>
        </div>

        <div className="trip-card">
          {step === 1 && (
            <div className="panel">
              <div className="country-row">
                <label>Country</label>
                <select value={country} onChange={(e) => setCountry(e.target.value)}>
                  {['Finland', 'India', 'France', 'Italy', 'Spain', 'Japan', 'USA'].map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <h3>Choose your trip style</h3>
              <p>Select the pace that matches your travel personality</p>
              <div className="grid">
                <button className={`tile ${style === 'Intense' ? 'selected' : ''}`} onClick={() => setStyle('Intense')}>
                  <div className="tile-icon-circle">🧭</div>
                  <strong>Intense</strong>
                  <span>Move more, see more, experience everything</span>
                  <div className="selection-dot">{style === 'Intense' ? '✓' : ''}</div>
                </button>
                <button className={`tile ${style === 'Relaxed' ? 'selected' : ''}`} onClick={() => setStyle('Relaxed')}>
                  <div className="tile-icon-circle">🌿</div>
                  <strong>Relaxed</strong>
                  <span>Laid back, soak in the vibe, unwind</span>
                  <div className="selection-dot">{style === 'Relaxed' ? '✓' : ''}</div>
                </button>
              </div>
              <div className="actions center">
                <button className="primary" disabled={!style} onClick={() => setStep(2)}>Continue</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="panel">
              <h3>Choose your trip duration</h3>
              <p>How long would you like to explore {country}?</p>
              <div className="grid vertical">
                <button className={`tile wide ${duration === 'Weekend' ? 'selected' : ''}`} onClick={() => setDuration('Weekend')}>
                  <div className="row">
                    <div className="radio-dot">{duration === 'Weekend' ? '✓' : ''}</div>
                    <div className="tile-icon-circle small">📅</div>
                    <div className="tile-text">
                      <strong>Weekend Getaway</strong>
                      <span>2–4 days of adventure</span>
                    </div>
                  </div>
                </button>
                <button className={`tile wide ${duration === 'Mini' ? 'selected' : ''}`} onClick={() => setDuration('Mini')}>
                  <div className="row">
                    <div className="radio-dot">{duration === 'Mini' ? '✓' : ''}</div>
                    <div className="tile-icon-circle small">🧳</div>
                    <div className="tile-text">
                      <strong>Mini‑Vacation</strong>
                      <span>4–6 days of exploration</span>
                    </div>
                  </div>
                </button>
                <button className={`tile wide ${duration === 'Full' ? 'selected' : ''}`} onClick={() => setDuration('Full')}>
                  <div className="row">
                    <div className="radio-dot">{duration === 'Full' ? '✓' : ''}</div>
                    <div className="tile-icon-circle small">🗺️</div>
                    <div className="tile-text">
                      <strong>Full‑Blown Vacation</strong>
                      <span>7+ days of immersion</span>
                    </div>
                  </div>
                </button>
              </div>
              <div className="actions">
                <button className="secondary" onClick={() => setStep(1)}>Back</button>
                <button className="primary" disabled={!duration} onClick={() => setStep(3)}>Continue</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="panel">
              <h3>Nature Immersion</h3>
              <div className="grid">
                <button className={`tile ${immersion === 'Nature' ? 'selected' : ''}`} onClick={() => setImmersion('Nature')}>
                  <div className="tile-icon-circle">⛰️</div>
                  <strong>Unmissable</strong>
                  <span>Key landmarks and must‑see spots</span>
                  <div className="selection-dot">{immersion === 'Nature' ? '✓' : ''}</div>
                </button>
                <button className={`tile ${immersion === 'Culture' ? 'selected' : ''}`} onClick={() => setImmersion('Culture')}>
                  <div className="tile-icon-circle">🌲</div>
                  <strong>A lot more</strong>
                  <span>Deeper nature exploration</span>
                  <div className="selection-dot">{immersion === 'Culture' ? '✓' : ''}</div>
                </button>
              </div>
              <h3 className="section-sub">Cultural Immersion</h3>
              <div className="grid">
                <button className={`tile ${immersion === 'Nature' ? '' : ''}`} onClick={() => setImmersion('Nature')}>
                  <div className="tile-icon-circle">🏛️</div>
                  <strong>Unmissable</strong>
                  <span>Must‑see cultural sites</span>
                </button>
                <button className={`tile ${immersion === 'Culture' ? 'selected' : ''}`} onClick={() => setImmersion('Culture')}>
                  <div className="tile-icon-circle">🎭</div>
                  <strong>A lot more</strong>
                  <span>Deeper cultural experiences</span>
                  <div className="selection-dot">{immersion === 'Culture' ? '✓' : ''}</div>
                </button>
              </div>
              <div className="actions">
                <button className="secondary" onClick={() => setStep(2)}>Back</button>
                <button
                  className="primary"
                  disabled={!immersion}
                  onClick={() => router.push(`/explore?query=${encodeURIComponent(country)}&type=country`)}
                >
                  Generate Trip
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <SiteFooter />
    </main>
  )
}
