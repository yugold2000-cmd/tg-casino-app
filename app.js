// =========================================================================
// 1. УМНЫЙ ДИНАМИЧЕСКИЙ ДОСТУП К TG SDK (Защита от крашей и race conditions)
// =========================================================================
Object.defineProperty(window, 'tg', {
    get: function() {
        // Если мы внутри Telegram — возвращаем реальный WebApp
        if (window.Telegram && window.Telegram.WebApp) {
            return window.Telegram.WebApp;
        }
        // Если мы на Live Server / в обычном браузере — возвращаем умный муляж (mock)
        return {
            HapticFeedback: { 
                impactOccurred: (type) => console.log(`[Haptic Mock]: ${type}`) 
            },
            showAlert: (msg) => alert(msg),
            showConfirm: (msg) => confirm(msg),
            ready: () => console.log("[Telegram SDK Mock]: Ready called"),
            expand: () => console.log("[Telegram SDK Mock]: Expand called"),
            setHeaderColor: (color) => console.log(`[Telegram SDK Mock]: Header color -> ${color}`),
            setBackgroundColor: (color) => console.log(`[Telegram SDK Mock]: BG color -> ${color}`),
            openTelegramLink: (url) => window.open(url, '_blank'),
            openLink: (url) => window.open(url, '_blank'),
            initDataUnsafe: { 
                user: { language_code: 'ru', first_name: 'User' } 
            }
        };
    }
});

// Глобальные переменные состояния приложения
let currentLang = 'en'; 
let currentTheme = 'dark'; 

// Словарь переводов для локализации (RU / EN)
// Словарь переводов для локализации (RU / EN)
const translations = {
    ru: {
        games_title: "Игры",
        live_bets_title: "Live ставки",
        th_game: "Игра",
        th_player: "Игрок",
        th_bet: "Ставка",
        th_win: "Выигрыш",
        assets_title: "Активы",
        btn_deposit: "Пополнить",
        btn_withdraw: "Вывести",
        tx_history_title: "История транзакций",
        tx_deposit_rub: "Пополнение RUB",
        tx_today: "Сегодня, 14:30",
        menu_title: "Меню",
        menu_bonuses: "Бонусы и промокоды",
        menu_settings: "Настройки аккаунта",
        menu_support: "Техподдержка",
        
        menu_fairness: "Проверка честности", // <-- ВОТ ЭТУ СТРОЧКУ ДОБАВЬ
        
        menu_responsible: "Ответственная игра",
        menu_channel_short: "Канал",
        menu_language: "Язык",
        menu_theme_short: "Тема",
        nav_wallet: "Кошелек",
        nav_main: "Главная",
        nav_menu: "Menu"
    },
    en: {
        games_title: "Games",
        live_bets_title: "Live Bets",
        th_game: "Game",
        th_player: "Player",
        th_bet: "Bet",
        th_win: "Payout",
        assets_title: "Assets",
        btn_deposit: "Deposit",
        btn_withdraw: "Withdraw",
        tx_history_title: "Transaction History",
        tx_deposit_rub: "RUB Top-up",
        tx_today: "Today, 14:30",
        menu_title: "Menu",
        menu_bonuses: "Bonuses & Promos",
        menu_settings: "Account Settings",
        menu_support: "Support Chat",
        
        menu_fairness: "Provably Fair",     // <-- И ВОТ ЭТУ СТРОЧКУ ДОБАВЬ
        
        menu_responsible: "Responsible Gaming",
        menu_channel_short: "Channel",
        menu_language: "Language",
        menu_theme_short: "Theme",
        nav_wallet: "Wallet",
        nav_main: "Main",
        nav_menu: "Menu"
    }
};

// =========================================================================
// 2. БЕЗОПАСНАЯ ФУНКЦИЯ ОТКРЫТИЯ ССЫЛОК (Для Telegram и обычного браузера)
// =========================================================================
window.openExternalLink = function(url) {
    // Включаем моментальную haptic-вибрацию, чтобы юзер понял, что клик прошёл
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }

    try {
        // Если мы внутри реального Telegram Mini App
        if (window.Telegram && window.Telegram.WebApp) {
            // Очищаем ссылку от лишних пробелов, которые мобилка может не переварить
            const cleanUrl = url.trim();
            
            if (cleanUrl.includes('t.me/')) {
                tg.openTelegramLink(cleanUrl);
            } else {
                tg.openLink(cleanUrl);
            }
        } else {
            // Обычный браузер на ПК (Live Server)
            window.open(url, '_blank');
        }
    } catch (error) {
        console.error("Ошибка открытия ссылки:", error);
        // Резервный бэкап, если мобильный SDK выдал ошибку
        window.open(url, '_blank');
    }
};

