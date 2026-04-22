/* ============================================================
   JOGO: FlagsGame - Versão Corrigida
   Adivinhe a bandeira - Com fluxo de perguntas funcionando
   ============================================================ */

class FlagsGame {
  constructor() {
    this.QUESTIONS_PER_ROUND = 10;
    this.POINTS_CORRECT = 10;
    this.POINTS_WRONG = -5;
    this.POINTS_BONUS = 30;
    
    this.questionIndex = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.roundPoints = 0;
    this.answering = false;
    this.currentCountry = null;
    this.currentOptions = [];
    this.container = null;
    this.uiCallback = null;
    
    // Dados das bandeiras
    this.bandeiras = this.getBandeirasData();
    this.bandeirasEmbaralhadas = [];
  }

  getBandeirasData() {
    return [
      { pais: "Brasil", capital: "Brasília", imagem: "https://flagcdn.com/br.svg" },
      { pais: "Estados Unidos", capital: "Washington, D.C.", imagem: "https://flagcdn.com/us.svg" },
      { pais: "Japão", capital: "Tóquio", imagem: "https://flagcdn.com/jp.svg" },
      { pais: "França", capital: "Paris", imagem: "https://flagcdn.com/fr.svg" },
      { pais: "Alemanha", capital: "Berlim", imagem: "https://flagcdn.com/de.svg" },
      { pais: "Canadá", capital: "Ottawa", imagem: "https://flagcdn.com/ca.svg" },
      { pais: "Austrália", capital: "Camberra", imagem: "https://flagcdn.com/au.svg" },
      { pais: "China", capital: "Pequim", imagem: "https://flagcdn.com/cn.svg" },
      { pais: "Índia", capital: "Nova Delhi", imagem: "https://flagcdn.com/in.svg" },
      { pais: "Reino Unido", capital: "Londres", imagem: "https://flagcdn.com/gb.svg" },
      { pais: "Argentina", capital: "Buenos Aires", imagem: "https://flagcdn.com/ar.svg" },
      { pais: "Itália", capital: "Roma", imagem: "https://flagcdn.com/it.svg" },
      { pais: "Espanha", capital: "Madri", imagem: "https://flagcdn.com/es.svg" },
      { pais: "Portugal", capital: "Lisboa", imagem: "https://flagcdn.com/pt.svg" },
      { pais: "México", capital: "Cidade do México", imagem: "https://flagcdn.com/mx.svg" },
      { pais: "Coreia do Sul", capital: "Seul", imagem: "https://flagcdn.com/kr.svg" },
      { pais: "Suécia", capital: "Estocolmo", imagem: "https://flagcdn.com/se.svg" },
      { pais: "Noruega", capital: "Oslo", imagem: "https://flagcdn.com/no.svg" },
      { pais: "Dinamarca", capital: "Copenhague", imagem: "https://flagcdn.com/dk.svg" },
      { pais: "Holanda", capital: "Amsterdã", imagem: "https://flagcdn.com/nl.svg" },
      { pais: "Bélgica", capital: "Bruxelas", imagem: "https://flagcdn.com/be.svg" },
      { pais: "Suíça", capital: "Berna", imagem: "https://flagcdn.com/ch.svg" },
      { pais: "Áustria", capital: "Viena", imagem: "https://flagcdn.com/at.svg" },
      { pais: "Peru", capital: "Lima", imagem: "https://flagcdn.com/pe.svg" },
      { pais: "Colômbia", capital: "Bogotá", imagem: "https://flagcdn.com/co.svg" },
      { pais: "Chile", capital: "Santiago", imagem: "https://flagcdn.com/cl.svg" },
      { pais: "Uruguai", capital: "Montevidéu", imagem: "https://flagcdn.com/uy.svg" }
    ];
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  getRandomCountries(exclude) {
    const countries = this.bandeiras.map(b => b.pais).filter(p => p !== exclude);
    const shuffled = this.shuffle([...countries]);
    return shuffled.slice(0, 3);
  }

  init() {
    console.log('🎮 FlagsGame: Inicializando');
    this.questionIndex = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.roundPoints = 0;
    this.answering = false;
    
    // Embaralhar bandeiras
    this.bandeirasEmbaralhadas = this.shuffle([...this.bandeiras]);
    this.loadCurrentQuestion();
    console.log(`Total de perguntas: ${this.bandeirasEmbaralhadas.length}`);
  }

  loadCurrentQuestion() {
    if (this.questionIndex >= this.bandeirasEmbaralhadas.length) {
      console.log('Fim do jogo!');
      return;
    }
    
    this.currentCountry = this.bandeirasEmbaralhadas[this.questionIndex];
    const wrongOptions = this.getRandomCountries(this.currentCountry.pais);
    this.currentOptions = this.shuffle([this.currentCountry.pais, ...wrongOptions]);
    console.log(`Pergunta ${this.questionIndex + 1}: ${this.currentCountry.pais}`);
  }

  render(container) {
    this.container = container;
    
    const progress = (this.questionIndex / this.bandeirasEmbaralhadas.length) * 100;
    
    const progressBar = document.getElementById('game-progress-bar');
    if (progressBar) progressBar.style.width = `${progress}%`;
    
    const scorePill = document.getElementById('game-score-pill');
    if (scorePill) scorePill.textContent = `+${this.roundPoints}`;
    
    container.innerHTML = `
      <div class="level-badge">🌍 Bandeiras do Mundo</div>
      <div class="question-counter">Pergunta ${this.questionIndex + 1} de ${this.bandeirasEmbaralhadas.length}</div>
      
      <div class="flags-container">
        <div class="flag-card" id="flag-card">
          <div class="flag-image-container">
            <img class="flag-image" src="${this.currentCountry.imagem}" 
                 alt="Bandeira" 
                 onerror="this.src='https://placehold.co/200x140/4CC9F0/white?text=🏳️'">
          </div>
          <div class="flag-question">
            <div class="flag-question-text">🌎 Qual é este país?</div>
          </div>
        </div>
        
        <div class="options-grid flags-options" id="options-grid"></div>
      </div>
    `;
    
    // Renderizar opções
    const optionsGrid = container.querySelector('#options-grid');
    this.currentOptions.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-btn flag-option';
      btn.textContent = opt;
      btn.setAttribute('data-value', opt);
      optionsGrid.appendChild(btn);
    });
    
