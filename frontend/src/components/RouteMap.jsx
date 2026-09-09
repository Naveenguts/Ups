import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Truck, Navigation, AlertCircle, Eye, EyeOff, Radio, Thermometer, ShieldCheck } from 'lucide-react';

const createCustomIcon = (bgColor, label, iconEmoji) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background: ${bgColor};
        color: black;
        font-weight: 800;
        font-family: 'Outfit', sans-serif;
        font-size: 11px;
        padding: 4px 10px;
        border-radius: 9999px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.6);
        border: 2px solid white;
        display: flex;
        align-items: center;
        gap: 5px;
        white-space: nowrap;
        transform: translate(-50%, -50%);
      ">
        <span>${iconEmoji}</span>
        <span>${label}</span>
      </div>
    `,
    iconSize: [90, 30],
    iconAnchor: [45, 15],
  });
};

export default function RouteMap({
  origin = "Chennai",
  destination = "Bangalore",
  currentLocation = "Vellore",
  riskScore = 2.8,
  status = "IN_TRANSIT",
  onSimulateReroute,
}) {
  const [showHud, setShowHud] = useState(true);

  const chennaiCoords = [13.0827, 80.2707];
  const velloreCoords = [12.9165, 79.1325];
  const amborCoords = [12.7904, 78.7166];
  const bangaloreCoords = [12.9716, 77.5946];
  const chittoorCoords = [13.2172, 79.1003];
  const kolarCoords = [13.1367, 78.1291];

  const primaryRoute = [chennaiCoords, [12.9719, 79.6953], velloreCoords, amborCoords, [12.6500, 78.2000], bangaloreCoords];
  const alternateRouteB = [velloreCoords, chittoorCoords, kolarCoords, bangaloreCoords];

  const isRerouted = status === "REROUTED";
  const isCritical = riskScore >= 8.0;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '460px',
      borderRadius: '1.25rem',
      overflow: 'hidden',
      border: '1px solid #1E293B',
      background: '#0B0F19',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.6)',
    }}>
      
      {/* Top Left Header Tag & HUD Toggle */}
      <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(10px)',
          padding: '6px 12px',
          borderRadius: '10px',
          border: '1px solid #334155',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ups-gold)', display: 'inline-block' }}></span>
          <span style={{ color: 'var(--ups-gold)', fontWeight: 700 }}>CORRIDOR:</span>
          <span>{origin} → {destination} via {currentLocation}</span>
        </div>

        <button
          onClick={() => setShowHud(!showHud)}
          style={{
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(10px)',
            padding: '6px 12px',
            borderRadius: '10px',
            border: '1px solid #334155',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-slate-200)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
          }}
        >
          {showHud ? <EyeOff style={{ width: '13px', height: '13px', color: 'var(--ups-gold)' }} /> : <Eye style={{ width: '13px', height: '13px', color: 'var(--ups-gold)' }} />}
          <span>{showHud ? "Hide HUD" : "Show HUD"}</span>
        </button>
      </div>

      {/* Top Right Corridor Status */}
      <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 1000 }}>
        {isRerouted ? (
          <div style={{
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.6)',
            backdropFilter: 'blur(10px)',
            padding: '6px 12px',
            borderRadius: '10px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: '#10B981',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
          }}>
            <ShieldCheck style={{ width: '14px', height: '14px' }} />
            <span>ROUTE B ACTIVE (NH-75)</span>
          </div>
        ) : isCritical ? (
          <div className="alert-pulse-red" style={{
            background: 'rgba(239, 68, 68, 0.25)',
            border: '1px solid #EF4444',
            backdropFilter: 'blur(10px)',
            padding: '6px 12px',
            borderRadius: '10px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: '#EF4444',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <AlertCircle style={{ width: '14px', height: '14px' }} />
            <span>HAZARD CORRIDOR (NH-48)</span>
          </div>
        ) : (
          <div style={{
            background: 'rgba(15, 23, 42, 0.92)',
            border: '1px solid #334155',
            backdropFilter: 'blur(10px)',
            padding: '6px 12px',
            borderRadius: '10px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-slate-300)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <Radio style={{ width: '13px', height: '13px', color: '#10B981' }} />
            <span>TELEMETRY ONLINE</span>
          </div>
        )}
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={[13.00, 78.95]}
        zoom={8}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Primary Route */}
        <Polyline
          positions={primaryRoute}
          color={isRerouted ? "#475569" : isCritical ? "#EF4444" : riskScore >= 6.0 ? "#F97316" : "#FFB500"}
          weight={isRerouted ? 3 : 5}
          dashArray={isRerouted ? "6, 10" : undefined}
          opacity={isRerouted ? 0.4 : 0.95}
        >
          <Tooltip sticky>Primary Corridor (NH-48): {isCritical ? "Disrupted" : "Standard Route"}</Tooltip>
        </Polyline>

        {/* Alternate Route B */}
        <Polyline
          positions={alternateRouteB}
          color="#10B981"
          weight={isRerouted ? 5 : 3}
          dashArray={isRerouted ? undefined : "6, 8"}
          opacity={isRerouted ? 0.95 : 0.5}
        >
          <Tooltip sticky>Alternate Route B (NH-75 Express): Bypasses Vellore flood bottleneck</Tooltip>
        </Polyline>

        {/* Hazard Storm Zone Circle */}
        {riskScore >= 5.0 && (
          <Circle
            center={velloreCoords}
            radius={28000}
            pathOptions={{
              color: '#EF4444',
              fillColor: '#EF4444',
              fillOpacity: 0.25,
              weight: 2,
              dashArray: '4, 6',
            }}
          >
            <Popup>
              <div style={{ color: '#000000', fontSize: '11px', padding: '4px' }}>
                <strong style={{ color: '#EF4444' }}>🌧 Weather & Traffic Disruption Cell</strong>
                <p style={{ marginTop: '4px' }}>Precipitation: 45mm/hr. Highway velocity reduced to 18 km/h.</p>
              </div>
            </Popup>
          </Circle>
        )}

        {/* Markers */}
        <Marker position={chennaiCoords} icon={createCustomIcon('#FFB500', 'Chennai Origin', '📦')}>
          <Popup>Origin: Chennai Distribution Center</Popup>
        </Marker>

        <Marker position={velloreCoords} icon={createCustomIcon(isCritical ? '#EF4444' : '#3B82F6', `Truck TRK-8821 (${currentLocation})`, '🚚')}>
          <Popup>
            <div style={{ color: '#000000', fontSize: '12px', padding: '4px' }}>
              <strong>UPS Fleet #TRK-8821</strong>
              <p>Location: {currentLocation}</p>
              <p>Status: {status}</p>
              <p>Risk: {riskScore} / 10</p>
            </div>
          </Popup>
        </Marker>

        <Marker position={bangaloreCoords} icon={createCustomIcon('#10B981', 'Bangalore Hub', '🏁')}>
          <Popup>Destination: Bangalore Inbound Hub (SLA: 20:00 IST)</Popup>
        </Marker>
      </MapContainer>

      {/* AVIONICS LOGISTICS TELEMETRY HUD OVERLAY */}
      {showHud && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          right: '12px',
          zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          border: isCritical ? '1px solid #EF4444' : '1px solid #334155',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: isCritical ? '0 0 25px rgba(239, 68, 68, 0.35)' : '0 10px 30px rgba(0,0,0,0.6)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            
            {/* Block 1: Truck Telemetry */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                padding: '8px',
                borderRadius: '8px',
                background: 'rgba(255, 181, 0, 0.15)',
                color: 'var(--ups-gold)',
                border: '1px solid rgba(255, 181, 0, 0.3)',
              }}>
                <Truck style={{ width: '20px', height: '20px' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '13px' }}>UPS FLEET #TRK-8821</span>
                  <span style={{ fontSize: '10px', background: '#1E293B', color: 'var(--ups-gold)', padding: '1px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                    {isRerouted ? "VECTOR: NH-75" : "VECTOR: NH-48"}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  POS: 12.9165° N, 79.1325° E • Speed: {isCritical ? "24 km/h" : "68 km/h"} • Fuel: 79%
                </div>
              </div>
            </div>

            {/* Block 2: Sensors */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '1px solid #334155', paddingLeft: '16px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <div>
                <span style={{ color: 'var(--text-slate-400)', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Thermometer style={{ width: '12px', height: '12px', color: '#22D3EE' }} />
                  Cold-Chain Cargo
                </span>
                <span style={{ color: '#10B981', fontWeight: 800 }}>21.4°C (NOMINAL)</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-slate-400)', fontSize: '10px' }}>Precipitation</span>
                <p style={{ color: riskScore >= 5.0 ? '#EF4444' : 'var(--text-slate-200)', fontWeight: 800 }}>
                  {riskScore >= 5.0 ? "48 mm/hr (STORM)" : "0 mm/hr (DRY)"}
                </p>
              </div>
              <div>
                <span style={{ color: 'var(--text-slate-400)', fontSize: '10px' }}>Traffic Velocity</span>
                <p style={{ color: riskScore >= 6.0 ? '#F97316' : 'var(--text-slate-200)', fontWeight: 800 }}>
                  {riskScore >= 6.0 ? "18 km/h (GRIDLOCK)" : "68 km/h (FLUID)"}
                </p>
              </div>
            </div>

            {/* Block 3: Reroute Action */}
            <div>
              {isCritical && !isRerouted && onSimulateReroute && (
                <button
                  onClick={onSimulateReroute}
                  className="btn-primary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  <Navigation style={{ width: '14px', height: '14px' }} />
                  <span>Execute Reroute to Route B</span>
                </button>
              )}
              {isRerouted && (
                <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.4)', fontWeight: 800, fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                  ✓ REROUTE ACTIVE: SAVING 4.5 HOURS
                </span>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
