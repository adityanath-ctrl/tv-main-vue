import { ref, onMounted, onUnmounted, nextTick } from 'vue'

/**
 * Improved TV Navigation composable.
 *
 * Changes from the original:
 *  - Uses instance-level state (no shared globals that break multi-instance)
 *  - Re-scans on every navigation press so dynamically-added elements are picked up
 *  - Scope support: pass `containerSelector` to restrict navigation to a portion of the DOM
 *  - Better nearest-neighbor algorithm with configurable axis bias
 *  - Mutation observer to auto-refresh when DOM changes
 */

export interface TVNavOptions {
  /** CSS selector for the container to restrict navigation to. Default: entire document */
  containerSelector?: string
  /** If true, auto-enable on mount */
  autoEnable?: boolean
  /** Prevent scrolling the page when navigating */
  preventScroll?: boolean
  /** Callback when an element is focused */
  onFocus?: (el: HTMLElement) => void
  /** Callback when an element is selected (Enter) */
  onSelect?: (el: HTMLElement) => void
  /** Callback on Escape */
  onEscape?: () => void
  /** Callback on Back / Backspace */
  onBack?: () => void
}

export function useTVNavigation(options: TVNavOptions = {}) {
  const {
    containerSelector,
    autoEnable = true,
    preventScroll = true,
    onFocus,
    onSelect,
    onEscape,
    onBack
  } = options

  const isEnabled = ref(false)
  const focusedIndex = ref(-1)

  let currentFocusedElement: HTMLElement | null = null
  let mutationObserver: MutationObserver | null = null

  // ──────────────────────────────────────────────────────
  // Element discovery
  // ──────────────────────────────────────────────────────
  function getContainer(): HTMLElement {
    if (containerSelector) {
      return document.querySelector<HTMLElement>(containerSelector) || document.body
    }
    return document.body
  }

  function getAllFocusableElements(): HTMLElement[] {
    const container = getContainer()
    return Array.from(container.querySelectorAll<HTMLElement>('[data-tv-focusable]'))
      .filter(el => {
        const style = window.getComputedStyle(el)
        const rect = el.getBoundingClientRect()
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          style.opacity !== '0' &&
          !el.hasAttribute('disabled') &&
          !(el as any).disabled &&
          rect.width > 0 &&
          rect.height > 0
        )
      })
  }

  // ──────────────────────────────────────────────────────
  // Focus management
  // ──────────────────────────────────────────────────────
  function clearAllFocus() {
    document.querySelectorAll('.tv-focused').forEach(el => {
      el.classList.remove('tv-focused')
    })
    currentFocusedElement = null
    focusedIndex.value = -1
  }

  function focusElement(element: HTMLElement) {
    clearAllFocus()
    element.classList.add('tv-focused')
    currentFocusedElement = element

    // Update index
    const elements = getAllFocusableElements()
    focusedIndex.value = elements.indexOf(element)

    // Scroll into view
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest'
    })

    // Fire callback
    onFocus?.(element)
  }

  // ──────────────────────────────────────────────────────
  // Directional navigation (nearest-neighbor)
  // ──────────────────────────────────────────────────────
  function findNearestElement(direction: 'up' | 'down' | 'left' | 'right'): HTMLElement | null {
    if (!currentFocusedElement) return null

    const allElements = getAllFocusableElements()
    if (allElements.length === 0) return null

    const currentRect = currentFocusedElement.getBoundingClientRect()
    const currentCenterX = currentRect.left + currentRect.width / 2
    const currentCenterY = currentRect.top + currentRect.height / 2

    let bestElement: HTMLElement | null = null
    let bestDistance = Infinity

    for (const element of allElements) {
      if (element === currentFocusedElement) continue

      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      let isValidDirection = false
      let distance = 0

      // Primary axis distance + weighted secondary axis distance
      // The secondary weight keeps navigation from jumping too far sideways
      switch (direction) {
        case 'up':
          isValidDirection = centerY < currentCenterY - 5
          distance =
            Math.abs(currentCenterY - centerY) +
            Math.abs(currentCenterX - centerX) * 0.4
          break
        case 'down':
          isValidDirection = centerY > currentCenterY + 5
          distance =
            Math.abs(centerY - currentCenterY) +
            Math.abs(currentCenterX - centerX) * 0.4
          break
        case 'left':
          isValidDirection = centerX < currentCenterX - 5
          distance =
            Math.abs(currentCenterX - centerX) +
            Math.abs(currentCenterY - centerY) * 0.4
          break
        case 'right':
          isValidDirection = centerX > currentCenterX + 5
          distance =
            Math.abs(centerX - currentCenterX) +
            Math.abs(currentCenterY - centerY) * 0.4
          break
      }

      if (isValidDirection && distance < bestDistance) {
        bestDistance = distance
        bestElement = element
      }
    }

    return bestElement
  }

  // ──────────────────────────────────────────────────────
  // Keyboard handler
  // ──────────────────────────────────────────────────────
  function handleKeyDown(event: KeyboardEvent) {
    if (!isEnabled.value) return

    const allElements = getAllFocusableElements()

    // If nothing focused yet, focus first element on any nav key
    if (!currentFocusedElement && allElements.length > 0) {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        focusElement(allElements[0])
        if (preventScroll) {
          event.preventDefault()
          event.stopPropagation()
        }
        return
      }
    }

    // Check if current element is still in the DOM and visible
    if (currentFocusedElement && !document.body.contains(currentFocusedElement)) {
      currentFocusedElement = null
      if (allElements.length > 0) {
        focusElement(allElements[0])
      }
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
          onSelect?.(currentFocusedElement)
        }
        event.preventDefault()
        event.stopPropagation()
        return
      case 'Escape':
        clearAllFocus()
        onEscape?.()
        event.preventDefault()
        event.stopPropagation()
        return
      case 'Backspace':
        onBack?.()
        return
      default:
        return // Don't handle other keys
    }

    if (targetElement) {
      focusElement(targetElement)
    }

    if (preventScroll) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  // ──────────────────────────────────────────────────────
  // Lifecycle
  // ──────────────────────────────────────────────────────
  const enable = () => {
    if (isEnabled.value) return
    isEnabled.value = true
    document.addEventListener('keydown', handleKeyDown, true)

    // Watch DOM changes to pick up new focusable elements
    const container = getContainer()
    mutationObserver = new MutationObserver(() => {
      // If our focused element is gone, refocus
      if (currentFocusedElement && !document.body.contains(currentFocusedElement)) {
        currentFocusedElement = null
      }
    })
    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-tv-focusable', 'style', 'class', 'disabled']
    })

    // Initial focus after a short delay
    setTimeout(() => {
      const elements = getAllFocusableElements()
      if (elements.length > 0 && !currentFocusedElement) {
        focusElement(elements[0])
      }
    }, 200)
  }

  const disable = () => {
    isEnabled.value = false
    document.removeEventListener('keydown', handleKeyDown, true)
    clearAllFocus()
    if (mutationObserver) {
      mutationObserver.disconnect()
      mutationObserver = null
    }
  }

  const refresh = () => {
    if (isEnabled.value) {
      const elements = getAllFocusableElements()
      if (elements.length > 0 && !currentFocusedElement) {
        focusElement(elements[0])
      }
    }
  }

  /** Focus a specific element by index */
  const focusByIndex = (index: number) => {
    const elements = getAllFocusableElements()
    if (index >= 0 && index < elements.length) {
      focusElement(elements[index])
    }
  }

  /** Focus the first element */
  const focusFirst = () => {
    const elements = getAllFocusableElements()
    if (elements.length > 0) {
      focusElement(elements[0])
    }
  }

  /** Focus the last element */
  const focusLast = () => {
    const elements = getAllFocusableElements()
    if (elements.length > 0) {
      focusElement(elements[elements.length - 1])
    }
  }

  /** Get the currently focused element */
  const getFocused = () => currentFocusedElement

  onMounted(() => {
    if (autoEnable) {
      // Small delay to let the DOM settle
      nextTick(() => {
        enable()
      })
    }
  })

  onUnmounted(() => {
    disable()
  })

  return {
    isEnabled,
    focusedIndex,
    enable,
    disable,
    refresh,
    clearFocus: clearAllFocus,
    focusByIndex,
    focusFirst,
    focusLast,
    getFocused
  }
}