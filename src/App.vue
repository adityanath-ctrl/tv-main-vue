<!-- /src/App.vue -->
<template>
  <v-layout @click="bodyClick()" :style="backgroundStyle">
    <TopBar v-if="!shouldHideTopBar" class="py-3" @showModal="onShowModal" @navigationChange="changeNavigationState" />
    <v-main style="--v-layout-left: 0px; --v-layout-top: 0px">
      <NavigationBar v-if="showGlobalNav" />
      <router-view :key="routeFullPath"></router-view>
      <PackagesModal v-if="isShowPackageModal" @disabledDialog="onDisabledDialog"> </PackagesModal>
    </v-main>

    <v-dialog v-model="isPackageStatusPopupVisible" persistent max-width="800px" scrollable>
      <v-card style="background-color: #1f1f1f; color: white; border-radius: 15px;">
        <v-card-title class="d-flex justify-end pa-0">
          <v-btn icon="mdi-close" variant="text" @click="closePackageStatus"></v-btn>
        </v-card-title>
        <v-card-text class="pa-4">
          <!-- The PackageStatus component is rendered inside the dialog -->
          <PackageStatus />
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isEnterCodePopupVisible" persistent max-width="800px" scrollable>
      <v-card style="background-color: transparent; box-shadow: none;">
        <v-card-text class="pa-0">
          <!-- Render the new component, listening for the 'close' event -->
          <EnterCodeFlow @close="closeEnterCodePopup" />
        </v-card-text>
      </v-card>
    </v-dialog>

    <LimitExceededPopup :closePopup="closeLimitExceededPopup" :dialog="limitExceededPopupState"
      v-if="shouldShowLimitExceededPopup" />
  </v-layout>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, reactive, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import NavigationBar from './components/NavigationBar.vue';
import TopBar from './components/TopBar.vue';
import PackagesModal from './components/PackagesModal.vue';
import { BACKGROUND_COLOR_1, SITE_TITLE, HIGHLIGHT_COLOR_1, ONLY_MANAGE_ACCOUNT } from '@/mainConfig';
import useAuthStore from './store/useAuthStore';
import useAccountStore from './store/useAccountStore';
import { useUIStore } from './store/useUIStore';
import PackageStatus from './components/PackageStatus.vue';
import LimitExceededPopup from './components/popups/limitExceededPopup.vue';
import EnterCodeFlow from './components/EnterCodeFlow.vue';
// import { useGlobalKeyboardNavigation } from '@/composition-api/useGlobalKeyboardNavigation'; 
import { useFocusStore } from './store/useFocusStore';

const focusStore = useFocusStore();

// Don't initialize global navigation here to prevent conflicts with existing systems
// const {} = useGlobalKeyboardNavigation();

const route = useRoute();
const authStore = useAuthStore();
const accountStore = useAccountStore();
const uiStore = useUIStore();

const isShowPackageModal = ref(false);
const showNavigationBar = ref(false);
const limitExceededPopup = ref(false);

const backgroundStyle = reactive({
  backgroundColor: BACKGROUND_COLOR_1,
  textAlign: 'center',
});

// This computed property will be true if the current route has the 'hidesGlobalUI' meta flag.
const hidesGlobalUI = computed(() => route.meta.hidesGlobalUI);

const shouldHideTopBar = computed(() => {

  if (hidesGlobalUI.value) return true;
  // Hide the TopBar if the session was started with a token AND the user is on the My Account page.
  return authStore.isTokenLoginSession && ['/my-account', '/manage-devices'].includes(route.path);
});

const routeFullPath = computed(() => route.fullPath);
const accountDataFromStore = computed(() => accountStore.getAccount);
const isLoggedIn = computed(() => authStore.isUserLoggedIn);
const tokenMode = computed(() => authStore.getTokenMode);

const limitExceededPopupState = computed(() => limitExceededPopup.value);
const shouldShowLimitExceededPopup = computed(() => {
  return limitExceededPopup.value && route.path !== '/manage-devices' && route.path !== '/my-account' && route.path !== '/enter-code';
});

const closeLimitExceededPopup = () => {
  limitExceededPopup.value = false;
};

// Computed property to control the dialog's visibility
const isPackageStatusPopupVisible = computed({
  get: () => uiStore.showPackageStatusPopup,
  set: (value) => {
    if (!value) {
      uiStore.closePackageStatusPopup();
    }
  }
});

const closePackageStatus = () => {
  uiStore.closePackageStatusPopup();
};

const isEnterCodePopupVisible = computed({
  get: () => uiStore.showEnterCodePopup,
  set: (value) => { if (!value) uiStore.closeEnterCodePopup(); }
});

const closeEnterCodePopup = () => {
  uiStore.closeEnterCodePopup();
};

watch(
  accountDataFromStore,
  (newAccount) => {
    if (!newAccount) return;
    localStorage.setItem('deviceIp', newAccount.client_ip || '');
    localStorage.setItem('deviceCountry', newAccount.client_country || '');
    localStorage.setItem('userMiddlewareID', newAccount?.account_limits?.user_id || '');

    if (newAccount.status === 429 || newAccount.status === 403) {
      localStorage.setItem('deviceMode', 'device_add_request');
      limitExceededPopup.value = true;
    }
  },
  { deep: true, immediate: true }
);

watch(isLoggedIn, () => { }, { immediate: true });
watch(tokenMode, () => { }, { immediate: true });

onMounted(() => {
  document.title = SITE_TITLE || '';
  window.addEventListener('keydown', handleGlobalKeyDown);
  // Initial authentication is handled by main.ts
  // This watcher is for any App.vue specific logic after store is initially loaded/updated
  watch(() => authStore.getLoadingState, (isLoading) => {
    if (!isLoading) {
      // console.log("App.vue: AuthStore loading complete.");
    }
  }, { immediate: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown);
});

const handleGlobalKeyDown = (e) => {
  // Navigation drawer toggle
  if (e.key === 'm' || e.key === 'M') {
    changeNavigationState(!showNavigationBar.value);
    return;
  }

  // If sidebar is open
  if (showNavigationBar.value) {
    if (e.key === 'ArrowRight') {
      changeNavigationState(false);
      e.preventDefault();
    }
    return;
  }

  // Global transitions (Backup if component doesn't catch it)
  if (e.key === 'ArrowLeft' && !showNavigationBar.value) {
    changeNavigationState(true);
    e.preventDefault();
  }
};

const onShowModal = () => {
  isShowPackageModal.value = true;
};

const onDisabledDialog = (status) => {
  isShowPackageModal.value = status;
};

const bodyClick = () => {
  // showNavigationBar.value = true; // Or other interaction logic
};

const changeNavigationState = (val) => {
  showNavigationBar.value = val;
};

const showGlobalNav = computed(() => {
  if (ONLY_MANAGE_ACCOUNT && route.name === 'StaticHome') return false;
  return true;
});
</script>

<style>
/* Global scrollbar styles */
::-webkit-scrollbar {
  width: 7px;
}

::-webkit-scrollbar-track {
  background: #111111;
}

::-webkit-scrollbar-thumb {
  background: v-bind(HIGHLIGHT_COLOR_1);
  border-radius: 5px;
}

* {
  scrollbar-width: thin;
  scrollbar-color: v-bind(HIGHLIGHT_COLOR_1) #111111;
}
</style>