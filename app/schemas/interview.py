from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class InterviewBase(BaseModel):
    title: str
    description: Optional[str] = None
    job_title: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    difficulty: Optional[str] = None


class InterviewCreate(InterviewBase):
    generate_questions: Optional[bool] = False
    num_questions: Optional[int] = None


class InterviewResponse(InterviewBase):
    id: int
    user_id: int
    is_public: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True


class InterviewQuestionBase(BaseModel):
    text: str
    category: Optional[str] = None
    difficulty: Optional[str] = None
    order: Optional[int] = None


class InterviewQuestionCreate(InterviewQuestionBase):
    pass


class InterviewQuestionResponse(InterviewQuestionBase):
    id: int
    interview_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True


class InterviewSessionBase(BaseModel):
    scheduled_at: Optional[datetime] = None
    notes: Optional[str] = None


class InterviewSessionCreate(InterviewSessionBase):
    pass


class InterviewSessionResponse(InterviewSessionBase):
    id: int
    interview_id: int
    user_id: int
    status: str
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    recording_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True


class InterviewResponseBase(BaseModel):
    response_text: str
    start_time: Optional[int] = None
    end_time: Optional[int] = None


class InterviewResponseCreate(InterviewResponseBase):
    question_id: int


class InterviewResponseUpdate(BaseModel):
    ai_feedback: Optional[str] = None
    score: Optional[int] = None


class InterviewResponseResponse(InterviewResponseBase):
    id: int
    session_id: int
    question_id: int
    ai_feedback: Optional[str] = None
    score: Optional[int] = None
    created_at: datetime
    
    class Config:
        orm_mode = True


class InterviewFeedback(BaseModel):
    overall_score: int
    strengths: List[str]
    areas_for_improvement: List[str]
    detailed_feedback: Dict[str, Any]
    recommendations: List[str]
