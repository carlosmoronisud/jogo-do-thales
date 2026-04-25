// src/games/NumberShooter/scenes/NumberShooterScene.js (com progressão mais lenta e botões reduzidos)
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
  }

  // Configuração com progressão mais lenta
  getLevelConfig() {
    const configs = {
      1: {
        operations: [2, 3, 4, 5, 6], // Apenas 5 botões no início
        numberPool: [24, 30, 36, 40, 42, 48, 54, 60, 66, 72, 78, 84, 90, 96, 100, 108, 120],
        fallSpeed: 0.45,
        color: '#4CC9F0',
        name: 'Iniciante'
      },
      2: {
        operations: [2, 3, 4, 5, 6, 7, 8], // 7 botões
        numberPool: [60, 72, 84, 96, 108, 120, 132, 144, 156, 168, 180, 192, 200, 210, 220, 240],
        fallSpeed: 0.55,
        color: '#7B2FBE',
        name: 'Avançado'
      },
      3: {
        operations: [2, 3, 4, 5, 6, 7, 8, 9, 10], // 9 botões
        numberPool: [120, 144, 168, 180, 210, 240, 252, 280, 300, 336, 360, 420, 440, 480, 500],
        fallSpeed: 0.65,
        color: '#FF6B35',
        name: 'Mestre'
      },
      4: {
        operations: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // 11 botões
        numberPool: [240, 300, 360, 420, 480, 504, 540, 600, 660, 720, 840, 900, 960, 1000, 1080],
        fallSpeed: 0.75,
        color: '#EF4444',
        name: 'Lendário'
      }
    }
    return configs[this.currentLevel] || configs[1]
  }

  generateNumber() {
    const config = this.getLevelConfig()
    const pool = config.numberPool
    const randomIndex = Math.floor(Math.random() * pool.length)
    return pool[randomIndex]
  }

  canDecompose(number, operation) {
    return number % operation === 0
  }

  getColorForNumber(value) {
    if (value <= 100) return '#06D6A0'
    if (value <= 200) return '#4CC9F0'
    if (value <= 400) return '#7B2FBE'
    return '#FF6B35'
  }

  create() {
  console.log('✅ Scene created')
  console.log('🎮 Player ID recebido na cena:', this.playerId)
    console.log('✅ Scene created')
    const { width, height } = this.cameras.main
    
    // Fundo
    this.add.rectangle(0, 0, width, height, 0x0f0c29).setOrigin(0)
    
    const isMobile = width < 780
    const config = this.getLevelConfig()
    
    // Título
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
    
    // Score
    this.scoreText = this.add.text(15, 10, `${this.score}`, {
      fontSize: isMobile ? '20px' : '28px',
      fill: '#FFD700',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    })
    
    // Timer
    this.timerText = this.add.text(width - 15, 10, `${this.timeLeft}s`, {
      fontSize: isMobile ? '20px' : '28px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    })
    this.timerText.setOrigin(1, 0)
    
    // Combo
    this.comboText = this.add.text(width / 2, 10, `x${this.combo}`, {
      fontSize: isMobile ? '20px' : '28px',
      fill: '#f59e0b',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5)
    
    // Criar botões
    this.createButtons(config.operations)
    
    // Linha do chão
    const groundLine = this.add.rectangle(0, height - 65, width, 2, 0xEF233C)
    groundLine.setOrigin(0)
    groundLine.setAlpha(0.5)
    
    // Iniciar timer
    this.startTimer()
    setTimeout(() => this.spawnTarget(), 300)
    
    telemetryService.track('GAME_START', {
      playerId: this.playerId || 'unknown',
      level: this.currentLevel
    })
  }

  createButtons(operations) {
    this.buttons.forEach(btn => {
      if (btn.container) btn.container.destroy()
    })
    this.buttons = []
    
    const width = this.cameras.main.width
    const height = this.cameras.main.height
    const isMobile = width < 780
    
    const buttonY = height - (isMobile ? 55 : 65)
    const buttonWidth = isMobile ? 55 : 65
    const buttonHeight = isMobile ? 42 : 50
    const buttonSpacing = isMobile ? 5 : 8
    
    const totalButtons = Math.min(operations.length, 8) // Máximo 8 botões por linha
    const displayOps = operations.slice(0, 8)
    const totalWidth = totalButtons * buttonWidth + (totalButtons - 1) * buttonSpacing
    const startX = (width - totalWidth) / 2
    
    const btnFontSize = isMobile ? (displayOps[0] > 9 ? '11px' : '13px') : (displayOps[0] > 9 ? '13px' : '16px')
    
    displayOps.forEach((operation, index) => {
      const x = startX + index * (buttonWidth + buttonSpacing) + buttonWidth / 2
      
      const container = this.add.container(x, buttonY)
      const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x4CC9F0)
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
      
      bg.on('pointerdown', () => this.shoot(operation))
      bg.on('pointerover', () => bg.setFillStyle(0x3a9bd1))
      bg.on('pointerout', () => bg.setFillStyle(0x4CC9F0))
      
      this.buttons.push({ container, operation, bg })
    })
  }

  spawnTarget() {
    if (!this.gameActive) return
    
    if (this.currentTarget) {
      this.currentTarget.destroy()
    }
    
    const number = this.generateNumber()
    const config = this.getLevelConfig()
    
    console.log(`🎯 Número: ${number} | Nível ${this.currentLevel}`)
    
    const width = this.cameras.main.width
    const isMobile = width < 780
    const x = width / 2
    const y = isMobile ? 85 : 110
    const circleRadius = isMobile ? 45 : 60
    
    let fontSize
    if (number < 100) fontSize = isMobile ? '36px' : '48px'
    else if (number < 1000) fontSize = isMobile ? '28px' : '38px'
    else fontSize = isMobile ? '22px' : '30px'
    
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
      const newValue = this.currentTarget.value / operation
      
      const pointsGained = 10 * this.combo
      this.score += pointsGained
      this.scoreText.setText(`${this.score}`)
      
      this.createEffect(this.currentTarget.x, this.currentTarget.y, `✓ ${operation}`)
      
      this.tweens.add({
        targets: this.scoreText,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 100,
        yoyo: true
      })
      
      if (newValue === 1) {
        const bonusPoints = 50 * this.combo
        this.score += bonusPoints
        this.scoreText.setText(`${this.score}`)
        this.targetsDestroyed++
        
        this.createEffect(this.currentTarget.x, this.currentTarget.y, '🎉 DESTRUÍDO!')
        this.combo++
        this.updateComboDisplay()
        this.checkLevelUp()
        
        this.currentTarget.destroy()
        this.currentTarget = null
        
        setTimeout(() => {
          if (this.gameActive) {
            this.spawnTarget()
          }
        }, 400)
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
        combo: this.combo
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
      
      this.createButtons(config.operations)
      this.createEffect(this.cameras.main.width / 2, this.cameras.main.height / 2, `✨ NÍVEL ${newLevel} ✨`)
      
      if (this.currentTarget) {
        this.currentTarget.body.setVelocityY(config.fallSpeed * 60)
      }
      
      console.log(`⬆️ Subiu para o nível ${newLevel}!`)
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
          
          if (this.timeLeft <= 10) {
            this.timerText.setColor('#EF4444')
          }
          
          if (this.timeLeft === 0) {
            this.endGame()
          }
        }
      },
      callbackScope: this,
      repeat: 59
    })
  }

    endGame() {
    this.gameActive = false
    
    if (this.timerEvent) {
      this.timerEvent.remove()
    }
    
    if (this.currentTarget) {
      this.currentTarget.body.setVelocityY(0)
    }
    
    this.buttons.forEach(btn => {
      if (btn.bg) btn.bg.input.enabled = false
    })
    
    const { width, height } = this.cameras.main
    const isMobile = width < 780
    
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.9)
    overlay.setOrigin(0)
    overlay.setDepth(200)
    
    // ========== SALVAR DIRETAMENTE NO LOCALSTORAGE ==========
    try {
      console.log('💾 Salvando pontuação no localStorage:', this.score)
      console.log('🎮 Player ID:', this.playerId)
      
      const stored = localStorage.getItem('game-storage')
      if (stored) {
        const data = JSON.parse(stored)
        const players = data.state?.players || []
        const currentPlayer = players.find(p => p.id === this.playerId)
        
        if (currentPlayer) {
          const oldTotal = currentPlayer.totalScore || 0
          const oldGames = currentPlayer.gamesPlayed || 0
          const oldBest = currentPlayer.bestScore || 0
          
          currentPlayer.totalScore = oldTotal + this.score
          currentPlayer.gamesPlayed = oldGames + 1
          currentPlayer.bestScore = Math.max(oldBest, this.score)
          
          // Atualizar título baseado na pontuação total
          const totalScore = currentPlayer.totalScore
          if (totalScore >= 5000) currentPlayer.title = { name: 'Mestre dos Números', emoji: '🏆' }
          else if (totalScore >= 3000) currentPlayer.title = { name: 'Matemático Lendário', emoji: '🌟' }
          else if (totalScore >= 2000) currentPlayer.title = { name: 'Calculador Avançado', emoji: '📚' }
          else if (totalScore >= 1000) currentPlayer.title = { name: 'Aprendiz Dedicado', emoji: '🎯' }
          else if (totalScore >= 500) currentPlayer.title = { name: 'Iniciante Promissor', emoji: '⭐' }
          else currentPlayer.title = { name: 'Novato', emoji: '🌱' }
          
          // Atualizar activePlayer se for o mesmo
          if (data.state.activePlayer?.id === this.playerId) {
            data.state.activePlayer = currentPlayer
          }
          
          // Salvar no localStorage
          localStorage.setItem('game-storage', JSON.stringify(data))
          
          console.log('✅ Dados salvos com sucesso!')
          console.log('  - Pontuação da partida:', this.score)
          console.log('  - Total acumulado:', currentPlayer.totalScore)
          console.log('  - Partidas jogadas:', currentPlayer.gamesPlayed)
          console.log('  - Melhor pontuação:', currentPlayer.bestScore)
          console.log('  - Título:', currentPlayer.title.name)
        } else {
          console.log('❌ Jogador não encontrado no localStorage')
        }
      } else {
        console.log('❌ Nenhum dado encontrado no localStorage')
      }
    } catch (error) {
      console.error('❌ Erro ao salvar no localStorage:', error)
    }
    // ========== FIM DO SALVAMENTO ==========
    
    this.add.text(width / 2, height / 2 - 60, 'FIM DE JOGO', {
      fontSize: isMobile ? '28px' : '36px',
      fill: '#FFD700',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5).setDepth(201)
    
    this.add.text(width / 2, height / 2 - 10, `${this.score} pontos`, {
      fontSize: isMobile ? '24px' : '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5).setDepth(201)
    
    this.add.text(width / 2, height / 2 + 40, `Nível ${this.currentLevel} | ${this.targetsDestroyed} alvos`, {
      fontSize: isMobile ? '14px' : '16px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(201)
    
    const closeBtn = this.add.rectangle(width / 2, height / 2 + 100, 160, 45, 0x4CC9F0)
    closeBtn.setInteractive({ useHandCursor: true })
    closeBtn.setDepth(201)
    
    this.add.text(width / 2, height / 2 + 100, 'FECHAR', {
      fontSize: isMobile ? '16px' : '18px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5).setDepth(201)
    
    const gameResults = {
      score: this.score,
      level: this.currentLevel,
      targetsDestroyed: this.targetsDestroyed
    }
    
    closeBtn.on('pointerdown', () => {
      console.log('📊 Salvando resultado:', gameResults)
      if (this.onGameComplete) {
        this.onGameComplete(gameResults)
      }
      setTimeout(() => this.scene.stop(), 100)
    })
  }
}