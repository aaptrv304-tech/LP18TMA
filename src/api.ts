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
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch businesses');
    }
    return response.json();
};

export const fetchActivity = async (): Promise<{ activities: Activity[] }> => {
    const url = getAPIUrl('/api/activity');
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch activity');
    }
    return response.json();
};

export const fetchAchievements = async (): Promise<{ achievements: Achievement[] }> => {
    const url = getAPIUrl('/api/achievements');
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch achievements');
    }
    return response.json();
};

export const fetchRecommendations = async (): Promise<{ recommendations: Recommendation[] }> => {
    const url = getAPIUrl('/api/recommendations');
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
    }
    return response.json();
};

// Проверка подключения к бэкенду
export const checkBackendHealth = async (): Promise<boolean> => {
    try {
        const url = getAPIUrl('/health');
        const response = await fetch(url);
        return response.ok;
    } catch (error) {
        console.error('Backend health check failed:', error);
        return false;
    }
};