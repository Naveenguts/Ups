import React from 'react';
import { Layers } from 'lucide-react';

export default function FactorBreakdown({ breakdown = {} }) {
  const factors = [
    { key: 'weather', defaultName: 'Weather Severity', icon: '🌧', weight: '25%' },
    { key: 'traffic', defaultName: 'Traffic Congestion', icon: '🚗', weight: '20%' },
    { key: 'hub', defaultName: 'Hub Delay / Port Congestion', icon: '🏭', weight: '20%' },
    { key: 'historical', defaultName: 'Historical Route Delay', icon: '📊', weight: '15%' },
    { key: 'geopolitical', defaultName: 'Geopolitical / News', icon: '📰', weight: '10%' },
    { key: 'shipment', defaultName: 'Shipment Characteristics', icon: '📦', weight: '10%' },
  ];

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            Explainable AI (XAI)
          </span>
          <h3 style={{ fontSize: '1.125rem', color: '#FFFFFF', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers style={{ width: '16px', height: '16px', color: 'var(--ups-gold)' }} />
            Main Risk Contributors & Point Breakdown
          </h3>
        </div>
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)' }}>
          Normalized 0–10 Scale
        </span>
      </div>

      {/* Factor List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {factors.map((f) => {
          const item = breakdown[f.key] || {
            name: f.defaultName,
            icon: f.icon,
            raw_value: 2.0,
            contribution: 0.5,
          };
          const rawVal = item.raw_value ?? 2.0;
          const contribution = item.contribution ?? 0.5;

          let barColor = '#10B981';
          let textColor = '#34D399';
          if (rawVal >= 8.0) {
            barColor = '#EF4444';
            textColor = '#F87171';
          } else if (rawVal >= 6.0) {
            barColor = '#F97316';
            textColor = '#FB923C';
          } else if (rawVal >= 4.0) {
            barColor = '#F59E0B';
            textColor = '#FBBF24';
          }

          return (
            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1rem' }}>{item.icon || f.icon}</span>
                  <span style={{ color: 'var(--text-slate-200)', fontWeight: 600 }}>{item.name || f.defaultName}</span>
                  <span style={{ color: 'var(--text-slate-500)', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)' }}>({f.weight})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ fontWeight: 800, color: textColor }}>+{contribution.toFixed(1)} pts</span>
                  <span style={{ color: 'var(--text-slate-500)', fontSize: '0.6875rem' }}>({rawVal.toFixed(0)}/10)</span>
                </div>
              </div>

              {/* Progress Bar Track */}
              <div style={{ width: '100%', height: '8px', background: '#1E293B', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, Math.max(5, (rawVal / 10) * 100))}%`,
                  height: '100%',
                  background: barColor,
                  borderRadius: '9999px',
                  transition: 'width 0.6s ease, background-color 0.4s ease',
                }}></div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #1E293B', fontSize: '0.6875rem', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Linear Base Weights + Compound Disruption Escalator</span>
        <span style={{ color: 'var(--ups-gold)', fontWeight: 700 }}>✓ Fully Interpretable</span>
      </div>

    </div>
  );
}
