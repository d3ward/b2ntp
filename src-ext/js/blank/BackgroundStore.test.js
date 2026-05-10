import { describe, it, expect, vi, beforeEach } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { BackgroundStore } from './BackgroundStore'

beforeEach(() => {
  // Fresh in-memory IndexedDB for every test — no state leaks
  globalThis.indexedDB = new IDBFactory()
  document.body.removeAttribute('style')
})

describe('BackgroundStore.setImageVar', () => {
  it('sets the correct CSS custom property on the element', () => {
    const el = document.createElement('div')
    BackgroundStore.setImageVar(el, 'l', 'https://example.com/light.jpg')
    expect(el.style.getPropertyValue('--bg-img-l')).toBe("url('https://example.com/light.jpg')")
  })

  it('sets dark variant independently', () => {
    const el = document.createElement('div')
    BackgroundStore.setImageVar(el, 'd', 'https://example.com/dark.jpg')
    expect(el.style.getPropertyValue('--bg-img-d')).toBe("url('https://example.com/dark.jpg')")
  })
})

describe('BackgroundStore.apply', () => {
  it('sets the style attribute from config string', () => {
    BackgroundStore.apply('--bg-blur: 4px; --bg-dark: 80%;')
    expect(document.body.getAttribute('style')).toBe('--bg-blur: 4px; --bg-dark: 80%;')
  })

  it('does nothing when config is empty', () => {
    BackgroundStore.apply('')
    expect(document.body.getAttribute('style')).toBeNull()
  })

  it('does nothing when config is null', () => {
    BackgroundStore.apply(null)
    expect(document.body.getAttribute('style')).toBeNull()
  })
})

describe('BackgroundStore save / load round-trip', () => {
  it('calls URL.createObjectURL when a Blob is retrieved', async () => {
    // fake-indexeddb strips jsdom Blobs via structuredClone; put a Node-native
    // Blob directly via IDB so it survives the round-trip as instanceof Blob
    const { Blob: NodeBlob } = await import('node:buffer')
    const nativeBlob = new NodeBlob(['img-data'], { type: 'image/jpeg' })

    // Seed the same DB/store that BackgroundStore uses
    await new Promise((res, rej) => {
      const req = globalThis.indexedDB.open('b2ntp_DB', 1)
      req.onupgradeneeded = (e) => e.target.result.createObjectStore('images')
      req.onsuccess = () => {
        const tx = req.result.transaction('images', 'readwrite')
        const put = tx.objectStore('images').put(nativeBlob, 'bg_custom_l')
        put.onsuccess = res
        put.onerror = rej
      }
      req.onerror = rej
    })

    vi.spyOn(globalThis.URL, 'createObjectURL').mockReturnValueOnce('blob:fake/1')
    const url = await BackgroundStore.load('bg_custom_l')
    expect(url).toBe('blob:fake/1')
    vi.restoreAllMocks()
  })

  it('saves a string value and loads it back directly', async () => {
    await BackgroundStore.save('bg_custom_l', 'https://example.com/bg.jpg')
    const result = await BackgroundStore.load('bg_custom_l')
    expect(result).toBe('https://example.com/bg.jpg')
  })

  it('returns undefined for a key that does not exist', async () => {
    const result = await BackgroundStore.load('nonexistent')
    expect(result).toBeUndefined()
  })
})

describe('BackgroundStore.delete', () => {
  it('removes an item so load returns undefined', async () => {
    await BackgroundStore.save('bg_custom_d', 'https://example.com/dark.jpg')
    await BackgroundStore.delete('bg_custom_d')
    const result = await BackgroundStore.load('bg_custom_d')
    expect(result).toBeUndefined()
  })
})

describe('BackgroundStore.list', () => {
  it('returns empty array when nothing is saved', async () => {
    const keys = await BackgroundStore.list()
    expect(keys).toEqual([])
  })

  it('returns all saved keys', async () => {
    await BackgroundStore.save('bg_custom_l', 'light')
    await BackgroundStore.save('bg_custom_d', 'dark')
    const keys = await BackgroundStore.list()
    expect(keys).toHaveLength(2)
    expect(keys).toContain('bg_custom_l')
    expect(keys).toContain('bg_custom_d')
  })

  it('does not include deleted keys', async () => {
    await BackgroundStore.save('bg_custom_l', 'light')
    await BackgroundStore.save('bg_custom_d', 'dark')
    await BackgroundStore.delete('bg_custom_l')
    const keys = await BackgroundStore.list()
    expect(keys).toEqual(['bg_custom_d'])
  })
})
