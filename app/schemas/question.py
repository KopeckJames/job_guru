from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class QuestionCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_personal: bool = True


class QuestionCategoryCreate(QuestionCategoryBase):
    pass


class QuestionCategoryResponse(QuestionCategoryBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        orm_mode = True


class QuestionBase(BaseModel):
    text: str
    difficulty: Optional[str] = None
    category_id: int
    is_personal: bool = True


class QuestionCreate(QuestionBase):
    pass


class QuestionResponse(QuestionBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        orm_mode = True


class QuestionAnswerBase(BaseModel):
    context: Optional[str] = None
    experience_level: Optional[str] = None
    job_title: Optional[str] = None


class QuestionAnswerCreate(QuestionAnswerBase):
    pass


class QuestionAnswerResponse(QuestionAnswerBase):
    question_id: int
    answer: str
    
    class Config:
        orm_mode = True
