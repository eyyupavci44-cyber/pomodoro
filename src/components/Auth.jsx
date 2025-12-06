import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/variables.css';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const API_URL = 'http://localhost:8000';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Register
        if (!isLogin) {
            try {
                const res = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ username, password })
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.detail || 'Registration failed');
                }
                alert("Registration successful! Please login.");
                setIsLogin(true);
            } catch (err) {
                setError(err.message);
            }
        } else {
            // Login
            try {
                const res = await fetch(`${API_URL}/auth/token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ username, password })
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.detail || 'Login failed');
                }
                const data = await res.json();
                login(data.access_token);
            } catch (err) {
                setError(err.message);
            }
        }
    };

    return (
        <div className="glass-panel" style={{ maxWidth: '400px', margin: '100px auto', padding: '40px', textAlign: 'center' }}>
            <h2>{isLogin ? 'Welcome Back' : 'Join PomodZone'}</h2>
            {error && <div style={{ color: '#ff4444', marginBottom: '10px' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="text" placeholder="Username" required
                    value={username} onChange={(e) => setUsername(e.target.value)}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)' }}
                />
                <input
                    type="password" placeholder="Password" required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)' }}
                />
                <button className="btn btn-primary" type="submit">
                    {isLogin ? 'Login' : 'Register'}
                </button>
            </form>

            <div style={{ marginTop: '20px', fontSize: '0.9rem' }}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span
                    style={{ color: 'var(--secondary)', cursor: 'pointer', fontWeight: 'bold' }}
                    onClick={() => setIsLogin(!isLogin)}
                >
                    {isLogin ? 'Sign Up' : 'Login'}
                </span>
            </div>
        </div>
    );
};

export default Auth;
