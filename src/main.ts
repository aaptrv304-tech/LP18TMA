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
  type Business,
  type Activity,
  type Achievement,
  type Recommendation
} from './api';

const showBonusNotification = (shopName: string, points: number) => {
  try {
    // Создаём оверлей
    const overlay = document.createElement('div');
    overlay.id = 'bonus-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
      z-index: 999999;
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    // Создаём карточку
    const card = document.createElement('div');
    card.style.cssText = `
      background: linear-gradient(135deg, #FF6B35 0%, #FF9E6D 100%);
      border-radius: 24px;
      padding: 40px 32px;
      text-align: center;
      max-width: 320px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(255, 107, 53, 0.4);
      transform: scale(0.8);
      opacity: 0;
    `;

    // Иконка
    const icon = document.createElement('div');
    icon.style.cssText = `
      width: 80px;
      height: 80px;
      background: white;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 auto 24px;
      box-shadow: 0 10px 30px rgba(255, 107, 53, 0.3);
    `;
    icon.innerHTML = '<i class="fa-solid fa-coins text-primary text-4xl"></i>';

    // Заголовок
    const title = document.createElement('h2');
    title.style.cssText = `
      color: white;
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 8px 0;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    `;
    title.textContent = '🎉 Бонус получен!';

    // Название заведения
    const shop = document.createElement('p');
    shop.style.cssText = `
      color: rgba(255, 255, 255, 0.95);
      font-size: 16px;
      margin: 0 0 24px 0;
      font-weight: 500;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
    `;
    shop.textContent = shopName;

    // Баллы
    const pointsContainer = document.createElement('div');
    pointsContainer.style.cssText = `
      background: rgba(255, 255, 255, 0.25);
      border-radius: 16px;
      padding: 16px;
      margin: 24px 0;
    `;

    const pointsText = document.createElement('span');
    pointsText.style.cssText = `
      color: white;
      font-size: 48px;
      font-weight: 800;
      display: block;
      text-shadow: 0 3px 12px rgba(0, 0, 0, 0.25);
    `;
    pointsText.textContent = `+${points}`;

    const pointsLabel = document.createElement('span');
    pointsLabel.style.cssText = `
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      display: block;
      margin-top: 4px;
      font-weight: 500;
    `;
    pointsLabel.textContent = 'бонусных баллов';

    pointsContainer.appendChild(pointsText);
    pointsContainer.appendChild(pointsLabel);

    // Кнопка
    const button = document.createElement('button');
    button.style.cssText = `
      background: white;
      color: #FF6B35;
      border: none;
      border-radius: 12px;
      padding: 14px 40px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 16px;
      box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
      transition: all 0.2s ease;
    `;
    button.textContent = 'Отлично!';

    // Эффекты при наведении/нажатии
    button.addEventListener('touchstart', () => {
      button.style.transform = 'scale(0.95)';
      button.style.boxShadow = '0 2px 10px rgba(255, 107, 53, 0.4)';
    });

    button.addEventListener('touchend', () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 4px 15px rgba(255, 107, 53, 0.3)';
    });

    button.addEventListener('click', () => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 300);
    });

    // Собираем карточку
    card.appendChild(icon);
    card.appendChild(title);
    card.appendChild(shop);
    card.appendChild(pointsContainer);
    card.appendChild(button);

    // Добавляем в оверлей
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // Анимация появления
    setTimeout(() => {
      overlay.style.opacity = '1';
      card.style.transform = 'scale(1)';
      card.style.opacity = '1';
    }, 10);

    // Автозакрытие через 4 секунды
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        button.click();
      }
    }, 4000);

  } catch (error) {
    console.error('❌ Ошибка показа бонуса:', error);
    // Резервный вариант - простое уведомление
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert(`🎉 +${points} баллов от ${shopName}!`);
    }
  }
};

// Вспомогательная функция для получения названия заведения
const getShopNameFromParam = (param: string): string => {
  const shopNames: { [key: string]: string } = {
    'shop_001': 'Кофейня Уют',
    'shop_002': 'Салон Красоты Люкс',
    'shop_003': 'Магазин "Продукты 24"',
    'shop_004': 'Дента Клиник',
    'shop_005': 'Шаурма House',
  };
  return shopNames[param] || `Заведение ${param}`;
};

