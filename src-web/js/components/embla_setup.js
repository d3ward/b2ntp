import EmblaCarousel from 'embla-carousel'
import Autoplay from 'embla-carousel-autoplay'
import { addDotBtnsAndClickHandlers } from './embla_utils'

const OPTIONS = { loop: true }

function onNavButtonClick(emblaApi) {
  const autoplay = emblaApi?.plugins()?.autoplay
  if (!autoplay) return
  const resetOrStop =
    autoplay.options.stopOnInteraction === false ? autoplay.reset : autoplay.stop
  resetOrStop()
}

export function createCarousel(rootEl) {
  const viewportNode = rootEl.querySelector('.embla__viewport')
  const dotsNode = rootEl.querySelector('.embla__dots')
  let emblaApi = EmblaCarousel(viewportNode, OPTIONS, [Autoplay()])
  let cleanup = addDotBtnsAndClickHandlers(emblaApi, dotsNode, onNavButtonClick)
  emblaApi.on('destroy', cleanup)

  return {
    reinit() {
      cleanup()
      emblaApi.destroy()
      emblaApi = EmblaCarousel(viewportNode, OPTIONS, [Autoplay()])
      cleanup = addDotBtnsAndClickHandlers(emblaApi, dotsNode, onNavButtonClick)
      emblaApi.reInit()
    }
  }
}
