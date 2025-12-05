from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, col
from database import get_session
from models import User, Friend
from routers.auth import get_current_user

router = APIRouter(prefix="/social", tags=["social"])

@router.post("/friend/{friend_username}")
def add_friend(
    friend_username: str,
    user: Annotated[User, Depends(get_current_user)],
    session: Session = Depends(get_session)
):
    if friend_username == user.username:
        raise HTTPException(status_code=400, detail="Cannot add yourself as friend")
        
    friend_user = session.exec(select(User).where(User.username == friend_username)).first()
    if not friend_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if existing friendship
    existing = session.exec(select(Friend).where(
        col(Friend.user_id) == user.id, 
        col(Friend.friend_id) == friend_user.id
    )).first()
    
    if existing:
        return {"message": "Friend request already sent or active"}
        
    new_friendship = Friend(user_id=user.id, friend_id=friend_user.id, status="accepted") # Auto/accept for MVP
    # Also add reverse for bidirectional simplified
    reverse_friendship = Friend(user_id=friend_user.id, friend_id=user.id, status="accepted")
    
    session.add(new_friendship)
    session.add(reverse_friendship)
    session.commit()
    return {"message": f"Added {friend_username} as friend"}

@router.get("/leaderboard")
def get_leaderboard(
    user: Annotated[User, Depends(get_current_user)],
    session: Session = Depends(get_session)
):
    # Get all friends
    friend_ids = session.exec(select(Friend.friend_id).where(Friend.user_id == user.id)).all()
    friend_ids.append(user.id) # Include self
    
    # Get users sorted by XP
    users = session.exec(select(User).where(col(User.id).in_(friend_ids)).order_by(col(User.xp).desc())).all()
    
    return [
        {"username": u.username, "xp": u.xp, "level": u.level} for u in users
    ]
