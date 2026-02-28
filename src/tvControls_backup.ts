import SpatialNavigation from 'spatial-navigation-js';
import { webOSFocusManager } from '@/utils/webosFocusManager';

export function initTVControls() {
    // Initialize WebOS focus manager first
    webOSFocusManager.initialize();
    
    SpatialNavigation.init();

    // Clear any default configs and set our specific ones
    SpatialNavigation.clear();

    // Only focus explicit interactive elements to avoid chaos. Reject disabled and duplicated swiper items.
    SpatialNavigation.add({
        selector: '.focusable-item:not([disabled]):not(.swiper-slide-duplicate *), .v-btn:not([disabled]):not(.swiper-slide-duplicate *), .v-list-item:not([disabled]), .v-tab:not([disabled]), input:not([disabled]), button:not([disabled]), a:not([disabled]), .rmp-button:not([disabled])',
        // WebOS TV optimized settings
        straightOnly: false,
        straightOverlapThreshold: 0.3, // Lower threshold to prevent skipping
        rememberSource: true,
        disabled: false,
        defaultElement: '',
        enterTo: 'last-focused',
        leaveFor: null,
        restrict: 'self-first',
        tabIndexIgnoreList: 'a:not([tabindex]), input:not([tabindex]), button:not([tabindex]), select:not([tabindex]), textarea:not([tabindex])',
        // Additional WebOS specific settings
        navigationDelay: 100, // Add small delay to prevent rapid skipping
        pauseForVideo: true, // Pause navigation when video is playing
        noHover: true // Disable hover effects for TV
    });

    // Special configuration for EPG grid to prevent skipping
    SpatialNavigation.add({
        selector: '.program-card.focusable-item',
        // EPG specific settings for better grid navigation
        straightOnly: false,
        straightOverlapThreshold: 0.1, // Very low threshold for EPG
        rememberSource: true,
        disabled: false,
        defaultElement: '',
        enterTo: 'last-focused',
        leaveFor: null,
        restrict: 'self-first',
        // EPG specific navigation settings
        navigationDelay: 150, // Slightly longer delay for EPG
        noHover: true
    });

    // Special configuration for MediaPlayer controls
    SpatialNavigation.add({
        selector: '.tab-button.focusable-item, .rmp-button.focusable-item, .v-btn.focusable-item',
        // MediaPlayer specific settings
        straightOnly: true, // Linear navigation for media controls
        straightOverlapThreshold: 0.5,
        rememberSource: true,
        disabled: false,
        defaultElement: '',
        enterTo: 'last-focused',
        leaveFor: null,
        restrict: 'self-first',
        navigationDelay: 80,
        noHover: true
    });

    SpatialNavigation.makeFocusable();

    setTimeout(() => {
        SpatialNavigation.focus();
    }, 1000);

    // Debounced MutationObserver to handle dynamic Vue components efficiently
    let layoutTimeout: any;
    const observer = new MutationObserver(() => {
        if (layoutTimeout) clearTimeout(layoutTimeout);
        layoutTimeout = setTimeout(() => {
            SpatialNavigation.makeFocusable();
            // Re-initialize focus for dynamic content
            setTimeout(() => {
                SpatialNavigation.focus();
            }, 50);
        }, 300); // Increased delay for slower dynamic content
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'disabled']
    });

    // Listeners
    window.addEventListener('keydown', (e) => {
        const key = e.keyCode || e.which;
        // Enter Key -> Force Click Event for custom Divs that don't trigger natively
        if (key === 13) {
            const activeEl = document.activeElement as HTMLElement | null;
            if (activeEl) {
                const tag = activeEl.tagName.toUpperCase();
                if (tag !== 'BUTTON' && tag !== 'A' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
                    e.preventDefault();
                    activeEl.click();
                }
            }
        }
        // WebOS Back Keys (461 = standard, 10009 = some LGs)
        if (key === 461 || key === 10009) {
            e.preventDefault();
            window.history.back();
        }
        
        // Enhanced navigation for EPG grid
        if (key >= 37 && key <= 40) { // Arrow keys
            const activeEl = document.activeElement as HTMLElement;
            if (activeEl && activeEl.classList.contains('program-card')) {
                handleEPGNavigation(key, activeEl);
            }
        }
    });

    // Auto-scroll when focused
    window.addEventListener('sn:focused', (ev) => {
        const target = ev.target as HTMLElement;
        if (!target) return;

        // Special handling for MediaPlayer tabs and controls
        if (target.closest('.custom-tabs, .tab-button')) {
            handleMediaPlayerTabFocus(target);
        }
        
        // Special handling for media player controls
        if (target.closest('.rmp-button, .v-btn')) {
            handleMediaPlayerControlFocus(target);
        }

        // Provide Swiper bridge if inside a carousel
        const slide = target.closest('.swiper-slide');
        if (slide) {
            const swiperEl = target.closest('.swiper') as any;

            // Try resolving the Vue Swiper component instance
            const swiperInstance = swiperEl?.swiper || swiperEl?.__vue__?.swiper || swiperEl?.__vueParentComponent?.ctx?.swiperInstance;

            if (swiperInstance && typeof swiperInstance.slideTo === 'function') {
                // The swiper structure: .swiper > .swiper-wrapper > .swiper-slide
                const wrapper = slide.parentNode;
                if (wrapper) {
                    const index = Array.from(wrapper.children).indexOf(slide);
                    // Ensure slide is visible before focusing
                    swiperInstance.slideTo(index, 300);
                    // Wait for slide animation to complete
                    setTimeout(() => {
                        target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                    }, 350);
                }
            } else {
                // Fallback native scroll
                target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
        } else {
            // Scroll normal elements into view cleanly
            target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        }
    });

    // Handle menu navigation for dynamic content
    window.addEventListener('sn:willunfocus', (ev) => {
        const target = ev.target as HTMLElement;
        if (target && target.classList.contains('focusable-item')) {
            // Store current focus context for potential restoration
            (window as any).lastFocusedElement = target;
        }
    });

    // Add WebOS specific enhancements
    if (webOSFocusManager.isWebOSTV()) {
        console.log('WebOS TV detected - Enhanced navigation enabled');
        
        // Add additional WebOS specific navigation improvements
        window.addEventListener('webos:colorbutton', (ev: any) => {
            // Handle color button presses for enhanced navigation
            console.log('WebOS color button pressed:', ev.detail.color);
            handleColorButtonNavigation(ev.detail.color);
        });
        
        window.addEventListener('webos:infobutton', () => {
            // Handle info button press
            console.log('WebOS info button pressed');
            handleInfoButtonNavigation();
        });
    }
}

