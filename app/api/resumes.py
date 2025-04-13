from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.user import User
from app.models.resume import Resume, ResumeVersion
from app.schemas.resume import (
    ResumeCreate,
    ResumeResponse,
    ResumeVersionCreate,
    ResumeVersionResponse,
    ResumeAnalysis
)
from app.api.auth import get_current_user
from app.services.resume_service import analyze_resume, generate_resume, optimize_resume

router = APIRouter()


@router.post("/", response_model=ResumeResponse)
async def create_resume(
    resume_data: ResumeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new resume"""
    # Create new resume
    db_resume = Resume(
        title=resume_data.title,
        description=resume_data.description,
        target_job=resume_data.target_job,
        target_company=resume_data.target_company,
        industry=resume_data.industry,
        user_id=current_user.id
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    
    return db_resume


@router.get("/", response_model=List[ResumeResponse])
async def get_resumes(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all resumes for current user"""
    resumes = db.query(Resume).filter(
        Resume.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return resumes


@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get resume by ID"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    return resume


@router.post("/{resume_id}/versions", response_model=ResumeVersionResponse)
async def create_resume_version(
    resume_id: int,
    version_data: ResumeVersionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new version of a resume"""
    # Check if resume exists and belongs to user
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Create new version
    db_version = ResumeVersion(
        resume_id=resume_id,
        content=version_data.content,
        version_name=version_data.version_name,
        format=version_data.format,
        is_active=version_data.is_active
    )
    db.add(db_version)
    
    # If this version is active, deactivate other versions
    if version_data.is_active:
        db.query(ResumeVersion).filter(
            ResumeVersion.resume_id == resume_id,
            ResumeVersion.id != db_version.id
        ).update({"is_active": False})
    
    db.commit()
    db.refresh(db_version)
    
    return db_version


@router.get("/{resume_id}/versions", response_model=List[ResumeVersionResponse])
async def get_resume_versions(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all versions of a resume"""
    # Check if resume exists and belongs to user
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    versions = db.query(ResumeVersion).filter(
        ResumeVersion.resume_id == resume_id
    ).all()
    
    return versions


@router.post("/upload", response_model=ResumeAnalysis)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload and analyze a resume"""
    # Check file type
    if file.content_type not in ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be PDF or Word document"
        )
    
    # Read file content
    content = await file.read()
    
    # Analyze resume
    analysis = analyze_resume(content, file.filename)
    
    return analysis


@router.post("/{resume_id}/generate", response_model=ResumeVersionResponse)
async def generate_resume_version(
    resume_id: int,
    job_description: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a new resume version optimized for a job description"""
    # Check if resume exists and belongs to user
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Get active version
    active_version = db.query(ResumeVersion).filter(
        ResumeVersion.resume_id == resume_id,
        ResumeVersion.is_active == True
    ).first()
    
    if not active_version:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active resume version found"
        )
    
    # Generate optimized resume
    optimized_content = optimize_resume(active_version.content, job_description)
    
    # Create new version
    db_version = ResumeVersion(
        resume_id=resume_id,
        content=optimized_content,
        version_name=f"Optimized for job - {resume.target_job}",
        format=active_version.format,
        is_active=False
    )
    db.add(db_version)
    db.commit()
    db.refresh(db_version)
    
    return db_version


@router.post("/generate-from-scratch", response_model=ResumeResponse)
async def generate_resume_from_scratch(
    job_title: str,
    skills: List[str],
    experience: str,
    education: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a complete resume from scratch"""
    # Generate resume content
    resume_content = generate_resume(
        job_title=job_title,
        skills=skills,
        experience=experience,
        education=education
    )
    
    # Create new resume
    db_resume = Resume(
        title=f"Resume for {job_title}",
        description="Generated resume",
        target_job=job_title,
        industry="",
        user_id=current_user.id
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    
    # Create initial version
    db_version = ResumeVersion(
        resume_id=db_resume.id,
        content=resume_content,
        version_name="Initial version",
        format="markdown",
        is_active=True
    )
    db.add(db_version)
    db.commit()
    
    return db_resume
