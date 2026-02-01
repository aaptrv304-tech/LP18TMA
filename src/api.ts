import { getAPIUrl } from './config';

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

// Функции для получения данных
export const fetchBusinesses = async (): Promise<BusinessResponse> => {
    const url = getAPIUrl('/api/businesses');
    console.log('📡 Запрос к:', url);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        mode: 'cors',
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
};

export const fetchActivity = async (): Promise<{ activities: Activity[] }> => {
    const url = getAPIUrl('/api/activity');
    console.log('📡 Запрос к:', url);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        mode: 'cors',
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
};

export const fetchAchievements = async (): Promise<{ achievements: Achievement[] }> => {
    const url = getAPIUrl('/api/achievements');
    console.log('📡 Запрос к:', url);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        mode: 'cors',
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
};

export const fetchRecommendations = async (): Promise<{ recommendations: Recommendation[] }> => {
    const url = getAPIUrl('/api/recommendations');
    console.log('📡 Запрос к:', url);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        mode: 'cors',
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
};

// Проверка подключения к бэкенду
export const checkBackendHealth = async (): Promise<boolean> => {
    try {
        const url = getAPIUrl('/health');
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
        });
        return response.ok;
    } catch (error) {
        console.error('Backend health check failed:', error);
        return false;
    }
};