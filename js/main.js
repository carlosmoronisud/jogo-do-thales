/* ============================================================
   MAIN — Ponto de entrada da aplicação
   Registra jogos e configura eventos
   ============================================================ */

(function init() {
  console.log('🚀 Inicializando MathQuest...');

  // Registra os jogos disponíveis
  // Jogo de operadores:
  GameRegistry.register('operators', {
    name: 'Operadores',
    icon: '🔢',
    description: '+  −  ×  ÷  >  <  =',
    gameClass: OperatorsGame,
    phase: 1
  });
  // Jogo de frações:
  GameRegistry.register('fractions', {
    name: 'Frações',
    icon: '🍕',
    description: 'Aprenda frações com pizza!',
    gameClass: FractionsGame,
    phase: 1  
  });
  // Jogo de tabuada:

  GameRegistry.register('timestable', {
    name: 'Tabuada',
    icon: '📊',
    description: 'Desafio de tempo!',
    gameClass: TimesTableGame,
    phase: 1
  });

  // Jogo de number shooter
  GameRegistry.register('shooter', {
  name: 'Number Shooter',
  icon: '🎯',
  description: 'Atire nos números!',
  gameClass: NumberShooterGame,
  phase: 1
});

// Jogo de flags

GameRegistry.register('flags', {
  name: 'Bandeiras',
  icon: '🏳️',
  description: 'Aprenda países e capitais!',
  gameClass: FlagsGame,
  phase: 1
});

  // ==================== EVENTOS ====================
  
  // Perfis
  const newProfileBtn = document.getElementById('btn-new-profile');
  if (newProfileBtn) {
    newProfileBtn.addEventListener('click', () => {
      document.getElementById('modal-create').classList.remove('hidden');
      document.getElementById('input-name').value = '';
      setTimeout(() => document.getElementById('input-name').focus(), 100);
    });
  }

  const cancelBtn = document.getElementById('btn-cancel-profile');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      document.getElementById('modal-create').classList.add('hidden');
    });
  }

  const modal = document.getElementById('modal-create');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  }

  const confirmBtn = document.getElementById('btn-confirm-profile');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      const name = document.getElementById('input-name').value.trim();
      if (name.length < 2) {
        document.getElementById('input-name').classList.add('shake');
        setTimeout(() => document.getElementById('input-name').classList.remove('shake'), 400);
        return;
      }
      document.getElementById('modal-create').classList.add('hidden');
      const profile = GameState.createProfile(name);
      GameState.setCurrentPlayer(profile.id);
      UIManager.updateMenuUI();
      UIManager.renderRanking();
      UIManager.renderMinigamesMenu();
      UIManager.showScreen('screen-menu');
    });
  }

  // Trocar jogador
  const switchPlayerBtn = document.getElementById('btn-switch-player');
  if (switchPlayerBtn) {
    switchPlayerBtn.addEventListener('click', () => {
      UIManager.renderProfiles();
      UIManager.showScreen('screen-profiles');
    });
  }

  // Game container para respostas
  const gameContainer = document.getElementById('game-container');
  if (gameContainer) {
    gameContainer.addEventListener('click', (e) => {
      const optionBtn = e.target.closest('.option-btn');
      if (optionBtn && !optionBtn.classList.contains('disabled')) {
        GameEngine.handleAnswer(optionBtn.textContent);
      }
    });
  }

  // Voltar ao menu
  const backMenuBtn = document.getElementById('btn-back-menu');
  if (backMenuBtn) {
    backMenuBtn.addEventListener('click', () => {
      GameEngine.cancelGame();
      UIManager.updateMenuUI();
      UIManager.showScreen('screen-menu');
    });
  }

  // Resultado
  const resultMenuBtn = document.getElementById('btn-result-menu');
  if (resultMenuBtn) {
    resultMenuBtn.addEventListener('click', () => {
      UIManager.updateMenuUI();
      UIManager.showScreen('screen-menu');
    });
  }

  const playAgainBtn = document.getElementById('btn-play-again');
  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', () => {
      UIManager.startMinigame('operators');
    });
  }

  // Boot - Renderiza tudo e mostra tela de perfis
  UIManager.renderProfiles();
  UIManager.renderRanking();
  UIManager.renderMinigamesMenu();
  UIManager.showScreen('screen-profiles');
  
  console.log('✅ MathQuest inicializado com sucesso!');
})();