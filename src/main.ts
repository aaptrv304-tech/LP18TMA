// Подключение к Telegram Web App
declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

// Импорты
import {
  fetchBusinesses,
  fetchActivity,
  fetchAchievements,
  fetchRecommendations,
  type BusinessResponse,
  type Activity,
  type Achievement,
  type Recommendation
} from './api';

// Инициализация главной страницы
const initHomePage = async () => {
  console.log('🏠 Главная страница загружена');

  // Проверяем доступность Telegram WebApp
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.expand();
    tg.setHeaderColor('#E65A2B');
    tg.setBackgroundColor('#FAFAFA');

    console.log('✅ Telegram WebApp подключен');
    console.log('User:', tg.initDataUnsafe?.user);
  } else {
    console.warn('⚠️ Режим разработки (не в Telegram)');
  }

  // Загружаем данные с бэкенда
  await loadAllData();

  // Настраиваем обработчики
  setupEventListeners();
};

// Загрузка всех данных
const loadAllData = async () => {
  try {
    console.log('📥 Загрузка данных с бэкенда...');

    // Показываем лоадер
    showLoader(true);

    // Загружаем заведения и статистику
    const businessesData = await fetchBusinesses();
    renderBusinesses(businessesData);

    // Загружаем активность
    const activityData = await fetchActivity();
    renderActivity(activityData.activities);

    // Загружаем достижения
    const achievementsData = await fetchAchievements();
    renderAchievements(achievementsData.achievements);

    // Загружаем рекомендации
    const recommendationsData = await fetchRecommendations();
    renderRecommendations(recommendationsData.recommendations);

    console.log('✅ Все данные загружены');
  } catch (error: any) {
    console.error('❌ Ошибка загрузки данных:', error);

    // Детальное логирование ошибки
    let errorMessage = 'Не удалось загрузить данные';
    if (error.message) {
      errorMessage += `: ${error.message}`;
    }
    if (error.cause) {
      errorMessage += ` (причина: ${error.cause})`;
    }

    showError(errorMessage);

    // Для отладки — покажем полную ошибку в консоли
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert(`Ошибка: ${errorMessage}\nПроверь консоль для деталей`);
    }
  } finally {
    showLoader(false);
  }
};

// Рендер карточки статистики
const renderStatsCard = (stats: any) => {
  const summaryCard = document.querySelector('#summary-card-section .gradient-card');
  if (summaryCard) {
    summaryCard.innerHTML = `
      <div class="flex justify-between items-start mb-4">
        <div>
          <p class="text-white/90 text-sm font-medium mb-1">Всего баллов</p>
          <h1 class="text-white text-5xl font-bold mb-2">${stats.total_points.toLocaleString('ru')}</h1>
          <p class="text-white/80 text-sm">В ${stats.total_businesses} заведениях</p>
        </div>
        <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <i class="fa-solid fa-coins text-white text-2xl"></i>
        </div>
      </div>
      <div class="flex gap-4 mt-6 pt-4 border-t border-white/20">
        <div class="flex items-center gap-2 flex-1">
          <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <i class="fa-solid fa-star text-white text-sm"></i>
          </div>
          <div>
            <p class="text-white text-base font-semibold">${stats.total_visits}</p>
            <p class="text-white/70 text-xs">визитов</p>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-1">
          <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <i class="fa-solid fa-gift text-white text-sm"></i>
          </div>
          <div>
            <p class="text-white text-base font-semibold">${stats.total_rewards}</p>
            <p class="text-white/70 text-xs">награды</p>
          </div>
        </div>
      </div>
    `;
  }
};

