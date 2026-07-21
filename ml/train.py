"""Train the churn prediction model (Fn 2.1)."""
import joblib
import pandas as pd
from imblearn.over_sampling import SMOTE
from sklearn.model_selection import train_test_split
from sklearn.metrics import (roc_auc_score, classification_report,
                             precision_score, recall_score)
from xgboost import XGBClassifier

from backend.database import engine

FEATURES = ["usage_trend", "adoption_rate", "payment_reliability",
            "ticket_velocity", "avg_csat", "tenure_days", "days_since_last_active"]
MODEL_PATH = "ml/model.pkl"

def load_training_data():
    df = pd.read_sql("""
        SELECT f.*, c.status
        FROM customer_features f
        JOIN customers c ON c.customer_id = f.customer_id
    """, engine)
    df["label"] = (df["status"] == "churned").astype(int)
    return df

def train():
    df = load_training_data()
    X, y = df[FEATURES], df["label"]
    print(f"Training on {len(df)} customers ({y.sum()} churned)")

    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y, test_size=0.25, stratify=y, random_state=42)

    # SMOTE: churners are the minority - synthesize more of them
    X_res, y_res = SMOTE(random_state=42).fit_resample(X_tr, y_tr)
    print(f"After SMOTE: {len(X_res)} training rows (balanced)")

    model = XGBClassifier(n_estimators=300, max_depth=4, learning_rate=0.1,
                          subsample=0.9, eval_metric="logloss", random_state=42)
    model.fit(X_res, y_res)

    prob = model.predict_proba(X_te)[:, 1]
    print("\nAUC-ROC:", round(roc_auc_score(y_te, prob), 3))

    # Missing a churner costs far more than a false alarm, so choose the
    # threshold with the best F2 score (weights recall 2x over precision).
    best_t, best_f2 = 0.5, -1.0
    for t in [i / 100 for i in range(20, 71)]:
        p = (prob >= t).astype(int)
        prec = precision_score(y_te, p, zero_division=0)
        rec = recall_score(y_te, p, zero_division=0)
        f2 = 0.0 if (prec + rec) == 0 else (5 * prec * rec) / (4 * prec + rec)
        if f2 > best_f2:
            best_t, best_f2 = t, f2
    print(f"Optimal threshold: {best_t} (vs default 0.5)")

    pred = (prob >= best_t).astype(int)
    print(classification_report(y_te, pred, target_names=["retained", "churned"]))

    joblib.dump({"model": model, "features": FEATURES, "threshold": best_t}, MODEL_PATH)
    print(f"Saved -> {MODEL_PATH}")

if __name__ == "__main__":
    train()
    