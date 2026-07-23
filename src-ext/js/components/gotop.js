export function gotop() {
	const el = {}
	el.gt = document.getElementById('gt-link')
	el.scrollToTop = function () {
		window.scroll({
			top: 0,
			left: 0,
			behavior: 'smooth'
		})
	}
	el.listeners = function () {
		window.addEventListener('scroll', () => {
			let y = window.scrollY
			if (y > 0) {
				el.gt.classList.remove('invisible', 'opacity-0')
			} else {
				el.gt.classList.add('invisible', 'opacity-0')
			}
		})
		el.gt.onclick = function (e) {
			e.preventDefault()
			if (
				document.documentElement.scrollTop ||
				document.body.scrollTop > 0
			) {
				el.scrollToTop()
			}
		}
	}
	if (el.gt) {
		el.listeners()
	}
}
