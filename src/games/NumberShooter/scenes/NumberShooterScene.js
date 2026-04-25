// src/games/NumberShooter/scenes/NumberShooterScene.js (versão corrigida - sem quebra)
import Phaser from 'phaser'
import { telemetryService } from '../../../services/TelemetryService'

export default class NumberShooterScene extends Phaser.Scene {
  constructor() {
    super('NumberShooterScene')
    this.score = 0
    this.combo = 1
    this.currentTarget = null
    this.timeLeft = 60
    this.gameActive = true
    this.timerEvent = null
    this.currentLevel = 1
    this.targetsDestroyed = 0
    this.buttons = []
    this.operationsUsed = 0
  }

  getNumberPool() {
    const pools = {
      1: [4, 6, 8, 9, 12, 16, 18, 24, 27, 32, 36, 48, 54, 64, 72, 81, 96],
      2: [12, 16, 18, 20, 24, 25, 27, 28, 30, 32, 35, 36, 40, 42, 45, 48, 49, 50, 54, 56, 60, 63, 64, 70, 72, 75, 80, 81, 84, 90, 96, 100],
      3: [24, 28, 30, 32, 35, 36, 40, 42, 45, 48, 49, 50, 54, 56, 60, 63, 64, 70, 72, 75, 80, 81, 84, 90, 96, 100, 105, 108, 112, 120, 125, 126, 128, 135, 140, 144, 150],
      4: [48, 54, 56, 60, 63, 64, 66, 70, 72, 75, 77, 80, 81, 84, 88, 90, 96, 99, 100, 108, 110, 112, 120, 121, 125, 126, 128, 130, 132, 135, 140, 143, 144, 150]
    }
    return pools[this.currentLevel] || pools[1]
  }

  getLevelConfig() {
    const configs = {
      1: {
        operations: [2, 3],
        requiredScore: 0,
        fallSpeed: 0.45,
        color: '#4CC9F0',
        name: 'Iniciante'
      },
      2: {
        operations: [2, 3, 4, 5, 6],
        requiredScore: 200,
        fallSpeed: 0.55,
        color: '#7B2FBE',
        name: 'Avançado'
      },
      3: {
        operations: [2, 3, 4, 5, 6, 7, 8, 9, 10],
        requiredScore: 500,
        fallSpeed: 0.65,
        color: '#FF6B35',
        name: 'Mestre'
      },
      4: {
        operations: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        requiredScore: 1000,
        fallSpeed: 0.75,
        color: '#EF4444',
        name: 'Lendário'
      }
    }
    return configs[this.currentLevel] || configs[1]
  }

  generateNumber() {
    const pool = this.getNumberPool()
    const randomIndex = Math.floor(Math.random() * pool.length)
    return pool[randomIndex]
  }

  canDecompose(number, operation) {
    return number % operation === 0
  }

  getColorForNumber(value) {
    if (value <= 50) return '#06D6A0'
    if (value <= 100) return '#4CC9F0'
    if (value <= 200) return '#7B2FBE'
    return '#FF6B35'
  }

  isPrime(num) {
    if (num < 2) return false
    if (num === 2) return true
    if (num % 2 === 0) return false
    for (let i = 3; i <= Math.sqrt(num); i += 2) {
      if (num % i === 0) return false
    }
    return true
  }

