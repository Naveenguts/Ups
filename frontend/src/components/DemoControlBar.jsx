import React from 'react';
import { CloudRain, Car, Warehouse, Sparkles, Lightbulb, Navigation, Smartphone, RotateCcw } from 'lucide-react';

export default function DemoControlBar({ currentStep, onExecuteStep, onReset }) {
  const steps = [
    { num: 1, label: 'Healthy Baseline', icon: '🟢', desc: 'Initial state: Risk 2.8 • SLA 12%' },
    { num: 2, label: 'Heavy Rainfall', icon: CloudRain, desc: 'Weather disruption injected → 5.4 🟡' },
    { num: 3, label: 'Highway Traffic', icon: Car, desc: 'Highway gridlock injected → 7.1 🟠' },
    { num: 4, label: 'Hub Terminal Delay', icon: Warehouse, desc: 'Dock backlog injected → 8.7 🔴 CRITICAL' },
    { num: 5, label: 'AI Root Cause', icon: Sparkles, desc: 'Explain WHY & synthesize drivers' },
    { num: 6, label: 'AI Recommendations', icon: Lightbulb, desc: 'Ranked prescriptive solutions' },
    { num: 7, label: 'Execute Reroute B', icon: Navigation, desc: 'Bypass bottleneck → Recover to 4.2 🟡' },
    { num: 8, label: 'Customer & Driver Alerts', icon: Smartphone, desc: 'Synchronized communication dispatched' },
  ];

  return (
    <div className="demo-control-bar">
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        
        {/* Presentation Pitch Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--ups-gold)',
            boxShadow: '0 0 10px var(--ups-gold)',
            display: 'inline-block',
          }}></span>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--ups-gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            2-Minute Pitch Flow:
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)' }}>
            #UPS10245 (Chennai → Bangalore)
          </span>
        </div>

        {/* Step Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {steps.map((s) => {
            const isActive = currentStep === s.num;
            const Icon = s.icon;
            return (
              <button
                key={s.num}
                onClick={() => onExecuteStep(s.num)}
                className={`demo-step-btn ${isActive ? 'active' : ''}`}
                title={s.desc}
              >
                <span style={{ opacity: 0.7, fontSize: '10px' }}>{s.num}.</span>
                {typeof Icon === 'string' ? (
                  <span>{Icon}</span>
                ) : (
                  <Icon style={{ width: '13px', height: '13px' }} />
                )}
                <span>{s.label}</span>
              </button>
            );
          })}

          <button
            onClick={onReset}
            style={{
              padding: '6px 8px',
              borderRadius: '8px',
              background: '#1E293B',
              color: '#94A3B8',
              border: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '4px',
            }}
            title="Reset Scenario to Step 1"
          >
            <RotateCcw style={{ width: '14px', height: '14px' }} />
          </button>
        </div>

      </div>
    </div>
  );
}
