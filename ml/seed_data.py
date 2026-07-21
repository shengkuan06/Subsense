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

        # usage — decay strength varies. Some churn with little warning, and
        # ~25% of ACTIVE customers quietly decline (the at-risk demo cohort).
        # Behaviour is an IMPERFECT signal of churn — that is what makes the
        # problem realistic. ~30% of churners leave with no warning signs
        # (price, competitor, budget), and ~15% of ACTIVE customers already
        # behave like churners — those are the accounts SubSense exists to save.
        behaves_risky = random.random() < (0.78 if churned else 0.12)

        if behaves_risky:
            decay = random.choice([0.9, 0.7, 0.5])
        else:
            decay = random.choices([0.0, 0.2], weights=[0.8, 0.2])[0]

        base = random.randint(15, 40)
        for w in range(WEEKS):
            factor = max(0.05, 1 - (w / WEEKS) * decay) * random.uniform(0.8, 1.2)
            sessions = max(0, int(base * factor))
            db.add(m.UsageEvent(
                customer_id=cid,
                date=today - timedelta(weeks=(WEEKS - w)),
                active_days=min(7, max(0, sessions // 4)),
                sessions=sessions,
                features_used=max(1, min(8, int(random.gauss(3 if decay > 0.4 else 6, 2)))),
                seats_used=random.randint(1, plan[4]),
            ))

        # payments — failure rate scales with risk (drives involuntary churn)
        fail_rate = 0.18 if behaves_risky else 0.03
        for mth in range(6):
            failed = random.random() < fail_rate
            db.add(m.Payment(
                customer_id=cid,
                date=today - timedelta(days=30 * (6 - mth)),
                amount=mrr,
                method=str(row["PaymentMethod"]),
                status="failed" if failed else "paid",
                retry_count=random.randint(1, 3) if failed else 0,
            ))

        # support tickets
        n_tickets = max(0, int(random.gauss(4.5 if behaves_risky else 1.2, 2.2)))
        for _ in range(n_tickets):
            created = datetime.now() - timedelta(days=random.randint(1, 90))
            db.add(m.SupportTicket(
                customer_id=cid,
                created_at=created,
                resolved_at=created + timedelta(hours=random.randint(2, 96)),
                severity=random.choice(["low", "medium", "high"]),
                csat=round(min(5, max(1, random.gauss(2.8 if behaves_risky else 4.2, 1.0))), 1),
            ))

        # feedback
        for _ in range(random.randint(1, 3)):
            db.add(m.Feedback(
                customer_id=cid,
                date=today - timedelta(days=random.randint(1, 120)),
                nps=int(min(10, max(0, random.gauss(4.5 if behaves_risky else 7.5, 2.5)))),
                sentiment=round(min(1, max(-1, random.gauss(-0.25 if behaves_risky else 0.4, 0.5))), 2),
            ))

    db.commit()
    db.close()
    print(f"Seeded {len(df)} customers with usage, payments, tickets and feedback")

if __name__ == "__main__":
    seed()