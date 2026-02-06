import type { Business } from './api';
import { fetchBusinessDetails } from './api'; // ← ИМПОРТИРУЕМ НОВУЮ ФУНКЦИЮ

// Объявляем глобальные функции из main.ts
declare function showLoader(show: boolean): void;
declare function showError(message: string): void;

export let currentBusiness: Business | null = null;
let cachedBusinessDetailsHTML: string | null = null;

export const showBusinessDetails = async (business: Business) => {
    currentBusiness = business;

    if (!business.shop_param) {
        console.error('❌ Business shop_param is missing!');
        showError('Ошибка: не удалось определить заведение');
        return;
    }

    const screen = document.getElementById('business-details-screen');
    if (!screen) {
        console.error('❌ #business-details-screen not found in DOM!');
        showError('Ошибка: контейнер деталей не найден');
        return;
    }

    showLoader(true);

    try {
        console.log('📥 Loading business details for:', business.name, 'shop_param:', business.shop_param);
        const data = await fetchBusinessDetails(business.shop_param);
        console.log('✅ Business details loaded:', data);

        // ✅ СОХРАНЯЕМ БИЗНЕС И ЯВНО ДОБАВЛЯЕМ НАГРАДЫ
        currentBusiness = data.business;

        // ✅ ДОБАВЛЯЕМ НАГРАДЫ КАК ДИНАМИЧЕСКОЕ СВОЙСТВО
        // @ts-ignore
        currentBusiness.rewards = data.rewards || [];

        console.log('💾 currentBusiness with rewards:', currentBusiness);
        // @ts-ignore
        console.log('💾 rewards in currentBusiness:', currentBusiness.rewards);

        if (!cachedBusinessDetailsHTML) {
            const response = await fetch('/business-details.html');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            cachedBusinessDetailsHTML = await response.text();
        }

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

    // ✅ ОТОБРАЖАЕМ НАГРАДЫ
    renderRewards(currentBusiness);

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

// ✅ НОВАЯ ФУНКЦИЯ — рендеринг наград
const renderRewards = (business: Business | null) => {
    const rewardsSection = document.getElementById('rewards-section');
    if (!rewardsSection) {
        console.error('❌ #rewards-section not found!');
        return;
    }

    // Получаем данные из загрузки (из fetchBusinessDetails)
    if (!currentBusiness) {
        console.log('ℹ️ No current business, skipping rewards render');
        return;
    }

    // Проверяем, есть ли награды в данных
    // @ts-ignore - TypeScript не знает о динамическом свойстве
    const rewards = currentBusiness['rewards'] || [];

    console.log('🎁 Rewards to render:', rewards);

    // Находим контейнер для карточек наград
    const rewardsContainer = rewardsSection.querySelector('.flex.gap-3.overflow-x-auto');
    if (!rewardsContainer) {
        console.error('❌ Rewards container not found!');
        return;
    }

    // Если наград нет — показываем заглушку
    if (!rewards || rewards.length === 0) {
        rewardsContainer.innerHTML = `
            <div class="w-full py-8 text-center">
                <div class="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fa-solid fa-gift text-primary text-3xl"></i>
                </div>
                <p class="text-textSecondary text-sm font-medium">Нет доступных наград</p>
                <p class="text-textSecondary text-xs mt-2">Загляните позже, скоро появятся новые предложения</p>
            </div>
        `;
        return;
    }

    // ✅ ПОЛУЧАЕМ КОЛИЧЕСТВО БАЛЛОВ С ПРОВЕРКОЙ НА UNDEFINED
    const userPoints = business?.points ?? 0; // ← ИСПРАВЛЕНО: используем 0 если undefined

    // Рендерим карточки наград
    let html = '';

    rewards.forEach((reward: any) => {
        // ✅ ОПРЕДЕЛЯЕМ ДОСТУПНОСТЬ НАГРАДЫ
        const isAvailable = userPoints >= reward.points_cost;
        const pointsNeeded = reward.points_cost - userPoints;

        // Цвета для иконок (как в админке)
        const iconColors: { [key: string]: string } = {
            'gift': 'from-orange-100 to-orange-200 text-primary',
            'percent': 'from-purple-100 to-purple-200 text-purple-600',
            'mug-hot': 'from-green-100 to-green-200 text-green-600',
            'scissors': 'from-yellow-100 to-yellow-200 text-yellow-600',
            'star': 'from-red-100 to-red-200 text-red-600',
            'utensils': 'from-blue-100 to-blue-200 text-blue-600',
            'spa': 'from-teal-100 to-teal-200 text-teal-600',
            'crown': 'from-amber-100 to-amber-200 text-amber-600',
            'cake-candles': 'from-pink-100 to-pink-200 text-pink-600',
            'tooth': 'from-cyan-100 to-cyan-200 text-cyan-600',
            'default': 'from-gray-100 to-gray-200 text-gray-600'
        };

        const iconClass = iconColors[reward.icon || 'gift'] || iconColors['default'];
        const iconFaClass = getFaIconClass(reward.icon || 'gift');

        html += `
            <div class="reward-card flex-shrink-0 w-[160px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${isAvailable ? '' : 'opacity-75'}">
                <div class="h-[100px] bg-gradient-to-br ${iconClass.split(' ')[0]} ${iconClass.split(' ')[1]} flex items-center justify-center">
                    <i class="fa-solid ${iconFaClass} ${iconClass.split(' ')[2]} text-4xl"></i>
                </div>
                <div class="p-3">
                    <p class="text-textPrimary font-semibold text-sm mb-1 leading-tight">${reward.name}</p>
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-1">
                            <i class="fa-solid fa-coins text-yellow-500 text-xs"></i>
                            <span class="text-textPrimary font-bold text-sm">${reward.points_cost}</span>
                        </div>
                        ${isAvailable
                ? `<span class="px-2 py-0.5 bg-green-50 text-green-600 rounded-md text-xs font-medium">Доступно</span>`
                : `<span class="px-2 py-0.5 bg-orange-50 text-orange-600 rounded-md text-xs font-medium">Ещё ${pointsNeeded}</span>`
            }
                    </div>
                    <button class="w-full py-2 ${isAvailable ? 'bg-primary text-white' : 'bg-gray-100 text-textSecondary'} rounded-lg text-xs font-medium ${isAvailable ? '' : 'cursor-not-allowed'}">
                        ${isAvailable ? 'Получить' : 'Недоступно'}
                    </button>
                </div>
            </div>
        `;
    });

    rewardsContainer.innerHTML = html;

    // Добавляем обработчики кликов на кнопки "Получить"
    rewardsContainer.querySelectorAll('button').forEach((button, index) => {
        button.addEventListener('click', () => {
            const reward = rewards[index];
            if (userPoints >= reward.points_cost) {
                console.log('🎁 Получение награды:', reward);
                // TODO: Отправить запрос на получение награды
                alert(`Вы получили награду: ${reward.name}!`);
            } else {
                console.log('❌ Недостаточно баллов');
            }
        });
    });
};

// ✅ ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ — получение класса иконки Font Awesome
const getFaIconClass = (iconName: string): string => {
    const icons: { [key: string]: string } = {
        'gift': 'fa-gift',
        'percent': 'fa-percent',
        'mug-hot': 'fa-mug-hot',
        'scissors': 'fa-scissors',
        'star': 'fa-star',
        'utensils': 'fa-utensils',
        'spa': 'fa-spa',
        'crown': 'fa-crown',
        'cake-candles': 'fa-cake-candles',
        'tooth': 'fa-tooth',
        'default': 'fa-gift'
    };
    return icons[iconName] || icons['default'];
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

