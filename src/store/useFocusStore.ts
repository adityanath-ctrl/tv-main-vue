import { defineStore } from 'pinia';

export type FocusSection = 'sidebar' | 'slider' | 'row' | 'epg';

export const useFocusStore = defineStore('focusStore', {
    state: () => ({
        activeSection: 'slider' as FocusSection,
        activeRowIndex: -1, // -1 means no row focused (maybe slider is focused)
        activeCardIndex: 0,
        sliderButtonIndex: 0,
        sidebarIndex: 0,
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
        }
    }
});
