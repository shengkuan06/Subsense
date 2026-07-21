"""4-dimension Customer Health Score + batch scoring (Fn 2.2)."""
from datetime import datetime

import joblib
import pandas as pd

from backend.database import engine, SessionLocal
import backend.models as m

MODEL_PATH = "ml/model.pkl"
WEIGHTS = {"usage": 0.40, "engagement": 0.25, "support": 0.20, "outcome": 0.15}

def norm(series, lo, hi, invert=False):
    """Scale a column to 0-100."""
    v = (series.clip(lo, hi) - lo) / (hi - lo) * 100
    return 100 - v if invert else v

def band(score):
    if score >= 70:
        return "Healthy"
    if score >= 40:
        return "At-Risk"
    return "Critical"

def score_all():
    feats = pd.read_sql("SELECT * FROM customer_features", engine)
    fb = pd.read_sql("""
        SELECT customer_id, AVG(nps) AS nps, AVG(sentiment) AS sentiment
        FROM feedback GROUP BY customer_id
    """, engine)
    df = feats.merge(fb, on="customer_id", how="left")
    df[["nps", "sentiment"]] = df[["nps", "sentiment"]].fillna({"nps": 7, "sentiment": 0})

    bundle = joblib.load(MODEL_PATH)
    df["churn_prob"] = bundle["model"].predict_proba(df[bundle["features"]])[:, 1]

    # the four dimensions
    df["usage_dim"] = (norm(df.usage_trend, -3, 1) * 0.5
                       + norm(df.days_since_last_active, 0, 60, invert=True) * 0.3
                       + norm(df.adoption_rate, 0, 1) * 0.2)
    df["engagement_dim"] = norm(df.nps, 0, 10) * 0.6 + norm(df.sentiment, -1, 1) * 0.4
    df["support_dim"] = (norm(df.ticket_velocity, 0, 8, invert=True) * 0.5
                         + norm(df.avg_csat, 1, 5) * 0.5)
    df["outcome_dim"] = (norm(df.payment_reliability, 0, 1) * 0.7
                         + norm(df.tenure_days, 0, 1800) * 0.3)

    base = (WEIGHTS["usage"] * df.usage_dim + WEIGHTS["engagement"] * df.engagement_dim
            + WEIGHTS["support"] * df.support_dim + WEIGHTS["outcome"] * df.outcome_dim)
    # blend the rule-based score with the model's opinion
    df["score"] = (0.7 * base + 0.3 * (1 - df.churn_prob) * 100).round(1)
    df["risk_band"] = df["score"].apply(band)
    df["scored_at"] = datetime.now()

    out = df[["customer_id", "scored_at", "score", "usage_dim", "engagement_dim",
              "support_dim", "outcome_dim", "churn_prob", "risk_band"]].copy()
    numeric = out.select_dtypes("number").columns
    out[numeric] = out[numeric].round(2)

    db = SessionLocal()
    db.query(m.HealthScore).delete()
    db.commit()
    db.close()
    out.to_sql("health_scores", engine, if_exists="append", index=False)
    print(f"Scored {len(out)} customers")
    print(out.risk_band.value_counts())

if __name__ == "__main__":
    score_all()