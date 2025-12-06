import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8000';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const { token } = useAuth();

    useEffect(() => {
        if (token) fetchTasks();
    }, [token]);

    const fetchTasks = async () => {
        try {
            const res = await fetch(`${API_URL}/tasks/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTasks(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const addTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim() || !token) return;

        try {
            const res = await fetch(`${API_URL}/tasks/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ title: newTask, is_completed: false, user_id: 0 })
            });
            if (res.ok) {
                const task = await res.json();
                setTasks([...tasks, task]);
                setNewTask('');
            }
        } catch (err) { console.error(err); }
    };

    const toggleTask = async (id, currentStatus, title) => {
        // Optimistic
        setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));

        try {
            await fetch(`${API_URL}/tasks/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ title: title, is_completed: !currentStatus, user_id: 0 })
            });
        } catch (e) { fetchTasks(); } // Revert on error
    };

    const deleteTask = async (id) => {
        setTasks(tasks.filter(t => t.id !== id));
        try {
            await fetch(`${API_URL}/tasks/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (e) { fetchTasks(); }
    };

    return (
        <div style={{ height: '100%', overflowY: 'auto' }}>
            <h3>Tasks</h3>
            <form onSubmit={addTask} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="New task..."
                    style={{
                        flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                        background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)'
                    }}
                />
                <button type="submit" className="btn btn-primary">+</button>
            </form>

            <ul style={{ listStyle: 'none', padding: 0 }}>
                {tasks.map(task => (
                    <li key={task.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px', marginBottom: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px',
                        textDecoration: task.is_completed ? 'line-through' : 'none',
                        opacity: task.is_completed ? 0.6 : 1, transition: 'all 0.2s'
                    }}>
                        <span onClick={() => toggleTask(task.id, task.is_completed, task.title)} style={{ cursor: 'pointer', flex: 1 }}>
                            {task.title}
                        </span>
                        <button onClick={() => deleteTask(task.id)} style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer' }}>
                            X
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TaskList;
