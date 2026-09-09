import os
import json
import urllib.request
import urllib.error
from datetime import datetime
from dotenv import load_dotenv

ENV_PATH = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(ENV_PATH, override=True)

CORRIDOR_SEGMENTS = {
    "Vellore": {"lat": 12.9165, "lon": 79.1325, "corridor": "NH-48 Km-128 Corridor"},
    "Ambur": {"lat": 12.7904, "lon": 78.7166, "corridor": "NH-48 Ambur Bottleneck"},
    "Chennai": {"lat": 13.0827, "lon": 80.2707, "corridor": "Chennai Outer Ring Road"},
    "Bangalore": {"lat": 12.9716, "lon": 77.5946, "corridor": "Hosur-Electronic City Expressway"},
    "Mumbai": {"lat": 19.0760, "lon": 72.8777, "corridor": "Western Express Highway"},
    "Surat": {"lat": 21.1702, "lon": 72.8311, "corridor": "NH-48 Surat Bypass"},
    "Delhi": {"lat": 28.6139, "lon": 77.2090, "corridor": "Delhi-NCR Ring Road"},
}


def _calculate_traffic_severity(current_speed: float, free_flow_speed: float, current_time: int, free_time: int, closed: bool = False) -> tuple[float, str]:
    """
    Translates real-time TomTom speed telemetry into logistics risk severity (1.0 - 10.0).
    """
    if closed:
        return 10.0, "Complete road closure / accident stoppage on highway"

    free_time = max(1, free_time)
    delay_ratio = current_time / free_time
    delay_seconds = max(0, current_time - free_time)
    speed_drop_pct = max(0.0, ((free_flow_speed - current_speed) / max(1.0, free_flow_speed)) * 100)

    if current_speed < 15.0 or delay_ratio >= 2.5:
        return 9.2, f"Severe gridlock: Velocity slowed to {current_speed:.0f} km/h (+{delay_seconds}s delay)"
    if current_speed < 28.0 or delay_ratio >= 1.7:
        return 7.5, f"Heavy traffic congestion: Speed {current_speed:.0f} km/h (Flow ratio {delay_ratio:.2f}x)"
    if delay_ratio >= 1.3 or speed_drop_pct >= 25.0:
        return 5.2, f"Moderate highway traffic slowdown: Speed {current_speed:.0f} km/h (Free flow {free_flow_speed:.0f} km/h)"
    if delay_ratio >= 1.15:
        return 3.5, f"Minor urban density queue: Speed {current_speed:.0f} km/h"

    return 2.0, f"Fluid highway flow: Vehicle cruising at {current_speed:.0f} km/h (Nominal)"


def fetch_live_corridor_traffic(city: str = "Vellore") -> dict:
    """
    Fetches real-time traffic flow data from TomTom Traffic API.
    """
    load_dotenv(ENV_PATH, override=True)
    api_key = os.getenv("TOMTOM_API_KEY", "").strip()
    seg = CORRIDOR_SEGMENTS.get(city, CORRIDOR_SEGMENTS["Vellore"])

    if not api_key:
        return {
            "source": "SIMULATED_GPS",
            "status": "NO_KEY",
            "city": city,
            "corridor": seg["corridor"],
            "current_speed_kmh": 68.0,
            "free_flow_speed_kmh": 75.0,
            "delay_seconds": 0,
            "severity": 2.0,
            "summary": "Fluid highway flow • 68 km/h nominal velocity",
            "timestamp": datetime.utcnow().isoformat(),
        }

    url = (
        f"https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json"
        f"?point={seg['lat']},{seg['lon']}&unit=KMPH&key={api_key}"
    )

    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "UPS-RiskPilot/1.0", "Accept": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=8) as response:
            data = json.loads(response.read().decode("utf-8"))

        flow = data.get("flowSegmentData", {})
        current_speed = float(flow.get("currentSpeed", 45.0))
        free_flow_speed = float(flow.get("freeFlowSpeed", 60.0))
        current_time = int(flow.get("currentTravelTime", 300))
        free_time = int(flow.get("freeFlowTravelTime", 250))
        confidence = float(flow.get("confidence", 0.7))
        closed = bool(flow.get("roadClosure", False))
        delay_seconds = max(0, current_time - free_time)

        severity, summary = _calculate_traffic_severity(current_speed, free_flow_speed, current_time, free_time, closed)

        return {
            "source": "TOMTOM_TRAFFIC_LIVE",
            "status": "LIVE_API",
            "city": city,
            "corridor": seg["corridor"],
            "coordinates": {"lat": seg["lat"], "lon": seg["lon"]},
            "current_speed_kmh": round(current_speed, 1),
            "free_flow_speed_kmh": round(free_flow_speed, 1),
            "delay_seconds": delay_seconds,
            "confidence": round(confidence, 2),
            "road_closure": closed,
            "severity": severity,
            "summary": f"TomTom GPS on {seg['corridor']}: Speed {current_speed:.0f} km/h (Free: {free_flow_speed:.0f} km/h) • Delay: +{delay_seconds}s • Severity {severity}/10",
            "timestamp": datetime.utcnow().isoformat(),
        }

    except Exception as ex:
        return {
            "source": "FALLBACK_GPS",
            "status": "API_ERROR",
            "city": city,
            "corridor": seg["corridor"],
            "current_speed_kmh": 65.0,
            "free_flow_speed_kmh": 75.0,
            "delay_seconds": 0,
            "severity": 2.0,
            "summary": f"Normal traffic flow along {seg['corridor']}",
            "timestamp": datetime.utcnow().isoformat(),
        }
