import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'user' | 'stakeholder' | 'admin';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string, role: UserRole) => Promise<void>;
    register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Use the same API URL pattern as client.ts
const API_URL = import.meta.env.VITE_API_URL || 'https://mujconnect-3lj9.onrender.com/api';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    const login = async (email: string, password: string, role: UserRole) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store JWT token securely
        localStorage.setItem('urban_token', data.token);
        localStorage.setItem('urban_auth', JSON.stringify(data.user));
        setUser(data.user);
    };

    const register = async (name: string, email: string, password: string, role: UserRole) => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        // Store JWT token securely
        localStorage.setItem('urban_token', data.token);
        localStorage.setItem('urban_auth', JSON.stringify(data.user));
        setUser(data.user);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('urban_auth');
        localStorage.removeItem('urban_token');
    };

    // Restore session on load — validate token with backend
    React.useEffect(() => {
        const restoreSession = async () => {
            const token = localStorage.getItem('urban_token');
            if (!token) {
                // Also clear any stale user data
                localStorage.removeItem('urban_auth');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                    localStorage.setItem('urban_auth', JSON.stringify(data.user));
                } else {
                    // Token is invalid or expired — clear everything
                    localStorage.removeItem('urban_auth');
                    localStorage.removeItem('urban_token');
                }
            } catch {
                // Network error — fall back to cached user for offline resilience
                const stored = localStorage.getItem('urban_auth');
                if (stored) {
                    try {
                        setUser(JSON.parse(stored));
                    } catch {
                        localStorage.removeItem('urban_auth');
                        localStorage.removeItem('urban_token');
                    }
                }
            }
        };

        restoreSession();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