    // Animar entrada
    const card = container.querySelector('#flag-card');
    if (card) {
      card.style.animation = 'popIn 0.35s cubic-bezier(.34,1.56,.64,1) both';
    }
  }

  handleAnswer(answer, uiCallback) {
    if (this.answering) return { isCorrect: false, points: 0 };
    
    console.log(`Resposta: "${answer}", Correta: "${this.currentCountry.pais}"`);
    
    this.answering = true;
    const isCorrect = (answer === this.currentCountry.pais);
    const points = isCorrect ? this.POINTS_CORRECT : this.POINTS_WRONG;
    
    console.log(`Correto: ${isCorrect}, Pontos: ${points}`);
    
    if (isCorrect) {
      this.correctCount++;
      this.roundPoints += points;
    } else {
      this.wrongCount++;
      this.roundPoints += points;
    }
    
    // Salvar callback para usar depois
    this.uiCallback = uiCallback;
    
    // Chamar callback da engine com o resultado
    uiCallback.onAnswer(isCorrect, points, this.currentCountry.pais, answer);
    
    // Aguardar 1.5 segundos e avançar
    setTimeout(() => {
      this.nextQuestion();
    }, 1500);
    
    return { isCorrect, points };
  }

  nextQuestion() {
    this.answering = false;
    this.questionIndex++;
    console.log(`Avançando para pergunta ${this.questionIndex + 1}`);
    
    if (this.questionIndex < this.bandeirasEmbaralhadas.length) {
      this.loadCurrentQuestion();
      // Re-renderizar o container com a nova pergunta
      if (this.container) {
        this.render(this.container);
      }
    } else {
      console.log('Jogo finalizado!');
      // O jogo terminou, o finish será chamado pelo GameEngine
    }
  }

  isFinished() {
    const finished = this.questionIndex >= this.bandeirasEmbaralhadas.length;
    console.log(`isFinished: ${finished}, index: ${this.questionIndex}, total: ${this.bandeirasEmbaralhadas.length}`);
    return finished;
  }

  finish() {
    const allCorrect = (this.correctCount === this.bandeirasEmbaralhadas.length);
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
      totalQuestions: this.bandeirasEmbaralhadas.length,
      correctAnswers: this.correctCount,
      wrongAnswers: this.wrongCount,
      roundPoints: this.roundPoints,
      bonus: bonus,
      allCorrect: allCorrect
    };
  }
}