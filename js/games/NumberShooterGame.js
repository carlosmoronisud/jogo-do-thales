/* ============================================================
   JOGO: NumberShooterGame - Versão Final
   Com pontuação final, reinício e níveis balanceados
   ============================================================ */

class NumberShooterGame {
  constructor() {
    this.GAME_DURATION = 30000;
    this.POINTS_PER_HIT = 10;
    this.POINTS_COMPLETE = 30;
    this.POINTS_PRIME_BONUS = 50;
    
    this.score = 0;
    this.timeLeft = this.GAME_DURATION;
    this.gameActive = false;
    this.animationId = null;
    this.gameLoopId = null;
    
    this.canvas = null;
    this.ctx = null;
    this.container = null;
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    
    this.currentNumber = null;
    this.availableOperations = [];
    this.currentLevel = 1;
    
    this.primeBonusActive = false;
    this.primeBonusValue = null;
    this.primeBonusButton = null;
    
    this.particles = [];
    this.isFalling = true;
    this.gameStarted = false;
    
    this.onGameEnd = null;
  }

  getLevelConfig() {
    const configs = {
      1: {
        operations: [2, 3],
        numbers: [2, 3, 4, 6, 8, 9, 12, 16, 18, 24, 27, 32, 36, 48],
        fallSpeed: 0.4,
        color: '#4CC9F0',
        name: 'Iniciante'
      },
      2: {
        operations: [2, 3, 4, 5, 6, 7],
        numbers: [12, 16, 18, 20, 24, 25, 27, 28, 30, 32, 35, 36, 40, 42, 45, 48, 49, 50, 54, 56, 60, 63, 64, 70, 72, 75, 80, 81, 84, 90, 96, 100],
        fallSpeed: 0.55,
        color: '#7B2FBE',
        name: 'Avançado'
      },
      3: {
        operations: [2, 3, 4, 5, 6, 7, 8, 9, 10],
        numbers: [24, 27, 28, 30, 32, 35, 36, 40, 42, 45, 48, 49, 50, 54, 56, 60, 63, 64, 70, 72, 75, 80, 81, 84, 90, 96, 100, 105, 108, 112, 120, 125, 126, 128, 135, 140, 144, 150, 160, 162, 168, 175, 180, 189, 192, 196, 200],
        fallSpeed: 0.7,
        color: '#FF6B35',
        name: 'Mestre'
      }
    };
    return configs[this.currentLevel] || configs[1];
  }

  isPrime(num) {
    if (num < 2) return false;
    if (num === 2) return true;
    if (num % 2 === 0) return false;
    for (let i = 3; i <= Math.sqrt(num); i += 2) {
      if (num % i === 0) return false;
    }
    return true;
  }

