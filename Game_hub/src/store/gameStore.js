// src/store/gameStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { dbService } from '../services/DatabaseService'

const initialState = {
  activePlayer: null,
  players: [],
  metrics: {},
  progress: {
    unlockedGames: ['NumberShooter'],
    completedGames: {},
    gameScores: {}
  }
}

export const useGameStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      setActivePlayer: (player) => {
        set({ activePlayer: player })
        // Load player's metrics when active player changes
        const playerMetrics = dbService.loadMetrics(player.id)
        if (playerMetrics) {
          set({ metrics: playerMetrics })
        }
        
        // Example usage of the [get](cci:1://file:///c:/Users/carlo/Desktop/jogo%20do%20thales/Game_hub/src/store/gameStore.js:91:6-91:36) parameter
        const currentActivePlayer = get().activePlayer
        console.log('Current active player:', currentActivePlayer)
      },

      createPlayer: async (name) => {
        const newPlayer = {
          id: Date.now().toString(),
          name,
          createdAt: new Date().toISOString(),
          metrics: {
            accuracy: 0,
            efficiency: 0,
            speed: 0,
            persistence: 0,
            engagement: 0,
            gamesPlayed: 0,
            totalTime: 0
          }
        }
        
        await dbService.savePlayer(newPlayer)
        
        set((state) => ({
          players: [...state.players, newPlayer]
        }))
        
        return newPlayer
      },

      updateMetrics: async (playerId, newMetrics) => {
        await dbService.saveMetrics(playerId, newMetrics)
        
        set((state) => ({
          metrics: { ...state.metrics, ...newMetrics }
        }))
      },

      unlockGame: (gameId) => {
        set((state) => ({
          progress: {
            ...state.progress,
            unlockedGames: [...state.progress.unlockedGames, gameId]
          }
        }))
      },

      updateGameScore: (gameId, score) => {
        set((state) => ({
          progress: {
            ...state.progress,
            gameScores: {
              ...state.progress.gameScores,
              [gameId]: score
            }
          }
        }))
      },

      loadPlayers: async () => {
        const players = await dbService.loadAllPlayers()
        set({ players })
      }
    }),
    {
      name: 'game-storage',
      getStorage: () => localStorage
    }
  )
)