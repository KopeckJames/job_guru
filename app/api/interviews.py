from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.user import User
from app.models.interview import Interview, InterviewSession
from app.schemas.interview import (
    InterviewCreate, 
    InterviewResponse, 
    InterviewSessionCreate,
    InterviewSessionResponse,
    InterviewFeedback
)
from app.api.auth import get_current_user
from app.services.interview_service import process_interview_feedback, generate_interview_questions

router = APIRouter()


@router.post("/", response_model=InterviewResponse)
async def create_interview(
    interview_data: InterviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new interview template"""
    # Create new interview
    db_interview = Interview(
        title=interview_data.title,
        description=interview_data.description,
        job_title=interview_data.job_title,
        company=interview_data.company,
        industry=interview_data.industry,
        difficulty=interview_data.difficulty,
        user_id=current_user.id
    )
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    
    # Generate questions if requested
    if interview_data.generate_questions:
        questions = generate_interview_questions(
            job_title=interview_data.job_title,
            industry=interview_data.industry,
            difficulty=interview_data.difficulty,
            num_questions=interview_data.num_questions or 10
        )
        # TODO: Save generated questions to database
    
    return db_interview


@router.get("/", response_model=List[InterviewResponse])
async def get_interviews(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all interviews for current user"""
    interviews = db.query(Interview).filter(
        Interview.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return interviews


@router.get("/{interview_id}", response_model=InterviewResponse)
async def get_interview(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get interview by ID"""
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()
    
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    return interview


@router.post("/{interview_id}/sessions", response_model=InterviewSessionResponse)
async def create_interview_session(
    interview_id: int,
    session_data: InterviewSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new interview session"""
    # Check if interview exists and belongs to user
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()
    
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    # Create new session
    db_session = InterviewSession(
        interview_id=interview_id,
        user_id=current_user.id,
        status="scheduled",
        scheduled_at=session_data.scheduled_at,
        notes=session_data.notes
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    
    return db_session


@router.get("/{interview_id}/sessions", response_model=List[InterviewSessionResponse])
async def get_interview_sessions(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all sessions for an interview"""
    # Check if interview exists and belongs to user
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()
    
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    sessions = db.query(InterviewSession).filter(
        InterviewSession.interview_id == interview_id
    ).all()
    
    return sessions


@router.post("/{interview_id}/sessions/{session_id}/feedback", response_model=InterviewFeedback)
async def submit_interview_feedback(
    interview_id: int,
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Process and generate feedback for an interview session"""
    # Check if session exists and belongs to user
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.interview_id == interview_id,
        InterviewSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
    
    # Process feedback
    feedback = process_interview_feedback(session_id)
    
    # Update session status
    session.status = "completed"
    db.commit()
    
    return feedback


@router.websocket("/ws/{interview_id}/{session_id}")
async def interview_websocket(
    websocket: WebSocket,
    interview_id: int,
    session_id: int,
    db: Session = Depends(get_db)
):
    """WebSocket endpoint for real-time interview assistance"""
    await websocket.accept()
    
    try:
        # Validate session
        session = db.query(InterviewSession).filter(
            InterviewSession.id == session_id,
            InterviewSession.interview_id == interview_id
        ).first()
        
        if not session:
            await websocket.send_json({"error": "Interview session not found"})
            await websocket.close()
            return
        
        # Update session status
        session.status = "in_progress"
        db.commit()
        
        # Main WebSocket loop
        while True:
            data = await websocket.receive_text()
            
            # Process the received data (e.g., transcription, question)
            # and generate AI response
            response = {
                "type": "suggestion",
                "content": "This is a placeholder for AI-generated interview assistance."
            }
            
            await websocket.send_json(response)
            
    except WebSocketDisconnect:
        # Handle disconnection
        pass
    finally:
        # Update session if still in progress
        session = db.query(InterviewSession).filter(
            InterviewSession.id == session_id
        ).first()
        
        if session and session.status == "in_progress":
            session.status = "interrupted"
            db.commit()
