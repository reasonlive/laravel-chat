import { type FC, type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ChatPage } from './pages/ChatPage';
import { UsersPage } from './pages/UsersPage';
import { MainLayout } from './components/layout/MainLayout';

const ProtectedRoute: FC<{ children: ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    return user ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: FC<{ children: ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    return !user ? <>{children}</> : <Navigate to="/chat" />;
};

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                } />
                <Route path="/register" element={
                    <PublicRoute>
                        <RegisterPage />
                    </PublicRoute>
                } />
                <Route path="/" element={
                    <ProtectedRoute>
                        <MainLayout>
                            <ChatPage />
                        </MainLayout>
                    </ProtectedRoute>
                } />
                <Route path="/chat" element={
                    <ProtectedRoute>
                        <MainLayout>
                            <ChatPage />
                        </MainLayout>
                    </ProtectedRoute>
                } />
                <Route path="/users" element={
                    <ProtectedRoute>
                        <MainLayout>
                            <UsersPage />
                        </MainLayout>
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
}
