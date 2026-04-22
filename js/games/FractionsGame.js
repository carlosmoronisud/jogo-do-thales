/* ============================================================
   JOGO: FractionsGame
   Frações visuais - Versão Corrigida
   ============================================================ */

class FractionsGame {
  constructor() {
    this.QUESTIONS_PER_ROUND = 5;
    this.POINTS_CORRECT = 15;
    this.POINTS_WRONG = -5;
    this.POINTS_BONUS = 25;
    
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

  // Gera uma pergunta de fração visual
  generateFractionQuestion() {
    // Frações com suas representações visuais
    const fractions = [
      { value: '1/2', name: 'um meio', numerator: 1, denominator: 2 },
      { value: '1/3', name: 'um terço', numerator: 1, denominator: 3 },
      { value: '2/3', name: 'dois terços', numerator: 2, denominator: 3 },
      { value: '1/4', name: 'um quarto', numerator: 1, denominator: 4 },
      { value: '3/4', name: 'três quartos', numerator: 3, denominator: 4 },
      { value: '1/5', name: 'um quinto', numerator: 1, denominator: 5 },
      { value: '2/5', name: 'dois quintos', numerator: 2, denominator: 5 },
      { value: '3/5', name: 'três quintos', numerator: 3, denominator: 5 },
      { value: '4/5', name: 'quatro quintos', numerator: 4, denominator: 5 }
    ];
    
    const selected = fractions[this.rand(0, fractions.length - 1)];
    const correctValue = selected.value;
    
    // Gerar opções (1 correta + 3 distratores)
    const otherFractions = fractions.filter(f => f.value !== correctValue);
    const shuffledOthers = this.shuffle([...otherFractions]);
    const wrongOptions = shuffledOthers.slice(0, 3);
    
    // Criar array de opções com valores simples (strings)
    let options = [correctValue];
    wrongOptions.forEach(opt => options.push(opt.value));
    options = this.shuffle(options);
    
    // Criar representação visual da fração
    const visualRepresentation = this.createFractionVisual(selected.numerator, selected.denominator);
    
    return {
      display: {
        numerator: selected.numerator,
        denominator: selected.denominator,
        visual: visualRepresentation,
        description: `Quantas partes estão pintadas?`
      },
      hint: `Escolha a fração correta!`,
      options: options,
      correct: correctValue
    };
  }

  // Cria uma representação visual da fração usando HTML/CSS
  createFractionVisual(numerator, denominator) {
    const percentage = (numerator / denominator) * 100;
    const filledParts = numerator;
    const totalParts = denominator;
    
    // Criar representação visual com círculo ou retângulo
    if (denominator <= 4) {
      // Para frações com denominador pequeno, mostrar partes individuais
      let partsHtml = '';
      for (let i = 0; i < totalParts; i++) {
        const isFilled = i < filledParts;
        partsHtml += `
          <div style="
            width: 40px;
            height: 40px;
            background: ${isFilled ? 'linear-gradient(135deg, #4CC9F0, #7B2FBE)' : '#f0eeff'};
            border: 2px solid #7B2FBE;
            border-radius: 8px;
            display: inline-block;
            margin: 4px;
            transition: all 0.3s ease;
          "></div>
        `;
      }
      return `
        <div style="text-align: center;">
          <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
            ${partsHtml}
          </div>
          <div style="font-size: 14px; color: #5a5490;">
            ${filledParts} de ${totalParts} partes
          </div>
        </div>
      `;
    } else {
      // Para frações maiores, usar círculo preenchido
      return `
        <div style="position: relative; width: 120px; height: 120px; margin: 0 auto;">
          <div style="
            width: 100px;
            height: 100px;
            border: 4px solid #7B2FBE;
            border-radius: 50%;
            position: relative;
            margin: 0 auto;
            overflow: hidden;
            background: #f0eeff;
          ">
            <div style="
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
              height: ${percentage}%;
              background: linear-gradient(135deg, #4CC9F0, #7B2FBE);
              transition: height 0.5s ease;
            "></div>
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              font-size: 20px;
              font-weight: bold;
              color: #1a1650;
            ">${numerator}/${denominator}</div>
          </div>
          <div style="text-align: center; margin-top: 8px; font-size: 14px; color: #5a5490; font-weight: bold;">
            ${numerator} de ${denominator} partes
          </div>
        </div>
      `;
    }
  }

  init() {
    console.log('🎮 FractionsGame: Inicializando');
    this.questionIndex = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.roundPoints = 0;
    this.questions = [];
    this.answering = false;
    
    for (let i = 0; i < this.QUESTIONS_PER_ROUND; i++) {
      this.questions.push(this.generateFractionQuestion());
    }
    
    this.currentQuestion = this.questions[0];
    console.log('Primeira pergunta:', this.currentQuestion);
  }

  render(container) {
    const progress = (this.questionIndex / this.QUESTIONS_PER_ROUND) * 100;
    
    const progressBar = document.getElementById('game-progress-bar');
    if (progressBar) progressBar.style.width = `${progress}%`;
    
    const scorePill = document.getElementById('game-score-pill');
    if (scorePill) scorePill.textContent = `+${this.roundPoints}`;
    
    container.innerHTML = `
      <div class="level-badge">🍕 Frações - Visual</div>
      <div class="question-counter">Pergunta ${this.questionIndex + 1} de ${this.QUESTIONS_PER_ROUND}</div>
      
      <div class="challenge-card fraction-card" id="challenge-card">
        <div class="fraction-question">
          <div class="fraction-visual-container">
            ${this.currentQuestion.display.visual}
          </div>
          <div class="fraction-description">
            ${this.currentQuestion.display.description}
          </div>
          <div class="challenge-hint" style="margin-top: 12px;">
            ${this.currentQuestion.hint}
          </div>
        </div>
      </div>
      
      <div class="options-grid fractions-grid" id="options-grid"></div>
    `;
    
    const optionsGrid = container.querySelector('#options-grid');
    this.currentQuestion.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-btn fraction-option';
      // Armazenar o valor como dado, e também como texto limpo
      btn.setAttribute('data-value', opt);
      btn.textContent = opt;  // Texto sem HTML interno
      optionsGrid.appendChild(btn);
    });
    
