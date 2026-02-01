// Конфигурация API
export const API_CONFIG = {
    // Замени на свой ngrok URL
    baseURL: 'https://ramiro-unquestioned-semidependently.ngrok-free.dev',
    endpoints: {
        businesses: '/api/businesses',
        activity: '/api/activity',
        achievements: '/api/achievements',
        recommendations: '/api/recommendations',
        health: '/health'
    }
};

// Утилита для создания полного URL
export const getAPIUrl = (endpoint: string): string => {
    return `${API_CONFIG.baseURL}${endpoint}`;
};