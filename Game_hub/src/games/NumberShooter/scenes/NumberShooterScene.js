// src/games/NumberShooter/scenes/NumberShooterScene.js (versão completa com progressão)
import Phaser from 'phaser'
import { telemetryService } from '../../../services/TelemetryService'

export default class NumberShooterScene extends Phaser.Scene {
  constructor() {
    super('NumberShooterScene')
    this.score = 0
    this.combo = 1
    this.currentNumber = null
    this.currentTarget = null
    this.timeLeft = 60 // 1 minuto
    this.gameActive = true
    this.timerEvent = null
    this.difficultyLevel = 1
    this.targetsDestroyed = 0
    this.buttons = []
    this.numberRange = { min: 10, max: 50 }
    this.fallSpeed = 40
  }

  create() {
    console.log('✅ Scene created')
    const { width, height } = this.cameras.main
    
    this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0)
    
    const isMobile = width < 780
    
    // Título
    this.add.text(width / 2, isMobile ? 30 : 40, 'NUMBER SHOOTER', {
      fontSize: isMobile ? '24px' : '40px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5)
    
    // Timer
    this.timerText = this.add.text(width / 2, isMobile ? 70 : 90, `Time: ${this.timeLeft}s`, {
      fontSize: isMobile ? '18px' : '24px',
      fill: '#fbbf24',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5)
    
    // Score
    const scoreFontSize = isMobile ? '20px' : '32px'
    const margin = isMobile ? 10 : 15
    
    this.scoreText = this.add.text(margin, margin, `${this.score}`, {
      fontSize: scoreFontSize,
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    })
    
    this.add.text(margin, margin + (isMobile ? 22 : 30), 'SCORE', {
      fontSize: isMobile ? '10px' : '12px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    })
    
    // Nível e Range
    this.levelText = this.add.text(width / 2, (isMobile ? 95 : 115), `LV ${this.difficultyLevel}`, {
      fontSize: isMobile ? '14px' : '18px',
      fill: '#10b981',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5)
    
    this.rangeText = this.add.text(width / 2, (isMobile ? 115 : 135), `${this.numberRange.min}-${this.numberRange.max}`, {
      fontSize: isMobile ? '10px' : '12px',
      fill: '#888888',
      fontFamily: 'Arial'
    }).setOrigin(0.5)
    
    // Combo
    this.comboText = this.add.text(width - margin, margin, `x${this.combo}`, {
      fontSize: scoreFontSize,
      fill: '#f59e0b',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    })
    this.comboText.setOrigin(1, 0)
    
    this.add.text(width - margin, margin + (isMobile ? 22 : 30), 'COMBO', {
      fontSize: isMobile ? '10px' : '12px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(1, 0)
    
    // Container para botões
    this.buttonContainer = this.add.container(0, 0)
    
    // Criar botões iniciais
    this.createButtons([2, 3])
    
    // Iniciar timer
    this.startTimer()
    
    // Criar primeiro alvo
    this.spawnTarget()
    
    if (telemetryService) {
      telemetryService.track('GAME_START', {
        playerId: this.playerId || 'unknown',
        timeLimit: 60,
        isMobile: isMobile
      })
    }
  }

  // Verificar se número é primo
  isPrime(num) {
    if (num <= 1) return false
    if (num <= 3) return true
    if (num % 2 === 0 || num % 3 === 0) return false
    for (let i = 5; i * i <= num; i += 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false
    }
    return true
  }

  // Obter todos os divisores úteis (incluindo números compostos)
  getAllDivisors(num) {
    const divisors = new Set()
    
    // Adicionar divisores até a raiz quadrada
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) {
        divisors.add(i)
        if (i !== num / i) {
          divisors.add(num / i)
        }
      }
    }
    
    // Sempre incluir o próprio número se for útil
    if (num > 1 && num <= 20) {
      divisors.add(num)
    }
    
    // Converter para array e ordenar
    let divisorsArray = Array.from(divisors).sort((a, b) => a - b)
    
    // Limitar a 6 botões no máximo
    if (divisorsArray.length > 6) {
      // Priorizar divisores pequenos e o próprio número
      const smallDivisors = divisorsArray.filter(d => d <= 10)
      const largeDivisors = divisorsArray.filter(d => d > 10)
      divisorsArray = [...smallDivisors.slice(0, 5), ...largeDivisors.slice(0, 1)]
    }
    
    return divisorsArray
  }

  // Atualizar range de números baseado na pontuação
  updateNumberRange() {
    if (this.score < 500) {
      this.numberRange = { min: 10, max: 50 }
    } else if (this.score < 1500) {
      this.numberRange = { min: 20, max: 80 }
    } else if (this.score < 3000) {
      this.numberRange = { min: 30, max: 100 }
    } else if (this.score < 5000) {
      this.numberRange = { min: 40, max: 130 }
    } else if (this.score < 8000) {
      this.numberRange = { min: 50, max: 160 }
    } else if (this.score < 12000) {
      this.numberRange = { min: 60, max: 200 }
    } else {
      this.numberRange = { min: 70, max: 250 }
    }
    
    this.rangeText.setText(`${this.numberRange.min}-${this.numberRange.max}`)
    this.rangeText.setColor('#fbbf24')
    
    this.tweens.add({
      targets: this.rangeText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      yoyo: true
    })
  }

  // Gerar número baseado no range atual
  generateNumber() {
    const { min, max } = this.numberRange
    // Evitar números primos (a menos que seja proposital)
    let number
    let attempts = 0
    do {
      number = Math.floor(Math.random() * (max - min + 1)) + min
      attempts++
      if (attempts > 20) break
    } while (this.isPrime(number) && number > 30)
    
    return number
  }

  // Criar botões dinâmicos
  createButtons(divisors) {
    // Limpar botões existentes
    this.buttons.forEach(btn => {
      if (btn.container) btn.container.destroy()
    })
    this.buttons = []
    
    const width = this.cameras.main.width
    const height = this.cameras.main.height
    const isMobile = width < 780
    
    const buttonY = height - (isMobile ? 60 : 80)
    const buttonWidth = isMobile ? 65 : 90
    const buttonHeight = isMobile ? 50 : 65
    const buttonSpacing = isMobile ? 6 : 15
    
    const totalWidth = divisors.length * buttonWidth + (divisors.length - 1) * buttonSpacing
    const startX = (width - totalWidth) / 2
    
    divisors.forEach((divisor, index) => {
      const x = startX + index * (buttonWidth + buttonSpacing) + buttonWidth / 2
      
      const container = this.add.container(x, buttonY)
      
      const isPrimeDivisor = this.isPrime(divisor)
      const bgColor = isPrimeDivisor ? 0xef4444 : 0x8b5cf6
      
      const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, bgColor)
      bg.setStrokeStyle(2, 0xffffff)
      bg.setInteractive({ useHandCursor: true })
      
      const fontSize = isMobile ? (divisor > 9 ? '16px' : '20px') : (divisor > 9 ? '20px' : '28px')
      const text = this.add.text(0, 0, `÷${divisor}`, {
        fontSize: fontSize,
        fill: '#ffffff',
        fontFamily: 'Arial',
        fontWeight: 'bold'
      }).setOrigin(0.5)
      
      container.add([bg, text])
      container.setDepth(100)
      
      bg.on('pointerdown', () => this.shoot(divisor))
      bg.on('pointerover', () => bg.setFillStyle(isPrimeDivisor ? 0xdc2626 : 0x6d28d9))
      bg.on('pointerout', () => bg.setFillStyle(bgColor))
      
      this.buttons.push({ container, divisor, bg, isPrime: isPrimeDivisor })
    })
  }

  // Atualizar botões baseado no número atual
  updateButtonsForCurrentNumber() {
    if (!this.currentTarget) return
    
    const currentNum = this.currentNumber
    const divisors = this.getAllDivisors(currentNum)
    
    let buttonsToShow = divisors.length > 0 ? divisors : [2, 3, 5]
    
    // Limitar a 6 botões
    if (buttonsToShow.length > 6) {
      buttonsToShow = buttonsToShow.slice(0, 6)
    }
    
    console.log(`🔄 Buttons for ${currentNum}:`, buttonsToShow)
    
    this.createButtons(buttonsToShow)
  }

  // Atualizar dificuldade (velocidade e range)
  updateDifficulty() {
    const newLevel = Math.floor(this.score / 300) + 1
    
    if (newLevel > this.difficultyLevel) {
      this.difficultyLevel = newLevel
      this.levelText.setText(`LV ${this.difficultyLevel}`)
      
      // Aumentar velocidade de queda
      this.fallSpeed = Math.min(120, 40 + this.difficultyLevel * 5)
      
      // Atualizar range de números
      this.updateNumberRange()
      
      // Efeito visual
      this.tweens.add({
        targets: this.levelText,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 200,
        yoyo: true
      })
      
      console.log(`⬆️ Level ${this.difficultyLevel} | Speed: ${this.fallSpeed} | Range: ${this.numberRange.min}-${this.numberRange.max}`)
      
      // Aplicar nova velocidade ao alvo atual
      if (this.currentTarget) {
        this.currentTarget.body.setVelocityY(this.fallSpeed)
      }
      
      if (telemetryService) {
        telemetryService.track('DIFFICULTY_INCREASE', {
          playerId: this.playerId,
          level: this.difficultyLevel,
          score: this.score,
          speed: this.fallSpeed,
          numberRange: this.numberRange
        })
      }
    }
  }

  spawnTarget() {
    if (!this.gameActive) return
    
    if (this.currentTarget) {
      this.currentTarget.destroy()
    }
    
    const number = this.generateNumber()
    this.currentNumber = number
    const isPrimeNumber = this.isPrime(number)
    
    console.log(`🎯 New target: ${number} ${isPrimeNumber ? '(PRIME!)' : ''} | Range: ${this.numberRange.min}-${this.numberRange.max}`)
    
    // Atualizar botões para o novo número
    this.updateButtonsForCurrentNumber()
    
    const width = this.cameras.main.width
    const isMobile = width < 780
    const x = width / 2
    const y = isMobile ? 110 : 140
    const circleRadius = isMobile ? 35 : 50
    const fontSize = isMobile ? (number > 99 ? '24px' : '28px') : (number > 99 ? '32px' : '40px')
    
    this.currentTarget = this.add.container(x, y)
    
    const circleColor = isPrimeNumber ? 0xef4444 : 0x8b5cf6
    const circle = this.add.circle(0, 0, circleRadius, circleColor)
    circle.setStrokeStyle(3, 0xffffff)
    
    const text = this.add.text(0, 0, number.toString(), {
      fontSize: fontSize,
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5)
    
    this.currentTarget.add([circle, text])
    this.currentTarget.setSize(circleRadius * 2, circleRadius * 2)
    this.currentTarget.text = text
    this.currentTarget.isPrime = isPrimeNumber
    
    // Velocidade aumenta gradualmente durante o jogo
    const speedBonus = Math.min(80, this.difficultyLevel * 4)
    const finalSpeed = this.fallSpeed + speedBonus
    
    this.physics.add.existing(this.currentTarget)
    this.currentTarget.body.setVelocityY(finalSpeed)
    this.currentTarget.body.setSize(circleRadius * 1.8, circleRadius * 1.8)
    
    // Animação de entrada
    this.currentTarget.setScale(0)
    this.tweens.add({
      targets: this.currentTarget,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut'
    })
  }

  startTimer() {
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (this.gameActive && this.timeLeft > 0) {
          this.timeLeft--
          this.timerText.setText(`Time: ${this.timeLeft}s`)
          
          if (this.timeLeft <= 10) {
            this.timerText.setColor('#ef4444')
            this.tweens.add({
              targets: this.timerText,
              scaleX: 1.1,
              scaleY: 1.1,
              duration: 300,
              yoyo: true
            })
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

  shoot(divisor) {
    if (!this.gameActive || !this.currentTarget) return
    
    const isDivisible = this.currentNumber % divisor === 0
    
    console.log(`🔫 ${divisor} → ${this.currentNumber} ${isDivisible ? '✓' : '✗'}`)
    
    if (telemetryService) {
      telemetryService.track('SHOT_FIRED', {
        targetNumber: this.currentNumber,
        divisorChosen: divisor,
        correct: isDivisible,
        level: this.difficultyLevel,
        timeRemaining: this.timeLeft
      })
    }
    
    if (isDivisible) {
      const newNumber = this.currentNumber / divisor
      this.currentNumber = newNumber
      this.currentTarget.text.setText(newNumber.toString())
      this.currentTarget.isPrime = this.isPrime(newNumber)
      
      if (this.currentTarget.isPrime) {
        this.currentTarget.list[0].setFillStyle(0xef4444)
      } else {
        this.currentTarget.list[0].setFillStyle(0x8b5cf6)
      }
      
      // Atualizar botões para o novo número
      this.updateButtonsForCurrentNumber()
      
      // Efeito de acerto
      this.tweens.add({
        targets: this.currentTarget,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 100,
        yoyo: true
      })
      
      const isMobile = this.cameras.main.width < 780
      const hitText = this.add.text(this.currentTarget.x, this.currentTarget.y - 40, `✓ ${divisor}`, {
        fontSize: isMobile ? '20px' : '24px',
        fill: '#00ff00',
        fontFamily: 'Arial',
        fontWeight: 'bold'
      }).setOrigin(0.5)
      
      this.tweens.add({
        targets: hitText,
        y: hitText.y - 50,
        alpha: 0,
        duration: 600,
        onComplete: () => hitText.destroy()
      })
      
      if (newNumber === 1) {
        // Destruiu o alvo!
        this.targetsDestroyed++
        const points = 100 * this.combo
        this.score += points
        this.scoreText.setText(`${this.score}`)
        
        this.tweens.add({
          targets: this.scoreText,
          scaleX: 1.3,
          scaleY: 1.3,
          duration: 100,
          yoyo: true
        })
        
        this.combo++
        this.comboText.setText(`x${this.combo}`)
        this.tweens.add({
          targets: this.comboText,
          scaleX: 1.3,
          scaleY: 1.3,
          duration: 100,
          yoyo: true
        })
        
        // Atualizar dificuldade baseada na pontuação
        this.updateDifficulty()
        
        const destroyedText = this.add.text(this.currentTarget.x, this.currentTarget.y, 'DESTROYED!', {
          fontSize: isMobile ? '14px' : '18px',
          fill: '#ffaa00',
          fontFamily: 'Arial',
          fontWeight: 'bold'
        }).setOrigin(0.5)
        
        this.tweens.add({
          targets: destroyedText,
          y: destroyedText.y - 60,
          alpha: 0,
          duration: 800,
          onComplete: () => destroyedText.destroy()
        })
        
        if (telemetryService) {
          telemetryService.track('TARGET_DESTROYED', {
            targetNumber: this.currentNumber * divisor,
            score: this.score,
            combo: this.combo,
            level: this.difficultyLevel,
            targetsDestroyed: this.targetsDestroyed
          })
        }
        
        this.spawnTarget()
      } else {
        const points = 10 * this.combo
        this.score += points
        this.scoreText.setText(`${this.score}`)
        
        this.tweens.add({
          targets: this.scoreText,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 100,
          yoyo: true
        })
      }
    } else {
      const isMobile = this.cameras.main.width < 780
      const missText = this.add.text(this.currentTarget.x, this.currentTarget.y - 40, `✗ ${divisor}`, {
        fontSize: isMobile ? '20px' : '24px',
        fill: '#ff0000',
        fontFamily: 'Arial',
        fontWeight: 'bold'
      }).setOrigin(0.5)
      
      this.tweens.add({
        targets: missText,
        y: missText.y - 50,
        alpha: 0,
        duration: 600,
        onComplete: () => missText.destroy()
      })
      
      this.combo = 1
      this.comboText.setText(`x1`)
      this.cameras.main.shake(200, 0.01)
    }
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
      if (btn.container) btn.container.destroy()
    })
    
    const { width, height } = this.cameras.main
    const isMobile = width < 780
    
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.85)
    overlay.setOrigin(0)
    overlay.setDepth(200)
    
    this.add.text(width / 2, height / 2 - 80, 'GAME OVER', {
      fontSize: isMobile ? '36px' : '48px',
      fill: '#ef4444',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5).setDepth(201)
    
    this.add.text(width / 2, height / 2, `Score: ${this.score}`, {
      fontSize: isMobile ? '24px' : '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5).setDepth(201)
    
    this.add.text(width / 2, height / 2 + 45, `Level: ${this.difficultyLevel} | Targets: ${this.targetsDestroyed}`, {
      fontSize: isMobile ? '14px' : '18px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(201)
    
    const closeBtn = this.add.rectangle(width / 2, height / 2 + 120, 180, 45, 0x3b82f6)
    closeBtn.setInteractive({ useHandCursor: true })
    closeBtn.setDepth(201)
    
    this.add.text(width / 2, height / 2 + 120, 'FECHAR', {
      fontSize: isMobile ? '16px' : '20px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5).setDepth(201)
    
    closeBtn.on('pointerdown', () => {
      if (this.onGameComplete) {
        this.onGameComplete({
          score: this.score,
          level: this.difficultyLevel,
          targetsDestroyed: this.targetsDestroyed
        })
      }
      
      if (telemetryService) {
        telemetryService.track('GAME_END', {
          playerId: this.playerId,
          finalScore: this.score,
          finalLevel: this.difficultyLevel,
          targetsDestroyed: this.targetsDestroyed
        })
      }
      
      this.scene.stop()
    })
  }

  update() {
    if (!this.gameActive) return
    
    const groundY = this.cameras.main.height - 80
    if (this.currentTarget && this.currentTarget.y + 60 >= groundY) {
      this.combo = 1
      this.comboText.setText(`x1`)
      this.spawnTarget()
    }
  }
}