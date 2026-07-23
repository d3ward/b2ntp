import '../css/index.css'
import A11yDialog from 'a11y-dialog'
import { createCarousel } from './components/embla_setup'
import { navbar } from './components/navbar'
import { themeManager } from './components/themeManager'
import { gotop } from './components/gotop'
import { pagesRoute } from './components/pagesRoute'
import { aos } from './components/aos'

createCarousel(document.querySelector('.embla'))

document.addEventListener('DOMContentLoaded', () => {
  new A11yDialog(document.querySelector('#dlg_support'))
  themeManager()
  navbar()
  gotop()
  aos()
  pagesRoute()
})
