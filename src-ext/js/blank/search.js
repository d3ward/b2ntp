import { storage } from '../components/localStorage'

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

const KEY_UP = 38
const KEY_DOWN = 40
const KEY_LEFT = 37
const KEY_RIGHT = 39

let sb_data
let _bus = null
let _actionEl = null
let _sbInput = null
// The last selection bookmarks published, so submit/keydown can decide
// whether there's anything to activate/navigate without ever reading
// bookmarks' DOM (spec.md §4: neither widget reads the other's).
let _lastSelection = null

function loadSbData() {
  sb_data = storage.get('sb_data')
  if (!sb_data) {
    sb_data = { ...SB_DEFAULTS }
    storage.set('sb_data', sb_data)
  }
  if (!sb_data.bang) {
    sb_data.bang = '!'
    storage.set('sb_data', sb_data)
  }
}

// A shortcut match ("!d query") or the "query  " (trailing double-space)
// escape hatch both fully decide the form's action themselves and hide any
// bookmark suggestions -- emitting a null query tells the bookmarks widget
// to clear rather than show its "no query" (browse-all) state.
function matchShortcut(query) {
  if (query.endsWith('  ')) {
    return { url: sb_data[sb_data.default], query: query.trim() }
  }
  const trimmed = query.trim()
  for (const [shortcut, url] of Object.entries(sb_data)) {
    if (
      shortcut !== 'placeholder' &&
      shortcut !== 'default' &&
      shortcut !== 'bang' &&
      trimmed.startsWith(sb_data.bang + shortcut + ' ')
    ) {
      const searchQuery = trimmed.slice(sb_data.bang.length + shortcut.length + 1)
      return { url, query: searchQuery }
    }
  }
  return null
}

function onInput() {
  const raw = _sbInput.value
  const shortcut = matchShortcut(raw)

  if (shortcut) {
    _actionEl.action = shortcut.url + encodeURIComponent(shortcut.query)
    _sbInput.name = 'q'
    _bus?.emit('query', null)
    return
  }

  _bus?.emit('query', raw.trim())
}

function onSelection(sel) {
  _lastSelection = sel
  if (sel) {
    _actionEl.action = sel.url
    _sbInput.removeAttribute('name')
    _sbInput.setAttribute('aria-activedescendant', sel.id)
    return
  }

  _sbInput.removeAttribute('aria-activedescendant')
  if (_sbInput.value.trim() !== '') {
    _actionEl.action = sb_data[sb_data.default]
    _sbInput.name = 'q'
  }
}

function onKeyDown(e) {
  if (e.keyCode === KEY_UP) {
    e.preventDefault()
    _bus?.emit('nav', 'up')
  } else if (e.keyCode === KEY_DOWN) {
    e.preventDefault()
    _bus?.emit('nav', 'down')
  } else if ((e.keyCode === KEY_LEFT || e.keyCode === KEY_RIGHT) && _lastSelection) {
    // Only intercept left/right when something is selected -- otherwise
    // they're just cursor movement inside the text input.
    e.preventDefault()
    _bus?.emit('nav', e.keyCode === KEY_LEFT ? 'left' : 'right')
  }
}

function onSubmit(event) {
  if (!_sbInput.value.endsWith('  ') && _lastSelection) {
    event.preventDefault()
    _bus?.emit('activate')
  }
}

export function initSearch({ container, bus }) {
  _bus = bus || null
  _lastSelection = null
  loadSbData()

  container.classList.add('tool_search')

  _actionEl = document.createElement('form')
  _actionEl.method = 'GET'
  _actionEl.id = 'action'
  _actionEl.action = 'https://duckduckgo.com/'
  _actionEl.className = 'text-center'

  _sbInput = document.createElement('input')
  _sbInput.id = 'sb_input'
  _sbInput.type = 'text'
  _sbInput.autofocus = true
  _sbInput.autocomplete = 'off'
  _sbInput.name = 'q'
  _sbInput.setAttribute('aria-label', 'Search Bar')
  if (sb_data.placeholder.length > 1) {
    _sbInput.placeholder = sb_data.placeholder
  }

  _actionEl.appendChild(_sbInput)
  container.appendChild(_actionEl)

  _actionEl.addEventListener('submit', onSubmit)

  // Legacy convenience: a bare "d query" (no bang) prefix is stripped before
  // a native form submission, independent of the bang-shortcut handling above.
  _actionEl.onsubmit = function () {
    const svalue = _sbInput.value
    if (svalue.charAt(1) === ' ' && Object.prototype.hasOwnProperty.call(sb_data, svalue.charAt(0))) {
      _sbInput.value = svalue.substring(2)
    }
    return true
  }

  _sbInput.addEventListener('input', onInput)
  _sbInput.addEventListener('keydown', onKeyDown)
  _sbInput.addEventListener('keypress', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') return false
  })

  _bus?.on('selection', onSelection)
}
