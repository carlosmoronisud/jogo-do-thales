// src/services/DatabaseService.js (simplificado)
class DatabaseService {
  constructor() {
    this.dbName = 'EducationalGamesHub'
    this.dbVersion = 1
    this.db = null
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)
      
      request.onerror = () => reject(request.error)
      
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        
        if (!db.objectStoreNames.contains('players')) {
          const playerStore = db.createObjectStore('players', { keyPath: 'id' })
          playerStore.createIndex('name', 'name', { unique: false })
        }
      }
    })
  }

  async savePlayer(player) {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['players'], 'readwrite')
      const store = transaction.objectStore('players')
      const request = store.put(player)
      
      request.onsuccess = () => resolve(player)
      request.onerror = () => reject(request.error)
    })
  }

  async loadAllPlayers() {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['players'], 'readonly')
      const store = transaction.objectStore('players')
      const request = store.getAll()
      
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async loadMetrics(playerId) {
    // Simplificado - retorna métricas básicas
    return { accuracy: 0, efficiency: 0, speed: 0, persistence: 0, engagement: 0 }
  }

  async saveMetrics(playerId, metrics) {
    // Não faz nada por enquanto
    return true
  }
}

export const dbService = new DatabaseService()