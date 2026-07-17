// ==========================================
// 1. ИНИЦИАЛИЗАЦИЯ PIXI.JS (ГРАФИКА)
// ==========================================
const canvasContainer = document.getElementById('game-canvas-container');

// Убираем черный фон — ставим backgroundAlpha: 0
const app = new PIXI.Application({
    resizeTo: canvasContainer,
    backgroundAlpha: 0, // <-- Прозрачный фон!
    resolution: window.devicePixelRatio || 1,
    antialias: true
});
canvasContainer.appendChild(app.view);

// Текст множителя
const multiplierText = new PIXI.Text('1.00x', {
    fontFamily: 'Arial',
    fontSize: 64,
    fontWeight: '900',
    fill: '#ffffff'
});
multiplierText.anchor.set(0.5);
app.stage.addChild(multiplierText);

// Графика для отрисовки линий
const graphics = new PIXI.Graphics();
app.stage.addChild(graphics);

// Локальное состояние симуляции
let currentMultiplier = 1.00;
let isCrashed = false;
let crashPoint = 2.50; // Точка, где игра оборвется

// ==========================================
// 2. ИГРОВОЙ ЦИКЛ (СИМУЛЯЦИЯ)
// ==========================================

app.ticker.add((delta) => {
    // Центрируем текст при изменениях экрана
    multiplierText.x = app.screen.width / 2;
    multiplierText.y = app.screen.height / 2;

    if (isCrashed) return; // При краше анимация замирает

    // Симуляция роста
    currentMultiplier += 0.005 * delta; 

    if (currentMultiplier >= crashPoint) {
        // КРАШ!
        currentMultiplier = crashPoint;
        isCrashed = true;
        multiplierText.style.fill = '#ff4444'; // Красный цвет
        
        // Через 3 секунды перезапускаем раунд для симуляции
        setTimeout(startNewRound, 3000);
    }

    // Обновляем текст
    multiplierText.text = currentMultiplier.toFixed(2) + 'x';

    // Рисуем график
    drawGraph();
});

function drawGraph() {
    graphics.clear();
    
    const startX = 30; 
    const startY = app.screen.height - 30;
    
    // Вычисляем координаты конца прямой линии
    let targetX = startX + ((currentMultiplier - 1) * 150);
    let targetY = startY - ((currentMultiplier - 1) * 100);

    // Ограничитель по экрану
    if (targetX > app.screen.width - 30) targetX = app.screen.width - 30;
    if (targetY < 30) targetY = 30;

    // 1. Отрисовка линии ставки/пересечения (Горизонтальная линия)
    const cashoutInput = document.getElementById('cashout-target-1');
    const isAutoCheck = document.getElementById('auto-cashout-check-1').checked;
    
    if (cashoutInput && isAutoCheck) {
        const targetMult = parseFloat(cashoutInput.value);
        if (targetMult > 1.0) {
            let intersectY = startY - ((targetMult - 1) * 100);
            
            // Рисуем горизонтальную линию пересечения (цвет фиолетовый/синий)
            if (intersectY > 30 && intersectY < startY) {
                graphics.lineStyle(2, 0x5c5c77, 0.5); // Полупрозрачная пунктирная линия
                graphics.moveTo(30, intersectY);
                graphics.lineTo(app.screen.width - 30, intersectY);
            }
        }
    }

    // 2. Отрисовка главной прямой графика
    graphics.lineStyle(4, 0xff9f43, 1);
    graphics.moveTo(startX, startY);
    graphics.lineTo(targetX, targetY);
    
    // Точка на конце прямой
    graphics.beginFill(0xffffffff);
    graphics.drawCircle(targetX, targetY, 6);
    graphics.endFill();
}

function startNewRound() {
    isCrashed = false;
    currentMultiplier = 1.00;
    crashPoint = (Math.random() * 2) + 1.1; // Рандомный краш от 1.1x до 3.1x
    multiplierText.style.fill = '#ffffff';
}

// Запуск первого раунда
startNewRound();

// ==========================================
// 3. UI ФУНКЦИИ (Для кнопок)
// ==========================================
window.adjustBet = function(panelId, amount) {
    const input = document.getElementById(`bet-amount-${panelId}`);
    let val = parseInt(input.value) || 0;
    val += amount;
    if (val < 10) val = 10;
    input.value = val;
};

window.addBet = function(panelId, amount) {
    const input = document.getElementById(`bet-amount-${panelId}`);
    let val = parseInt(input.value) || 0;
    input.value = val + amount;
};