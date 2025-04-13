from sqlalchemy import Boolean, Column, Integer, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    target_job = Column(String)
    target_company = Column(String)
    industry = Column(String)
    is_public = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    versions = relationship("ResumeVersion", back_populates="resume")
    
    def __repr__(self):
        return f"<Resume {self.title}>"


class ResumeVersion(Base):
    __tablename__ = "resume_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    version_name = Column(String)
    content = Column(Text, nullable=False)
    format = Column(String)  # markdown, html, pdf, docx
    file_url = Column(String)
    ats_score = Column(Integer)  # 0-100
    feedback = Column(JSON)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    resume = relationship("Resume", back_populates="versions")
    
    def __repr__(self):
        return f"<ResumeVersion {self.id} for Resume {self.resume_id}>"


class ResumeSection(Base):
    __tablename__ = "resume_sections"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_version_id = Column(Integer, ForeignKey("resume_versions.id"))
    section_type = Column(String)  # summary, experience, education, skills, etc.
    title = Column(String)
    content = Column(Text)
    order = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<ResumeSection {self.section_type} for Version {self.resume_version_id}>"
