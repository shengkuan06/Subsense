"""Load and merge all raw sources into one customer-level view (Fn 1.1)."""
import pandas as pd
from backend.database import engine

def load_raw():
    return {
        "customers": pd.read_sql("SELECT * FROM customers", engine),
        "usage": pd.read_sql("SELECT * FROM usage_events", engine),
        "payments": pd.read_sql("SELECT * FROM payments", engine),
        "tickets": pd.read_sql("SELECT * FROM support_tickets", engine),
        "feedback": pd.read_sql("SELECT * FROM feedback", engine),
    }

def build_profiles():
    """One clean row per customer with rolled-up behaviour."""
    d = load_raw()
    usage = d["usage"].groupby("customer_id").agg(
        total_sessions=("sessions", "sum"),
        avg_features=("features_used", "mean"),
        avg_seats=("seats_used", "mean")).reset_index()
    pay = d["payments"].groupby("customer_id").agg(
        payments=("status", "count"),
        failed=("status", lambda s: (s == "failed").sum())).reset_index()
    tix = d["tickets"].groupby("customer_id").agg(
        tickets=("id", "count"), avg_csat=("csat", "mean")).reset_index()
    fb = d["feedback"].groupby("customer_id").agg(
        nps=("nps", "mean"), sentiment=("sentiment", "mean")).reset_index()

    df = d["customers"]
    for extra in (usage, pay, tix, fb):
        df = df.merge(extra, on="customer_id", how="left")
    return df.fillna(0)

if __name__ == "__main__":
    print(build_profiles().head())
    