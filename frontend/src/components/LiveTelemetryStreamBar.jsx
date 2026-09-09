import React, { useState, useEffect, useRef } from 'react';
import { Radio, Play, Pause, RotateCcw, Cpu, CloudRain, Car, Warehouse, Sparkles } from 'lucide-react';

export default function LiveTelemetryStreamBar({ isStreaming, setIsStreaming, onSensorTick, onReset, onOpenAIModal }) {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  const telemetryEvents = [
    {
      type: 'WEATHER',
      severity: 2,
      label: 'Weather Radar Normal',
      detail: 'Clear skies along NH-48 corridor • Surface wind 8 km/h • Precipitation 0mm',
      icon: '🟢',
      color: '#10B981',
    },
    {
      type: 'WEATHER',
      severity: 9,
      label: 'Monsoon Rain Cell Detected',
      detail: 'Vellore Km-128 Doppler Radar: 48mm/hr intense precipitation • Flash flood advisory',
      icon: CloudRain,
      color: '#60A5FA',
    },
    {
      type: 'TRAFFIC',
      severity: 9,
      label: 'Highway Gridlock Alert',
      detail: 'Highway NH-48 GPS: Average velocity slowed to 18 km/h near Ambur junction (14km queue)',
      icon: Car,
      color: '#FB923C',
    },
    {
      type: 'HUB_DELAY',
      severity: 10,
      label: 'Distribution Hub Dock Backlog',
      detail: 'Bangalore Inbound Terminal: 38 vehicles queued in yard • Dock turnaround delayed +4 hrs',
      icon: Warehouse,
      color: '#F87171',
    },
  ];

  const currentEvent = telemetryEvents[currentEventIndex];

  // Background automated telemetry streaming timer
  useEffect(() => {
    if (!isStreaming) return;

    const timer = setInterval(() => {
      setCurrentEventIndex((prev) => {
        const nextIndex = (prev + 1) % telemetryEvents.length;
        const event = telemetryEvents[nextIndex];
        if (onSensorTick) {
          onSensorTick(event);
        }
        return nextIndex;
      });
    }, 14000); // Ticks every 14 seconds automatically

    return () => clearInterval(timer);
  }, [isStreaming, onSensorTick]);

  const Icon = currentEvent.icon;

  return (
    <div style={{
      background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.9) 100%)',
      borderBottom: '1px solid #1E293B',
      padding: '0.625rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.75rem',
    }}>
      {/* Left: Streaming Status & Live Ticker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '10px',
            height: '10px',
          }}>
            {isStreaming && (
              <span style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: '#10B981',
                opacity: 0.75,
                animation: 'pulse 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
              }}></span>
            )}
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isStreaming ? '#10B981' : '#64748B',
            }}></span>
          </span>

          <span style={{
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            color: isStreaming ? '#10B981' : '#94A3B8',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            {isStreaming ? 'LIVE IoT TELEMETRY STREAM' : 'IoT STREAM PAUSED'}
          </span>
        </div>

        <div style={{ width: '1px', height: '16px', background: '#334155' }}></div>

        {/* Live Sensor Ticker */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#09101E',
          padding: '4px 10px',
          borderRadius: '8px',
          border: '1px solid #1E293B',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
        }}>
          {typeof Icon === 'string' ? (
            <span>{Icon}</span>
          ) : (
            <Icon style={{ width: '13px', height: '13px', color: currentEvent.color }} />
          )}
          <span style={{ color: currentEvent.color, fontWeight: 700 }}>
            {currentEvent.label}:
          </span>
          <span style={{ color: '#E2E8F0' }}>
            {currentEvent.detail}
          </span>
        </div>
      </div>

      {/* Right Controls: Play/Pause, LLM Model Info, Reset */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        
        {/* Toggle Stream Play / Pause */}
        <button
          onClick={() => setIsStreaming(!isStreaming)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '8px',
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: isStreaming ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: isStreaming ? '#10B981' : '#F59E0B',
            border: isStreaming ? '1px solid #10B981' : '1px solid #F59E0B',
          }}
          title={isStreaming ? 'Pause background telemetry simulation' : 'Start background telemetry simulation'}
        >
          {isStreaming ? <Pause style={{ width: '12px', height: '12px' }} /> : <Play style={{ width: '12px', height: '12px' }} />}
          <span>{isStreaming ? 'Streaming (14s)' : 'Resume Stream'}</span>
        </button>

        {/* LLM Model Info Button */}
        <button
          onClick={onOpenAIModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '8px',
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            cursor: 'pointer',
            background: 'rgba(56, 189, 248, 0.12)',
            color: '#38BDF8',
            border: '1px solid rgba(56, 189, 248, 0.35)',
          }}
          title="Inspect LLM Reasoning Model configuration"
        >
          <Cpu style={{ width: '12px', height: '12px' }} />
          <span>LLM: Gemini 1.5 Flash</span>
        </button>

        {/* Reset Corridor */}
        <button
          onClick={onReset}
          className="btn-secondary"
          style={{ padding: '5px 10px', fontSize: '0.6875rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          title="Reset corridor to baseline healthy state"
        >
          <RotateCcw style={{ width: '12px', height: '12px', color: 'var(--ups-gold)' }} />
          <span>Reset</span>
        </button>

      </div>
    </div>
  );
}
