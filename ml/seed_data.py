"""Seed SubSense: real churn labels from Telco + synthesized behaviour events."""
import random
from datetime import date, datetime, timedelta

import pandas as pd

from backend.database import SessionLocal, engine, Base
import backend.models as m

RAW = "data/raw/telco.csv"
N_CUSTOMERS = 400
WEEKS = 12
random.seed(42)

PLANS = [
    ("plan_basic", "Basic", "basic", 30.0, 5),
    ("plan_pro", "Pro", "pro", 70.0, 25),
    ("plan_ent", "Enterprise", "enterprise", 110.0, 100),
]

def pick_plan(mrr):
    if mrr < 45:
        return PLANS[0]
    if mrr < 85:
        return PLANS[1]
    return PLANS[2]

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # wipe old data (children first)
    for model in [m.Intervention, m.Recommendation, m.HealthScore, m.CustomerFeature,
                  m.Feedback, m.SupportTicket, m.Payment, m.UsageEvent, m.Customer, m.Plan]:
        db.query(model).delete()
    db.commit()

    for pid, name, tier, price, seats in PLANS:
        db.add(m.Plan(plan_id=pid, name=name, tier=tier, price=price, seat_limit=seats))
    db.commit()

    df = pd.read_csv(RAW).head(N_CUSTOMERS)
    today = date.today()

    for _, row in df.iterrows():
        cid = str(row["customerID"])
        mrr = float(row["MonthlyCharges"])
        tenure = int(row["tenure"])
        churned = str(row["Churn"]).strip().lower() == "yes"
        plan = pick_plan(mrr)

        db.add(m.Customer(
            customer_id=cid,
            name=f"Customer {cid[:5]}",
            segment=random.choice(["SMB", "Mid-Market", "Enterprise"]),
            region=random.choice(["APAC", "EMEA", "AMER"]),
            plan_id=plan[0],
            mrr=mrr,
            signup_date=today - timedelta(days=max(tenure, 1) * 30),
            status="churned" if churned else "active",
        ))

        # usage — churners decay over 12 weeks, healthy stay flat
        base = random.randint(15, 40)
        for w in range(WEEKS):
            factor = max(0.05, 1 - (w / WEEKS) * 0.9) if churned else random.uniform(0.9, 1.1)
            sessions = max(0, int(base * factor))
            db.add(m.UsageEvent(
                customer_id=cid,
                date=today - timedelta(weeks=(WEEKS - w)),
                active_days=min(7, max(0, sessions // 4)),
                sessions=sessions,
                features_used=random.randint(1, 3) if churned else random.randint(3, 8),
                seats_used=random.randint(1, plan[4]),
            ))

        # payments — churners get failures (involuntary churn signal)
        for mth in range(6):
            failed = churned and random.random() < 0.25
            db.add(m.Payment(
                customer_id=cid,
                date=today - timedelta(days=30 * (6 - mth)),
                amount=mrr,
                method=str(row["PaymentMethod"]),
                status="failed" if failed else "paid",
                retry_count=random.randint(1, 3) if failed else 0,
            ))

        # support tickets
        for _ in range(random.randint(3, 8) if churned else random.randint(0, 2)):
            created = datetime.now() - timedelta(days=random.randint(1, 90))
            db.add(m.SupportTicket(
                customer_id=cid,
                created_at=created,
                resolved_at=created + timedelta(hours=random.randint(2, 96)),
                severity=random.choice(["low", "medium", "high"]),
                csat=round(random.uniform(1, 3), 1) if churned else round(random.uniform(3.5, 5), 1),
            ))

        # feedback
        for _ in range(random.randint(1, 3)):
            db.add(m.Feedback(
                customer_id=cid,
                date=today - timedelta(days=random.randint(1, 120)),
                nps=random.randint(0, 6) if churned else random.randint(7, 10),
                sentiment=round(random.uniform(-1, -0.1), 2) if churned else round(random.uniform(0.1, 1), 2),
            ))

    db.commit()
    db.close()
    print(f"Seeded {len(df)} customers with usage, payments, tickets and feedback")

if __name__ == "__main__":
    seed()