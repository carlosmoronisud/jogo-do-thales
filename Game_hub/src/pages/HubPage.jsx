// src/pages/HubPage.jsx (versão completa corrigida)
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { telemetryService } from '../services/TelemetryService'
import { metricsEngine } from '../services/MetricsEngine'
import PhaserGame from '../components/PhaserGame'
import { useGameMetrics } from '../hooks/useGameMetrics'
import { useGameDifficulty } from '../hooks/useGameDifficulty'

export default function HubPage() {
  const navigate = useNavigate()
  const { activePlayer, metrics: storeMetrics, progress, updateMetrics: updateStoreMetrics } = useGameStore()
  const { metrics: hookMetrics, updateMetrics: updateHookMetrics, calculateMetrics } = useGameMetrics(activePlayer?.id)
  const { difficulty, calculateDifficulty } = useGameDifficulty(hookMetrics || storeMetrics)
  const [selectedGame, setSelectedGame] = useState(null)
  const [showGame, setShowGame] = useState(false)

  // Usar métricas do hook ou da store
  const metrics = hookMetrics || storeMetrics

  useEffect(() => {
    if (!activePlayer) {
      navigate('/profiles')
    } else {
      telemetryService.startSession(activePlayer.id)
      // Calcular métricas iniciais
      calculateMetrics()
    }

    return () => {
      if (activePlayer) {
        telemetryService.endSession(activePlayer.id)
      }
    }
  }, [activePlayer, navigate, calculateMetrics])

  // Calcular dificuldade quando as métricas mudarem
  useEffect(() => {
    if (metrics && Object.values(metrics).some(v => v > 0)) {
      calculateDifficulty()
    }
  }, [metrics, calculateDifficulty])

  const games = [
    {
      id: 'NumberShooter',
      title: 'Number Shooter',
      description: 'Shoot the correct numbers!',
      icon: '🎯',
      color: 'from-green-400 to-blue-500',
      unlocked: true
    },
    {
      id: 'ComingSoon1',
      title: 'Coming Soon',
      description: 'New game coming soon!',
      icon: '🔜',
      color: 'from-gray-400 to-gray-500',
      unlocked: false
    }
  ]

  const handlePlayGame = useCallback((game) => {
    if (game.unlocked) {
      setSelectedGame(game)
      setShowGame(true)
      telemetryService.track('game_started', { 
        gameId: game.id, 
        playerId: activePlayer?.id,
        difficulty: difficulty.level 
      })
    }
  }, [activePlayer, difficulty])

  const handleGameComplete = useCallback((gameResults) => {
    setShowGame(false)
    telemetryService.track('game_completed', {
      gameId: selectedGame?.id,
      playerId: activePlayer?.id,
      results: gameResults,
      difficulty: difficulty.level
    })
    
    // Update metrics based on game session
    const sessionEvents = telemetryService.getSessionEvents()
    const newMetrics = metricsEngine.calculateSessionMetrics(sessionEvents)
    
    // Atualiza tanto o hook quanto a store
    updateHookMetrics(sessionEvents)
    updateStoreMetrics(activePlayer.id, newMetrics)
  }, [selectedGame, activePlayer, updateStoreMetrics, updateHookMetrics, difficulty])

  if (!activePlayer) return null

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Game Hub</h1>
              <p className="text-sm text-gray-600">Welcome, {activePlayer.name}!</p>
            </div>
            <button
              onClick={() => navigate('/profiles')}
              className="text-gray-600 hover:text-gray-800"
            >
              Switch Player
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Difficulty Badge */}
        <div className="mb-4 flex justify-end">
          <div className="bg-white rounded-full px-4 py-2 shadow-md">
            <span className="text-sm font-semibold text-gray-700">
              Difficulty: 
              <span className={`ml-2 ${
                difficulty.level === 'easy' ? 'text-green-600' : 
                difficulty.level === 'medium' ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {difficulty.level.toUpperCase()}
              </span>
            </span>
          </div>
        </div>

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <div className="bg-white rounded-xl p-3 shadow-md text-center">
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-xs text-gray-600">Accuracy</div>
            <div className="text-lg font-bold text-primary-600">{metrics?.accuracy || 0}%</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-md text-center">
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-xs text-gray-600">Efficiency</div>
            <div className="text-lg font-bold text-primary-600">{metrics?.efficiency || 0}</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-md text-center">
            <div className="text-2xl mb-1">🚀</div>
            <div className="text-xs text-gray-600">Speed</div>
            <div className="text-lg font-bold text-primary-600">{metrics?.speed || 0}ms</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-md text-center">
            <div className="text-2xl mb-1">💪</div>
            <div className="text-xs text-gray-600">Persistence</div>
            <div className="text-lg font-bold text-primary-600">{metrics?.persistence || 0}%</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-md text-center">
            <div className="text-2xl mb-1">🎮</div>
            <div className="text-xs text-gray-600">Engagement</div>
            <div className="text-lg font-bold text-primary-600">{metrics?.engagement || 0}</div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Available Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {games.map(game => (
              <div
                key={game.id}
                onClick={() => handlePlayGame(game)}
                className={`game-card ${!game.unlocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`bg-linear-to-r ${game.color} rounded-xl p-4 text-white mb-3`}>
                  <div className="text-4xl">{game.icon}</div>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{game.title}</h3>
                <p className="text-sm text-gray-600">{game.description}</p>
                {progress.gameScores[game.id] && (
                  <div className="mt-2 text-xs text-primary-600">
                    Best Score: {progress.gameScores[game.id]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <h3 className="font-semibold text-gray-800 mb-3">Your Progress</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Games Played</span>
              <span className="font-semibold">{Object.keys(progress.completedGames).length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Games Unlocked</span>
              <span className="font-semibold">{progress.unlockedGames.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-500 rounded-full h-2 transition-all duration-500"
                style={{ width: `${(progress.unlockedGames.length / games.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Game Modal */}
      {showGame && selectedGame && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setShowGame(false)}
              className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300 z-10"
            >
              ✕
            </button>
            <PhaserGame 
              gameId={selectedGame.id}
              onComplete={handleGameComplete}
              playerId={activePlayer.id}
              metrics={metrics}
            />
          </div>
        </div>
      )}
    </div>
  );
};