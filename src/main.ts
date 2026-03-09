// src/main.ts

import './assets/global.css';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router/router';
import { vuetify } from './plugins/vuetify';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { msalPlugin } from './plugins/msalPlugin';
import { msalInstance } from './mainConfig'; // Ensure this exports your configured msalInstance
import { EventType, type AuthenticationResult } from '@azure/msal-browser';
import { CustomNavigationClient } from './router/NavigationClient';
import useAuthStore from './store/useAuthStore';
import { changeTimeFormatEST } from './utils/date';

// ——— GLOBAL SWIPER SETUP ———
import Swiper from 'swiper';
import { Navigation, Pagination, Scrollbar, A11y, Keyboard } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/a11y';
import 'swiper/css/keyboard';

Swiper.use([Navigation, Pagination, Scrollbar, A11y, Keyboard]);
// ———————————————————————

/////// MSAL + router integration //////
const navigationClient = new CustomNavigationClient(router);
msalInstance.setNavigationClient(navigationClient);

msalInstance.addEventCallback(evt => {
  if (evt.eventType === EventType.LOGIN_SUCCESS && evt.payload) {
    const authResult = evt.payload as AuthenticationResult;
    msalInstance.setActiveAccount(authResult.account);
  } else if (evt.eventType === EventType.ACCOUNT_ADDED && evt.payload) {
    const currentAccounts = msalInstance.getAllAccounts();
    if (currentAccounts.length > 0 && !msalInstance.getActiveAccount()) {
      msalInstance.setActiveAccount(currentAccounts[0]);
    }
  }
});
const accounts = msalInstance.getAllAccounts();
if (accounts.length > 0) {
  msalInstance.setActiveAccount(accounts[0]);
}
// ———————————————————————

const app = createApp(App);
app.config.globalProperties.$filters = {
  formattedDate: (d: string) => changeTimeFormatEST(d),
};

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

const authStore = useAuthStore();

app.use(vuetify);
app.use(router);
app.use(msalPlugin, msalInstance);

async function initializeAppAuthentication() {
  authStore.setMsalInstance(msalInstance);

  // Check the URL for the special 'token' parameter BEFORE any other auth logic.
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get('token');

  if (tokenFromUrl) {
    console.log("main.ts: Token found in URL. Initiating token-based login.");
    // A token was found. Use our special action to log in with it.
    await authStore.processTokenLogin(tokenFromUrl);

    // After processing, remove the token from the URL for security and cleanliness.
    // This prevents it from being re-processed on a refresh.
    window.history.replaceState(null, '', window.location.pathname);
    return; // Stop further execution of this function
  }

  if (typeof msalInstance.initialize === 'function') {
    await msalInstance.initialize();
  }

  try {
    const response = await msalInstance.handleRedirectPromise();
    if (response) {
      console.log("main.ts: MSAL redirect successful, processing login.");
      await authStore.processMsalLoginSuccess(response);
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } else {
      console.log("main.ts: No MSAL redirect, initializing from storage or guest.");
      await authStore.initializeAuthFromStorageOrGuest();
    }
  } catch (error) {
    console.error("main.ts: Error during MSAL handleRedirectPromise or auth initialization:", error);
    await authStore.initializeAuthFromStorageOrGuest();
  }
}


router.isReady().then(async () => {
  await initializeAppAuthentication();
  app.mount('#app');

});