  create() {
    console.log('✅ Scene created')
    const { width, height } = this.cameras.main
    
    this.add.rectangle(0, 0, width, height, 0x0f0c29).setOrigin(0)
    
    const isMobile = width < 780
    const config = this.getLevelConfig()
    
    this.add.text(width / 2, isMobile ? 20 : 30, `${config.name} - Nível ${this.currentLevel}`, {
      fontSize: isMobile ? '12px' : '16px',
      fill: config.color,
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5)
    
    this.add.text(width / 2, isMobile ? 40 : 55, 'NUMBER SHOOTER', {
      fontSize: isMobile ? '18px' : '28px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5)
    
    this.scoreText = this.add.text(15, 10, `${this.score}`, {
      fontSize: isMobile ? '20px' : '28px',
      fill: '#FFD700',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    })
    
    this.timerText = this.add.text(width - 15, 10, `${this.timeLeft}s`, {
      fontSize: isMobile ? '20px' : '28px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    })
    this.timerText.setOrigin(1, 0)
    
    this.comboText = this.add.text(width / 2, 10, `x${this.combo}`, {
      fontSize: isMobile ? '20px' : '28px',
      fill: '#f59e0b',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5)
    
    this.createButtonsGrid(config.operations)
    
    const groundLine = this.add.rectangle(0, height - 65, width, 2, 0xEF233C)
    groundLine.setOrigin(0)
    groundLine.setAlpha(0.5)
    
    this.startTimer()
    setTimeout(() => this.spawnTarget(), 300)
    
    if (!this.playerId) {
      const stored = localStorage.getItem('game-storage')
      if (stored) {
        const data = JSON.parse(stored)
        this.playerId = data.state?.activePlayer?.id
      }
    }
    
    telemetryService.track('GAME_START', {
      playerId: this.playerId || 'unknown',
      level: this.currentLevel
    })
  }

  createButtonsGrid(operations) {
    this.buttons.forEach(btn => {
      if (btn.container) btn.container.destroy()
    })
    this.buttons = []
    
    const width = this.cameras.main.width
    const height = this.cameras.main.height
    const isMobile = width < 780
    
    const buttonWidth = isMobile ? 70 : 80
    const buttonHeight = isMobile ? 45 : 55
    const buttonSpacing = isMobile ? 8 : 10
    
    const maxButtonsPerRow = Math.floor((width - 40) / (buttonWidth + buttonSpacing))
    const numRows = Math.ceil(operations.length / maxButtonsPerRow)
    const baseY = height - 65 - (numRows * (buttonHeight + buttonSpacing)) + 10
    const btnFontSize = isMobile ? '14px' : '18px'
    
    operations.forEach((operation, index) => {
      const row = Math.floor(index / maxButtonsPerRow)
      const col = index % maxButtonsPerRow
      
      const totalButtonsInRow = Math.min(maxButtonsPerRow, operations.length - row * maxButtonsPerRow)
      const startX = (width - (totalButtonsInRow * (buttonWidth + buttonSpacing))) / 2
      
      const x = startX + col * (buttonWidth + buttonSpacing) + buttonWidth / 2
      const y = baseY + row * (buttonHeight + buttonSpacing) + buttonHeight / 2
      
      const container = this.add.container(x, y)
      const isPrimeOp = this.isPrime(operation)
      const bgColor = isPrimeOp ? 0xEF4444 : 0x4CC9F0
      const hoverColor = isPrimeOp ? 0xdc2626 : 0x3a9bd1
      
      const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, bgColor)
      bg.setStrokeStyle(2, 0xffffff)
      bg.setInteractive({ useHandCursor: true })
      
      const text = this.add.text(0, 0, `÷${operation}`, {
        fontSize: btnFontSize,
        fill: '#ffffff',
        fontFamily: 'Arial',
        fontWeight: 'bold'
      }).setOrigin(0.5)
      
      container.add([bg, text])
      container.setDepth(100)
      bg.setAlpha(0.85)
      
      bg.on('pointerdown', () => this.shoot(operation))
      bg.on('pointerover', () => {
        bg.setFillStyle(hoverColor)
        bg.setAlpha(1)
        container.setScale(1.05)
      })
      bg.on('pointerout', () => {
        bg.setFillStyle(bgColor)
        bg.setAlpha(0.85)
        container.setScale(1)
      })
      
      this.buttons.push({ container, operation, bg })
    })
  }

  spawnTarget() {
    if (!this.gameActive) return
    if (this.currentTarget) this.currentTarget.destroy()
    
    const number = this.generateNumber()
    const config = this.getLevelConfig()
    this.operationsUsed = 0
    
    const width = this.cameras.main.width
    const isMobile = width < 780
    const x = width / 2
    const y = isMobile ? 90 : 110
    const circleRadius = isMobile ? 45 : 60
    const fontSize = isMobile ? '36px' : '48px'
    
    this.currentTarget = this.add.container(x, y)
    
    const circle = this.add.circle(0, 0, circleRadius, this.getColorForNumber(number))
    circle.setStrokeStyle(3, 0xffffff)
    
    const text = this.add.text(0, 0, number.toString(), {
      fontSize: fontSize,
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5)
    
    this.currentTarget.add([circle, text])
    this.currentTarget.value = number
    this.currentTarget.text = text
    
    this.physics.add.existing(this.currentTarget)
    this.currentTarget.body.setVelocityY(config.fallSpeed * 60)
    this.currentTarget.body.setSize(circleRadius * 1.8, circleRadius * 1.8)
    
    this.currentTarget.setScale(0)
    this.tweens.add({
      targets: this.currentTarget,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut'
    })
  }

  shoot(operation) {
    if (!this.gameActive || !this.currentTarget) return
    
    const canDivide = this.canDecompose(this.currentTarget.value, operation)
    
    if (canDivide) {
      this.operationsUsed++
      const newValue = this.currentTarget.value / operation
      
      this.createEffect(this.currentTarget.x, this.currentTarget.y, `✓ ${operation}`, '#00ff00')
      
      if (newValue === 1) {
        let pointsEarned = 0
        if (this.operationsUsed === 1) pointsEarned = 100
        else if (this.operationsUsed === 2) pointsEarned = 50
        else if (this.operationsUsed === 3) pointsEarned = 25
        else pointsEarned = 10
        
        pointsEarned = pointsEarned * this.combo
        this.score += pointsEarned
        this.scoreText.setText(`${this.score}`)
        this.targetsDestroyed++
        
        this.createEffect(this.currentTarget.x, this.currentTarget.y, `🎉 +${pointsEarned}`, '#FFD700')
        this.combo++
        this.updateComboDisplay()
        this.checkLevelUp()
        
        this.tweens.add({
          targets: this.currentTarget,
          scaleX: 0,
          scaleY: 0,
          duration: 150,
          onComplete: () => {
            this.currentTarget.destroy()
            this.currentTarget = null
            setTimeout(() => {
              if (this.gameActive) this.spawnTarget()
            }, 400)
          }
        })
      } else {
        this.currentTarget.value = newValue
        this.currentTarget.text.setText(newValue.toString())
        
        const newColor = this.getColorForNumber(newValue)
        this.currentTarget.list[0].setFillStyle(newColor)
        
        this.tweens.add({
          targets: this.currentTarget,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 100,
          yoyo: true
        })
        
        this.combo++
        this.updateComboDisplay()
      }
      
      telemetryService.track('SHOT_FIRED', {
        targetNumber: this.currentTarget?.value || newValue,
        divisorChosen: operation,
        correct: true,
        level: this.currentLevel,
        combo: this.combo,
        score: this.score
      })
    } else {
      this.createEffect(this.currentTarget.x, this.currentTarget.y, `✗ ${operation}`, '#ff0000')
      this.combo = 1
      this.updateComboDisplay()
      this.cameras.main.shake(200, 0.01)
    }
  }

  updateComboDisplay() {
    this.comboText.setText(`x${this.combo}`)
    this.tweens.add({
      targets: this.comboText,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 100,
      yoyo: true
    })
  }

  createEffect(x, y, text, color = '#FFD93D') {
    const effect = this.add.text(x, y, text, {
      fontSize: '24px',
      fill: color,
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5)
    
    this.tweens.add({
      targets: effect,
      y: y - 50,
      alpha: 0,
      duration: 600,
      onComplete: () => effect.destroy()
    })
  }

  checkLevelUp() {
    let newLevel = this.currentLevel
    
    if (this.score >= 1000) newLevel = 4
    else if (this.score >= 500) newLevel = 3
    else if (this.score >= 200) newLevel = 2
    else newLevel = 1
    
    if (newLevel > this.currentLevel && newLevel <= 4) {
      this.currentLevel = newLevel
      const config = this.getLevelConfig()
      
      const titleText = this.children.list.find(c => c.text && typeof c.text === 'string' && c.text.includes('Nível'))
      if (titleText) {
        titleText.setText(`${config.name} - Nível ${this.currentLevel}`)
        titleText.setColor(config.color)
      }
      
      this.createButtonsGrid(config.operations)
      this.createEffect(this.cameras.main.width / 2, this.cameras.main.height / 2, `✨ NÍVEL ${newLevel} ✨`, '#FFD700')
      
      if (this.currentTarget) {
        this.currentTarget.body.setVelocityY(config.fallSpeed * 60)
      }
      
      telemetryService.track('LEVEL_UP', {
        playerId: this.playerId,
        newLevel: newLevel,
        score: this.score
      })
    }
  }

  startTimer() {
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (this.gameActive && this.timeLeft > 0) {
          this.timeLeft--
          this.timerText.setText(`${this.timeLeft}s`)
          if (this.timeLeft <= 10) this.timerText.setColor('#EF4444')
          if (this.timeLeft === 0) this.endGame()
        }
      },
      callbackScope: this,
      repeat: 59
    })
  }

  endGame() {
    this.gameActive = false
    if (this.timerEvent) this.timerEvent.remove()
    if (this.currentTarget) this.currentTarget.body.setVelocityY(0)
    this.buttons.forEach(btn => { if (btn.bg) btn.bg.input.enabled = false })
    
    const { width, height } = this.cameras.main
    const isMobile = width < 780
    const gameScore = this.score
    
    // Salvar no localStorage
    if (this.playerId) {
      try {
        const stored = localStorage.getItem('game-storage')
        if (stored) {
          const data = JSON.parse(stored)
          const players = data.state?.players || []
          const currentPlayer = players.find(p => p.id === this.playerId)
          
          if (currentPlayer) {
            currentPlayer.totalScore = (currentPlayer.totalScore || 0) + gameScore
            currentPlayer.gamesPlayed = (currentPlayer.gamesPlayed || 0) + 1
            currentPlayer.bestScore = Math.max(currentPlayer.bestScore || 0, gameScore)
            
            if (currentPlayer.totalScore >= 5000) currentPlayer.title = { name: 'Mestre dos Números', emoji: '🏆' }
            else if (currentPlayer.totalScore >= 3000) currentPlayer.title = { name: 'Matemático Lendário', emoji: '🌟' }
            else if (currentPlayer.totalScore >= 2000) currentPlayer.title = { name: 'Calculador Avançado', emoji: '📚' }
            else if (currentPlayer.totalScore >= 1000) currentPlayer.title = { name: 'Aprendiz Dedicado', emoji: '🎯' }
            else if (currentPlayer.totalScore >= 500) currentPlayer.title = { name: 'Iniciante Promissor', emoji: '⭐' }
            else currentPlayer.title = { name: 'Novato', emoji: '🌱' }
            
            if (data.state.activePlayer?.id === this.playerId) data.state.activePlayer = currentPlayer
            localStorage.setItem('game-storage', JSON.stringify(data))
            console.log('✅ Dados salvos!')
          }
        }
      } catch (error) {
        console.error('Erro ao salvar:', error)
      }
    }
    
    // Tela de fim de jogo
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.9)
    overlay.setOrigin(0)
    overlay.setDepth(200)
    
    const titleY = height / 2 - 80
    this.add.text(width / 2, titleY, 'FIM DE JOGO', {
      fontSize: isMobile ? '32px' : '48px',
      fill: '#FFD700',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5).setDepth(201)
    
    this.add.text(width / 2, titleY + 50, `${gameScore} pontos`, {
      fontSize: isMobile ? '28px' : '36px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5).setDepth(201)
    
    this.add.text(width / 2, titleY + 100, `Nível ${this.currentLevel} | ${this.targetsDestroyed} alvos`, {
      fontSize: isMobile ? '16px' : '20px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(201)
    
    // Botões
    const btnWidth = isMobile ? 140 : 180
    const btnHeight = isMobile ? 45 : 55
    const btnSpacing = 20
    const startX = (width - (btnWidth * 2 + btnSpacing)) / 2
    
    // Botão Jogar Novamente - Recarrega a página para reiniciar tudo
    const replayBtn = this.add.rectangle(startX + btnWidth / 2, titleY + 170, btnWidth, btnHeight, 0x4CC9F0)
    replayBtn.setInteractive({ useHandCursor: true })
    replayBtn.setDepth(201)
    this.add.text(startX + btnWidth / 2, titleY + 170, '🔄 JOGAR NOVAMENTE', {
      fontSize: isMobile ? '14px' : '18px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5).setDepth(201)
    
    replayBtn.on('pointerdown', () => {
      // Recarregar a página para reiniciar o jogo completamente
      window.location.reload()
    })
    
    // Botão Sair
    const exitBtn = this.add.rectangle(startX + btnWidth + btnSpacing + btnWidth / 2, titleY + 170, btnWidth, btnHeight, 0xEF4444)
    exitBtn.setInteractive({ useHandCursor: true })
    exitBtn.setDepth(201)
    this.add.text(startX + btnWidth + btnSpacing + btnWidth / 2, titleY + 170, '🏠 SAIR', {
      fontSize: isMobile ? '14px' : '18px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5).setDepth(201)
    
    exitBtn.on('pointerdown', () => {
      if (this.onGameComplete) {
        this.onGameComplete({ score: gameScore, level: this.currentLevel, targetsDestroyed: this.targetsDestroyed })
      }
      // Ir para o hub
      window.location.href = '/hub'
    })
    
    overlay.setAlpha(0)
    this.tweens.add({
      targets: overlay,
      alpha: 0.9,
      duration: 300
    })
  }

  update() {
    if (!this.gameActive) return
    const groundY = this.cameras.main.height - 70
    if (this.currentTarget && this.currentTarget.y + 55 >= groundY) {
      this.createEffect(this.currentTarget.x, this.currentTarget.y, '💨', '#ff0000')
      this.currentTarget.destroy()
      this.currentTarget = null
      setTimeout(() => { if (this.gameActive) this.spawnTarget() }, 400)
    }
  }
}