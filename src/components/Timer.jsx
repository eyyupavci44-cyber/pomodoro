import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Timer = () => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('work'); // work, short_break, long_break
    const [distractions, setDistractions] = useState(0);
    const { token } = useAuth();

    // Constants for SVG
    const size = 320;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    const totalTime = mode === 'work' ? 25 * 60 : (mode === 'short_break' ? 5 * 60 : 15 * 60);
    const progress = timeLeft / totalTime;
    const dashOffset = circumference - progress * circumference;

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && isActive && mode === 'work') {
                setDistractions(d => d + 1);
                document.title = "⚠️ Stick to the plan!";
            } else {
                document.title = "PomodZone";
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [isActive, mode]);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(t => t - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            handleTimerComplete();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const handleTimerComplete = async () => {
        new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play().catch(e => console.log(e));
        alert(`Session Complete! Distractions: ${distractions}`);

        // Log to backend
        try {
            if (token && mode === 'work') { // Only log work sessions for now? Or all? User said "study" but backend supports breaks too.
                await fetch('http://localhost:8000/timer/session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        duration_minutes: 25, // Mock for now, should calculate actual duration
                        type: mode,
                        status: 'completed',
                        distractions: distractions,
                        user_id: 0 // Ignored by backend
                    })
                });
            }
        } catch (e) { console.error("Failed to log session", e); }

        // Auto switch
        if (mode === 'work') {
            setMode('short_break');
            setTimeLeft(5 * 60);
        } else {
            setMode('work');
            setTimeLeft(25 * 60);
        }
        setDistractions(0);
    };

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'work' ? 25 * 60 : (mode === 'short_break' ? 5 * 60 : 15 * 60));
        setDistractions(0);
    };

    const changeMode = (newMode) => {
        setMode(newMode);
        setIsActive(false);
        setTimeLeft(newMode === 'work' ? 25 * 60 : (newMode === 'short_break' ? 5 * 60 : 15 * 60));
        setDistractions(0);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="glass-panel" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '40px', maxWidth: '500px', margin: '0 auto', gap: '30px'
        }}>
            {/* Mode Switcher */}
            <div style={{ display: 'flex', gap: '10px', background: 'var(--glass-border)', padding: '5px', borderRadius: '12px' }}>
                {['work', 'short_break', 'long_break'].map(m => (
                    <button
                        key={m}
                        onClick={() => changeMode(m)}
                        style={{
                            background: mode === m ? 'var(--primary)' : 'transparent',
                            color: mode === m ? 'white' : 'var(--text-main)',
                            border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                            textTransform: 'capitalize', fontWeight: 600, transition: 'all 0.3s'
                        }}
                    >
                        {m.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* SVG Timer */}
            <div style={{ position: 'relative', width: size, height: size }}>
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                    {/* Background Circle */}
                    <circle
                        cx={size / 2} cy={size / 2} r={radius}
                        stroke="var(--glass-border)" strokeWidth={strokeWidth} fill="transparent"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx={size / 2} cy={size / 2} r={radius}
                        stroke={mode === 'work' ? 'var(--primary)' : 'var(--secondary)'}
                        strokeWidth={strokeWidth} fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
                    />
                </svg>
                {/* Time Text */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ fontSize: '5rem', fontWeight: 700, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                        {formatTime(timeLeft)}
                    </div>
                    <div style={{ marginTop: '10px', color: 'var(--text-muted)', fontSize: '1.2rem' }}>
                        {isActive ? 'FOCUSING' : 'READY?'}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '20px' }}>
                <button className="btn btn-primary" onClick={toggleTimer} style={{ minWidth: '120px', fontSize: '1.2rem' }}>
                    {isActive ? 'PAUSE' : 'START'}
                </button>
                <button className="btn btn-ghost" onClick={resetTimer}>
                    RESET
                </button>
            </div>

            {distractions > 0 && (
                <div style={{ color: '#ffaaa5', background: 'rgba(255,0,0,0.1)', padding: '8px 16px', borderRadius: '8px' }}>
                    ⚠️ {distractions} Distractions Detected
                </div>
            )}
        </div>
    );
};

export default Timer;
