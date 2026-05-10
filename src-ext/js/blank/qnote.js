import { storage } from '../components/localStorage.js'

const STORAGE_KEY = 'qnote_content'

export function initQuickNote({ container }) {
  const textarea = document.createElement('textarea')
  textarea.className = 'qnote-textarea'

  const saved = storage.get(STORAGE_KEY)
  if (saved !== null) textarea.value = saved

  let _debounce = null
  textarea.addEventListener('input', () => {
    clearTimeout(_debounce)
    _debounce = setTimeout(() => {
      storage.set(STORAGE_KEY, textarea.value)
    }, 500)
  })

  container.appendChild(textarea)
}
