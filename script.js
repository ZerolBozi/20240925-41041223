const gameBoard = document.getElementById('game-board');
const startButton = document.getElementById('start-button');
const leaderboardButton = document.getElementById('leaderboard-button');
const backButton = document.getElementById('back-button');
const themeButtons = document.getElementById('theme-buttons');
const resetButton = document.getElementById('reset-button');
const changeThemeButton = document.getElementById('change-theme-button');
const gameControls = document.getElementById('game-controls');
const countdownElement = document.getElementById('countdown');
const timerElement = document.getElementById('timer');
const soundToggle = document.getElementById('sound-toggle');

const themes = {
    animals: {
        name: "動物",
        images: [
            'imgs/animals/animal1.png',
            'imgs/animals/animal2.png',
            'imgs/animals/animal3.png',
            'imgs/animals/animal4.png',
            'imgs/animals/animal5.png',
            'imgs/animals/animal6.png',
            'imgs/animals/animal7.png',
            'imgs/animals/animal8.png',
            'imgs/animals/animal9.png',
            'imgs/animals/animal10.png',
            'imgs/animals/animal11.png',
            'imgs/animals/animal12.png',
            'imgs/animals/animal13.png',
            'imgs/animals/animal14.png',
            'imgs/animals/animal15.png',
            'imgs/animals/animal16.png',
            'imgs/animals/animal17.png',
            'imgs/animals/animal18.png'
        ]
    },
    foods: {
        name: "食物",
        images: [
            'imgs/foods/food1.png',
            'imgs/foods/food2.png',
            'imgs/foods/food3.png',
            'imgs/foods/food4.png',
            'imgs/foods/food5.png',
            'imgs/foods/food6.png',
            'imgs/foods/food7.png',
            'imgs/foods/food8.png',
            'imgs/foods/food9.png',
            'imgs/foods/food10.png',
            'imgs/foods/food11.png',
            'imgs/foods/food12.png',
            'imgs/foods/food13.png',
            'imgs/foods/food14.png',
            'imgs/foods/food15.png',
            'imgs/foods/food16.png',
            'imgs/foods/food17.png',
            'imgs/foods/food18.png'
        ]
    },
    sports: {
        name: "運動",
        images: [
            'imgs/sports/sport1.png',
            'imgs/sports/sport2.png',
            'imgs/sports/sport3.png',
            'imgs/sports/sport4.png',
            'imgs/sports/sport5.png',
            'imgs/sports/sport6.png',
            'imgs/sports/sport7.png',
            'imgs/sports/sport8.png',
            'imgs/sports/sport9.png',
            'imgs/sports/sport10.png',
            'imgs/sports/sport11.png',
            'imgs/sports/sport12.png',
            'imgs/sports/sport13.png',
            'imgs/sports/sport14.png',
            'imgs/sports/sport15.png',
            'imgs/sports/sport16.png',
            'imgs/sports/sport17.png',
            'imgs/sports/sport18.png'
        ]
    }
};

const isDevelopmentMode = false;
const flipSound = new Audio('sounds/flipcard.mp3');
let currentTheme = '';
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let countdownTimer;
let gameTimer;
let gameTime = 0;
let canFlip = true;
let currentMode = '';
let isCountingDown = false;
let isSoundOn = true;
let flipCount = 0;

function initializeGame() {
    console.log('Game initialized');
    createThemeButtons();
    setupModeButtons();
    const debugCompleteButton = document.getElementById('debug-complete-button');
    const clearLeaderboardButton = document.getElementById('clear-leaderboard');
    if (isDevelopmentMode) {
        debugCompleteButton.style.display = 'inline-block';
        debugCompleteButton.addEventListener('click', debugCompleteGame);
    }
    clearLeaderboardButton.addEventListener('click', clearLeaderboard);

    const soundToggle = document.getElementById('sound-toggle');
    soundToggle.addEventListener('click', toggleSound);
}

function setupModeButtons() {
    const modeButtons = document.querySelectorAll('.mode-button');
    modeButtons.forEach(button => {
        button.addEventListener('click', () => selectMode(button.dataset.mode));
    });
}

function selectMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-button').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector(`.mode-button[data-mode="${mode}"]`).classList.add('selected');
    startButton.style.display = 'inline-block';
    leaderboardButton.style.display = 'inline-block';
    backButton.style.display = 'inline-block';
}

function createThemeButtons() {
    const themeButtonsContainer = document.getElementById('theme-buttons');
    themeButtonsContainer.innerHTML = ''; // 清空現有的按鈕

    for (const theme in themes) {
        const button = document.createElement('div');
        button.classList.add('theme-button');
        const img = document.createElement('img');
        img.src = themes[theme].images[Math.floor(Math.random() * themes[theme].images.length)];
        const text = document.createElement('span');
        text.textContent = themes[theme].name;
        button.appendChild(img);
        button.appendChild(text);
        button.addEventListener('click', () => selectTheme(theme));
        themeButtonsContainer.appendChild(button);
    }
}

