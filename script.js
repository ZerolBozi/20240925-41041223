const THEMES = {
    animals: {
        name: "動物",
        images: [
            'imgs/animals/animal1.png', 'imgs/animals/animal2.png', 'imgs/animals/animal3.png',
            'imgs/animals/animal4.png', 'imgs/animals/animal5.png', 'imgs/animals/animal6.png',
            'imgs/animals/animal7.png', 'imgs/animals/animal8.png', 'imgs/animals/animal9.png',
            'imgs/animals/animal10.png', 'imgs/animals/animal11.png', 'imgs/animals/animal12.png',
            'imgs/animals/animal13.png', 'imgs/animals/animal14.png', 'imgs/animals/animal15.png',
            'imgs/animals/animal16.png', 'imgs/animals/animal17.png', 'imgs/animals/animal18.png'
        ]
    },
    foods: {
        name: "食物",
        images: [
            'imgs/foods/food1.png', 'imgs/foods/food2.png', 'imgs/foods/food3.png',
            'imgs/foods/food4.png', 'imgs/foods/food5.png', 'imgs/foods/food6.png',
            'imgs/foods/food7.png', 'imgs/foods/food8.png', 'imgs/foods/food9.png',
            'imgs/foods/food10.png', 'imgs/foods/food11.png', 'imgs/foods/food12.png',
            'imgs/foods/food13.png', 'imgs/foods/food14.png', 'imgs/foods/food15.png',
            'imgs/foods/food16.png', 'imgs/foods/food17.png', 'imgs/foods/food18.png'
        ]
    },
    sports: {
        name: "運動",
        images: [
            'imgs/sports/sport1.png', 'imgs/sports/sport2.png', 'imgs/sports/sport3.png',
            'imgs/sports/sport4.png', 'imgs/sports/sport5.png', 'imgs/sports/sport6.png',
            'imgs/sports/sport7.png', 'imgs/sports/sport8.png', 'imgs/sports/sport9.png',
            'imgs/sports/sport10.png', 'imgs/sports/sport11.png', 'imgs/sports/sport12.png',
            'imgs/sports/sport13.png', 'imgs/sports/sport14.png', 'imgs/sports/sport15.png',
            'imgs/sports/sport16.png', 'imgs/sports/sport17.png', 'imgs/sports/sport18.png'
        ]
    }
};

const GAME_MODES = {
    '2x2': { gridSize: 2, cardCount: 4 },
    '4x4': { gridSize: 4, cardCount: 16 },
    '6x6': { gridSize: 6, cardCount: 36 }
};

const IS_DEVELOPMENT_MODE = false;

class MemoryGame {
    constructor() {
        this.gameBoard = document.getElementById('game-board');
        this.startButton = document.getElementById('start-button');
        this.leaderboardButton = document.getElementById('leaderboard-button');
        this.backButton = document.getElementById('back-button');
        this.themeButtons = document.getElementById('theme-buttons');
        this.resetButton = document.getElementById('reset-button');
        this.changeThemeButton = document.getElementById('change-theme-button');
        this.gameControls = document.getElementById('game-controls');
        this.countdownElement = document.getElementById('countdown');
        this.timerElement = document.getElementById('timer');
        this.fliperElement = document.getElementById('fliper');
        this.soundToggle = document.getElementById('sound-toggle');
        this.flipSound = new Audio('sounds/flipcard.mp3');

        this.currentTheme = '';
        this.currentMode = '';
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.gameTime = 0;
        this.flipCount = 0;
        this.singleFlipCount = 0;
        this.canFlip = true;
        this.isCountingDown = false;
        this.isSoundOn = true;

        this.countdownTimer = null;
        this.gameTimer = null;

        this.initializeGame();
    }

    initializeGame() {
        this.createThemeButtons();
        this.setupModeButtons();
        this.setupEventListeners();

        if (IS_DEVELOPMENT_MODE) {
            const debugCompleteButton = document.getElementById('debug-complete-button');
            debugCompleteButton.style.display = 'inline-block';
            debugCompleteButton.addEventListener('click', () => this.debugCompleteGame());
        }

        const clearLeaderboardButton = document.getElementById('clear-leaderboard');
        clearLeaderboardButton.addEventListener('click', () => this.clearLeaderboard());
    }

    createThemeButtons() {
        const themeButtonsContainer = document.getElementById('theme-buttons');
        themeButtonsContainer.innerHTML = '';

        for (const theme in THEMES) {
            const button = document.createElement('div');
            button.classList.add('theme-button');
            const img = document.createElement('img');
            img.src = THEMES[theme].images[Math.floor(Math.random() * THEMES[theme].images.length)];
            const text = document.createElement('span');
            text.textContent = THEMES[theme].name;
            button.appendChild(img);
            button.appendChild(text);
            button.addEventListener('click', () => this.selectTheme(theme));
            themeButtonsContainer.appendChild(button);
        }
    }

