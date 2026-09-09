import React from 'react';
import { CloudRain, Car, Warehouse, Sparkles, Lightbulb, Navigation, Smartphone, Truck, RotateCcw } from 'lucide-react';

export default function DemoControlBar({ currentStep, onExecuteStep, onReset }) {
  const steps = [
    { num: 1, label: 'Healthy Baseline', icon: '🟢', desc: 'Control Tower: Baseline Risk 2.8 • SLA 12%' },
    { num: 2, label: 'Heavy Rainfall', icon: CloudRain, desc: 'Control Tower: Weather disruption injected → 5.4 🟡' },
    { num: 3, label: 'Highway Traffic', icon: Car, desc: 'Control Tower: Highway gridlock injected → 7.1 🟠' },
    { num: 4, label: 'Hub Delay', icon: Warehouse, desc: 'Control Tower: Dock backlog → 8.7 🔴 CRITICAL' },
    { num: 5, label: 'AI Root Cause', icon: Sparkles, desc: 'Control Tower: AI diagnostic synthesis' },
    { num: 6, label: 'Customer View', icon: Smartphone, desc: 'Recipient: New ETA, Plain Delay Reason & Reassurance' },
    { num: 7, label: 'Driver View', icon: Truck, desc: 'In-Cab HUD: Turn-by-Turn Reroute & Road Hazards' },
    { num: 8, label: 'Execute Recovery', icon: Navigation, desc: 'Control Tower: Approve Reroute B → Recover to 4.2 🟡' },
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
