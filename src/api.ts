import { getAPIUrl } from './config';

// Получаем данные из Telegram WebApp
const getTelegramInitData = (): string | null => {
    if (window.Telegram?.WebApp) {
        return window.Telegram.WebApp.initData;
    }
    return null;
};

// Типы данных
export interface Business {
    id: number;
    name: string;
    initial: string;
    category: string;
    category_emoji: string;
    address: string;
    distance: string;
    points: number;
    last_visit: string;
    progress_percent: number;
    points_to_reward: number;
    is_favorite: boolean;
    has_reward: boolean;
    badge: string;
}

export interface UserStats {
    total_points: number;
    total_businesses: number;
    total_visits: number;
    total_rewards: number;
}

export interface BusinessResponse {
    businesses: Business[];
    stats: UserStats;
}

export interface Activity {
    id: number;
    business_id: number;
    business_name: string;
    type: string;
    points: number;
    date: string;
    icon: string;
    color: string;
}

export interface Achievement {
    id: number;
    name: string;
    icon: string;
    is_locked: boolean;
}

export interface Recommendation {
    id: number;
    name: string;
    initial: string;
    category: string;
    category_emoji: string;
    distance: string;
    bonus_points: number;
}

// Базовый фетчер с авторизацией
const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const initData = getTelegramInitData();

    const headers = {
        'Content-Type': 'application/json',
        ...(initData && { 'X-Telegram-Init-Data': initData }),
        ...options.headers,
    };

    return fetch(url, {
        ...options,
        headers,
    });
};

// Функции для получения данных
export const fetchBusinesses = async (): Promise<BusinessResponse> => {
    const url = getAPIUrl('/api/businesses');
    console.log('📡 [fetchBusinesses] Запрос к:', url);

    try {
        const response = await apiFetch(url);
        console.log('📡 [fetchBusinesses] Статус:', response.status);

        const text = await response.text();
        console.log('📡 [fetchBusinesses] Тело ответа (первые 500 символов):', text.substring(0, 500));

        if (!response.ok) {
            console.error('❌ [fetchBusinesses] Ошибка ответа:', text);
            throw new Error(`HTTP ${response.status}: ${text.substring(0, 200)}`);
        }

        try {
            const data = JSON.parse(text);
            console.log('✅ [fetchBusinesses] JSON успешно распарсен:', data);
            return data;
        } catch (parseError) {
            console.error('❌ [fetchBusinesses] Ошибка парсинга JSON:', parseError);
            console.error('❌ [fetchBusinesses] Невалидный текст:', text);
            throw new Error(`Невалидный JSON: ${text.substring(0, 200)}`);
        }
    } catch (error: any) {
        console.error('❌ [fetchBusinesses] Общая ошибка:', error);
        throw error;
    }
};

export const fetchActivity = async (): Promise<{ activities: Activity[] }> => {
    const url = getAPIUrl('/api/activity');
    console.log('📡 Запрос к:', url);

    const response = await apiFetch(url);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
};

export const fetchAchievements = async (): Promise<{ achievements: Achievement[] }> => {
    const url = getAPIUrl('/api/achievements');
    console.log('📡 Запрос к:', url);

    const response = await apiFetch(url);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
};

export const fetchRecommendations = async (): Promise<{ recommendations: Recommendation[] }> => {
    const url = getAPIUrl('/api/recommendations');
    console.log('📡 Запрос к:', url);

    const response = await apiFetch(url);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
};

// Проверка подключения к бэкенду
export const checkBackendHealth = async (): Promise<boolean> => {
    try {
        const url = getAPIUrl('/health');
        const response = await apiFetch(url);
        return response.ok;
    } catch (error) {
        console.error('Backend health check failed:', error);
        return false;
    }
};

