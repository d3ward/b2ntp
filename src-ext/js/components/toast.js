export function toast(options = []) {
    const t = {}
    // Written as whole literal class names so Tailwind's scanner finds them.
    // Composing these at runtime (e.g. 'alert-' + type) would make them
    // invisible to the extractor and they would not be generated.
    const typeClass = {
        success: 'alert-success',
        error: 'alert-error',
        warn: 'alert-warning',
        info: 'alert-info'
    }
    // DaisyUI's documented alert icons (docs/daisyui/Alert.md): stroke-based,
    // h-6 w-6 shrink-0 stroke-current so they inherit the alert's content colour.
    const ico = (path) =>
        '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">' +
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="' + path + '"/></svg>'

    const warnIcon = ico('M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z')
    const successIcon = ico('M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z')
    const infoIcon = ico('M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z')
    const errorIcon = ico('M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z')

    t.timeout = options.timeout || 3000
    t.autoClose = options.autoClose || true
    t.parent = document.querySelector('#nt1')
    t.position = t.parent.getAttribute('toast-pos')

    // The container is a manual popover so it shares the top layer with native
    // <dialog>. Without this a toast raised while a modal is open is painted
    // underneath it -- no z-index can beat the top layer.
    t.raise = () => {
        if (t.parent.hasAttribute('popover') && !t.parent.matches(':popover-open')) {
            try { t.parent.showPopover() } catch { /* already open */ }
        }
    }
    t.lower = () => {
        if (t.parent.hasAttribute('popover') && t.parent.matches(':popover-open') && !t.parent.children.length) {
            try { t.parent.hidePopover() } catch { /* already closed */ }
        }
    }
    // Top-layer order is last-shown-wins: if a toast is already up and a
    // <dialog> opens afterwards, the dialog (and its ::backdrop) stacks above
    // the toast. Auto-dismiss still works -- it's a timer removing the DOM
    // node -- but a click meant for the toast hits the backdrop instead, so
    // click-to-dismiss silently stops working. Re-promote the toast on every
    // dialog open so it stays on top of whatever opened last.
    t.bump = () => {
        if (t.parent.hasAttribute('popover') && t.parent.matches(':popover-open')) {
            try { t.parent.hidePopover(); t.parent.showPopover() } catch { /* mid-transition */ }
        }
    }
    document.addEventListener('toggle', (e) => {
        if (e.target.tagName === 'DIALOG' && e.newState === 'open') t.bump()
    }, true)

    t.close = (el) => {
        el.classList.add('toast-out')
        setTimeout(() => {
            el.remove()
            t.lower()
        }, 300)
    }
    t.setCloseOnClick = (toast) => {
        toast.addEventListener('click', () => {
            t.close(toast)
        })
    }
    t.setAutocloseTimeout = (toast, timeout) => {
        setTimeout(async () => {
            t.close(toast)
        }, timeout)
    }
    t.createItem = (message, type = '_', icon = '') => {
        const item = document.createElement('div')
        // `toast-item` is kept purely as a hook; `alert` carries the styling.
        item.classList.add('alert', 'toast-item')
        if (typeClass[type]) item.classList.add(typeClass[type])
        item.setAttribute('role', 'alert')
        const span = document.createElement('span')
        span.textContent = message
        item.innerHTML = icon
        item.appendChild(span)
        return item
    }

    t.error = (txt) => t.showA(t.createItem(txt, 'error', errorIcon))
    t.warn = (txt) => t.showA(t.createItem(txt, 'warn', warnIcon))
    t.info = (txt) => t.showA(t.createItem(txt, 'info', infoIcon))
    t.success = (txt) => t.showA(t.createItem(txt, 'success', successIcon))
    t.show = (txt) => t.showA(t.createItem(txt))

    t.showA = (toast) => {
        const oldHeight = t.parent.offsetHeight
        if (oldHeight > screen.height) return
        t.parent.appendChild(toast)
        t.raise()
        const newHeight = t.parent.offsetHeight
        const height = newHeight - oldHeight
        const sp = t.position.includes('top') ? '-' : '+'
        t.parent.animate(
            [
                { transform: `translateY(${sp}${height}px)` },
                { transform: 'translateY(0)' }
            ],
            { duration: 150, easing: 'ease-out' }
        )
        if (t.autoClose) t.setAutocloseTimeout(toast, t.timeout)
        t.setCloseOnClick(toast)
    }
    return t
}
