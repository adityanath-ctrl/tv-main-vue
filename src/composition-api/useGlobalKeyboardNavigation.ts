import { computed, onMounted, onBeforeUnmount } from 'vue';
import { useFocusStore } from '@/store/useFocusStore';
import useNavigationStore from '@/store/useNavigationStore';

export function useGlobalKeyboardNavigation() {
    const focusStore = useFocusStore();
    const navigationStore = useNavigationStore();

    // Computed properties for navigation state
    const isHamburgerFocused = computed(() => focusStore.activeSection === 'hamburger');
    const isSidebarFocused = computed(() => focusStore.activeSection === 'sidebar');
    const isSliderFocused = computed(() => focusStore.activeSection === 'slider');
    const isRowFocused = computed(() => focusStore.activeSection === 'row');
    const isEPGFocused = computed(() => focusStore.activeSection === 'epg');
    const isTopbarFocused = computed(() => focusStore.activeSection === 'topbar');

    function handleKeyDown(e: KeyboardEvent) {
        console.log('Global navigation handling key:', e.key, 'Current section:', focusStore.activeSection);
        
        // Don't interfere with input fields, text areas, etc.
        const activeElement = document.activeElement;
        if (activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.tagName === 'SELECT' ||
            (activeElement as HTMLElement).contentEditable === 'true'
        )) {
            return;
        }

        // Handle only global navigation patterns, let components handle their own specific navigation
        if (e.key === 'Escape' || e.key === 'Backspace') {
            handleBackNavigation();
            return;
        }

        // Handle hamburger menu specific navigation
        if (focusStore.activeSection === 'hamburger') {
            if (e.key === 'Enter') {
                const hamburgerEl = document.getElementById('menu_flat_icon');
                if (hamburgerEl) {
                    hamburgerEl.click();
                    focusStore.navigateToSidebar();
                }
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                navigationStore.changeNavigationState(false);
                focusStore.navigateToSlider();
                e.preventDefault();
            } else if (e.key === 'ArrowDown') {
                focusStore.navigateToSlider();
                e.preventDefault();
            }
            return;
        }

        // Handle sidebar specific navigation when it's focused
        if (focusStore.activeSection === 'sidebar' && navigationStore.getNavigationState) {
            if (e.key === 'ArrowRight') {
                navigationStore.changeNavigationState(false);
                focusStore.navigateToSlider();
                e.preventDefault();
            }
            return;
        }

        // Handle EPG specific back navigation
        if (focusStore.activeSection === 'epg') {
            if (e.key === 'ArrowLeft') {
                // Check if we're at the leftmost position
                const epgProgramIndex = focusStore.epgProgramIndex;
                if (epgProgramIndex <= -1) {
                    focusStore.navigateToHamburger();
                    e.preventDefault();
                }
            } else if (e.key === 'Escape') {
                focusStore.navigateToHamburger();
                e.preventDefault();
            }
            return;
        }

        // For other sections, let the existing component handlers take care of navigation
        // Don't prevent default to allow existing navigation to work
    }

    function handleBackNavigation() {
        console.log('Back navigation from section:', focusStore.activeSection);
        
        // Navigate back through the hierarchy
        if (focusStore.activeSection === 'row') {
            focusStore.navigateToSlider();
        } else if (focusStore.activeSection === 'epg') {
            focusStore.navigateToHamburger();
        } else if (focusStore.activeSection === 'sidebar') {
            navigationStore.changeNavigationState(false);
            focusStore.navigateToHamburger();
        } else if (focusStore.activeSection === 'slider') {
            focusStore.navigateToHamburger();
        }
    }

    // Initialize keyboard navigation
    onMounted(() => {
        console.log('Global keyboard navigation initialized');
        window.addEventListener('keydown', handleKeyDown);
        // Don't set initial focus immediately - let existing navigation handle it
    });

    onBeforeUnmount(() => {
        window.removeEventListener('keydown', handleKeyDown);
    });

    return {
        isHamburgerFocused,
        isSidebarFocused,
        isSliderFocused,
        isRowFocused,
        isEPGFocused,
        isTopbarFocused,
        focusStore
    };
}
