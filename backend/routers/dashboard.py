"""Portfolio KPIs for the dashboard."""
import pandas as pd
from fastapi import APIRouter

from backend.database import engine
from backend.schemas import ok

router = APIRouter(prefix="/api", tags=["dashboard"])

@router.get("/dashboard/overview")
def overview():
    df = pd.read_sql("""
        SELECT c.customer_id, c.mrr, c.status, h.score, h.risk_band, h.churn_prob
        FROM customers c
        LEFT JOIN health_scores h ON h.customer_id = c.customer_id
    """, engine)
    active = df[df.status == "active"]
    at_risk = active[active.risk_band != "Healthy"]

    return ok({
        "total_customers": int(len(df)),
        "active_customers": int(len(active)),
        "total_mrr": round(float(active.mrr.sum()), 2),
        "mrr_at_risk": round(float(at_risk.mrr.sum()), 2),
        "avg_health_score": round(float(active.score.mean()), 1),
        "bands": active.risk_band.value_counts().to_dict(),
    })