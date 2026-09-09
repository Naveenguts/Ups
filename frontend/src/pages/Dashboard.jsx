import React, { useState } from 'react';
import {
  MapPin,
  ArrowRight,
  Search,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';

export default function Dashboard({ shipments = [], kpis, onSelectShipment }) {
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredShipments = shipments.filter((s) => {
    const matchesFilter = filter === 'ALL' || s.risk_tier === filter;
    const matchesSearch =
      s.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.destination.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const fleetChartData = [
    { name: 'Critical (8-10)', count: kpis?.critical ?? 12, fill: '#EF4444' },
    { name: 'High (6-8)', count: kpis?.high ?? 24, fill: '#F97316' },
    { name: 'Medium (3-6)', count: kpis?.medium ?? 48, fill: '#F59E0B' },
    { name: 'Low (0-3)', count: kpis?.low ?? 126, fill: '#10B981' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Top Value Banner */}
      <div className="glass-panel" style={{
        padding: '1.75rem 2rem',
        borderRadius: '1.25rem',
        border: '1px solid rgba(255, 181, 0, 0.25)',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.7) 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '100%', background: 'radial-gradient(circle at right, rgba(255,181,0,0.08), transparent 70%)', pointerEvents: 'none' }}></div>
        <div style={{ maxWidth: '800px', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 10px',
            borderRadius: '9999px',
            background: 'rgba(255, 181, 0, 0.12)',
            border: '1px solid rgba(255, 181, 0, 0.3)',
            color: 'var(--ups-gold)',
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            marginBottom: '0.75rem',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ups-gold)', display: 'inline-block' }}></span>
            <span>PRESCRIPTIVE LOGISTICS INTELLIGENCE</span>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
            Prevent SLA Breaches <span style={{ color: 'var(--ups-gold)' }}>Before They Happen</span>
          </h1>
          <p style={{ color: 'var(--text-slate-300)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            Continuously ingesting weather radars, road traffic sensors, port congestion telemetry, and historical transit volatility
            to predict delivery failure risks early, explain root causes, and prescribe actionable interventions.
          </p>
        </div>
      </div>

      {/* KPI 4-Card Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
      }}>
        
        {/* Critical */}
        <div
          onClick={() => setFilter('CRITICAL')}
          className="glass-panel"
          style={{
            padding: '1.25rem',
            cursor: 'pointer',
            border: filter === 'CRITICAL' ? '1px solid #EF4444' : '1px solid #1E293B',
            boxShadow: filter === 'CRITICAL' ? '0 0 20px rgba(239,68,68,0.25)' : 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ color: '#EF4444', fontWeight: 800, fontSize: '0.75rem', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', display: 'inline-block' }}></span>
              CRITICAL RISK
            </span>
            <span style={{ fontSize: '0.625rem', background: 'rgba(239,68,68,0.15)', color: '#EF4444', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
              Score ≥ 8.0
            </span>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#FFFFFF', fontFamily: 'var(--font-heading)' }}>
            {kpis?.critical ?? 12}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-slate-400)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            Immediate operational reroute required
          </div>
        </div>

        {/* High */}
        <div
          onClick={() => setFilter('HIGH')}
          className="glass-panel"
          style={{
            padding: '1.25rem',
            cursor: 'pointer',
            border: filter === 'HIGH' ? '1px solid #F97316' : '1px solid #1E293B',
            boxShadow: filter === 'HIGH' ? '0 0 20px rgba(249,115,22,0.25)' : 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ color: '#F97316', fontWeight: 800, fontSize: '0.75rem', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F97316', display: 'inline-block' }}></span>
              HIGH RISK
            </span>
            <span style={{ fontSize: '0.625rem', background: 'rgba(249,115,22,0.15)', color: '#F97316', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
              Score 6-8
            </span>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#FFFFFF', fontFamily: 'var(--font-heading)' }}>
            {kpis?.high ?? 24}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-slate-400)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            Delivery buffer rapidly eroding
          </div>
        </div>

        {/* Medium */}
        <div
          onClick={() => setFilter('MEDIUM')}
          className="glass-panel"
          style={{
            padding: '1.25rem',
            cursor: 'pointer',
            border: filter === 'MEDIUM' ? '1px solid #F59E0B' : '1px solid #1E293B',
            boxShadow: filter === 'MEDIUM' ? '0 0 20px rgba(245,158,11,0.25)' : 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ color: '#F59E0B', fontWeight: 800, fontSize: '0.75rem', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }}></span>
              MEDIUM RISK
            </span>
            <span style={{ fontSize: '0.625rem', background: 'rgba(245,158,11,0.15)', color: '#F59E0B', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
              Score 3-6
            </span>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#FFFFFF', fontFamily: 'var(--font-heading)' }}>
            {kpis?.medium ?? 48}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-slate-400)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            Telemetry variance monitored
          </div>
        </div>

        {/* Low / Healthy */}
        <div
          onClick={() => setFilter('LOW')}
          className="glass-panel"
          style={{
            padding: '1.25rem',
            cursor: 'pointer',
            border: filter === 'LOW' ? '1px solid #10B981' : '1px solid #1E293B',
            boxShadow: filter === 'LOW' ? '0 0 20px rgba(16,185,129,0.25)' : 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ color: '#10B981', fontWeight: 800, fontSize: '0.75rem', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
              HEALTHY / ON TIME
            </span>
            <span style={{ fontSize: '0.625rem', background: 'rgba(16,185,129,0.15)', color: '#10B981', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
              Score &lt; 3.0
            </span>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#FFFFFF', fontFamily: 'var(--font-heading)' }}>
            {kpis?.low ?? 126}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-slate-400)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            Operating within target SLA buffer
          </div>
        </div>

      </div>

      {/* Fleet Distribution Chart & Flagship Showcase */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
      }}>
        
        {/* Fleet Distribution Recharts Card */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Fleet Analytics</span>
              <h3 style={{ fontSize: '1.125rem', color: '#FFFFFF', marginTop: '2px' }}>Active Risk Tier Distribution</h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)' }}>
              Total Monitored: {kpis?.total_active ?? 210}
            </span>
          </div>

          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fleetChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div style={{ background: '#0F172A', border: '1px solid #334155', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                          <p style={{ color: '#FFFFFF', fontWeight: 700 }}>{data.name}</p>
                          <p style={{ color: 'var(--ups-gold)', fontWeight: 800 }}>{data.count} Shipments</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {fleetChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Flagship Demo Hero Showcase */}
        <div className="glass-panel" style={{
          padding: '1.5rem',
          border: '1px solid rgba(255, 181, 0, 0.35)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.8) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--ups-gold)', fontWeight: 800, fontSize: '0.75rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                ⭐ Flagship Presentation Shipment
              </span>
              <span style={{ fontSize: '0.6875rem', background: 'rgba(255, 181, 0, 0.2)', color: 'var(--ups-gold)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                Interactive Twin
              </span>
            </div>

            <h3 style={{ fontSize: '1.35rem', color: '#FFFFFF', marginBottom: '0.5rem' }}>
              #UPS10245 — Chennai → Bangalore
            </h3>

            <p style={{ color: 'var(--text-slate-300)', fontSize: '0.8125rem', lineHeight: 1.6 }}>
              Configured with real-time external disruption injection (radar weather cells, NH-48 bottlenecks, and destination terminal dock congestion) for the 2-minute judge pitch.
            </p>
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #1E293B' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-slate-400)' }}>Corridor:</span>
              <span style={{ color: '#FFFFFF', fontWeight: 600 }}>NH-48 via Vellore Hub</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-slate-400)' }}>Target SLA:</span>
              <span style={{ color: 'var(--ups-gold)', fontWeight: 700 }}>20:00 IST Today</span>
            </div>

            <button
              onClick={() => onSelectShipment(1)}
              className="btn-primary"
              style={{ width: '100%', padding: '10px 16px' }}
            >
              <span>Launch Live Digital Twin</span>
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>

      </div>

      {/* High Risk Shipments Fleet Table */}
      <div className="glass-panel" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
        
        {/* Table Header Controls */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #1E293B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '1.125rem', color: '#FFFFFF' }}>Active Shipment Fleet</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)' }}>
              ({filteredShipments.length} matching)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search Box */}
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search style={{ width: '14px', height: '14px', position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <input
                type="text"
                placeholder="Search shipment / city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '6px 12px 6px 32px',
                  color: '#FFFFFF',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>

            {/* Filter Buttons */}
            <div style={{ display: 'flex', background: '#0F172A', padding: '3px', borderRadius: '8px', border: '1px solid #1E293B', gap: '2px' }}>
              {['ALL', 'CRITICAL', 'HIGH', 'LOW'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.6875rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: filter === t ? 800 : 500,
                    background: filter === t ? 'var(--ups-gold)' : 'transparent',
                    color: filter === t ? '#000000' : 'var(--text-slate-400)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Tracking Number</th>
                <th>Corridor (Origin → Dest)</th>
                <th>Current Hub</th>
                <th>Risk Score</th>
                <th>SLA Breach Prob</th>
                <th>Est. Delay</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.map((s) => {
                const isCrit = s.latest_risk_score >= 8.0;
                const isHigh = s.latest_risk_score >= 6.0;
                const isMed = s.latest_risk_score >= 3.0;

                const badgeClass = isCrit ? 'badge-critical' : isHigh ? 'badge-high' : isMed ? 'badge-medium' : 'badge-low';

                return (
                  <tr
                    key={s.id}
                    onClick={() => onSelectShipment(s.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ color: 'var(--ups-gold)' }}>#{s.tracking_number}</span>
                      {s.tracking_number === 'UPS10245' && (
                        <span style={{ marginLeft: '6px', padding: '1px 5px', borderRadius: '3px', background: 'var(--ups-gold)', color: '#000000', fontSize: '9px', fontWeight: 900 }}>
                          DEMO
                        </span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-slate-200)' }}>
                      {s.origin} → <strong>{s.destination}</strong>
                    </td>
                    <td style={{ color: 'var(--text-slate-400)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin style={{ width: '13px', height: '13px', color: 'var(--ups-gold)' }} />
                        {s.current_location}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${badgeClass}`}>
                        {s.latest_risk_score.toFixed(1)} / 10
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '60px', height: '6px', background: '#1E293B', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${s.latest_sla_probability}%`,
                            height: '100%',
                            background: isCrit ? '#EF4444' : isHigh ? '#F97316' : isMed ? '#F59E0B' : '#10B981',
                            borderRadius: '9999px',
                          }}></div>
                        </div>
                        <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{s.latest_sla_probability.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-slate-300)', fontFamily: 'var(--font-mono)' }}>
                      +{s.latest_estimated_delay.toFixed(1)} hrs
                    </td>
                    <td>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#1E293B', color: 'var(--text-slate-300)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }}>
                        Inspect →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
