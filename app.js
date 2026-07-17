// Открытие/закрытие выпадающего списка баланса
function toggleBalanceDropdown() {
    triggerHaptic('light'); // Вибрация для Telegram
    const dropdown = document.getElementById('balance-dropdown');
    dropdown.classList.toggle('hidden');
}

// Открытие модального окна профиля/бонусов
window.openAccountModal = function() {
    triggerHaptic('medium');
    alert('Тут мы сделаем модальное окно аккаунта и бонусов!'); 
}

// Закрываем выпадающее меню, если кликнуть мимо него
document.addEventListener('click', function(event) {
    const balancePill = document.querySelector('.balance-pill');
    const dropdown = document.getElementById('balance-dropdown');
    
    if (dropdown && !balancePill.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});