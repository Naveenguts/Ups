import React from 'react';
import { AlertTriangle, CheckCircle, Clock, ShieldAlert } from 'lucide-react';

export default function RiskGauge({ score = 2.8, slaProb = 12, delayHours = 0.6, status = "IN_TRANSIT" }) {
  let colorClass = "#10B981";
  let strokeColor = "#10B981";
  let tier = "LOW";
  let badgeClass = "badge-low";

  if (score >= 8.0) {
    colorClass = "#EF4444";
    strokeColor = "#EF4444";
    tier = "CRITICAL";
    badgeClass = "badge-critical alert-pulse-red";
  } else if (score >= 6.0) {
    colorClass = "#F97316";
    strokeColor = "#F97316";
    tier = "HIGH";
    badgeClass = "badge-high";
  } else if (score >= 3.0) {
    colorClass = "#F59E0B";
    strokeColor = "#F59E0B";
    tier = "MEDIUM";
    badgeClass = "badge-medium";
  }

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (Math.min(10, Math.max(0, score)) / 10) * circumference;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
      
      {/* Title & Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            Live Risk Score
          </span>
          <h3 style={{ fontSize: '1.125rem', color: '#FFFFFF', marginTop: '2px' }}>
            Shipment Risk Engine
          </h3>
        </div>
        <span className={`badge ${badgeClass}`}>
          {score >= 8.0 ? <ShieldAlert style={{ width: '13px', height: '13px' }} /> : score >= 6.0 ? <AlertTriangle style={{ width: '13px', height: '13px' }} /> : <CheckCircle style={{ width: '13px', height: '13px' }} />}
          {tier} ({score.toFixed(1)}/10)
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        
        {/* SVG Circle Gauge */}
        <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg style={{ width: '120px', height: '120px', transform: 'rotate(-90deg)' }}>
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="#1E293B"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke={strokeColor}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '2rem', fontWeight: 900, color: colorClass, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
              {score.toFixed(1)}
            </span>
            <span style={{ fontSize: '0.625rem', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginTop: '2px' }}>
              / 10 Score
            </span>
          </div>
        </div>

        {/* SLA Probability & Delay */}
        <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* SLA Probability Meter */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-slate-300)' }}>SLA Breach Probability</span>
              <span style={{ color: colorClass, fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>{slaProb.toFixed(0)}%</span>
            </div>
            <div style={{ width: '100%', height: '10px', background: '#1E293B', borderRadius: '9999px', overflow: 'hidden', padding: '2px', border: '1px solid #334155' }}>
              <div style={{
                width: `${Math.min(100, Math.max(5, slaProb))}%`,
                height: '100%',
                background: colorClass,
                borderRadius: '9999px',
                transition: 'width 0.8s ease, background-color 0.4s ease',
              }}></div>
            </div>
          </div>

          {/* Delay & Status Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ background: '#0F172A', padding: '10px', borderRadius: '10px', border: '1px solid #1E293B' }}>
              <span style={{ fontSize: '0.625rem', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock style={{ width: '12px', height: '12px', color: 'var(--ups-gold)' }} />
                Est. Delay
              </span>
              <p style={{ fontSize: '1rem', fontWeight: 800, color: delayHours > 3 ? '#EF4444' : 'var(--text-slate-200)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                +{delayHours.toFixed(1)} hrs
              </p>
            </div>

            <div style={{ background: '#0F172A', padding: '10px', borderRadius: '10px', border: '1px solid #1E293B' }}>
              <span style={{ fontSize: '0.625rem', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Status
              </span>
              <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--ups-gold)', fontFamily: 'var(--font-mono)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {status}
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
