import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import LiveTelemetryStreamBar from './components/LiveTelemetryStreamBar';
import Dashboard from './pages/Dashboard';
import ShipmentDetail from './pages/ShipmentDetail';
import NotificationModal from './components/NotificationModal';
import AIExplainModal from './components/AIExplainModal';
import AIModelModal from './components/AIModelModal';
import {
  fetchKPIs,
  fetchShipments,
  fetchShipmentDetail,
  simulateEvent,
  fetchAIRecommendation,
  applyOperationalAction,
  resetDemo,
  sendProactiveNotification,
  syncShipmentWeather,
  syncShipmentTraffic,
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [shipments, setShipments] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [selectedId, setSelectedId] = useState(1);
  const [currentShipment, setCurrentShipment] = useState(null);
  const [isStreaming, setIsStreaming] = useState(true);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSensorTick = useCallback(async (sensorEvent) => {
    try {
      const res = await simulateEvent(selectedId || 1, {
        event_type: sensorEvent.type,
        severity: sensorEvent.severity,
        description: sensorEvent.detail,
      });
      showToast(`📡 Injected Signal: ${sensorEvent.label} → Risk: ${res.updated_risk_score} / 10`);
      await loadData();
    } catch (e) {
      console.error("Signal inject error:", e);
    }
  }, [selectedId]);

  const loadData = async () => {
    try {
      const [kpiData, shipData] = await Promise.all([fetchKPIs(), fetchShipments()]);
      setKpis(kpiData);
      setShipments(shipData);
      if (shipData.length > 0) {
        const detail = await fetchShipmentDetail(selectedId || shipData[0].id);
        setCurrentShipment(detail);
      }
    } catch (e) {
      console.error("Error loading data:", e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [selectedId]);

  const handleSelectShipment = async (id) => {
    setSelectedId(id);
    setActiveTab('details');
    try {
      const detail = await fetchShipmentDetail(id);
      setCurrentShipment(detail);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulateEvent = async (id, eventType, severity, description) => {
    try {
      const res = await simulateEvent(id, { event_type: eventType, severity, description });
      showToast(`⚡ ${eventType} Signal Applied! Risk: ${res.updated_risk_score} / 10`);
      await loadData();
    } catch (e) {
      console.error(e);
      showToast('Simulation failed');
    }
  };

  const handleSyncWeather = async () => {
    try {
      showToast('🛰️ Querying OpenWeatherMap satellite radar...');
      const res = await syncShipmentWeather(selectedId || 1);
      showToast(`🛰️ Live Radar Synced: ${res.synced_location} (${res.weather.condition}, ${res.weather.temp_c}°C) → Risk: ${res.updated_risk_score} / 10`);
      await loadData();
    } catch (e) {
      console.error(e);
      showToast('Weather sync failed');
    }
  };

  const handleSyncTraffic = async () => {
    try {
      showToast('🚗 Querying TomTom live GPS traffic flow...');
      const res = await syncShipmentTraffic(selectedId || 1);
      showToast(`🚗 TomTom Traffic Synced: ${res.synced_location} (${res.traffic.current_speed_kmh} km/h, Delay: +${res.traffic.delay_seconds}s) → Risk: ${res.updated_risk_score} / 10`);
      await loadData();
    } catch (e) {
      console.error(e);
      showToast('TomTom traffic sync failed');
    }
  };

  const handleApplyAction = async (actionPayload) => {
    try {
      const res = await applyOperationalAction(selectedId, actionPayload);
      const savingsStr = res.time_saved_hours ? ` [⏱️ +${res.time_saved_hours}h Saved | 💰 $${res.cost_saved_usd} Saved]` : '';
      showToast(`✓ Routing Updated: ${actionPayload.action}! SLA Recovered: ${res.recovered_sla_probability}%${savingsStr}`);
      await loadData();
    } catch (e) {
      console.error(e);
      showToast('Failed to apply action');
    }
  };

  const handleTriggerManualNotif = async () => {
    try {
      await sendProactiveNotification(selectedId);
      showToast('📱 Customer & Fleet Driver Alerts Dispatched!');
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetDemo = async () => {
    try {
      await resetDemo();
      showToast('🔄 Demo Reset: #UPS10245 returned to Healthy Baseline (Risk 2.8 🟢)');
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenAIModal = async () => {
    try {
      const data = await fetchAIRecommendation(selectedId);
      setAiData(data);
      setIsAIModalOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="app-container">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        kpis={kpis}
        onResetDemo={handleResetDemo}
        onOpenNotifications={() => setIsNotifModalOpen(true)}
        unreadCount={currentShipment?.notifications?.length ?? 0}
      />

      {/* Automated Real-Time IoT Telemetry & Radar Stream Bar */}
      <LiveTelemetryStreamBar
        isStreaming={isStreaming}
        setIsStreaming={setIsStreaming}
        onSensorTick={handleSensorTick}
        onSyncWeather={handleSyncWeather}
        onSyncTraffic={handleSyncTraffic}
        onReset={handleResetDemo}
        onOpenAIModal={() => setIsModelModalOpen(true)}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 200,
          background: 'var(--ups-gold)',
          color: '#000000',
          padding: '10px 18px',
          borderRadius: '12px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          fontWeight: 800,
          boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.25s ease-out',
        }}>
          <span>⚡</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Operations Manager Views */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard
            shipments={shipments}
            kpis={kpis}
            onSelectShipment={handleSelectShipment}
          />
        )}

        {activeTab === 'details' && (
          <ShipmentDetail
            shipment={currentShipment}
            onBack={() => setActiveTab('dashboard')}
            onSimulateEvent={handleSimulateEvent}
            onSyncWeather={handleSyncWeather}
            onSyncTraffic={handleSyncTraffic}
            onExplainAI={handleOpenAIModal}
            onApplyAction={handleApplyAction}
            onOpenNotifications={() => setIsNotifModalOpen(true)}
          />
        )}
      </main>

      {/* AI Decision Support Modal */}
      <AIExplainModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        aiData={aiData}
        onApplyAction={handleApplyAction}
      />

      {/* LLM Model Info & Free Key Configuration Modal */}
      <AIModelModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
      />

      {/* Dual Notification Center Modal */}
      <NotificationModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        notifications={currentShipment?.notifications ?? []}
        onTriggerManualNotif={handleTriggerManualNotif}
      />

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #1E293B',
        padding: '1rem',
        textAlign: 'center',
        fontSize: '0.75rem',
        fontFamily: 'var(--font-mono)',
        color: '#64748B',
        background: '#0B0F19',
      }}>
        UPS RiskPilot • AI-Powered Shipment Early-Warning & Decision Support System • Real-Time Digital Twin
      </footer>

    </div>
  );
}
