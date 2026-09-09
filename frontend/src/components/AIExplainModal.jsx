import React from 'react';
import { X, Sparkles, AlertOctagon, ArrowRight } from 'lucide-react';

export default function AIExplainModal({ isOpen, onClose, aiData, onApplyAction }) {
  if (!isOpen || !aiData) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
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
        maxWidth: '680px',
        background: '#0F172A',
        border: '1px solid rgba(255, 181, 0, 0.4)',
        borderRadius: '1.25rem',
        padding: '1.5rem',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
        color: '#FFFFFF',
      }}>
        
        {/* Top Accent Strip */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #FFB500, #F97316, #EF4444)', borderTopLeftRadius: '1.25rem', borderTopRightRadius: '1.25rem' }}></div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px', color: '#94A3B8' }}
        >
          <X style={{ width: '20px', height: '20px' }} />
        </button>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
          <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255, 181, 0, 0.15)', color: 'var(--ups-gold)', border: '1px solid rgba(255, 181, 0, 0.3)' }}>
            <Sparkles style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
              AI Decision Support & Root Cause Analysis
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)' }}>
              Prescriptive Intelligence for Logistics Operations
            </p>
          </div>
        </div>

        {/* Operational Synthesis */}
        <div style={{ padding: '14px', borderRadius: '12px', background: '#09101E', border: '1px solid #1E293B', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: 'var(--ups-gold)', fontFamily: 'var(--font-mono)', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
            Operational Synthesis
          </span>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-slate-200)', lineHeight: 1.6 }}>
            {aiData.summary}
          </p>
        </div>

        {/* Root Causes & Prediction */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          
          <div style={{ padding: '12px', borderRadius: '10px', background: '#09101E', border: '1px solid #1E293B' }}>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#EF4444', fontFamily: 'var(--font-mono)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <AlertOctagon style={{ width: '13px', height: '13px' }} />
              Primary Risk Drivers
            </span>
            <ul style={{ fontSize: '0.75rem', color: 'var(--text-slate-300)', display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '16px' }}>
              {aiData.causes?.map((cause, i) => (
                <li key={i}>{cause}</li>
              ))}
            </ul>
          </div>

          <div style={{ padding: '12px', borderRadius: '10px', background: '#09101E', border: '1px solid #1E293B' }}>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: 'var(--ups-gold)', fontFamily: 'var(--font-mono)', fontWeight: 800, display: 'block', marginBottom: '6px' }}>
              SLA Delay Projection
            </span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-slate-300)', lineHeight: 1.5 }}>
              {aiData.prediction}
            </p>
          </div>

        </div>

        {/* Prescriptive Recommendations */}
        <div style={{ marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)', fontWeight: 800, display: 'block', marginBottom: '8px' }}>
            AI Recommended Interventions (Ranked by Expected Benefit)
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {aiData.recommendations?.map((rec, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: '#09101E',
                  border: '1px solid #1E293B',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '0.8125rem', color: '#FFFFFF' }}>{rec.action}</strong>
                    <span style={{
                      fontSize: '0.625rem',
                      fontFamily: 'var(--font-mono)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontWeight: 800,
                      background: rec.priority === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 181, 0, 0.2)',
                      color: rec.priority === 'CRITICAL' ? '#EF4444' : 'var(--ups-gold)',
                    }}>
                      {rec.priority}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-slate-400)', marginTop: '2px' }}>{rec.description}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  {rec.expected_delay_reduction > 0 && (
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#10B981', fontWeight: 800 }}>
                      Save ~{rec.expected_delay_reduction} hrs
                    </span>
                  )}
                  <button
                    onClick={() => {
                      onApplyAction(rec);
                      onClose();
                    }}
                    className="btn-primary"
                    style={{ padding: '6px 12px', fontSize: '11px' }}
                  >
                    <span>Apply</span>
                    <ArrowRight style={{ width: '12px', height: '12px' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '12px' }}
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
}
