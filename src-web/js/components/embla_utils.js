export const addDotBtnsAndClickHandlers = (
    emblaApi,
    dotsNode,
    onButtonClick
  ) => {
    let dotNodes = []
  
    const addDotBtnsWithClickHandlers = () => {
      dotsNode.innerHTML = emblaApi
        .scrollSnapList()
        .map(() => '<button class="embla__dot" type="button"></button>')
        .join('')
  
      const scrollTo = (index) => {
        emblaApi.scrollTo(index)
        if (onButtonClick) onButtonClick(emblaApi)
      }
  
      dotNodes = Array.from(dotsNode.querySelectorAll('.embla__dot'))
      dotNodes.forEach((dotNode, index) => {
        dotNode.addEventListener('click', () => scrollTo(index), false)
      })
    }
  
    const toggleDotBtnsActive = () => {
      const previous = emblaApi.previousScrollSnap()
      const selected = emblaApi.selectedScrollSnap()
      dotNodes[previous].classList.remove('embla__dot--selected')
      dotNodes[selected].classList.add('embla__dot--selected')
    }
  
    emblaApi
      .on('init', addDotBtnsWithClickHandlers)
      .on('reInit', addDotBtnsWithClickHandlers)
      .on('init', toggleDotBtnsActive)
      .on('reInit', toggleDotBtnsActive)
      .on('select', toggleDotBtnsActive)
  
    return () => {
      dotsNode.innerHTML = ''
    }
  }
  const addTogglePrevNextBtnsActive = (emblaApi, prevBtn, nextBtn) => {
    const togglePrevNextBtnsState = () => {
      if (emblaApi.canScrollPrev()) prevBtn.removeAttribute('disabled')
      else prevBtn.setAttribute('disabled', 'disabled')
  
      if (emblaApi.canScrollNext()) nextBtn.removeAttribute('disabled')
      else nextBtn.setAttribute('disabled', 'disabled')
    }
  
    emblaApi
      .on('select', togglePrevNextBtnsState)
      .on('init', togglePrevNextBtnsState)
      .on('reInit', togglePrevNextBtnsState)
  
    return () => {
      prevBtn.removeAttribute('disabled')
      nextBtn.removeAttribute('disabled')
    }
  }
  
  export const addPrevNextBtnsClickHandlers = (
    emblaApi,
    prevBtn,
    nextBtn,
    onButtonClick
  ) => {
    const scrollPrev = () => {
      emblaApi.scrollPrev()
      if (onButtonClick) onButtonClick(emblaApi)
    }
    const scrollNext = () => {
      emblaApi.scrollNext()
      if (onButtonClick) onButtonClick(emblaApi)
    }
    prevBtn.addEventListener('click', scrollPrev, false)
    nextBtn.addEventListener('click', scrollNext, false)
  
    const removeTogglePrevNextBtnsActive = addTogglePrevNextBtnsActive(
      emblaApi,
      prevBtn,
      nextBtn
    )
  
    return () => {
      removeTogglePrevNextBtnsActive()
      prevBtn.removeEventListener('click', scrollPrev, false)
      nextBtn.removeEventListener('click', scrollNext, false)
    }
  }
  