import { webOSFocusManager } from '@/utils/webosFocusManager';

class CustomSpatialNavigation {
    private FOCUSABLE_SELECTOR = '.focusable-item:not([disabled]):not(.swiper-slide-duplicate *), .v-btn:not([disabled]):not(.swiper-slide-duplicate *), .v-list-item:not([disabled]), .v-tab:not([disabled]), input:not([disabled]), button:not([disabled]), a:not([disabled]), .rmp-button:not([disabled])';
    
    private observer: MutationObserver | null = null;
    
    init() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        this.makeFocusable();
        
        setTimeout(() => {
            if (!document.activeElement || document.activeElement === document.body) {
                const els = this.getVisibleFocusableElements();
                if (els.length > 0) els[0].focus();
            }
        }, 1000);

        this.observer = new MutationObserver(() => {
            this.makeFocusable();
        });
        
        this.observer.observe(document.body, { 
            childList: true, 
            subtree: true, 
            attributes: true, 
            attributeFilter: ['class', 'disabled', 'style'] 
        });
    }

    makeFocusable() {
        const els = document.querySelectorAll(this.FOCUSABLE_SELECTOR);
        els.forEach((el: any) => {
            if (el.tabIndex === -1 && !el.hasAttribute('disabled')) {
                el.tabIndex = 0;
            }
        });
    }

    getVisibleFocusableElements(): HTMLElement[] {
        const els = Array.from(document.querySelectorAll(this.FOCUSABLE_SELECTOR)) as HTMLElement[];
        return els.filter(el => {
            if (el.hasAttribute('disabled')) return false;
            const rect = el.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return false;
            const style = window.getComputedStyle(el);
            if (style.visibility === 'hidden' || style.opacity === '0' || style.display === 'none') return false;
            return true;
        });
    }

    handleKeyDown(e: KeyboardEvent) {
        const key = e.keyCode || e.which;

        // Enter Key
        if (key === 13) {
            const activeEl = document.activeElement as HTMLElement | null;
            if (activeEl) {
                const tag = activeEl.tagName.toUpperCase();
                if (tag !== 'BUTTON' && tag !== 'A' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
                    e.preventDefault();
                    activeEl.click();
                }
            }
            return;
        }

        // WebOS Back Keys
        if (key === 461 || key === 10009) {
            e.preventDefault();
            window.history.back();
            return;
        }

        // Direction mapping
        let dir: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN' | null = null;
        if (key === 37) dir = 'LEFT';
        if (key === 38) dir = 'UP';
        if (key === 39) dir = 'RIGHT';
        if (key === 40) dir = 'DOWN';

        if (dir) {
            const activeEl = document.activeElement as HTMLElement | null;
            
            // If nothing is focused, pick first
            if (!activeEl || activeEl === document.body) {
                e.preventDefault();
                const els = this.getVisibleFocusableElements();
                if (els.length > 0) {
                    els[0].focus();
                    els[0].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                }
                return;
            }

            e.preventDefault();
            e.stopPropagation();
            this.navigate(activeEl, dir);
        }
    }

    navigate(currentEl: HTMLElement, dir: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN') {
        const els = this.getVisibleFocusableElements();
        let currentRect = currentEl.getBoundingClientRect();
        
        // Edge case: if current element is no longer visible in DOM realistically
        if (currentRect.width === 0 || currentRect.height === 0) {
            // Re-focus first element if current is gone
            if (els.length > 0) els[0].focus();
            return;
        }

        let bestEl: HTMLElement | null = null;
        let bestScore = Infinity;

        for (const el of els) {
            if (el === currentEl) continue;
            const rect = el.getBoundingClientRect();

            let mainDist = 0;
            let crossDist = 0;
            let isCorrectDir = false;

            const xOverlap = Math.max(0, Math.min(currentRect.right, rect.right) - Math.max(currentRect.left, rect.left));
            const yOverlap = Math.max(0, Math.min(currentRect.bottom, rect.bottom) - Math.max(currentRect.top, rect.top));

            const c1 = { x: currentRect.left + currentRect.width / 2, y: currentRect.top + currentRect.height / 2 };
            const c2 = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };

            switch (dir) {
                case 'LEFT':
                    isCorrectDir = c2.x < c1.x;
                    if (isCorrectDir && rect.left >= currentRect.right - 1) isCorrectDir = false;
                    
                    mainDist = currentRect.left - rect.right;
                    if (mainDist < 0) mainDist = Math.abs(c1.x - c2.x);
                    crossDist = yOverlap > 0 ? 0 : Math.min(Math.abs(currentRect.top - rect.bottom), Math.abs(currentRect.bottom - rect.top));
                    break;
                case 'RIGHT':
                    isCorrectDir = c2.x > c1.x;
                    if (isCorrectDir && rect.right <= currentRect.left + 1) isCorrectDir = false;

                    mainDist = rect.left - currentRect.right;
                    if (mainDist < 0) mainDist = Math.abs(c1.x - c2.x);
                    crossDist = yOverlap > 0 ? 0 : Math.min(Math.abs(currentRect.top - rect.bottom), Math.abs(currentRect.bottom - rect.top));
                    break;
                case 'UP':
                    isCorrectDir = c2.y < c1.y;
                    if (isCorrectDir && rect.top >= currentRect.bottom - 1) isCorrectDir = false;

                    mainDist = currentRect.top - rect.bottom;
                    if (mainDist < 0) mainDist = Math.abs(c1.y - c2.y);
                    crossDist = xOverlap > 0 ? 0 : Math.min(Math.abs(currentRect.left - rect.right), Math.abs(currentRect.right - rect.left));
                    break;
                case 'DOWN':
                    isCorrectDir = c2.y > c1.y;
                    if (isCorrectDir && rect.bottom <= currentRect.top + 1) isCorrectDir = false;

                    mainDist = rect.top - currentRect.bottom;
                    if (mainDist < 0) mainDist = Math.abs(c1.y - c2.y);
                    crossDist = xOverlap > 0 ? 0 : Math.min(Math.abs(currentRect.left - rect.right), Math.abs(currentRect.right - rect.left));
                    break;
            }

            if (!isCorrectDir) continue;

            // Score calculation
            // base center-to-center distance helps tiebreak and ensure we pick nearest physical element
            let centerDistance = Math.abs(c1.y - c2.y) + Math.abs(c1.x - c2.x);
            
            // Score formula:
            // 1. mainDist is the most important for overlapping elements
            // 2. crossDist has a massive penalty because we prefer elements that intersect the orthogonal "beam"
            let score = mainDist + (crossDist * 10000) + centerDistance;

            if (score < bestScore) {
                bestScore = score;
                bestEl = el;
            }
        }

        if (bestEl) {
            bestEl.focus();
            bestEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            
            // Dispatch sn:focused for compatibility with existing components
            const evt = new CustomEvent('sn:focused', { bubbles: true });
            bestEl.dispatchEvent(evt);
        }
    }
}

