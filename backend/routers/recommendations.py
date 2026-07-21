"""Recommendation, playbook, segment and payment-retry endpoints (Pillar 3, Fn 1.3)."""
from fastapi import APIRouter

from backend.schemas import ok, fail
from backend.services import recommend

router = APIRouter(prefix="/api", tags=["recommendations"])


@router.get("/customers/{customer_id}/recommendations")
def customer_recommendations(customer_id: str):
    """Plan right-size + next best action for one customer (Fn 3.1, 3.2)."""
    recs = recommend.recommendations_for(customer_id)
    return ok(recs, count=len(recs))


@router.get("/playbooks")
def playbooks(limit: int = 60):
    """Portfolio retention playbooks for the Actions board (Fn 3.2)."""
    cards = recommend.playbooks(limit=limit)
    return ok(cards, count=len(cards))


@router.get("/segments")
def segments():
    """Per-segment health / risk / MRR rollups (Fn 1.3)."""
    return ok(recommend.segment_rollups())


@router.get("/payments/at-risk")
def payments_at_risk(limit: int = 40):
    """Failed / expiring payments + suggested retry timing (Fn 3.3)."""
    return ok(recommend.payments_at_risk(limit=limit))
