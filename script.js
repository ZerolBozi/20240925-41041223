const gameBoard = document.getElementById('game-board');
const startButton = document.getElementById('start-button');
const themeButtons = document.getElementById('theme-buttons');
const resetButton = document.getElementById('reset-button');
const changeThemeButton = document.getElementById('change-theme-button');
const gameControls = document.getElementById('game-controls');
const countdownElement = document.getElementById('countdown');
const timerElement = document.getElementById('timer');

const themes = {
    animals: {
        name: "動物",
        images: [
            '/imgs/animals/animal1.png',
            '/imgs/animals/animal2.png',
            '/imgs/animals/animal3.png',
            '/imgs/animals/animal4.png',
            '/imgs/animals/animal5.png',
            '/imgs/animals/animal6.png',
            '/imgs/animals/animal7.png',
            '/imgs/animals/animal8.png'
        ]
    },
    foods: {
        name: "食物",
        images: [
            '/imgs/foods/food1.png',
            '/imgs/foods/food2.png',
            '/imgs/foods/food3.png',
            '/imgs/foods/food4.png',
            '/imgs/foods/food5.png',
            '/imgs/foods/food6.png',
            '/imgs/foods/food7.png',
            '/imgs/foods/food8.png'
        ]
    }
};

let currentTheme = '';
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let countdownTimer;
let gameTimer;
let gameTime = 0;
let canFlip = true;

function createThemeButtons() {
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
        themeButtons.appendChild(button);
    }
}

function selectTheme(theme) {
    currentTheme = theme;
    document.getElementById('theme-selection').style.display = 'none';
    startButton.style.display = 'inline-block';
}

function createBoard() {
    const images = themes[currentTheme].images;
    const shuffledImages = [...images, ...images].sort(() => Math.random() - 0.5);
    gameBoard.innerHTML = '';
    cards = [];
    flippedCards = [];
    matchedPairs = 0;

    for (let i = 0; i < 16; i++) {
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

function checkMatch() {
    const [card1, card2] = flippedCards;
    if (card1.dataset.image === card2.dataset.image) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;

        if (matchedPairs === 8) {
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
            countdownElement.style.display = 'none';
            cards.forEach(card => card.classList.remove('flipped'));
            canFlip = true;
            startGameTimer();
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
    createBoard();
    startButton.style.display = 'none';
    gameControls.style.display = 'block';
    cards.forEach(card => card.classList.add('flipped'));
    canFlip = false;
    startCountdown(10);
}

function resetGame() {
    clearInterval(countdownTimer);
    clearInterval(gameTimer);
    timerElement.style.display = 'none';
    createBoard();
    cards.forEach(card => card.classList.add('flipped'));
    canFlip = false;
    startCountdown(10);
}

function changeTheme() {
    clearInterval(countdownTimer);
    clearInterval(gameTimer);
    gameBoard.innerHTML = '';
    gameControls.style.display = 'none';
    countdownElement.style.display = 'none';
    timerElement.style.display = 'none';
    document.getElementById('theme-selection').style.display = 'block';
    currentTheme = '';
}

function showGameCompleteAlert() {
    Swal.fire({
        title: '恭喜你贏得了遊戲！',
        text: `你的完成時間是：${gameTime}秒`,
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: '記錄成績',
        cancelButtonText: '不記錄'
    }).then((result) => {
        if (result.isConfirmed) {
            askForNickname();
        }
    });
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
        cancelButtonText: '取消'
    }).then((result) => {
        if (result.isConfirmed) {
            saveScore(result.value);
        }
    });
}

function saveScore(nickname) {
    const score = {
        nickname: nickname,
        theme: currentTheme,
        time: gameTime,
        date: new Date().toISOString()
    };

    let scores = JSON.parse(localStorage.getItem('memoryGameScores')) || [];
    scores.push(score);
    scores.sort((a, b) => a.time - b.time);
    scores = scores.slice(0, 10); // 只保留前10名

    localStorage.setItem('memoryGameScores', JSON.stringify(scores));

    showLeaderboard();
}

function showLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('memoryGameScores')) || [];
    let leaderboardHtml = '<ol>';
    scores.forEach(score => {
        leaderboardHtml += `<li>${score.nickname} - ${score.theme} - ${score.time}秒</li>`;
    });
    leaderboardHtml += '</ol>';

    Swal.fire({
        title: '排行榜',
        html: leaderboardHtml,
        icon: 'info'
    });
}

startButton.addEventListener('click', startGame);
resetButton.addEventListener('click', resetGame);
changeThemeButton.addEventListener('click', changeTheme);
createThemeButtons();