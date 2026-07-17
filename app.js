// Инициализация Telegram
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();
tg.setHeaderColor('#0f0f13');
tg.setBackgroundColor('#0f0f13');

// 1. Логика выпадающего списка баланса
function toggleBalanceDropdown(event) {
    // Предотвращаем всплытие клика, чтобы меню не закрылось сразу же
    event.stopPropagation();
    
    // Легкая вибрация при открытии
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light'); 
    
    const dropdown = document.getElementById('balance-dropdown');
    dropdown.classList.toggle('hidden');
}

// 2. Выбор валюты из списка
function selectCurrency(currencyName, amount, iconClass, iconBgColor) {
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    
    // Меняем текст баланса
    document.getElementById('active-balance-amount').innerText = amount;
    
    // Меняем иконку баланса
    const iconContainer = document.getElementById('active-currency-icon');
    iconContainer.style.background = iconBgColor;
    iconContainer.innerHTML = `<i class="${iconClass}" style="color: #ffffff;"></i>`;
    
    // Прячем меню
    document.getElementById('balance-dropdown').classList.add('hidden');
}

// 3. Закрытие меню при клике в любое пустое место экрана
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('balance-dropdown');
    
    // Если меню открыто и клик был НЕ по меню - закрываем его
    if (!dropdown.classList.contains('hidden') && !dropdown.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});

// 4. Кнопка ПЛЮС (Переход в кошелек)
function openWallet() {
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('heavy');
    // Позже здесь будет логика открытия экрана депозита
    tg.showAlert('Перенаправление в кошелек для пополнения счета...');
}

// 5. Запуск Игры
function openGame(gameName) {
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    tg.showAlert(`Запуск игры: ${gameName}`);
}