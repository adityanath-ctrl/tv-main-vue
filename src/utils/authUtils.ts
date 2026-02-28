// src/utils/authUtils.ts
import { msalInstance, loginRequest } from '@/mainConfig';
import { isTokenExpired } from './siberAPI';
import useAuthStore from '@/store/useAuthStore'; // Correct path
import { InteractionRequiredAuthError, type AuthenticationResult } from '@azure/msal-browser';

export async function renewTokenIfNeeded(): Promise<string> {
  const authStore = useAuthStore();
  const currentTokenInStore = authStore.getToken;
  const currentTokenMode = authStore.getTokenMode;

  // If current token in store is valid (MSAL or Guest)
  if (currentTokenInStore && !isTokenExpired(currentTokenInStore)) {
    // If it's an MSAL token and it's about to expire (e.g., within next 5 mins),
    // you could proactively try to renew, but for now, just return if not expired.
    return currentTokenInStore;
  }

  // If token is expired or missing, and it was supposed to be an MSAL token
  if (currentTokenMode === 'msal_login') {
    try {
      console.log("authUtils: Attempting to renew MSAL token silently (token expired or missing from store).");
      const activeAccount = authStore.getMsalInstance?.getActiveAccount();
      if (!activeAccount) {
        console.warn("authUtils: No active MSAL account found for silent renewal. Login might be required.");
        // Throw interaction_required to force login if no active account.
        // Or handle as per your app's policy for this scenario.
        throw new InteractionRequiredAuthError("No active account for silent token acquisition.");
      }

      const response: AuthenticationResult = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: activeAccount,
      });
      
      const newToken = response.accessToken;
      localStorage.setItem('authToken', newToken); // Keep localStorage in sync

      authStore.auth.msalToken = newToken;
      authStore.auth.loggedIn = true;
      authStore.auth.tokenMode = 'msal_login';
      
      console.log("authUtils: MSAL Token renewed successfully via acquireTokenSilent.");
      return newToken;

    } catch (error: any) {
      console.error("authUtils: MSAL Token silent renewal failed:", error);
      if (
        error instanceof InteractionRequiredAuthError ||
        error.errorCode === "interaction_required" ||
        error.errorCode === "consent_required" ||
        error.errorCode === "login_required" ||
        error.name === "BrowserAuthError" && error.errorCode === "no_account_error" // another common one
      ) {
        // This error needs to be handled by initiating an interactive login.
        // The apiClient interceptor will reject with { sessionExpired: true }
        console.log("authUtils: Interaction required for token renewal.");
        throw { ...error, errorCode: "interaction_required" }; // Ensure errorCode is set for interceptor
      }
      // For other errors, it's a genuine failure.
      // We might not have a valid token to return.
      console.error("authUtils: Unhandled error during token renewal. API call might fail.", error);
      throw error; // Rethrow to let the API call fail
    }
  }

  // If it's guest mode and token is expired/missing from store, this indicates an issue,
  // as initializeAuthFromStorageOrGuest should have fetched one.
  // However, for robustness, we could try to fetch a guest token here as a last resort,
  // but it's better if the initial flow handles it.
  if (currentTokenMode === 'guest') {
     console.warn("authUtils: In guest mode, but token is expired or missing. This might indicate an issue in the init flow.");
     // Fallback to returning the (potentially expired) token from store, or empty string.
     // The API call will likely fail or the server will handle the expired guest token.
     return currentTokenInStore || '';
  }
  
  // If no specific mode or other unhandled cases, return empty string.
  console.warn("authUtils: No valid token found or mode not applicable for renewal. API call might proceed without auth or fail.");
  return '';
}