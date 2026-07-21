"""SHAP explanations - why is this customer at risk? (Fn 2.3)"""
import joblib
import pandas as pd
import shap

from backend.database import engine

MODEL_PATH = "ml/model.pkl"
_bundle = None
_explainer = None

LABELS = {
    "usage_trend": "Product usage trend",
    "adoption_rate": "Feature adoption",
    "payment_reliability": "Payment reliability",
    "ticket_velocity": "Support ticket volume",
    "avg_csat": "Support satisfaction",
    "tenure_days": "Account tenure",
    "days_since_last_active": "Days since last active",
}

def _load():
    global _bundle, _explainer
    if _bundle is None:
        _bundle = joblib.load(MODEL_PATH)
        _explainer = shap.TreeExplainer(_bundle["model"])
    return _bundle, _explainer

def drivers_for(customer_id, top_n=3):
    """Top +/- risk drivers for one customer."""
    bundle, explainer = _load()
    cols = bundle["features"]
    feats = pd.read_sql("SELECT * FROM customer_features", engine)
    row = feats[feats.customer_id == customer_id]
    if row.empty:
        return []

    values = explainer.shap_values(row[cols])[0]
    s = pd.Series(values, index=cols).sort_values(key=abs, ascending=False)
    return [
        {"feature": LABELS.get(k, k),
         "impact": round(float(v), 3),
         "direction": "increases risk" if v > 0 else "reduces risk"}
        for k, v in s.head(top_n).items()
    ]

if __name__ == "__main__":
    # demo on the highest-risk customer
    import joblib as jl
    b = jl.load(MODEL_PATH)
    f = pd.read_sql("SELECT * FROM customer_features", engine)
    f["p"] = b["model"].predict_proba(f[b["features"]])[:, 1]
    worst = f.sort_values("p", ascending=False).iloc[0]
    print(f"Customer {worst.customer_id} - churn probability {worst.p:.2%}")
    for d in drivers_for(worst.customer_id):
        print(f"  - {d['feature']}: {d['direction']} ({d['impact']})")
        