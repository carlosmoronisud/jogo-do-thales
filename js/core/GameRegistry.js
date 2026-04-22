/* ============================================================
   MÓDULO: GameRegistry
   Registra e gerencia os minijogos disponíveis
   ============================================================ */

const GameRegistry = (() => {
  const games = new Map();

  function register(gameId, config) {
    console.log(`📦 Registrando jogo: ${gameId}`);
    games.set(gameId, {
      id: gameId,
      name: config.name,
      icon: config.icon,
      description: config.description,
      gameClass: config.gameClass,
      phase: config.phase || 1
    });
  }

  function getGame(gameId) {
    const gameConfig = games.get(gameId);
    if (!gameConfig) {
      console.error(`Jogo ${gameId} não encontrado!`);
      return null;
    }
    const GameClass = gameConfig.gameClass;
    return new GameClass();
  }

  function getAllGames() {
    return Array.from(games.values());
  }

  function getAvailableGames() {
    return Array.from(games.values()).filter(game => game.phase === 1);
  }

  return {
    register,
    getGame,
    getAllGames,
    getAvailableGames
  };
})();