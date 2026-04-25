// src/store/gameStore.js (com logs detalhados)
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const initialState = {
  activePlayer: null,
  players: [],
  progress: {
    unlockedGames: ['NumberShooter'],
    completedGames: {},
    gameScores: {}
  }
}

const getTitleByScore = (totalScore) => {
  if (totalScore >= 5000) return { name: 'Mestre dos Números', emoji: '🏆' }
  if (totalScore >= 3000) return { name: 'Matemático Lendário', emoji: '🌟' }
  if (totalScore >= 2000) return { name: 'Calculador Avançado', emoji: '📚' }
  if (totalScore >= 1000) return { name: 'Aprendiz Dedicado', emoji: '🎯' }
  if (totalScore >= 500) return { name: 'Iniciante Promissor', emoji: '⭐' }
  return { name: 'Novato', emoji: '🌱' }
}

export const useGameStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      setActivePlayer: (player) => {
        console.log('🎮 setActivePlayer chamado:', player)
        set({ activePlayer: player })
      },

      createPlayer: (name) => {
        console.log('👤 createPlayer chamado para:', name)
        const newPlayer = {
          id: Date.now().toString(),
          name,
          createdAt: new Date().toISOString(),
          totalScore: 0,
          gamesPlayed: 0,
          bestScore: 0,
          title: { name: 'Novato', emoji: '🌱' }
        }
        
        console.log('📝 Novo jogador criado:', newPlayer)
        
        set((state) => {
          const newPlayers = [...state.players, newPlayer]
          console.log('📋 Lista de jogadores atualizada:', newPlayers)
          return { players: newPlayers }
        })
        
        // Verificar localStorage
        const stored = localStorage.getItem('game-storage')
        console.log('💾 localStorage após criar:', stored)
        
        return newPlayer
      },

      saveGameResult: (playerId, gameScore) => {
        console.log('💾💾💾 SAVE GAME RESULT CHAMADO 💾💾💾')
        console.log('Player ID:', playerId)
        console.log('Game Score:', gameScore)
        
        const state = get()
        console.log('Estado atual da store:', state)
        
        const player = state.players.find(p => p.id === playerId)
        console.log('Jogador encontrado:', player)
        
        if (!player) {
          console.error('❌ Jogador não encontrado! ID:', playerId)
          return null
        }

        const newTotalScore = (player.totalScore || 0) + gameScore
        const newGamesPlayed = (player.gamesPlayed || 0) + 1
        const newBestScore = Math.max(player.bestScore || 0, gameScore)
        const newTitle = getTitleByScore(newTotalScore)
        
        console.log('📊 Novos valores calculados:')
        console.log('  - Novo total:', newTotalScore)
        console.log('  - Novas partidas:', newGamesPlayed)
        console.log('  - Nova melhor pontuação:', newBestScore)
        console.log('  - Novo título:', newTitle)
        
        const updatedPlayer = {
          ...player,
          totalScore: newTotalScore,
          gamesPlayed: newGamesPlayed,
          bestScore: newBestScore,
          title: newTitle
        }
        
        console.log('✅ Jogador atualizado:', updatedPlayer)
        
        set((state) => {
          const newPlayers = state.players.map(p => p.id === playerId ? updatedPlayer : p)
          const newProgress = {
            ...state.progress,
            gameScores: {
              ...state.progress.gameScores,
              NumberShooter: Math.max(state.progress.gameScores.NumberShooter || 0, gameScore)
            },
            completedGames: {
              ...state.progress.completedGames,
              NumberShooter: (state.progress.completedGames.NumberShooter || 0) + 1
            }
          }
          
          console.log('📦 Setando novo estado:')
          console.log('  - Players:', newPlayers)
          console.log('  - Progress:', newProgress)
          console.log('  - ActivePlayer:', state.activePlayer?.id === playerId ? updatedPlayer : state.activePlayer)
          
          return {
            players: newPlayers,
            activePlayer: state.activePlayer?.id === playerId ? updatedPlayer : state.activePlayer,
            progress: newProgress
          }
        })
        
        // Verificar localStorage após salvar
        setTimeout(() => {
          const stored = localStorage.getItem('game-storage')
          console.log('💾 localStorage após salvar:', stored)
          if (stored) {
            const parsed = JSON.parse(stored)
            console.log('📦 Conteúdo do localStorage parseado:', parsed.state)
          }
        }, 100)
        
        return { newTotalScore, newBestScore, newTitle, hasNewTitle: newTitle.name !== player.title?.name }
      },

      loadPlayers: () => {
        const state = get()
        console.log('🔍 loadPlayers chamado, estado atual:', state)
        const stored = localStorage.getItem('game-storage')
        console.log('💾 localStorage em loadPlayers:', stored)
        return state.players
      }
    }),
    {
      name: 'game-storage',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          console.log('📖 localStorage.getItem:', name, str)
          return str ? JSON.parse(str) : null
        },
        setItem: (name, value) => {
          console.log('💾 localStorage.setItem:', name, value)
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          console.log('🗑️ localStorage.removeItem:', name)
          localStorage.removeItem(name)
        }
      }
    }
  )
)