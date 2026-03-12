/**
 * v-tv-focusable directive
 * Makes an element navigatable with TV remote (arrow keys + enter)
 * 
 * Usage:
 * <button v-tv-focusable>Click me</button>
 */

export const vTVFocusable = {
  mounted(el: HTMLElement) {
    // Simply add the focusable attribute
    el.setAttribute('data-tv-focusable', 'true')
    
    // Add tabindex if not present
    if (!el.hasAttribute('tabindex')) {
      el.setAttribute('tabindex', '0')
    }
  },

  unmounted(el: HTMLElement) {
    el.removeAttribute('data-tv-focusable')
  }
}