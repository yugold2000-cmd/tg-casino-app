const canvasContainer = document.getElementById('game-canvas-container');

// 1. ИНИЦИАЛИЗАЦИЯ PIXI.JS
const app = new PIXI.Application({
    resizeTo: canvasContainer,
    backgroundColor: 0x1b1c27, // Темный сине-серый фон как на фото
    resolution: window.devicePixelRatio || 1,
    antialias: true
});
canvasContainer.appendChild(app.view);

// Контейнеры для слоев (чтобы сетка была сзади, а плашка спереди)
const gridLayer = new PIXI.Graphics();
const lineLayer = new PIXI.Graphics();
const tooltipLayer = new PIXI.Container();

app.stage.addChild(gridLayer);
app.stage.addChild(lineLayer);
app.stage.addChild(tooltipLayer);

// --- СОЗДАНИЕ ЖЕЛТОЙ ПЛАШКИ (ТУЛТИПА) ---
const tooltipBg = new PIXI.Graphics();
const tooltipText = new PIXI.Text('1.00x', {
    fontFamily: 'Arial',
    fontSize: 16,
    fontWeight: 'bold',
    fill: '#000000'
});
tooltipText.anchor.set(0.5);
tooltipText.y = -25; // Поднимаем текст внутри плашки

tooltipLayer.addChild(tooltipBg);
tooltipLayer.addChild(tooltipText);
tooltipLayer.visible = false; // Скрываем до начала игры

// Отрисовка желтого фона плашки с хвостиком
function drawTooltipBg(textWidth) {
    tooltipBg.clear();
    tooltipBg.beginFill(0xffb800); // Желтый цвет
    
    const w = Math.max(60, textWidth + 20);
    const h = 30;
    const yOffset = -40; // Смещение вверх от точки

    // Закругленный прямоугольник
    tooltipBg.drawRoundedRect(-w/2, yOffset, w, h, 6);
    
    // Треугольник (хвостик вниз)
    tooltipBg.moveTo(-5, yOffset + h);
    tooltipBg.lineTo(5, yOffset + h);
    tooltipBg.lineTo(0, yOffset + h + 6);
    tooltipBg.endFill();
}


// 2. ИГРОВЫЕ ПЕРЕМЕННЫЕ
const STATE_WAITING = 0; // Ждем ставки
const STATE_PLAYING = 1; // Ракета летит
const STATE_CRASHED = 2; // Краш

let gameState = STATE_WAITING;
let currentMultiplier = 1.00;
let crashPoint = 0;
let waitTimer = 5.0; 
let animTime = 0; // Время полета для анимации графика

// --- БАЛАНС И СТАВКИ ---
// ПОТОМ: Здесь ты свяжешь userBalance со своей БД на Golang!
let userBalance = 10000.00; 
let currentBet = 0;
let hasPlacedBet = false;
let hasCashedOut = false;

const balanceEl = document.getElementById('user-balance');
const actionBtn = document.getElementById('main-action-btn');
const actionBtnText = document.getElementById('action-btn-text');
const actionBtnSubtext = document.getElementById('action-btn-subtext');

// Обновление цифр на экране
function updateUIBalance() {
    balanceEl.innerText = userBalance.toFixed(2);
}
updateUIBalance();


// 3. ФУНКЦИИ КНОПОК
window.adjustBet = function(amount) {
    if (gameState !== STATE_WAITING) return;
    const input = document.getElementById('bet-amount');
    let val = parseInt(input.value) || 0;
    val += amount;
    if (val < 10) val = 10;
    if (val > userBalance) val = Math.floor(userBalance);
    input.value = val;
};

window.addBet = function(amount) {
    if (gameState !== STATE_WAITING) return;
    const input = document.getElementById('bet-amount');
    let val = parseInt(input.value) || 0;
    val += amount;
    if (val > userBalance) val = Math.floor(userBalance);
    input.value = val;
};

