from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class ResumeBase(BaseModel):
    title: str
    description: Optional[str] = None
    target_job: Optional[str] = None
    target_company: Optional[str] = None
    industry: Optional[str] = None


class ResumeCreate(ResumeBase):
    pass


class ResumeResponse(ResumeBase):
    id: int
    user_id: int
    is_public: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True


class ResumeVersionBase(BaseModel):
    version_name: str
    content: str
    format: str
    is_active: bool = True


class ResumeVersionCreate(ResumeVersionBase):
    pass


class ResumeVersionResponse(ResumeVersionBase):
    id: int
    resume_id: int
    file_url: Optional[str] = None
    ats_score: Optional[int] = None
    feedback: Optional[Dict[str, Any]] = None
    created_at: datetime
    
    class Config:
        orm_mode = True


class ResumeSectionBase(BaseModel):
    section_type: str
    title: str
    content: str
    order: int


class ResumeSectionCreate(ResumeSectionBase):
    pass


class ResumeSectionResponse(ResumeSectionBase):
    id: int
    resume_version_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True


class ResumeAnalysis(BaseModel):
    ats_score: int
    keyword_match: Dict[str, float]
    missing_keywords: List[str]
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]
    parsed_sections: Dict[str, Any]
