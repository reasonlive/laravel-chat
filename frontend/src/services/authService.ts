import { apiService } from './api';
import { AuthResponse, LoginData, RegisterData, User, ApiResponse } from '../types';

class AuthService {
    public async login(credentials: LoginData): Promise<AuthResponse> {
        const response = await apiService.getClient().post<AuthResponse>('/auth/login', credentials);
        return response.data;
    }

    public async register(userData: RegisterData): Promise<AuthResponse> {
        const response = await apiService.getClient().post<ApiResponse<AuthResponse>>('/auth/register', userData);
        return response.data.data;
    }

    public async logout(): Promise<void> {
        await apiService.getClient().post('/auth/logout');
        localStorage.removeItem('auth_token');
    }

    public async getCurrentUser(): Promise<User> {
        const response = await apiService.getClient().get<ApiResponse<User>>('/auth/user');
        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.error);
    }

    public async updateProfile(userData: Partial<User>): Promise<User> {
        const response = await apiService.getClient().put<ApiResponse<User>>('/auth/profile', userData);
        return response.data.data;
    }

    public async refreshToken(): Promise<AuthResponse> {
        const response = await apiService.getClient().post<ApiResponse<AuthResponse>>('/auth/refresh-token');
        return response.data.data;
    }
}

export const authService = new AuthService();
