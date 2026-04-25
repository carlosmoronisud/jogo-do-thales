// src/pages/ProfilePage.jsx (atualizado)
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { players, createPlayer, setActivePlayer, loadPlayers } = useGameStore()
  const [newPlayerName, setNewPlayerName] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    loadPlayers()
  }, [loadPlayers])

  const handleCreatePlayer = useCallback(() => {
    if (newPlayerName.trim()) {
      const player = createPlayer(newPlayerName.trim())
      setActivePlayer(player)
      navigate('/hub')
    }
  }, [newPlayerName, createPlayer, setActivePlayer, navigate])

  const handleSelectPlayer = useCallback((player) => {
    setActivePlayer(player)
    navigate('/hub')
  }, [setActivePlayer, navigate])

  // Forçar atualização da lista de jogadores
  const playerList = players || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 to-purple-950 p-4 pb-20">
      <div className="max-w-md mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">🎮 Jogadores</h1>
          <p className="text-gray-300">Escolha ou crie seu perfil</p>
        </div>

        {playerList.length > 0 && (
          <div className="space-y-3 mb-6">
            {playerList.map(player => {
              const playerTitle = player.title || { name: 'Novato', emoji: '🌱' }
              return (
                <button
                  key={player.id}
                  onClick={() => handleSelectPlayer(player)}
                  className="w-full bg-white/10 backdrop-blur rounded-xl p-4 text-left hover:bg-white/20 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{playerTitle.emoji}</span>
                        <div>
                          <div className="font-semibold text-white">{player.name}</div>
                          <div className="text-xs text-purple-300">{playerTitle.name}</div>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-2 text-xs">
                        <div>
                          <span className="text-gray-400">🏆</span>
                          <span className="text-white ml-1">{player.totalScore || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">🎮</span>
                          <span className="text-white ml-1">{player.gamesPlayed || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">⭐</span>
                          <span className="text-yellow-400 ml-1">{player.bestScore || 0}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-purple-400 text-xl">→</div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full border-2 border-dashed border-purple-400 rounded-xl p-4 text-purple-300 font-semibold hover:bg-purple-900/30"
          >
            + Criar Novo Jogador
          </button>
        ) : (
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <input
              type="text"
              placeholder="Nome do jogador"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreatePlayer}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700"
              >
                Criar
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 bg-gray-700 text-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate('/')}
          className="mt-6 w-full text-gray-400 py-2 text-center hover:text-white"
        >
          ← Voltar ao Início
        </button>
      </div>
    </div>
  )
}