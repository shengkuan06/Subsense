"""Shared response envelope: { success, data, error, meta }."""
from typing import Any, Optional

from pydantic import BaseModel

class Envelope(BaseModel):
    success: bool = True
    data: Any = None
    error: Optional[str] = None
    meta: dict = {}

def ok(data, **meta):
    return {"success": True, "data": data, "error": None, "meta": meta}

def fail(message: str):
    return {"success": False, "data": None, "error": message, "meta": {}}