/**
 * WebOS TV Focus Management Utilities
 * Helps with proper focus handling for dynamic content and spatial navigation
 */

export class WebOSFocusManager {
  private static instance: WebOSFocusManager;
  private focusHistory: HTMLElement[] = [];
  private isInitialized = false;

  static getInstance(): WebOSFocusManager {
    if (!WebOSFocusManager.instance) {
      WebOSFocusManager.instance = new WebOSFocusManager();
    }
    return WebOSFocusManager.instance;
  }

  initialize() {
    if (this.isInitialized) return;
    
    // Add WebOS specific key handling
    window.addEventListener('keydown', this.handleWebOSKeys.bind(this));
    
    // Add focus tracking
    window.addEventListener('sn:focused', this.trackFocus.bind(this));
    
    this.isInitialized = true;
  }

  private handleWebOSKeys(event: KeyboardEvent) {
    const key = event.keyCode || event.which;
    
    // Additional WebOS specific key codes
    switch (key) {
      case 403: // Red button
      case 404: // Green button
      case 405: // Yellow button
      case 406: // Blue button
        event.preventDefault();
        this.handleColorButton(key - 402); // 1=Red, 2=Green, 3=Yellow, 4=Blue
        break;
      case 457: // Info button
        event.preventDefault();
        this.handleInfoButton();
        break;
    }
  }

  private handleColorButton(color: number) {
    // Emit custom event for color button handling
    window.dispatchEvent(new CustomEvent('webos:colorbutton', { 
      detail: { color } 
    }));
  }

  private handleInfoButton() {
    // Emit custom event for info button handling
    window.dispatchEvent(new CustomEvent('webos:infobutton'));
  }

  private trackFocus(event: Event) {
    const target = event.target as HTMLElement;
    if (target && target.classList.contains('focusable-item')) {
      this.focusHistory.push(target);
      // Keep only last 10 focused elements
      if (this.focusHistory.length > 10) {
        this.focusHistory.shift();
      }
    }
  }

  /**
   * Restore focus to the last focused element within a container
   */
  restoreFocus(container?: Element) {
    const searchArea = container || document.body;
    const focusableElements = searchArea.querySelectorAll('.focusable-item') as NodeListOf<HTMLElement>;
    
    if (focusableElements.length === 0) return;

    // Try to find the last focused element in this container
    const lastFocused = this.focusHistory
      .slice()
      .reverse()
      .find(el => searchArea.contains(el));

    if (lastFocused) {
      lastFocused.focus();
    } else {
      // Fallback to first focusable element
      focusableElements[0].focus();
    }
  }

  /**
   * Set focus to a specific element with proper scrolling
   */
  setFocusWithScroll(element: HTMLElement, delay = 100) {
    setTimeout(() => {
      element.focus();
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center', 
        inline: 'nearest' 
      });
    }, delay);
  }

  /**
   * Re-initialize spatial navigation for dynamic content
   */
  refreshSpatialNavigation(delay = 50) {
    setTimeout(() => {
      if (window.SpatialNavigation) {
        window.SpatialNavigation.makeFocusable();
        window.SpatialNavigation.focus();
      }
    }, delay);
  }

  /**
   * Handle menu navigation with proper focus management
   */
  navigateMenu(menuItems: HTMLElement[], currentIndex: number, direction: 'up' | 'down' | 'left' | 'right') {
    let newIndex = currentIndex;
    
    switch (direction) {
      case 'down':
        newIndex = Math.min(currentIndex + 1, menuItems.length - 1);
        break;
      case 'up':
        newIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'right':
        // Handle submenu expansion or next menu item
        const currentItem = menuItems[currentIndex];
        const submenu = currentItem.closest('.v-list-group__items');
        if (submenu) {
          const submenuItems = submenu.querySelectorAll('.focusable-item') as NodeListOf<HTMLElement>;
          if (submenuItems.length > 0) {
            this.setFocusWithScroll(submenuItems[0]);
            return;
          }
        }
        break;
      case 'left':
        // Handle menu collapse or previous menu item
        break;
    }

    if (newIndex !== currentIndex && menuItems[newIndex]) {
      this.setFocusWithScroll(menuItems[newIndex]);
    }
  }

  /**
   * Check if current device is WebOS TV
   */
  isWebOSTV(): boolean {
    return /webos|lg|netcast/i.test(navigator.userAgent) || 
           window.webOS || 
           window.PalmSystem;
  }

  /**
   * Get WebOS device info if available
   */
  getWebOSInfo() {
    if (this.isWebOSTV()) {
      return {
        userAgent: navigator.userAgent,
        webOS: window.webOS,
        palmSystem: window.PalmSystem
      };
    }
    return null;
  }
}

// Export singleton instance
export const webOSFocusManager = WebOSFocusManager.getInstance();

// Export types for TypeScript
export type FocusDirection = 'up' | 'down' | 'left' | 'right';
export type WebOSColorButton = 1 | 2 | 3 | 4; // 1=Red, 2=Green, 3=Yellow, 4=Blue
