from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Optional

class CreateCaseRequest(BaseModel):
    date: str
    code: str
    batch_number: str
    reason: str
    actual: str
    standard: str
class UpdateCaseRequest(BaseModel):
    # date: Optional[str] = None
    code: Optional[str] = None
    # batch_number: Optional[str] = None
    # reason: Optional[str] = None
    actual: Optional[str] = None
    standard: Optional[str] = None
    status: Optional[int] = None
    qc_disposition: Optional[str] = None
    notes: Optional[str] = None