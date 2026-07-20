"""Compute per-customer ML features -> customer_features (Fn 1.2)."""
from datetime import date

import numpy as np
import pandas as pd

from backend.database import SessionLocal, engine
import backend.models as m

def build_features():
    cust = pd.read_sql("SELECT * FROM customers", engine)
    usage = pd.read_sql("SELECT * FROM usage_events", engine)
    pay = pd.read_sql("SELECT * FROM payments", engine)
    tix = pd.read_sql("SELECT * FROM support_tickets", engine)

    usage["date"] = pd.to_datetime(usage["date"])
    cust["signup_date"] = pd.to_datetime(cust["signup_date"])
    today = pd.Timestamp(date.today())
    rows = []

    for cid, g in usage.groupby("customer_id"):
        g = g.sort_values("date")
        slope = float(np.polyfit(np.arange(len(g)), g["sessions"], 1)[0]) if len(g) > 1 else 0.0
        active = g[g["sessions"] > 0]["date"]
        days_idle = int((today - active.max()).days) if len(active) else 999

        p = pay[pay.customer_id == cid]
        t = tix[tix.customer_id == cid]
        c = cust[cust.customer_id == cid].iloc[0]

        rows.append(dict(
            customer_id=cid,
            usage_trend=slope,
            adoption_rate=float(g["features_used"].mean() / 8.0),
            payment_reliability=float((p["status"] == "paid").mean()) if len(p) else 1.0,
            ticket_velocity=float(len(t)),
            avg_csat=float(t["csat"].mean()) if len(t) else 5.0,
            tenure_days=int((today - c["signup_date"]).days),
            days_since_last_active=days_idle,
        ))

    feats = pd.DataFrame(rows)
    db = SessionLocal()
    db.query(m.CustomerFeature).delete()
    db.commit()
    db.close()
    feats.to_sql("customer_features", engine, if_exists="append", index=False)
    print(f"Built features for {len(feats)} customers")

if __name__ == "__main__":
    build_features()