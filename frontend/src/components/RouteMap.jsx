import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Truck, Navigation, AlertCircle, Eye, EyeOff, Radio, Thermometer, ShieldCheck, Zap, Leaf, DollarSign, Clock, RotateCcw } from 'lucide-react';

const createCustomIcon = (bgColor, label, iconEmoji) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background: ${bgColor};
        color: #000000;
        font-weight: 900;
        font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 11px;
        padding: 4px 10px;
        border-radius: 9999px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.7);
        border: 2px solid #FFFFFF;
        display: flex;
        align-items: center;
        gap: 5px;
        white-space: nowrap;
        transform: translate(-50%, -50%);
      ">
        <span style="font-size: 12px;">${iconEmoji}</span>
        <span>${label}</span>
      </div>
    `,
    iconSize: [110, 30],
    iconAnchor: [55, 15],
  });
};

export default function RouteMap({
  origin = "Chennai",
  destination = "Bangalore",
  currentLocation = "Vellore",
  riskScore = 2.8,
  status = "IN_TRANSIT",
  onSimulateReroute,
  onSelectRoute,
}) {
  const [showHud, setShowHud] = useState(true);

  // Key Geographic Coordinates
  const chennaiCoords = [13.0827, 80.2707];
  const velloreCoords = [12.9165, 79.1325];
  const amborCoords = [12.7904, 78.7166];
  const bangaloreCoords = [12.9716, 77.5946];
  const chittoorCoords = [13.2172, 79.1003];
  const kolarCoords = [13.1367, 78.1291];
  const krishnagiriCoords = [12.5266, 78.2146];
  const hosurCoords = [12.7409, 77.8253];

  // 1. Route A: Complete Default Primary Corridor (NH-48 via Vellore & Ambur)
  const primaryRoute = [
    chennaiCoords,
    [13.0100, 80.0500],
    [12.9719, 79.6953],
    [12.9300, 79.3300],
    velloreCoords,
    amborCoords,
    [12.6825, 78.6186],
    krishnagiriCoords,
    hosurCoords,
    bangaloreCoords,
  ];

  // 2. Route B: Complete Northern Expressway (NH-75 via Chittoor & Kolar)
  const alternateRouteB = [
    chennaiCoords,
    [13.0100, 80.0500],
    [12.9719, 79.6953],
    [12.9300, 79.3300],
    velloreCoords,
    chittoorCoords,
    [13.2000, 78.7500],
    [13.1645, 78.3945],
    kolarCoords,
    [13.0709, 77.7981],
    bangaloreCoords,
  ];

  // 3. Route C: Complete Southern 6-Lane Expressway (NH-44 via Harur & Krishnagiri)
  const alternateRouteC = [
    chennaiCoords,
    [12.9200, 79.8000],
    [12.8342, 79.7036],
    [12.4500, 78.9000],
    [12.2500, 78.6000],
    krishnagiriCoords,
    hosurCoords,
    [12.8452, 77.6602],
    bangaloreCoords,
  ];

  // 4. Route D: Complete Green Freight Fast-Track (NH-69 via Tirupati & Chintamani)
  const alternateRouteD = [
    chennaiCoords,
    [13.2500, 79.7500],
    [13.6288, 79.4192],
    [13.5500, 78.5000],
    [13.4000, 78.0500],
    [13.2483, 77.7126],
    bangaloreCoords,
  ];

  // Active Route Evaluation
  const activeRoute =
    status === 'REROUTED_C' ? 'route_c' :
    status === 'REROUTED_D' ? 'route_d' :
    (status === 'REROUTED' || status === 'REROUTED_B') ? 'route_b' :
    'default';

  const isRerouted = activeRoute !== 'default';
  const isCritical = riskScore >= 8.0;

  // Dynamic Route Metadata & Financial Savings
  let routeMeta = {
    name: "Route A (Default NH-48)",
    code: "NH-48",
    color: isCritical ? "#EF4444" : riskScore >= 6.0 ? "#F97316" : "#FFB500",
    timeSaved: "0.0 Hrs",
    costSaved: "$0",
    slaProb: isCritical ? "87%" : "12%",
    slaStatus: isCritical ? "CRITICAL RISK" : "BASELINE",
    speed: isCritical ? "24 km/h" : "68 km/h",
    speedLabel: isCritical ? "GRIDLOCK" : "FLUID",
    distance: "346 km",
    vector: "VECTOR: NH-48 (DEFAULT)",
    truckPos: velloreCoords,
    truckLabel: `Truck TRK-8821 (${currentLocation})`,
  };

  if (activeRoute === 'route_b') {
    routeMeta = {
      name: "Route B (NH-75 Plateau)",
      code: "NH-75",
      color: "#10B981",
      timeSaved: "+4.9 Hours",
      costSaved: "$4,250",
      slaProb: "19%",
      slaStatus: "ON-TIME (SECURED)",
      speed: "74 km/h",
      speedLabel: "CLEAR ELEVATION",
      distance: "335 km",
      vector: "VECTOR: NH-75 (ROUTE B)",
      truckPos: [13.1900, 78.7000],
      truckLabel: "Truck TRK-8821 (NH-75)",
    };
  } else if (activeRoute === 'route_c') {
    routeMeta = {
      name: "Route C (NH-44 6-Lane)",
      code: "NH-44",
      color: "#06B6D4",
      timeSaved: "+5.5 Hours",
      costSaved: "$4,800",
      slaProb: "12%",
      slaStatus: "EXPRESS ON-TIME",
      speed: "84 km/h",
      speedLabel: "6-LANE HIGHWAY",
      distance: "358 km",
      vector: "VECTOR: NH-44 (ROUTE C)",
      truckPos: [12.6000, 78.0500],
      truckLabel: "Truck TRK-8821 (NH-44)",
    };
  } else if (activeRoute === 'route_d') {
    routeMeta = {
      name: "Route D (NH-69 Green)",
      code: "NH-69",
      color: "#A855F7",
      timeSaved: "+5.9 Hours",
      costSaved: "$5,350",
      slaProb: "8%",
      slaStatus: "PRIORITY FAST-TRACK",
      speed: "88 km/h",
      speedLabel: "GREEN CORRIDOR",
      distance: "368 km",
      vector: "VECTOR: NH-69 (ROUTE D)",
      truckPos: [13.4100, 78.1000],
      truckLabel: "Truck TRK-8821 (NH-69)",
    };
  }

  return (
    <div style={{
      position: 'relative',
      zIndex: 1,
      isolation: 'isolate',
      width: '100%',
      height: '490px',
      borderRadius: '1.25rem',
      overflow: 'hidden',
      border: `1px solid ${activeRoute !== 'default' ? routeMeta.color : '#1E293B'}`,
      background: '#0B0F19',
      boxShadow: '0 20px 45px rgba(0, 0, 0, 0.7)',
      transition: 'border-color 0.3s ease',
    }}>
      
      {/* UNIFIED TOP BAR ACROSS MAP (Never overlaps, flex-spaced) */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '14px',
        right: '14px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        pointerEvents: 'none',
      }}>
        
        {/* Left: Corridor Info & HUD Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'auto' }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(10px)',
            padding: '7px 14px',
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
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: routeMeta.color, display: 'inline-block' }}></span>
            <span style={{ color: 'var(--ups-gold)', fontWeight: 800 }}>CORRIDOR:</span>
            <span>{origin} → {destination}</span>
          </div>

          <button
            onClick={() => setShowHud(!showHud)}
            style={{
              background: 'rgba(15, 23, 42, 0.94)',
              backdropFilter: 'blur(10px)',
              padding: '7px 12px',
              borderRadius: '10px',
              border: '1px solid #334155',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-slate-200)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            }}
          >
            {showHud ? <EyeOff style={{ width: '13px', height: '13px', color: 'var(--ups-gold)' }} /> : <Eye style={{ width: '13px', height: '13px', color: 'var(--ups-gold)' }} />}
            <span>{showHud ? "Hide HUD" : "Show HUD"}</span>
          </button>
        </div>

        {/* Right: Real-Time Savings & Route Status (Zero Overlap) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          background: 'rgba(15, 23, 42, 0.96)',
          backdropFilter: 'blur(14px)',
          border: `1px solid ${routeMeta.color}`,
          borderRadius: '12px',
          padding: '6px 14px',
          boxShadow: `0 8px 25px rgba(0,0,0,0.7), 0 0 15px ${routeMeta.color}25`,
          fontFamily: 'var(--font-mono)',
          pointerEvents: 'auto',
        }}>
          <div>
            <div style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Clock style={{ width: '10px', height: '10px', color: '#38BDF8' }} />
              TIME SAVED
            </div>
            <div style={{ fontSize: '13px', fontWeight: 900, color: activeRoute !== 'default' ? '#10B981' : 'var(--text-slate-400)' }}>
              {routeMeta.timeSaved}
            </div>
          </div>

          <div style={{ width: '1px', height: '22px', background: '#334155' }}></div>

          <div>
            <div style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <DollarSign style={{ width: '10px', height: '10px', color: 'var(--ups-gold)' }} />
              COST SAVED
            </div>
            <div style={{ fontSize: '13px', fontWeight: 900, color: activeRoute !== 'default' ? 'var(--ups-gold)' : 'var(--text-slate-400)' }}>
              {routeMeta.costSaved}
            </div>
          </div>

          <div style={{ width: '1px', height: '22px', background: '#334155' }}></div>

          <div>
            <div style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 700 }}>ACTIVE ROUTE</div>
            <div style={{ fontSize: '11px', fontWeight: 900, color: routeMeta.color }}>
              {routeMeta.name}
            </div>
          </div>
        </div>

      </div>

      {/* Leaflet Map (zoomControl disabled to prevent top-left overlap) */}
      <MapContainer
        center={[13.00, 78.95]}
        zoom={8}
        zoomControl={false}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 1. ROUTE A (NH-48 Primary Corridor) */}
        {activeRoute === 'default' ? (
          <>
            <Polyline
              positions={primaryRoute}
              color={routeMeta.color}
              weight={12}
              opacity={0.35}
            />
            <Polyline
              positions={primaryRoute}
              color={routeMeta.color}
              weight={6}
              opacity={1.0}
            >
              <Tooltip sticky>Route A (Default NH-48): {isCritical ? "Disrupted Corridor" : "Standard Route"}</Tooltip>
            </Polyline>
          </>
        ) : (
          <Polyline
            positions={primaryRoute}
            color="#64748B"
            weight={2}
            dashArray="4, 8"
            opacity={0.25}
          >
            <Tooltip sticky>Route A (NH-48 Primary): Default Route (Click to activate)</Tooltip>
          </Polyline>
        )}

        {/* 2. ROUTE B (NH-75 Northern Plateau) */}
        {activeRoute === 'route_b' ? (
          <>
            <Polyline
              positions={alternateRouteB}
              color="#10B981"
              weight={12}
              opacity={0.35}
            />
            <Polyline
              positions={alternateRouteB}
              color="#10B981"
              weight={6}
              opacity={1.0}
            >
              <Tooltip sticky>Route B (NH-75 Plateau): Save 4.9h • $4,250 Saved</Tooltip>
            </Polyline>
          </>
        ) : (
          <Polyline
            positions={alternateRouteB}
            color="#10B981"
            weight={2}
            dashArray="4, 8"
            opacity={0.25}
          >
            <Tooltip sticky>Route B (NH-75 Plateau): Save 4.9h • $4,250 Saved</Tooltip>
          </Polyline>
        )}

        {/* 3. ROUTE C (NH-44 Southern 6-Lane Expressway) */}
        {activeRoute === 'route_c' ? (
          <>
            <Polyline
              positions={alternateRouteC}
              color="#06B6D4"
              weight={12}
              opacity={0.35}
            />
            <Polyline
              positions={alternateRouteC}
              color="#06B6D4"
              weight={6}
              opacity={1.0}
            >
              <Tooltip sticky>Route C (NH-44 6-Lane): Save 5.5h • $4,800 Saved</Tooltip>
            </Polyline>
          </>
        ) : (
          <Polyline
            positions={alternateRouteC}
            color="#06B6D4"
            weight={2}
            dashArray="4, 8"
            opacity={0.25}
          >
            <Tooltip sticky>Route C (NH-44 6-Lane): Save 5.5h • $4,800 Saved</Tooltip>
          </Polyline>
        )}

        {/* 4. ROUTE D (NH-69 Green Freight Express) */}
        {activeRoute === 'route_d' ? (
          <>
            <Polyline
              positions={alternateRouteD}
              color="#A855F7"
              weight={12}
              opacity={0.35}
            />
            <Polyline
              positions={alternateRouteD}
              color="#A855F7"
              weight={6}
              opacity={1.0}
            >
              <Tooltip sticky>Route D (NH-69 Green Freight): Save 5.9h • $5,350 Saved</Tooltip>
            </Polyline>
          </>
        ) : (
          <Polyline
            positions={alternateRouteD}
            color="#A855F7"
            weight={2}
            dashArray="4, 8"
            opacity={0.25}
          >
            <Tooltip sticky>Route D (NH-69 Green Freight): Save 5.9h • $5,350 Saved</Tooltip>
          </Polyline>
        )}

        {/* Hazard Storm Zone Circle around Vellore if severe */}
        {riskScore >= 5.0 && activeRoute === 'default' && (
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
                <strong style={{ color: '#EF4444' }}>🌧 Weather & Traffic Bottleneck Cell</strong>
                <p style={{ marginTop: '4px' }}>Precipitation: 48mm/hr. Velocity reduced to 18 km/h. Alternate routes bypass this cell.</p>
              </div>
            </Popup>
          </Circle>
        )}

        {/* ONLY KEY MARKERS: Chennai Origin, Bangalore Destination, and Active Truck */}
        <Marker position={chennaiCoords} icon={createCustomIcon('#FFB500', 'Chennai Origin', '📦')}>
          <Popup>Origin: Chennai Distribution Center</Popup>
        </Marker>

        <Marker position={routeMeta.truckPos} icon={createCustomIcon(activeRoute !== 'default' ? routeMeta.color : (isCritical ? '#EF4444' : '#3B82F6'), routeMeta.truckLabel, '🚚')}>
          <Popup>
            <div style={{ color: '#000000', fontSize: '12px', padding: '4px' }}>
              <strong>UPS Fleet #TRK-8821</strong>
              <p>Active Route: {routeMeta.name}</p>
              <p>Speed: {routeMeta.speed}</p>
              <p>Time Saved: {routeMeta.timeSaved}</p>
              <p>Cost Saved: {routeMeta.costSaved}</p>
            </div>
          </Popup>
        </Marker>

        <Marker position={bangaloreCoords} icon={createCustomIcon('#10B981', 'Bangalore Hub', '🏁')}>
          <Popup>Destination: Bangalore Inbound Hub (SLA Target: 20:00 IST)</Popup>
        </Marker>
      </MapContainer>

      {/* AVIONICS LOGISTICS TELEMETRY HUD OVERLAY (Bottom of map, perfectly aligned) */}
      {showHud && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '14px',
          right: '14px',
          zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${routeMeta.color}`,
          borderRadius: '12px',
          padding: '12px 18px',
          boxShadow: `0 10px 30px rgba(0,0,0,0.6), 0 0 20px ${routeMeta.color}22`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            
            {/* Block 1: Truck Telemetry */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                padding: '8px',
                borderRadius: '8px',
                background: `${routeMeta.color}22`,
                color: routeMeta.color,
                border: `1px solid ${routeMeta.color}44`,
              }}>
                <Truck style={{ width: '20px', height: '20px' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '13px' }}>UPS FLEET #TRK-8821</span>
                  <span style={{
                    fontSize: '10px',
                    background: `${routeMeta.color}33`,
                    color: routeMeta.color,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                  }}>
                    {routeMeta.vector}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  POS: {routeMeta.truckPos[0].toFixed(4)}° N, {routeMeta.truckPos[1].toFixed(4)}° E • Speed: {routeMeta.speed} • Distance: {routeMeta.distance}
                </div>
              </div>
            </div>

            {/* Block 2: Sensors & Savings */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '1px solid #334155', paddingLeft: '18px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <div>
                <span style={{ color: '#94A3B8', fontSize: '10px' }}>⏱️ TIME SAVED</span>
                <p style={{ color: '#10B981', fontWeight: 900, fontSize: '13px' }}>
                  {routeMeta.timeSaved}
                </p>
              </div>
              <div>
                <span style={{ color: '#94A3B8', fontSize: '10px' }}>💰 COST SAVED</span>
                <p style={{ color: 'var(--ups-gold)', fontWeight: 900, fontSize: '13px' }}>
                  {routeMeta.costSaved}
                </p>
              </div>
              <div>
                <span style={{ color: '#94A3B8', fontSize: '10px' }}>SLA OUTCOME</span>
                <p style={{ color: routeMeta.color, fontWeight: 900, fontSize: '13px' }}>
                  {routeMeta.slaStatus}
                </p>
              </div>
            </div>

            {/* Block 3: Reroute Action / Revert Button */}
            <div>
              {isRerouted ? (
                <button
                  onClick={() => onSelectRoute && onSelectRoute('default')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255, 181, 0, 0.18)',
                    color: 'var(--ups-gold)',
                    border: '1px solid var(--ups-gold)',
                    fontWeight: 800,
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 15px rgba(255, 181, 0, 0.2)',
                  }}
                  title="Click to revert to Default Route A"
                >
                  <RotateCcw style={{ width: '13px', height: '13px', color: 'var(--ups-gold)' }} />
                  <span>REVERT TO DEFAULT ROUTE A</span>
                </button>
              ) : isCritical ? (
                <button
                  onClick={() => onSelectRoute && onSelectRoute('route_b')}
                  className="btn-primary"
                  style={{ padding: '7px 14px', fontSize: '12px' }}
                >
                  <Navigation style={{ width: '14px', height: '14px' }} />
                  <span>Activate Route B (Save 4.9h / $4,250)</span>
                </button>
              ) : (
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-slate-400)' }}>
                  Operating on Primary Baseline
                </span>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
