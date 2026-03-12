<template>
  <div class="tv-navigation-provider">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useTVNavigation } from '@/composables/useTVNavigation'

// Use the improved TV navigation everywhere
useTVNavigation({
  autoEnable: true,
  preventScroll: true,
})
</script>

<style>
/* ── Core focus style ─────────────────────────────────── */
.tv-focused {
  outline: 3px solid #27AAE1 !important;
  outline-offset: 3px !important;
  box-shadow: 0 0 0 3px rgba(39, 170, 225, 0.3) !important;
  transform: scale(1.02) !important;
  transition: all 0.2s ease !important;
  z-index: 1000 !important;
  position: relative !important;
}

/* Remove default browser focus styles */
[data-tv-focusable]:focus {
  outline: none !important;
}

/* Style for buttons when focused */
[data-tv-focusable].tv-focused {
  background-color: rgba(39, 170, 225, 0.1) !important;
}

/* Style for cards when focused */
[data-tv-focusable].tv-focused.v-card {
  border-color: #27AAE1 !important;
}

/* Style for navigation items when focused */
[data-tv-focusable].tv-focused.v-list-item {
  background-color: rgba(39, 170, 225, 0.2) !important;
}

/* Style for menu items when focused */
[data-tv-focusable].tv-focused.v-btn {
  background-color: rgba(39, 170, 225, 0.2) !important;
}

/* Style for dropdown selects when focused */
[data-tv-focusable].tv-focused.v-select,
[data-tv-focusable].tv-focused .v-field {
  border: 2px solid #27AAE1 !important;
  border-radius: 8px !important;
  box-shadow: 0 0 0 3px rgba(39, 170, 225, 0.3) !important;
}

/* ── Player overlay controls focus ─────────────────────── */
.player-tv-control.tv-focused {
  background-color: rgba(39, 170, 225, 0.6) !important;
  transform: scale(1.2) !important;
  box-shadow: 0 0 15px rgba(39, 170, 225, 0.8) !important;
}

/* Ensure focus is visible on all elements */
*:focus {
  outline: none !important;
}
</style>