// Enhanced EPG navigation handler
function handleEPGNavigation(key: number, currentElement: HTMLElement) {
    const epgContainer = currentElement.closest('.epg-scroller');
    if (!epgContainer) return;
    
    const allProgramCards = epgContainer.querySelectorAll('.program-card') as NodeListOf<HTMLElement>;
    const currentIndex = Array.from(allProgramCards).indexOf(currentElement);
    
    if (currentIndex === -1) return;
    
    let nextIndex = currentIndex;
    let found = false;
    
    // Get current element's position for better navigation
    const currentRect = currentElement.getBoundingClientRect();
    const currentTop = currentRect.top;
    const currentLeft = currentRect.left;
    
    switch (key) {
        case 37: // Left - Find previous program in same row
            for (let i = currentIndex - 1; i >= 0; i--) {
                const rect = allProgramCards[i].getBoundingClientRect();
                if (Math.abs(rect.top - currentTop) < 30) { // Same row tolerance
                    nextIndex = i;
                    found = true;
                    break;
                }
            }
            break;
            
        case 39: // Right - Find next program in same row
            for (let i = currentIndex + 1; i < allProgramCards.length; i++) {
                const rect = allProgramCards[i].getBoundingClientRect();
                if (Math.abs(rect.top - currentTop) < 30) { // Same row tolerance
                    nextIndex = i;
                    found = true;
                    break;
                }
            }
            break;
            
        case 38: // Up - Find program above
            for (let i = currentIndex - 1; i >= 0; i--) {
                const rect = allProgramCards[i].getBoundingClientRect();
                if (rect.top < currentTop - 20 && Math.abs(rect.left - currentLeft) < 100) {
                    nextIndex = i;
                    found = true;
                    break;
                }
            }
            break;
            
        case 40: // Down - Find program below
            for (let i = currentIndex + 1; i < allProgramCards.length; i++) {
                const rect = allProgramCards[i].getBoundingClientRect();
                if (rect.top > currentTop + 20 && Math.abs(rect.left - currentLeft) < 100) {
                    nextIndex = i;
                    found = true;
                    break;
                }
            }
            break;
    }
    
    if (found && nextIndex !== currentIndex && allProgramCards[nextIndex]) {
        // Prevent default spatial navigation by calling preventDefault on the event
        const event = window.event as KeyboardEvent;
        if (event) {
            event.preventDefault();
        }
        
        // Focus the next element and scroll into view
        allProgramCards[nextIndex].focus();
        allProgramCards[nextIndex].scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest', 
            inline: 'nearest' 
        });
    }
}

