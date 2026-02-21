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

async def update_qc_case(db: AsyncSession, qc_case_id: str, qc_case_update: QCUpdate) -> QC_Case:
    result = await db.execute(select(QC_Case).where(QC_Case.id == qc_case_id))
    qc_case = result.scalars().first()
    if qc_case:
        for key, value in qc_case_update.dict(exclude_unset=True).items():
            setattr(qc_case, key, value)
        await db.commit()
        await db.refresh(qc_case)
    return qc_case
