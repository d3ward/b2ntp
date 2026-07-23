import A11yDialog from 'a11y-dialog'
import '../css/themes.css'
import { themeManager } from './components/themeManager'
import { navbar } from './components/navbar'
import { aos } from './components/aos'
import { gotop } from './components/gotop'
import { createCarousel } from './components/embla_setup'
import data from '../data/themes.json'

const dialog_preview = new A11yDialog(document.querySelector('#dlg_preview'))

const emblaNode = document.querySelector('.embla')
const containerNode = emblaNode.querySelector('.embla__container')
const carousel = createCarousel(emblaNode)

function updateCarousel(themeId) {
    const theme = data[themeId]
    if (!theme || !theme.images || theme.images.length === 0) return

    containerNode.innerHTML = ''
    theme.images.forEach(imageSrc => {
        const slide = document.createElement('div')
        slide.className = 'embla__slide'
        const content = document.createElement('div')
        content.className = 'embla__slide_content'
        const img = document.createElement('img')
        img.src = './assets/jpg/' + imageSrc
        img.alt = `${theme.title} preview`
        content.appendChild(img)
        slide.appendChild(content)
        containerNode.appendChild(slide)
    })

    carousel.reinit()
}

function getPreview(id) {
    const title = document.getElementById('dlg_preview-title')
    const cnt = document.getElementById('pt_cnt')
    var html = ''

    if (Object.prototype.hasOwnProperty.call(data, id)) {
        const item = data[id]
        var cr = ''
        if (item.credits)
            cr += '<div>Credits : <a href="' + item.credits + '" target="_blank">' + item.credits + '</a></div>'
        html +=
            '<div><span><b>' + item.title + '</b></span><span> by ' + item.author + '</span></div>' +
            '<p>' + item.description + '</p>' +
            cr +
            '<div class="col-2"></div>'
        title.textContent = 'Theme Preview - ' + item.title
    }
    const download_btn = document.getElementById('download-theme')
    download_btn.setAttribute('href', './themes/' + id + '.json')
    download_btn.setAttribute('download', id + '.json')
    cnt.innerHTML = html

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

function renderThemes() {
    const container = document.getElementById('themeItems')
    if (!container) return
    let html = ''
    for (const key in data) {
        const value = data[key]
        if (key === 'default' || value.hide) continue
        const palette = value.palette || []
        const paletteHtml = palette.length
            ? `<div><div class="_mb-05">Palette : </div><div class="palette">${
                palette.map(p => `<span style="background:${p}"></span>`).join('')
              }</div></div>`
            : ''
        html += `<div class="col-6"><div class="card _aos-bottom">
            <div><span><b>${value.title}</b></span><span> by ${value.author}</span></div>
            <p>${value.description}</p>
            ${paletteHtml}
            <div>
                <button class="preview-btn" data-id="${key}"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M11.102 17.957c-3.204 -.307 -5.904 -2.294 -8.102 -5.957c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6a19.5 19.5 0 0 1 -.663 1.032" /><path d="M15 19l2 2l4 -4" /></svg> Preview</button>
                <a class="btn" href="./themes/${key}.json" download="${key}.json"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 11l5 5l5 -5" /><path d="M12 4l0 12" /></svg> Download</a>
            </div>
        </div></div>`
    }
    container.innerHTML = html
}

document.addEventListener('DOMContentLoaded', () => {
    new A11yDialog(document.querySelector('#dlg_support'))
    themeManager()
    aos()
    navbar()
    gotop()
    renderThemes()
    previewListener()
})
