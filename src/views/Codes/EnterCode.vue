<template>
  <div>
    <!-- Page-specific title and horizontal rule -->
    <h2 class="heading-title">Enter Code</h2>
    <hr class="custom-hr" />
    <v-container>
      <!-- Show loader while auth state is being determined -->
      <div v-if="isLoading" class="spinner-container">
        <!-- You can reuse the loader from your old component if you like -->
        <div class="loader"></div>
      </div>

      <!-- If user is logged in, show the reusable flow component -->
      <EnterCodeFlow v-else-if="isUserLoggedIn" :show-cancel-button="false" @close="handleFlowClose" />
      
      <!-- If user is NOT logged in, show the login prompt popup -->
      <div v-else class="justify-center flex">
        <ButtonFlowTemplate
          :dialog="showLoginPopup"
          :popupContentType="'sign-in-required'"
          :closePopup="handleLoginRequired"
        >
          <template #sign-in-required>
            <div class="d-flex justify-center">
              <h1 class="popupHeading">Log In Required</h1>
            </div>
            <v-card-text class="popupSubHeading">
              You are required to log in to your {{ SITE_TITLE }} account to redeem any purchased codes.
            </v-card-text>
            <v-card-actions class="d-flex justify-center align-center gap-[3.5rem]">
              <v-btn outlined color="white" class="popup-btn" @click="handleLoginRequired">
                Cancel
              </v-btn>
              <v-btn outlined color="white" class="popup-btn" @click="signIn">
                Continue
              </v-btn>
            </v-card-actions>
          </template>
        </ButtonFlowTemplate>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import useAuthStore from '@/store/useAuthStore';
import { SITE_TITLE } from '@/mainConfig';
import EnterCodeFlow from '@/components/EnterCodeFlow.vue'; // <-- Import the reusable component
import ButtonFlowTemplate from '@/components/popups/btnFlowTemplate.vue'; // <-- Import the popup template

const router = useRouter();
const authStore = useAuthStore();

// --- State ---
const showLoginPopup = ref(false);

// --- Computed Properties ---
const isLoading = computed(() => authStore.getLoadingState);
const isUserLoggedIn = computed(() => authStore.isUserLoggedIn);

// --- Watcher to handle login prompt ---
// This watcher waits for the initial auth check to complete.
watch(
  isLoading,
  (loading) => {
    // When loading is finished, check if the user is logged in.
    if (!loading && !isUserLoggedIn.value) {
      // If not logged in, set the flag to show the login popup.
      showLoginPopup.value = true;
    }
  },
  { immediate: true } // 'immediate' runs the watcher on component mount
);

const handleLoginRequired = () => {
  showLoginPopup.value = false;
  router.push('/');
};

const signIn = () => {
  showLoginPopup.value = false;
  authStore.loginUser();
};
</script>

<style scoped>
/* Keep ONLY the page-specific styles. The component styles are in EnterCodeFlow.vue */
.heading-title {
  margin-top: 100px;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  padding-bottom: 8px;
  display: inline-block;
}

.custom-hr {
  border: none;
  height: 1px;
  background-color: rgb(105 105 105);
  width: 100%;
  margin-top: 20px;
}

.spinner-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60vh; /* Adjust height as needed */
}

.loader {
  width: 80px;
  height: 80px;
  border: 5px solid #3498db;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Styles for the login prompt popup buttons */
.popup-btn {
  background-color: white !important;
  color: black !important;
  text-transform: capitalize;
  font-weight: 600;
  border-radius: 30px;
  padding: 0 20px;
}

.popupHeading {
  padding: 0;
  margin: 0;
  font-size: 20px;
  font-weight: bold;
}

.popupSubHeading {
  padding-top: 0;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 0;
  text-align: center;
}


</style>
