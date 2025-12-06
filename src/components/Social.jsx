import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8000';

const Social = () => {
    const [friends, setFriends] = useState([]);
    const { token } = useAuth();

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const res = await fetch(`${API_URL}/social/leaderboard`);
            if (res.ok) {
                const data = await res.json();
                // Map backend data to frontend structure if needed
                // Backend returns List[User] which has username, xp, level
                setFriends(data.map(u => ({
                    ...u,
                    status: 'offline' // No real status tracking yet
                })));
            }
        } catch (e) { console.error(e); }
    };

    const addFriend = async (e) => {
        e.preventDefault();
        const username = e.target.elements[0].value;
        if (!username || !token) return;

        try {
            const res = await fetch(`${API_URL}/social/friends/${username}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) alert("Friend added!");
            else alert("Failed to add friend");
        } catch (e) { console.error(e); }
    };

    const getStatusColor = (s) => {
        if (s === 'focusing') return 'var(--primary)';
        if (s === 'online') return '#4CAF50';
        return 'var(--text-muted)';
    };

    return (
        <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ margin: 0 }}>Community Leaderboard</h2>
                <div style={{ fontSize: '2rem' }}>🏆</div>
            </div>

            {/* Add Friend Input */}
            <form onSubmit={addFriend} style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                <input type="text" placeholder="Add friend by username..." style={{
                    flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)',
                    background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', fontSize: '1rem'
                }} />
                <button className="btn btn-primary">Add Friend</button>
            </form>

            {/* Leaderboard Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--glass-border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '16px' }}>Rank</th>
                            <th style={{ padding: '16px' }}>User</th>
                            <th style={{ padding: '16px' }}>Status</th>
                            <th style={{ padding: '16px' }}>Level</th>
                            <th style={{ padding: '16px', textAlign: 'right' }}>XP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {friends.sort((a, b) => b.xp - a.xp).map((friend, idx) => (
                            <tr key={idx} style={{
                                borderBottom: '1px solid var(--glass-border)',
                                transition: 'background 0.2s'
                            }} className="hover:bg-white/5">
                                <td style={{ padding: '16px', fontWeight: 'bold' }}>
                                    {idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : `#${idx + 1}`))}
                                </td>
                                <td style={{ padding: '16px', fontWeight: 600 }}>{friend.username}</td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
                                        background: getStatusColor(friend.status), marginRight: '8px'
                                    }}></span>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{friend.status}</span>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        background: 'var(--glass-border)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem'
                                    }}>Lvl {friend.level}</span>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold', color: 'var(--secondary)' }}>{friend.xp}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Social;
