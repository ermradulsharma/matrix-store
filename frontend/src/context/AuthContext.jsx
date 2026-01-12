import React, { createContext, useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser, getUserProfile } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load user from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('authUser');
        const token = localStorage.getItem('authToken');
        if (stored && token) {
            setUser(JSON.parse(stored));
            // Optionally fetch fresh user data from backend
            fetchUserProfile();
        }
    }, []);

    // Persist user to localStorage
    useEffect(() => {
        if (user) {
            localStorage.setItem('authUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('authUser');
        }
    }, [user]);

    const fetchUserProfile = async () => {
        try {
            const response = await getUserProfile();
            if (response.success) {
                setUser(response.user);
            }
        } catch (e) {
            console.error('Error fetching user profile:', e);
            // If token is invalid, clear auth state
            if (e.response?.status === 401) {
                setUser(null);
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
            }
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await loginUser(email, password);
            if (response.success && response.user) {
                setUser(response.user);
                return { success: true, user: response.user };
            } else {
                const errorMsg = response.message || 'Login failed';
                setError(errorMsg);
                return { success: false, error: errorMsg };
            }
        } catch (e) {
            const errorMsg = e.response?.data?.message || 'Login failed. Please try again.';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await logoutUser();
        } catch (e) {
            console.error('Logout error:', e);
        } finally {
            setUser(null);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await registerUser(userData);
            if (response.success && response.user) {
                setUser(response.user);
                return { success: true, user: response.user };
            } else {
                const errorMsg = response.message || 'Registration failed';
                setError(errorMsg);
                return { success: false, error: errorMsg };
            }
        } catch (e) {
            const errorMsg = e.response?.data?.message || 'Registration failed. Please try again.';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        logout,
        register,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => React.useContext(AuthContext);

export default AuthProvider;
