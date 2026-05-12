import os
import uuid
import datetime
from typing import List

import boto3
from botocore.config import Config
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from db.models.customer_complaint_model import (
    CustomerComplaint,
    CustomerComplaintCreate,
    CustomerComplaintUpdate,
)
from db.repositories.customer_complaint import (
    create_complaint,
    get_all_complaints,
    get_complaint,
    get_complaints_by_month,
    update_complaint,
)
from database import get_session

router = APIRouter(prefix="/complaints", tags=["Customer Complaints"])

# Supabase S3-compatible storage client
s3 = boto3.client(
    "s3",
    endpoint_url=os.getenv("SUPABASE_S3_ENDPOINT"),
    aws_access_key_id=os.getenv("SUPABASE_S3_ACCESS_KEY"),
    aws_secret_access_key=os.getenv("SUPABASE_S3_SECRET_KEY"),
    region_name="ap-southeast-1",
    config=Config(signature_version="s3v4"),
)
BUCKET = os.getenv("SUPABASE_S3_BUCKET", "qc_dash_bucket")

PRESIGNED_URL_EXPIRY = 3600  # 1 hour


async def upload_files_to_supabase(files: List[UploadFile]) -> list[str]:
    """Upload files and return a list of object keys (not full URLs)."""
    keys = []
    for file in files:
        if not file.filename:
            continue
        ext = os.path.splitext(file.filename)[1]
        object_key = f"complaints/{uuid.uuid4()}{ext}"
        content = await file.read()
        s3.put_object(
            Bucket=BUCKET,
            Key=object_key,
            Body=content,
            ContentType=file.content_type or "application/octet-stream",
        )
        keys.append(object_key)
    return keys


@router.get("/attachment-url")
async def get_attachment_url(key: str = Query(...)):
    """Generate a presigned URL for a private attachment."""
    try:
        url = s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": BUCKET, "Key": key},
            ExpiresIn=PRESIGNED_URL_EXPIRY,
        )
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate URL: {e}")


@router.post("/create", response_model=CustomerComplaint)
async def create_complaint_endpoint(
    date: str = Form(...),
    code: str = Form(...),
    batch_number: str = Form(...),
    reason: str = Form(...),
    qc_validation: str = Form(...),
    is_valid: bool = Form(...),
    files: List[UploadFile] = File(default=[]),
    db: AsyncSession = Depends(get_session),
):
    try:
        init_date = datetime.datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

    attachment_keys = await upload_files_to_supabase(files)

    complaint_data = CustomerComplaintCreate(
        date=init_date,
        code=code,
        batch_number=batch_number,
        reason=reason,
        qc_validation=qc_validation,
        is_valid=is_valid,
        attachments=",".join(attachment_keys) if attachment_keys else None,
    )
    return await create_complaint(db, complaint_data)


@router.get("/all", response_model=List[CustomerComplaint])
async def get_all_complaints_endpoint(db: AsyncSession = Depends(get_session)):
    return await get_all_complaints(db)


@router.get("/by-month")
async def get_complaints_by_month_endpoint(db: AsyncSession = Depends(get_session)):
    return await get_complaints_by_month(db)


@router.get("/{complaint_id}", response_model=CustomerComplaint)
async def get_complaint_endpoint(complaint_id: str, db: AsyncSession = Depends(get_session)):
    complaint = await get_complaint(db, complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint


@router.post("/update", response_model=CustomerComplaint)
async def update_complaint_endpoint(
    code: str = Form(...),
    reason: str = Form(None),
    qc_validation: str = Form(None),
    is_valid: bool = Form(None),
    files: List[UploadFile] = File(default=[]),
    db: AsyncSession = Depends(get_session),
):
    attachment_keys = await upload_files_to_supabase(files)

    update_data = CustomerComplaintUpdate(
        code=code,
        reason=reason,
        qc_validation=qc_validation,
        is_valid=is_valid,
        attachments=",".join(attachment_keys) if attachment_keys else None,
    )
    updated = await update_complaint(db, update_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return updated
