// src/store/useUIStore.ts
import { defineStore } from 'pinia';

export const useUIStore = defineStore('uiStore', {
  state: () => ({
    showPackageStatusPopup: false,
    showEnterCodePopup: false,
  }),
  actions: {
    openPackageStatusPopup() {
      this.showPackageStatusPopup = true;
    },
    closePackageStatusPopup() {
      this.showPackageStatusPopup = false;
    },
        openEnterCodePopup() { // <-- ADD THIS
      this.showEnterCodePopup = true;
    },
    closeEnterCodePopup() { // <-- ADD THIS
      this.showEnterCodePopup = false;
    },
  },
});