    setupModeButtons() {
        const modeButtons = document.querySelectorAll('.mode-button');
        modeButtons.forEach(button => {
            button.addEventListener('click', () => this.selectMode(button.dataset.mode));
        });
    }

    setupEventListeners() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.leaderboardButton.addEventListener('click', () => this.showLeaderboard());
        this.backButton.addEventListener('click', () => this.changeTheme());
        this.resetButton.addEventListener('click', () => this.resetGame());
        this.changeThemeButton.addEventListener('click', () => this.changeTheme());
        this.soundToggle.addEventListener('click', () => this.toggleSound());
    }

    selectTheme(theme) {
        this.currentTheme = theme;
        document.getElementById('theme-selection').style.display = 'none';
        document.getElementById('mode-selection').style.display = 'block';
    }

    selectMode(mode) {
        this.currentMode = mode;
        document.querySelectorAll('.mode-button').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelector(`.mode-button[data-mode="${mode}"]`).classList.add('selected');
        this.startButton.style.display = 'inline-block';
        this.leaderboardButton.style.display = 'inline-block';
        this.backButton.style.display = 'inline-block';
    }

    createBoard() {
        const { gridSize, cardCount } = GAME_MODES[this.currentMode];
        const images = THEMES[this.currentTheme].images;
        const shuffledImages = [...images.slice(0, cardCount / 2), ...images.slice(0, cardCount / 2)]
            .sort(() => Math.random() - 0.5);

        this.gameBoard.innerHTML = '';
        this.gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        this.gameBoard.className = `game-board grid-${gridSize}x${gridSize}`;

        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;

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
            card.addEventListener('click', () => this.flipCard(card));
            this.gameBoard.appendChild(card);
            this.cards.push(card);
        }
    }

    flipCard(card) {
        if (!this.canFlip || card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }

        card.classList.add('flipped');
        this.singleFlipCount++;

        if (this.singleFlipCount % 2 === 0) {
            this.flipCount++;
            this.updateFlipCounter();
        }

        if (this.isSoundOn) {
            this.flipSound.play();
        }

        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.canFlip = false;
            this.checkMatch();
        } else if (this.flippedCards.length > 2) {
            const [card1, card2] = this.flippedCards;
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            this.flippedCards = [card];
            this.canFlip = true;
        }
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        if (card1.dataset.image === card2.dataset.image) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            this.matchedPairs++;

            if (this.matchedPairs === this.cards.length / 2) {
                clearInterval(this.gameTimer);
                setTimeout(() => this.showGameCompleteAlert(), 500);
            }
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
            }, 1000);
        }
        this.flippedCards = [];
        this.canFlip = true;
    }

    startCountdown(seconds) {
        this.countdownElement.style.display = 'block';
        let timeLeft = seconds;

        this.countdownTimer = setInterval(() => {
            this.countdownElement.textContent = `記憶時間：${timeLeft}秒`;
            timeLeft--;

            if (timeLeft < 0) {
                clearInterval(this.countdownTimer);
                this.startGamePlay();
            }
        }, 1000);
    }

    startGameTimer() {
        this.timerElement.style.display = 'block';
        this.gameTime = 0;
        this.gameTimer = setInterval(() => {
            this.gameTime++;
            this.timerElement.textContent = `時間：${this.gameTime}秒`;
        }, 1000);
    }

    startGame() {
        if (!this.currentTheme || !this.currentMode) {
            Swal.fire('錯誤', '請選擇主題和模式', 'error');
            return;
        }
        this.createBoard();
        document.getElementById('game-setup').style.display = 'none';
        this.gameControls.style.display = 'block';
        this.resetButton.textContent = '直接開始';
        this.cards.forEach(card => card.classList.add('flipped'));
        this.canFlip = false;
        this.isCountingDown = true;
        this.startCountdown(10);
        this.flipCount = 0;
        this.singleFlipCount = 0;
        this.updateFlipCounter();
        document.getElementById('fliper').style.display = 'block';
        if (IS_DEVELOPMENT_MODE) {
            document.getElementById('debug-complete-button').style.display = 'inline-block';
        }
    }

    resetGame() {
        if (this.isCountingDown) {
            this.startGameImmediately();
        } else {
            clearInterval(this.gameTimer);
            this.timerElement.style.display = 'none';
            this.fliperElement.style.display = 'none';
            this.createBoard();
            this.cards.forEach(card => card.classList.add('flipped'));
            this.canFlip = false;
            this.isCountingDown = true;
            this.resetButton.textContent = '直接開始';
            this.startCountdown(10);
            this.flipCount = 0;
            this.singleFlipCount = 0;
            this.updateFlipCounter();
        }
    }

    startGameImmediately() {
        clearInterval(this.countdownTimer);
        this.startGamePlay();
    }

    startGamePlay() {
        this.countdownElement.style.display = 'none';
        this.cards.forEach(card => card.classList.remove('flipped'));
        this.canFlip = true;
        this.isCountingDown = false;
        this.resetButton.textContent = '重置遊戲';
        this.startGameTimer();
    }

    changeTheme() {
        clearInterval(this.countdownTimer);
        clearInterval(this.gameTimer);
        this.isCountingDown = false;
        this.gameBoard.innerHTML = '';
        this.gameControls.style.display = 'none';
        this.countdownElement.style.display = 'none';
        this.timerElement.style.display = 'none';
        this.resetButton.textContent = '重置遊戲';
        document.getElementById('game-setup').style.display = 'block';
        document.getElementById('theme-selection').style.display = 'block';
        document.getElementById('mode-selection').style.display = 'none';
        this.startButton.style.display = 'none';
        this.leaderboardButton.style.display = 'none';
        this.backButton.style.display = 'none';
        this.currentTheme = '';
        this.currentMode = '';
    }

    askForNickname() {
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
                this.saveScore(result.value);
            } else {
                this.showLeaderboard();
            }
        });
    }

    saveScore(nickname) {
        if (!this.currentTheme || !this.currentMode) {
            console.error('Error: currentTheme or currentMode is not set');
            Swal.fire('錯誤', '無法保存分數，請重試', 'error');
            return;
        }

        const score = {
            nickname: nickname,
            time: this.gameTime,
            flips: this.flipCount,
            date: new Date().toISOString()
        };

        try {
            let allScores = JSON.parse(localStorage.getItem('memoryGameScores')) || {};
            if (!allScores[this.currentTheme]) {
                allScores[this.currentTheme] = {};
            }
            if (!allScores[this.currentTheme][this.currentMode]) {
                allScores[this.currentTheme][this.currentMode] = [];
            }

            const scores = allScores[this.currentTheme][this.currentMode];
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
            allScores[this.currentTheme][this.currentMode] = scores.slice(0, 10);

            console.log('All scores:', allScores);

            localStorage.setItem('memoryGameScores', JSON.stringify(allScores));
            Swal.fire('成功', '你的分數已成功保存！', 'success').then(() => {
                this.showLeaderboard();
            });
        } catch (error) {
            console.error('Error saving score:', error);
            Swal.fire('錯誤', '保存分數時出錯，請重試', 'error');
        }
    }

    showLeaderboard() {
        const allScores = JSON.parse(localStorage.getItem('memoryGameScores')) || {};
        const themeScores = allScores[this.currentTheme] || {};
        const scores = themeScores[this.currentMode] || [];
        
        let leaderboardHtml = `<h3>${THEMES[this.currentTheme].name}主題 - ${this.currentMode}模式 排行榜</h3>`;
        
        if (scores.length === 0) {
            leaderboardHtml += `<p>目前${THEMES[this.currentTheme].name}主題的${this.currentMode}模式還沒有紀錄。</p>`;
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

    showGameCompleteAlert() {
        Swal.fire({
            title: '恭喜你贏得了遊戲！',
            text: `你的完成時間是：${this.gameTime}秒，翻牌次數：${this.flipCount}次`,
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: '記錄成績',
            cancelButtonText: '不記錄'
        }).then((result) => {
            if (result.isConfirmed) {
                this.askForNickname();
            } else {
                this.showLeaderboard();
            }
        });
    }

    debugCompleteGame() {
        clearInterval(this.gameTimer);
        this.gameTime = Math.floor(Math.random() * 60) + 1;
        this.flipCount = Math.floor(Math.random() * 1000) + 1;
        this.cards.forEach(card => card.classList.add('matched'));
        this.showGameCompleteAlert();
    }

    clearLeaderboard() {
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

    toggleSound() {
        this.isSoundOn = !this.isSoundOn;
        this.soundToggle.classList.toggle('off');
        this.soundToggle.textContent = this.isSoundOn ? '🔊 開啟音效' : '🔇 關閉音效';
    }

    updateFlipCounter() {
        const flipElement = document.getElementById('fliper');
        flipElement.textContent = `次數：${this.flipCount}次`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});