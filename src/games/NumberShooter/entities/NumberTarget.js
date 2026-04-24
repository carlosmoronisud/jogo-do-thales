// src/games/NumberShooter/entities/NumberTarget.js (corrigido - adicionando fallSpeed)
export default class NumberTarget {
  constructor(scene, x, y, number, config) {
    this.scene = scene
    this.x = x
    this.y = y
    this.number = number
    this.originalNumber = number
    this.config = config
    
    console.log('[NumberTarget] Creating target with number:', number)
    
    // Create visual elements
    this.container = scene.add.container(x, y)
    
    // Background circle
    this.background = scene.add.circle(0, 0, 50, 0x6366f1)
    this.background.setStrokeStyle(3, 0xffffff)
    
    // Number text
    this.text = scene.add.text(0, 0, number.toString(), {
      fontSize: '32px',
      fill: '#fff',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    })
    this.text.setOrigin(0.5)
    
    this.container.add([this.background, this.text])
    this.container.setDepth(10)
    
    // Add physics
    scene.physics.add.existing(this.container)
    const fallSpeed = (config && config.fallSpeed) ? config.fallSpeed : 50
    this.container.body.setVelocityY(fallSpeed)
    this.container.body.setCollideWorldBounds(true)
    this.container.body.setSize(80, 80)
    
    // Enable world bounds detection
    this.container.body.onWorldBounds = true
  }
  
  updateNumber(newNumber) {
    this.number = newNumber
    this.text.setText(newNumber.toString())
    
    // Scale effect when number changes
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true
    })
  }
  
  divide(divisor) {
    const newNumber = this.number / divisor
    if (Number.isInteger(newNumber)) {
      this.updateNumber(newNumber)
      return true
    }
    return false
  }
  
  isDestroyed() {
    return this.number === 1
  }
  
  destroy() {
    if (this.container) {
      this.container.destroy()
    }
  }
  
  update() {
    // Check if reached bottom
    if (this.container && this.container.y + 60 >= this.scene.game.config.height) {
      return 'reached_bottom'
    }
    return null
  }
}