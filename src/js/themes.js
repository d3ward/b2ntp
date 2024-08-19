import A11yDialog from 'a11y-dialog'
import '../sass/themes.sass'
import { themeManager } from './components/themeManager'
import { navbar } from './components/navbar'
import { aos } from './components/aos'
import { gotop } from './components/gotop'
import EmblaCarousel from 'embla-carousel'
import { addDotBtnsAndClickHandlers } from './components/embla_utils'
import Autoplay from 'embla-carousel-autoplay'
import data from '../data/themes.json'

const dialog_preview = new A11yDialog(
    document.querySelector('#dlg_preview')
)

const OPTIONS = { loop: true }

const emblaNode = document.querySelector('.embla')
const viewportNode = emblaNode.querySelector('.embla__viewport')
const containerNode = emblaNode.querySelector('.embla__container')
const dotsNode = emblaNode.querySelector('.embla__dots')

let emblaApi = EmblaCarousel(viewportNode, OPTIONS, [Autoplay()])

const onNavButtonClick = (emblaApi) => {
  const autoplay = emblaApi?.plugins()?.autoplay
  if (!autoplay) return

  const resetOrStop =
    autoplay.options.stopOnInteraction === false
      ? autoplay.reset
      : autoplay.stop

  resetOrStop()
}

let removeDotBtnsAndClickHandlers = addDotBtnsAndClickHandlers(
  emblaApi,
  dotsNode,
  onNavButtonClick
)

function updateCarousel(themeId) {
    /*
     if (item.onetheme) ot += '<div><span>Light & Dark Theme</span></div>'
        else ot += '<div><span>Light Theme</span><span>Dark Theme</span></div>'
    */
    const theme = data[themeId]
    if (!theme || !theme.images || theme.images.length === 0) return

    // Clear existing slides
    containerNode.innerHTML = ''

    // Add new slides
    theme.images.forEach(imageSrc => {
        const slide = document.createElement('div')
        slide.className = 'embla__slide'
        
        const content = document.createElement('div')
        content.className = 'embla__slide_content'
        
        const img = document.createElement('img')
        img.src = "./assets/jpg/"+imageSrc
        img.alt = `${theme.title} preview`
        
        content.appendChild(img)
        slide.appendChild(content)
        containerNode.appendChild(slide)
    })

    // Destroy existing Embla instance
    if (emblaApi) {
        removeDotBtnsAndClickHandlers()
        emblaApi.destroy()
    }

    // Reinitialize Embla
    emblaApi = EmblaCarousel(viewportNode, OPTIONS, [Autoplay()])
    removeDotBtnsAndClickHandlers = addDotBtnsAndClickHandlers(
        emblaApi,
        dotsNode,
        onNavButtonClick
    )

    emblaApi.reInit()
}

function getPreview(id) {
    const title = document.getElementById("dlg_preview-title")
    const cnt = document.getElementById('pt_cnt')
    var html = ''

    if (data.hasOwnProperty(id)) {
        const item = data[id]
        var cr = ''
        if (item.credits)
            cr +=
                '<div>Credits : <a href="' +
                item.credits +
                '" target="_blank">' +
                item.credits +
                '</a></div>'
        var ot = ''
       
        html +=
            '<div><span><b>' +
            item.title +
            '</b></span><span> by ' +
            item.author +
            '</span></div>' +
            '<p>' +
            item.description +
            '</p>' +
            cr +
            '<div class="col-2">'
             +
            '</div>'
        title.textContent = "Theme Preview - "+item.title
    }
    const download_btn= document.getElementById("download-theme")
    download_btn.setAttribute("href","./themes/"+id +".json")
    download_btn.setAttribute("download",id +".json")
    cnt.innerHTML = html

    // Update carousel with theme images
    updateCarousel(id)
}

function previewListener() {
    document.querySelectorAll('.preview-btn').forEach((p) => {
        p.addEventListener('click', () => {
            getPreview(p.getAttribute('data-id'))
            dialog_preview.show()
        })
    })
}

// Call the function when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dialog_support = new A11yDialog(
        document.querySelector('#dlg_support')
    )
    themeManager()
    aos()
    new navbar()
    new gotop()
    previewListener()
})