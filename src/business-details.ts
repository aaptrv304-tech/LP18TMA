import type { Business } from './api';
import { fetchBusinessDetails } from './api'; // ← ИМПОРТИРУЕМ НОВУЮ ФУНКЦИЮ

// Объявляем глобальные функции из main.ts
declare function showLoader(show: boolean): void;
declare function showError(message: string): void;

export let currentBusiness: Business | null = null;
let cachedBusinessDetailsHTML: string | null = null;

// Загрузка и показ деталей заведения
export const showBusinessDetails = async (business: Business) => {
    currentBusiness = business;

    // 🔥 ПРОВЕРКА НАЛИЧИЯ shop_param 🔥
    if (!business.shop_param) {
        console.error('❌ Business shop_param is missing!');
        showError('Ошибка: не удалось определить заведение');
        return;
    }

    // Скрываем навигационный бар главной страницы
    const mainBottomNav = document.querySelector('#bottom-nav');
    if (mainBottomNav) {
        mainBottomNav.classList.add('hidden');
    }

    const screen = document.getElementById('business-details-screen');
    if (!screen) {
        console.error('❌ #business-details-screen not found in DOM!');
        showError('Ошибка: контейнер деталей не найден');
        return;
    }

    showLoader(true);

    try {
        // 🔥 ЗАГРУЖАЕМ ДАННЫЕ С СЕРВЕРА (гарантированно строка) 🔥
        console.log('📥 Loading business details for:', business.name, 'shop_param:', business.shop_param);
        const data = await fetchBusinessDetails(business.shop_param); // Теперь точно строка!
        console.log('✅ Business details loaded:', data);

        // Обновляем бизнес данными с сервера
        currentBusiness = data.business;

        // Кэшируем HTML
        if (!cachedBusinessDetailsHTML) {
            const response = await fetch('/business-details.html');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            cachedBusinessDetailsHTML = await response.text();
        }

        // Вставляем HTML и настраиваем контент
        screen.innerHTML = cachedBusinessDetailsHTML;
        setupBusinessDetailsContent(currentBusiness);
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
    console.log('🔧 Setting up business details with:', business);

    // === ГЕРОЙ ХЕДЕР ===
    // Название
    const title = document.querySelector('#business-details-screen h1');
    if (title) title.textContent = business.name;

    // Инициал
    const initial = document.querySelector('#business-details-screen .w-20.h-20');
    if (initial) initial.textContent = business.initial || business.name.charAt(0);

    // Категория
    const categoryBadge = document.querySelector('#business-details-screen .px-2.py-1');
    if (categoryBadge) {
        categoryBadge.innerHTML = `<span>${business.category_emoji}</span><span>${business.category}</span>`;
    }

    // === ИНФО КАРТОЧКИ ===
    // Адрес
    const addressCards = document.querySelectorAll('#info-cards-section .info-card');
    if (addressCards.length > 0) {
        const addressText = addressCards[0].querySelector('.text-textPrimary.font-semibold');
        if (addressText) addressText.textContent = business.address || 'Адрес не указан';
    }

    // Телефон
    if (addressCards.length > 1) {
        const phoneText = addressCards[1].querySelector('.text-textPrimary.font-semibold');
        if (phoneText) phoneText.textContent = business.phone || '+7 (XXX) XXX-XX-XX';
    }

    // === СТАТИСТИКА ПОЛЬЗОВАТЕЛЯ ===
    updateStats(business);

    // === ПРОГРЕСС БАР ===
    updateProgress(business);

    // === О ЗАВЕДЕНИИ ===
    const descriptionText = document.querySelector('#about-section p');
    if (descriptionText) {
        descriptionText.textContent = business.description || 'Информация о заведении временно недоступна';
    }

    // === КНОПКИ ===
    // Кнопка "Назад"
    const backBtn = document.getElementById('back-button');
    if (backBtn) {
        backBtn.onclick = () => {
            console.log('🔙 Back button clicked');
            hideBusinessDetails();
        };
    } else {
        console.error('❌ Back button not found!');
    }

    // Кнопка "Избранное"
    const favBtn = document.getElementById('favorite-button');
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
            console.log('⭐ Favorite toggled:', currentBusiness.is_favorite);
        };
    }
};

// Обновление статистики пользователя
const updateStats = (business: Business) => {
    // Визиты
    const visitsElements = document.querySelectorAll('#user-stats-section .grid .text-center');
    if (visitsElements.length > 0) {
        const visitsCount = visitsElements[0].querySelector('.text-textPrimary.text-2xl');
        if (visitsCount) visitsCount.textContent = (business.visits_count || 0).toString();
    }

    // Баллы
    if (visitsElements.length > 1) {
        const pointsCount = visitsElements[1].querySelector('.text-textPrimary.text-2xl');
        if (pointsCount) pointsCount.textContent = business.points.toString();
    }

    // Заработано (пока 0, можно добавить позже)
    if (visitsElements.length > 2) {
        const earnedCount = visitsElements[2].querySelector('.text-textPrimary.text-2xl');
        if (earnedCount) earnedCount.textContent = '0';
    }

    // Последний визит
    const lastVisitContainer = document.querySelector('#user-stats-section .bg-white.rounded-xl.p-3.mb-3');
    if (lastVisitContainer) {
        const lastVisitText = lastVisitContainer.querySelector('.text-textPrimary.text-sm.font-semibold');
        if (lastVisitText) {
            lastVisitText.textContent = business.last_visit || 'Еще не посещали';
        }
    }
};

// Обновление прогресс бара
const updateProgress = (business: Business) => {
    // Прогресс бар
    const progressBarContainer = document.querySelector('#user-stats-section .bg-white.rounded-xl.p-3:last-child');
    if (progressBarContainer) {
        const progressBar = progressBarContainer.querySelector('div[style*="width"]');
        if (progressBar) {
            progressBar.setAttribute('style', `width: ${business.progress_percent}%`);
        }

        // Текст прогресса
        const progressText = progressBarContainer.querySelector('.text-textSecondary.text-xs');
        if (progressText) {
            progressText.textContent = `${business.points} из ${business.points + business.points_to_reward} баллов`;
        }

        // До следующей награды
        const pointsToReward = progressBarContainer.querySelector('.text-primary.text-sm.font-bold');
        if (pointsToReward) {
            pointsToReward.textContent = `${business.points_to_reward} баллов`;
        }
    }
};

// Скрытие деталей
export const hideBusinessDetails = () => {
    console.log('🔙 Hiding business details...');

    const screen = document.getElementById('business-details-screen');
    if (!screen) {
        console.error('❌ Business details screen not found!');
        return;
    }

    screen.classList.add('hidden');

    // Показываем навигационный бар главной страницы
    const mainBottomNav = document.querySelector('#bottom-nav');
    if (mainBottomNav) {
        mainBottomNav.classList.remove('hidden');
    }

    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.classList.remove('hidden');
        mainContent.scrollTop = 0;
        console.log('✅ Main content shown and scrolled to top');
    }
};