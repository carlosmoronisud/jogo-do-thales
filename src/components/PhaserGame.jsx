// src/components/PhaserGame.jsx (garantindo dimensões corretas)
import { useEffect, useRef } from 'react'
import Phaser from 'phaser'

export default function PhaserGame({ gameId, onComplete, playerId, metrics }) {
  const gameRef = useRef(null)
  const gameInstance = useRef(null)

  useEffect(() => {
    if (!gameRef.current) return

    if (gameInstance.current) {
      gameInstance.current.destroy(true)
    }

    import('../games/NumberShooter/scenes/NumberShooterScene').then(module => {
      const NumberShooterScene = module.default
      
      const config = {
        type: Phaser.AUTO,
        width: '100%',
        height: '100%',
        parent: gameRef.current,
        scene: NumberShooterScene,
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: '100%',
          height: '100%',
          min: {
            width: 320,
            height: 480
          },
          max: {
            width: 1024,
            height: 768
          }
        },
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false
          }
        },
        backgroundColor: '#1a1a2e'
      }

      gameInstance.current = new Phaser.Game(config)
      
      setTimeout(() => {
        if (gameInstance.current) {
          const scene = gameInstance.current.scene.getScene('NumberShooterScene')
          if (scene) {
            console.log('🎮 Game initialized')
            scene.playerId = playerId
            scene.initialMetrics = metrics
            scene.onGameComplete = (result) => {
              if (onComplete) onComplete(result)
              setTimeout(() => {
                if (gameInstance.current) {
                  gameInstance.current.destroy(true)
                }
              }, 1000)
            }
          }
        }
      }, 100)
    }).catch(error => {
      console.error('Error loading game:', error)
    })

    return () => {
      if (gameInstance.current) {
        gameInstance.current.destroy(true)
      }
    }
  }, [gameId, playerId, metrics, onComplete])

  return (
    <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl" style={{ width: '100%', height: '80vh', minHeight: '480px', maxWidth: '100%' }}>
      <div ref={gameRef} style={{ width: '100%', height: '100%' }} />
      <div className="absolute bottom-2 left-0 right-0 text-center text-white text-xs bg-black bg-opacity-50 py-1 z-10">
        🎯 Toque nos botões ÷2, ÷3 ou ÷5 | Tempo: 45s | Números vermelhos = PRIMOS
      </div>
    </div>
  )
}