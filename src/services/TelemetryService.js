// src/services/TelemetryService.js
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
    
    this.saveSession()
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
    
    // Log for development
    console.log(`[Telemetry] ${eventName}:`, payload)
    
    // Could send to analytics service here
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      await this.sendToAnalytics(event)
    }
  }

  async sendToAnalytics(event) {
    // Implement analytics API calls here
    // Example: await fetch('/api/analytics', { method: 'POST', body: JSON.stringify(event) })
    console.log('[Analytics] Would send:', event)
  }

  async saveSession() {
    if (this.currentSessionId && this.sessionEvents.length > 0) {
      await dbService.saveSession({
        id: this.currentSessionId,
        events: this.sessionEvents,
        timestamp: new Date().toISOString()
      })
    }
  }

  getSessionEvents() {
    return this.sessionEvents
  }
}

export const telemetryService = new TelemetryService()