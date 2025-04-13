from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.user import User
from app.models.question import Question, QuestionCategory
from app.schemas.question import (
    QuestionCreate,
    QuestionResponse,
    QuestionCategoryCreate,
    QuestionCategoryResponse,
    QuestionAnswerCreate,
    QuestionAnswerResponse
)
from app.api.auth import get_current_user
from app.services.ai_service import generate_answer

router = APIRouter()


@router.post("/categories", response_model=QuestionCategoryResponse)
async def create_category(
    category_data: QuestionCategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new question category"""
    # Check if admin for global categories
    if not category_data.is_personal and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create global categories"
        )
    
    # Create new category
    db_category = QuestionCategory(
        name=category_data.name,
        description=category_data.description,
        is_personal=category_data.is_personal,
        user_id=current_user.id if category_data.is_personal else None
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    
    return db_category


@router.get("/categories", response_model=List[QuestionCategoryResponse])
async def get_categories(
    include_global: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all question categories (global and personal)"""
    query = db.query(QuestionCategory)
    
    if include_global:
        query = query.filter(
            (QuestionCategory.is_personal == False) | 
            (QuestionCategory.user_id == current_user.id)
        )
    else:
        query = query.filter(QuestionCategory.user_id == current_user.id)
    
    categories = query.all()
    return categories


@router.post("/", response_model=QuestionResponse)
async def create_question(
    question_data: QuestionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new question"""
    # Check if admin for global questions
    if not question_data.is_personal and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create global questions"
        )
    
    # Check if category exists
    category = db.query(QuestionCategory).filter(QuestionCategory.id == question_data.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Create new question
    db_question = Question(
        text=question_data.text,
        difficulty=question_data.difficulty,
        category_id=question_data.category_id,
        is_personal=question_data.is_personal,
        user_id=current_user.id if question_data.is_personal else None
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    
    return db_question


@router.get("/", response_model=List[QuestionResponse])
async def get_questions(
    category_id: Optional[int] = None,
    difficulty: Optional[str] = None,
    include_global: bool = True,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get questions with optional filtering"""
    query = db.query(Question)
    
    # Filter by category
    if category_id:
        query = query.filter(Question.category_id == category_id)
    
    # Filter by difficulty
    if difficulty:
        query = query.filter(Question.difficulty == difficulty)
    
    # Include global and personal questions
    if include_global:
        query = query.filter(
            (Question.is_personal == False) | 
            (Question.user_id == current_user.id)
        )
    else:
        query = query.filter(Question.user_id == current_user.id)
    
    questions = query.offset(skip).limit(limit).all()
    return questions


@router.get("/{question_id}", response_model=QuestionResponse)
async def get_question(
    question_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get question by ID"""
    question = db.query(Question).filter(Question.id == question_id).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Check if user has access to this question
    if question.is_personal and question.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return question


@router.post("/{question_id}/answer", response_model=QuestionAnswerResponse)
async def generate_question_answer(
    question_id: int,
    answer_data: QuestionAnswerCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate AI answer for a question"""
    question = db.query(Question).filter(Question.id == question_id).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Generate answer using AI
    answer_text = generate_answer(
        question=question.text,
        context=answer_data.context,
        experience_level=answer_data.experience_level,
        job_title=answer_data.job_title
    )
    
    return {
        "question_id": question_id,
        "answer": answer_text,
        "context": answer_data.context,
        "experience_level": answer_data.experience_level,
        "job_title": answer_data.job_title
    }
