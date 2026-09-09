import React from 'react';
import { Shield, Bell, RefreshCw, Activity, Compass } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, kpis, onResetDemo, onOpenNotifications, unreadCount }) {
  return (
    <header className="navbar-header" style={{ height: '64px', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #FFB500 0%, #D97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(255, 181, 0, 0.35)',
          }}>
            <Shield style={{ width: '22px', height: '22px', color: '#000000' }} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                UPS <span style={{ color: 'var(--ups-gold)' }}>RiskPilot</span>
              </span>
              <span style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(255, 181, 0, 0.12)',
                color: 'var(--ups-gold)',
                border: '1px solid rgba(255, 181, 0, 0.3)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                OPERATIONS MANAGER PORTAL
              </span>
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
              <span>MANAGER CONTROL TOWER • 545 ACTIVE SHIPMENTS</span>
            </div>
          </div>
        </div>

        {/* Center Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid #1E293B',
        }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <Activity style={{ width: '15px', height: '15px' }} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('details')}
            className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
          >
            <Compass style={{ width: '15px', height: '15px' }} />
            <span>Digital Twin (#UPS10245)</span>
          </button>
        </nav>

        {/* KPI Strip & Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          {/* Quick Fleet Counter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.9)',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid #1E293B',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
          }}>
            <span style={{ color: '#EF4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444' }}></span>
              {kpis?.critical ?? 12} Crit
            </span>
            <span style={{ color: '#475569' }}>•</span>
            <span style={{ color: '#F97316', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F97316' }}></span>
              {kpis?.high ?? 24} High
            </span>
            <span style={{ color: '#475569' }}>•</span>
            <span style={{ color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B' }}></span>
              {kpis?.medium ?? 48} Med
            </span>
            <span style={{ color: '#475569' }}>•</span>
            <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }}></span>
              {kpis?.low ?? 126} Low
            </span>
          </div>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            style={{
              position: 'relative',
              padding: '8px',
              borderRadius: '8px',
              background: '#1E293B',
              color: '#CBD5E1',
              border: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Open Dual Notification Center"
          >
            <Bell style={{ width: '16px', height: '16px' }} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#EF4444',
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Reset Demo button */}
          <button
            onClick={onResetDemo}
            className="btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
            title="Reset scenario to healthy baseline"
          >
            <RefreshCw style={{ width: '13px', height: '13px', color: 'var(--ups-gold)' }} />
            <span>Reset Demo</span>
          </button>

        </div>

      </div>
    </header>
  );
}
