from pydantic import BaseModel
from typing import List
from datetime import datetime

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
