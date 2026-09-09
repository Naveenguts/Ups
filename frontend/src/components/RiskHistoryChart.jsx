import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function RiskHistoryChart({ history = [] }) {
  const chartData = history.length > 0 ? history.map((item, idx) => {
    const timeStr = item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `Point ${idx + 1}`;
    return {
      time: timeStr,
      risk: Number(item.risk_score.toFixed(1)),
      slaProb: Number(item.sla_probability.toFixed(0)),
      delay: Number(item.estimated_delay.toFixed(1)),
    };
  }) : [
    { time: '10:00 AM', risk: 2.8, slaProb: 12, delay: 0.6 },
  ];

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      
      {/* Title & Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            Continuous Monitoring
          </span>
          <h3 style={{ fontSize: '1.125rem', color: '#FFFFFF', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp style={{ width: '16px', height: '16px', color: 'var(--ups-gold)' }} />
            Risk Trajectory & Progression
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444' }}></span>
            Crit ≥ 8.0
          </span>
          <span style={{ color: '#F97316', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F97316' }}></span>
            High ≥ 6.0
          </span>
          <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }}></span>
            Low &lt; 3.0
          </span>
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: '220px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFB500" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#FFB500" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
            <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} stroke="#64748B" tick={{ fontSize: 11 }} />
            
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div style={{ background: '#0F172A', border: '1px solid #334155', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                      <p style={{ color: '#94A3B8', marginBottom: '2px' }}>{label}</p>
                      <p style={{ color: 'var(--ups-gold)', fontWeight: 800 }}>Risk Score: {data.risk} / 10</p>
                      <p style={{ color: '#FFFFFF' }}>SLA Breach: {data.slaProb}%</p>
                      <p style={{ color: '#FFFFFF' }}>Est Delay: +{data.delay} hrs</p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <ReferenceLine y={8.0} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'Critical (8.0)', fill: '#EF4444', fontSize: 10, position: 'insideTopRight' }} />
            <ReferenceLine y={6.0} stroke="#F97316" strokeDasharray="4 4" label={{ value: 'High (6.0)', fill: '#F97316', fontSize: 10, position: 'insideTopRight' }} />

            <Area
              type="monotone"
              dataKey="risk"
              stroke="#FFB500"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#riskGradient)"
              dot={{ r: 4, fill: '#FFB500', stroke: '#0B0F19', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#FFFFFF', stroke: '#FFB500', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
