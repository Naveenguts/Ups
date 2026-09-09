import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  CloudRain,
  Car,
  Warehouse,
  Sparkles,
  Navigation,
  Smartphone,
  ShieldCheck,
  AlertOctagon,
  ArrowLeft,
  Zap,
  Leaf,
  Calculator,
} from 'lucide-react';
import RiskGauge from '../components/RiskGauge';
import RouteMap from '../components/RouteMap';
import RiskHistoryChart from '../components/RiskHistoryChart';
import FactorBreakdown from '../components/FactorBreakdown';
import SavingsCalculationModal from '../components/SavingsCalculationModal';

export default function ShipmentDetail({
  shipment,
  onBack,
  onSimulateEvent,
  onSyncWeather,
  onSyncTraffic,
  onExplainAI,
  onApplyAction,
  onOpenNotifications,
}) {
  const [loadingAI, setLoadingAI] = useState(false);
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);

  if (!shipment) return null;

  const score = shipment.latest_risk_score ?? 2.8;
  const slaProb = shipment.latest_sla_probability ?? 12.0;
  const delay = shipment.latest_estimated_delay ?? 0.6;
  const isCritical = score >= 8.0;

  const activeRoute =
    shipment.status === 'REROUTED_C' ? 'route_c' :
    shipment.status === 'REROUTED_D' ? 'route_d' :
    (shipment.status === 'REROUTED' || shipment.status === 'REROUTED_B') ? 'route_b' :
    'default';
  const isRerouted = activeRoute !== 'default';

  const handleRouteSelect = (routeId) => {
    if (activeRoute === routeId) {
      // User clicked the ALREADY ACTIVE route -> Toggle back to Default Route A!
      onApplyAction({
        action: 'Revert to Default Route A (NH-48 Corridor)',
        route_id: 'default',
        description: 'Vehicle returned to primary highway corridor schedule via NH-48.',
        expected_delay_reduction: 0,
        expected_risk_reduction: 0,
      });
      return;
    }

    if (routeId === 'default') {
      onApplyAction({
        action: 'Revert to Default Route A (NH-48 Corridor)',
        route_id: 'default',
        description: 'Vehicle returned to primary highway corridor schedule via NH-48.',
        expected_delay_reduction: 0,
        expected_risk_reduction: 0,
      });
    } else if (routeId === 'route_b') {
      onApplyAction({
        action: 'Reroute through Route B (NH-75 Chittoor Bypass)',
        route_id: 'route_b',
        description: 'Divert vehicle at Vellore junction via Highway NH-75. Bypasses the flooded corridor and dock queue.',
        expected_delay_reduction: 4.5,
        expected_risk_reduction: 4.1,
      });
    } else if (routeId === 'route_c') {
      onApplyAction({
        action: 'Reroute through Route C (NH-44 Southern 6-Lane Expressway)',
        route_id: 'route_c',
        description: 'High-speed southern diversion via Harur & Krishnagiri NH-44. Completely clear of storm cells, 80 km/h cruising.',
        expected_delay_reduction: 4.8,
        expected_risk_reduction: 5.2,
      });
    } else if (routeId === 'route_d') {
      onApplyAction({
        action: 'Reroute through Route D (NH-69 Green Freight Fast-Track)',
        route_id: 'route_d',
        description: 'Dedicated priority logistics corridor via Tirupati and Chintamani bypass into Bangalore North.',
        expected_delay_reduction: 5.2,
        expected_risk_reduction: 5.8,
      });
    }
  };

  const handleTriggerAIExplain = async () => {
    setLoadingAI(true);
    try {
      await onExplainAI();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease-out', paddingBottom: '3rem' }}>
      
      {/* Top Breadcrumb & Status Strip */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid #1E293B',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onBack}
            className="btn-secondary"
            style={{ padding: '8px', borderRadius: '10px' }}
            title="Back to fleet dashboard"
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                Shipment #{shipment.tracking_number}
              </h1>
              <span style={{
                fontSize: '0.625rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                fontFamily: 'var(--font-mono)',
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(255, 181, 0, 0.15)',
                color: 'var(--ups-gold)',
                border: '1px solid rgba(255, 181, 0, 0.3)',
              }}>
                MANAGER DIGITAL TWIN
              </span>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
              <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{shipment.origin}</span>
              <span>→</span>
              <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{shipment.destination}</span>
              <span style={{ color: '#475569' }}>•</span>
              <MapPin style={{ width: '13px', height: '13px', color: 'var(--ups-gold)' }} />
              <span>Location: <strong style={{ color: 'var(--ups-gold)' }}>{shipment.current_location}</strong></span>
            </div>
          </div>
        </div>

        {/* Schedule Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
          <div style={{ background: '#0F172A', padding: '6px 12px', borderRadius: '10px', border: '1px solid #1E293B' }}>
            <span style={{ color: 'var(--text-slate-400)', fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>Target SLA</span>
            <span style={{ color: '#10B981', fontWeight: 800 }}>
              {new Date(shipment.sla_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
            </span>
          </div>

          <div style={{ background: '#0F172A', padding: '6px 12px', borderRadius: '10px', border: '1px solid #1E293B' }}>
            <span style={{ color: 'var(--text-slate-400)', fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>Estimated ETA</span>
            <span style={{ color: delay > 3 ? '#EF4444' : 'var(--text-slate-200)', fontWeight: 800 }}>
              {new Date(shipment.expected_delivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
            </span>
          </div>
        </div>
      </div>

      {/* DISRUPTION SIMULATION & ACTION TOOLBAR */}
      <div className="glass-panel" style={{
        padding: '1rem 1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--ups-gold)', textTransform: 'uppercase' }}>
            MANAGER CONTROLS (INJECT DISRUPTION):
          </span>
        </div>

        {/* Signal Trigger Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          
          <button
            onClick={() => onSimulateEvent(shipment.id, 'WEATHER', 9, 'Heavy rainfall and flash flooding detected near Vellore corridor')}
            className="btn-secondary"
            style={{ fontSize: '11px', padding: '6px 10px' }}
          >
            <CloudRain style={{ width: '13px', height: '13px', color: '#60A5FA' }} />
            <span>🌧 Simulate Rain (9/10)</span>
          </button>

          <button
            onClick={() => onSimulateEvent(shipment.id, 'TRAFFIC', 9, 'Highway NH-48 gridlock at Ambur junction - velocity 18 km/h')}
            className="btn-secondary"
            style={{ fontSize: '11px', padding: '6px 10px' }}
          >
            <Car style={{ width: '13px', height: '13px', color: '#FB923C' }} />
            <span>🚗 Simulate Traffic (9/10)</span>
          </button>

          <button
            onClick={() => onSimulateEvent(shipment.id, 'HUB_DELAY', 10, 'Bangalore Hub dock congestion - 4 hour inbound terminal backlog')}
            className="btn-secondary"
            style={{ fontSize: '11px', padding: '6px 10px' }}
          >
            <Warehouse style={{ width: '13px', height: '13px', color: '#F87171' }} />
            <span>🏭 Hub Delay (10/10)</span>
          </button>

          <div style={{ width: '1px', height: '20px', background: '#334155' }}></div>

          {/* Sync Live OpenWeather Satellite Radar */}
          {onSyncWeather && (
            <button
              onClick={onSyncWeather}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38BDF8',
                fontSize: '11px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
              title="Query OpenWeatherMap live satellite radar for this shipment's corridor"
            >
              <CloudRain style={{ width: '13px', height: '13px' }} />
              <span>🛰️ Sync OpenWeather</span>
            </button>
          )}

          {/* Sync Live TomTom Traffic Flow */}
          {onSyncTraffic && (
            <button
              onClick={onSyncTraffic}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(251, 146, 60, 0.12)',
                border: '1px solid rgba(251, 146, 60, 0.4)',
                color: '#FB923C',
                fontSize: '11px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
              title="Query TomTom GPS live real-time traffic flow for this shipment's corridor"
            >
              <Car style={{ width: '13px', height: '13px' }} />
              <span>🚗 Sync TomTom Traffic</span>
            </button>
          )}

          {/* AI Decision Buttons */}
          <button
            onClick={handleTriggerAIExplain}
            disabled={loadingAI}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 181, 0, 0.12)',
              border: '1px solid rgba(255, 181, 0, 0.4)',
              color: 'var(--ups-gold)',
              fontSize: '11px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles style={{ width: '13px', height: '13px' }} />
            <span>{loadingAI ? 'Analyzing...' : 'Explain Risk & Recommend'}</span>
          </button>

        </div>

        {/* Multi-Route Corridor Selection & Toggle Bar */}
        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid #1E293B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              color: 'var(--ups-gold)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <Navigation style={{ width: '13px', height: '13px' }} />
              <span>DISPATCH CORRIDOR ROUTING:</span>
            </span>

            {/* Route A (Default) Button */}
            <button
              onClick={() => handleRouteSelect('default')}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                background: activeRoute === 'default' ? 'rgba(255, 181, 0, 0.2)' : 'rgba(15, 23, 42, 0.7)',
                color: activeRoute === 'default' ? 'var(--ups-gold)' : 'var(--text-slate-400)',
                border: activeRoute === 'default' ? '1px solid var(--ups-gold)' : '1px solid #334155',
              }}
              title="Primary highway corridor via NH-48 (Baseline)"
            >
              <span>{activeRoute === 'default' ? '● ' : '○ '}Route A (Default NH-48)</span>
              <span style={{ fontSize: '10px', color: 'var(--text-slate-400)', borderLeft: '1px solid #334155', paddingLeft: '6px' }}>
                Baseline (0h / $0)
              </span>
            </button>

            {/* Route B Button */}
            <button
              onClick={() => handleRouteSelect('route_b')}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                background: activeRoute === 'route_b' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(15, 23, 42, 0.7)',
                color: activeRoute === 'route_b' ? '#10B981' : 'var(--text-slate-300)',
                border: activeRoute === 'route_b' ? '1px solid #10B981' : '1px solid #334155',
              }}
              title="Northern expressway via NH-75 Chittoor bypass (Save 4.9h / $4,250 • Click again to revert to default)"
            >
              <span>{activeRoute === 'route_b' ? '● ' : '○ '}🟢 Route B (NH-75 Plateau)</span>
              <span style={{ fontSize: '10px', color: '#10B981', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                ⏱️ +4.9h | 💰 $4,250
              </span>
              {activeRoute === 'route_b' && (
                <span style={{ fontSize: '9px', background: '#10B981', color: '#000', padding: '2px 5px', borderRadius: '4px', fontWeight: 900 }}>
                  ACTIVE (Click to reset)
                </span>
              )}
            </button>

            {/* Route C Button */}
            <button
              onClick={() => handleRouteSelect('route_c')}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                background: activeRoute === 'route_c' ? 'rgba(6, 182, 212, 0.25)' : 'rgba(15, 23, 42, 0.7)',
                color: activeRoute === 'route_c' ? '#22D3EE' : 'var(--text-slate-300)',
                border: activeRoute === 'route_c' ? '1px solid #06B6D4' : '1px solid #334155',
              }}
              title="Southern 6-lane express via NH-44 Krishnagiri & Hosur (Save 5.5h / $4,800 • Click again to revert to default)"
            >
              <Zap style={{ width: '12px', height: '12px', color: '#22D3EE' }} />
              <span>{activeRoute === 'route_c' ? '● ' : '○ '}Route C (NH-44 6-Lane)</span>
              <span style={{ fontSize: '10px', color: '#22D3EE', background: 'rgba(6, 182, 212, 0.15)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                ⏱️ +5.5h | 💰 $4,800
              </span>
              {activeRoute === 'route_c' && (
                <span style={{ fontSize: '9px', background: '#06B6D4', color: '#000', padding: '2px 5px', borderRadius: '4px', fontWeight: 900 }}>
                  ACTIVE (Click to reset)
                </span>
              )}
            </button>

            {/* Route D Button */}
            <button
              onClick={() => handleRouteSelect('route_d')}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                background: activeRoute === 'route_d' ? 'rgba(168, 85, 247, 0.25)' : 'rgba(15, 23, 42, 0.7)',
                color: activeRoute === 'route_d' ? '#C084FC' : 'var(--text-slate-300)',
                border: activeRoute === 'route_d' ? '1px solid #A855F7' : '1px solid #334155',
              }}
              title="Dedicated Green Freight Corridor via NH-69 (Save 5.9h / $5,350 • Click again to revert to default)"
            >
              <Leaf style={{ width: '12px', height: '12px', color: '#C084FC' }} />
              <span>{activeRoute === 'route_d' ? '● ' : '○ '}Route D (NH-69 Green Freight)</span>
              <span style={{ fontSize: '10px', color: '#C084FC', background: 'rgba(168, 85, 247, 0.15)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                ⏱️ +5.9h | 💰 $5,350
              </span>
              {activeRoute === 'route_d' && (
                <span style={{ fontSize: '9px', background: '#A855F7', color: '#000', padding: '2px 5px', borderRadius: '4px', fontWeight: 900 }}>
                  ACTIVE (Click to reset)
                </span>
              )}
            </button>
          </div>

          {/* Active Route Status Badge & Savings Calculation Trigger Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsCalcModalOpen(true)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                background: 'rgba(255, 181, 0, 0.15)',
                border: '1px solid rgba(255, 181, 0, 0.45)',
                color: 'var(--ups-gold)',
                fontSize: '11px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
              title="Click to view full mathematical & financial calculation formula"
            >
              <Calculator style={{ width: '13px', height: '13px' }} />
              <span>💡 How Time & Cost are Calculated</span>
            </button>

            {activeRoute !== 'default' ? (
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(16, 185, 129, 0.12)',
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}>
                <ShieldCheck style={{ width: '13px', height: '13px' }} />
                <span>Bypass Active • Click active route again to restore Default</span>
              </span>
            ) : (
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-slate-400)',
              }}>
                Operating on Primary Highway Schedule
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Critical SLA Breach Banner */}
      {isCritical && !isRerouted && (
        <div className="alert-pulse-red" style={{
          padding: '1rem 1.25rem',
          borderRadius: '1rem',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid #EF4444',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertOctagon style={{ width: '24px', height: '24px', color: '#EF4444', flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#FFFFFF' }}>
                🚨 CRITICAL SLA BREACH LIKELY (Probability: {slaProb}%)
              </h4>
              <p style={{ fontSize: '0.75rem', color: '#FCA5A5', marginTop: '2px' }}>
                Estimated delay of +{delay} hours will violate deadline (20:00 IST). Customer notified exclusively with delay reason & revised delivery time.
              </p>
            </div>
          </div>

          <button
            onClick={handleTriggerAIExplain}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#EF4444',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Find Best Action →
          </button>
        </div>
      )}

      {/* Main Grid: Interactive Map with HUD & Risk Score Gauge */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.5rem',
      }}>
        
        {/* Leaflet Map with HUD */}
        <div style={{ gridColumn: 'span 2' }}>
          <RouteMap
            origin={shipment.origin}
            destination={shipment.destination}
            currentLocation={shipment.current_location}
            riskScore={score}
            status={shipment.status}
            onSimulateReroute={() => handleRouteSelect('route_b')}
            onSelectRoute={handleRouteSelect}
            onOpenCalculationModal={() => setIsCalcModalOpen(true)}
          />
        </div>

        {/* Live Risk Gauge & Dual Notification Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <RiskGauge
            score={score}
            slaProb={slaProb}
            delayHours={delay}
            status={shipment.status}
          />

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Communication Hub
              </span>
              <span style={{ fontSize: '10px', color: 'var(--ups-gold)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                Dual Channel
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-slate-300)', lineHeight: 1.5 }}>
              Manager broadcast: Customer alerts contain only delay reason & revised delivery time; Fleet driver dispatch contains only new route & reroute reason.
            </p>
            <button
              onClick={onOpenNotifications}
              className="btn-secondary"
              style={{ width: '100%', marginTop: '12px', padding: '8px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Smartphone style={{ width: '14px', height: '14px', color: 'var(--ups-gold)' }} />
              <span>Open Notification Center ({shipment.notifications?.length ?? 0} sent)</span>
            </button>
          </div>
        </div>

      </div>

      {/* Row 2: Factor Breakdown & Recharts History Progression */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
      }}>
        <FactorBreakdown breakdown={shipment.factor_breakdown} />
        <RiskHistoryChart history={shipment.risk_scores} />
      </div>

      {/* "What Changed?" Chronological Audit Timeline */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              Continuous Audit Trail
            </span>
            <h3 style={{ fontSize: '1.125rem', color: '#FFFFFF', marginTop: '2px' }}>
              "What Changed?" Disruption Timeline
            </h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)' }}>
            {shipment.risk_events?.length ?? 0} Events Logged
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {shipment.risk_events?.length === 0 ? (
            <p style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'var(--font-mono)', textAlign: 'center', padding: '1.5rem' }}>
              No disruption events logged yet. Corridor conditions operating normally.
            </p>
          ) : (
            shipment.risk_events?.map((ev, idx) => (
              <div
                key={ev.id ?? idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#0F172A',
                  border: '1px solid #1E293B',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>
                  {ev.event_type === 'WEATHER' ? '🌧' : ev.event_type === 'TRAFFIC' ? '🚗' : '🏭'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ fontWeight: 800, color: '#FFFFFF', textTransform: 'uppercase' }}>
                      {ev.event_type} SIGNAL (Severity: {ev.severity}/10)
                    </span>
                    <span style={{ color: '#64748B' }}>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-slate-300)', marginTop: '2px' }}>
                    {ev.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SAVINGS CALCULATION FORMULA & MID-TRANSIT REROUTE MODAL */}
      <SavingsCalculationModal
        isOpen={isCalcModalOpen}
        onClose={() => setIsCalcModalOpen(false)}
        activeRoute={activeRoute}
      />
    </div>
  );
}