// Инициализация главной страницы
const initHomePage = async () => {
  console.log('🏠 Главная страница загружена');

  // Сразу скрываем лоадер (на случай ошибок)
  showLoader(false);

  // Проверяем доступность Telegram WebApp
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.expand();
    tg.setHeaderColor('#E65A2B');
    tg.setBackgroundColor('#FAFAFA');

    // 🔥 ОТКЛЮЧАЕМ ВЕРТИКАЛЬНЫЕ СВАЙПЫ 🔥
    tg.disableVerticalSwipes();

    console.log('✅ Telegram WebApp подключен');
    console.log('📱 Platform:', tg.platform);
    console.log('👤 User:', tg.initDataUnsafe?.user);

    // 🔥 ПРОВЕРКА ПАРАМЕТРА STARTAPP 🔥
    const startParam = tg.initDataUnsafe?.start_param;

    if (startParam) {
      console.log('✅ Start param:', startParam);

      // Показываем уведомление о бонусе (тестовые данные)
      const shopName = getShopNameFromParam(startParam);
      const bonusPoints = 100;

      // Показываем через небольшую задержку, чтобы интерфейс успел загрузиться
      setTimeout(() => {
        showBonusNotification(shopName, bonusPoints);
      }, 800);

      // TODO: Позже добавим запрос к бэкенду для записи посещения
    } else {
      console.log('ℹ️ Start param не передан');
    }
  } else {
    console.warn('⚠️ Режим разработки (не в Telegram)');
  }

  // Загружаем данные с бэкенда
  try {
    await loadAllData();
  } catch (error) {
    console.error('❌ Ошибка загрузки данных:', error);
    showLoader(false);
  }

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

    let errorMessage = 'Не удалось загрузить данные';
    if (error.message) {
      errorMessage += `: ${error.message}`;
    }
    if (error.cause) {
      errorMessage += ` (причина: ${error.cause})`;
    }

    showError(errorMessage);

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert(`Ошибка: ${errorMessage}`);
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
  // 🔥 ПРОВЕРКА НА NULL ИЛИ ОТСУТСТВИЕ ДАННЫХ 🔥
  if (!data || !data.businesses) {
    console.log('ℹ️ renderBusinesses: businesses is null or undefined, showing empty state');
    data = {
      businesses: [],
      stats: data?.stats || { total_points: 0, total_businesses: 0, total_visits: 0, total_rewards: 0 }
    };
  }

  // Обновляем статистику
  if (data.stats) {
    renderStatsCard(data.stats);
  }

  // Очищаем список заведений
  const businessListSection = document.getElementById('business-list-section');
  if (businessListSection) {
    // 🔥 ПРОВЕРЯЕМ, ЧТО МАССИВ ПУСТОЙ 🔥
    if (data.businesses.length === 0) {
      // Показываем сообщение "Здесь пока пусто"
      businessListSection.innerHTML = `
        <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <div class="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fa-solid fa-house text-white text-2xl"></i>
          </div>
          <p class="text-textSecondary text-base font-medium">Здесь пока пусто</p>
          <p class="text-textSecondary text-sm mt-2">Посетите первое заведение, чтобы начать накапливать баллы</p>
        </div>
      `;
      return;
    }

    businessListSection.innerHTML = '';

    // Рендерим каждое заведение
    data.businesses.forEach((business: Business) => {
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
const renderActivity = (activities: Activity[] | null | undefined) => {
  const activityContainer = document.getElementById('activity-container');
  if (activityContainer) {
    // 🔥 ПРОВЕРКА НА NULL ИЛИ ОТСУТСТВИЕ ДАННЫХ 🔥
    if (!activities || activities.length === 0) {
      // Показываем сообщение "Здесь пока пусто"
      activityContainer.innerHTML = `
        <div class="p-8 text-center">
          <div class="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <i class="fa-regular fa-clock text-white text-xl"></i>
          </div>
          <p class="text-textSecondary text-sm font-medium">Здесь пока пусто</p>
          <p class="text-textSecondary text-xs mt-1">Совершите первый визит, чтобы увидеть активность</p>
        </div>
      `;
      return;
    }

    activityContainer.innerHTML = '';

    activities.forEach(activity => {
      // Определяем правильные цвета на основе типа активности
      let bgColor = 'green-50';
      let textColor = 'green-600';
      let icon = activity.icon || 'fa-plus';

      if (activity.type === 'redeemed' || activity.points < 0) {
        bgColor = 'orange-50';
        textColor = 'orange-600';
        icon = 'fa-gift';
      }

      // Форматируем знак для отрицательных чисел
      const pointsDisplay = activity.points >= 0 ? `+${activity.points}` : `${activity.points}`;

      const activityHTML = `
        <div class="p-4 flex items-center gap-3">
          <div class="w-10 h-10 bg-${bgColor} rounded-full flex items-center justify-center flex-shrink-0">
            <i class="fa-solid ${icon} text-${textColor} text-sm"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-textPrimary font-medium text-sm">
              ${activity.type === 'earned' ? 'Начислено баллов' : 'Награда получена'}
            </p>
            <p class="text-textSecondary text-xs">${activity.business_name} • ${activity.date}</p>
          </div>
          <p class="text-${textColor} font-bold text-base flex-shrink-0">${pointsDisplay}</p>
        </div>
      `;
      activityContainer.innerHTML += activityHTML;
    });
  }
};

// Рендер достижений
const renderAchievements = (achievements: Achievement[] | null | undefined) => {
  const achievementsContainer = document.getElementById('achievements-container');

  if (achievementsContainer) {
    // 🔥 ПРОВЕРКА НА NULL ИЛИ ОТСУТСТВИЕ ДАННЫХ 🔥
    if (!achievements || achievements.length === 0) {
      achievementsContainer.innerHTML = '';
      return;
    }

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
const renderRecommendations = (recommendations: Recommendation[] | null | undefined) => {
  const recommendationsSection = document.getElementById('recommendations-section');
  if (recommendationsSection) {
    // 🔥 ПРОВЕРКА НА NULL ИЛИ ОТСУТСТВИЕ ДАННЫХ 🔥
    if (!recommendations || recommendations.length === 0) {
      // Скрываем секцию или показываем "Нет рекомендаций"
      const container = recommendationsSection.querySelector('.space-y-3');
      if (container) {
        container.innerHTML = `
          <div class="p-8 text-center">
            <p class="text-textSecondary text-sm">Нет рекомендаций</p>
          </div>
        `;
      }
      return;
    }

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
initHomePage().catch((error) => {
  console.error('❌ Критическая ошибка инициализации:', error);
  showLoader(false);
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.showAlert('Ошибка запуска приложения. Попробуйте перезапустить.');
  }
});