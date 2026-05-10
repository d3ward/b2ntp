import { storage } from '../components/localStorage'
import { BookmarkStore } from './BookmarkStore'
import { BookmarkRenderer } from './BookmarkRenderer'

const SB_DEFAULTS = {
  placeholder: 'Search with ddg..',
  default: 'd',
  bang: '!',
  b: 'https://bing.com/search?q=',
  g: 'https://google.com/search?q=',
  d: 'https://duckduckgo.com/?q=',
  r: 'https://www.reddit.com/search?q=',
  y: 'https://www.youtube.com/results?q=',
}

let sb_data
let _getTabs = null

async function handleSearch(query = '') {
  const actionEl = document.getElementById('action')
  const actionInput = actionEl.children[0]

  if (query.endsWith('  ')) {
    document.getElementById('bookmarks').innerHTML = ''
    query = query.trim()
    actionEl.action = sb_data[sb_data.default] + encodeURIComponent(query)
    actionInput.name = 'q'
    return
  }

  query = query.trim()

  for (const [shortcut, url] of Object.entries(sb_data)) {
    if (
      shortcut !== 'placeholder' &&
      shortcut !== 'default' &&
      shortcut !== 'bang' &&
      query.startsWith(sb_data.bang + shortcut + ' ')
    ) {
      const searchQuery = query.slice(sb_data.bang.length + shortcut.length + 1)
      document.getElementById('bookmarks').innerHTML = ''
      actionEl.action = url + encodeURIComponent(searchQuery)
      actionInput.name = 'q'
      return
    }
  }

  const tabs = _getTabs ? _getTabs() : []
  const sections = await BookmarkStore.query(query, tabs)
  BookmarkRenderer.render(sections, query !== '')

  if (sections.length === 0) {
    actionEl.action = sb_data[sb_data.default]
    actionInput.name = 'q'
  } else if (query !== '') {
    const selected = document.querySelector('#bookmarks a.selected')
    if (selected) {
      actionEl.action = selected.href
      actionInput.removeAttribute('name')
    }
  }
}

function setupKeyNav(sbInput) {
  sbInput.onkeydown = function (e) {
    const bookmarks = document.getElementById('bookmarks')
    const sections = bookmarks.querySelectorAll('.section')
    const currentSelected = bookmarks.querySelector('.selected')
    let newSelected

    switch (e.keyCode) {
      case 38:
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
          newSelected = bookmarks.querySelector('a:last-child')
        }
        break
      case 40:
        if (currentSelected) {
          newSelected = currentSelected.nextElementSibling
          if (!newSelected || newSelected.classList.contains('title')) {
            const nextSection =
              currentSelected.closest('.section').nextElementSibling ||
              sections[0]
            newSelected = nextSection.querySelector('a:first-child')
          }
        } else {
          newSelected = bookmarks.querySelector('a:first-child')
        }
        break
      case 37:
        if (currentSelected) {
          const prevSection =
            currentSelected.closest('.section').previousElementSibling ||
            sections[sections.length - 1]
          newSelected = prevSection.querySelector('a:first-child')
        }
        break
      case 39:
        if (currentSelected) {
          const nextSection =
            currentSelected.closest('.section').nextElementSibling ||
            sections[0]
          newSelected = nextSection.querySelector('a:first-child')
        }
        break
      default:
        return
    }

    if (newSelected) {
      e.preventDefault()
      currentSelected?.classList.remove('selected')
      newSelected.classList.add('selected')
      newSelected.scrollIntoView({ block: 'center' })
      document.getElementById('action').action = newSelected.href
      document.getElementById('action').children[0].removeAttribute('name')
    }
  }

  sbInput.onkeypress = function (e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') return false
  }
}

export async function getBookmarks() {
  await BookmarkStore.refresh()
  const lastSyncEl = document.getElementById('last_sync')
  if (lastSyncEl) lastSyncEl.innerText = storage.get('bk_time')
}

export async function initBookmarks({ ntoast, getTabs }) {
  _getTabs = getTabs || null

  sb_data = storage.get('sb_data')
  if (!sb_data) {
    sb_data = { ...SB_DEFAULTS }
    storage.set('sb_data', sb_data)
  }
  if (!sb_data.bang) {
    sb_data.bang = '!'
    storage.set('sb_data', sb_data)
  }

  const sbInput = document.getElementById('sb_input')
  if (sb_data.placeholder.length > 1) {
    sbInput.placeholder = sb_data.placeholder
  }

  const actionEl = document.getElementById('action')

  // Tab-link click delegation (chrome.tabs.update without coupling renderer to Chrome API)
  document.getElementById('bookmarks').addEventListener('click', (e) => {
    const link = e.target.closest('a[data-tab-id]')
    if (link) {
      e.preventDefault()
      chrome.tabs.update(parseInt(link.dataset.tabId), { active: true })
    }
  })

  actionEl.addEventListener('submit', (event) => {
    const query = sbInput.value
    const selected = document.querySelector('#bookmarks a.selected')
    if (!query.endsWith('  ') && selected) {
      event.preventDefault()
      if (selected.dataset.tabId) {
        chrome.tabs.update(parseInt(selected.dataset.tabId), { active: true })
      } else {
        window.location.href = selected.href
      }
    }
  })

  actionEl.onsubmit = function () {
    const svalue = this.children[0].value
    if (svalue.charAt(1) === ' ' && Object.prototype.hasOwnProperty.call(sb_data, svalue.charAt(0))) {
      this.children[0].value = svalue.substring(2)
    }
    return true
  }

  sbInput.addEventListener('input', () => handleSearch(sbInput.value))

  setupKeyNav(sbInput)

  // Register bookmark-change listeners
  if (typeof chrome !== 'undefined' && chrome.bookmarks) {
    const onChanged = async () => {
      await BookmarkStore.refresh()
      const lastSyncEl = document.getElementById('last_sync')
      if (lastSyncEl) lastSyncEl.innerText = storage.get('bk_time')
      handleSearch(sbInput.value)
    }
    chrome.bookmarks.onChanged.addListener(onChanged)
    chrome.bookmarks.onCreated.addListener(onChanged)
    chrome.bookmarks.onRemoved.addListener(onChanged)
  }

  window.addEventListener('load', () => handleSearch(sbInput.value))
  await handleSearch('')
}
