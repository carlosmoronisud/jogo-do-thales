// src/services/TelemetryService.js (corrigido - remover saveSession)
import { dbService } from './DatabaseService'

class TelemetryService {
  constructor() {
    this.sessionEvents = []
    this.currentSessionId = null
  }

  startSession(playerId) {
    this.currentSessionId = Date.now().toString()
    this.sessionEvents = []
    
    this.track('session_start', {
      playerId,
      sessionId: this.currentSessionId,
      timestamp: new Date().toISOString()
    })
  }

  endSession(playerId) {
    this.track('session_end', {
      playerId,
      sessionId: this.currentSessionId,
      timestamp: new Date().toISOString(),
      totalEvents: this.sessionEvents.length
    })
    
    this.currentSessionId = null
    this.sessionEvents = []
  }

  async track(eventName, payload) {
    const event = {
      id: `${Date.now()}_${Math.random()}`,
      eventName,
      timestamp: new Date().toISOString(),
      sessionId: this.currentSessionId,
      ...payload
    }
    
    this.sessionEvents.push(event)
    console.log(`[Telemetry] ${eventName}:`, payload)
  }

  getSessionEvents() {
    return this.sessionEvents
  }
}

export const telemetryService = new TelemetryService()