// Рендер списка заведений
const renderBusinesses = (data: BusinessResponse) => {
  // Обновляем статистику
  renderStatsCard(data.stats);

  // Очищаем список заведений
  const businessListSection = document.getElementById('business-list-section');
  if (businessListSection) {
    businessListSection.innerHTML = '';

    // Рендерим каждое заведение
    data.businesses.forEach(business => {
      const businessHTML = `
        <div class="business-card bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${business.has_reward ? 'ring-2 ring-green-100' : ''}">
          <div class="flex gap-3">
            <div class="relative">
              <div class="w-14 h-14 bg-gradient-to-br from-${getCategoryColor(business.category_emoji)}-400 to-${getCategoryColor(business.category_emoji)}-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                ${business.initial}
              </div>
              ${business.is_favorite ? `
                <button class="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                  <i class="fa-solid fa-star text-white text-xs"></i>
                </button>
              ` : ''}
              ${business.has_reward ? `
                <div class="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <i class="fa-solid fa-gift text-white text-xs"></i>
                </div>
              ` : ''}
              ${business.badge ? `
                <div class="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 rounded-full">
                  <span class="text-white text-[9px] font-bold">${business.badge}</span>
                </div>
              ` : ''}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2 mb-1">
                <h3 class="text-textPrimary font-semibold text-base leading-tight">
                  ${business.name}
                </h3>
                <div class="text-right flex-shrink-0">
                  <p class="text-primary text-xl font-bold leading-none">${business.points}</p>
                  <p class="text-textSecondary text-xs">баллов</p>
                </div>
              </div>
              <div class="flex items-center gap-2 mb-2">
                <span class="category-badge px-2 py-0.5 bg-${getCategoryColor(business.category_emoji)}-50 text-${getCategoryColor(business.category_emoji)}-600 rounded-md text-xs font-medium">
                  <span>${business.category_emoji}</span><span>${business.category}</span>
                </span>
                ${business.distance ? `
                  <span class="text-textSecondary text-xs">•</span>
                  <span class="text-textSecondary text-xs">${business.distance}</span>
                ` : business.address ? `
                  <span class="text-textSecondary text-xs">•</span>
                  <span class="text-textSecondary text-xs">${business.address}</span>
                ` : ''}
              </div>
              <p class="text-textSecondary text-xs mb-2">Последний визит: ${business.last_visit}</p>
              <div class="space-y-1">
                <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div class="bg-${business.has_reward ? 'green-500' : 'primary'} h-full rounded-full" style="width: ${business.progress_percent}%"></div>
                </div>
                <p class="text-${business.has_reward ? 'green-600' : 'textSecondary'} text-xs ${business.has_reward ? 'font-medium' : ''}">
                  ${business.has_reward ? '🎉 Награда доступна!' : `${business.points_to_reward} баллов до награды`}
                </p>
              </div>
            </div>
          </div>
        </div>
      `;
      businessListSection.innerHTML += businessHTML;
    });
  }
};

// Рендер активности
const renderActivity = (activities: Activity[]) => {
  const activitySection = document.querySelector('#recent-activity-section .divide-y');
  if (activitySection && activities.length > 0) {
    activitySection.innerHTML = '';

    activities.forEach(activity => {
      const activityHTML = `
        <div class="p-4 flex items-center gap-3">
          <div class="w-10 h-10 bg-${activity.color}-50 rounded-full flex items-center justify-center flex-shrink-0">
            <i class="fa-solid ${activity.icon} text-${activity.color}-600 text-sm"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-textPrimary font-medium text-sm">
              ${activity.type === 'earned' ? 'Начислено баллов' : 'Награда получена'}
            </p>
            <p class="text-textSecondary text-xs">${activity.business_name} • ${activity.date}</p>
          </div>
          <p class="text-${activity.color}-600 font-bold text-base flex-shrink-0">${activity.points > 0 ? '+' : ''}${activity.points}</p>
        </div>
      `;
      activitySection.innerHTML += activityHTML;
    });
  }
};

