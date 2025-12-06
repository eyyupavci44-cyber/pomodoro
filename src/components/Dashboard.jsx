import React from 'react';
import TaskList from './TaskList';

const Dashboard = () => {
    // Mock Stats - to be connected to backend later
    const stats = {
        total_work: 1250, // minutes
        level: 7,
        xp: 750,
        next_level_xp: 1000,
        streak: 5
    };

    const weekData = [
        { day: 'Mon', mins: 45 },
        { day: 'Tue', mins: 120 },
        { day: 'Wed', mins: 90 },
        { day: 'Thu', mins: 160 },
        { day: 'Fri', mins: 30 },
        { day: 'Sat', mins: 0 },
        { day: 'Sun', mins: 0 },
    ];

    const maxVal = Math.max(...weekData.map(d => d.mins), 1);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

            {/* Left Column: Stats & Charts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Profile Card */}
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', fontWeight: 'bold', color: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}>
                        {stats.level}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ marginBottom: '8px' }}>Level {stats.level} Master</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <span>{stats.xp} XP</span>
                            <span>{stats.next_level_xp} XP</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${(stats.xp / stats.next_level_xp) * 100}%`, height: '100%',
                                background: 'var(--secondary)', borderRadius: '4px'
                            }}></div>
                        </div>
                        <div style={{ marginTop: '12px', fontSize: '0.9rem' }}>
                            🔥 {stats.streak} Day Streak!
                        </div>
                    </div>
                </div>

                {/* Chart Card */}
                <div className="glass-panel" style={{ padding: '24px', flex: 1 }}>
                    <h3 style={{ marginBottom: '20px' }}>Weekly Focus</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '180px', gap: '12px' }}>
                        {weekData.map((d, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '100%',
                                    height: `${(d.mins / maxVal) * 100}%`,
                                    background: d.mins > 0 ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                    borderRadius: '6px',
                                    transition: 'height 0.4s ease',
                                    minHeight: '4px',
                                    opacity: 0.8
                                }}></div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Right Column: Tasks */}
            <div className="glass-panel" style={{ padding: '24px', minHeight: '400px' }}>
                <TaskList />
            </div>

        </div>
    );
};

export default Dashboard;
