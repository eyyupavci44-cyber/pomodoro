import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null); // User info decoded or fetched
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if token exists and is valid (simple check)
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            // Ideally fetch user profile here using the token
            // fetchProfile(storedToken); 
            // For MVP, we'll just assume logged in if token exists
        }
        setLoading(false);
    }, []);

    const login = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
