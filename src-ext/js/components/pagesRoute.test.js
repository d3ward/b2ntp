import { describe, it, expect, beforeEach } from 'vitest'
import { pagesRoute } from './pagesRoute'

// The DaisyUI `menu` migration changed two things pagesRoute owns: the class it
// toggles (`active` -> `menu-active`, so the class the JS toggles is the one
// that actually has styling), and keyboard operability -- the nav links are
// <a> elements with no href, so they neither take focus nor fire click on
// Enter. These cover that wiring.
function mountNav() {
  document.body.innerHTML = `
    <section id="settings-panel">
      <ul class="menu">
        <li><a topage="#p-one" class="menu-active" tabindex="0" role="button">One</a></li>
        <li><a topage="#p-two" tabindex="0" role="button">Two</a></li>
      </ul>
    </section>
    <section id="p-one" class="page-active"></section>
    <section id="p-two"></section>`
  pagesRoute()
}

const activeSections = () =>
  [...document.querySelectorAll('section.page-active')].map((s) => s.id)
const activeLinks = () =>
  [...document.querySelectorAll('[topage].menu-active')].map((a) => a.getAttribute('topage'))

describe('pagesRoute — navigation', () => {
  beforeEach(mountNav)

  it('toggles menu-active, not the unstyled active class', () => {
    document.querySelector('[topage="#p-two"]').click()
    expect(activeLinks()).toEqual(['#p-two'])
    expect(document.querySelectorAll('[topage].active')).toHaveLength(0)
  })

  it('keeps exactly one section and one link active', () => {
    document.querySelector('[topage="#p-two"]').click()
    expect(activeSections()).toEqual(['p-two'])
    expect(activeLinks()).toHaveLength(1)
  })

  it('navigates back to the original section', () => {
    document.querySelector('[topage="#p-two"]').click()
    document.querySelector('[topage="#p-one"]').click()
    expect(activeSections()).toEqual(['p-one'])
    expect(activeLinks()).toEqual(['#p-one'])
  })
})

describe('pagesRoute — keyboard activation', () => {
  beforeEach(mountNav)

  const press = (selector, key) =>
    document
      .querySelector(selector)
      .dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))

  it('activates on Enter', () => {
    press('[topage="#p-two"]', 'Enter')
    expect(activeSections()).toEqual(['p-two'])
  })

  it('activates on Space', () => {
    press('[topage="#p-two"]', ' ')
    expect(activeSections()).toEqual(['p-two'])
  })

  it('ignores other keys', () => {
    press('[topage="#p-two"]', 'a')
    expect(activeSections()).toEqual(['p-one'])
  })

  it('prevents default on activation so Space does not scroll the panel', () => {
    const link = document.querySelector('[topage="#p-two"]')
    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    link.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })
})
