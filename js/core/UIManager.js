/* ============================================================
   MÓDULO: UIManager
   Gerencia telas, ranking e componentes visuais
   ============================================================ */

const UIManager = (() => {
  const SCREENS = ['screen-profiles', 'screen-menu', 'screen-game', 'screen-result'];

  function showScreen(id) {
    console.log(`📱 Mostrando tela: ${id}`);
    SCREENS.forEach(s => {
      const el = document.getElementById(s);
      if (el) {
        el.classList.remove('active');
        el.classList.add('hidden');
      }
    });
    const target = document.getElementById(id);
    if (target) {
      target.classList.remove('hidden');
      void target.offsetWidth;
      target.classList.add('active');
    }
  }

  function renderProfiles() {
    const list = document.getElementById('profiles-list');
    const profiles = GameState.getAllProfiles();
    list.innerHTML = '';

    if (profiles.length === 0) {
      list.innerHTML = `<div class="ranking-empty">Nenhum jogador ainda.<br>Crie o primeiro perfil! 👇</div>`;
      return;
    }

    profiles.forEach(p => {
      const card = document.createElement('div');
      card.className = 'profile-card';
      card.innerHTML = `
        <div class="profile-avatar">${p.avatar}</div>
        <div class="profile-details">
          <div class="profile-name">${escapeHtml(p.name)}</div>
          <div class="profile-score">⭐ ${p.score} pontos</div>
        </div>
        <button class="profile-delete" data-id="${p.id}" title="Excluir perfil">🗑️</button>
      `;

      card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('profile-delete')) {
          selectProfile(p.id);
        }
      });

      card.querySelector('.profile-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteProfile(p.id);
      });

      list.appendChild(card);
    });
  }

  function selectProfile(id) {
    GameState.setCurrentPlayer(id);
    updateMenuUI();
    renderRanking();
    renderMinigamesMenu();
    showScreen('screen-menu');
  }

  function deleteProfile(id) {
    GameState.deleteProfile(id);
    renderProfiles();
  }

  function updateMenuUI() {
    const player = GameState.getCurrentPlayer();
    if (!player) return;

    document.getElementById('menu-avatar').textContent = player.avatar;
    document.getElementById('menu-player-name').textContent = escapeHtml(player.name);
    document.getElementById('menu-player-score').textContent = player.score;
  }

  function renderRanking() {
    const list = document.getElementById('ranking-list');
    const ranking = GameState.getRanking();
    const current = GameState.getCurrentPlayer();
    list.innerHTML = '';

    if (ranking.length === 0) {
      list.innerHTML = '<div class="ranking-empty">Nenhum jogador no ranking ainda.</div>';
      return;
    }

    ranking.forEach((p, i) => {
      const item = document.createElement('div');
      item.className = 'ranking-item';
      if (i === 0) item.classList.add('rank-1');
      if (current && p.id === current.id) item.classList.add('is-me');

      const medals = ['🥇', '🥈', '🥉'];
      const pos = medals[i] || `${i + 1}º`;

      item.innerHTML = `
        <div class="rank-pos">${pos}</div>
        <div class="rank-avatar">${p.avatar}</div>
        <div class="rank-name">${escapeHtml(p.name)}${current && p.id === current.id ? ' <span style="font-size:12px;color:var(--blue);">(você)</span>' : ''}</div>
        <div class="rank-score">${p.score}</div>
      `;
      list.appendChild(item);
    });
  }

  function renderMinigamesMenu() {
    console.log('🎮 Renderizando menu de minijogos...');
    const grid = document.getElementById('minigames-grid');
    const availableGames = GameRegistry.getAvailableGames();
    
    if (!grid) {
      console.error('Elemento minigames-grid não encontrado!');
      return;
    }
    
    grid.innerHTML = '';
    
    if (availableGames.length === 0) {
      grid.innerHTML = '<div class="ranking-empty">Nenhum jogo disponível.</div>';
      return;
    }
    
    availableGames.forEach(game => {
      const card = document.createElement('button');
      card.className = 'game-card';
      card.setAttribute('data-game', game.id);
      card.innerHTML = `
        <div class="game-card-icon">${game.icon}</div>
        <div class="game-card-title">${game.name}</div>
        <div class="game-card-sub">${game.description || 'Novo jogo!'}</div>
        <div class="game-card-badge">Fase ${game.phase}</div>
      `;
      
      card.addEventListener('click', () => {
        console.log(`🖱️ Clicou no jogo: ${game.id}`);
        startMinigame(game.id);
      });
      
      grid.appendChild(card);
      console.log(`✅ Botão adicionado: ${game.name}`);
    });
  }

  function startMinigame(gameId) {
    console.log(`🎮 Iniciando jogo: ${gameId}`);
    
    // Reseta UI
    const fb = document.getElementById('feedback-banner');
    if (fb) fb.classList.add('hidden');
    
    const progressBar = document.getElementById('game-progress-bar');
    if (progressBar) progressBar.style.width = '0%';
    
    const scorePill = document.getElementById('game-score-pill');
    if (scorePill) scorePill.textContent = '+0';
    
    const game = GameRegistry.getGame(gameId);
    if (!game) {
      console.error(`Jogo ${gameId} não encontrado!`);
      alert('Erro ao carregar o jogo. Tente novamente.');
      return;
    }
    
    const success = GameEngine.startGame(game, (result) => {
      showResultScreen(result);
    });
    
    if (success) {
      showScreen('screen-game');
    } else {
      console.error('Falha ao iniciar o jogo');
      alert('Erro ao iniciar o jogo. Tente novamente.');
    }
  }

  function showResultScreen(result) {
    document.getElementById('result-emoji').textContent = result.allCorrect ? '🌟' : result.correctAnswers >= 3 ? '🎉' : '💪';
    document.getElementById('result-title').textContent = result.allCorrect ? 'Perfeito! Pontuação Máxima!' : result.correctAnswers >= 3 ? 'Ótimo Trabalho!' : 'Continue Tentando!';
    document.getElementById('stat-correct').textContent = result.correctAnswers;
    document.getElementById('stat-wrong').textContent = result.wrongAnswers;
    document.getElementById('stat-points').textContent = `+${result.roundPoints}`;
    
    const bonus = document.getElementById('bonus-banner');
    bonus.className = result.allCorrect ? 'bonus-banner' : 'bonus-banner hidden';
    
    const player = GameState.getCurrentPlayer();
    document.getElementById('result-total-score').textContent = player ? player.score : 0;
    
    renderRanking();
    showScreen('screen-result');
  }

  function showScorePopup(points, isCorrect) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = points > 0 ? `+${points}` : `${points}`;
    popup.style.color = isCorrect ? 'var(--green)' : 'var(--red)';
    popup.style.top = '35%';
    popup.style.left = '50%';
    popup.style.transform = 'translateX(-50%)';
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 1200);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // Expor para uso em outros módulos
  return {
    showScreen,
    renderProfiles,
    updateMenuUI,
    renderRanking,
    renderMinigamesMenu,
    showScorePopup,
    startMinigame
  };
})();