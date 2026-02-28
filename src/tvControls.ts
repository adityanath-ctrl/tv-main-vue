import SpatialNavigation from 'spatial-navigation-js';

export function initTVControls() {
    SpatialNavigation.init();

    // Clear any default configs and set our specific ones
    SpatialNavigation.clear();

    // Only focus explicit interactive elements to avoid chaos. Reject disabled and duplicated swiper items.
    SpatialNavigation.add({
        selector: '.focusable-item:not([disabled]):not(.swiper-slide-duplicate *), .v-btn:not([disabled]):not(.swiper-slide-duplicate *), .v-list-item:not([disabled]), .v-tab:not([disabled]), input:not([disabled]), button:not([disabled]), a:not([disabled]), .rmp-button:not([disabled])'
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
        }, 150);
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
    });

    // Auto-scroll when focused
    window.addEventListener('sn:focused', (ev) => {
        const target = ev.target as HTMLElement;
        if (!target) return;

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
                    swiperInstance.slideTo(index);
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
}
