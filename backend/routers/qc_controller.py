import json
from fastapi import APIRouter, Depends, Form, HTTPException
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from dto.request_dto import CreateCaseRequest
from db.models.qc_case_model import QC_Case, QCCreate, QCUpdate
from db.repositories.qc_case import create_qc_case, get_qc_case, update_qc_case
from database import get_session
import datetime

router = APIRouter(prefix="/qc_cases", tags=["QC Cases"])

@router.post("/createcase", response_model=QC_Case)
async def create_qc_case_endpoint(data: CreateCaseRequest, db: AsyncSession = Depends(get_session)):
    try:
        init_date = datetime.datetime.strptime(data.date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")
    qc_case_create = QCCreate(
        date=init_date,
        code=data.code,
        batch_number=data.batch_number,
        reason=data.reason,
        actual=data.actual,
        standard=data.standard,
        status=1
    )
    return await create_qc_case(db, qc_case_create)

@router.post("/getcase", response_model=List[QC_Case])
async def get_qc_case_endpoint(qc_case_id: int = Form(...), db: AsyncSession = Depends(get_session)):
    qc_cases = await get_qc_case(db, qc_case_id)
    if not qc_cases:
        raise HTTPException(status_code=404, detail="QC Case not found")
    return qc_cases