function selectTheme(theme) {
    currentTheme = theme;
    document.getElementById('theme-selection').style.display = 'none';
    document.getElementById('mode-selection').style.display = 'block';
}

function createBoard() {
    const images = themes[currentTheme].images;
    let gridSize;
    let cardCount;

    switch (currentMode) {
        case '2x2':
            gridSize = 2;
            cardCount = 4;
            break;
        case '4x4':
            gridSize = 4;
            cardCount = 16;
            break;
        case '6x6':
            gridSize = 6;
            cardCount = 36;
            break;
        default:
            console.error('Invalid mode');
            return;
    }

    const shuffledImages = [...images.slice(0, cardCount / 2), ...images.slice(0, cardCount / 2)].sort(() => Math.random() - 0.5);
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    gameBoard.className = `game-board grid-${gridSize}x${gridSize}`; // Add this line
    
    cards = [];
    flippedCards = [];
    matchedPairs = 0;

    for (let i = 0; i < cardCount; i++) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front"></div>
                <div class="card-back">
                    <img src="${shuffledImages[i]}" alt="card image">
                </div>
            </div>
        `;
        card.dataset.image = shuffledImages[i];
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
        cards.push(card);
    }
}

function flipCard() {
    if (!canFlip || this.classList.contains('flipped') || this.classList.contains('matched')) {
        return;
    }

    this.classList.add('flipped');
    singleFlipCount++;

    if (singleFlipCount % 2 === 0) {
        flipCount++;
        updateFlipCounter();
    }

    if (isSoundOn) {
        flipSound.play();
    }

    flippedCards.push(this);

    if (flippedCards.length === 2) {
        canFlip = false;
        checkMatch();
    } else if (flippedCards.length > 2) {
        const [card1, card2] = flippedCards;
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        flippedCards = [this];
        canFlip = true;
    }
}

function updateFlipCounter() {
    const flipElement = document.getElementById('fliper');
    flipElement.textContent = `次數：${flipCount}次`;
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    if (card1.dataset.image === card2.dataset.image) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;

        if (matchedPairs === cards.length / 2) {
            clearInterval(gameTimer);
            setTimeout(showGameCompleteAlert, 500);
        }
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
        }, 1000);
    }
    flippedCards = [];
    canFlip = true;
}

function startCountdown(seconds) {
    countdownElement.style.display = 'block';
    let timeLeft = seconds;

    countdownTimer = setInterval(() => {
        countdownElement.textContent = `記憶時間：${timeLeft}秒`;
        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(countdownTimer);
            startGamePlay();
        }
    }, 1000);
}

function startGameTimer() {
    timerElement.style.display = 'block';
    gameTime = 0;
    gameTimer = setInterval(() => {
        gameTime++;
        timerElement.textContent = `時間：${gameTime}秒`;
    }, 1000);
}

function startGame() {
    if (!currentTheme || !currentMode) {
        Swal.fire('錯誤', '請選擇主題和模式', 'error');
        return;
    }
    createBoard();
    document.getElementById('game-setup').style.display = 'none';
    gameControls.style.display = 'block';
    resetButton.textContent = '直接開始';
    cards.forEach(card => card.classList.add('flipped'));
    canFlip = false;
    isCountingDown = true;
    startCountdown(10);
    flipCount = 0;
    singleFlipCount = 0;
    updateFlipCounter();
    document.getElementById('fliper').style.display = 'block';
    if (isDevelopmentMode) {
        document.getElementById('debug-complete-button').style.display = 'inline-block';
    }
}

function resetGame() {
    if (isCountingDown) {
        startGameImmediately();
    } else {
        clearInterval(gameTimer);
        timerElement.style.display = 'none';
        createBoard();
        cards.forEach(card => card.classList.add('flipped'));
        canFlip = false;
        isCountingDown = true;
        resetButton.textContent = '直接開始';
        startCountdown(10);
        flipCount = 0;
        singleFlipCount = 0;
        updateFlipCounter();
    }
}

function startGameImmediately() {
    clearInterval(countdownTimer);
    startGamePlay();
}

function startGamePlay() {
    countdownElement.style.display = 'none';
    cards.forEach(card => card.classList.remove('flipped'));
    canFlip = true;
    isCountingDown = false;
    resetButton.textContent = '重置遊戲';
    startGameTimer();
}

function changeTheme() {
    clearInterval(countdownTimer);
    clearInterval(gameTimer);
    isCountingDown = false;
    gameBoard.innerHTML = '';
    gameControls.style.display = 'none';
    countdownElement.style.display = 'none';
    timerElement.style.display = 'none';
    resetButton.textContent = '重置遊戲';
    document.getElementById('game-setup').style.display = 'block';
    document.getElementById('theme-selection').style.display = 'block';
    document.getElementById('mode-selection').style.display = 'none';
    startButton.style.display = 'none';
    leaderboardButton.style.display = 'none';
    backButton.style.display = 'none';
    currentTheme = '';
    currentMode = '';
}

function askForNickname() {
    Swal.fire({
        title: '請輸入你的暱稱',
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: '儲存',
        cancelButtonText: '取消',
        inputValidator: (value) => {
            if (!value) {
                return '請輸入暱稱！';
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            saveScore(result.value);
        } else {
            showLeaderboard();
        }
    });
}

function saveScore(nickname) {
    if (!currentTheme || !currentMode) {
        console.error('Error: currentTheme or currentMode is not set');
        Swal.fire('錯誤', '無法保存分數，請重試', 'error');
        return;
    }

    const score = {
        nickname: nickname,
        time: gameTime,
        flips: flipCount,
        date: new Date().toISOString()
    };

    try {
        let allScores = JSON.parse(localStorage.getItem('memoryGameScores')) || {};
        if (!allScores[currentTheme]) {
            allScores[currentTheme] = {};
        }
        if (!allScores[currentTheme][currentMode]) {
            allScores[currentTheme][currentMode] = [];
        }

        const scores = allScores[currentTheme][currentMode];
        const existingScoreIndex = scores.findIndex(s => s.nickname === nickname);

        if (existingScoreIndex !== -1) {
            const existingScore = scores[existingScoreIndex];
            if (score.time < existingScore.time || (score.time === existingScore.time && score.flips < existingScore.flips)) {
                scores[existingScoreIndex] = score;
                console.log('Existing score updated:', score);
            } else {
                console.log('New score is not better, keeping the existing one');
            }
        } else {
            scores.push(score);
            console.log('New score added:', score);
        }

        scores.sort((a, b) => {
            if (a.time !== b.time) {
                return a.time - b.time;
            }
            return a.flips - b.flips;
        });
        allScores[currentTheme][currentMode] = scores.slice(0, 10);

        console.log('All scores:', allScores);

        localStorage.setItem('memoryGameScores', JSON.stringify(allScores));
        Swal.fire('成功', '你的分數已成功保存！', 'success').then(() => {
            showLeaderboard();
        });
    } catch (error) {
        console.error('Error saving score:', error);
        Swal.fire('錯誤', '保存分數時出錯，請重試', 'error');
    }
}

function showLeaderboard() {
    const allScores = JSON.parse(localStorage.getItem('memoryGameScores')) || {};
    const themeScores = allScores[currentTheme] || {};
    const scores = themeScores[currentMode] || [];
    
    let leaderboardHtml = `<h3>${themes[currentTheme].name}主題 - ${currentMode}模式 排行榜</h3>`;
    
    if (scores.length === 0) {
        leaderboardHtml += `<p>目前${themes[currentTheme].name}主題的${currentMode}模式還沒有紀錄。</p>`;
    } else {
        leaderboardHtml += '<ol>';
        scores.forEach(score => {
            leaderboardHtml += `<li>${score.nickname} - ${score.time}秒 (${score.flips}次翻牌)</li>`;
        });
        leaderboardHtml += '</ol>';
    }

    Swal.fire({
        title: '排行榜',
        html: leaderboardHtml,
        icon: 'info',
        confirmButtonText: '關閉'
    });
}

function showGameCompleteAlert() {
    Swal.fire({
        title: '恭喜你贏得了遊戲！',
        text: `你的完成時間是：${gameTime}秒，翻牌次數：${flipCount}次`,
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: '記錄成績',
        cancelButtonText: '不記錄'
    }).then((result) => {
        if (result.isConfirmed) {
            askForNickname();
        } else {
            showLeaderboard();
        }
    });
}

function debugCompleteGame() {
    clearInterval(gameTimer);
    gameTime = Math.floor(Math.random() * 60) + 1;
    flipCount = Math.floor(Math.random() * 1000) + 1;
    cards.forEach(card => card.classList.add('matched'));
    showGameCompleteAlert();
}

function clearLeaderboard() {
    Swal.fire({
        title: '確定要清除排行榜嗎？',
        text: "這個操作不可逆！",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '是的，清除它！',
        cancelButtonText: '取消'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('memoryGameScores');
            Swal.fire(
                '已清除！',
                '排行榜已被清除。',
                'success'
            );
        }
    });
}

function toggleSound() {
    isSoundOn = !isSoundOn;
    const soundToggle = document.getElementById('sound-toggle');
    soundToggle.classList.toggle('off');
    soundToggle.textContent = isSoundOn ? '🔊 開啟音效' : '🔇 關閉音效';
}

startButton.addEventListener('click', startGame);
leaderboardButton.addEventListener('click', showLeaderboard);
backButton.addEventListener('click', changeTheme);
resetButton.addEventListener('click', resetGame);
changeThemeButton.addEventListener('click', changeTheme);
soundToggle.addEventListener('click', toggleSound);
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    const soundToggle = document.getElementById('sound-toggle');
    soundToggle.addEventListener('click', toggleSound);
});