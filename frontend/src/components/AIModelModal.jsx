import React, { useState, useEffect } from 'react';
import { X, Sparkles, Key, CheckCircle, ExternalLink, ShieldAlert, Cpu } from 'lucide-react';

export default function AIModelModal({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/ai/status')
        .then(r => r.json())
        .then(data => setStatus(data))
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveKey = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/ai/set-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: apiKey }),
      });
      const data = await res.json();
      setSaveSuccess(true);
      const stRes = await fetch('/api/ai/status');
      setStatus(await stRes.json());
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      animation: 'fadeIn 0.2s ease-out',
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '560px',
        background: '#0F172A',
        border: '1px solid #334155',
        borderRadius: '1.25rem',
        padding: '1.75rem',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
        color: '#FFFFFF',
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1E293B', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <Cpu style={{ width: '22px', height: '22px' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#FFFFFF' }}>
                Real-Time LLM Reasoning Engine
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)' }}>
                Powered by Google Gemini 1.5 Flash (Free Tier)
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ padding: '6px', borderRadius: '8px', color: '#94A3B8' }}>
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Model Details Card */}
        <div style={{ marginTop: '1.25rem', background: '#09101E', borderRadius: '12px', border: '1px solid #1E293B', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-slate-400)' }}>ACTIVE INFERENCE MODEL</span>
            <span style={{
              fontSize: '0.6875rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '4px',
              background: status?.has_custom_key ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
              color: status?.has_custom_key ? '#10B981' : '#38BDF8',
              border: status?.has_custom_key ? '1px solid #10B981' : '1px solid #38BDF8',
              fontFamily: 'var(--font-mono)',
            }}>
              {status?.has_custom_key ? '🟢 LIVE GEMINI API' : '⚡ ZERO-KEY AGENT MODE'}
            </span>
          </div>

          <div style={{ fontSize: '1.125rem', fontWeight: 900, color: '#FFFFFF' }}>
            Google Gemini 1.5 Flash
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-slate-300)', marginTop: '4px', lineHeight: 1.5 }}>
            {status?.description || 'Real-time multimodal logistics reasoning model predicting SLA breach probabilities and synthesizing actionable detour corridors.'}
          </p>

          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: '#94A3B8' }}>
            <span>Free Tier: 15 Requests/Min (0 Cost)</span>
            <span>Latency: &lt; 800ms</span>
          </div>
        </div>

        {/* API Key Input Section */}
        <div style={{ marginTop: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
            OPTIONAL: ENTER GOOGLE AI STUDIO API KEY
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Key style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#64748B' }} />
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                style={{
                  width: '100%',
                  background: '#09101E',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '8px 12px 8px 34px',
                  color: '#FFFFFF',
                  fontSize: '0.8125rem',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                }}
              />
            </div>
            <button
              onClick={handleSaveKey}
              disabled={saving}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.75rem' }}
            >
              {saving ? 'Saving...' : 'Set Key'}
            </button>
          </div>

          {saveSuccess && (
            <div style={{ marginTop: '6px', fontSize: '0.6875rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)' }}>
              <CheckCircle style={{ width: '12px', height: '12px' }} />
              Key saved! Live Gemini 1.5 Flash is now active.
            </div>
          )}

          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.6875rem', color: '#64748B' }}>
            <span>Zero-Key Mode works out of the box without any key!</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--ups-gold)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
            >
              Get Free Key from Google AI Studio <ExternalLink style={{ width: '11px', height: '11px' }} />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #1E293B', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '8px 18px', fontSize: '12px' }}>
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