  // Números primos que podem aparecer como bônus
  getRandomPrime() {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];
    return primes[Math.floor(Math.random() * primes.length)];
  }

  generateNumber() {
    const config = this.getLevelConfig();
    const randomIndex = Math.floor(Math.random() * config.numbers.length);
    return config.numbers[randomIndex];
  }

  canDecompose(number, operation) {
    return number % operation === 0;
  }

  getColorForNumber(value) {
    const config = this.getLevelConfig();
    if (value <= 10) return '#06D6A0';
    if (value <= 30) return '#4CC9F0';
    if (value <= 60) return '#7B2FBE';
    return config.color;
  }

  init() {
    console.log('🎮 NumberShooterGame: Inicializando');
    this.score = 0;
    this.timeLeft = this.GAME_DURATION;
    this.currentNumber = null;
    this.particles = [];
    this.currentLevel = 1;
    this.primeBonusActive = false;
    this.isFalling = true;
    this.gameStarted = false;
    this.updateAvailableOperations();
  }

  updateAvailableOperations() {
    const config = this.getLevelConfig();
    this.availableOperations = [...config.operations];
  }

  render(container) {
    this.container = container;
    
    container.innerHTML = `
      <div class="shooter-game">
        <div class="shooter-header">
          <div class="shooter-level">🎯 ${this.getLevelConfig().name} - Nível ${this.currentLevel}</div>
          <div class="shooter-score">⭐ ${this.score}</div>
          <div class="shooter-timer">⏱️ 30s</div>
        </div>
        
        <canvas id="shooter-canvas" class="shooter-canvas"></canvas>
        
        <div class="shooter-controls">
          <div class="shooter-ammo" id="shooter-ammo"></div>
        </div>
        
        <div class="shooter-restart" id="shooter-restart" style="display: none;">
          <button class="restart-btn" id="restart-btn">🔄 Jogar Novamente</button>
        </div>
      </div>
    `;
    
    this.canvas = document.getElementById('shooter-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    this.renderAmmoButtons();
    this.startGame();
    
    // Evento de reinício
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => this.restartGame());
    }
  }

  resizeCanvas() {
    if (!this.canvas || !this.container) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvasWidth = rect.width;
    this.canvasHeight = 380;
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    
    if (this.currentNumber) {
      this.currentNumber.x = this.canvasWidth / 2;
    }
  }

  renderAmmoButtons() {
    const ammoContainer = this.container.querySelector('#shooter-ammo');
    if (!ammoContainer) return;
    
    ammoContainer.innerHTML = '';
    
    // Botões normais
    this.availableOperations.forEach(op => {
      const btn = document.createElement('button');
      btn.className = 'ammo-btn';
      btn.innerHTML = `<span class="ammo-number">÷${op}</span>`;
      btn.addEventListener('click', () => this.shoot(op));
      ammoContainer.appendChild(btn);
    });
  }

  activatePrimeBonus() {
    if (this.primeBonusActive) return;
    
    const primeValue = this.getRandomPrime();
    this.primeBonusActive = true;
    this.primeBonusValue = primeValue;
    
    const ammoContainer = this.container.querySelector('#shooter-ammo');
    const bonusBtn = document.createElement('button');
    bonusBtn.className = 'ammo-btn prime-bonus-btn';
    bonusBtn.innerHTML = `<span class="bonus-text">🔢 PRIMO! ${primeValue} +${this.POINTS_PRIME_BONUS} 🔢</span>`;
    bonusBtn.addEventListener('click', () => this.collectPrimeBonus());
    ammoContainer.appendChild(bonusBtn);
    this.primeBonusButton = bonusBtn;
    
    // Bônus dura 4 segundos
    setTimeout(() => {
      if (this.primeBonusActive && this.primeBonusButton) {
        this.primeBonusButton.remove();
        this.primeBonusActive = false;
        this.primeBonusValue = null;
        this.primeBonusButton = null;
      }
    }, 4000);
  }

  collectPrimeBonus() {
    if (!this.primeBonusActive) return;
    
    this.addScore(this.POINTS_PRIME_BONUS);
    this.createSimpleEffect(this.canvasWidth / 2, this.canvasHeight / 2, '⚡');
    
    if (this.primeBonusButton) {
      this.primeBonusButton.remove();
    }
    this.primeBonusActive = false;
    this.primeBonusValue = null;
    this.primeBonusButton = null;
  }

  spawnNumber() {
    if (!this.gameActive) return;
    
    const value = this.generateNumber();
    
    this.currentNumber = {
      x: this.canvasWidth / 2,
      y: 30,
      value: value,
      color: this.getColorForNumber(value),
      speed: this.getLevelConfig().fallSpeed
    };
    
    this.isFalling = true;
    
    // Ativar bônus primo aleatoriamente (30% de chance a cada número)
    if (!this.primeBonusActive && Math.random() < 0.3) {
      this.activatePrimeBonus();
    }
  }

  shoot(operation) {
    if (!this.gameActive) return;
    if (!this.currentNumber) return;
    
    if (this.canDecompose(this.currentNumber.value, operation)) {
      const newValue = this.currentNumber.value / operation;
      
      this.addScore(this.POINTS_PER_HIT);
      this.createSimpleEffect(this.currentNumber.x, this.currentNumber.y, `÷${operation}`);
      
      if (newValue === 1) {
        this.addScore(this.POINTS_COMPLETE);
        this.createSimpleEffect(this.currentNumber.x, this.currentNumber.y, '🎉');
        this.removeCurrentNumber();
      } else {
        this.currentNumber.value = newValue;
        this.currentNumber.color = this.getColorForNumber(newValue);
      }
    } else {
      this.createSimpleEffect(this.currentNumber.x, this.currentNumber.y, '❌');
    }
  }

  removeCurrentNumber() {
    if (!this.currentNumber) return;
    
    this.currentNumber = null;
    
    setTimeout(() => {
      if (this.gameActive) {
        this.spawnNumber();
      }
    }, 400);
  }

  addScore(points) {
    this.score += points;
    const scoreDisplay = this.container.querySelector('.shooter-score');
    if (scoreDisplay) {
      scoreDisplay.textContent = `⭐ ${this.score}`;
      scoreDisplay.classList.add('score-pop');
      setTimeout(() => scoreDisplay.classList.remove('score-pop'), 200);
    }
  }

  createSimpleEffect(x, y, text) {
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * -3 - 1,
        life: 0.4,
        text: text,
        size: 18
      });
    }
  }

  updateGame(deltaTime) {
    if (!this.gameActive) return;
    
    this.timeLeft -= deltaTime;
    
    const timerDisplay = this.container.querySelector('.shooter-timer');
    if (timerDisplay) {
      const seconds = Math.ceil(this.timeLeft / 1000);
      timerDisplay.textContent = `⏱️ ${Math.max(0, seconds)}s`;
      
      if (seconds <= 5) {
        timerDisplay.classList.add('timer-warning');
      } else {
        timerDisplay.classList.remove('timer-warning');
      }
    }
    
    if (this.timeLeft <= 0) {
      this.endGame();
      return;
    }
    
    if (this.currentNumber && this.isFalling) {
      this.currentNumber.y += this.currentNumber.speed;
      
      if (this.currentNumber.y > this.canvasHeight - 65) {
        this.createSimpleEffect(this.currentNumber.x, this.currentNumber.y, '💨');
        this.currentNumber = null;
        
        setTimeout(() => {
          if (this.gameActive) {
            this.spawnNumber();
          }
        }, 400);
      }
    }
    
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.03;
      return p.life > 0;
    });
    
    // Verificar aumento de nível
    let newLevel = 1;
    if (this.score >= 500) newLevel = 3;
    else if (this.score >= 200) newLevel = 2;
    else newLevel = 1;
    
    if (newLevel > this.currentLevel && newLevel <= 3) {
      this.currentLevel = newLevel;
      this.updateAvailableOperations();
      this.renderAmmoButtons();
      
      // Efeito de transição de nível
      this.createSimpleEffect(this.canvasWidth / 2, this.canvasHeight / 2, `✨ NÍVEL ${newLevel} ✨`);
    }
  }

  draw() {
    if (!this.ctx) return;
    
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Fundo com gradiente
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, '#0f0c29');
    gradient.addColorStop(1, '#1a1650');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Linha do chão
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.canvasHeight - 60);
    this.ctx.lineTo(this.canvasWidth, this.canvasHeight - 60);
    this.ctx.strokeStyle = '#EF233C';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([8, 8]);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    
    // Desenhar número
    if (this.currentNumber) {
      const num = this.currentNumber;
      
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
      
      this.ctx.beginPath();
      this.ctx.arc(num.x, num.y, 40, 0, Math.PI * 2);
      this.ctx.fillStyle = num.color;
      this.ctx.fill();
      
      this.ctx.strokeStyle = 'white';
      this.ctx.lineWidth = 2.5;
      this.ctx.stroke();
      
      this.ctx.font = 'bold 34px "Fredoka One", sans-serif';
      this.ctx.fillStyle = 'white';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(num.value, num.x, num.y);
      
      this.ctx.shadowBlur = 0;
    }
    
    // Partículas
    this.particles.forEach(p => {
      this.ctx.font = `${p.size}px "Fredoka One", sans-serif`;
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = '#FFD93D';
      this.ctx.fillText(p.text, p.x, p.y);
    });
    this.ctx.globalAlpha = 1;
  }

  showFinalScore() {
    const restartDiv = this.container.querySelector('#shooter-restart');
    if (restartDiv) {
      restartDiv.style.display = 'block';
      
      // Mostrar pontuação final
      const header = this.container.querySelector('.shooter-header');
      const finalScoreMsg = document.createElement('div');
      finalScoreMsg.className = 'final-score-message';
      
      let message = '';
      let emoji = '';
      if (this.score >= 500) {
        message = '🏆 MESTRE DOS NÚMEROS! 🏆';
        emoji = '👑';
      } else if (this.score >= 300) {
        message = '🌟 MATEMÁTICO AVANÇADO! 🌟';
        emoji = '🎓';
      } else if (this.score >= 150) {
        message = '📚 BOM TRABALHO! 📚';
        emoji = '👍';
      } else {
        message = '💪 TREINE MAIS UM POUCO! 💪';
        emoji = '⭐';
      }
      
      finalScoreMsg.innerHTML = `
        <div class="final-score">
          ${emoji} ${message} ${emoji}<br>
          <span class="final-points">⭐ ${this.score} pontos ⭐</span>
        </div>
      `;
      
      header.after(finalScoreMsg);
    }
  }

  restartGame() {
    // Limpar tudo
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.gameLoopId) clearInterval(this.gameLoopId);
    
    // Resetar estado
    this.score = 0;
    this.timeLeft = this.GAME_DURATION;
    this.currentNumber = null;
    this.particles = [];
    this.currentLevel = 1;
    this.primeBonusActive = false;
    this.isFalling = true;
    this.gameActive = false;
    
    if (this.primeBonusButton) this.primeBonusButton.remove();
    
    // Reiniciar
    this.init();
    this.render(this.container);
  }

  startGame() {
    this.gameActive = true;
    this.lastTimestamp = Date.now();
    this.gameStarted = true;
    
    setTimeout(() => this.spawnNumber(), 300);
    
    const gameLoop = () => {
      if (!this.gameActive && this.timeLeft <= 0) return;
      
      const now = Date.now();
      const deltaTime = Math.min(32, now - this.lastTimestamp);
      this.lastTimestamp = now;
      
      this.updateGame(deltaTime);
      this.draw();
      
      this.animationId = requestAnimationFrame(gameLoop);
    };
    
    gameLoop();
  }

  endGame() {
    this.gameActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    this.showFinalScore();
    
    setTimeout(() => {
      if (this.onGameEnd) {
        this.onGameEnd(this.score);
      }
    }, 100);
  }

  handleAnswer(answer, uiCallback) {
    return { isCorrect: false, points: 0 };
  }

  nextQuestion() {
    return null;
  }

  isFinished() {
    return !this.gameActive && this.timeLeft <= 0;
  }

  finish() {
    return {
      totalQuestions: 1,
      correctAnswers: Math.floor(this.score / 10),
      wrongAnswers: 0,
      roundPoints: this.score,
      bonus: this.score > 300 ? 100 : 0,
      allCorrect: this.score > 250
    };
  }
}