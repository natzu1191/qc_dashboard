from typing import Optional
from sqlalchemy import Column, DateTime, func
from sqlmodel import SQLModel, Field
from datetime import datetime, timezone
import uuid


class CustomerComplaintBase(SQLModel):
    date: datetime
    code: str
    batch_number: str
    reason: str
    qc_validation: str
    attachments: Optional[str] = None
    is_valid: bool
    updatedDate: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            nullable=False,
        ),
    )


class CustomerComplaint(CustomerComplaintBase, table=True):
    __tablename__ = "customer_complaint"
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    createdDate: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            nullable=False,
        ),
    )


class CustomerComplaintCreate(CustomerComplaintBase):
    pass


class CustomerComplaintUpdate(SQLModel):
    code: Optional[str] = None
    reason: Optional[str] = None
    qc_validation: Optional[str] = None
    attachments: Optional[str] = None
    is_valid: Optional[bool] = None
    updatedDate: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
