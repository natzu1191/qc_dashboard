from sqlalchemy import func
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from db.models.customer_complaint_model import (
    CustomerComplaint,
    CustomerComplaintCreate,
    CustomerComplaintUpdate,
)


async def create_complaint(db: AsyncSession, data: CustomerComplaintCreate) -> CustomerComplaint:
    complaint = CustomerComplaint.model_validate(data)
    db.add(complaint)
    await db.commit()
    await db.refresh(complaint)
    return complaint


async def get_complaint(db: AsyncSession, complaint_id: str) -> CustomerComplaint:
    statement = select(CustomerComplaint).where(CustomerComplaint.id == complaint_id)
    result = await db.execute(statement)
    return result.scalars().first()


async def update_complaint(
    db: AsyncSession, complaint_id: str, data: CustomerComplaintUpdate
) -> CustomerComplaint | None:
    result = await db.execute(
        select(CustomerComplaint).where(CustomerComplaint.id == complaint_id)
    )
    complaint = result.scalars().first()
    if complaint:
        for key, value in data.dict(exclude_unset=True).items():
            setattr(complaint, key, value)
        await db.commit()
        await db.refresh(complaint)
    return complaint


async def delete_complaint(db: AsyncSession, complaint_id: str) -> CustomerComplaint | None:
    """Delete a complaint and return the deleted row (so callers can clean up attachments)."""
    result = await db.execute(
        select(CustomerComplaint).where(CustomerComplaint.id == complaint_id)
    )
    complaint = result.scalars().first()
    if not complaint:
        return None
    await db.delete(complaint)
    await db.commit()
    return complaint


async def get_all_complaints(db: AsyncSession) -> list[CustomerComplaint]:
    statement = select(CustomerComplaint)
    result = await db.execute(statement)
    return result.scalars().all()


async def get_complaints_by_month(db: AsyncSession) -> list[dict]:
    statement = (
        select(
            func.extract("month", CustomerComplaint.date).label("month_num"),
            func.count(CustomerComplaint.id).label("count"),
        )
        .group_by(func.extract("month", CustomerComplaint.date))
        .order_by(func.extract("month", CustomerComplaint.date))
    )
    result = await db.execute(statement)
    rows = result.all()
    month_abbr = [
        "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
        "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
    ]
    return [
        {"month": month_abbr[int(row.month_num) - 1], "count": row.count}
        for row in rows
    ]
