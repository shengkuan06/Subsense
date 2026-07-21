"""Intervention tracking endpoints (Fn 3.2) — queue an action and track its outcome."""
from datetime import datetime
from typing import Optional

import pandas as pd
from fastapi import APIRouter
from pydantic import BaseModel

from backend.database import engine, SessionLocal
from backend.schemas import ok, fail
import backend.models as m

router = APIRouter(prefix="/api", tags=["interventions"])

VALID_PLAYBOOKS = {"pause_offer", "winback", "discount", "csm_outreach", "payment_retry"}
VALID_STATUS = {"suggested", "sent", "accepted", "declined"}


class InterventionIn(BaseModel):
    customer_id: str
    playbook: str
    status: str = "sent"
    outcome: Optional[str] = None


class InterventionUpdate(BaseModel):
    status: Optional[str] = None
    outcome: Optional[str] = None


@router.get("/interventions")
def list_interventions(customer_id: str = None, status: str = None):
    """Track intervention status / outcomes (Fn 3.2)."""
    df = pd.read_sql("SELECT * FROM interventions ORDER BY created_at DESC", engine)
    if customer_id:
        df = df[df.customer_id == customer_id]
    if status:
        df = df[df.status == status]
    return ok(df.to_dict(orient="records"), total=len(df))


@router.post("/interventions")
def create_intervention(body: InterventionIn):
    """Create / queue an intervention (Fn 3.2)."""
    if body.playbook not in VALID_PLAYBOOKS:
        return fail(f"Unknown playbook '{body.playbook}'")
    if body.status not in VALID_STATUS:
        return fail(f"Invalid status '{body.status}'")

    db = SessionLocal()
    try:
        exists = db.query(m.Customer).filter_by(customer_id=body.customer_id).first()
        if not exists:
            return fail("Customer not found")
        row = m.Intervention(
            customer_id=body.customer_id,
            playbook=body.playbook,
            status=body.status,
            created_at=datetime.now(),
            outcome=body.outcome,
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        return ok({
            "id": row.id,
            "customer_id": row.customer_id,
            "playbook": row.playbook,
            "status": row.status,
            "created_at": row.created_at.isoformat(),
            "outcome": row.outcome,
        })
    finally:
        db.close()


@router.patch("/interventions/{intervention_id}")
def update_intervention(intervention_id: int, body: InterventionUpdate):
    """Advance an intervention's status or record its outcome (Fn 3.2)."""
    if body.status and body.status not in VALID_STATUS:
        return fail(f"Invalid status '{body.status}'")

    db = SessionLocal()
    try:
        row = db.query(m.Intervention).filter_by(id=intervention_id).first()
        if not row:
            return fail("Intervention not found")
        if body.status:
            row.status = body.status
        if body.outcome is not None:
            row.outcome = body.outcome
        db.commit()
        db.refresh(row)
        return ok({
            "id": row.id,
            "customer_id": row.customer_id,
            "playbook": row.playbook,
            "status": row.status,
            "created_at": row.created_at.isoformat() if row.created_at else None,
            "outcome": row.outcome,
        })
    finally:
        db.close()
