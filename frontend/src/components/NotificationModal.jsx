import React, { useState } from 'react';
import { X, Smartphone, Truck, Bell, CheckCircle, Send, Clock } from 'lucide-react';

export default function NotificationModal({ isOpen, onClose, notifications = [], onTriggerManualNotif }) {
  const [activeChannel, setActiveChannel] = useState('customer');

  if (!isOpen) return null;

  const customerNotifs = notifications.filter(n => n.type === 'CUSTOMER');
  const driverNotifs = notifications.filter(n => n.type === 'DRIVER_DISPATCH');

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
        maxWidth: '680px',
        background: '#0F172A',
        border: '1px solid #334155',
        borderRadius: '1.25rem',
        padding: '1.5rem',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
        color: '#FFFFFF',
      }}>
        
        {/* Header Strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1E293B', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255, 181, 0, 0.15)', color: 'var(--ups-gold)', border: '1px solid rgba(255, 181, 0, 0.3)' }}>
              <Bell style={{ width: '20px', height: '20px' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                  Manager Dispatch & Broadcast Center
                </h2>
                <span style={{ fontSize: '0.625rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,181,0,0.15)', color: 'var(--ups-gold)', border: '1px solid rgba(255,181,0,0.3)', fontWeight: 700 }}>
                  MANAGER ONLY
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                Customer: Delay Reason & Revised Time • Driver: New Route & Reason for Route
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ padding: '6px', borderRadius: '8px', color: '#94A3B8' }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Manager Advisory Banner */}
        <div style={{
          marginTop: '0.875rem',
          padding: '8px 12px',
          borderRadius: '8px',
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid #334155',
          fontSize: '0.6875rem',
          color: 'var(--text-slate-300)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'var(--font-mono)',
        }}>
          <span>👤 Portal Operator: <strong>Operations Manager</strong></span>
          <span style={{ color: 'var(--ups-gold)' }}>Targeted Dual Broadcasting Active</span>
        </div>

        {/* Channel Switcher Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '0.875rem', marginBottom: '1rem' }}>
          <button
            onClick={() => setActiveChannel('customer')}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: activeChannel === 'customer' ? 'var(--ups-gold)' : '#0F172A',
              color: activeChannel === 'customer' ? '#000000' : 'var(--text-slate-400)',
              border: activeChannel === 'customer' ? '1px solid var(--ups-gold)' : '1px solid #1E293B',
              boxShadow: activeChannel === 'customer' ? '0 0 16px var(--ups-gold-glow)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Smartphone style={{ width: '16px', height: '16px' }} />
            <span>📱 Customer Alerts ({customerNotifs.length})</span>
          </button>

          <button
            onClick={() => setActiveChannel('driver')}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: activeChannel === 'driver' ? 'var(--ups-gold)' : '#0F172A',
              color: activeChannel === 'driver' ? '#000000' : 'var(--text-slate-400)',
              border: activeChannel === 'driver' ? '1px solid var(--ups-gold)' : '1px solid #1E293B',
              boxShadow: activeChannel === 'driver' ? '0 0 16px var(--ups-gold-glow)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Truck style={{ width: '16px', height: '16px' }} />
            <span>🚚 Driver Dispatch ({driverNotifs.length})</span>
          </button>
        </div>

        {/* Content Box */}
        <div style={{ minHeight: '240px', maxHeight: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
          
          {/* Customer Tab */}
          {activeChannel === 'customer' && (
            customerNotifs.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', background: '#09101E', borderRadius: '12px', border: '1px solid #1E293B', color: 'var(--text-slate-400)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                No customer alerts dispatched yet. Automatic trigger when SLA breach probability &gt; 70% or manual broadcast by Manager.
              </div>
            ) : (
              customerNotifs.map((n) => (
                <div key={n.id} style={{ padding: '14px', borderRadius: '12px', background: '#09101E', border: '1px solid #1E293B' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-slate-400)', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--ups-gold)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Smartphone style={{ width: '13px', height: '13px' }} />
                      CUSTOMER SMS & APP NOTIFICATION
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock style={{ width: '12px', height: '12px' }} />
                      {new Date(n.sent_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-slate-200)', lineHeight: 1.6, whiteSpace: 'pre-line', fontFamily: 'var(--font-mono)', background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: '8px', border: '1px solid #1E293B' }}>
                    {n.message}
                  </div>
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: '#64748B' }}>Payload: Reason for Delay + New Delivery Time</span>
                    <span style={{ color: '#10B981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle style={{ width: '12px', height: '12px' }} />
                      {n.status}
                    </span>
                  </div>
                </div>
              ))
            )
          )}

          {/* Fleet Driver Tab */}
          {activeChannel === 'driver' && (
            driverNotifs.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', background: '#09101E', borderRadius: '12px', border: '1px solid #1E293B', color: 'var(--text-slate-400)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                No fleet dispatch orders recorded. Dispatched automatically when an operational reroute is confirmed by Manager.
              </div>
            ) : (
              driverNotifs.map((n) => (
                <div key={n.id} style={{ padding: '14px', borderRadius: '12px', background: '#09101E', border: '1px solid rgba(34, 211, 238, 0.4)', fontFamily: 'var(--font-mono)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#22D3EE', fontWeight: 800, marginBottom: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Truck style={{ width: '14px', height: '14px' }} />
                      DRIVER IN-CAB TELEMATICS DISPATCH
                    </span>
                    <span>{new Date(n.sent_at).toLocaleTimeString()}</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#E2E8F0', lineHeight: 1.6, whiteSpace: 'pre-line', background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(34, 211, 238, 0.2)' }}>
                    {n.message}
                  </div>
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem' }}>
                    <span style={{ color: '#64748B' }}>Payload: New Route + Reason for New Route</span>
                    <span style={{ color: '#22D3EE', fontWeight: 800 }}>
                      {n.status} & ACKNOWLEDGED
                    </span>
                  </div>
                </div>
              ))
            )
          )}

        </div>

        {/* Footer Actions */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={onTriggerManualNotif}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ups-gold)' }}
          >
            <Send style={{ width: '13px', height: '13px' }} />
            <span>Manager Broadcast: Proactive Dual Alerts</span>
          </button>

          <button
            onClick={onClose}
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: '12px' }}
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
