from sqlalchemy import Boolean, Column, Integer, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class QuestionCategory(Base):
    __tablename__ = "question_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    is_personal = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    questions = relationship("Question", back_populates="category")
    
    def __repr__(self):
        return f"<QuestionCategory {self.name}>"


class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    difficulty = Column(String)  # easy, medium, hard
    category_id = Column(Integer, ForeignKey("question_categories.id"))
    is_personal = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    category = relationship("QuestionCategory", back_populates="questions")
    answers = relationship("QuestionAnswer", back_populates="question")
    
    def __repr__(self):
        return f"<Question {self.id}: {self.text[:30]}...>"


class QuestionAnswer(Base):
    __tablename__ = "question_answers"
    
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    answer_text = Column(Text, nullable=False)
    is_ai_generated = Column(Boolean, default=False)
    context = Column(Text)
    experience_level = Column(String)
    job_title = Column(String)
    rating = Column(Integer)  # 1-5
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    question = relationship("Question", back_populates="answers")
    
    def __repr__(self):
        return f"<QuestionAnswer {self.id} for Question {self.question_id}>"
