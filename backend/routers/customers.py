"""Customer, health, churn and alert endpoints (Fn 1.3, 2.1, 2.2, 2.3)."""
import pandas as pd
from fastapi import APIRouter

from backend.database import engine
from backend.schemas import ok, fail
from ml.explain import drivers_for

router = APIRouter(prefix="/api", tags=["customers"])

BASE_QUERY = """
    SELECT c.customer_id, c.name, c.segment, c.region, c.mrr, c.status,
           p.name AS plan, h.score AS health_score, h.risk_band, h.churn_prob
    FROM customers c
    LEFT JOIN plans p ON p.plan_id = c.plan_id
    LEFT JOIN health_scores h ON h.customer_id = c.customer_id
"""

@router.get("/customers")
def list_customers(risk_band: str = None, segment: str = None, limit: int = 50):
    df = pd.read_sql(BASE_QUERY, engine)
    if risk_band:
        df = df[df.risk_band == risk_band]
    if segment:
        df = df[df.segment == segment]
    df = df.sort_values("health_score", na_position="last")
    return ok(df.head(limit).to_dict(orient="records"), total=len(df))

@router.get("/customers/{customer_id}")
def get_customer(customer_id: str):
    df = pd.read_sql(BASE_QUERY, engine)
    row = df[df.customer_id == customer_id]
    if row.empty:
        return fail("Customer not found")

    feats = pd.read_sql("SELECT * FROM customer_features", engine)
    f = feats[feats.customer_id == customer_id]
    health = pd.read_sql("SELECT * FROM health_scores", engine)
    h = health[health.customer_id == customer_id]

    return ok({
        "profile": row.iloc[0].to_dict(),
        "features": f.iloc[0].to_dict() if not f.empty else {},
        "health": h.iloc[0].drop("scored_at").to_dict() if not h.empty else {},
    })

@router.get("/customers/{customer_id}/health")
def get_health(customer_id: str):
    h = pd.read_sql("SELECT * FROM health_scores", engine)
    row = h[h.customer_id == customer_id]
    if row.empty:
        return fail("No health score for this customer")
    return ok(row.iloc[0].drop("scored_at").to_dict())

@router.get("/customers/{customer_id}/churn")
def get_churn(customer_id: str):
    h = pd.read_sql("SELECT * FROM health_scores", engine)
    row = h[h.customer_id == customer_id]
    if row.empty:
        return fail("No score for this customer")
    return ok({
        "customer_id": customer_id,
        "churn_prob": float(row.iloc[0].churn_prob),
        "risk_band": row.iloc[0].risk_band,
        "drivers": drivers_for(customer_id, top_n=3),
    })

@router.get("/alerts")
def alerts(limit: int = 20):
    """Still-active customers with the highest churn risk."""
    df = pd.read_sql(BASE_QUERY, engine)
    at_risk = df[(df.status == "active") & (df.risk_band != "Healthy")]
    at_risk = at_risk.sort_values("churn_prob", ascending=False)
    return ok(at_risk.head(limit).to_dict(orient="records"),
              total_at_risk=len(at_risk),
              mrr_at_risk=round(float(at_risk.mrr.sum()), 2))