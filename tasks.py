from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import Task, User
from routers.auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("/", response_model=Task)
def create_task(
    task: Task, 
    user: Annotated[User, Depends(get_current_user)],
    session: Session = Depends(get_session)
):
    task.user_id = user.id
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@router.get("/", response_model=List[Task])
def get_tasks(
    user: Annotated[User, Depends(get_current_user)],
    session: Session = Depends(get_session)
):
    return session.exec(select(Task).where(Task.user_id == user.id)).all()

@router.put("/{task_id}", response_model=Task)
def update_task(
    task_id: int,
    task_update: Task,
    user: Annotated[User, Depends(get_current_user)],
    session: Session = Depends(get_session)
):
    task = session.exec(select(Task).where(Task.id == task_id, Task.user_id == user.id)).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    task.title = task_update.title
    task.is_completed = task_update.is_completed
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    user: Annotated[User, Depends(get_current_user)],
    session: Session = Depends(get_session)
):
    task = session.exec(select(Task).where(Task.id == task_id, Task.user_id == user.id)).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    session.delete(task)
    session.commit()
    return {"message": "Task deleted"}
