import React from 'react';
import { X, Calculator, Clock, DollarSign, Fuel, ShieldCheck, AlertOctagon, ArrowRight, Navigation, CheckCircle2 } from 'lucide-react';

export default function SavingsCalculationModal({ isOpen, onClose, activeRoute = 'route_b' }) {
  if (!isOpen) return null;

  const routeDetails = {
    default: {
      name: 'Route A (Default NH-48)',
      vector: 'NH-48 Primary',
      color: '#EF4444',
      remainingKm: 218,
      speed: 22,
      remainingHours: 9.9,
      delayHours: 6.7,
      timeSaved: 0,
      slaPenalty: 3825,
      fuelWaste: 225,
      reeferCost: 200,
      totalCostSaved: 0,
      totalCostLoss: 5250,
      status: 'CRITICAL SLA BREACH',
    },
    route_b: {
      name: 'Route B (NH-75 Plateau)',
      vector: 'NH-75 Chittoor Bypass',
      color: '#10B981',
      remainingKm: 207,
      speed: 74,
      remainingHours: 2.8,
      delayHours: 1.8,
      timeSaved: 4.9,
      slaPenaltyAvoided: 3825,
      fuelWasteSaved: 225,
      reeferSaved: 200,
      totalCostSaved: 4250,
      status: 'ON-TIME (94% CONFIDENCE)',
    },
    route_c: {
      name: 'Route C (NH-44 6-Lane)',
      vector: 'NH-44 Southern Expressway',
      color: '#06B6D4',
      remainingKm: 230,
      speed: 84,
      remainingHours: 2.7,
      delayHours: 1.2,
      timeSaved: 5.5,
      slaPenaltyAvoided: 4250,
      fuelWasteSaved: 280,
      reeferSaved: 270,
      totalCostSaved: 4800,
      status: 'EXPRESS ON-TIME (97% CONFIDENCE)',
    },
    route_d: {
      name: 'Route D (NH-69 Green Freight)',
      vector: 'NH-69 Dedicated Logistics',
      color: '#A855F7',
      remainingKm: 240,
      speed: 88,
      remainingHours: 2.7,
      delayHours: 0.8,
      timeSaved: 5.9,
      slaPenaltyAvoided: 4675,
      fuelWasteSaved: 350,
      reeferSaved: 325,
      totalCostSaved: 5350,
      status: 'PRIORITY ON-TIME (99% CONFIDENCE)',
    },
  };

  const current = routeDetails[activeRoute] || routeDetails.route_b;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 10, 20, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2500,
      padding: '20px',
      animation: 'fadeIn 0.2s ease-out',
    }}>
      <div style={{
        background: '#0F172A',
        border: '1px solid #334155',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '820px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(56, 189, 248, 0.15)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #1E293B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.9) 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(255, 181, 0, 0.15)',
              border: '1px solid rgba(255, 181, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ups-gold)',
            }}>
              <Calculator style={{ width: '22px', height: '22px' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                How Time Saved & Cost Saved Are Calculated
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                Mathematical formula & dynamic mid-transit diversion logic from current position (Km-128 Vellore)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Section 1: Mid-Transit Diversion Context */}
          <div style={{
            background: '#09101E',
            border: '1px solid #1E293B',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Navigation style={{ width: '20px', height: '20px', color: 'var(--ups-gold)' }} />
              <div>
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>
                  CURRENT VEHICLE PROGRESSION & DIVERSION POINT:
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                  Chennai (Km-0) ➔ <span style={{ color: '#10B981' }}>Vellore Junction (Km-128 Traversed)</span> ➔ Bangalore Hub
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: '#10B981',
              fontWeight: 800,
            }}>
              ✓ First 128 km Completed • Reroute forks from Km-128
            </div>
          </div>

          {/* Section 2: Mathematical Formulas (Time & Money) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            
            {/* Time Saved Formula Card */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '18px',
              fontFamily: 'var(--font-mono)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38BDF8', fontWeight: 800, fontSize: '13px' }}>
                <Clock style={{ width: '16px', height: '16px' }} />
                <span>1. TIME SAVED CALCULATION FORMULA</span>
              </div>

              <div style={{
                marginTop: '12px',
                background: '#09101E',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #1E293B',
                fontSize: '11px',
                lineHeight: '1.6',
                color: '#CBD5E1',
              }}>
                <p style={{ color: '#94A3B8' }}>// Formula based on remaining leg from Km-128:</p>
                <p style={{ color: '#F59E0B', fontWeight: 700 }}>
                  Time Saved = (Remaining Km / Disrupted Speed) - (Remaining Km / Bypass Speed)
                </p>
                <div style={{ margin: '8px 0', padding: '6px 0', borderTop: '1px dashed #334155', borderBottom: '1px dashed #334155' }}>
                  <p>• Route A Disrupted: 218 km ÷ 22 km/h = <strong style={{ color: '#EF4444' }}>9.9 Hours</strong> (Delay: +6.7h)</p>
                  <p>• {current.name}: {current.remainingKm} km ÷ {current.speed} km/h = <strong style={{ color: '#10B981' }}>{current.remainingHours} Hours</strong></p>
                </div>
                <p style={{ color: '#10B981', fontWeight: 800 }}>
                  Net Delivery Time Saved = 9.9h - {current.remainingHours}h = <span style={{ fontSize: '13px' }}>+{current.timeSaved} Hours Saved</span>
                </p>
              </div>

              <p style={{ fontSize: '10px', color: '#94A3B8', marginTop: '10px', lineHeight: '1.4' }}>
                * Bypasses the 48mm/hr flash flood cell & 14km traffic gridlock near Ambur junction.
              </p>
            </div>

            {/* Cost Saved Formula Card */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '18px',
              fontFamily: 'var(--font-mono)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ups-gold)', fontWeight: 800, fontSize: '13px' }}>
                <DollarSign style={{ width: '16px', height: '16px' }} />
                <span>2. COST SAVED CALCULATION FORMULA</span>
              </div>

              <div style={{
                marginTop: '12px',
                background: '#09101E',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #1E293B',
                fontSize: '11px',
                lineHeight: '1.6',
                color: '#CBD5E1',
              }}>
                <p style={{ color: '#94A3B8' }}>// Three distinct financial risk factors:</p>
                <div style={{ margin: '6px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>1. SLA Late Delivery Penalty ($850/hr):</span>
                    <strong style={{ color: 'var(--ups-gold)' }}>+${current.slaPenaltyAvoided || 3825}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>2. Gridlock Idling Fuel Waste (3.8 L/hr):</span>
                    <strong style={{ color: 'var(--ups-gold)' }}>+${current.fuelWasteSaved || 225}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>3. Cold-Chain Cargo Reefer Battery Drain:</span>
                    <strong style={{ color: 'var(--ups-gold)' }}>+${current.reeferSaved || 200}</strong>
                  </div>
                </div>
                <div style={{ paddingTop: '6px', borderTop: '1px dashed #334155', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, color: '#FFFFFF' }}>Total Direct Cost Saved:</span>
                  <strong style={{ color: '#10B981', fontSize: '13px' }}>+${current.totalCostSaved} Saved</strong>
                </div>
              </div>

              <p style={{ fontSize: '10px', color: '#94A3B8', marginTop: '10px', lineHeight: '1.4' }}>
                * Contractual SLAs penalize priority freight past the 20:00 IST delivery deadline.
              </p>
            </div>

          </div>

          {/* Section 3: Full Corridor Route Comparison Table */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid #334155',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '12px 16px', background: '#1E293B', borderBottom: '1px solid #334155' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>
                DYNAMIC CORRIDOR SAVINGS MATRIX (FROM VELLORE KM-128 DIVERSION POINT)
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                <thead>
                  <tr style={{ background: '#09101E', color: '#94A3B8', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px' }}>Route Option</th>
                    <th style={{ padding: '10px 14px' }}>Remaining Leg</th>
                    <th style={{ padding: '10px 14px' }}>Avg Velocity</th>
                    <th style={{ padding: '10px 14px' }}>⏱️ Time Saved</th>
                    <th style={{ padding: '10px 14px' }}>💰 Cost Saved</th>
                    <th style={{ padding: '10px 14px' }}>SLA Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #1E293B', color: '#EF4444', background: activeRoute === 'default' ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 800 }}>Route A (Default NH-48)</td>
                    <td style={{ padding: '10px 14px' }}>218 km (Flooded)</td>
                    <td style={{ padding: '10px 14px' }}>22 km/h (Gridlock)</td>
                    <td style={{ padding: '10px 14px' }}>0.0 Hrs (Delayed +6.7h)</td>
                    <td style={{ padding: '10px 14px' }}>$0 (Penalty: -$5,250)</td>
                    <td style={{ padding: '10px 14px', fontWeight: 800 }}>🚨 SLA BREACH (87%)</td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #1E293B', color: '#10B981', background: activeRoute === 'route_b' ? 'rgba(16, 185, 129, 0.1)' : 'transparent' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 800 }}>🟢 Route B (NH-75 Plateau)</td>
                    <td style={{ padding: '10px 14px' }}>207 km (Dry Plateau)</td>
                    <td style={{ padding: '10px 14px' }}>74 km/h (Fluid)</td>
                    <td style={{ padding: '10px 14px', fontWeight: 800 }}>+4.9 Hours Saved</td>
                    <td style={{ padding: '10px 14px', fontWeight: 800 }}>+$4,250 Saved</td>
                    <td style={{ padding: '10px 14px', fontWeight: 800 }}>✓ 94% On-Time (18:20 IST)</td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #1E293B', color: '#22D3EE', background: activeRoute === 'route_c' ? 'rgba(6, 182, 212, 0.1)' : 'transparent' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 800 }}>⚡ Route C (NH-44 6-Lane)</td>
                    <td style={{ padding: '10px 14px' }}>230 km (Expressway)</td>
                    <td style={{ padding: '10px 14px' }}>84 km/h (Cruising)</td>
                    <td style={{ padding: '10px 14px', fontWeight: 800 }}>+5.5 Hours Saved</td>
                    <td style={{ padding: '10px 14px', fontWeight: 800 }}>+$4,800 Saved</td>
                    <td style={{ padding: '10px 14px', fontWeight: 800 }}>✓ 97% On-Time (17:40 IST)</td>
                  </tr>

                  <tr style={{ color: '#C084FC', background: activeRoute === 'route_d' ? 'rgba(168, 85, 247, 0.1)' : 'transparent' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 800 }}>🌱 Route D (NH-69 Green)</td>
                    <td style={{ padding: '10px 14px' }}>240 km (Fast-Track)</td>
                    <td style={{ padding: '10px 14px' }}>88 km/h (Priority)</td>
                    <td style={{ padding: '10px 14px', fontWeight: 800 }}>+5.9 Hours Saved</td>
                    <td style={{ padding: '10px 14px', fontWeight: 800 }}>+$5,350 Saved</td>
                    <td style={{ padding: '10px 14px', fontWeight: 800 }}>✓ 99% On-Time (17:15 IST)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #1E293B',
          background: '#09101E',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            className="btn-primary"
            style={{ padding: '8px 20px', fontSize: '12px' }}
          >
            Close Formula Breakdown
          </button>
        </div>

      </div>
    </div>
  );
}
