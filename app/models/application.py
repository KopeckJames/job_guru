from sqlalchemy import Boolean, Column, Integer, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class JobPosting(Base):
    __tablename__ = "job_postings"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String)
    description = Column(Text)
    salary_range = Column(String)
    job_type = Column(String)  # full-time, part-time, contract, etc.
    remote = Column(Boolean, default=False)
    url = Column(String, nullable=False)
    source = Column(String)  # linkedin, indeed, etc.
    external_id = Column(String)
    posted_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    applications = relationship("JobApplication", back_populates="job_posting")
    
    def __repr__(self):
        return f"<JobPosting {self.title} at {self.company}>"


class JobApplication(Base):
    __tablename__ = "job_applications"
    
    id = Column(Integer, primary_key=True, index=True)
    job_posting_id = Column(Integer, ForeignKey("job_postings.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    cover_letter = Column(Text)
    status = Column(String)  # applied, interviewing, rejected, offered, accepted
    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(Text)
    follow_up_date = Column(DateTime(timezone=True))
    
    # Relationships
    job_posting = relationship("JobPosting", back_populates="applications")
    
    def __repr__(self):
        return f"<JobApplication {self.id} for Job {self.job_posting_id}>"
