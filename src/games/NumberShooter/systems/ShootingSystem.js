// src/games/NumberShooter/systems/ShootingSystem.js
export default class ShootingSystem {
  constructor(scene, telemetryService) {
    this.scene = scene
    this.telemetry = telemetryService
    this.shotsHistory = []
    this.currentTargetStartTime = null
  }
  
  registerShot(targetNumber, divisorChosen, correct) {
    const responseTime = this.currentTargetStartTime 
      ? (Date.now() - this.currentTargetStartTime)
      : 0
      
    const shotData = {
      targetNumber,
      divisorChosen,
      correct,
      responseTime,
      timestamp: new Date().toISOString()
    }
    
    this.shotsHistory.push(shotData)
    
    // Send to telemetry
    this.telemetry.track('SHOT_FIRED', shotData)
    
    return shotData
  }
  
  startNewTarget() {
    this.currentTargetStartTime = Date.now()
  }
  
  getShotsForCurrentTarget() {
    return this.shotsHistory
  }
  
  clearShots() {
    this.shotsHistory = []
  }
  
  calculateOptimalShots(number) {
    // Calculate minimum number of shots to reach 1
    let shots = 0
    let current = number
    
    const divisors = [5, 3, 2]
    
    for (const divisor of divisors) {
      while (current % divisor === 0 && current > 1) {
        current /= divisor
        shots++
      }
    }
    
    return shots
  }
}