import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DemoControlBar from './components/DemoControlBar';
import Dashboard from './pages/Dashboard';
import ShipmentDetail from './pages/ShipmentDetail';
import NotificationModal from './components/NotificationModal';
import {
  fetchKPIs,
  fetchShipments,
  fetchShipmentDetail,
  simulateEvent,
  fetchAIRecommendation,
  applyOperationalAction,
  resetDemo,
  sendProactiveNotification,
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [shipments, setShipments] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [selectedId, setSelectedId] = useState(1);
  const [currentShipment, setCurrentShipment] = useState(null);
  const [currentDemoStep, setCurrentDemoStep] = useState(1);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

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
    const interval = setInterval(loadData, 10000);
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
      showToast('🔄 Demo Reset: #UPS10245 returned to Healthy Baseline (Risk 2.8 🟢)');
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExecuteDemoStep = async (stepNum) => {
    setCurrentDemoStep(stepNum);
    setSelectedId(1);
    setActiveTab('details');

    if (stepNum === 1) {
      await resetDemo();
      showToast('Step 1: Baseline Healthy State (Risk 2.8 🟢, SLA Probability 12%)');
      await loadData();
    } else if (stepNum === 2) {
      await simulateEvent(1, {
        event_type: 'WEATHER',
        severity: 9,
        description: 'Heavy rainfall and flood warning on NH-48 Vellore corridor',
      });
      showToast('Step 2: Weather Event Injected → Risk rose to ~5.4 🟡');
      await loadData();
    } else if (stepNum === 3) {
      await simulateEvent(1, {
        event_type: 'TRAFFIC',
        severity: 9,
        description: 'Severe traffic gridlock near Ambur junction - velocity 18 km/h',
      });
      showToast('Step 3: Traffic Congestion Injected → Risk rose to ~7.1 🟠 (SLA 65%)');
      await loadData();
    } else if (stepNum === 4) {
      await simulateEvent(1, {
        event_type: 'HUB_DELAY',
        severity: 10,
        description: 'Bangalore Hub Inbound Terminal 4-hour dock backlog',
      });
      showToast('Step 4: Hub Backlog Injected → Risk CRITICAL (8.7 / 10 🔴, SLA Breach 87%)');
      await loadData();
    } else if (stepNum === 5) {
      showToast('Step 5: AI Explaining Root Causes & SLA Impact Prediction');
      await fetchAIRecommendation(1);
    } else if (stepNum === 6) {
      showToast('Step 6: AI Prescriptive Reroute Recommendation (Save 4.5 hrs)');
      setActiveTab('details');
    } else if (stepNum === 7) {
      await applyOperationalAction(1, {
        action: 'Reroute through Bangalore Hub B',
        description: 'Divert vehicle at Vellore junction via Highway NH-75.',
        expected_delay_reduction: 4.5,
        expected_risk_reduction: 4.1,
      });
      showToast('Step 7: Rerouted to Route B! Risk dropped: 8.7 🔴 → 4.2 🟡, SLA breach 87% → 21%');
      await loadData();
    } else if (stepNum === 8) {
      setIsNotifModalOpen(true);
      showToast('Step 8: Proactive Notifications Dispatched to Customer & Delivery Driver');
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

      {/* Guided 2-Minute Pitch Toolbar */}
      <DemoControlBar
        currentStep={currentDemoStep}
        onExecuteStep={handleExecuteDemoStep}
        onReset={handleResetDemo}
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

      {/* Main Pages */}
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
            onExplainAI={fetchAIRecommendation}
            onApplyAction={handleApplyAction}
            onOpenNotifications={() => setIsNotifModalOpen(true)}
          />
        )}
      </main>

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
