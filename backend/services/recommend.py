"""Personalised retention & growth actions (Pillar 3 — Fn 3.1, 3.2, 3.3).

Transparent rules layered on top of the health score, churn probability and
plan-fit signals (see plan §6.5). Every recommendation carries a plain-language
reason so the action is explainable, not a black box.
"""
import pandas as pd

from backend.database import engine

# Plan ladder used for right-sizing (order matters: index = tier rank).
PLAN_LADDER = ["plan_basic", "plan_pro", "plan_ent"]
PLAN_NAME = {"plan_basic": "Basic", "plan_pro": "Pro", "plan_ent": "Enterprise"}

# Maps a recommendation/driver into an intervention playbook + UI action text.
PLAYBOOK_META = {
    "pause":     {"type": "pause",   "playbook": "pause_offer",    "action": "Offer Pause"},
    "downgrade": {"type": "ai",      "playbook": "csm_outreach",   "action": "Right-size Plan"},
    "upgrade":   {"type": "ai",      "playbook": "csm_outreach",   "action": "Propose Upgrade"},
    "winback":   {"type": "winback", "playbook": "winback",        "action": "Send Win-back"},
    "retry":     {"type": "retry",   "playbook": "payment_retry",  "action": "Retry Payment"},
}


def _customer_frame():
    """One row per customer joining profile, plan, features, health and payment health."""
    df = pd.read_sql("""
        SELECT c.customer_id, c.name, c.segment, c.mrr, c.status,
               c.plan_id, p.name AS plan, p.seat_limit,
               f.usage_trend, f.adoption_rate, f.payment_reliability,
               f.ticket_velocity, f.avg_csat, f.days_since_last_active,
               h.score AS health_score, h.risk_band, h.churn_prob
        FROM customers c
        LEFT JOIN plans p ON p.plan_id = c.plan_id
        LEFT JOIN customer_features f ON f.customer_id = c.customer_id
        LEFT JOIN health_scores h ON h.customer_id = c.customer_id
    """, engine)

    seats = pd.read_sql("""
        SELECT customer_id, AVG(seats_used) AS avg_seats
        FROM usage_events GROUP BY customer_id
    """, engine)
    fails = pd.read_sql("""
        SELECT customer_id,
               SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed_payments,
               MAX(retry_count) AS max_retry_count
        FROM payments GROUP BY customer_id
    """, engine)
    df = df.merge(seats, on="customer_id", how="left").merge(fails, on="customer_id", how="left")
    return df.fillna({"avg_seats": 0, "failed_payments": 0, "max_retry_count": 0})


def _rules_for(row) -> list[dict]:
    """Apply the §6.5 recommendation rules to a single customer row."""
    recs: list[dict] = []
    churn = float(row.churn_prob or 0)
    adoption = float(row.adoption_rate or 0)
    seat_util = (row.avg_seats / row.seat_limit) if row.seat_limit else 0
    healthy_pay = float(row.payment_reliability or 1) >= 0.9

    # 3.3 Involuntary churn — a failed/expired payment beats any behavioural offer.
    if int(row.failed_payments or 0) > 0:
        recs.append({
            "type": "retry", "target_plan_id": None,
            "reason": f"{int(row.failed_payments)} failed payment(s) — retry billing to recover "
                      f"${round(row.mrr)}/mo before it becomes involuntary churn.",
        })

    # 3.1 Under-utilisation + healthy payer → right-size down (avoid "wasting money" churn).
    if adoption < 0.35 and seat_util < 0.4 and healthy_pay:
        lower = _lower_plan(row.plan_id)
        if lower:
            recs.append({
                "type": "downgrade", "target_plan_id": lower,
                "reason": f"Only {round(adoption * 100)}% feature adoption and {round(seat_util * 100)}% "
                          f"of seats used — move to {PLAN_NAME[lower]} so they keep paying for value they use.",
            })

    # 3.1 High utilisation near the plan ceiling → expansion upsell.
    if seat_util >= 0.85 and adoption >= 0.6 and churn < 0.4:
        higher = _higher_plan(row.plan_id)
        if higher:
            recs.append({
                "type": "upgrade", "target_plan_id": higher,
                "reason": f"{round(seat_util * 100)}% of seats used and strong adoption — offer {PLAN_NAME[higher]} "
                          f"to remove the ceiling before it hurts the experience.",
            })

    # 3.2 High churn risk + value erosion → pause before cancel (research: saves ~75%).
    if churn >= 0.6 and float(row.usage_trend or 0) < 0:
        recs.append({
            "type": "pause", "target_plan_id": None,
            "reason": f"{round(churn * 100)}% churn risk with declining usage — offer a pause instead of "
                      f"cancellation to protect the relationship without a margin-eroding discount.",
        })

    # 3.2 Still at risk but no cheaper structural fix → human win-back.
    if churn >= 0.6 and not any(r["type"] in ("pause", "downgrade") for r in recs):
        recs.append({
            "type": "winback", "target_plan_id": None,
            "reason": f"{round(churn * 100)}% churn risk — schedule a CSM win-back before renewal.",
        })

    return recs