    // Animações
    const card = container.querySelector('#challenge-card');
    if (card) {
      card.style.animation = 'popIn 0.35s cubic-bezier(.34,1.56,.64,1) both';
    }
  }

  handleAnswer(answer, uiCallback) {
    // Limpar a resposta: remover espaços extras, quebras de linha e trim()
    const cleanAnswer = String(answer).trim().replace(/\s+/g, '');
    const cleanCorrect = String(this.currentQuestion.correct).trim().replace(/\s+/g, '');
    
    console.log(`Resposta recebida: "${answer}" -> Limpa: "${cleanAnswer}"`);
    console.log(`Correta esperada: "${this.currentQuestion.correct}" -> Limpa: "${cleanCorrect}"`);
    
    if (this.answering) return { isCorrect: false, points: 0 };
    
    this.answering = true;
    // Comparação direta de strings limpas
    const isCorrect = (cleanAnswer === cleanCorrect);
    const points = isCorrect ? this.POINTS_CORRECT : this.POINTS_WRONG;
    
    console.log(`Correto: ${isCorrect}, Pontos: ${points}`);
    
    if (isCorrect) {
      this.correctCount++;
    } else {
      this.wrongCount++;
    }
    
    this.roundPoints += points;
    if (this.roundPoints < 0) this.roundPoints = 0;
    
    // Passar a resposta original para o callback (para feedback visual)
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
    
    console.log('Resultado final:', {
      correctCount: this.correctCount,
      wrongCount: this.wrongCount,
      roundPoints: this.roundPoints,
      allCorrect: allCorrect
    });
    
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