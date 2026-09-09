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
  onOpenCalculationModal,
}) {
  const [showHud, setShowHud] = useState(true);

  // Key Geographic Coordinates
  const chennaiCoords = [13.0827, 80.2707];
  const velloreCoords = [12.9165, 79.1325]; // Mid-Transit Position (Km 128)
  const amborCoords = [12.7904, 78.7166];   // Disruption Zone (Flooded NH-48)
  const bangaloreCoords = [12.9716, 77.5946];
  const chittoorCoords = [13.2172, 79.1003];
  const kolarCoords = [13.1367, 78.1291];
  const krishnagiriCoords = [12.5266, 78.2146];
  const hosurCoords = [12.7409, 77.8253];

  // 1. Traversed Leg (Completed prior to disruption: Chennai DC -> Vellore Km-128)
  const traversedRoute = [
    chennaiCoords,
    [13.0100, 80.0500],
    [12.9719, 79.6953],
    [12.9300, 79.3300],
    velloreCoords,
  ];

  // 2. Disrupted NH-48 Corridor Ahead (Vellore -> Ambur flood bottleneck -> Krishnagiri -> Bangalore)
  const disruptedCorridorAhead = [
    velloreCoords,
    amborCoords,
    [12.6825, 78.6186],
    krishnagiriCoords,
    hosurCoords,
    bangaloreCoords,
  ];

  // Full Default Route A (NH-48 via Ambur)
  const primaryRoute = [
    ...traversedRoute,
    amborCoords,
    [12.6825, 78.6186],
    krishnagiriCoords,
    hosurCoords,
    bangaloreCoords,
  ];

  // 3. Alternate Bypass Leg B (Mid-Transit Diversion from Vellore via NH-75 Chittoor & Kolar)
  const bypassLegB = [
    velloreCoords,
    chittoorCoords,
    [13.2000, 78.7500],
    [13.1645, 78.3945],
    kolarCoords,
    [13.0709, 77.7981],
    bangaloreCoords,
  ];
  const alternateRouteB = [...traversedRoute, ...bypassLegB.slice(1)];

  // 4. Alternate Bypass Leg C (Mid-Transit Diversion from Vellore via NH-44 6-Lane Expressway)
  const bypassLegC = [
    velloreCoords,
    [12.7500, 78.8500],
    [12.5000, 78.5800],
    krishnagiriCoords,
    hosurCoords,
    [12.8452, 77.6602],
    bangaloreCoords,
  ];
  const alternateRouteC = [...traversedRoute, ...bypassLegC.slice(1)];

  // 5. Alternate Bypass Leg D (Mid-Transit Diversion from Vellore via NH-69 Green Freight)
  const bypassLegD = [
    velloreCoords,
    [13.1500, 79.0500],
    [13.4000, 78.6000],
    [13.3500, 78.0500],
    [13.2483, 77.7126],
    bangaloreCoords,
  ];
  const alternateRouteD = [...traversedRoute, ...bypassLegD.slice(1)];

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

          {onOpenCalculationModal && (
            <button
              onClick={onOpenCalculationModal}
              style={{
                background: 'rgba(255, 181, 0, 0.15)',
                border: '1px solid rgba(255, 181, 0, 0.45)',
                borderRadius: '6px',
                padding: '4px 10px',
                color: 'var(--ups-gold)',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontFamily: 'var(--font-mono)',
                transition: 'all 0.2s',
              }}
              title="Click to view full mathematical & financial calculation formula"
            >
              <span>💡 Formula</span>
            </button>
          )}
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

        {/* 0. COMPLETED TRAVERSED LEG (Chennai DC -> Vellore Km-128) */}
        <Polyline
          positions={traversedRoute}
          color="#38BDF8"
          weight={7}
          opacity={0.85}
        >
          <Tooltip sticky>✓ Traversed Leg: Chennai DC ➔ Vellore (128 km completed)</Tooltip>
        </Polyline>

        {/* If an alternate route is active, show the abandoned flooded segment on NH-48 */}
        {activeRoute !== 'default' && (
          <Polyline
            positions={disruptedCorridorAhead}
            color="#EF4444"
            weight={3}
            dashArray="6, 8"
            opacity={0.45}
          >
            <Tooltip sticky>⛔ Avoided Disrupted Corridor: Flooded NH-48 (Ambur Bottleneck - 6.7h Gridlock Avoided)</Tooltip>
          </Polyline>
        )}

        {/* 1. ROUTE A (NH-48 Primary Corridor Remaining Leg) */}
        {activeRoute === 'default' ? (
          <>
            <Polyline
              positions={disruptedCorridorAhead}
              color={routeMeta.color}
              weight={12}
              opacity={0.35}
            />
            <Polyline
              positions={disruptedCorridorAhead}
              color={routeMeta.color}
              weight={6}
              opacity={1.0}
            >
              <Tooltip sticky>Route A (Default NH-48): {isCritical ? "Disrupted Ambur Corridor (22 km/h)" : "Standard Route"}</Tooltip>
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

        {/* 2. ROUTE B (NH-75 Northern Plateau Mid-Transit Bypass) */}
        {activeRoute === 'route_b' ? (
          <>
            <Polyline
              positions={bypassLegB}
              color="#10B981"
              weight={12}
              opacity={0.35}
            />
            <Polyline
              positions={bypassLegB}
              color="#10B981"
              weight={6}
              opacity={1.0}
            >
              <Tooltip sticky>Route B (NH-75 Plateau): Diverted from Vellore Km-128 • Save 4.9h • $4,250</Tooltip>
            </Polyline>
          </>
        ) : (
          <Polyline
            positions={bypassLegB}
            color="#10B981"
            weight={2}
            dashArray="4, 8"
            opacity={0.25}
          >
            <Tooltip sticky>Route B (NH-75 Plateau Bypass): Diverts from Vellore Km-128</Tooltip>
          </Polyline>
        )}

        {/* 3. ROUTE C (NH-44 Southern 6-Lane Expressway Mid-Transit Bypass) */}
        {activeRoute === 'route_c' ? (
          <>
            <Polyline
              positions={bypassLegC}
              color="#06B6D4"
              weight={12}
              opacity={0.35}
            />
            <Polyline
              positions={bypassLegC}
              color="#06B6D4"
              weight={6}
              opacity={1.0}
            >
              <Tooltip sticky>Route C (NH-44 6-Lane): Diverted from Vellore Km-128 • Save 5.5h • $4,800</Tooltip>
            </Polyline>
          </>
        ) : (
          <Polyline
            positions={bypassLegC}
            color="#06B6D4"
            weight={2}
            dashArray="4, 8"
            opacity={0.25}
          >
            <Tooltip sticky>Route C (NH-44 6-Lane Bypass): Diverts from Vellore Km-128</Tooltip>
          </Polyline>
        )}

        {/* 4. ROUTE D (NH-69 Green Freight Express Mid-Transit Bypass) */}
        {activeRoute === 'route_d' ? (
          <>
            <Polyline
              positions={bypassLegD}
              color="#A855F7"
              weight={12}
              opacity={0.35}
            />
            <Polyline
              positions={bypassLegD}
              color="#A855F7"
              weight={6}
              opacity={1.0}
            >
              <Tooltip sticky>Route D (NH-69 Green Freight): Diverted from Vellore Km-128 • Save 5.9h • $5,350</Tooltip>
            </Polyline>
          </>
        ) : (
          <Polyline
            positions={bypassLegD}
            color="#A855F7"
            weight={2}
            dashArray="4, 8"
            opacity={0.25}
          >
            <Tooltip sticky>Route D (NH-69 Green Freight Bypass): Diverts from Vellore Km-128</Tooltip>
          </Polyline>
        )}

        {/* Hazard Storm Zone Circle around Ambur / Vellore if severe */}
        {riskScore >= 5.0 && activeRoute === 'default' && (
          <Circle
            center={amborCoords}
            radius={25000}
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
                <p style={{ marginTop: '4px' }}>Ambur Corridor: Precipitation 48mm/hr. Velocity reduced to 18 km/h. Alternate routes bypass this cell.</p>
              </div>
            </Popup>
          </Circle>
        )}

        {/* 1. CHENNAI ORIGIN MARKER */}
        <Marker position={chennaiCoords} icon={createCustomIcon('#FFB500', 'Chennai Origin', '📦')}>
          <Popup>Origin: Chennai Distribution Center (Departure 08:30 IST)</Popup>
        </Marker>

        {/* 2. MID-TRANSIT DIVERSION JUNCTION MARKER (VELLORE KM-128) */}
        <Marker position={velloreCoords} icon={createCustomIcon('#F59E0B', '📍 DIVERSION (Km-128)', '🔀')}>
          <Popup>
            <div style={{ color: '#000000', fontSize: '11px', padding: '4px', maxWidth: '240px' }}>
              <strong style={{ color: '#D97706', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                🔀 Mid-Transit Diversion Point (Km 128 - Vellore)
              </strong>
              <p style={{ margin: '3px 0' }}><strong>Current Position:</strong> Truck TRK-8821 reached here at 15:42 IST.</p>
              <p style={{ margin: '3px 0', color: '#DC2626' }}><strong>Ahead on NH-48:</strong> Flooded Ambur corridor (+6.7h gridlock).</p>
              <p style={{ margin: '3px 0', color: '#059669', fontWeight: 700 }}>
                {activeRoute !== 'default'
                  ? `✓ Diverted mid-transit onto ${routeMeta.name}!`
                  : '⚠ Operating on flooded default route. Click Route B/C/D to divert.'}
              </p>
              <p style={{ margin: '3px 0', color: '#64748B', fontSize: '10px' }}>
                Time & cost savings calculated strictly for remaining 218 km from this point.
              </p>
            </div>
          </Popup>
        </Marker>

        {/* 3. ACTIVE TRUCK POSITION */}
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

        {/* 4. BANGALORE DESTINATION HUB */}
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
          pointerEvents: 'auto',
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
            <div style={{ pointerEvents: 'auto' }}>
              {isRerouted ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectRoute) onSelectRoute('default');
                  }}
                  style={{
                    padding: '8px 16px',
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
              ) : isCritical || riskScore >= 5.0 ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectRoute) onSelectRoute('route_b');
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#FFB500',
                    color: '#000000',
                    fontWeight: 900,
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(255, 181, 0, 0.4)',
                    transition: 'all 0.2s',
                  }}
                  title="Click to activate Route B (Bypass disruption from Vellore Km-128)"
                >
                  <Navigation style={{ width: '14px', height: '14px', fill: '#000000' }} />
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
