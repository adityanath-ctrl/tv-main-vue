import { ref, onMounted, onUnmounted } from 'vue'

export function useEPGNavigation() {
  const isEnabled = ref(false)
  let currentFocusedElement: HTMLElement | null = null
  
  function getAllFocusableElements(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>('[data-tv-focusable]'))
      .filter(el => {
        const style = window.getComputedStyle(el)
        const rect = el.getBoundingClientRect()
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               !el.hasAttribute('disabled') &&
               !el.disabled &&
               rect.width > 0 && 
               rect.height > 0
      })
  }
  
  function clearAllFocus() {
    document.querySelectorAll('.tv-focused').forEach(el => {
      el.classList.remove('tv-focused')
    })
    currentFocusedElement = null
  }
  
  function focusElement(element: HTMLElement) {
    clearAllFocus()
    element.classList.add('tv-focused')
    currentFocusedElement = element
    
    // Smooth scroll to element
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    })
  }
  
  function findNearestElement(direction: 'up' | 'down' | 'left' | 'right'): HTMLElement | null {
    if (!currentFocusedElement) return null
    
    const allElements = getAllFocusableElements()
    const currentRect = currentFocusedElement.getBoundingClientRect()
    
    let bestElement: HTMLElement | null = null
    let bestDistance = Infinity
    
    allElements.forEach(element => {
      if (element === currentFocusedElement) return
      
      const rect = element.getBoundingClientRect()
      let isValidDirection = false
      let distance = 0
      
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const currentCenterX = currentRect.left + currentRect.width / 2
      const currentCenterY = currentRect.top + currentRect.height / 2
      
      switch (direction) {
        case 'up':
          isValidDirection = centerY < currentCenterY - 10
          distance = Math.abs(currentCenterY - centerY) + Math.abs(currentCenterX - centerX) * 0.3
          break
        case 'down':
          isValidDirection = centerY > currentCenterY + 10
          distance = Math.abs(centerY - currentCenterY) + Math.abs(currentCenterX - centerX) * 0.3
          break
        case 'left':
          isValidDirection = centerX < currentCenterX - 10
          distance = Math.abs(currentCenterX - centerX) + Math.abs(currentCenterY - centerY) * 0.3
          break
        case 'right':
          isValidDirection = centerX > currentCenterX + 10
          distance = Math.abs(centerX - currentCenterX) + Math.abs(currentCenterY - centerY) * 0.3
          break
      }
      
      if (isValidDirection && distance < bestDistance) {
        bestDistance = distance
        bestElement = element
      }
    })
    
    return bestElement
  }
  
  function handleKeyDown(event: KeyboardEvent) {
    if (!isEnabled.value) return
    
    const allElements = getAllFocusableElements()
    
    // If no element is focused, focus the first one
    if (!currentFocusedElement && allElements.length > 0) {
      focusElement(allElements[0])
      event.preventDefault()
      event.stopPropagation()
      return
    }
    
    let targetElement: HTMLElement | null = null
    
    switch (event.key) {
      case 'ArrowUp':
        targetElement = findNearestElement('up')
        break
      case 'ArrowDown':
        targetElement = findNearestElement('down')
        break
      case 'ArrowLeft':
        targetElement = findNearestElement('left')
        break
      case 'ArrowRight':
        targetElement = findNearestElement('right')
        break
      case 'Enter':
      case ' ':
        if (currentFocusedElement) {
          currentFocusedElement.click()
        }
        event.preventDefault()
        event.stopPropagation()
        return
      case 'Escape':
        clearAllFocus()
        event.preventDefault()
        event.stopPropagation()
        return
      default:
        return
    }
    
    if (targetElement) {
      focusElement(targetElement)
      event.preventDefault()
      event.stopPropagation()
    }
  }
  
  const enable = () => {
    isEnabled.value = true
    document.addEventListener('keydown', handleKeyDown, true)
    console.log('EPG Navigation enabled')
    
    // Focus first element after a short delay
    setTimeout(() => {
      const elements = getAllFocusableElements()
      if (elements.length > 0) {
        focusElement(elements[0])
      }
    }, 200)
  }
  
  const disable = () => {
    isEnabled.value = false
    document.removeEventListener('keydown', handleKeyDown, true)
    clearAllFocus()
    console.log('EPG Navigation disabled')
  }
  
  const refresh = () => {
    if (isEnabled.value) {
      const elements = getAllFocusableElements()
      if (elements.length > 0 && !currentFocusedElement) {
        focusElement(elements[0])
      }
    }
  }
  
  onMounted(() => {
    enable()
  })
  
  onUnmounted(() => {
    disable()
  })
  
  return {
    enable,
    disable,
    refresh,
    isEnabled
  }
}