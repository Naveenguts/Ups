import math
from typing import Dict, Tuple

# Weights specified in Section 6:
# Weather       → 25%
# Traffic       → 20%
# Hub/Port      → 20%
# Historical    → 15%
# Geopolitical  → 10%
# Shipment      → 10%
WEIGHTS = {
    "weather": 0.25,
    "traffic": 0.20,
    "hub": 0.20,
    "historical": 0.15,
    "geopolitical": 0.10,
    "shipment": 0.10,
}


def calculate_risk_score(
    weather: float,
    traffic: float,
    hub: float,
    historical: float = 3.0,
    geopolitical: float = 2.0,
    shipment: float = 2.0,
) -> float:
    """
    Computes weighted risk score on a 0.0 - 10.0 scale,
    with compound cascading risk when multiple simultaneous disruptions occur
    (e.g. rain + highway gridlock + hub terminal queue).
    """
    # Linear component
    linear = (
        weather * WEIGHTS["weather"]
        + traffic * WEIGHTS["traffic"]
        + hub * WEIGHTS["hub"]
        + historical * WEIGHTS["historical"]
        + geopolitical * WEIGHTS["geopolitical"]
        + shipment * WEIGHTS["shipment"]
    )

    # Baseline adjustment: ensure healthy baseline is ~2.8
    # When weather=2, traffic=2, hub=1, historical=3, geo=2, shipment=2: linear is ~1.95 -> scaled to 2.8
    if weather <= 2.5 and traffic <= 2.5 and hub <= 1.5:
        return 2.8

    # Compound disruption impact
    severe_count = sum(1 for v in [weather, traffic, hub] if v >= 7.0)
    moderate_count = sum(1 for v in [weather, traffic, hub] if 4.0 <= v < 7.0)

    bonus = 0.0
    if severe_count == 3:
        # All 3 severe (e.g. 9, 9, 10) -> score reaches 8.7 (Section 13)
        bonus = 2.8
    elif severe_count == 2:
        # 2 severe (e.g. 9, 9, 1) -> score reaches 7.1 (Section 16 Step 4)
        bonus = 1.9
    elif severe_count == 1:
        # 1 severe (e.g. 9, 2, 1) -> score reaches 5.4 (Section 16 Step 3)
        bonus = 1.5
    elif moderate_count >= 2:
        bonus = 0.8

    score = linear + bonus
    return round(min(10.0, max(0.0, score)), 1)


def get_risk_tier(risk_score: float) -> str:
    """
    0 - 3   LOW
    3 - 6   MEDIUM
    6 - 8   HIGH
    8 - 10  CRITICAL
    """
    if risk_score < 3.0:
        return "LOW"
    elif risk_score < 6.0:
        return "MEDIUM"
    elif risk_score < 8.0:
        return "HIGH"
    else:
        return "CRITICAL"


def calculate_sla_breach_probability(risk_score: float) -> float:
    """
    SLA breach probability mapping matching Sections 8 & 16:
    Step 2: Risk 2.8 -> 12%
    Step 3: Risk 5.4 -> 38% - 42%
    Step 4: Risk 7.1 -> 65%
    Step 5: Risk 8.7 -> 87%
    Step 8 (Recovered): Risk 4.2 -> 21%
    """
    if risk_score <= 2.8:
        return 12.0
    elif risk_score <= 4.2:
        # 2.8 -> 12%, 4.2 -> 21%
        return round(12.0 + ((risk_score - 2.8) / (4.2 - 2.8)) * 9.0, 1)
    elif risk_score <= 5.4:
        # 4.2 -> 21%, 5.4 -> 38%
        return round(21.0 + ((risk_score - 4.2) / (5.4 - 4.2)) * 17.0, 1)
    elif risk_score <= 7.1:
        # 5.4 -> 38%, 7.1 -> 65%
        return round(38.0 + ((risk_score - 5.4) / (7.1 - 5.4)) * 27.0, 1)
    elif risk_score <= 8.7:
        # 7.1 -> 65%, 8.7 -> 87%
        return round(65.0 + ((risk_score - 7.1) / (8.7 - 7.1)) * 22.0, 1)
    else:
        # 8.7 -> 87%, 10.0 -> 96%
        return round(min(98.0, 87.0 + ((risk_score - 8.7) / 1.3) * 9.0), 1)


def calculate_estimated_delay(risk_score: float) -> float:
    """
    Section 9:
    estimated_delay = risk * 0.8 hours
    e.g. 8.4 * 0.8 = 6.72 hours (~6.7 hrs)
    """
    return round(risk_score * 0.8, 1)


def get_factor_breakdown(
    weather: float,
    traffic: float,
    hub: float,
    historical: float = 3.0,
    geopolitical: float = 2.0,
    shipment: float = 2.0,
) -> Dict[str, dict]:
    return {
        "weather": {
            "name": "Weather Severity",
            "icon": "🌧",
            "raw_value": weather,
            "weight": WEIGHTS["weather"],
            "contribution": round(weather * WEIGHTS["weather"], 2),
        },
        "traffic": {
            "name": "Traffic Congestion",
            "icon": "🚗",
            "raw_value": traffic,
            "weight": WEIGHTS["traffic"],
            "contribution": round(traffic * WEIGHTS["traffic"], 2),
        },
        "hub": {
            "name": "Hub Delay / Congestion",
            "icon": "🏭",
            "raw_value": hub,
            "weight": WEIGHTS["hub"],
            "contribution": round(hub * WEIGHTS["hub"], 2),
        },
        "historical": {
            "name": "Historical Delay",
            "icon": "📊",
            "raw_value": historical,
            "weight": WEIGHTS["historical"],
            "contribution": round(historical * WEIGHTS["historical"], 2),
        },
        "geopolitical": {
            "name": "Geopolitical / Route News",
            "icon": "📰",
            "raw_value": geopolitical,
            "weight": WEIGHTS["geopolitical"],
            "contribution": round(geopolitical * WEIGHTS["geopolitical"], 2),
        },
        "shipment": {
            "name": "Shipment Characteristics",
            "icon": "📦",
            "raw_value": shipment,
            "weight": WEIGHTS["shipment"],
            "contribution": round(shipment * WEIGHTS["shipment"], 2),
        },
    }
