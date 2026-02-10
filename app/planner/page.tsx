'use client'

import '../home.css'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import { useState } from 'react'

export default function PlannerFlow() {
  const [step, setStep] = useState(1)
  const [style, setStyle] = useState<'Intense' | 'Relaxed' | null>(null)
  const [duration, setDuration] = useState<'Weekend' | 'Mini' | 'Full' | null>(null)
  const [immersion, setImmersion] = useState<'Nature' | 'Culture' | null>(null)

  return (
    <main className="planner-page">
      <SiteHeader />
      <div className="planner-frame">
        <div className="planner-title">
          <h2>Welcome to Finland</h2>
          <p>Recommended season: December through April</p>
        </div>

        <div className="planner-progress">
          {[1, 2, 3].map((n) => (
            <div key={n} className={`dot ${step === n ? 'active' : ''}`}>{n}</div>
          ))}
        </div>

        <div className="planner-panel">
          {step === 1 && (
            <div className="panel-body">
              <h3>Choose your trip style</h3>
              <p>Select the pace that matches your travel personality</p>
              <div className="panel-grid">
                <button className={`tile ${style === 'Intense' ? 'selected' : ''}`} onClick={() => setStyle('Intense')}>
                  <div className="tile-icon"></div>
                  <strong>Intense</strong>
                  <span>More tours, more experiences</span>
                </button>
                <button className={`tile ${style === 'Relaxed' ? 'selected' : ''}`} onClick={() => setStyle('Relaxed')}>
                  <div className="tile-icon"></div>
                  <strong>Relaxed</strong>
                  <span>Laid back, soak in the vibe</span>
                </button>
              </div>
              <div className="panel-actions center">
                <button className="primary" disabled={!style} onClick={() => setStep(2)}>Continue</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="panel-body">
              <h3>Choose your trip duration</h3>
              <p>How long would you like to explore Finland?</p>
              <div className="panel-list">
                <button className={`tile wide ${duration === 'Weekend' ? 'selected' : ''}`} onClick={() => setDuration('Weekend')}>
                  <strong>Weekend Getaway</strong>
                  <span>2–4 days of adventure</span>
                </button>
                <button className={`tile wide ${duration === 'Mini' ? 'selected' : ''}`} onClick={() => setDuration('Mini')}>
                  <strong>Mini‑Vacation</strong>
                  <span>4–6 days of exploration</span>
                </button>
                <button className={`tile wide ${duration === 'Full' ? 'selected' : ''}`} onClick={() => setDuration('Full')}>
                  <strong>Full‑Blown Vacation</strong>
                  <span>7+ days of immersion</span>
                </button>
              </div>
              <div className="panel-actions">
                <button className="secondary" onClick={() => setStep(1)}>Back</button>
                <button className="primary" disabled={!duration} onClick={() => setStep(3)}>Continue</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="panel-body">
              <h3>Pick immersion</h3>
              <p>Select the experience focus for your trip</p>
              <div className="panel-grid">
                <button className={`tile ${immersion === 'Nature' ? 'selected' : ''}`} onClick={() => setImmersion('Nature')}>
                  <strong>Nature Immersion</strong>
                  <span>Unmissable outdoors & views</span>
                </button>
                <button className={`tile ${immersion === 'Culture' ? 'selected' : ''}`} onClick={() => setImmersion('Culture')}>
                  <strong>Cultural Immersion</strong>
                  <span>Local culture and stories</span>
                </button>
              </div>
              <div className="panel-actions">
                <button className="secondary" onClick={() => setStep(2)}>Back</button>
                <button className="primary" disabled={!immersion}>Generate Trip</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <SiteFooter />
    </main>
  )
}
