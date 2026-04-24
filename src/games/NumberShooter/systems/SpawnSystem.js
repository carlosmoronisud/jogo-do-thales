// src/games/NumberShooter/systems/SpawnSystem.js (corrigido - garantindo configuração)
import NumberTarget from '../entities/NumberTarget'

export default class SpawnSystem {
  constructor(scene, difficultyEngine) {
    this.scene = scene
    this.difficultyEngine = difficultyEngine
    this.currentDifficulty = null
    this.currentTarget = null
  }
  
  updateDifficulty(metrics) {
    this.currentDifficulty = this.difficultyEngine.adjust(metrics)
    // Garantir que config existe
    if (!this.currentDifficulty.config) {
      this.currentDifficulty.config = {
        fallSpeed: 50,
        numbersRange: [10, 30],
        spawnRate: 2000,
        maxEnemies: 3,
        timeLimit: 60,
        targetValue: 10,
        feedbackDelay: 500
      }
    }
    console.log('[SpawnSystem] Difficulty updated:', this.currentDifficulty)
    return this.currentDifficulty
  }
  
  generateNumber() {
    const config = this.currentDifficulty.config
    const numbersRange = config.numbersRange || [10, 30]
    const min = numbersRange[0]
    const max = numbersRange[1]
    const number = Math.floor(Math.random() * (max - min + 1)) + min
    console.log('[SpawnSystem] Generated number:', number, 'Range:', numbersRange)
    return number
  }
  
  spawnTarget(x, customNumber = null) {
    const number = customNumber || this.generateNumber()
    
    console.log('[SpawnSystem] Spawning target at x:', x, 'with number:', number)
    
    this.currentTarget = new NumberTarget(
      this.scene,
      x,
      50,
      number,
      this.currentDifficulty.config
    )
    
    return this.currentTarget
  }
  
  destroyCurrentTarget() {
    if (this.currentTarget) {
      this.currentTarget.destroy()
      this.currentTarget = null
    }
  }
  
  getCurrentTarget() {
    return this.currentTarget
  }
}