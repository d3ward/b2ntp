import { storage } from '../components/localStorage'
import { BookmarkStore } from './BookmarkStore'
import { BookmarkRenderer } from './BookmarkRenderer'

let _container = null
let _bus = null
let _getTabs = null
// null means "cleared" (search is in bang/escape mode); '' means "show all".
let _lastQuery = ''

function currentSelection() {
  const selected = _container.querySelector('.selected')
  if (!selected) return null
  return { id: selected.id, url: selected.href }
}

function emitSelection() {
  _bus?.emit('selection', currentSelection())
}

async function runQuery(text) {
  _lastQuery = text
  if (text === null) {
    _container.innerHTML = ''
    emitSelection()
    return
  }
  const tabs = _getTabs ? _getTabs() : []
  const sections = await BookmarkStore.query(text, tabs)
  BookmarkRenderer.render(_container, sections, text !== '')
  emitSelection()
}

function moveSelection(direction) {
  const sections = _container.querySelectorAll('.section')
  const currentSelected = _container.querySelector('.selected')
  let newSelected

  switch (direction) {
    case 'up':
      if (currentSelected) {
        newSelected =
          currentSelected.previousElementSibling ||
          currentSelected.parentElement.lastElementChild
        if (!newSelected || newSelected.classList.contains('title')) {
          const prevSection =
            currentSelected.closest('.section').previousElementSibling ||
            sections[sections.length - 1]
          newSelected = prevSection.querySelector('a:last-child')
        }
      } else {
        newSelected = _container.querySelector('a:last-child')
      }
      break
    case 'down':
      if (currentSelected) {
        newSelected = currentSelected.nextElementSibling
        if (!newSelected || newSelected.classList.contains('title')) {
          const nextSection =
            currentSelected.closest('.section').nextElementSibling ||
            sections[0]
          newSelected = nextSection.querySelector('a:first-child')
        }
      } else {
        newSelected = _container.querySelector('a:first-child')
      }
      break
    case 'left':
      if (currentSelected) {
        const prevSection =
          currentSelected.closest('.section').previousElementSibling ||
          sections[sections.length - 1]
        newSelected = prevSection.querySelector('a:first-child')
      }
      break
    case 'right':
      if (currentSelected) {
        const nextSection =
          currentSelected.closest('.section').nextElementSibling ||
          sections[0]
        newSelected = nextSection.querySelector('a:first-child')
      }
      break
  }

  if (newSelected) {
    currentSelected?.classList.remove('selected')
    newSelected.classList.add('selected')
    newSelected.scrollIntoView({ block: 'center' })
    emitSelection()
  }
}

function activate() {
  const selected = _container.querySelector('.selected')
  if (!selected) return
  if (selected.dataset.tabId) {
    chrome.tabs.update(parseInt(selected.dataset.tabId), { active: true })
  } else {
    window.location.href = selected.href
  }
}

export async function getBookmarks() {
  await BookmarkStore.refresh()
  const lastSyncEl = document.getElementById('last_sync')
  if (lastSyncEl) lastSyncEl.innerText = storage.get('bk_time')
}

export async function initBookmarks({ container, bus, getTabs }) {
  _container = container
  // #bookmarks is what _bookmarks.sass's styling targets.
  _container.id = 'bookmarks'
  _bus = bus || null
  _getTabs = getTabs || null
  _lastQuery = ''

  // Tab-link click delegation (chrome.tabs.update without coupling renderer to Chrome API)
  _container.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-tab-id]')
    if (link) {
      e.preventDefault()
      chrome.tabs.update(parseInt(link.dataset.tabId), { active: true })
    }
  })

  _bus?.on('query', runQuery)
  _bus?.on('nav', moveSelection)
  _bus?.on('activate', activate)

  if (typeof chrome !== 'undefined' && chrome.bookmarks) {
    const onChanged = async () => {
      await BookmarkStore.refresh()
      const lastSyncEl = document.getElementById('last_sync')
      if (lastSyncEl) lastSyncEl.innerText = storage.get('bk_time')
      runQuery(_lastQuery)
    }
    chrome.bookmarks.onChanged.addListener(onChanged)
    chrome.bookmarks.onCreated.addListener(onChanged)
    chrome.bookmarks.onRemoved.addListener(onChanged)
  }

  await runQuery('')
}
