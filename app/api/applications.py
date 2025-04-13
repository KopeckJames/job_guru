from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.user import User
from app.models.application import JobApplication, JobPosting
from app.schemas.application import (
    JobPostingCreate,
    JobPostingResponse,
    JobApplicationCreate,
    JobApplicationResponse,
    JobApplicationStatus,
    JobSearchQuery
)
from app.api.auth import get_current_user
from app.services.job_service import search_jobs, apply_to_job

router = APIRouter()


@router.post("/search", response_model=List[JobPostingResponse])
async def search_job_postings(
    search_query: JobSearchQuery,
    current_user: User = Depends(get_current_user)
):
    """Search for job postings across platforms"""
    job_results = search_jobs(
        query=search_query.query,
        location=search_query.location,
        job_type=search_query.job_type,
        experience_level=search_query.experience_level,
        remote=search_query.remote,
        limit=search_query.limit
    )
    
    return job_results


@router.post("/postings", response_model=JobPostingResponse)
async def create_job_posting(
    posting_data: JobPostingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save a job posting"""
    # Check if posting already exists
    existing_posting = db.query(JobPosting).filter(
        JobPosting.external_id == posting_data.external_id,
        JobPosting.source == posting_data.source
    ).first()
    
    if existing_posting:
        return existing_posting
    
    # Create new job posting
    db_posting = JobPosting(
        title=posting_data.title,
        company=posting_data.company,
        location=posting_data.location,
        description=posting_data.description,
        salary_range=posting_data.salary_range,
        job_type=posting_data.job_type,
        remote=posting_data.remote,
        url=posting_data.url,
        source=posting_data.source,
        external_id=posting_data.external_id,
        posted_at=posting_data.posted_at
    )
    db.add(db_posting)
    db.commit()
    db.refresh(db_posting)
    
    return db_posting


@router.get("/postings", response_model=List[JobPostingResponse])
async def get_job_postings(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get saved job postings"""
    postings = db.query(JobPosting).offset(skip).limit(limit).all()
    return postings


@router.post("/apply", response_model=JobApplicationResponse)
async def apply_to_job_posting(
    application_data: JobApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Apply to a job posting"""
    # Check if posting exists
    posting = db.query(JobPosting).filter(JobPosting.id == application_data.job_posting_id).first()
    if not posting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found"
        )
    
    # Check if already applied
    existing_application = db.query(JobApplication).filter(
        JobApplication.job_posting_id == application_data.job_posting_id,
        JobApplication.user_id == current_user.id
    ).first()
    
    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already applied to this job"
        )
    
    # Apply to job
    application_result = apply_to_job(
        job_url=posting.url,
        resume_id=application_data.resume_id,
        cover_letter=application_data.cover_letter,
        user_id=current_user.id
    )
    
    # Create application record
    db_application = JobApplication(
        job_posting_id=application_data.job_posting_id,
        user_id=current_user.id,
        resume_id=application_data.resume_id,
        cover_letter=application_data.cover_letter,
        status="applied" if application_result["success"] else "failed",
        notes=application_result.get("notes", "")
    )
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    
    return db_application


@router.get("/applications", response_model=List[JobApplicationResponse])
async def get_job_applications(
    status: Optional[JobApplicationStatus] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's job applications"""
    query = db.query(JobApplication).filter(JobApplication.user_id == current_user.id)
    
    if status:
        query = query.filter(JobApplication.status == status)
    
    applications = query.offset(skip).limit(limit).all()
    return applications


@router.put("/applications/{application_id}/status", response_model=JobApplicationResponse)
async def update_application_status(
    application_id: int,
    status: JobApplicationStatus,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update job application status"""
    application = db.query(JobApplication).filter(
        JobApplication.id == application_id,
        JobApplication.user_id == current_user.id
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    application.status = status
    db.commit()
    db.refresh(application)
    
    return application
