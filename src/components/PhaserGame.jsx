// src/components/PhaserGame.jsx (corrigido)
import { useEffect, useRef } from 'react'
import Phaser from 'phaser'

export default function PhaserGame({ gameId, onComplete, playerId, metrics }) {
  const gameRef = useRef(null)
  const gameInstance = useRef(null)

  useEffect(() => {
    if (!gameRef.current) return

    let isMounted = true

    const initGame = async () => {
      if (!gameRef.current || !isMounted) return

      if (gameInstance.current) {
        gameInstance.current.destroy(true)
        gameInstance.current = null
      }

      const module = await import('../games/NumberShooter/scenes/NumberShooterScene')
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
          height: '100%'
        },
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false
          }
        },
        backgroundColor: '#0f0c29'
      }

      gameInstance.current = new Phaser.Game(config)
      
      const checkSceneReady = () => {
        if (gameInstance.current) {
          const scene = gameInstance.current.scene.getScene('NumberShooterScene')
          if (scene) {
            console.log('🎮 Game scene found, passing player data. PlayerId:', playerId)
            // Passar o playerId para a cena
            scene.playerId = playerId
            scene.onGameComplete = (results) => {
              console.log('📤 Emitindo onComplete com resultados:', results)
              if (onComplete) {
                onComplete(results)
              }
            }
          } else {
            setTimeout(checkSceneReady, 100)
          }
        }
      }
      
      setTimeout(checkSceneReady, 200)
    }

    initGame()

    return () => {
      isMounted = false
      if (gameInstance.current) {
        gameInstance.current.destroy(true)
        gameInstance.current = null
      }
    }
  }, [gameId, playerId, onComplete])

  return (
    <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl" style={{ width: '100%', height: '80vh', minHeight: '500px' }}>
      <div ref={gameRef} style={{ width: '100%', height: '100%' }} />
      <div className="absolute bottom-2 left-0 right-0 text-center text-white text-xs bg-black/50 py-1 z-10">
        🎯 Toque nos botões para dividir os números | Tempo: 60s
      </div>
    </div>
  )
}