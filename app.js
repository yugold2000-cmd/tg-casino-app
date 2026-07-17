// ==========================================
// 1. ГЛОБАЛЬНЫЕ НАСТРОЙКИ TELEGRAM SDK
// ==========================================
const tg = window.Telegram.WebApp;
window.tg = tg; // Делаем tg доступным для HTML-кнопок напрямую

// Глобальные переменные состояния приложения
let currentLang = 'en'; 
let currentTheme = 'dark'; 

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
        menu_responsible: "Ответственная игра",
        menu_channel_short: "Канал",
        menu_language: "Язык",
        menu_theme_short: "Тема",
        nav_wallet: "Кошелек",
        nav_main: "Главная",
        nav_menu: "Меню"
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
        menu_responsible: "Responsible Gaming",
        menu_channel_short: "Channel",
        menu_language: "Language",
        menu_theme_short: "Theme",
        nav_wallet: "Wallet",
        nav_main: "Main",
        nav_menu: "Menu"
    }
};

// ==========================================
// 2. ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Говорим Телеграму, что мы готовы
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

// ==========================================
// 3. ГЛОБАЛЬНЫЕ ФУНКЦИИ ИНТЕРФЕЙСА
// ==========================================

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
    flagIcon.innerText = (lang === 'ru') ? '🇷🇺' : '🇬🇧';
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
        
        themeIconSquare.className = "fa-solid fa-moon";
        themeIconSquare.style.color = "#6200ea"; 
        
        tg.setHeaderColor('#f4f4f6');
        tg.setBackgroundColor('#f4f4f6');
    } else {
        currentTheme = 'dark';
        body.classList.remove('theme-light');
        body.classList.add('theme-dark');
        
        themeIconSquare.className = "fa-solid fa-sun";
        themeIconSquare.style.color = "#ffb800";
        
        tg.setHeaderColor('#0f0f13');
        tg.setBackgroundColor('#0f0f13');
    }
};

// Запуск игры
window.openGame = function(gameName) {
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    tg.showAlert(`Запуск игры: ${gameName}`);
};