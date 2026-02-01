// Подключение к Telegram Web App
declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

// Инициализация приложения
const initApp = () => {
  console.log('🚀 Приложение запущено!');

  // Проверяем доступность Telegram WebApp
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;

    // Настройки внешнего вида
    tg.expand();

    console.log('✅ Telegram WebApp подключен');
    console.log('User ID:', tg.initDataUnsafe?.user?.id);
    console.log('Username:', tg.initDataUnsafe?.user?.username);

    // Можно показать уведомление
    tg.showAlert('Добро пожаловать в программу лояльности!');
  } else {
    console.warn('⚠️ Telegram WebApp не обнаружен (работаем в браузере)');
  }
};

// Запуск приложения
initApp();