// =========================================================================
// 3. ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем WebApp
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#0f0f13');
    tg.setBackgroundColor('#0f0f13');

    // Автоопределение языка Telegram-клиента пользователя
    try {
        const userLanguage = tg.initDataUnsafe?.user?.language_code;
        currentLang = (userLanguage === 'ru') ? 'ru' : 'en';
        applyLanguage(currentLang);
    } catch (e) {
        applyLanguage('en');
    }

    // Загрузка аватарки профиля
    try {
        const user = tg.initDataUnsafe?.user;
        const avatarContainer = document.getElementById('user-avatar-container');
        if (user) {
            if (user.photo_url) {
                avatarContainer.innerHTML = `<img src="${user.photo_url}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
            } else {
                const firstLetter = (user.first_name || user.username || 'U').charAt(0).toUpperCase();
                document.getElementById('user-avatar').innerText = firstLetter;
            }
        }
    } catch (e) {
        console.error("Ошибка загрузки профиля", e);
    }
});

// =========================================================================
// 4. ГЛОБАЛЬНЫЕ ФУНКЦИИ ИНТЕРФЕЙСА
// =========================================================================

// Переключение вкладок нижнего меню
window.switchTab = function(tabName) {
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');

    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));

    document.getElementById(`view-${tabName}`).classList.add('active');
    document.getElementById(`nav-${tabName}`).classList.add('active');

    const topHeader = document.getElementById('main-top-header');
    if (tabName === 'wallet' || tabName === 'menu') {
        topHeader.style.display = 'none';
    } else {
        topHeader.style.display = 'flex';
    }
};

// Выпадающий список валют
window.toggleBalanceDropdown = function(event) {
    event.stopPropagation();
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light'); 
    document.getElementById('balance-dropdown').classList.toggle('show');
};

window.selectCurrency = function(currencyName, amount, iconClass, iconBgColor) {
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    document.getElementById('active-balance-amount').innerText = amount;
    
    const iconContainer = document.getElementById('active-currency-icon');
    iconContainer.style.background = iconBgColor;
    iconContainer.innerHTML = `<i class="${iconClass}" style="color: #ffffff;"></i>`;
    document.getElementById('balance-dropdown').classList.remove('show');
};

// Закрытие баланса по клику в пустое место
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('balance-dropdown');
    if (dropdown && dropdown.classList.contains('show') && !dropdown.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Переключение Языка
window.toggleLanguage = function() {
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    currentLang = (currentLang === 'ru') ? 'en' : 'ru';
    applyLanguage(currentLang);
};

function applyLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.innerText = translations[lang][key];
        }
    });

    const flagIcon = document.getElementById('language-flag');
    if (flagIcon) {
        flagIcon.innerText = (lang === 'ru') ? '🇷🇺' : '🇬🇧';
    }
}

// Переключение Темы (Мгновенное)
window.toggleTheme = function() {
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    const body = document.body;
    const themeIconSquare = document.getElementById('theme-icon-square');

    if (currentTheme === 'dark') {
        currentTheme = 'light';
        body.classList.remove('theme-dark');
        body.classList.add('theme-light');
        
        if (themeIconSquare) {
            themeIconSquare.className = "fa-solid fa-moon";
            themeIconSquare.style.color = "#6200ea"; 
        }
        
        tg.setHeaderColor('#f4f4f6');
        tg.setBackgroundColor('#f4f4f6');
    } else {
        currentTheme = 'dark';
        body.classList.remove('theme-light');
        body.classList.add('theme-dark');
        
        if (themeIconSquare) {
            themeIconSquare.className = "fa-solid fa-sun";
            themeIconSquare.style.color = "#ffb800";
        }
        
        tg.setHeaderColor('#0f0f13');
        tg.setBackgroundColor('#0f0f13');
    }
};

// Запуск игры
window.openGame = function(gameName) {
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    tg.showAlert(`Запуск игры: ${gameName}`);
};