import os
from typing import Dict, Any, List


async def generate_ai_decision(shipment_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates AI explanation, root cause analysis, SLA breach prediction,
    and prescriptive recommendations.
    """
    tracking = shipment_data.get("tracking_number", "UPS10245")
    origin = shipment_data.get("origin", "Chennai")
    dest = shipment_data.get("destination", "Bangalore")
    risk = shipment_data.get("risk_score", 8.4)
    weather = shipment_data.get("weather", 9)
    traffic = shipment_data.get("traffic", 9)
    hub_delay = shipment_data.get("hub_delay", 10)
    sla_prob = shipment_data.get("sla_breach_probability", 87)
    delay_hours = shipment_data.get("estimated_delay_hours", 6.7)

    # Detect top root causes based on severity
    causes: List[str] = []
    if weather >= 6:
        causes.append(f"Severe regional weather ({'Heavy rainfall & flash flood risk' if weather >= 8 else 'Moderate rain storm'})")
    if traffic >= 6:
        causes.append(f"Highway bottleneck & congestion ({'Gridlock near Vellore bypass' if traffic >= 8 else 'Slow-moving highway traffic'})")
    if hub_delay >= 6:
        causes.append(f"Distribution hub congestion ({'Bangalore Inbound Hub terminal dock backlog' if hub_delay >= 8 else 'Sorting facility queue'})")
    if not causes:
        causes.append("Normal operational transit variance along standard corridor")

    # Generate prescriptive recommendations with quantitative benefits
    recommendations: List[dict] = []
    if risk >= 6.0:
        recommendations.append({
            "action": "Reroute through Bangalore Hub B",
            "description": "Divert vehicle at Vellore junction via Highway NH-75. Bypasses the flooded corridor and direct dock queue.",
            "expected_risk_reduction": 4.1,
            "expected_delay_reduction": 4.5,
            "priority": "HIGH" if risk < 8 else "CRITICAL"
        })
        recommendations.append({
            "action": "Upgrade to Priority Express Fleet",
            "description": "Authorize expedited high-occupancy lane transit with dedicated cross-dock team upon arrival.",
            "expected_risk_reduction": 2.3,
            "expected_delay_reduction": 2.3,
            "priority": "HIGH"
        })
        recommendations.append({
            "action": "Notify Customer Proactively",
            "description": f"SLA breach probability is {sla_prob}%. Send immediate automated ETA adjustment warning to consignee.",
            "expected_risk_reduction": 0.8,
            "expected_delay_reduction": 0.0,
            "priority": "MEDIUM"
        })
    elif risk >= 3.0:
        recommendations.append({
            "action": "Monitor Traffic Sensor Feeds",
            "description": "Keep real-time telematics poll at 3-minute intervals through Ambur and Krishnagiri segments.",
            "expected_risk_reduction": 1.2,
            "expected_delay_reduction": 1.0,
            "priority": "MEDIUM"
        })
        recommendations.append({
            "action": "Pre-assign Hub Unloading Bay",
            "description": "Reserve direct bay at destination hub to eliminate 40 minutes of yard queueing.",
            "expected_risk_reduction": 1.5,
            "expected_delay_reduction": 1.2,
            "priority": "MEDIUM"
        })
    else:
        recommendations.append({
            "action": "Maintain Current Route Schedule",
            "description": "Shipment is operating well within target SLA parameters. No intervention required.",
            "expected_risk_reduction": 0.0,
            "expected_delay_reduction": 0.0,
            "priority": "LOW"
        })

    # Generate operational summary and prediction
    if risk >= 8.0:
        summary = (
            f"Shipment #{tracking} is at CRITICAL RISK (Score: {risk}/10) on the {origin} → {dest} corridor. "
            f"Simultaneous compound disruptions ({', '.join([c.lower() for c in causes])}) will result in an "
            f"unacceptable delivery breach unless prescriptive intervention is executed immediately."
        )
        prediction = f"Likely SLA breach within 5 hours. Unmitigated delay estimated at +{delay_hours} hours past delivery SLA deadline."
    elif risk >= 6.0:
        summary = (
            f"Shipment #{tracking} is experiencing HIGH RISK (Score: {risk}/10). "
            f"Adverse external conditions are eroding the delivery buffer."
        )
        prediction = f"Moderate SLA breach risk ({sla_prob}%). Projected delay: +{delay_hours} hours without routing optimization."
    elif risk >= 3.0:
        summary = f"Shipment #{tracking} is operating under MODERATE conditions (Score: {risk}/10). Buffer remains positive."
        prediction = f"Minor variance detected. Estimated delay of ~{delay_hours} hours manageable through standard buffer."
    else:
        summary = f"Shipment #{tracking} is HEALTHY (Score: {risk}/10). Zero external bottlenecks detected on active corridor."
        prediction = "Delivery expected on or before SLA deadline. Breach probability nominal (<15%)."

    return {
        "summary": summary,
        "causes": causes,
        "prediction": prediction,
        "recommendations": recommendations,
    }
