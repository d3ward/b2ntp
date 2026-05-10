export class LocalStorageManager {
  get(key) {
    const value = window.localStorage.getItem(key)
    try {
      return JSON.parse(value)
    } catch {
      if (value && typeof value === 'string') return value
      return null
    }
  }

  set(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value))
  }

  clear() {
    window.localStorage.clear()
  }
}

export const storage = new LocalStorageManager()
