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
    login: (email: string, role: UserRole) => Promise<void>;
    register: (name: string, email: string, role: UserRole) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    const generateId = (email: string) => {
        let hash = 0;
        for (let i = 0; i < email.length; i++) {
            const char = email.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return "user_" + Math.abs(hash).toString(36);
    };

    const login = async (email: string, role: UserRole) => {
        // Mock login delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Create mock user based on role with deterministic ID
        const mockUser: User = {
            id: generateId(email),
            name: email.split('@')[0] || 'User',
            email,
            role,
        };

        setUser(mockUser);
        localStorage.setItem('urban_auth', JSON.stringify(mockUser));
    };

    const register = async (name: string, email: string, role: UserRole) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const mockUser: User = {
            id: generateId(email),
            name,
            email,
            role,
        };
        setUser(mockUser);
        localStorage.setItem('urban_auth', JSON.stringify(mockUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('urban_auth');
    };

    // Restore session on load
    React.useEffect(() => {
        const stored = localStorage.getItem('urban_auth');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem('urban_auth');
            }
        }
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