def _lower_plan(plan_id):
    i = PLAN_LADDER.index(plan_id) if plan_id in PLAN_LADDER else 0
    return PLAN_LADDER[i - 1] if i > 0 else None


def _higher_plan(plan_id):
    i = PLAN_LADDER.index(plan_id) if plan_id in PLAN_LADDER else len(PLAN_LADDER) - 1
    return PLAN_LADDER[i + 1] if i < len(PLAN_LADDER) - 1 else None


def recommendations_for(customer_id: str) -> list[dict]:
    """Next-best actions for one customer (Fn 3.1, 3.2)."""
    df = _customer_frame()
    row = df[df.customer_id == customer_id]
    if row.empty:
        return []
    return _rules_for(row.iloc[0])


def _risk_level(churn: float) -> str:
    if churn >= 0.7:
        return "HIGH RISK"
    if churn >= 0.4:
        return "MEDIUM RISK"
    return "LOW RISK"


def playbooks(limit: int = 60) -> list[dict]:
    """Portfolio-wide retention playbooks for the Actions board (Fn 3.2).

    Returns the single highest-priority action per at-risk active customer,
    shaped for the frontend Playbook card.
    """
    df = _customer_frame()
    active = df[df.status == "active"].sort_values("churn_prob", ascending=False)

    cards: list[dict] = []
    for _, row in active.iterrows():
        recs = _rules_for(row)
        if not recs:
            continue
        top = recs[0]
        meta = PLAYBOOK_META[top["type"]]
        cards.append({
            "id": f"pb-{row.customer_id}",
            "customerId": row.customer_id,
            "customerName": row["name"],
            "plan": row["plan"],
            "mrr": round(float(row.mrr or 0)),
            "status": row.risk_band or "Healthy",
            "title": meta["action"],
            "description": top["reason"],
            "type": meta["type"],
            "riskLevel": _risk_level(float(row.churn_prob or 0)),
            "completed": False,
            "actionText": meta["action"],
        })
        if len(cards) >= limit:
            break
    return cards


def segment_rollups() -> list[dict]:
    """Per-segment health/risk/MRR rollups for the Segments view (Fn 1.3)."""
    df = _customer_frame()
    df = df[df.status == "active"]
    out: list[dict] = []
    for name, g in df.groupby("segment"):
        total = len(g)
        if total == 0:
            continue
        healthy = int((g.risk_band == "Healthy").sum())
        at_risk = int((g.risk_band == "At-Risk").sum())
        critical = int((g.risk_band == "Critical").sum())
        mrr = float(g.mrr.sum())
        out.append({
            "name": name,
            "customerCount": total,
            "avgHealthScore": round(float(g.health_score.mean() or 0)),
            "churnRiskPercent": round(float(g.churn_prob.mean() or 0) * 100),
            "mrrText": f"${mrr / 1000:.1f}K" if mrr >= 1000 else f"${round(mrr)}",
            "healthBreakdown": {
                "healthy": round(healthy / total * 100),
                "atRisk": round(at_risk / total * 100),
                "critical": round(critical / total * 100),
            },
        })
    return out


def payments_at_risk(limit: int = 40) -> dict:
    """Failed / retrying payments with a suggested retry window (Fn 3.3)."""
    rows = pd.read_sql("""
        SELECT pay.customer_id, c.name, c.mrr, c.status,
               pay.amount, pay.method, pay.status AS pay_status,
               pay.retry_count, pay.date
        FROM payments pay
        JOIN customers c ON c.customer_id = pay.customer_id
        WHERE pay.status IN ('failed', 'retry')
        ORDER BY pay.date DESC
    """, engine)

    # keep the most recent failed payment per customer
    rows = rows.drop_duplicates(subset="customer_id", keep="first")
    recovered_at_risk = float(rows.mrr.sum())

    def retry_window(retry_count):
        # simple optimal-retry heuristic: back off as attempts grow
        return {0: "in 24 hours", 1: "in 3 days", 2: "in 5 days"}.get(int(retry_count or 0), "manual review")

    records = [{
        "customer_id": r.customer_id,
        "name": r["name"],
        "mrr": round(float(r.mrr or 0)),
        "amount": round(float(r.amount or 0), 2),
        "method": r.method,
        "status": r.pay_status,
        "retry_count": int(r.retry_count or 0),
        "suggested_retry": retry_window(r.retry_count),
    } for _, r in rows.head(limit).iterrows()]

    return {
        "at_risk_payments": records,
        "count": len(records),
        "mrr_recoverable": round(recovered_at_risk, 2),
    }
