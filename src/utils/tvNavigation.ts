/**
 * TV Navigation Utilities
 * Helpers for making components TV-remote navigatable
 */

/**
 * Add TV navigation attributes to an element
 * Usage: :data-tv-focusable="true" in your template
 */
export const TV_FOCUSABLE = 'data-tv-focusable'

/**
 * Make an element TV navigatable
 */
export function makeTVFocusable(element: HTMLElement | null) {
  if (element) {
    element.setAttribute(TV_FOCUSABLE, 'true')
  }
}

/**
 * Remove TV navigation from an element
 */
export function removeTVFocusable(element: HTMLElement | null) {
  if (element) {
    element.removeAttribute(TV_FOCUSABLE)
  }
}

/**
 * Check if element is TV focusable
 */
export function isTVFocusable(element: HTMLElement | null): boolean {
  return element?.hasAttribute(TV_FOCUSABLE) ?? false
}

/**
 * Get all TV focusable elements
 */
export function getTVFocusableElements(): HTMLElement[] {
  return Array.from(document.querySelectorAll(`[${TV_FOCUSABLE}]`))
}

/**
 * Focus next TV focusable element
 */
export function focusNextTVElement() {
  const elements = getTVFocusableElements()
  const focused = document.activeElement as HTMLElement
  const currentIndex = elements.indexOf(focused)
  const nextIndex = (currentIndex + 1) % elements.length
  elements[nextIndex]?.focus()
}

/**
 * Focus previous TV focusable element
 */
export function focusPreviousTVElement() {
  const elements = getTVFocusableElements()
  const focused = document.activeElement as HTMLElement
  const currentIndex = elements.indexOf(focused)
  const prevIndex = currentIndex === 0 ? elements.length - 1 : currentIndex - 1
  elements[prevIndex]?.focus()
}

/**
 * Simulate Enter key press on focused element
 */
export function pressFocusedElement() {
  const focused = document.activeElement as HTMLElement
  if (focused) {
    focused.click()
  }
}

/**
 * TV Navigation configuration
 */
export const TV_NAV_CONFIG = {
  focusClass: 'tv-focused',
  hintClass: 'tv-navigation-hint',
  gridClass: 'tv-grid',
  buttonClass: 'tv-button',
  cardClass: 'tv-card',
  scrollClass: 'tv-scroll-container'
}