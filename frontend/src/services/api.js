const API_BASE = '/api';

export async function fetchKPIs() {
  const res = await fetch(`${API_BASE}/kpi`);
  if (!res.ok) throw new Error('Failed to fetch KPIs');
  return res.json();
}

export async function fetchShipments() {
  const res = await fetch(`${API_BASE}/shipments`);
  if (!res.ok) throw new Error('Failed to fetch shipments');
  return res.json();
}

export async function fetchShipmentDetail(id) {
  const res = await fetch(`${API_BASE}/shipments/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch shipment #${id}`);
  return res.json();
}

export async function fetchRiskHistory(id) {
  const res = await fetch(`${API_BASE}/shipments/${id}/risk-history`);
  if (!res.ok) throw new Error(`Failed to fetch risk history for #${id}`);
  return res.json();
}

export async function simulateEvent(id, { event_type, severity, description }) {
  const res = await fetch(`${API_BASE}/shipments/${id}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_type, severity, description }),
  });
  if (!res.ok) throw new Error('Failed to simulate event');
  return res.json();
}

export async function fetchAIRecommendation(id) {
  const res = await fetch(`${API_BASE}/shipments/${id}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to generate AI recommendations');
  return res.json();
}

export async function runWhatIf(id, payload) {
  const res = await fetch(`${API_BASE}/shipments/${id}/what-if`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to calculate what-if simulation');
  return res.json();
}

export async function applyOperationalAction(id, payload) {
  const res = await fetch(`${API_BASE}/shipments/${id}/apply-action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to apply action');
  return res.json();
}

export async function sendProactiveNotification(id) {
  const res = await fetch(`${API_BASE}/shipments/${id}/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to send notification');
  return res.json();
}

export async function resetDemo() {
  const res = await fetch(`${API_BASE}/shipments/demo/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to reset demo');
  return res.json();
}
