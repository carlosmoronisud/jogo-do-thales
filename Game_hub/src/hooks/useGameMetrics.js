// src/hooks/useGameMetrics.js (versão alternativa sem useEffect)
import { useState, useCallback } from 'react'
import { metricsEngine } from '../services/MetricsEngine'
import { telemetryService } from '../services/TelemetryService'

export function useGameMetrics(playerId) {
  const [metrics, setMetrics] = useState(null)

  // Calcula métricas baseado nos eventos atuais
  const calculateMetrics = useCallback(() => {
    if (playerId) {
      const sessionEvents = telemetryService.getSessionEvents()
      const calculatedMetrics = metricsEngine.calculateSessionMetrics(sessionEvents)
      setMetrics(calculatedMetrics)
      return calculatedMetrics
    }
    return null
  }, [playerId])

  const updateMetrics = useCallback((newEvents) => {
    const allEvents = newEvents 
      ? [...telemetryService.getSessionEvents(), ...newEvents]
      : telemetryService.getSessionEvents()
    const calculatedMetrics = metricsEngine.calculateSessionMetrics(allEvents)
    setMetrics(calculatedMetrics)
    return calculatedMetrics
  }, [])

  // Se precisar calcular as métricas inicialmente, chame manualmente onde for usar
  // Em vez de useEffect, retornamos a função calculateMetrics para ser chamada quando necessário

  return { 
    metrics, 
    updateMetrics,
    calculateMetrics // Expoe a função para cálculo inicial se necessário
  }
}