// Color button navigation for enhanced TV control
function handleColorButtonNavigation(color: number) {
    const activeElement = document.activeElement as HTMLElement;
    
    switch (color) {
        case 1: // Red - Often used for back/exit
            window.history.back();
            break;
        case 2: // Green - Often used for action/select
            if (activeElement) {
                activeElement.click();
            }
            break;
        case 3: // Yellow - Often used for menu/guide
            // Toggle EPG guide if available
            const epgButton = document.querySelector('[title*="EPG"], [title*="Guide"]') as HTMLElement;
            if (epgButton) {
                epgButton.click();
            }
            break;
        case 4: // Blue - Often used for info/details
            handleInfoButtonNavigation();
            break;
    }
}

// Info button navigation handler
function handleInfoButtonNavigation() {
    const activeElement = document.activeElement as HTMLElement;
    
    // If focused on a program card, show more info
    if (activeElement && activeElement.classList.contains('program-card')) {
        // Trigger info display for the current program
        const infoButton = activeElement.querySelector('.program-info') as HTMLElement;
        if (infoButton) {
            infoButton.click();
        } else {
            // Fallback: click the program card itself to show details
            activeElement.click();
        }
    } else {
        // Try to find and click an info button in the current view
        const infoButton = document.querySelector('.info-btn, [title*="Info"], .v-btn--icon') as HTMLElement;
        if (infoButton) {
            infoButton.click();
        }
    }
}

// MediaPlayer tab focus handler
function handleMediaPlayerTabFocus(target: HTMLElement) {
    const tabContainer = target.closest('.custom-tabs');
    if (!tabContainer) return;
    
    // Ensure all tabs are properly focused and visible
    const allTabs = tabContainer.querySelectorAll('.tab-button') as NodeListOf<HTMLElement>;
    allTabs.forEach(tab => {
        if (tab === target) {
            // Add visual indication for active tab
            tab.style.outline = '3px solid #BB2025';
            tab.style.outlineOffset = '-2px';
        } else {
            // Remove outline from other tabs
            tab.style.outline = 'none';
        }
    });
    
    // Scroll tab into view if needed
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

// MediaPlayer control focus handler
function handleMediaPlayerControlFocus(target: HTMLElement) {
    // Ensure media player controls are properly visible
    const mediaPlayer = target.closest('#rmp-container, .media-player');
    if (!mediaPlayer) return;
    
    // Add visual indication for focused control
    target.style.outline = '3px solid #BB2025';
    target.style.outlineOffset = '-2px';
    
    // Ensure the control is visible and not obscured
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    
    // Special handling for play/pause button
    if (target.classList.contains('rmp-play-pause') || target.textContent?.includes('Play')) {
        // Ensure video controls are visible
        const controlsContainer = mediaPlayer.querySelector('.rmp-controls, .v-controls') as HTMLElement;
        if (controlsContainer) {
            controlsContainer.style.opacity = '1';
            controlsContainer.style.visibility = 'visible';
        }
    }
}
