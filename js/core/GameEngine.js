/* ============================================================
   MÓDULO: GameEngine
   Controlador central de minijogos
   ============================================================ */

const GameEngine = (() => {
  let currentGame = null;
  let gameContainer = null;
  let onGameComplete = null;

  function startGame(game, onComplete) {
    console.log('🎮 GameEngine: Iniciando jogo');
    currentGame = game;
    onGameComplete = onComplete;
    gameContainer = document.getElementById('game-container');
    
    currentGame.init();
    renderCurrentGame();
    return true;
  }

  function renderCurrentGame() {
    if (currentGame && gameContainer) {
      currentGame.render(gameContainer);
    }
  }

  function handleAnswer(answer) {
    if (!currentGame) return;
    
    const uiCallback = {
      onAnswer: (isCorrect, points, correctAnswer, selectedAnswer) => {
        // Feedback visual no jogo
        const blank = gameContainer.querySelector('#expr-blank');
        if (blank) {
          blank.textContent = selectedAnswer;
          blank.classList.add(isCorrect ? 'correct' : 'wrong');
        }
        
        const allBtns = gameContainer.querySelectorAll('.option-btn');
        allBtns.forEach(btn => {
          btn.classList.add('disabled');
          if (btn.textContent === correctAnswer) {
            btn.classList.add('correct');
          }
        });
        
        // Atualiza pontuação global
        GameState.addScore(points);
        
        // Feedback banner
        const fb = document.getElementById('feedback-banner');
        fb.classList.remove('hidden');
        fb.className = `feedback-banner ${isCorrect ? 'correct' : 'wrong'}`;
        document.getElementById('feedback-text').textContent = isCorrect
          ? '✅ Muito bem! Correto!'
          : `❌ Ops! Era ${correctAnswer}`;
        
        // Popup de pontuação
        UIManager.showScorePopup(points, isCorrect);
        
        // Atualiza placar
        const scorePill = document.getElementById('game-score-pill');
        if (scorePill && currentGame.roundPoints !== undefined) {
          scorePill.textContent = `+${currentGame.roundPoints}`;
        }
        
        // Avança para próxima pergunta
        setTimeout(() => {
          const nextQuestion = currentGame.nextQuestion();
          
          if (currentGame.isFinished()) {
            finishGame();
          } else if (nextQuestion) {
            renderCurrentGame();
          }
          
          fb.classList.add('hidden');
        }, 1400);
      }
    };
    
    currentGame.handleAnswer(answer, uiCallback);
  }

  function finishGame() {
    const result = currentGame.finish();
    
    if (result.bonus > 0) {
      GameState.addScore(result.bonus);
    }
    
    if (onGameComplete) {
      onGameComplete(result);
    }
    
    currentGame = null;
  }

  function cancelGame() {
    currentGame = null;
  }

  return {
    startGame,
    handleAnswer,
    cancelGame
  };
})();