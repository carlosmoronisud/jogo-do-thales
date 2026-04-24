// src/pages/ProfilePage.jsx
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { telemetryService } from '../services/TelemetryService'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { players, createPlayer, setActivePlayer, loadPlayers } = useGameStore()
  const [newPlayerName, setNewPlayerName] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    loadPlayers()
  }, [loadPlayers])

  const handleCreatePlayer = useCallback(async () => {
    if (newPlayerName.trim()) {
      const player = await createPlayer(newPlayerName.trim())
      setActivePlayer(player)
      telemetryService.track('profile_created', { playerId: player.id, playerName: player.name })
      navigate('/hub')
    }
  }, [newPlayerName, createPlayer, setActivePlayer, navigate])

  const handleSelectPlayer = useCallback((player) => {
    setActivePlayer(player)
    telemetryService.track('profile_selected', { playerId: player.id, playerName: player.name })
    navigate('/hub')
  }, [setActivePlayer, navigate])

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Player Profiles</h1>
          <p className="text-gray-600">Choose or create a player</p>
        </div>

        {players.length > 0 && (
          <div className="space-y-3 mb-6">
            <h2 className="text-lg font-semibold text-gray-700">Existing Players</h2>
            {players.map(player => (
              <button
                key={player.id}
                onClick={() => handleSelectPlayer(player)}
                className="w-full bg-white rounded-xl p-4 text-left shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-800">{player.name}</div>
                    <div className="text-sm text-gray-500">
                      Joined {new Date(player.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-primary-500">→</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full border-2 border-dashed border-primary-300 rounded-xl p-4 text-primary-600 font-semibold hover:bg-primary-50"
          >
            + Create New Player
          </button>
        ) : (
          <div className="bg-white rounded-xl p-4 shadow-md">
            <input
              type="text"
              placeholder="Enter player name"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreatePlayer}
                className="flex-1 bg-primary-500 text-white py-2 rounded-lg font-semibold"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate('/')}
          className="mt-6 w-full text-gray-500 py-2 text-center"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  )
}