from typing import Annotated, List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from datetime import datetime, timedelta
from database import get_session
from models import PomodoroSession, User
from routers.auth import get_current_user

router = APIRouter(prefix="/timer", tags=["timer"])

@router.post("/session", response_model=PomodoroSession)
def log_session(
    session_data: PomodoroSession, 
    user: Annotated[User, Depends(get_current_user)],
    session: Session = Depends(get_session)
):
    session_data.user_id = user.id
    session_data.start_time = datetime.utcnow()
    
    # Update Streak
    today = datetime.utcnow().date()
    if user.last_active_date:
        last_date = user.last_active_date.date()
        if last_date == today - timedelta(days=1):
            user.streak_days += 1
        elif last_date != today:
            user.streak_days = 1 # Reset if missed a day or first time today (if we ignored today check above?)
            # Wait, if last_date == today, do nothing. If last_date < today - 1, reset.
            if last_date < today - timedelta(days=1):
                user.streak_days = 1
    else:
        user.streak_days = 1
    
    user.last_active_date = datetime.utcnow()

    # Update user XP based on duration (simple logic: 1 min = 1 XP)
    if session_data.status == "completed" and session_data.type == "work":
        # Bonus for focus
        focus_bonus = max(0, 10 - session_data.distractions) 
        user.xp += session_data.duration_minutes + focus_bonus
        
        # Level up logic (every 100 XP)
        new_level = 1 + (user.xp // 100)
        if new_level > user.level:
            user.level = new_level
            # Could trigger badge here

    session.add(session_data)
    session.add(user)
    session.commit()
    session.refresh(session_data)
    return session_data

@router.get("/stats")
def get_stats(
    user: Annotated[User, Depends(get_current_user)],
    session: Session = Depends(get_session)
):
    # Today's stats
    today = datetime.utcnow().date()
    start_of_day = datetime.combine(today, datetime.min.time())
    
    statement = select(PomodoroSession).where(
        PomodoroSession.user_id == user.id,
        PomodoroSession.start_time >= start_of_day
    )
    todays_sessions = session.exec(statement).all()
    
    total_work_minutes = sum(s.duration_minutes for s in todays_sessions if s.type == "work")
    total_break_minutes = sum(s.duration_minutes for s in todays_sessions if "break" in s.type)
    completed_sessions = sum(1 for s in todays_sessions if s.type == "work" and s.status == "completed")
    
    return {
        "total_work_minutes": total_work_minutes,
        "total_break_minutes": total_break_minutes,
        "completed_count": completed_sessions,
        "current_level": user.level,
        "current_xp": user.xp
    }
