import json
from fastapi import APIRouter, Depends, Form, HTTPException
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from dto.request_dto import CreateCaseRequest, UpdateCaseRequest
from db.models.qc_case_model import QC_Case, QCCreate, QCUpdate
from db.repositories.qc_case import create_qc_case, get_all_cases_by_status, get_cases_count_by_status, get_qc_case, update_qc_case, get_all_cases, get_quality_issues_by_month, get_resample_percentage_by_month, get_customer_complaints_by_month, get_qs_ratings_by_current_month
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

@router.post("/updatecase")
async def update_qc_case_endpoint(data: UpdateCaseRequest, db: AsyncSession = Depends(get_session)):
    qc_case_update = QCUpdate(**data.model_dump(exclude_unset=True))
    updated_case = await update_qc_case(db, qc_case_update)
    if not updated_case:
        raise HTTPException(status_code=404, detail="QC Case not found")
    return updated_case
@router.get("/getallcases", response_model=List[QC_Case])
async def get_all_qc_cases(db: AsyncSession = Depends(get_session)):
    return await get_all_cases(db)
@router.get("/getcasesbystatus", response_model=List[QC_Case])
async def get_cases_by_status(status: int, db: AsyncSession = Depends(get_session)):
    return await get_all_cases_by_status(status, db)
@router.get("/getcasescountbystatus", response_model=dict[int, int])
async def get_cases_count(db: AsyncSession = Depends(get_session)):
    return await get_cases_count_by_status(db)
@router.get("/dashboard")
async def get_dashboard_data(db: AsyncSession = Depends(get_session)):
    cases_count_dict = await get_cases_count_by_status(db)
    quality_issues = await get_quality_issues_by_month(db)
    disable_rates = await get_resample_percentage_by_month(db)
    customer_complaints = await get_customer_complaints_by_month(db)
    qs_data = await get_qs_ratings_by_current_month(db)

    return {
        "quality_issues": quality_issues,
        "disable_rates": disable_rates,
        "pending_resamples": {
            "not_resampled": cases_count_dict.get(1, 0),
            "for_investigation": cases_count_dict.get(2, 0),
            "resolved": cases_count_dict.get(3, 0)
        },
        "qs_ratings": qs_data["ratings"],
        "qs_ratings_month": qs_data["month"],
        "customer_complaints": customer_complaints,
        "year": 2026
    }
