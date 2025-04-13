from sqlalchemy import Boolean, Column, Integer, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class Interview(Base):
    __tablename__ = "interviews"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    job_title = Column(String)
    company = Column(String)
    industry = Column(String)
    difficulty = Column(String)  # easy, medium, hard
    is_public = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    sessions = relationship("InterviewSession", back_populates="interview")
    questions = relationship("InterviewQuestion", back_populates="interview")
    
    def __repr__(self):
        return f"<Interview {self.title}>"


class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String)  # scheduled, in_progress, completed, interrupted
    scheduled_at = Column(DateTime(timezone=True))
    started_at = Column(DateTime(timezone=True))
    ended_at = Column(DateTime(timezone=True))
    duration_seconds = Column(Integer)
    notes = Column(Text)
    feedback = Column(JSON)
    recording_url = Column(String)
    transcript = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    interview = relationship("Interview", back_populates="sessions")
    responses = relationship("InterviewResponse", back_populates="session")
    
    def __repr__(self):
        return f"<InterviewSession {self.id} for Interview {self.interview_id}>"


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"))
    text = Column(Text, nullable=False)
    category = Column(String)
    difficulty = Column(String)  # easy, medium, hard
    order = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    interview = relationship("Interview", back_populates="questions")
    responses = relationship("InterviewResponse", back_populates="question")
    
    def __repr__(self):
        return f"<InterviewQuestion {self.id}: {self.text[:30]}...>"


class InterviewResponse(Base):
    __tablename__ = "interview_responses"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"))
    question_id = Column(Integer, ForeignKey("interview_questions.id"))
    response_text = Column(Text)
    ai_feedback = Column(Text)
    score = Column(Integer)  # 1-10
    start_time = Column(Integer)  # seconds from start of session
    end_time = Column(Integer)  # seconds from start of session
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    session = relationship("InterviewSession", back_populates="responses")
    question = relationship("InterviewQuestion", back_populates="responses")
    
    def __repr__(self):
        return f"<InterviewResponse {self.id} for Question {self.question_id}>"