export const customNavigation = new CustomSpatialNavigation();

export function initTVControls() {
    webOSFocusManager.initialize();
    
    // Fallback stub for legacy spatial navigation to prevent errors
    (window as any).SpatialNavigation = {
        init: () => {},
        clear: () => {},
        add: () => {},
        makeFocusable: () => customNavigation.makeFocusable(),
        focus: () => {
            const els = customNavigation.getVisibleFocusableElements();
            if (els.length > 0 && (!document.activeElement || document.activeElement === document.body)) {
                els[0].focus();
            }
        }
    };

    customNavigation.init();

    if (webOSFocusManager.isWebOSTV()) {
        console.log('WebOS TV detected - Extended custom navigation enabled');
        
        window.addEventListener('webos:colorbutton', (ev: any) => {
            handleColorButtonNavigation(ev.detail.color);
        });
        
        window.addEventListener('webos:infobutton', () => {
            handleInfoButtonNavigation();
        });
    }
}

function handleColorButtonNavigation(color: number) {
    const activeElement = document.activeElement as HTMLElement;
    
    switch (color) {
        case 1: // Red
            window.history.back();
            break;
        case 2: // Green
            if (activeElement) activeElement.click();
            break;
        case 3: // Yellow
            const epgButton = document.querySelector('[title*="EPG"], [title*="Guide"]') as HTMLElement;
            if (epgButton) epgButton.click();
            break;
        case 4: // Blue
            handleInfoButtonNavigation();
            break;
    }
}

function handleInfoButtonNavigation() {
    const activeElement = document.activeElement as HTMLElement;
    
    if (activeElement && activeElement.classList.contains('program-card')) {
        activeElement.click();
    } else {
        const infoButton = document.querySelector('.info-btn, [title*="Info"], .v-btn--icon') as HTMLElement;
        if (infoButton) infoButton.click();
    }
}
