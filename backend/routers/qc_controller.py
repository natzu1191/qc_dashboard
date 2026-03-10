import json
from fastapi import APIRouter, Depends, Form, HTTPException
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from dto.request_dto import CreateCaseRequest, UpdateCaseRequest
from db.models.qc_case_model import QC_Case, QCCreate, QCUpdate
from db.repositories.qc_case import create_qc_case, get_all_cases_by_status, get_cases_count_by_status, get_qc_case, update_qc_case, get_all_cases
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
    qc_case_update = QCUpdate(
        code=data.code,
        # batch_number=data.batch_number,
        # reason=data.reason,
        actual=data.actual,
        standard=data.standard,
        status=data.status,
        qc_disposition=data.qc_disposition,
        notes=data.notes
    )
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

    return {
        "quality_issues": [
            {"month": "Jan", "count": 4},
            {"month": "Feb", "count": 7},
            {"month": "Mar", "count": 6},
            {"month": "Apr", "count": 5},
            {"month": "May", "count": 3}
        ],
        "disable_rates": [
            {"month": "January", "percentage": 25},
            {"month": "February", "percentage": 65},
            {"month": "March", "percentage": 55},
            {"month": "April", "percentage": 60}
        ],
        "pending_resamples": {
            "not_resampled": cases_count_dict.get(1),
            "for_investigation": cases_count_dict.get(2),
            "resolved": cases_count_dict.get(3)
        },
        "qs_ratings": [
            {"feedback": "FORMULA", "value": 85},
            {"feedback": "PROCESS", "value": 78},
            {"feedback": "FBC", "value": 92},
            {"feedback": "MATERIAL", "value": 88}
        ],
        "customer_complaints": [
            {"month": "JAN-5", "count": 5},
            {"month": "FEB-3", "count": 3},
            {"month": "MAR-2", "count": 2},
            {"month": "APR-0", "count": 0}
        ],
        "year": 2026
    }
