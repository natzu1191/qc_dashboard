from sqlalchemy import func, case
from sqlmodel import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from db.models.qc_case_model import QC_Case, QCCreate, QCUpdate

async def create_qc_case(db: AsyncSession, qc_case_create: QCCreate) -> QC_Case:
    qc_case = QC_Case.model_validate(qc_case_create)
    db.add(qc_case)
    await db.commit()
    await db.refresh(qc_case)
    return qc_case

async def get_qc_case(db: AsyncSession, qc_case_id: str) -> QC_Case:
    statement = select(QC_Case).where(QC_Case.id == qc_case_id)
    result = await db.execute(statement)
    return result.scalars().all()

async def update_qc_case(db: AsyncSession, qc_case_update: QCUpdate) -> QC_Case:
    result = await db.execute(select(QC_Case).where(QC_Case.code == qc_case_update.code))
    qc_case = result.scalars().first()
    if qc_case:
        for key, value in qc_case_update.dict(exclude_unset=True).items():
            setattr(qc_case, key, value)
        await db.commit()
        await db.refresh(qc_case)
    return qc_case

async def get_all_cases(db: AsyncSession) -> list[QC_Case]:
    statement = select(QC_Case)
    result = await db.execute(statement)
    return result.scalars().all()
async def get_all_cases_by_status(status: int, db: AsyncSession) -> list[QC_Case]:
    statement = select(QC_Case).where(QC_Case.status == status)
    result = await db.execute(statement)
    return result.scalars().all()

async def get_cases_count_by_status(db: AsyncSession) -> dict[int, int]:
    statement = select(QC_Case.status, func.count(QC_Case.id)).group_by(QC_Case.status)
    result = await db.execute(statement)
    return dict(result.all())

async def get_resample_percentage_by_month(db: AsyncSession) -> list[dict]:
    statement = (
        select(
            func.extract('month', QC_Case.date).label('month_num'),
            func.count(QC_Case.id).label('total'),
            func.sum(case((QC_Case.status == 1, 1), else_=0)).label('resampled')
        )
        .group_by(func.extract('month', QC_Case.date))
        .order_by(func.extract('month', QC_Case.date))
    )
    result = await db.execute(statement)
    rows = result.all()
    month_full = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December']
    return [
        {
            "month": month_full[int(row.month_num) - 1],
            "percentage": round(row.resampled / row.total * 100) if row.total else 0
        }
        for row in rows
    ]

async def get_customer_complaints_by_month(db: AsyncSession) -> list[dict]:
    statement = (
        select(
            func.extract('month', QC_Case.date).label('month_num'),
            func.count(QC_Case.id).label('count')
        )
        .group_by(func.extract('month', QC_Case.date))
        .order_by(func.extract('month', QC_Case.date))
    )
    result = await db.execute(statement)
    rows = result.all()
    month_abbr = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    return [
        {"month": f"{month_abbr[int(row.month_num) - 1]}-{row.count}", "count": row.count}
        for row in rows
    ]

async def get_qs_ratings_by_current_month(db: AsyncSession) -> dict:
    now = func.now()
    current_month = func.extract('month', now)
    current_year = func.extract('year', now)
    conditions = ['Formula', 'Process', 'FBC', 'Material']
    results = []
    for condition in conditions:
        statement = (
            select(func.count(QC_Case.id))
            .where(
                func.extract('month', QC_Case.date) == current_month,
                func.extract('year', QC_Case.date) == current_year,
                QC_Case.disposition_conditions.contains(condition)
            )
        )
        result = await db.execute(statement)
        count = result.scalar() or 0
        results.append({"feedback": condition.upper(), "value": count})
    month_full = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December']
    from datetime import datetime
    month_name = month_full[datetime.now().month - 1]
    return {"month": month_name, "ratings": results}

async def get_quality_issues_by_month(db: AsyncSession) -> list[dict]:
    statement = (
        select(
            func.extract('month', QC_Case.date).label('month_num'),
            func.count(QC_Case.id).label('count')
        )
        .group_by(func.extract('month', QC_Case.date))
        .order_by(func.extract('month', QC_Case.date))
    )
    result = await db.execute(statement)
    rows = result.all()
    month_abbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return [
        {"month": month_abbr[int(row.month_num) - 1], "count": row.count}
        for row in rows
    ]