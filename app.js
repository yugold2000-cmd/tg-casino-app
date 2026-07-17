// Инициализация Telegram
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();
tg.setHeaderColor('#0f0f13');
tg.setBackgroundColor('#0f0f13');

// Получаем первую букву имени пользователя для аватарки
try {
    const user = tg.initDataUnsafe?.user;
    if (user) {
        const firstLetter = (user.first_name || user.username || 'U').charAt(0).toUpperCase();
        document.getElementById('user-avatar').innerText = firstLetter;
    }
} catch (e) {}

// --- Логика переключения Вкладок ---
function switchTab(tabName) {
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');

    // 1. Скрываем все секции (Казино, Кошелек, Меню)
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
    });

    // 2. Убираем активный цвет у всех кнопок нижнего меню
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
    });

    // 3. Показываем нужную секцию и подсвечиваем кнопку
    document.getElementById(`view-${tabName}`).classList.add('active');
    document.getElementById(`nav-${tabName}`).classList.add('active');
}

// --- Логика Баланса ---
function toggleBalanceDropdown(event) {
    event.stopPropagation();
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light'); 
    document.getElementById('balance-dropdown').classList.toggle('hidden');
}

function selectCurrency(currencyName, amount, iconClass, iconBgColor) {
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    
    // Обновляем шапку
    document.getElementById('active-balance-amount').innerText = amount;
    const iconContainer = document.getElementById('active-currency-icon');
    iconContainer.style.background = iconBgColor;
    iconContainer.innerHTML = `<i class="${iconClass}" style="color: #ffffff;"></i>`;
    
    // Обновляем большой баланс во вкладке кошелька
    document.getElementById('wallet-balance-big').innerText = `${amount} ${currencyName}`;
    
    document.getElementById('balance-dropdown').classList.add('hidden');
}

// Закрытие меню баланса при клике мимо
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('balance-dropdown');
    if (!dropdown.classList.contains('hidden') && !dropdown.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});

// Запуск Игры
function openGame(gameName) {
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    tg.showAlert(`Запуск игры: ${gameName}`);
}