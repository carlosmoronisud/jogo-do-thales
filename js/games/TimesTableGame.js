/* ============================================================
   JOGO: TimesTableGame
   Tabuada com desafio de tempo e personagem animado
   ============================================================ */

class TimesTableGame {
  constructor() {
    this.QUESTIONS_PER_ROUND = 5;
    this.POINTS_CORRECT = 10;
    this.POINTS_WRONG = -3;
    this.POINTS_BONUS = 30;
    this.TIME_LIMIT = 10; // segundos por pergunta
    
    this.currentQuestion = null;
    this.questionIndex = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.roundPoints = 0;
    this.questions = [];
    this.answering = false;
    this.timeLeft = this.TIME_LIMIT;
    this.timerInterval = null;
  }

  rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  generateQuestion() {
    // Níveis de dificuldade baseado na pontuação da rodada
    let maxNumber;
    if (this.roundPoints < 20) maxNumber = 5;
    else if (this.roundPoints < 40) maxNumber = 7;
    else maxNumber = 10;
    
    const a = this.rand(1, maxNumber);
    const b = this.rand(1, maxNumber);
    const correct = a * b;
    
    // Gerar opções (1 correta + 3 distratores próximos)
    const optionsSet = new Set();
    optionsSet.add(correct);
    
    while (optionsSet.size < 4) {
      const offset = this.rand(-3, 3);
      const wrong = correct + offset;
      if (wrong > 0 && wrong !== correct) {
        optionsSet.add(wrong);
      }
    }
    
    const options = this.shuffle(Array.from(optionsSet));
    
    // Criar emoji divertido baseado na dificuldade
    const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐸'];
    const randomEmoji = emojis[this.rand(0, emojis.length - 1)];
    
    return {
      display: {
        question: `${a} × ${b} = ?`,
        emoji: randomEmoji,
        timeLimit: this.TIME_LIMIT
      },
      hint: `Você tem ${this.TIME_LIMIT} segundos!`,
      options: options,
      correct: correct,
      a: a,
      b: b
    };
  }

  getDifficultyBadge() {
    if (this.roundPoints < 20) return '🌟 Fácil';
    if (this.roundPoints < 40) return '⚡ Médio';
    return '🔥 Difícil';
  }

  startTimer(container) {
    this.timeLeft = this.TIME_LIMIT;
    
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    this.timerInterval = setInterval(() => {
      if (!this.answering && this.timeLeft > 0) {
        this.timeLeft--;
        
        // Atualizar display do timer
        const timerDisplay = container.querySelector('.timer-display');
        if (timerDisplay) {
          timerDisplay.textContent = `⏱️ ${this.timeLeft}s`;
          if (this.timeLeft <= 3) {
            timerDisplay.style.animation = 'shake 0.5s ease infinite';
            timerDisplay.style.color = '#EF233C';
          }
        }
        
        // Tempo esgotado!
        if (this.timeLeft <= 0 && !this.answering) {
          clearInterval(this.timerInterval);
          this.handleTimeout(container);
        }
      }
    }, 1000);
  }

  handleTimeout(container) {
    if (this.answering) return;
    
    console.log('⏰ Tempo esgotado!');
    this.answering = true;
    this.wrongCount++;
    this.roundPoints += this.POINTS_WRONG;
    if (this.roundPoints < 0) this.roundPoints = 0;
    
    // Atualiza pontuação global
    GameState.addScore(this.POINTS_WRONG);
    
    // Feedback visual de tempo esgotado
    const fb = document.getElementById('feedback-banner');
    fb.classList.remove('hidden');
    fb.className = 'feedback-banner wrong';
    document.getElementById('feedback-text').textContent = `⏰ Tempo acabou! Era ${this.currentQuestion.correct}`;
    
    // Mostrar resposta correta
    const optionsGrid = container.querySelector('.options-grid');
    const allBtns = optionsGrid.querySelectorAll('.option-btn');
    allBtns.forEach(btn => {
      btn.classList.add('disabled');
      if (parseInt(btn.textContent) === this.currentQuestion.correct) {
        btn.classList.add('correct');
      }
    });
    
    // Popup
    UIManager.showScorePopup(this.POINTS_WRONG, false);
    
    // Avançar
    setTimeout(() => {
      fb.classList.add('hidden');
      this.nextQuestion();
    }, 1500);
  }

