'use client';
// ============================================================================
// VantageFin Pro — Setup / Onboarding Screen
// ============================================================================

import { useState } from 'react';
import { useFinanceStore } from '@/lib/store';

export default function SetupScreen() {
  const { completeSetup } = useFinanceStore();
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [step, setStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && name.trim()) {
      setStep(2);
      return;
    }
    if (step === 2 && budget) {
      completeSetup(name.trim(), parseFloat(budget));
    }
  };

  return (
    <div className="setup">
      <div className="setup__bg">
        <div className="setup__orb setup__orb--1" />
        <div className="setup__orb setup__orb--2" />
        <div className="setup__orb setup__orb--3" />
      </div>

      <div className="setup__card">
        <div className="setup__logo">
          <svg width="48" height="48" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="url(#sLogoGrad)" />
            <path d="M8 20V10l6 4-6 6zm6-6l6-4v10l-6-6z" fill="white" fillOpacity="0.9" />
            <defs>
              <linearGradient id="sLogoGrad" x1="0" y1="0" x2="28" y2="28">
                <stop stopColor="#6366F1" />
                <stop offset="1" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </svg>
          <h1 className="setup__brand">VantageFin <span>Pro</span></h1>
        </div>

        <p className="setup__subtitle">Your premium personal finance dashboard</p>

        {/* Progress */}
        <div className="setup__progress">
          <div className={`setup__progress-step ${step >= 1 ? 'setup__progress-step--active' : ''}`}>1</div>
          <div className={`setup__progress-line ${step >= 2 ? 'setup__progress-line--active' : ''}`} />
          <div className={`setup__progress-step ${step >= 2 ? 'setup__progress-step--active' : ''}`}>2</div>
        </div>

        <form onSubmit={handleSubmit} className="setup__form">
          {step === 1 ? (
            <div className="setup__step">
              <h2 className="setup__step-title">What&apos;s your name?</h2>
              <p className="setup__step-desc">We&apos;ll personalize your dashboard</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="form-input setup__input"
                autoFocus
                required
              />
            </div>
          ) : (
            <div className="setup__step">
              <h2 className="setup__step-title">Set your monthly budget</h2>
              <p className="setup__step-desc">You can always change this later</p>
              <div className="input-with-prefix setup__input-wrap">
                <span className="input-prefix">$</span>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="5,000"
                  className="form-input form-input--amount"
                  min="0"
                  step="100"
                  autoFocus
                  required
                />
              </div>
              <div className="setup__presets">
                {[2000, 3000, 5000, 7500, 10000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setBudget(String(amt))}
                    className={`setup__preset ${budget === String(amt) ? 'setup__preset--active' : ''}`}
                  >
                    ${amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="btn btn--primary btn--lg setup__submit">
            {step === 1 ? 'Continue →' : '🚀 Launch Dashboard'}
          </button>

          {step === 2 && (
            <button type="button" onClick={() => setStep(1)} className="btn btn--ghost setup__back">
              ← Back
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
