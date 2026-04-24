// src/hooks/useGameDifficulty.js
import { useState, useCallback } from 'react'
import { difficultyEngine } from '../services/DifficultyEngine'

export function useGameDifficulty(metrics) {
  const [difficulty, setDifficulty] = useState({ level: 'easy', config: null })

  // Remove o useEffect e expõe uma função para atualizar a dificuldade
  const updateDifficulty = useCallback(() => {
    if (metrics && Object.values(metrics).some(v => v > 0)) {
      const adjusted = difficultyEngine.adjust(metrics)
      setDifficulty(adjusted)
      return adjusted
    }
    return difficulty
  }, [metrics, difficulty])

  // Se precisar calcular a dificuldade inicial baseada nas métricas
  const calculateDifficulty = useCallback(() => {
    if (metrics && Object.values(metrics).some(v => v > 0)) {
      const adjusted = difficultyEngine.adjust(metrics)
      setDifficulty(adjusted)
      return adjusted
    }
    return null
  }, [metrics])

  return { 
    difficulty, 
    updateDifficulty,
    calculateDifficulty 
  }
}