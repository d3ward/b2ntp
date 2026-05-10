const TABS_SECTION_ID = 'tabs-search-results'

function createSectionEl(title, id) {
  const section = document.createElement('div')
  section.id = id
  section.className = 'section'

  const titleEl = document.createElement('div')
  titleEl.className = 'title'
  titleEl.textContent = title
  section.appendChild(titleEl)

  section.appendChild(document.createElement('div'))
  return section
}

function createBookmarkLinkEl(item, isFirst, highlightFirst) {
  const link = document.createElement('a')
  link.id = item.id
  link.href = item.url
  link.textContent = item.title
  if (isFirst && highlightFirst) link.className = 'selected'
  return link
}

function createTabLinkEl(item, isFirst, highlightFirst) {
  const link = document.createElement('a')
  link.href = item.url || '#'
  link.dataset.tabId = item.id
  link.className = 'tab-result'

  if (item.favIconUrl) {
    const img = document.createElement('img')
    img.src = item.favIconUrl
    img.alt = ''
    img.width = 14
    img.height = 14
    img.style.marginRight = '.3rem'
    img.style.verticalAlign = 'middle'
    link.appendChild(img)
  }

  const span = document.createElement('span')
  span.textContent = item.title || ''
  link.appendChild(span)

  if (isFirst && highlightFirst) link.className += ' selected'
  return link
}

export const BookmarkRenderer = {
  /**
   * @param {Array<{title:string, id:string, items:Array<{title:string,url:string,id:string,favIconUrl?:string}>}>} sections
   * @param {boolean} highlightFirst — place `.selected` on the first item
   */
  render(sections, highlightFirst = false) {
    const container = document.getElementById('bookmarks')
    if (!container) return

    const fragment = document.createDocumentFragment()
    let firstItemDone = false

    sections.forEach((section) => {
      if (!section.items.length) return

      const sectionEl = createSectionEl(section.title, section.id)
      const listEl = sectionEl.querySelector('div:not(.title)')
      const isTabSection = section.id === TABS_SECTION_ID

      section.items.forEach((item) => {
        const isFirst = !firstItemDone
        const linkEl = isTabSection
          ? createTabLinkEl(item, isFirst, highlightFirst)
          : createBookmarkLinkEl(item, isFirst, highlightFirst)
        listEl.appendChild(linkEl)
        firstItemDone = true
      })

      fragment.appendChild(sectionEl)
    })

    container.innerHTML = ''
    container.appendChild(fragment)
  },
}
