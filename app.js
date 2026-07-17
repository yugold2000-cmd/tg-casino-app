// app.js - Логика работы интерфейса

// 1. Инициализация Telegram SDK
const tg = window.Telegram.WebApp;

// Вызываем ready(), чтобы убрать лоадер самого Telegram
tg.ready();

// Разворачиваем приложение на весь экран телефона
tg.expand();

// Настраиваем цвета шапки и фона Telegram под стиль нашего приложения (индиго/черный)
tg.setHeaderColor('#0B0914');
tg.setBackgroundColor('#0B0914');

// 2. Глобальные переменные (пока нет сервера, баланс живет здесь)
let currentBalance = 1500; 

// 3. Выполняется при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    
    // Имитация загрузки: ждем 1.5 секунды (для красоты), затем показываем приложение
    setTimeout(() => {
        document.getElementById('preloader').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        
        initUser(); // Загружаем имя
        updateBalanceDisplay(); // Отрисовываем баланс
    }, 1500); 
    
});

// 4. Парсим данные пользователя из Telegram
function initUser() {
    try {
        const user = tg.initDataUnsafe?.user;
        
        if (user) {
            const username = user.first_name || user.username || 'Игрок';
            document.getElementById('username').innerText = username;
            
            // Аватарка из первой буквы
            const firstLetter = username.charAt(0).toUpperCase();
            document.getElementById('user-avatar').innerText = firstLetter;
        }
    } catch (error) {
        console.error("Ошибка TG SDK. Запущено в браузере?", error);
    }
}

// 5. Логика баланса
function updateBalanceDisplay() {
    // Форматируем с пробелами: 1500 -> 1 500
    const formattedBalance = currentBalance.toLocaleString('ru-RU');
    
    document.getElementById('balance').innerText = formattedBalance;
    
    const walletBalance = document.getElementById('wallet-balance-display');
    if(walletBalance) walletBalance.innerText = formattedBalance + ' ₽';
}

// Пасхалка (тестовое пополнение)
window.addMockBalance = function() {
    triggerHaptic('heavy');
    currentBalance += 500;
    updateBalanceDisplay();
    tg.showAlert('+500.');
}

// 6. Переключение вкладок меню
window.switchTab = function(tabId, element) {
    triggerHaptic('light'); // Легкая вибрация телефона
    
    const targetTab = document.getElementById(`tab-${tabId}`);
    
    if (!targetTab) {
        tg.showAlert('Этот раздел находится в разработке!');
        return; 
    }
    
    // Скрываем всё, убираем подсветку
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    // Показываем нужное
    targetTab.classList.add('active');
    element.classList.add('active');
}

// Открытие модального окна игры
window.openGameModal = function(gameTitle, imagePath) {
    triggerHaptic('medium'); 
    
    // Подставляем название игры
    document.getElementById('modal-game-title').innerText = gameTitle;
    
    // Вместо иконки шрифта вставляем красивое фоновое превью картинки в модалку
    document.getElementById('modal-game-icon').innerHTML = `
        <img src="${imagePath}" alt="${gameTitle}" style="width: 120px; height: 75px; object-fit: cover; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
    `;
    
    // Показываем модалку
    document.getElementById('game-modal').classList.remove('hidden');
}

window.closeGameModal = function() {
    triggerHaptic('light');
    document.getElementById('game-modal').classList.add('hidden');
}

window.playMockGame = function() {
    triggerHaptic('heavy');
    const betAmount = 100;
    
    if (currentBalance >= betAmount) {
        currentBalance -= betAmount;
        updateBalanceDisplay();
        closeGameModal();
        tg.showAlert('Ставка 100 ₽ принята!');
    } else {
        tg.showAlert('Недостаточно средств!');
    }
}

// 8. Вибрация телефона (Haptic Feedback)
window.triggerHaptic = function(style = 'medium') {
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred(style); // Возможные варианты: light, medium, heavy, rigid, soft
    }
}

