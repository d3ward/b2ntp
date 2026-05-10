import { storage } from '../components/localStorage'
import { jsoncat } from '../components/utilities'

// bk_data shape: { folderName: [{ title: [url, id] }, folderId] }

let _cache = null

function toSections(bkData) {
  return Object.entries(bkData).map(([title, [urls, id]]) => ({
    title,
    id,
    items: Object.entries(urls).map(([itemTitle, [url, itemId]]) => ({
      title: itemTitle,
      url,
      id: itemId,
    })),
  }))
}

function fetchFromChrome() {
  return new Promise((resolve) => {
    chrome.bookmarks.getTree((itemTree) => {
      const bkData = {}
      function processFolder(item) {
        const urls = {}
        item.children?.forEach((child) => {
          if (child.children) processFolder(child)
          else if (child.url) urls[child.title] = [child.url, child.id]
        })
        if (Object.keys(urls).length > 0) bkData[item.title] = [urls, item.id]
      }
      itemTree.forEach((item) => {
        if (item.children) processFolder(item)
        else if (item.url) {
          bkData[item.title] = [{ [item.title]: [item.url, item.id] }, item.id]
        }
      })

      // Preserve existing jsoncat ordering behaviour
      const keys = Object.keys(bkData)
      if (keys.length > 0) {
        const lastK = keys[keys.length - 1]
        const lastEl = { [lastK]: bkData[lastK] }
        jsoncat(lastEl, bkData)
      }

      storage.set('bk_data', bkData)
      storage.set('bk_time', new Date())
      resolve(bkData)
    })
  })
}

async function ensureLoaded() {
  if (_cache) return _cache
  const stored = storage.get('bk_data')
  if (stored && Object.keys(stored).length > 0) {
    _cache = stored
    return _cache
  }
  _cache = await fetchFromChrome()
  return _cache
}

export const BookmarkStore = {
  async query(term = '', tabs = []) {
    const bkData = await ensureLoaded()
    const sections = toSections(bkData)
    const q = term.trim().toLowerCase()

    let result
    if (!q) {
      result = sections.filter((s) => s.items.length > 0)
    } else {
      result = sections
        .map((s) => ({
          ...s,
          items: s.items.filter(
            (item) =>
              item.title.toLowerCase().includes(q) ||
              item.url.toLowerCase().includes(q)
          ),
        }))
        .filter((s) => s.items.length > 0)
    }

    if (q && tabs.length > 0) {
      const matchingTabs = tabs.filter(
        (t) =>
          (t.title || '').toLowerCase().includes(q) ||
          (t.url || '').toLowerCase().includes(q)
      )
      if (matchingTabs.length > 0) {
        result = [{ title: 'Tabs', id: 'tabs-search-results', items: matchingTabs }, ...result]
      }
    }

    return result
  },

  async refresh() {
    _cache = null
    _cache = await fetchFromChrome()
  },
}