  init() {
    console.log('🎮 TimesTableGame: Inicializando');
    this.questionIndex = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.roundPoints = 0;
    this.questions = [];
    this.answering = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    for (let i = 0; i < this.QUESTIONS_PER_ROUND; i++) {
      this.questions.push(this.generateQuestion());
    }
    
    this.currentQuestion = this.questions[0];
  }

  render(container) {
    const progress = (this.questionIndex / this.QUESTIONS_PER_ROUND) * 100;
    
    const progressBar = document.getElementById('game-progress-bar');
    if (progressBar) progressBar.style.width = `${progress}%`;
    
    const scorePill = document.getElementById('game-score-pill');
    if (scorePill) scorePill.textContent = `+${this.roundPoints}`;
    
    const difficultyBadge = this.getDifficultyBadge();
    
    container.innerHTML = `
      <div class="level-badge">📊 Tabuada - ${difficultyBadge}</div>
      <div class="question-counter">Pergunta ${this.questionIndex + 1} de ${this.QUESTIONS_PER_ROUND}</div>
      
      <div class="timer-container">
        <div class="timer-display">⏱️ ${this.TIME_LIMIT}s</div>
        <div class="timer-bar" style="width: 100%;"></div>
      </div>
      
      <div class="challenge-card times-card" id="challenge-card">
        <div class="times-question">
          <div class="times-emoji">${this.currentQuestion.display.emoji}</div>
          <div class="times-expression">${this.currentQuestion.display.question}</div>
          <div class="challenge-hint">${this.currentQuestion.hint}</div>
        </div>
      </div>
      
      <div class="options-grid times-grid" id="options-grid"></div>
    `;
    
    const optionsGrid = container.querySelector('#options-grid');
    this.currentQuestion.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-btn times-option';
      btn.textContent = opt;
      optionsGrid.appendChild(btn);
    });
    
    // Iniciar timer
    this.startTimer(container);
    
    // Animar timer bar
    this.animateTimerBar(container);
    
    const card = container.querySelector('#challenge-card');
    if (card) {
      card.style.animation = 'popIn 0.35s cubic-bezier(.34,1.56,.64,1) both';
    }
  }

  animateTimerBar(container) {
    const timerBar = container.querySelector('.timer-bar');
    if (!timerBar) return;
    
    let startTime = Date.now();
    const interval = setInterval(() => {
      if (this.answering || this.timeLeft <= 0) {
        clearInterval(interval);
        return;
      }
      
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, (this.TIME_LIMIT - elapsed) / this.TIME_LIMIT * 100);
      timerBar.style.width = `${remaining}%`;
      
      if (remaining < 30) {
        timerBar.style.background = '#EF233C';
      } else if (remaining < 60) {
        timerBar.style.background = '#FFD93D';
      } else {
        timerBar.style.background = 'linear-gradient(90deg, #06D6A0, #4CC9F0)';
      }
    }, 50);
  }

  handleAnswer(answer, uiCallback) {
    if (this.answering) return { isCorrect: false, points: 0 };
    
    // Parar o timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    
    this.answering = true;
    const answerNum = parseInt(answer);
    const isCorrect = (answerNum === this.currentQuestion.correct);
    const points = isCorrect ? this.POINTS_CORRECT : this.POINTS_WRONG;
    
    console.log(`Resposta: ${answerNum}, Correta: ${this.currentQuestion.correct}, Correto: ${isCorrect}`);
    
    if (isCorrect) {
      this.correctCount++;
    } else {
      this.wrongCount++;
    }
    
    this.roundPoints += points;
    if (this.roundPoints < 0) this.roundPoints = 0;
    
    uiCallback.onAnswer(isCorrect, points, this.currentQuestion.correct, answer);
    
    return { isCorrect, points };
  }

  nextQuestion() {
    this.answering = false;
    this.questionIndex++;
    
    if (this.questionIndex < this.QUESTIONS_PER_ROUND) {
      this.currentQuestion = this.questions[this.questionIndex];
      return this.currentQuestion;
    }
    return null;
  }

  isFinished() {
    return this.questionIndex >= this.QUESTIONS_PER_ROUND;
  }

  finish() {
    const allCorrect = (this.correctCount === this.QUESTIONS_PER_ROUND);
    let bonus = 0;
    
    if (allCorrect) {
      bonus = this.POINTS_BONUS;
      this.roundPoints += bonus;
    }
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    
    return {
      totalQuestions: this.QUESTIONS_PER_ROUND,
      correctAnswers: this.correctCount,
      wrongAnswers: this.wrongCount,
      roundPoints: this.roundPoints,
      bonus: bonus,
      allCorrect: allCorrect
    };
  }
}