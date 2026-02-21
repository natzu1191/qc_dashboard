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