/* ============================================================
   MÓDULO: GameState
   Gerencia perfis, ranking e pontuação global
   ============================================================ */

const GameState = (() => {
  let profiles = [];
  let currentPlayerId = null;

  const AVATARS = ['🧒', '👦', '👧', '🧑', '🦸', '🧙', '👾', '🐱', '🦊', '🐸', '🦄', '🐧'];

  function getRandomAvatar() {
    return AVATARS[Math.floor(Math.random() * AVATARS.length)];
  }

  function createProfile(name) {
    const profile = {
      id: Date.now(),
      name: name.trim(),
      score: 0,
      avatar: getRandomAvatar()
    };
    profiles.push(profile);
    return profile;
  }

  function deleteProfile(id) {
    profiles = profiles.filter(p => p.id !== id);
    if (currentPlayerId === id) currentPlayerId = null;
  }

  function setCurrentPlayer(id) {
    currentPlayerId = id;
  }

  function getCurrentPlayer() {
    return profiles.find(p => p.id === currentPlayerId) || null;
  }

  function addScore(points) {
    const player = getCurrentPlayer();
    if (player) {
      player.score += points;
      if (player.score < 0) player.score = 0;
    }
  }

  function getRanking() {
    return [...profiles].sort((a, b) => b.score - a.score);
  }

  function getAllProfiles() {
    return profiles;
  }

  // Expor para debug (opcional)
  if (typeof window !== 'undefined') {
    window.GameState = {
      createProfile,
      deleteProfile,
      setCurrentPlayer,
      getCurrentPlayer,
      addScore,
      getRanking,
      getAllProfiles
    };
  }

  return {
    createProfile,
    deleteProfile,
    setCurrentPlayer,
    getCurrentPlayer,
    addScore,
    getRanking,
    getAllProfiles
  };
})();