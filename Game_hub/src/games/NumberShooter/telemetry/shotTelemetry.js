// src/games/NumberShooter/telemetry/shotTelemetry.js
export class ShotTelemetry {
  constructor(telemetryService) {
    this.telemetry = telemetryService
  }
  
  trackShot(targetNumber, divisor, correct, responseTime) {
    this.telemetry.track('SHOT_FIRED', {
      targetNumber,
      divisorChosen: divisor,
      correct,
      responseTime,
      timestamp: new Date().toISOString()
    })
  }
  
  trackDestruction(originalNumber, totalShots, optimalShots) {
    const efficiency = optimalShots / totalShots
    this.telemetry.track('TARGET_DESTROYED', {
      originalNumber,
      totalShots,
      optimalShots,
      efficiency
    })
  }
  
  trackMiss(originalNumber) {
    this.telemetry.track('TARGET_MISSED', {
      originalNumber
    })
  }
}