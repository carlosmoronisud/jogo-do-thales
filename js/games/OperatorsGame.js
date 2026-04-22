/* ============================================================
   JOGO: OperatorsGame
   Aritmética, Comparação e Lógica
   ============================================================ */

class OperatorsGame {
  constructor() {
    this.QUESTIONS_PER_ROUND = 5;
    this.POINTS_CORRECT = 10;
    this.POINTS_WRONG = -5;
    this.POINTS_BONUS = 20;
    
    this.currentLevel = 1;
    this.currentQuestion = null;
    this.questionIndex = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.roundPoints = 0;
    this.questions = [];
    this.answering = false;
  }

  rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  getLevelConfig() {
    const LEVELS = {
      1: { label: 'Nível 1 · Aritmética', generate: () => this.generateArithmetic() },
      2: { label: 'Nível 2 · Comparação', generate: () => this.generateRelational() },
      3: { label: 'Nível 3 · Lógica', generate: () => this.generateLogical() }
    };
    return LEVELS[this.currentLevel] || LEVELS[1];
  }

  generateArithmetic() {
    const ops = ['+', '−', '×', '÷'];
    const correct = ops[this.rand(0, 3)];
    let a, b, result;

    if (correct === '+') {
      a = this.rand(1, 20);
      b = this.rand(1, 20);
      result = a + b;
    } else if (correct === '−') {
      a = this.rand(5, 20);
      b = this.rand(1, a);
      result = a - b;
    } else if (correct === '×') {
      a = this.rand(1, 9);
      b = this.rand(1, 9);
      result = a * b;
    } else {
      b = this.rand(2, 9);
      result = this.rand(1, 9);
      a = b * result;
    }

    const wrong = this.shuffle(ops.filter(o => o !== correct)).slice(0, 3);
    const options = this.shuffle([correct, ...wrong]);

    return {
      display: { left: String(a), right: String(b), equals: `= ${result}` },
      hint: 'Qual operador completa a conta?',
      options,
      correct
    };
  }

  generateRelational() {
    const a = this.rand(1, 30);
    const b = this.rand(1, 30);
    let correct;
    if (a > b) correct = '>';
    else if (a < b) correct = '<';
    else correct = '=';

    const allOps = ['>', '<', '='];
    const wrong = allOps.filter(o => o !== correct);
    const options = this.shuffle([correct, ...wrong]);

    return {
      display: { left: String(a), right: String(b), equals: '' },
      hint: 'Qual símbolo compara os números corretamente?',
      options,
      correct
    };
  }

  generateLogical() {
    const types = ['AND', 'OR', 'NOT'];
    const type = types[this.rand(0, 2)];
    let left, right, resultText;

    if (type === 'AND') {
      const a = this.rand(0, 1) === 1;
      const b = this.rand(0, 1) === 1;
      const res = a && b;
      left = a ? 'Verdadeiro' : 'Falso';
      right = b ? 'Verdadeiro' : 'Falso';
      resultText = `= ${res ? 'Verdadeiro' : 'Falso'}`;
    } else if (type === 'OR') {
      const a = this.rand(0, 1) === 1;
      const b = this.rand(0, 1) === 1;
      const res = a || b;
      left = a ? 'Verdadeiro' : 'Falso';
      right = b ? 'Verdadeiro' : 'Falso';
      resultText = `= ${res ? 'Verdadeiro' : 'Falso'}`;
    } else {
      const a = this.rand(0, 1) === 1;
      const res = !a;
      left = a ? 'Verdadeiro' : 'Falso';
      right = '';
      resultText = `= ${res ? 'Verdadeiro' : 'Falso'}`;
    }

    const wrong = types.filter(o => o !== type);
    const options = this.shuffle([type, ...wrong]);

    return {
      display: { left, right, equals: resultText },
      hint: 'Qual operador lógico completa a expressão?',
      options,
      correct: type
    };
  }

  advanceLevel() {
    if (this.correctCount >= 4 && this.currentLevel < 3) this.currentLevel++;
    else if (this.correctCount < 2 && this.currentLevel > 1) this.currentLevel--;
  }

  init() {
    console.log('🎮 OperatorsGame: Inicializando');
    this.currentLevel = 1;
    this.questionIndex = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.roundPoints = 0;
    this.questions = [];
    this.answering = false;
    
    for (let i = 0; i < this.QUESTIONS_PER_ROUND; i++) {
      const levelConfig = this.getLevelConfig();
      this.questions.push(levelConfig.generate());
    }
    
    this.currentQuestion = this.questions[0];
  }

  render(container) {
    const progress = (this.questionIndex / this.QUESTIONS_PER_ROUND) * 100;
    
    const progressBar = document.getElementById('game-progress-bar');
    if (progressBar) progressBar.style.width = `${progress}%`;
    
    const scorePill = document.getElementById('game-score-pill');
    if (scorePill) scorePill.textContent = `+${this.roundPoints}`;
    
    const levelLabel = this.getLevelConfig().label;
    
    container.innerHTML = `
      <div class="level-badge">${levelLabel}</div>
      <div class="question-counter">Pergunta ${this.questionIndex + 1} de ${this.QUESTIONS_PER_ROUND}</div>
      
      <div class="challenge-card" id="challenge-card">
        <div class="challenge-expression">
          <span class="expr-left">${this.currentQuestion.display.left}</span>
          <span class="expr-blank" id="expr-blank">?</span>
          <span class="expr-right">${this.currentQuestion.display.right}</span>
          <span class="expr-equals">${this.currentQuestion.display.equals}</span>
        </div>
        <div class="challenge-hint">${this.currentQuestion.hint}</div>
      </div>
      
      <div class="options-grid" id="options-grid"></div>
    `;
    
    const optionsGrid = container.querySelector('#options-grid');
    this.currentQuestion.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt;
      optionsGrid.appendChild(btn);
    });
  }

  handleAnswer(answer, uiCallback) {
    if (this.answering) return { isCorrect: false, points: 0 };
    
    this.answering = true;
    const isCorrect = (answer === this.currentQuestion.correct);
    const points = isCorrect ? this.POINTS_CORRECT : this.POINTS_WRONG;
    
    if (isCorrect) this.correctCount++;
    else this.wrongCount++;
    
    this.roundPoints += points;
    if (this.roundPoints < 0) this.roundPoints = 0;
    
    uiCallback.onAnswer(isCorrect, points, this.currentQuestion.correct, answer);
    
    return { isCorrect, points };
  }

  nextQuestion() {
    this.answering = false;
    this.questionIndex++;
    this.advanceLevel();
    
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