import React from 'react';
import { Truck, Navigation, AlertTriangle, Warehouse, Gauge, ShieldCheck, MapPin, Radio, Compass } from 'lucide-react';

export default function DriverView({ data, loading }) {
  if (loading) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center', color: '#22D3EE', fontFamily: 'var(--font-mono)' }}>
        Linking to in-cab telematics navigation terminal...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-slate-400)' }}>
        No driver telematics data available.
      </div>
    );
  }

  const isRerouted = data.route_status === 'TACTICAL_REROUTE_ASSIGNED';
  const isPending = data.route_status === 'REROUTE_ADVISORY_PENDING';

  return (
    <div style={{
      maxWidth: '920px',
      margin: '1.5rem auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      animation: 'fadeIn 0.3s ease-out',
      padding: '0 1rem',
    }}>
      
      {/* Top Rugged In-Cab Terminal Header */}
      <div style={{
        background: '#040711',
        border: '2px solid #334155',
        borderRadius: '1rem',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            background: '#0F172A',
            border: '2px solid #22D3EE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#22D3EE',
            boxShadow: '0 0 15px rgba(34, 211, 238, 0.3)',
          }}>
            <Truck style={{ width: '26px', height: '26px' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.02em' }}>
                {data.truck_id}
              </span>
              <span style={{
                fontSize: '0.625rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                background: '#22D3EE',
                color: '#000000',
              }}>
                IN-CAB HUD
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              Driver: <strong style={{ color: '#E2E8F0' }}>{data.driver_name}</strong> • Manifest #{data.tracking_number}
            </div>
          </div>
        </div>

        {/* Telematics Signal Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <Radio style={{ width: '13px', height: '13px' }} />
            <span>GPS LINK: ONLINE</span>
          </div>
          <span style={{ color: '#64748B' }}>•</span>
          <span style={{ color: '#94A3B8' }}>{data.dispatched_at}</span>
        </div>
      </div>

      {/* Main Reroute Action Directive Box */}
      <div style={{
        background: isRerouted
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)'
          : isPending
          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: isRerouted ? '2px solid #10B981' : isPending ? '2px solid #F59E0B' : '2px solid #22D3EE',
        borderRadius: '1.25rem',
        padding: '2rem',
        position: 'relative',
        boxShadow: isRerouted ? '0 0 30px rgba(16, 185, 129, 0.25)' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '8px',
            background: isRerouted ? '#10B981' : isPending ? '#F59E0B' : '#22D3EE',
            color: '#000000',
            fontWeight: 900,
            fontSize: '0.8125rem',
            fontFamily: 'var(--font-mono)',
          }}>
            <Navigation style={{ width: '16px', height: '16px' }} />
            <span>
              {isRerouted
                ? '⚡ TACTICAL REROUTE ORDER CONFIRMED'
                : isPending
                ? '⚠️ PREPARE FOR DIVERSION — ADVISORY'
                : '✓ MAINTAIN STANDARD CORRIDOR'}
            </span>
          </div>

          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#94A3B8' }}>
            Current Location: <strong style={{ color: '#FFFFFF' }}>{data.current_corridor}</strong>
          </span>
        </div>

        {/* Turn-by-Turn Reroute Instruction (Large Driving Font) */}
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 900,
          color: '#FFFFFF',
          lineHeight: 1.4,
          fontFamily: 'var(--font-heading)',
          letterSpacing: '-0.01em',
          background: 'rgba(0,0,0,0.5)',
          padding: '1.25rem 1.5rem',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          {data.reroute_instruction || 'Continue on current navigation path.'}
        </div>

        {/* Assigned Destination Facility & Bay */}
        <div style={{
          marginTop: '1.5rem',
          background: '#09101E',
          border: '1px solid #1E293B',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{
            padding: '10px',
            borderRadius: '10px',
            background: 'rgba(34, 211, 238, 0.15)',
            color: '#22D3EE',
            border: '1px solid rgba(34, 211, 238, 0.3)',
          }}>
            <Warehouse style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ASSIGNED TERMINAL & UNLOADING BAY
            </span>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
              {data.assigned_destination}
            </div>
          </div>
        </div>

      </div>

      {/* Route Hazard Advisory Card */}
      <div style={{
        background: '#0B0F19',
        border: '1px solid rgba(239, 68, 68, 0.5)',
        borderRadius: '1rem',
        padding: '1.25rem 1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', fontWeight: 800, fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
          <AlertTriangle style={{ width: '16px', height: '16px' }} />
          <span>ROUTE SAFETY & HAZARD ADVISORY</span>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#FCA5A5', lineHeight: 1.6, fontWeight: 600 }}>
          {data.route_hazard_warning}
        </p>
      </div>

      {/* In-Cab Driving Gauges Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
      }}>
        <div style={{ background: '#09101E', border: '1px solid #1E293B', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-slate-400)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Gauge style={{ width: '13px', height: '13px', color: '#22D3EE' }} />
            <span>SPEED ADVISORY</span>
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>
            {data.speed_limit_advisory}
          </div>
        </div>

        <div style={{ background: '#09101E', border: '1px solid #1E293B', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-slate-400)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Compass style={{ width: '13px', height: '13px', color: '#10B981' }} />
            <span>DISTANCE TO DOCK</span>
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#10B981', marginTop: '4px' }}>
            {data.distance_remaining_km} km
          </div>
        </div>
      </div>

      {/* Security & Regulatory Defense Callout (Hackathon Defense Box) */}
      <div style={{
        padding: '1rem 1.25rem',
        borderRadius: '1rem',
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <ShieldCheck style={{ width: '24px', height: '24px', color: '#22D3EE', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#FFFFFF' }}>
            Driver Safety & Privacy Barrier
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-slate-300)', marginTop: '2px', lineHeight: 1.5 }}>
            {data.role_audit}
          </div>
        </div>
      </div>

    </div>
  );
}
