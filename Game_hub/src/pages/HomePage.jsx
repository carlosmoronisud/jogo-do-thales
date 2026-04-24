// src/pages/HomePage.jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'

export default function HomePage() {
  const navigate = useNavigate()
  const { players, loadPlayers } = useGameStore()

  useEffect(() => {
    loadPlayers()
  }, [loadPlayers])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-primary-600 mb-2">
            Play & Learn
          </h1>
          <p className="text-gray-600 text-lg">
            Educational Games for Kids
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/profiles')}
            className="w-full bg-primary-500 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:bg-primary-600"
          >
            Start Playing
          </button>

          {players.length > 0 && (
            <div className="text-center text-sm text-gray-500">
              {players.length} profile(s) available
            </div>
          )}
        </div>

        <div className="text-center text-xs text-gray-400">
          Safe, educational, and fun!
        </div>
      </div>
    </div>
  )
}