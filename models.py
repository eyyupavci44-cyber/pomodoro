from typing import Optional, List
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    hashed_password: str
    xp: int = Field(default=0)
    level: int = Field(default=1)
    streak_days: int = Field(default=0)
    last_active_date: Optional[datetime] = Field(default=None)
    
    sessions: List["PomodoroSession"] = Relationship(back_populates="user")
    tasks: List["Task"] = Relationship(back_populates="user")
    badges: List["Badge"] = Relationship(back_populates="user")

class PomodoroSession(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    start_time: datetime = Field(default_factory=datetime.utcnow)
    duration_minutes: int
    type: str  # "work", "short_break", "long_break"
    status: str # "completed", "interrupted"
    distractions: int = Field(default=0)
    
    user: User = Relationship(back_populates="sessions")

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    title: str
    is_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    user: User = Relationship(back_populates="tasks")

class Friend(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    friend_id: int = Field(foreign_key="user.id")
    status: str = Field(default="pending") # pending, accepted

class Badge(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    name: str
    earned_at: datetime = Field(default_factory=datetime.utcnow)
    
    user: User = Relationship(back_populates="badges")
