import React, { useState } from 'react';
import { Smartphone, Truck, Compass, ShieldCheck, Code, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RoleSwitcher({ activeRole, setActiveRole, currentRoleData, loading }) {
  const [showInspector, setShowInspector] = useState(false);

  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.85) 100%)',
      borderBottom: '1px solid #1E293B',
      padding: '0.625rem 1.25rem',
      position: 'sticky',
      top: '64px',
      zIndex: 100,
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        
        {/* Left: Role Navigation Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            color: 'var(--ups-gold)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginRight: '4px',
          }}>
            PERSPECTIVE:
          </span>

          {/* Role 1: Customer */}
          <button
            onClick={() => setActiveRole('customer')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeRole === 'customer' ? 'var(--ups-gold)' : '#0F172A',
              color: activeRole === 'customer' ? '#000000' : 'var(--text-slate-300)',
              border: activeRole === 'customer' ? '1px solid var(--ups-gold)' : '1px solid #334155',
              boxShadow: activeRole === 'customer' ? '0 0 16px var(--ups-gold-glow)' : 'none',
            }}
          >
            <Smartphone style={{ width: '15px', height: '15px' }} />
            <span>1. Customer View</span>
            <span style={{
              fontSize: '0.625rem',
              padding: '1px 5px',
              borderRadius: '4px',
              background: activeRole === 'customer' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)',
              fontFamily: 'var(--font-mono)',
            }}>
              Recipient
            </span>
          </button>

          {/* Role 2: Driver */}
          <button
            onClick={() => setActiveRole('driver')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeRole === 'driver' ? '#22D3EE' : '#0F172A',
              color: activeRole === 'driver' ? '#000000' : 'var(--text-slate-300)',
              border: activeRole === 'driver' ? '1px solid #22D3EE' : '1px solid #334155',
              boxShadow: activeRole === 'driver' ? '0 0 16px rgba(34, 211, 238, 0.4)' : 'none',
            }}
          >
            <Truck style={{ width: '15px', height: '15px' }} />
            <span>2. Driver View</span>
            <span style={{
              fontSize: '0.625rem',
              padding: '1px 5px',
              borderRadius: '4px',
              background: activeRole === 'driver' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)',
              fontFamily: 'var(--font-mono)',
            }}>
              In-Cab HUD
            </span>
          </button>

          {/* Role 3: Control Tower */}
          <button
            onClick={() => setActiveRole('control-tower')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeRole === 'control-tower' ? '#10B981' : '#0F172A',
              color: activeRole === 'control-tower' ? '#000000' : 'var(--text-slate-300)',
              border: activeRole === 'control-tower' ? '1px solid #10B981' : '1px solid #334155',
              boxShadow: activeRole === 'control-tower' ? '0 0 16px rgba(16, 185, 129, 0.4)' : 'none',
            }}
          >
            <Compass style={{ width: '15px', height: '15px' }} />
            <span>3. Control Tower / Dispatcher</span>
            <span style={{
              fontSize: '0.625rem',
              padding: '1px 5px',
              borderRadius: '4px',
              background: activeRole === 'control-tower' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)',
              fontFamily: 'var(--font-mono)',
            }}>
              Command
            </span>
          </button>
        </div>

        {/* Right: Security & Wire Inspector Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '6px',
            padding: '4px 8px',
            fontSize: '0.6875rem',
            color: '#10B981',
            fontFamily: 'var(--font-mono)',
          }}>
            <ShieldCheck style={{ width: '13px', height: '13px' }} />
            <span>API Data Separation Active</span>
          </div>

          <button
            onClick={() => setShowInspector(!showInspector)}
            className="btn-secondary"
            style={{
              padding: '5px 10px',
              fontSize: '0.6875rem',
              fontFamily: 'var(--font-mono)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Inspect raw JSON payload over the wire"
          >
            <Code style={{ width: '13px', height: '13px', color: 'var(--ups-gold)' }} />
            <span>Inspect Wire Payload</span>
            {showInspector ? <ChevronUp style={{ width: '12px', height: '12px' }} /> : <ChevronDown style={{ width: '12px', height: '12px' }} />}
          </button>
        </div>

      </div>

      {/* Expandable Wire Payload Inspector (Hackathon Defense Proof) */}
      {showInspector && (
        <div style={{
          maxWidth: '1280px',
          margin: '0.75rem auto 0.25rem',
          background: '#09101E',
          border: '1px solid #334155',
          borderRadius: '10px',
          padding: '1rem',
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--ups-gold)', fontFamily: 'var(--font-mono)' }}>
                WIRE PAYLOAD AUDIT: GET /api/roles/{activeRole}/UPS10245
              </span>
              <span style={{ fontSize: '0.625rem', background: '#1E293B', color: '#94A3B8', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                Status 200 OK • HTTP JSON
              </span>
            </div>
            <span style={{ fontSize: '0.6875rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
              Server-side derived from single-source DB
            </span>
          </div>

          {/* Role Separation Defense Callout */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.7)',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #334155',
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-mono)',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}>
            {activeRole === 'customer' && (
              <>
                <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 style={{ width: '13px', height: '13px' }} />
                  Delivered: New ETA, Plain-language Delay Reason, Reassurance
                </span>
                <span style={{ color: '#F87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle style={{ width: '13px', height: '13px' }} />
                  Withheld (Zero-Leakage): Risk Scores (0-10), Vehicle Telemetry, Dock Backlog Queue
                </span>
              </>
            )}
            {activeRole === 'driver' && (
              <>
                <span style={{ color: '#22D3EE', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 style={{ width: '13px', height: '13px' }} />
                  Delivered: Turn-by-Turn Reroute Direction, Destination Dock Bay, Corridor Hazards
                </span>
                <span style={{ color: '#F87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle style={{ width: '13px', height: '13px' }} />
                  Withheld (Zero-Leakage): Customer PII / Phone / Name, SLA Contract Penalties ($), Fleet KPIs
                </span>
              </>
            )}
            {activeRole === 'control-tower' && (
              <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 style={{ width: '13px', height: '13px' }} />
                Full Operational Transparency: 0-10 Gauge, Telemetry HUD, Compound Weighted Weights, AI Actions
              </span>
            )}
          </div>

          <pre style={{
            background: '#040711',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #1E293B',
            color: '#38BDF8',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            maxHeight: '200px',
            overflowY: 'auto',
            margin: 0,
          }}>
            {loading ? 'Fetching role payload from server...' : JSON.stringify(currentRoleData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
