document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#0f0f13');
    tg.setBackgroundColor('#0f0f13');

    // 1. Аватарка из Телеграм
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

    // 2. Переключение вкладок
    window.switchTab = function(tabName) {
        if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');

        // Скрываем все секции и убираем активный цвет у кнопок
        document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));

        // Показываем нужную вкладку
        document.getElementById(`view-${tabName}`).classList.add('active');
        document.getElementById(`nav-${tabName}`).classList.add('active');

        // Логика скрытия верхней панели
        const topHeader = document.getElementById('main-top-header');
        if (tabName === 'wallet' || tabName === 'menu') {
            topHeader.style.display = 'none'; // Скрываем верхнюю панель в кошельке и меню
        } else {
            topHeader.style.display = 'flex'; // Возвращаем на Главной странице
        }
    };

    // 3. Выпадающее меню баланса
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

    document.addEventListener('click', function(event) {
        const dropdown = document.getElementById('balance-dropdown');
        if (dropdown && dropdown.classList.contains('show') && !dropdown.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    });

    // 4. Открытие игры
    window.openGame = function(gameName) {
        if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
        tg.showAlert(`Запуск игры: ${gameName}`);
    };
});