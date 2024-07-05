import '../sass/index.sass'
import A11yDialog from 'a11y-dialog'
import EmblaCarousel from 'embla-carousel'
import { addDotBtnsAndClickHandlers } from './components/embla_utils'
import Autoplay from 'embla-carousel-autoplay'

import { navbar } from './components/navbar'
import { themeManager } from './components/themeManager'
import { gotop } from './components/gotop'
import { pagesRoute } from './components/pagesRoute'
import { aos } from './components/aos'

const OPTIONS = { loop: true }

const emblaNode = document.querySelector('.embla')
const viewportNode = emblaNode.querySelector('.embla__viewport')
const prevBtnNode = emblaNode.querySelector('.embla__button--prev')
const nextBtnNode = emblaNode.querySelector('.embla__button--next')
const dotsNode = emblaNode.querySelector('.embla__dots')

const emblaApi = EmblaCarousel(viewportNode, OPTIONS, [Autoplay()])

const onNavButtonClick = (emblaApi) => {
  const autoplay = emblaApi?.plugins()?.autoplay
  if (!autoplay) return

  const resetOrStop =
    autoplay.options.stopOnInteraction === false
      ? autoplay.reset
      : autoplay.stop

  resetOrStop()
}


const removeDotBtnsAndClickHandlers = addDotBtnsAndClickHandlers(
  emblaApi,
  dotsNode,
  onNavButtonClick
)

emblaApi.on('destroy', removeDotBtnsAndClickHandlers)


// Call the function when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	const dialog_support = new A11yDialog(
		document.querySelector('#dlg_support')
	)

	new themeManager()
	new navbar()
	new gotop()
	new aos()
	new pagesRoute()
})
