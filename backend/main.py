from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from classes import *
from routers import qc_controller
from db.repositories.qc_case import get_cases_count_by_status
from database import get_session

app = FastAPI()

origins = [
    "https://qc-dashboard-8fq5.vercel.app",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/dashboard", response_model=DashboardData)
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
            "not_resampled": cases_count_dict.get(1, 0),
            "for_investigation": cases_count_dict.get(2, 0),
            "resolved": cases_count_dict.get(3, 0)
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

@app.get("/")
async def root():
    return {"message": "QC Dashboard API"}

app.include_router(qc_controller.router)
