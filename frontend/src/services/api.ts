import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { message } from 'antd';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
export const getApiRootPath = () => {
    return API_BASE_URL.substring(0, API_BASE_URL.lastIndexOf('/'));
}

class ApiService {
    private readonly client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        if (!localStorage.getItem('csrf_token')) {
            (async () => {
                localStorage.setItem('csrf_token', await this.getCsrfToken());
            })()
        }

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request interceptor
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('auth_token');
                const csrfToken = localStorage.getItem('csrf_token');

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                if (csrfToken) {
                    config.headers['X-CSRF-TOKEN'] = csrfToken;
                }

                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response: AxiosResponse) => {
                return response;
            },
            async (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('auth_token');
                    window.location.href = '/login';
                }

                const errorMessage = error.response?.data?.error || error.response?.data?.message || 'An error occurred';
                message.error(errorMessage);

                return Promise.reject(error);
            }
        );
    }

    public async getCsrfToken(): Promise<string> {
        const response = await axios.get(
            getApiRootPath() + '/sanctum/csrf-cookie'
        );

        return response.data['csrf_token'];
    }

    public getClient(): AxiosInstance {
        return this.client;
    }
}

export const apiService = new ApiService();