// Рендер достижений
const renderAchievements = (achievements: Achievement[]) => {
  const achievementsContainer = document.getElementById('achievements-container');

  if (achievementsContainer && achievements.length > 0) {
    console.log('🎯 Нашли контейнер достижений, очищаем...');
    achievementsContainer.innerHTML = '';

    achievements.forEach(achievement => {
      const achievementHTML = `
        <div class="flex-shrink-0 w-20 text-center">
          <div class="w-20 h-20 ${achievement.is_locked ? 'bg-gray-100 border-2 border-dashed border-gray-300' : 'bg-gradient-to-br from-yellow-400 to-orange-500'} rounded-2xl flex items-center justify-center mb-2 shadow-lg">
            <i class="fa-solid ${achievement.icon} text-white text-2xl"></i>
          </div>
          <p class="text-${achievement.is_locked ? 'textSecondary' : 'textPrimary'} text-xs font-medium">${achievement.name}</p>
        </div>
      `;
      achievementsContainer.innerHTML += achievementHTML;
    });
  }
};

// Рендер рекомендаций
const renderRecommendations = (recommendations: Recommendation[]) => {
  const recommendationsSection = document.getElementById('recommendations-section');
  if (recommendationsSection && recommendations.length > 0) {
    // Очищаем контейнер рекомендаций (кроме заголовка)
    const container = recommendationsSection.querySelector('.space-y-3');
    if (container) {
      container.innerHTML = '';

      recommendations.forEach(rec => {
        const recHTML = `
          <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              ${rec.initial}
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-textPrimary font-semibold text-sm mb-0.5">${rec.name}</h3>
              <div class="flex items-center gap-2 mb-1">
                <span class="category-badge px-2 py-0.5 bg-green-50 text-green-600 rounded-md text-xs font-medium">
                  <span>${rec.category_emoji}</span><span>${rec.category}</span>
                </span>
                <span class="text-textSecondary text-xs">${rec.distance}</span>
              </div>
              <p class="text-textSecondary text-xs">Бонус за регистрацию: ${rec.bonus_points} баллов</p>
            </div>
            <button class="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium flex-shrink-0">
              Узнать
            </button>
          </div>
        `;
        container.innerHTML += recHTML;
      });
    }
  }
};

// Вспомогательные функции
const getCategoryColor = (emoji: string): string => {
  const colors: { [key: string]: string } = {
    '🍕': 'orange',
    '✂️': 'purple',
    '🛍️': 'blue',
    '🦷': 'teal',
    '🌯': 'red',
    '🏋️': 'green',
  };
  return colors[emoji] || 'gray';
};

const showError = (message: string) => {
  console.error('❌ Ошибка:', message);
  alert(`Ошибка: ${message}`);
};

const showLoader = (show: boolean) => {
  const loader = document.getElementById('loader-overlay');
  if (loader) {
    loader.style.display = show ? 'flex' : 'none';
  }
};

const setupEventListeners = () => {
  // Обработчики кликов по карточкам заведений
  const businessCards = document.querySelectorAll('.business-card');
  businessCards.forEach((card, index) => {
    card.addEventListener('click', () => {
      console.log(`🏢 Клик по карточке #${index + 1}`);
      alert(`Вы выбрали заведение "${card.querySelector('h3')?.textContent}"`);
    });
  });

  // Обработчики нижней навигации
  const navButtons = document.querySelectorAll('#bottom-nav button');
  navButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      navButtons.forEach(btn => {
        btn.classList.remove('text-primary');
        btn.classList.add('text-textSecondary');
      });

      button.classList.remove('text-textSecondary');
      button.classList.add('text-primary');

      console.log(`🧭 Навигация: кнопка #${index + 1}`);
    });
  });

  // Обработчик кнопки "Быстрое начисление"
  const qrButton = document.querySelector('#quick-actions-section button');
  if (qrButton) {
    qrButton.addEventListener('click', () => {
      console.log('📱 Открытие QR-кода');
      alert('QR-код для начисления баллов!');
    });
  }

  // Обработчик кнопок фильтров
  const filterButtons = document.querySelectorAll('#filter-section button');
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => {
        btn.classList.remove('bg-primary', 'text-white');
        btn.classList.add('bg-white', 'text-textSecondary');
      });

      button.classList.remove('bg-white', 'text-textSecondary');
      button.classList.add('bg-primary', 'text-white');

      console.log(`🔍 Фильтр: ${button.textContent?.trim()}`);
    });
  });
};

// Запуск приложения
initHomePage().catch(console.error);