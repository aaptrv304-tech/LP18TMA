// Подключение к Telegram Web App
declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
    nextSlide: () => void;
    skipOnboarding: () => void;
    startApp: () => void;
  }
}

let currentSlide = 1;
const totalSlides = 4;

// Функция перехода на следующий слайд
export function nextSlide() {
  const current = document.getElementById(`slide-${currentSlide}`);
  if (current) {
    current.classList.remove('active');
  }

  currentSlide++;

  const next = document.getElementById(`slide-${currentSlide}`);
  if (next && currentSlide <= totalSlides) {
    next.classList.add('active');
  }
}

// Функция пропуска онбординга
export function skipOnboarding() {
  console.log('⏭️ Онбординг пропущен');
  window.location.href = '/home.html';
}

// Функция запуска приложения
export function startApp() {
  console.log('🚀 Приложение запущено! +50 баллов');
  // Здесь можно отправить запрос на бэкенд для регистрации пользователя
  window.location.href = '/home.html';
}

// Обработка свайпов
let touchStartX = 0;
let touchEndX = 0;

const container = document.getElementById('onboarding-container');
if (container) {
  container.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  container.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });
}

function handleSwipe() {
  if (touchStartX - touchEndX > 50 && currentSlide < totalSlides) {
    nextSlide();
  }
}

// Инициализация приложения
const initApp = () => {
  console.log('🚀 Онбординг запущен!');

  // Проверяем доступность Telegram WebApp
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.expand();
    tg.setHeaderColor('#FFF8E1');
    tg.setBackgroundColor('#FFF8E1');

    console.log('✅ Telegram WebApp подключен');
    console.log('User:', tg.initDataUnsafe?.user);
  } else {
    console.warn('⚠️ Режим разработки (не в Telegram)');
  }

  // Экспортируем функции в глобальную область для onclick
  window.nextSlide = nextSlide;
  window.skipOnboarding = skipOnboarding;
  window.startApp = startApp;
};

// Запуск приложения
initApp();
