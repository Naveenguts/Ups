import React from 'react';
import { Package, Clock, MapPin, CheckCircle, AlertTriangle, ShieldCheck, ArrowRight, BellRing } from 'lucide-react';

export default function CustomerView({ data, loading }) {
  if (loading) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)' }}>
        Fetching secure customer tracking updates...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-slate-400)' }}>
        No shipment tracking details available.
      </div>
    );
  }

  const isDelayed = data.is_delayed;
  const isRerouted = data.delivery_status?.includes('Rerouted');

  return (
    <div style={{
      maxWidth: '820px',
      margin: '1.5rem auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      animation: 'fadeIn 0.3s ease-out',
      padding: '0 1rem',
    }}>
      
      {/* Top Welcome Header */}
      <div className="glass-panel" style={{
        padding: '1.5rem 1.75rem',
        borderRadius: '1.25rem',
        border: '1px solid rgba(255, 181, 0, 0.25)',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.7) 100%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #FFB500 0%, #D97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(255, 181, 0, 0.35)',
          }}>
            <Package style={{ width: '24px', height: '24px', color: '#000000' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 900, color: '#FFFFFF' }}>
                UPS Worldwide Express
              </h1>
              <span style={{
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(255, 181, 0, 0.15)',
                color: 'var(--ups-gold)',
                border: '1px solid rgba(255, 181, 0, 0.3)',
              }}>
                CUSTOMER PORTAL
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              Tracking #{data.tracking_number} • Direct Recipient View
            </p>
          </div>
        </div>

        {/* Live Delivery Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '9999px',
          background: isRerouted
            ? 'rgba(16, 185, 129, 0.15)'
            : isDelayed
            ? 'rgba(245, 158, 11, 0.15)'
            : 'rgba(16, 185, 129, 0.15)',
          border: isRerouted
            ? '1px solid #10B981'
            : isDelayed
            ? '1px solid #F59E0B'
            : '1px solid #10B981',
          color: isRerouted
            ? '#10B981'
            : isDelayed
            ? '#F59E0B'
            : '#10B981',
          fontWeight: 800,
          fontSize: '0.8125rem',
        }}>
          {isDelayed ? (
            <AlertTriangle style={{ width: '16px', height: '16px' }} />
          ) : (
            <CheckCircle style={{ width: '16px', height: '16px' }} />
          )}
          <span>{data.delivery_status}</span>
        </div>
      </div>

      {/* Main Delivery ETA Showcase Card */}
      <div className="glass-panel" style={{
        padding: '2rem',
        borderRadius: '1.25rem',
        border: '1px solid #1E293B',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '250px', height: '100%', background: 'radial-gradient(circle at right, rgba(255,181,0,0.06), transparent 70%)', pointerEvents: 'none' }}></div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--ups-gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              REVISED ESTIMATED DELIVERY
            </span>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFFFFF', marginTop: '4px', letterSpacing: '-0.025em' }}>
              {data.new_eta}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-slate-400)', fontSize: '0.8125rem', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
              <MapPin style={{ width: '14px', height: '14px', color: 'var(--ups-gold)' }} />
              <span>Current Checkpoint: <strong style={{ color: '#FFFFFF' }}>{data.last_checkpoint}</strong></span>
            </div>
          </div>

          <div style={{
            background: '#09101E',
            border: '1px solid #1E293B',
            borderRadius: '12px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <BellRing style={{ width: '20px', height: '20px', color: 'var(--ups-gold)' }} />
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFFFFF' }}>
                Proactive Notifications Active
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)' }}>
                SMS & Email updates automatically synced
              </div>
            </div>
          </div>
        </div>

        {/* Plain-Language Delay Explanation & Reassurance */}
        {isDelayed && (
          <div style={{
            marginTop: '1.75rem',
            padding: '1.25rem',
            borderRadius: '1rem',
            background: isRerouted ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            border: isRerouted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Clock style={{ width: '16px', height: '16px', color: isRerouted ? '#10B981' : '#F59E0B' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#FFFFFF' }}>
                {isRerouted ? 'Expedited Reroute in Progress' : 'Why Your Delivery Time Changed'}
              </span>
            </div>
            
            {data.delay_reason && (
              <p style={{ fontSize: '0.875rem', color: isRerouted ? '#6EE7B7' : '#FDE68A', lineHeight: 1.6, fontWeight: 600 }}>
                • {data.delay_reason}
              </p>
            )}

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-slate-300)', marginTop: '8px', lineHeight: 1.5 }}>
              {data.reassurance_message}
            </p>
          </div>
        )}

        {/* Transit Timeline */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #1E293B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-slate-400)' }}>
            <span>ORIGIN: <strong>{data.origin}</strong></span>
            <span>DESTINATION: <strong>{data.destination}</strong></span>
          </div>

          <div style={{ position: 'relative', height: '8px', background: '#1E293B', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: isRerouted ? '78%' : '52%',
              background: 'linear-gradient(90deg, #FFB500 0%, #10B981 100%)',
              borderRadius: '4px',
              transition: 'width 0.5s ease',
            }}></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-slate-400)' }}>
            <span style={{ color: '#10B981', fontWeight: 700 }}>✓ Picked Up in {data.origin}</span>
            <span style={{ color: 'var(--ups-gold)', fontWeight: 800 }}>● Active in {data.last_checkpoint}</span>
            <span>Final Delivery in {data.destination}</span>
          </div>
        </div>

      </div>

      {/* Security & Data Separation Callout (Hackathon Defense Box) */}
      <div style={{
        padding: '1rem 1.25rem',
        borderRadius: '1rem',
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <ShieldCheck style={{ width: '24px', height: '24px', color: '#10B981', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#FFFFFF' }}>
            Privacy & Non-Panic Data Boundary
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-slate-300)', marginTop: '2px', lineHeight: 1.5 }}>
            {data.role_audit}
          </div>
        </div>
      </div>

    </div>
  );
}
