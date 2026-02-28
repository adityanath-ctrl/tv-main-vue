// src/views/PostLogout.vue
<template>
  <div class="post-logout-container">
    <p v-if="isLoading">Finalizing logout...</p>
    <p v-else>You have been logged out. Redirecting...</p>
    <!-- Optional: Add a Vuetify spinner -->
    <!-- <v-progress-circular indeterminate color="primary" v-if="isLoading"></v-progress-circular> -->
  </div>
</template>

<script setup>
import { onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import useAuthStore from '@/store/useAuthStore';

const router = useRouter();
const authStore = useAuthStore();

const isLoading = computed(() => authStore.getLoadingState);

onMounted(() => {
  console.log("PostLogout.vue: Mounted. Current auth state:", JSON.parse(JSON.stringify(authStore.getAuth)));

  // The main.ts -> initializeAuthFromStorageOrGuest flow should have been triggered
  // on page load because authStore.logoutUser() set auth.loggedIn = false,
  // which was persisted. initializeAuthFromStorageOrGuest will then reset to guest
  // and fetch a guest token.

  // We wait for the authStore to finish its loading/initialization process.
  if (isLoading.value) {
    const unsubscribe = watch(isLoading, (newIsLoadingValue) => {
      if (!newIsLoadingValue) {
        console.log("PostLogout.vue: Auth store finished loading (is now guest). Navigating to home ('/').");
        router.push('/');
        if (unsubscribe) unsubscribe(); // Clean up the watcher
      }
    }, { immediate: false }); // immediate: false, because we want to react to change from true to false
  } else {
    // If authStore is somehow already not loading (e.g., initialization was super fast or already guest)
    console.log("PostLogout.vue: Auth store not loading. Navigating to home ('/') immediately.");
    router.push('/');
  }

  // Any MSAL-specific cleanup like clearing its internal cache for the account
  // should have been handled by msalInstance.logoutRedirect() or by MSAL itself.
  // We should not need to manually clear MSAL related items from localStorage here,
  // as msalInstance.logoutRedirect() is designed to handle B2C session termination.
});

// The navigationStateChange function was present in your original template's @click,
// but its definition was missing. If it's for a global navigation store,
// you can add it back if needed, though clicking the container might not be typical.
// Example:
// import useNavigationStore from '@/store/useNavigationStore';
// const navigationStore = useNavigationStore();
// const navigationStateChange = () => {
//   navigationStore.changeNavigationState(!navigationStore.getNavigationState);
// };
</script>

<style scoped>
.post-logout-container {
  display: flex;
  flex-direction: column; /* Stack text and potential spinner */
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.2rem;
  text-align: center;
  padding: 20px;
}
</style>