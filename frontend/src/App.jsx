import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import RoleSwitcher from './components/RoleSwitcher';
import LiveTelemetryStreamBar from './components/LiveTelemetryStreamBar';
import Dashboard from './pages/Dashboard';
import ShipmentDetail from './pages/ShipmentDetail';
import CustomerView from './pages/CustomerView';
import DriverView from './pages/DriverView';
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
  fetchCustomerRoleView,
  fetchDriverRoleView,
  fetchControlTowerRoleView,
} from './services/api';

export default function App() {
  const [activeRole, setActiveRole] = useState('control-tower'); // 'customer' | 'driver' | 'control-tower'
  const [roleData, setRoleData] = useState(null);
  const [loadingRole, setLoadingRole] = useState(false);
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
      showToast(`📡 Live IoT Radar: ${sensorEvent.label} → Risk: ${res.updated_risk_score} / 10`);
      await loadData();
    } catch (e) {
      console.error("Telemetry streaming tick error:", e);
    }
  }, [selectedId]);

  const loadRoleData = async (role, tracking = 'UPS10245') => {
    setLoadingRole(true);
    try {
      if (role === 'customer') {
        const data = await fetchCustomerRoleView(tracking);
        setRoleData(data);
      } else if (role === 'driver') {
        const data = await fetchDriverRoleView(tracking);
        setRoleData(data);
      } else {
        const data = await fetchControlTowerRoleView(tracking);
        setRoleData(data);
      }
    } catch (err) {
      console.error("Error loading role view:", err);
    } finally {
      setLoadingRole(false);
    }
  };

  const loadData = async () => {
    try {
      const [kpiData, shipData] = await Promise.all([fetchKPIs(), fetchShipments()]);
      setKpis(kpiData);
      setShipments(shipData);
      if (shipData.length > 0) {
        const detail = await fetchShipmentDetail(selectedId || shipData[0].id);
        setCurrentShipment(detail);
        await loadRoleData(activeRole, detail.tracking_number);
      }
    } catch (e) {
      console.error("Error loading data:", e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [selectedId, activeRole]);

  const handleRoleChange = async (newRole) => {
    setActiveRole(newRole);
    const tracking = currentShipment?.tracking_number || 'UPS10245';
    await loadRoleData(newRole, tracking);
  };

  const handleSelectShipment = async (id) => {
    setSelectedId(id);
    setActiveTab('details');
    setActiveRole('control-tower');
    try {
      const detail = await fetchShipmentDetail(id);
      setCurrentShipment(detail);
      await loadRoleData('control-tower', detail.tracking_number);
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

  const handleApplyAction = async (actionPayload) => {
    try {
      const res = await applyOperationalAction(selectedId, actionPayload);
      showToast(`✓ Action Applied: ${actionPayload.action}! SLA Recovered to ${res.recovered_sla_probability}%`);
      await loadData();
      setIsNotifModalOpen(true);
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
      setCurrentDemoStep(1);
      setActiveRole('control-tower');
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

  const handleExecuteDemoStep = async (stepNum) => {
    setCurrentDemoStep(stepNum);
    setSelectedId(1);
    const tracking = 'UPS10245';

    if (stepNum === 1) {
      setActiveRole('control-tower');
      setActiveTab('details');
      setIsAIModalOpen(false);
      setIsNotifModalOpen(false);
      await resetDemo();
      showToast('Step 1: Baseline Healthy State (Risk 2.8 🟢, SLA Probability 12%)');
      await loadData();
    } else if (stepNum === 2) {
      setActiveRole('control-tower');
      setActiveTab('details');
      setIsAIModalOpen(false);
      setIsNotifModalOpen(false);
      await simulateEvent(1, {
        event_type: 'WEATHER',
        severity: 9,
        description: 'Heavy rainfall and flood warning on NH-48 Vellore corridor',
      });
      showToast('Step 2: Weather Event Injected → Risk rose to ~5.4 🟡');
      await loadData();
    } else if (stepNum === 3) {
      setActiveRole('control-tower');
      setActiveTab('details');
      setIsAIModalOpen(false);
      setIsNotifModalOpen(false);
      await simulateEvent(1, {
        event_type: 'TRAFFIC',
        severity: 9,
        description: 'Severe traffic gridlock near Ambur junction - velocity 18 km/h',
      });
      showToast('Step 3: Traffic Congestion Injected → Risk rose to ~7.1 🟠 (SLA 65%)');
      await loadData();
    } else if (stepNum === 4) {
      setActiveRole('control-tower');
      setActiveTab('details');
      setIsAIModalOpen(false);
      setIsNotifModalOpen(false);
      await simulateEvent(1, {
        event_type: 'HUB_DELAY',
        severity: 10,
        description: 'Bangalore Hub Inbound Terminal 4-hour dock backlog',
      });
      showToast('Step 4: Hub Backlog Injected → Risk CRITICAL (8.7 / 10 🔴, SLA Breach 87%)');
      await loadData();
    } else if (stepNum === 5) {
      setActiveRole('control-tower');
      setActiveTab('details');
      setIsNotifModalOpen(false);
      showToast('Step 5: Opening AI Root Cause Diagnostic & Solutions 🔍');
      const data = await fetchAIRecommendation(1);
      setAiData(data);
      setIsAIModalOpen(true);
    } else if (stepNum === 6) {
      setIsAIModalOpen(false);
      setIsNotifModalOpen(false);
      await handleRoleChange('customer');
      showToast('Step 6: Customer View 📱 — Showing recipient delay reason & revised ETA (Risk & telemetry hidden)');
    } else if (stepNum === 7) {
      setIsAIModalOpen(false);
      setIsNotifModalOpen(false);
      await handleRoleChange('driver');
      showToast('Step 7: Driver View 🚚 — Tactical reroute instruction & hazards (PII & penalties hidden)');
    } else if (stepNum === 8) {
      setIsAIModalOpen(false);
      setActiveRole('control-tower');
      setActiveTab('details');
      await applyOperationalAction(1, {
        action: 'Reroute through Bangalore Hub B',
        description: 'Divert vehicle at Vellore junction via Highway NH-75.',
        expected_delay_reduction: 4.5,
        expected_risk_reduction: 4.1,
      });
      showToast('Step 8: Rerouted to Route B! Risk dropped: 8.7 🔴 → 4.2 🟡, SLA breach 87% → 21%');
      await loadData();
    }
  };

  return (
    <div className="app-container">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setActiveRole('control-tower');
        }}
        kpis={kpis}
        onResetDemo={handleResetDemo}
        onOpenNotifications={() => setIsNotifModalOpen(true)}
        unreadCount={currentShipment?.notifications?.length ?? 0}
      />

      {/* Role Switcher Bar with Data Separation Inspector */}
      <RoleSwitcher
        activeRole={activeRole}
        setActiveRole={handleRoleChange}
        currentRoleData={roleData}
        loading={loadingRole}
      />

      {/* Automated Real-Time IoT Telemetry & Radar Stream Bar */}
      <LiveTelemetryStreamBar
        isStreaming={isStreaming}
        setIsStreaming={setIsStreaming}
        onSensorTick={handleSensorTick}
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

      {/* Main Role-Based Pages */}
      <main className="main-content">
        {activeRole === 'customer' && (
          <CustomerView data={roleData} loading={loadingRole} />
        )}

        {activeRole === 'driver' && (
          <DriverView data={roleData} loading={loadingRole} />
        )}

        {activeRole === 'control-tower' && (
          <>
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
                onExplainAI={handleOpenAIModal}
                onApplyAction={handleApplyAction}
                onOpenNotifications={() => setIsNotifModalOpen(true)}
              />
            )}
          </>
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
