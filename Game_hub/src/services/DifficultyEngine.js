// src/services/DifficultyEngine.js
export class DifficultyEngine {
  adjust(metrics) {
    const difficultyScore = this.calculateDifficultyScore(metrics)
    
    if (difficultyScore < 33) {
      return { level: 'easy', config: this.getEasyConfig() }
    } else if (difficultyScore < 66) {
      return { level: 'medium', config: this.getMediumConfig() }
    } else {
      return { level: 'hard', config: this.getHardConfig() }
    }
  }

  calculateDifficultyScore(metrics) {
    // Weighted calculation based on multiple metrics
    const weights = {
      accuracy: 0.4,
      efficiency: 0.2,
      speed: 0.2,
      persistence: 0.1,
      engagement: 0.1
    }
    
    let score = 0
    score += (metrics.accuracy / 100) * weights.accuracy
    score += (metrics.efficiency / 100) * weights.efficiency
    score += (100 - Math.min(metrics.speed / 10, 100)) / 100 * weights.speed // Lower speed = higher difficulty
    score += (metrics.persistence / 100) * weights.persistence
    score += (metrics.engagement / 100) * weights.engagement
    
    return score * 100
  }

  getEasyConfig() {
    return {
      spawnRate: 2000,
      maxEnemies: 3,
      timeLimit: 60,
      targetValue: 10,
      numbersRange: [1, 5],
      feedbackDelay: 500
    }
  }

  getMediumConfig() {
    return {
      spawnRate: 1500,
      maxEnemies: 5,
      timeLimit: 45,
      targetValue: 15,
      numbersRange: [1, 10],
      feedbackDelay: 300
    }
  }

  getHardConfig() {
    return {
      spawnRate: 1000,
      maxEnemies: 8,
      timeLimit: 30,
      targetValue: 20,
      numbersRange: [1, 20],
      feedbackDelay: 200
    }
  }
}

export const difficultyEngine = new DifficultyEngine()