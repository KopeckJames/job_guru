from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime
from enum import Enum


class JobApplicationStatus(str, Enum):
    applied = "applied"
    interviewing = "interviewing"
    rejected = "rejected"
    offered = "offered"
    accepted = "accepted"


class JobPostingBase(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    description: Optional[str] = None
    salary_range: Optional[str] = None
    job_type: Optional[str] = None
    remote: bool = False
    url: str
    source: str
    external_id: str
    posted_at: Optional[datetime] = None


class JobPostingCreate(JobPostingBase):
    pass


class JobPostingResponse(JobPostingBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True


class JobApplicationBase(BaseModel):
    job_posting_id: int
    resume_id: int
    cover_letter: Optional[str] = None


class JobApplicationCreate(JobApplicationBase):
    pass


class JobApplicationResponse(JobApplicationBase):
    id: int
    user_id: int
    status: str
    applied_at: datetime
    notes: Optional[str] = None
    follow_up_date: Optional[datetime] = None
    
    class Config:
        orm_mode = True


class JobSearchQuery(BaseModel):
    query: str
    location: Optional[str] = None
    job_type: Optional[str] = None
    experience_level: Optional[str] = None
    remote: Optional[bool] = None
    limit: int = 20