// Главная кнопка (СТАВКА / ЗАБРАТЬ)
window.handleMainAction = function() {
    // 1. Если ждем начала и ставку еще не сделали
    if (gameState === STATE_WAITING && !hasPlacedBet) {
        const betInput = parseInt(document.getElementById('bet-amount').value);
        if (betInput > 0 && betInput <= userBalance) {
            currentBet = betInput;
            userBalance -= currentBet; // Снимаем бабки
            updateUIBalance();
            hasPlacedBet = true;
            hasCashedOut = false;
            
            // Кнопка переходит в режим ожидания старта
            actionBtn.className = "action-btn waiting";
            actionBtnText.innerText = "ОЖИДАНИЕ";
            actionBtnSubtext.innerText = "Ставка принята";
        } else {
            alert("Недостаточно средств!");
        }
    } 
    // 2. Если летим, мы в игре и еще не забрали
    else if (gameState === STATE_PLAYING && hasPlacedBet && !hasCashedOut) {
        hasCashedOut = true;
        const winAmount = currentBet * currentMultiplier;
        userBalance += winAmount; // Начисляем выигрыш
        updateUIBalance();
        
        // Кнопка зеленая - выигрыш
        actionBtn.className = "action-btn place-bet";
        actionBtnText.innerText = "ВЫИГРЫШ!";
        actionBtnSubtext.innerText = "+" + winAmount.toFixed(2) + " ₽";
    }
};


// 4. ИГРОВОЙ ЦИКЛ (АНИМАЦИЯ PIXI)
app.ticker.add((delta) => {
    
    // --- Отрисовка фона и сетки ---
    drawGrid();

    // --- ЛОГИКА ОЖИДАНИЯ СТАРТА ---
    if (gameState === STATE_WAITING) {
        waitTimer -= 0.016 * delta;
        lineLayer.clear();
        tooltipLayer.visible = true;
        
        if (waitTimer <= 0) {
            startGame();
        } else {
            tooltipText.text = `Старт: ${Math.ceil(waitTimer)}с`;
            drawTooltipBg(tooltipText.width);
            tooltipLayer.x = app.screen.width / 2;
            tooltipLayer.y = app.screen.height / 2;
        }
    } 
    // --- ЛОГИКА ПОЛЕТА ---
    else if (gameState === STATE_PLAYING) {
        animTime += 0.016 * delta;
        // Плавный рост икса (экспоненциальный для реалистичности)
        currentMultiplier = 1.00 + (animTime * animTime * 0.2); 

        // Проверка Автовывода
        const isAutoCashout = document.getElementById('auto-cashout-check').checked;
        const autoCashoutVal = parseFloat(document.getElementById('cashout-target').value);
        if (isAutoCashout && hasPlacedBet && !hasCashedOut && currentMultiplier >= autoCashoutVal) {
            handleMainAction(); 
        }

        // Проверка Краша
        if (currentMultiplier >= crashPoint) {
            crashGame();
        } else {
            // Отрисовка графика
            drawGraph();
            
            // Если мы в игре, кнопка оранжевая и показывает, сколько заберем
            if (hasPlacedBet && !hasCashedOut) {
                actionBtn.className = "action-btn cashout";
                actionBtnText.innerText = "ЗАБРАТЬ";
                actionBtnSubtext.innerText = (currentBet * currentMultiplier).toFixed(2) + " ₽";
            }
        }
    }
});


// 5. ОТРИСОВКА ГРАФИКИ
function drawGrid() {
    gridLayer.clear();
    gridLayer.lineStyle(1, 0xffffff, 0.1); // Полупрозрачные линии сетки

    // Вертикальная и горизонтальная ось (пунктир эмулируем через альфу для скорости)
    const paddingX = 40;
    const paddingY = 40;
    
    // Ось X
    gridLayer.moveTo(paddingX, app.screen.height - paddingY);
    gridLayer.lineTo(app.screen.width, app.screen.height - paddingY);
    
    // Ось Y
    gridLayer.moveTo(paddingX, 0);
    gridLayer.lineTo(paddingX, app.screen.height - paddingY);
}

