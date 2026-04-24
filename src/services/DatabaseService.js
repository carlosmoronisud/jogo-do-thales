// src/services/DatabaseService.js
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
        
        if (!db.objectStoreNames.contains('metrics')) {
          const metricsStore = db.createObjectStore('metrics', { keyPath: 'playerId' })
          metricsStore.createIndex('playerId', 'playerId', { unique: true })
        }
        
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' })
          sessionStore.createIndex('playerId', 'playerId', { unique: false })
          sessionStore.createIndex('timestamp', 'timestamp', { unique: false })
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

  async saveMetrics(playerId, metrics) {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['metrics'], 'readwrite')
      const store = transaction.objectStore('metrics')
      const request = store.put({ playerId, ...metrics })
      
      request.onsuccess = () => resolve(metrics)
      request.onerror = () => reject(request.error)
    })
  }

  async loadMetrics(playerId) {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['metrics'], 'readonly')
      const store = transaction.objectStore('metrics')
      const request = store.get(playerId)
      
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async saveSession(session) {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['sessions'], 'readwrite')
      const store = transaction.objectStore('sessions')
      const request = store.add(session)
      
      request.onsuccess = () => resolve(session)
      request.onerror = () => reject(request.error)
    })
  }

  async loadPlayerSessions(playerId) {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['sessions'], 'readonly')
      const store = transaction.objectStore('sessions')
      const index = store.index('playerId')
      const request = index.getAll(playerId)
      
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }
}

export const dbService = new DatabaseService()