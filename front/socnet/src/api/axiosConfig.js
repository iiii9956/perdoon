import axios from 'axios';

// Если явно задан VITE_API_URL — используем его, иначе пустая строка (запросы идут через Vite proxy без CORS)
const API_URL = import.meta.env.VITE_API_URL || '';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url || '';

        // Разлогиниваем только при отказе на базовых эндпоинтах профиля/ленты
        const isCoreAuthCheck = url.includes('/api/users/me') || url.includes('/api/posts/feed');

        if (status === 401 && isCoreAuthCheck) {
            localStorage.removeItem('jwt_token');
            if (window.location.pathname !== '/auth') {
                window.location.href = '/auth';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