function drawGraph() {
    lineLayer.clear();
    tooltipLayer.visible = true;

    const startX = 40;
    const startY = app.screen.height - 40;
    
    // Прямая линия растет вправо и вверх
    let targetX = startX + (animTime * 60);
    let targetY = startY - (animTime * 40);

    // Ограничитель, чтобы линия не ушла за экран (она упрется в край, а икс будет расти)
    if (targetX > app.screen.width - 50) targetX = app.screen.width - 50;
    if (targetY < 50) targetY = 50;

    // --- НЕОНОВОЕ СВЕЧЕНИЕ (Глоу эффект как на фото) ---
    lineLayer.lineStyle(12, 0x8b5cf6, 0.15); // Широкий прозрачный
    lineLayer.moveTo(startX, startY);
    lineLayer.lineTo(targetX, targetY);

    lineLayer.lineStyle(6, 0x8b5cf6, 0.4); // Средний
    lineLayer.moveTo(startX, startY);
    lineLayer.lineTo(targetX, targetY);

    lineLayer.lineStyle(3, 0xa78bfa, 1); // Тонкий яркий центр
    lineLayer.moveTo(startX, startY);
    lineLayer.lineTo(targetX, targetY);

    // Точка в начале (1x)
    lineLayer.beginFill(0xa78bfa);
    lineLayer.drawCircle(startX, startY, 4);
    lineLayer.endFill();

    // Точка в конце линии
    lineLayer.beginFill(0xa78bfa);
    lineLayer.drawCircle(targetX, targetY, 4);
    lineLayer.endFill();

    // Обновляем желтую плашку
    tooltipText.text = currentMultiplier.toFixed(2) + 'x';
    drawTooltipBg(tooltipText.width);
    
    tooltipLayer.x = targetX;
    tooltipLayer.y = targetY;
}


// 6. УПРАВЛЕНИЕ ИГРОЙ
function startGame() {
    gameState = STATE_PLAYING;
    animTime = 0;
    currentMultiplier = 1.00;
    crashPoint = (Math.random() * 3) + 1.1; // Демо-генерация краша
    
    tooltipText.style.fill = '#000000'; // Текст черный

    if (!hasPlacedBet) {
        actionBtn.className = "action-btn waiting";
        actionBtnText.innerText = "ИГРА ИДЕТ";
        actionBtnSubtext.innerText = "Ждите след. раунд";
    }
}

function crashGame() {
    gameState = STATE_CRASHED;
    currentMultiplier = crashPoint;
    
    // При краше плашка и линия становятся красными
    tooltipBg.clear();
    tooltipBg.beginFill(0xff4444);
    tooltipBg.drawRoundedRect(-40, -40, 80, 30, 6);
    tooltipBg.moveTo(-5, -10); tooltipBg.lineTo(5, -10); tooltipBg.lineTo(0, -4);
    tooltipBg.endFill();
    
    tooltipText.style.fill = '#ffffff';
    tooltipText.text = currentMultiplier.toFixed(2) + 'x';

    // Добавляем в историю сверху (синий если <2, фиолетовый если >2)
    addHistoryItem(currentMultiplier);

    // Если был в игре и не забрал — проиграл
    if (hasPlacedBet && !hasCashedOut) {
        actionBtn.className = "action-btn waiting";
        actionBtnText.innerText = "ПРОИГРЫШ";
        actionBtnSubtext.innerText = `-${currentBet} ₽`;
    }

    // Рестарт через 3 секунды
    setTimeout(() => {
        gameState = STATE_WAITING;
        waitTimer = 5.0;
        hasPlacedBet = false;
        hasCashedOut = false;
        currentBet = 0;
        
        actionBtn.className = "action-btn place-bet";
        actionBtnText.innerText = "СТАВКА";
        actionBtnSubtext.innerText = "";
    }, 3000);
}

function addHistoryItem(mult) {
    const historyBar = document.getElementById('history-bar');
    const el = document.createElement('div');
    el.className = 'history-item';
    el.innerText = mult.toFixed(2) + 'x';
    el.style.backgroundColor = mult >= 2.0 ? '#8b5cf6' : '#3b82f6'; // Фиолетовый или синий
    el.style.color = 'white';
    
    historyBar.insertBefore(el, historyBar.firstChild);
    if (historyBar.children.length > 10) historyBar.removeChild(historyBar.lastChild);
}