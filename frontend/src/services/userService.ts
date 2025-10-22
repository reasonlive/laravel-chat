import { apiService } from './api';
import { User, ApiResponse } from '../types';

class UserService {
    public async getUsers(): Promise<User[]> {
        const response = await apiService.getClient().get<ApiResponse<User[]>>('/users');
        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.error)
    }

    public async searchUsers(query: string): Promise<User[]> {
        const response = await apiService.getClient().get<ApiResponse<User[]>>('/users/search', {
            params: { query },
        });

        return response.data.data;
    }

    public async updateOnlineStatus(status: 'online' | 'offline' | 'away'): Promise<User> {
        const response = await apiService.getClient().post<ApiResponse<User>>('/users/status', {
            status,
        });

        return response.data.data;
    }
}

export const userService = new UserService();
