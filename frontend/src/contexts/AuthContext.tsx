import { type FC, type ReactNode, createContext, useEffect, useState } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (userData: Partial<User>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('auth_token');

            if (token) {
                try {
                    const userData = await authService.getCurrentUser();
                    setUser(userData);
                } catch (error) {
                    console.log(error)
                    localStorage.removeItem('auth_token');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const authResponse = await authService.login({ email, password });
        localStorage.setItem('auth_token', authResponse.token);
        setUser(authResponse.user);
    };

    const register = async (name: string, email: string, password: string) => {
        const authResponse = await authService.register({
            name,
            email,
            password,
            password_confirmation: password,
        });
        localStorage.setItem('auth_token', authResponse.token);
        setUser(authResponse.user);
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    const updateProfile = async (userData: Partial<User>) => {
        const updatedUser = await authService.updateProfile(userData);
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
