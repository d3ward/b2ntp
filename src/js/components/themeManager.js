import { LocalStorageManager } from './localStorage'

export function themeManager() {
    const ls = new LocalStorageManager('b2ntp')
    //Theme Switcher
    var toggles = document.getElementsByClassName('theme-toggle')

    if (window.CSS && CSS.supports('color', 'var(--bg)') && toggles) {
        var storedTheme =
            localStorage.getItem('theme') ||
            (window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light')
        if (storedTheme)
            document.body.setAttribute('data-theme', storedTheme)
        for (var i = 0; i < toggles.length; i++) {
            toggles[i].onclick = function () {
                var currentTheme =
                    document.body.getAttribute('data-theme')
                var targetTheme = 'light'

                if (currentTheme === 'light') {
                    targetTheme = 'dark'
                }

                document.body.setAttribute('data-theme', targetTheme)
                localStorage.setItem('theme', targetTheme)
            }
        }
    }

    // Grid Layout Switcher
    const gridRadios = document.querySelectorAll('input[name="t-style"]')
    const currentLayout = ls.getGridLayout()
    if (currentLayout) {
        document.body.setAttribute('data-grid-layout', currentLayout)
        const checkedRadio = document.querySelector(`input[name="t-style"][value="${currentLayout}"]`)
        if (checkedRadio) {
            checkedRadio.checked = true
        }
    }

    gridRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            const selectedLayout = event.target.value
            document.body.setAttribute('data-grid-layout', selectedLayout)
            ls.setGridLayout(selectedLayout)
        })
    })
}
