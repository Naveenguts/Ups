# 📦 UPS RiskPilot — AI Shipment Early-Warning & Decision Support System

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Python%203.13-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![CSS](https://img.shields.io/badge/Styling-Pure%20Vanilla%20CSS-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Leaflet](https://img.shields.io/badge/Mapping-Leaflet%20%2B%20OpenStreetMap-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)

**UPS RiskPilot** is an MVP of an AI-powered logistics early-warning and decision-support control tower. It transforms external disruption signals (weather radar, road congestion, destination hub bottlenecks) into explainable risk predictions, prescriptive interventions, and synchronized notifications for both the customer and delivery fleet driver.

---

## 🌟 Key Features

* **Logistics Control Tower Dashboard**:
  - Live KPI risk tier monitoring (Critical, High, Medium, Low).
  - Dynamic fleet risk distribution charts.
  - Active shipment tracking table with instant search and status filtering.

* **Flagship Digital Twin (`#UPS10245` Chennai $\to$ Bangalore)**:
  - Real-time **OpenStreetMap** with primary corridor (NH-48) and alternate bypass (NH-75).
  - **Avionics Cockpit Telemetry HUD**: Live vehicle speed, fuel reserves, cold-chain sensor temperature ($21.4^\circ\text{C}$), precipitation rate, and active route vector.
  - **Explainable AI (XAI) Factor Breakdown**: Dissects compound risk into weighted point contributions (+2.1 pts Weather, +1.7 pts Traffic, +1.4 pts Hub Delay).
  - **Circular SVG Risk Gauge**: Real-time composite score ($0-10$), SLA breach probability ($0-100\%$), and estimated delay projection.

* **Interactive Signal Injectors & Prescriptions**:
  - Inject real-world disruptions on demand: `Simulate Rain`, `Simulate Traffic`, `Simulate Hub Delay`.
  - Prescriptive 1-click operational intervention: Reroute through Bangalore Hub B, reducing risk from **8.7 🔴 down to 4.2 🟡** and saving 4.5 hours of delay.

* **Dual-Channel Synchronized Notification Closed Loop**:
  - 📱 **Customer Alert**: Proactive SMS/Email delay notices and recovery updates with revised ETA.
  - 🚚 **Fleet Driver Dispatch**: Turn-by-turn in-cab telematics reroute orders for frontline drivers.

* **Guided 2-Minute Presentation Pitch Flow**:
  - Pinned sequence toolbar to demonstrate the full story from healthy baseline to resolution in 8 clicks.

---

## 🏗️ System Architecture

```
                                  ┌────────────────────────┐
                                  │      1. shipments      │
                                  │ (Core Package Entity)  │
                                  └───────────┬────────────┘
                                              │ 1:N
                     ┌────────────────────────┼────────────────────────┐
                     │                        │                        │
                     ▼                        ▼                        ▼
           ┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐
           │   2. risk_events  │    │   3. risk_scores  │    │ 4.recommendations │
           │ (What happened?)  │    │  (What is impact?)│    │(How do we fix it?)│
           └───────────────────┘    └───────────────────┘    └───────────────────┘
                                              │ 1:N
                                              ▼
                                    ┌───────────────────┐
                                    │  5. notifications │
                                    │ (Who is alerted?) │
                                    └───────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. One-Click Launch (Windows)
Double-click `start.bat` in the project root:
```cmd
start.bat
```
This automatically starts both the FastAPI backend (`http://127.0.0.1:8000`) and the Vite React frontend (`http://127.0.0.1:5173`).

---

### 2. Manual Startup

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create & activate virtual environment
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux / macOS
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at: **http://127.0.0.1:8000/docs**

#### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Web application will be accessible at: **http://127.0.0.1:5173**

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/kpi` | Real-time fleet KPI metrics and risk tier counts |
| `GET` | `/api/shipments` | List all active shipments with latest risk scores |
| `GET` | `/api/shipments/{id}` | Detailed digital twin data, events, and telemetry |
| `POST` | `/api/shipments/{id}/simulate` | Ingest external disruption event (Weather, Traffic, Hub) |
| `POST` | `/api/shipments/{id}/recommend` | Generate AI root cause synthesis and prescriptive actions |
| `POST` | `/api/shipments/{id}/apply-action` | Execute operational action (e.g. Reroute) and dispatch alerts |
| `GET` | `/api/shipments/{id}/notifications` | Retrieve all dispatched customer & driver notifications |
| `POST` | `/api/shipments/demo/reset` | Reset demo state back to Step 1 baseline |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Pure Vanilla CSS (`index.css`), Pure JavaScript JSX, Leaflet, React-Leaflet, Recharts, Lucide Icons.
- **Backend**: Python 3.13, FastAPI, SQLAlchemy ORM, Pydantic v2, Uvicorn.
- **Database**: PostgreSQL 16 (with automatic fallback to SQLite `riskpilot.db`).
- **Telemetry & Maps**: OpenStreetMap basemaps, Leaflet custom divIcons, simulated vehicle IoT sensors.

---

## 📜 License

MIT License. Designed for UPS Operational Logistics Hackathons and Innovation Showcases.
