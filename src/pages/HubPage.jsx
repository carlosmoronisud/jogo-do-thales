// src/pages/HubPage.jsx (com logs e verificação)
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import PhaserGame from '../components/PhaserGame'

export default function HubPage() {
  const navigate = useNavigate()
  const { activePlayer, progress, saveGameResult, loadPlayers, players } = useGameStore()
  const [selectedGame, setSelectedGame] = useState(null)
  const [showGame, setShowGame] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [lastScore, setLastScore] = useState(0)

  useEffect(() => {
    console.log('🏠 HubPage montado')
    console.log('ActivePlayer:', activePlayer)
    
    if (!activePlayer) {
      console.log('❌ Sem activePlayer, redirecionando para /profiles')
      navigate('/profiles')
    } else {
      console.log('✅ ActivePlayer encontrado:', activePlayer)
      loadPlayers()
      
      // Verificar localStorage
      const stored = localStorage.getItem('game-storage')
      console.log('💾 localStorage no HubPage:', stored)
      if (stored) {
        const parsed = JSON.parse(stored)
        console.log('📦 Dados no localStorage:', parsed.state)
      }
    }
  }, [activePlayer, navigate, loadPlayers])

  const games = [
    {
      id: 'NumberShooter',
      title: 'Number Shooter',
      description: 'Divida os números até chegar a 1!',
      icon: '🎯',
      color: 'from-purple-500 to-pink-500',
      unlocked: true
    }
  ]

  const handlePlayGame = useCallback((game) => {
    if (game.unlocked) {
      console.log('🎮 Abrindo jogo:', game.title)
      setSelectedGame(game)
      setShowGame(true)
    }
  }, [])

  // src/pages/HubPage.jsx (parte do handleGameComplete corrigida)
  const handleGameComplete = useCallback((gameResults) => {
    console.log('🎮🎮🎮 PARTIDA FINALIZADA 🎮🎮🎮')
    console.log('Resultados recebidos:', gameResults)
    console.log('Score:', gameResults.score)
    console.log('ActivePlayer:', activePlayer)
    
    setShowGame(false)
    
    if (!activePlayer) {
      console.error('❌ ERRO: activePlayer é null!')
      return
    }
    
    // Chamar a função de salvar
    const result = saveGameResult(activePlayer.id, gameResults.score)
    console.log('Resultado do saveGameResult:', result)
    
    setLastScore(gameResults.score)
    setShowResults(true)
    
    // Forçar atualização da página após 1 segundo para mostrar os novos dados
    setTimeout(() => {
      window.location.reload()
    }, 1500)
  }, [activePlayer, saveGameResult])

  if (!activePlayer) {
    console.log('⏳ Aguardando activePlayer...')
    return null
  }

  const totalScore = activePlayer.totalScore || 0
  const gamesPlayed = activePlayer.gamesPlayed || 0
  const bestScore = activePlayer.bestScore || 0
  const playerTitle = activePlayer.title || { name: 'Novato', emoji: '🌱' }
  
  console.log('📊 Renderizando HubPage com estatísticas:')
  console.log('  - Total Score:', totalScore)
  console.log('  - Partidas:', gamesPlayed)
  console.log('  - Melhor Score:', bestScore)
  console.log('  - Título:', playerTitle)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 to-purple-950 pb-20">
      {/* Header com estatísticas */}
      <div className="bg-black/30 backdrop-blur-md shadow-lg sticky top-0 z-10">
        <div className="px-4 py-3 max-w-6xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="text-3xl">{playerTitle.emoji}</div>
              <div>
                <h1 className="text-lg font-bold text-white">Olá, {activePlayer.name}!</h1>
                <p className="text-sm text-purple-300">{playerTitle.name}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/profiles')}
              className="text-gray-400 hover:text-white text-sm"
            >
              Trocar Jogador
            </button>
          </div>
          
          {/* Cards de estatísticas */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="text-2xl font-bold text-yellow-400">{totalScore}</div>
              <div className="text-xs text-gray-400">Total Score</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="text-2xl font-bold text-blue-400">{gamesPlayed}</div>
              <div className="text-xs text-gray-400">Partidas</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="text-2xl font-bold text-purple-400">{bestScore}</div>
              <div className="text-xs text-gray-400">Melhor Score</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-6xl mx-auto">
        <h2 className="text-lg font-bold text-white mb-3">🎮 Jogos Disponíveis</h2>
        <div className="grid grid-cols-1 gap-3">
          {games.map(game => (
            <div
              key={game.id}
              onClick={() => handlePlayGame(game)}
              className="bg-white/10 backdrop-blur rounded-xl p-4 cursor-pointer hover:bg-white/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`bg-gradient-to-r ${game.color} rounded-xl p-3 text-white`}>
                  <div className="text-3xl">{game.icon}</div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{game.title}</h3>
                  <p className="text-xs text-gray-300">{game.description}</p>
                  {progress.gameScores[game.id] > 0 && (
                    <div className="mt-1 text-xs text-yellow-400">
                      ⭐ Melhor: {progress.gameScores[game.id]}
                    </div>
                  )}
                </div>
                <div className="text-purple-400 text-xl">→</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Resultado */}
      {showResults && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="text-6xl mb-3">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">Pontuação da Partida</h2>
            <div className="text-5xl font-bold text-yellow-400 mb-4">{lastScore}</div>
            <div className="space-y-2 mb-6 text-left">
              <div className="flex justify-between">
                <span className="text-gray-300">Total acumulado:</span>
                <span className="text-white font-bold">{totalScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Melhor pontuação:</span>
                <span className="text-yellow-400 font-bold">{bestScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Partidas jogadas:</span>
                <span className="text-white font-bold">{gamesPlayed}</span>
              </div>
            </div>
            <button
              onClick={() => {
                setShowResults(false)
                window.location.reload()
              }}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Game Modal */}
      {showGame && selectedGame && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setShowGame(false)}
              className="absolute -top-8 right-0 text-white text-xl hover:text-gray-300 z-10"
            >
              ✕ Fechar
            </button>
            // No HubPage.jsx, na chamada do PhaserGame
              <PhaserGame 
                gameId={selectedGame.id}
                onComplete={handleGameComplete}
                playerId={activePlayer.id}  // Garantir que isso está correto
                metrics={{}}
              />
          </div>
        </div>
      )}
    </div>
  )
}