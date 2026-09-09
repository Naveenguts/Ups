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
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                Dual Notification & Dispatch Center
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)' }}>
                Synchronized Communication for Customer & Fleet Driver
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

        {/* Channel Switcher Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', marginBottom: '1.25rem' }}>
          <button
            onClick={() => setActiveChannel('customer')}
            style={{
              flex: 1,
              padding: '10px 16px',
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
              padding: '10px 16px',
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
            <span>🚚 Fleet Driver Dispatch ({driverNotifs.length})</span>
          </button>
        </div>

        {/* Content Box */}
        <div style={{ minHeight: '240px', maxHeight: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
          
          {/* Customer Tab */}
          {activeChannel === 'customer' && (
            customerNotifs.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', background: '#09101E', borderRadius: '12px', border: '1px solid #1E293B', color: 'var(--text-slate-400)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                No customer alerts dispatched yet. Automatic trigger when SLA breach probability &gt; 70%.
              </div>
            ) : (
              customerNotifs.map((n) => (
                <div key={n.id} style={{ padding: '14px', borderRadius: '12px', background: '#09101E', border: '1px solid #1E293B' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-slate-400)', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--ups-gold)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Smartphone style={{ width: '13px', height: '13px' }} />
                      SMS & Email Broadcast
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock style={{ width: '12px', height: '12px' }} />
                      {new Date(n.sent_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-slate-200)', lineHeight: 1.5 }}>
                    {n.message}
                  </p>
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: '#64748B' }}>Channel: Multi-modal push</span>
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
                No fleet dispatch orders recorded. Dispatched automatically when an operational reroute is confirmed.
              </div>
            ) : (
              driverNotifs.map((n) => (
                <div key={n.id} style={{ padding: '14px', borderRadius: '12px', background: '#09101E', border: '1px solid rgba(34, 211, 238, 0.4)', fontFamily: 'var(--font-mono)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#22D3EE', fontWeight: 800, marginBottom: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Truck style={{ width: '14px', height: '14px' }} />
                      IN-CAB TELEMATICS DISPATCH ORDER
                    </span>
                    <span>{new Date(n.sent_at).toLocaleTimeString()}</span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#E2E8F0', lineHeight: 1.5 }}>
                    {n.message}
                  </p>
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem' }}>
                    <span style={{ color: '#64748B' }}>Terminal: UPS TRK-8821 HUD</span>
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
            <span>Broadcast Test Alert</span>
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
