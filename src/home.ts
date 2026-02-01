// Подключение к Telegram Web App
declare global {
    interface Window {
        Telegram?: {
            WebApp?: any;
        };
    }
}

// Инициализация главной страницы
const initHomePage = () => {
    console.log('🏠 Главная страница загружена');

    // Проверяем доступность Telegram WebApp
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.expand();
        tg.setHeaderColor('#FF6B35');
        tg.setBackgroundColor('#FAFAFA');

        console.log('✅ Telegram WebApp подключен');
        console.log('User:', tg.initDataUnsafe?.user);
    } else {
        console.warn('⚠️ Режим разработки (не в Telegram)');
    }

    // Обработчики кликов по карточкам заведений
    const businessCards = document.querySelectorAll('.business-card');
    businessCards.forEach((card, index) => {
        card.addEventListener('click', () => {
            console.log(`🏢 Клик по карточке #${index + 1}`);
            alert(`Вы выбрали заведение #${index + 1}`);
        });
    });

    // Обработчики нижней навигации
    const navButtons = document.querySelectorAll('#bottom-nav button');
    navButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            // Снимаем активный класс со всех кнопок
            navButtons.forEach(btn => {
                btn.classList.remove('text-primary');
                btn.classList.add('text-textSecondary');
            });

            // Добавляем активный класс к текущей кнопке
            button.classList.remove('text-textSecondary');
            button.classList.add('text-primary');

            console.log(`🧭 Навигация: кнопка #${index + 1}`);

            // TODO: Переключение между разделами
            switch (index) {
                case 0:
                    console.log('🏠 Главная');
                    break;
                case 1:
                    console.log('🎁 Награды');
                    // window.location.href = '/rewards.html';
                    break;
                case 2:
                    console.log('🕒 История');
                    // window.location.href = '/history.html';
                    break;
                case 3:
                    console.log('👤 Профиль');
                    // window.location.href = '/profile.html';
                    break;
            }
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
initHomePage();