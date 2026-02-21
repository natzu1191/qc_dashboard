from typing import Optional
from sqlalchemy import Column, DateTime, func, Index
from sqlmodel import SQLModel, Field
from datetime import datetime, timezone
import uuid

class QC_CaseBase(SQLModel):
    date: datetime
    code: str
    batch_number: str
    reason: str
    actual: str
    standard: str
    status: int
    updatedDate: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),  # DB-side default
            nullable=False
        ))
    qc_disposition: Optional[str] = None
    notes: Optional[str] = None

class QC_Case(QC_CaseBase, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    createdDate: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),  # Python-side default
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),  # DB-side default
            nullable=False
        )
    )
class QCCreate(QC_CaseBase):
    pass
class QCUpdate(SQLModel):
    date: Optional[datetime] = None
    code: Optional[str] = None
    batch_number: Optional[str] = None
    reason: Optional[str] = None
    actual: Optional[str] = None
    standard: Optional[str] = None
    status: Optional[int] = None
    qc_disposition: Optional[str] = None
    notes: Optional[str] = None
    updatedDate: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))