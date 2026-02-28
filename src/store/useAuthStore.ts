// src/store/useAuthStore.ts

import { defineStore } from 'pinia';
import {
  getGuestToken,
  getConnection,
  getMenuList,
  showUserDevices,
  isTokenExpired,
} from '../utils/siberAPI'; // Ensure this path is correct
import useAccountStore from './useAccountStore';
import useMenuStore from './useMenuStore';
import { loginRequest } from '@/mainConfig'; // Ensure this path is correct
import { PublicClientApplication, type AuthenticationResult } from '@azure/msal-browser';

export interface Auth {
  loggedIn: boolean;
  msalToken: string; // Can be MSAL access token or Guest token
  tokenMode: 'guest' | 'msal_login' | string;
  devices: any[];
  isLoading: boolean;
  isUserVerifiedByEmail: boolean;
  isUserRegistered: boolean;
  msalInstance: PublicClientApplication | null;
  isTokenLoginSession: boolean; // This is used to store if the user is coming from the mobile app and has passed ?token to the url for auto-login. Used to hide the Top Bar
}

export const useAuthStore = defineStore('authStore', {
  state: () => ({
    auth: {
      loggedIn: false,
      msalToken: '',
      tokenMode: 'guest',
      devices: [] as any[],
      isLoading: true, // Start true, set to false after initial auth check
      isUserVerifiedByEmail: false,
      isUserRegistered: false,
      msalInstance: null as PublicClientApplication | null,
      isTokenLoginSession: false,
    } as Auth,
  }),
  getters: {
    isUserLoggedIn: (state) => state.auth.loggedIn,
    getAuth: (state) => state.auth,
    getToken: (state) => state.auth.msalToken,
    getDevices: (state) => state.auth.devices,
    getLoadingState: (state) => state.auth.isLoading,
    getMsalInstance: (state) => state.auth.msalInstance,
    getTokenMode: (state) => state.auth.tokenMode,
    isTokenLoginSession: (state) => state.auth.isTokenLoginSession,
  },
  actions: {
    setMsalInstance(instance: PublicClientApplication) {
      this.auth.msalInstance = instance;
    },

    setLoading(value: boolean) {
      this.auth.isLoading = value;
    },

    _resetAuthToGuestState() {
      console.log("AuthStore: _resetAuthToGuestState called");
      this.auth.loggedIn = false;
      this.auth.msalToken = ''; // Will be replaced by guest token if fetched
      this.auth.tokenMode = 'guest';
      this.auth.devices = [];
      this.auth.isUserVerifiedByEmail = false;
      this.auth.isUserRegistered = false;
      // msalInstance remains, it's the app's MSAL controller

      const accountStore = useAccountStore();
      accountStore.setAccount(null); // Clear account details

      const menuStore = useMenuStore();
      menuStore.setSideMenu([]); // Clear menu items
    },

    async processMsalLoginSuccess(authResult: AuthenticationResult) {
      this.setLoading(true);
      console.log("AuthStore: Processing successful MSAL login.");
      this.auth.msalToken = authResult.accessToken;
      this.auth.loggedIn = true;
      this.auth.tokenMode = 'msal_login';



      try {
        if (authResult.account && this.auth.msalInstance) {
          this.auth.msalInstance.setActiveAccount(authResult.account);
          console.log("AuthStore: Active MSAL account set:", authResult.account);
        }
        await this.postAuthSetup();
      } catch (e: any) {
        console.error("AuthStore: Error during postAuthSetup after MSAL login:", e);
        if (e.sessionExpired) { // Check if the error object has a sessionExpired flag
          await this.clearAuthDataAndFetchGuestToken();
        }
        // Depending on the error, you might want to revert to guest state
      }
      this.setLoading(false);
    },

    async initializeAuthFromStorageOrGuest() {
      this.setLoading(true);
      console.log("AuthStore: Initializing auth from storage or guest.");

      let needsPostAuthSetup = false;
      const tokenToValidate = this.auth.msalToken; // From persisted state

      if (this.auth.loggedIn && this.auth.tokenMode === 'msal_login' && tokenToValidate && !isTokenExpired(tokenToValidate)) {
        console.log("AuthStore: Initialized with valid persisted MSAL session.");
        if (this.auth.msalInstance) {
          const currentAccounts = this.auth.msalInstance.getAllAccounts();
          if (currentAccounts.length > 0 && !this.auth.msalInstance.getActiveAccount()) {
            // This logic might need refinement if multiple B2C accounts can be present.
            // Typically, after login, setActiveAccount is called, so this is more for subsequent loads.
            this.auth.msalInstance.setActiveAccount(currentAccounts[0]);
            console.log("AuthStore: Active MSAL account restored from existing accounts.", currentAccounts[0]);
          }
        }
        needsPostAuthSetup = true;
      } else {
        if (this.auth.tokenMode === 'msal_login' && (isTokenExpired(tokenToValidate) || !tokenToValidate)) {
          console.log("AuthStore: Persisted MSAL session token expired or missing. Clearing and switching to guest.");
        } else {
          console.log("AuthStore: No valid MSAL session. Initializing in guest mode or continuing as guest.");
        }
        this._resetAuthToGuestState(); // Ensure clean guest state in Pinia

        try {
          const guestRes = await getGuestToken();
          if (guestRes.data?.access_token) {
            this.auth.msalToken = guestRes.data.access_token;
            console.log("AuthStore: Guest token obtained successfully.");
            needsPostAuthSetup = true;
          } else {
            console.error("AuthStore: Failed to fetch guest token or access_token missing.", guestRes);
            // App might be in a non-functional state if guest token fails
          }
        } catch (error) {
          console.error("AuthStore: Error fetching guest token:", error);
        }
      }

      if (needsPostAuthSetup && this.auth.msalToken) {
        console.log("AuthStore: Proceeding to postAuthSetup.");
        try {
          await this.postAuthSetup();
        } catch (e: any) {
          console.error("AuthStore: Error during postAuthSetup from initialization:", e);
          if (e.sessionExpired) {
            await this.clearAuthDataAndFetchGuestToken();
          }
        }
      } else {
        console.log("AuthStore: Skipping postAuthSetup (no token or not needed).");
      }
      this.setLoading(false);
    },

    async postAuthSetup() {
      if (!this.auth.msalToken) {
        console.warn("AuthStore: postAuthSetup skipped (no token available).");
        this.setLoading(false); // Ensure loading is false if we skip
        return;
      }

      this.setLoading(true);
      console.log(`AuthStore: Running postAuthSetup with tokenMode: ${this.auth.tokenMode}, token: ${this.auth.msalToken ? 'present' : 'absent'}`);
      const accountStore = useAccountStore();
      const menuStore = useMenuStore();
      const tokenToUse = this.auth.msalToken;

      try {
        const conn = await getConnection(tokenToUse);
        console.log("AuthStore: getConnection response:", JSON.parse(JSON.stringify(conn)));

        if (conn.data?.response?.account) {
          const acct = conn.data.response.account;
          accountStore.setAccount(acct);

          if (acct?.customer_id && acct.status >= 200 && acct.status < 300) {
            console.log("AuthStore: connect API success with customer_id. Calling getMenuList.");
            const menuRes = await getMenuList(tokenToUse);
            console.log("AuthStore: getMenuList response:", JSON.parse(JSON.stringify(menuRes)));
            if (menuRes.data?.response?.main_menu_items) {
              menuStore.setSideMenu(menuRes.data.response.main_menu_items);
            } else {
              console.warn("AuthStore: getMenuList response missing main_menu_items.");
              menuStore.setSideMenu([]);
            }
          } else {
            console.log("AuthStore: Conditions not met to call getMenuList (customer_id missing or connect status not 2xx). Account status:", acct?.status);
            menuStore.setSideMenu([]);
          }

          if (acct?.status === 400) { // Example: device management needed
            console.log("AuthStore: Account status 400 from getConnection. Fetching user devices.");
            const devRes = await showUserDevices(tokenToUse);
            if (devRes.data?.response?.devices) {
              this.setDevices(devRes.data.response.devices);
            }
          }
          // Status 429 is handled by App.vue watcher for limitExceededPopup
        } else if ((conn as any).sessionExpired) { // Check for a specific session expired indicator from your API
          console.log("AuthStore: Session expired during getConnection. Clearing session and fetching guest token.");
          await this.clearAuthDataAndFetchGuestToken(); // This will re-trigger postAuthSetup with new guest token
          return; // Exit current postAuthSetup as it will be re-run
        } else {
          console.warn("AuthStore: postAuthSetup - getConnection call did not succeed as expected or returned unexpected data.", conn);
          menuStore.setSideMenu([]); // Clear menu on connection failure
        }
      } catch (err: any) {
        console.error('AuthStore: postAuthSetup error:', err);
        menuStore.setSideMenu([]); // Clear menu on error
        if (err.sessionExpired) { // Check for a specific session expired indicator from your API error
          console.log("AuthStore: Session expired during postAuthSetup (caught error). Clearing session and fetching guest token.");
          await this.clearAuthDataAndFetchGuestToken(); // This will re-trigger postAuthSetup
        }
      } finally {
        this.setLoading(false);
      }
    },

    async loginUser() {
      if (this.auth.msalInstance) {
        try {
          this.setLoading(true); // User will see loading state until redirect
          console.log("AuthStore: Initiating MSAL loginRedirect.");
          await this.auth.msalInstance.loginRedirect(loginRequest);
          // setLoading(false) will effectively happen on page reload after redirect and re-initialization
        } catch (error: any) {
          console.error("AuthStore: MSAL login error:", error);
          this.setLoading(false); // Reset loading on immediate error before redirect
        }
      } else {
        console.error("AuthStore: MSAL instance not available for login.");
      }
    },

    async logoutUser() {
      console.log("AuthStore: Initiating logout.");
      this.setLoading(true);

      const msalInstance = this.auth.msalInstance; // Assign to a local const for easier checking
      const isMsalLogin = this.auth.tokenMode === 'msal_login';

      // Reset Pinia state to guest-like defaults.
      this._resetAuthToGuestState();

      if (msalInstance && isMsalLogin) { // Check the local const
        try {
          console.log("AuthStore: Initiating MSAL logoutRedirect to /postlogout.");
          if (msalInstance.getActiveAccount()) { // Use the local const here too
            await msalInstance.setActiveAccount(null);
            console.log("AuthStore: MSAL active account cleared.");
          }
          // Now msalInstance is guaranteed to be non-null here by the if condition
          await msalInstance.logoutRedirect({
            postLogoutRedirectUri: '/postlogout',
          });
        } catch (error) {
          console.error("AuthStore: MSAL logout error:", error);
          await this.initializeAuthFromStorageOrGuest();
        }
      } else {
        console.log("AuthStore: Not an MSAL login, or MSAL instance not present. Re-initializing as guest.");
        await this.initializeAuthFromStorageOrGuest();
      }
    },

    async clearAuthDataAndFetchGuestToken() {
      this.setLoading(true);
      console.log("AuthStore: Clearing user session (clearAuthDataAndFetchGuestToken) and fetching guest token.");

      this._resetAuthToGuestState(); // Resets Pinia state, which persists to localStorage

      // Fetch new guest token and re-run postAuthSetup
      try {
        const guestRes = await getGuestToken();
        if (guestRes.data?.access_token) {
          this.auth.msalToken = guestRes.data.access_token;
          console.log("AuthStore: New guest token obtained after clearing data.");
          await this.postAuthSetup(); // Run postAuthSetup with the new guest token
        } else {
          console.error("AuthStore: Failed to fetch guest token after clearing data.");
          // Ensure UI is in a consistent guest state even if token fetch fails
          const menuStore = useMenuStore();
          menuStore.setSideMenu([]);
          const accountStore = useAccountStore();
          accountStore.setAccount(null);
        }
      } catch (error) {
        console.error("AuthStore: Error fetching guest token during clearAuthDataAndFetchGuestToken:", error);
      }
      this.setLoading(false);
    },

    setDevices(devices: any[]) {
      this.auth.devices = devices;
    },

    setDeviceStatus(data: { isUserEmailVerified: boolean; isUserRegistered: boolean }) {
      this.auth.isUserVerifiedByEmail = data.isUserEmailVerified;
      this.auth.isUserRegistered = data.isUserRegistered;
    },

    /**
     * Processes a login using a token provided directly, e.g., from a URL.
     * This bypasses the normal initialization flow.
     * @param {string} token - The access token to use for the session.
    */
    async processTokenLogin(token: string) {
      this.setLoading(true);
      console.log("AuthStore: Processing login from provided token.");

      // 1. Set the authentication state directly.
      this.auth.msalToken = token;
      this.auth.loggedIn = true;
      // You can decide if this counts as 'msal_login' or a different mode.
      // 'msal_login' is fine if the token structure is the same.
      this.auth.tokenMode = 'msal_login';
      this.auth.isTokenLoginSession = true;

      // 2. Run the post-authentication setup to fetch account and menu data
      //    This will now use the new token we just set.
      try {
        await this.postAuthSetup();
      } catch (e: any) {
        console.error("AuthStore: Error during postAuthSetup after token login:", e);
        // If it fails, revert to a guest state.
        await this.clearAuthDataAndFetchGuestToken();
      } finally {
        this.setLoading(false);
      }
    },
  },
  persist: {
    storage: localStorage,
    paths: [
      'auth.loggedIn',
      'auth.msalToken',
      'auth.tokenMode',
      'auth.isUserVerifiedByEmail',
      'auth.isUserRegistered',
      // DO NOT persist 'auth.isLoading'
      // DO NOT persist 'auth.devices' (fetched dynamically in postAuthSetup)
      // 'auth.msalInstance' is an object with methods, CANNOT be persisted.
    ],
  },
});

export default useAuthStore;