// src/games/NumberShooter/systems/ScoreSystem.js
export default class ScoreSystem {
  constructor(scene, telemetryService, onScoreUpdate) {
    this.scene = scene
    this.telemetry = telemetryService
    this.onScoreUpdate = onScoreUpdate
    this.score = 0
    this.combo = 1
    this.totalShots = 0
    this.correctShots = 0
    this.targetsDestroyed = 0
    this.targetsMissed = 0
  }
  
  addPoints(basePoints) {
    const bonus = Math.floor(basePoints * (this.combo / 10))
    const totalPoints = basePoints + bonus
    
    this.score += totalPoints
    this.combo++
    
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score)
    }
    
    // Visual feedback
    this.scene.showFloatingText(`+${totalPoints}`, 0x00ff00)
    
    return totalPoints
  }
  
  resetCombo() {
    this.combo = 1
    this.scene.showFloatingText('Combo break!', 0xff0000)
  }
  
  registerShot(correct) {
    this.totalShots++
    if (correct) {
      this.correctShots++
    } else {
      this.resetCombo()
    }
  }
  
  registerTargetDestroyed(originalNumber, totalShots, optimalShots) {
    this.targetsDestroyed++
    
    // Calculate efficiency bonus
    const efficiency = optimalShots / totalShots
    const bonus = Math.floor(100 * efficiency)
    
    this.addPoints(100 + bonus)
    
    this.telemetry.track('TARGET_DESTROYED', {
      originalNumber,
      totalShots,
      optimalShots,
      efficiency,
      score: this.score,
      targetsDestroyed: this.targetsDestroyed
    })
  }
  
  registerTargetMissed(originalNumber) {
    this.targetsMissed++
    this.resetCombo()
    
    this.telemetry.track('TARGET_MISSED', {
      originalNumber,
      targetsMissed: this.targetsMissed,
      score: this.score
    })
  }
  
  getAccuracy() {
    return this.totalShots === 0 ? 0 : (this.correctShots / this.totalShots) * 100
  }
  
  getStats() {
    return {
      score: this.score,
      accuracy: this.getAccuracy(),
      targetsDestroyed: this.targetsDestroyed,
      targetsMissed: this.targetsMissed,
      totalShots: this.totalShots,
      combo: this.combo
    }
  }
  
  reset() {
    this.score = 0
    this.combo = 1
    this.totalShots = 0
    this.correctShots = 0
    this.targetsDestroyed = 0
    this.targetsMissed = 0
  }
}