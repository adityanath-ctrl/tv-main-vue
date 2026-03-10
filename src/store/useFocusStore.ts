import { defineStore } from 'pinia';

export type FocusSection = 'sidebar' | 'slider' | 'row' | 'epg' | 'hamburger' | 'topbar';

export const useFocusStore = defineStore('focusStore', {
    state: () => ({
        activeSection: 'slider' as FocusSection,
        activeRowIndex: -1, // -1 means no row focused (maybe slider is focused)
        activeCardIndex: 0,
        sliderButtonIndex: 0,
        sidebarIndex: 0,
        hamburgerIndex: 0,
        topbarIndex: 0,
        // EPG specific
        epgChannelIndex: 0,
        epgProgramIndex: 0,
    }),
    actions: {
        setFocusSection(section: FocusSection) {
            this.activeSection = section;
        },
        setSidebarIndex(index: number) {
            this.sidebarIndex = index;
        },
        setHamburgerIndex(index: number) {
            this.hamburgerIndex = index;
        },
        setTopbarIndex(index: number) {
            this.topbarIndex = index;
        },
        // Navigation helpers
        navigateToHamburger() {
            this.activeSection = 'hamburger';
            this.hamburgerIndex = 0;
        },
        navigateToSidebar() {
            this.activeSection = 'sidebar';
            this.sidebarIndex = 0;
        },
        navigateToSlider() {
            this.activeSection = 'slider';
            this.sliderButtonIndex = 0;
        },
        navigateToContent() {
            this.activeSection = 'row';
            this.activeRowIndex = 0;
            this.activeCardIndex = 0;
        },
        navigateToEPG() {
            this.activeSection = 'epg';
            this.epgChannelIndex = 0;
            this.epgProgramIndex = -1;
        }
    }
});
