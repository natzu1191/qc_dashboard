from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class QualityIssue(BaseModel):
    month: str
    count: int

class DisableRate(BaseModel):
    month: str
    percentage: int

class PendingResamples(BaseModel):
    not_resampled: int
    for_investigation: int
    resolved: int

class QsRating(BaseModel):
    feedback: str
    value: int

class CustomerComplaint(BaseModel):
    month: str
    count: int

class DashboardData(BaseModel):
    quality_issues: List[QualityIssue]
    disable_rates: List[DisableRate]
    pending_resamples: PendingResamples
    qs_ratings: List[QsRating]
    customer_complaints: List[CustomerComplaint]
    year: int

# Placeholder data
@app.get("/api/dashboard", response_model=DashboardData)
async def get_dashboard_data():
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
            "not_resampled": 150,
            "for_investigation": 5,
            "resolved": 8
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
