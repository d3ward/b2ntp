const DB_NAME = 'b2ntp_DB'
const STORE_NAME = 'images'
const DB_VERSION = 1

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      event.target.result.createObjectStore(STORE_NAME)
    }
  })
}

export const BackgroundStore = {
  /** Apply a saved CSS inline-style string to an element — synchronous, no FOUC */
  apply(config, element = document.body) {
    if (config && element) element.setAttribute('style', config)
  },

  /** Write a single background image CSS custom property */
  setImageVar(element, variant, url) {
    if (element && url) element.style.setProperty(`--bg-img-${variant}`, `url('${url}')`)
  },

  async save(key, imageBlob) {
    try {
      const db = await openDB()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const req = tx.objectStore(STORE_NAME).put(imageBlob, key)
        req.onerror = () => reject(req.error)
        req.onsuccess = () => resolve()
      })
    } catch (error) {
      console.error(`Failed to save background image for key ${key}:`, error)
      throw error
    }
  },

  async load(key) {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key)
      req.onerror = () => reject(req.error)
      req.onsuccess = () => {
        const r = req.result
        resolve(r?.constructor?.name === 'Blob' ? URL.createObjectURL(r) : r)
      }
    })
  },

  async delete(key) {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(key)
      req.onerror = () => reject(req.error)
      req.onsuccess = () => resolve()
    })
  },

  async list() {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAllKeys()
      req.onerror = () => reject(req.error)
      req.onsuccess = () => resolve(req.result)
    })
  },
}
