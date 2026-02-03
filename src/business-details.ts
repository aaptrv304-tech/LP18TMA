// src/business-details.ts

import type { Business } from './api'; // ← type-only import

// Объявляем глобальные функции из main.ts
declare function showLoader(show: boolean): void;
declare function showError(message: string): void;

export let currentBusiness: Business | null = null;
let cachedBusinessDetailsHTML: string | null = null;

// Загрузка и показ деталей заведения
export const showBusinessDetails = async (business: Business) => {
    currentBusiness = business;



    const screen = document.getElementById('business-details-screen');
    if (!screen) {
        console.error('❌ #business-details-screen not found in DOM!');
        showError('Ошибка: контейнер деталей не найден');
        return;
    }

    showLoader(true);

    try {
        if (!cachedBusinessDetailsHTML) {
            const response = await fetch('/business-details.html');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            cachedBusinessDetailsHTML = await response.text();
        }

        screen.innerHTML = cachedBusinessDetailsHTML;
        setupBusinessDetailsContent(business);
        screen.classList.remove('hidden');
    } catch (error) {
        console.error('❌ Error loading business details:', error);
        showError('Не удалось загрузить детали заведения');
    } finally {
        showLoader(false);
    }
};

// Настройка контента под конкретное заведение
const setupBusinessDetailsContent = (business: Business) => {
    // Обновляем название
    const title = document.querySelector('#business-details-screen h1');
    if (title) title.textContent = business.name;

    // Обновляем инициал
    const initial = document.querySelector('#business-details-screen .w-20.h-20');
    if (initial) initial.textContent = business.initial;

    // Обновляем категорию
    const categoryBadge = document.querySelector('#business-details-screen .px-2.py-1');
    if (categoryBadge) {
        categoryBadge.innerHTML = `<span>${business.category_emoji}</span><span>${business.category}</span>`;
    }

    // Обновляем баллы
    const pointsElement = document.querySelector('#business-details-screen .text-2xl.font-bold:nth-child(2)');
    if (pointsElement) pointsElement.textContent = business.points.toString();

    // Обновляем прогресс
    const progressBar = document.querySelector('#business-details-screen [style*="width"]');
    if (progressBar) {
        progressBar.setAttribute('style', `width: ${business.progress_percent}%`);
    }

    // Обновляем текст прогресса
    const progressText = Array.from(document.querySelectorAll('#business-details-screen .text-xs'))
        .find(el => el.textContent?.includes('баллов'));
    if (progressText) {
        progressText.textContent = `${business.points} из ${business.points + business.points_to_reward} баллов`;
    }

    // Обновляем "До награды"
    const rewardText = document.querySelector('#business-details-screen .text-primary.text-sm.font-bold');
    if (rewardText) {
        rewardText.textContent = `${business.points_to_reward} баллов`;
    }

    // Обновляем последний визит
    const lastVisit = document.querySelector('#business-details-screen .text-textPrimary.text-sm.font-semibold');
    if (lastVisit) {
        lastVisit.textContent = business.last_visit;
    }

    // Кнопка "Назад"
    const backBtn = document.getElementById('back-from-details');
    if (backBtn) {
        backBtn.onclick = hideBusinessDetails;
    }

    // Кнопка "Избранное"
    const favBtn = document.getElementById('favorite-details');
    if (favBtn) {
        const icon = favBtn.querySelector('i');
        if (icon) {
            if (business.is_favorite) {
                icon.className = 'fa-solid fa-star text-yellow-400 text-lg';
            } else {
                icon.className = 'fa-regular fa-star text-gray-400 text-lg';
            }
        }

        favBtn.onclick = () => {
            if (!currentBusiness) return;
            currentBusiness.is_favorite = !currentBusiness.is_favorite;

            const iconEl = favBtn.querySelector('i');
            if (iconEl) {
                if (currentBusiness.is_favorite) {
                    iconEl.className = 'fa-solid fa-star text-yellow-400 text-lg';
                } else {
                    iconEl.className = 'fa-regular fa-star text-gray-400 text-lg';
                }
            }
        };
    }
};

// Скрытие деталей
export const hideBusinessDetails = () => {
    const screen = document.getElementById('business-details-screen');
    if (!screen) return;

    screen.classList.add('hidden');
    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.scrollTop = 0;
};