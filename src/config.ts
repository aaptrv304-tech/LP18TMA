// Конфигурация API
export const API_CONFIG = {
    // Твой ngrok URL
    baseURL: 'https://cleveland-cant-jpeg-initiative.trycloudflare.com',
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