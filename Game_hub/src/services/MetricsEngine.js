// src/services/MetricsEngine.js
export class MetricsEngine {
  calculateSessionMetrics(events) {
    const gameEvents = events.filter(e => e.eventName === 'game_action')
    
    if (gameEvents.length === 0) {
      return {
        accuracy: 0,
        efficiency: 0,
        speed: 0,
        persistence: 0,
        engagement: 0
      }
    }

    // Calculate accuracy based on correct/incorrect answers
    const correctActions = gameEvents.filter(e => e.payload?.correct === true)
    const accuracy = (correctActions.length / gameEvents.length) * 100

    // Calculate efficiency (score per minute)
    const totalScore = gameEvents.reduce((sum, e) => sum + (e.payload?.score || 0), 0)
    const timeRange = this.getTimeRange(events)
    const efficiency = timeRange > 0 ? (totalScore / timeRange) * 60 : 0

    // Calculate speed (average response time)
    const responseTimes = this.calculateResponseTimes(gameEvents)
    const speed = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0

    // Calculate persistence (continuation after failures)
    const failureSequences = this.findFailureSequences(gameEvents)
    const persistence = failureSequences.length > 0 
      ? failureSequences.filter(seq => seq.recovered === true).length / failureSequences.length
      : 1

    // Calculate engagement (interaction frequency)
    const engagement = gameEvents.length / (timeRange / 60)

    return {
      accuracy: Math.round(accuracy),
      efficiency: Math.round(efficiency),
      speed: Math.round(speed),
      persistence: Math.round(persistence * 100),
      engagement: Math.round(Math.min(engagement * 10, 100))
    }
  }

  calculateResponseTimes(events) {
    const times = []
    for (let i = 1; i < events.length; i++) {
      const timeDiff = new Date(events[i].timestamp) - new Date(events[i-1].timestamp)
      if (timeDiff < 30000) { // Only consider responses within 30 seconds
        times.push(timeDiff)
      }
    }
    return times
  }

  findFailureSequences(events) {
    const sequences = []
    let currentSequence = []
    
    for (const event of events) {
      if (event.payload?.correct === false) {
        currentSequence.push(event)
      } else if (currentSequence.length > 0) {
        sequences.push({
          length: currentSequence.length,
          recovered: event.payload?.correct === true,
          events: [...currentSequence]
        })
        currentSequence = []
      }
    }
    
    return sequences
  }

  getTimeRange(events) {
    if (events.length < 2) return 0
    const firstTime = new Date(events[0].timestamp)
    const lastTime = new Date(events[events.length - 1].timestamp)
    return (lastTime - firstTime) / 1000 // seconds
  }
}

export const metricsEngine = new MetricsEngine()