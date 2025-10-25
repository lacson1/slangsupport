import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../services/apiService';

interface User {
    id: string;
    email: string;
    username: string;
    createdAt: string;
    preferences?: {
        autoSpeak: boolean;
        theme: 'dark' | 'light';
        lastWordOfDay: string;
        lastWordOfDayDate: string;
    };
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (email: string, username: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    updateProfile: (data: { username?: string; email?: string }) => Promise<{ success: boolean; error?: string }>;
    deleteAccount: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user;

    useEffect(() => {
        // Check if user is already logged in
        const checkAuth = async () => {
            try {
                const response = await apiClient.getProfile();
                if (response.data) {
                    setUser(response.data.user);
                }
            } catch (error) {
                // User not authenticated
                apiClient.clearToken();
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await apiClient.login(email, password);
            if (response.data) {
                apiClient.setToken(response.data.token);
                setUser(response.data.user);
                return { success: true };
            } else {
                return { success: false, error: response.error || 'Login failed' };
            }
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    };

    const register = async (email: string, username: string, password: string) => {
        try {
            const response = await apiClient.register(email, username, password);
            if (response.data) {
                apiClient.setToken(response.data.token);
                setUser(response.data.user);
                return { success: true };
            } else {
                return { success: false, error: response.error || 'Registration failed' };
            }
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    };

    const logout = () => {
        apiClient.clearToken();
        setUser(null);
    };

    const updateProfile = async (data: { username?: string; email?: string }) => {
        try {
            const response = await apiClient.updateProfile(data);
            if (response.data) {
                setUser(prev => prev ? { ...prev, ...response.data.user } : null);
                return { success: true };
            } else {
                return { success: false, error: response.error || 'Update failed' };
            }
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    };

    const deleteAccount = async () => {
        try {
            const response = await apiClient.deleteAccount();
            if (response.data) {
                apiClient.clearToken();
                setUser(null);
                return { success: true };
            } else {
                return { success: false, error: response.error || 'Delete failed' };
            }
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                login,
                register,
                logout,
                updateProfile,
                deleteAccount,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
