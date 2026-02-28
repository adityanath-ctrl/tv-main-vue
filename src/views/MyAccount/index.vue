<template>
  <h2 class="heading-title">My Account</h2>
  <hr class="custom-hr" />
  <v-container>
    <!-- Loader -->
    <div v-if="isLoading" class="spinner-container">
      <div class="loader">
        <img :src="Logo" class="logo-in-loader" style="height:40px;" />
      </div>
    </div>

    <!-- Content shown after loading completes -->
    <div v-else>
      <!-- Main content for logged-in (non-guest) users -->
      <div v-if="isUserLoggedIn" class="d-flex justify-center custom-container">
        <!-- Left Menu and Right Content for My Account -->
        <v-row class="d-flex justify-center align-center">
          <v-col cols="12" md="4" class="pa-2">
            <!-- Mobile Tabs and Desktop Menu -->
            <v-tabs v-model="selectedSection" class="d-md-none w-100 custom-tabs">
              <v-icon size="20" class="mt-4">mdi-chevron-left</v-icon>
              <v-tab value="security">Security & <br />Access</v-tab>
              <v-tab v-if="ENABLE_MY_ACCOUNT_MANAGE_SUBSCRIPTIONS_TAB" value="subscriptions">My <br /> Subscriptions</v-tab>
              <v-tab v-if="ENABLE_MY_ACCOUNT_PAYMENT_TAB" value="payment">Payments</v-tab>
              <v-icon size="20" class="mt-3">mdi-chevron-right</v-icon>
            </v-tabs>
            <hr class="default-hr d-md-none" />
            <v-card class="pa-0 d-none d-md-block" :style="{ background: 'none' }">
              <v-card-title :class="{ 'bg-blues': selectedSection === 'security' }"
                class="text-p font-bold text-left left-margin rounded-pill px-4 py-3"
                @click="selectedSection = 'security'">
                Security & Access
              </v-card-title>
              <v-card-title v-if="ENABLE_MY_ACCOUNT_MANAGE_SUBSCRIPTIONS_TAB" :class="{ 'bg-blues': selectedSection === 'subscriptions' }"
                class="text-p font-bold text-left left-margin rounded-pill px-4 py-3"
                @click="selectedSection = 'subscriptions'">
                Manage My Subscriptions
              </v-card-title>
              <v-card-title v-if="ENABLE_MY_ACCOUNT_PAYMENT_TAB" :class="{ 'bg-blues': selectedSection === 'payment' }"
                class="text-p font-bold text-left left-margin rounded-pill px-4 py-3"
                @click="selectedSection = 'payment'">
                Payment
              </v-card-title>
            </v-card>
          </v-col>

          <!-- Right Content -->
          <v-col cols="12" md="8" class="left-margin card-height">
            <v-card :style="{ background: 'none' }">


              <!-- Security & Access Section Start -->
              <div v-if="selectedSection === 'security'" class="margin-access">
                <h2 class="text-white w-full mb-3 ">Security And Access</h2>
                <div style="display: flex; justify-content: center; align-items: center;">
                  <v-card-title @click="changePassword"
                    class="px-4 py-7 rounded-lg bg-gray-200 d-flex align-center justify-space-between w-100 custom-card mt-4">
                    <!-- Left Icon -->
                    <v-icon size="30px" left class="mr-3 ">mdi-lock</v-icon>
                    <!-- Text Content -->
                    <div class="text-left text-white text-h6  font-weight-medium text-sm">
                      Change my password
                    </div>
                    <!-- Right Arrow Icon -->
                    <v-icon size="30">mdi-chevron-right</v-icon>
                  </v-card-title>
                </div>
                <div style="display: flex; justify-content: center; align-items: center;">
                  <v-card-title @click="goToManageDevices"
                    class="px-4 py-7 rounded-lg bg-gray-200 d-flex align-center justify-space-between w-100 custom-card mt-4">
                    <!-- Left Icon -->
                    <img :src="lockImage" alt="lockImage" class="fixed-image mr-3">
                    <!-- Text Content -->
                    <div class="text-left text-white text-h6  font-weight-medium text-sm">
                      Manage my device access
                    </div>
                    <!-- Right Arrow Icon -->
                    <v-icon size="30">mdi-chevron-right</v-icon>
                  </v-card-title>
                </div>
                <div>
                </div>
              </div>
              <!-- Security & Access Section End -->

              <!-- Manage Subscriptions Section Start -->
              <div v-else-if="selectedSection === 'subscriptions'" class="w-full margin-access">
                <h2 class=" w-full mb-4">Manage My Subscriptions</h2>
                <!-- <p class="w-full mt-4">Content for managing subscriptions goes here.</p>  -->

                <div style="display: flex; justify-content: center; align-items: center;">
                  <v-card-title
                    class="pa-4 rounded-lg bg-gray-200 d-flex align-center justify-space-between w-100 custom-card">
                    <!-- Left Icon -->
                    <img :src="boxImage" alt="managecontentImage" class="fixed-image mr-3">
                    <!-- Text Content -->
                    <div class="text-left text-white font-weight-medium text-h6 text-sm">
                      View my Code Package <br /> Status
                    </div>

                    <!-- Right Arrow Icon -->
                    <v-icon size="30">mdi-chevron-right</v-icon>
                  </v-card-title>
                </div>

                <div style="display: flex; justify-content: center; align-items: center;">
                  <v-card-title
                    class="pa-4 rounded-lg bg-gray-200 d-flex align-center justify-space-between w-100 custom-card mt-4">
                    <!-- Left Icon -->
                    <img :src="managecontentImage" alt="managecontentImage" class="fixed-image mr-3">
                    <!-- Text Content -->
                    <div class="text-left text-white text-h6 font-weight-medium text-sm">
                      Manage my content <br /> subscriptions
                    </div>
                    <!-- Right Arrow Icon -->
                    <v-icon size="30">mdi-chevron-right</v-icon>
                  </v-card-title>
                </div>
                <div style="display: flex; justify-content: center; align-items: center;">
                  <v-card-title
                    class="pa-4 rounded-lg bg-gray-200 d-flex align-center justify-space-between w-100 custom-card mt-4">
                    <!-- Left Icon -->
                    <img :src="lockImage" alt="lockImage" class="fixed-image mr-3">
                    <!-- Text Content -->
                    <div class="text-left text-white text-h6 font-weight-medium text-sm">
                      Manage my add on device <br /> subscriptions
                    </div>
                    <!-- Right Arrow Icon -->
                    <v-icon size="30">mdi-chevron-right</v-icon>
                  </v-card-title>
                </div>
              </div>
              <!-- Manage Subscriptions Section End -->

              <!-- Payment Section Start -->
              <div v-else-if="selectedSection === 'payment'">
                <h2 class="white-text w-full mb-3">Payment</h2>
                <div style="display: flex; justify-content: center; align-items: center;">
                  <v-card-title
                    class="px-4 py-7 rounded-lg bg-gray-200  d-flex align-center justify-space-between w-100 custom-card mt-4">
                    <!-- Left Icon -->
                    <img :src="dollervueImage" alt="lockImage" class="fixed-image mr-3 ">
                    <!-- Text Content -->
                    <div class="text-left text-white text-h6  font-weight-medium text-sm">
                      View my payment History
                    </div>
                    <!-- Right Arrow Icon -->
                    <v-icon size="30">mdi-chevron-right</v-icon>
                  </v-card-title>
                </div>
                <div style="display: flex; justify-content: center; align-items: center;">
                  <v-card-title
                    class="px-4 py-5 rounded-lg bg-gray-200 d-flex align-center justify-space-between  rounded-bg custom-card mt-4">
                    <!-- Left Icon -->
                    <img :src="ticketImage" alt="lockImage" class="fixed-image mr-3">
                    <!-- Text Content -->
                    <div class="text-left text-white text-h6  font-weight-medium text-sm">
                      update my payment <br />method/credit card
                    </div>
                    <!-- Right Arrow Icon -->
                    <v-icon size="30">mdi-chevron-right</v-icon>
                  </v-card-title>
                </div>
                <div>
                </div>
              </div>
              <!-- Payment Section End -->

              <div v-else>
                <h2 class="blue-text text-left">Welcome</h2>
                <p>Please select an option from the left menu.</p>
              </div>

            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Fallback: Not logged in -->
      <div v-else class="justify-center flex">
        <ButtonFlowTemplate v-if="!isUserLoggedIn" :closePopup="closeButtonFlowTemplate"
          :dialog="buttonFlowTemplatePopupRef" :popupContentType="popupContentType">
          <template #sign-in-required>
            <div class="d-flex justify-center">
              <h1 class="popupHeading">Log In Required</h1>
            </div>
            <v-card-text class="popupSubHeading">
              You are required to log in to your {{ SITE_TITLE }} management account to approve or deny <br />
              adding a new device to your account.
            </v-card-text>
            <v-card-actions class="d-flex justify-center align-center gap-[3.5rem]">
              <v-btn outlined color="white" class="popup-btn" @click="handleLoginRequired">
                Cancel
              </v-btn>
              <v-btn outlined color="white" class="popup-btn" @click="signIn('msal_login')">
                Continue
              </v-btn>
            </v-card-actions>
          </template>
        </ButtonFlowTemplate>
      </div>

    </div>
  </v-container>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import useAuthStore from '@/store/useAuthStore';
import useAccountStore from '@/store/useAccountStore'
import { RESET_PASSWORD_URL, SITE_TITLE, ENABLE_MY_ACCOUNT_MANAGE_SUBSCRIPTIONS_TAB, ENABLE_MY_ACCOUNT_PAYMENT_TAB } from '../../mainConfig';

// Image and Component Imports
import boxImage from '/assets/img/box.png';
import lockImage from '/assets/img/lock.png';
import managecontentImage from '/assets/img/managecontent.png';
import dollervueImage from '/assets/img/dollervue.png';
import ticketImage from '/assets/img/ticket.png';
import ButtonFlowTemplate from '@/components/popups/btnFlowTemplate.vue';
import Logo from '@/assets/img/starter-logo.png';

const authStore = useAuthStore();
const router = useRouter();
const accountStore = useAccountStore()

// STATE
const selectedSection = ref('security');
const buttonFlowTemplatePopupRef = ref(false);
const popupContentType = ref('');

// COMPUTED PROPERTIES
const isLoading = computed(() => authStore.getLoadingState);
const isUserLoggedIn = computed(() => authStore.isUserLoggedIn);
const userEmail = computed(() => accountStore.getAccount?.user_email || '');

// If a token is passed via the URL, store it immediately:
onMounted(() => {
  // If, after all loading, the user is still not logged in, show the popup.
  if (!isLoading.value && !isUserLoggedIn.value) {
    popupContentType.value = 'sign-in-required';
    buttonFlowTemplatePopupRef.value = true;
  }
});

// Fallback: if the token isn’t set within 5 seconds, hide the loader.
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 5000);
});

const signIn = () => {
  // The store's loginUser now correctly handles the MSAL instance
  authStore.loginUser();
};

const goToManageDevices = () => {
  router.push({ path: '/manage-devices' });
};

const changePassword = () => {
  const pathWithoutQuery = router.currentRoute.value.path;
  const returnUrl = encodeURIComponent(window.location.origin + pathWithoutQuery);
  const encodedEmail = encodeURIComponent(userEmail.value);
  const dynamicResetUrl = `${RESET_PASSWORD_URL}&redirect_uri=${returnUrl}&email_address=${encodedEmail}`;
  window.location.href = dynamicResetUrl;
};

const closeButtonFlowTemplate = () => {
  buttonFlowTemplatePopupRef.value = false
}

const handleLoginRequired = () => {
  closeButtonFlowTemplate();
  router.push('/');
};
</script>

<style scoped>
.blue-text {
  color: #006497;
}

.popup-btn {
  background-color: white !important;
  /* White button background */
  color: black !important;
  /* Black button text */
  text-transform: capitalize;
  font-weight: 600;
  border-radius: 30px;
  padding: 0 20px;
  /* Fixed width for buttons */
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

.v-card-actions {
  gap: 40px;
}

.fixed-image {

  height: 30px;
  /* Set your desired height */
  object-fit: cover;
  /* Ensures the image scales properly */
}

.custom-tabs .v-tabs-slider {
  background-color: #156082 !important;
  /* Change active tab bottom border color */
  font-size: 12px;
  height: 3px !important;
  /* Adjust thickness if needed */
}

.custom-tabs .v-tab:hover {
  color: #156082 !important;
  /* Change text color on hover */
  font-size: 12px;
}

.heading-title {
  margin-top: 100px;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  padding-bottom: 8px;
  /* Space between text and border */
  display: inline-block;
  /* Ensures border only under text width */
}

/* Ensure active tab text color */
.custom-tabs .v-tab.v-tab--selected {
  color: #156082 !important;
  font-weight: bold;
}

.custom-tabs .v-tab {
  font-size: 13px !important;
  /* Adjust the font size */
  text-align: center;
  min-width: 80px;
  /* Set a fixed width for better alignment */
  padding: 5px;
  /* Adjust spacing */
}

.default-hr {
  border: none;
  /* Remove default border */
  height: 1px;
  /* Set thickness */
  background-color: rgb(105 105 105);
  width: 100%;
  /* Full width */
  margin-top: 20px;
  /* Adjust spacing */
}

.custom-hr {
  border: none;
  /* Remove default border */
  height: 1px;
  /* Set thickness */
  background-color: rgb(105 105 105);
  width: 100%;
  /* Full width */
  margin-top: 20px;
  /* Adjust spacing */
}

.bg-blues {
  background-color: #006497;
  color: white;
  margin-top: 8px;
  margin-bottom: 8px;
  border-radius: 20px;
  padding: 8px 16px;
  width: 100%;
}

.custom-card {
  max-width: 380px;
  /* Adjust the width based on screen size */
  width: 100%;
}

.text-wrap {
  white-space: normal;
}

.text-left {
  text-align: left;
  width: 100%;
}

.w-full {
  width: 100%;
}

.margin-access {
  margin-top: 120px;
}

.rounded-pill {
  border-radius: 20px;
  width: 100%;
  /* margin-left:2%; */
}

.px-4 {
  padding-left: 16px;
  padding-right: 16px;
}

.py-2 {
  padding-top: 8px;
  padding-bottom: 8px;
}

.bg-gray-200 {
  background-color: #3D3B3B;
}

.rounded-bg {
  border-radius: 6px;
  width: 50%;
}

.v-card-title {
  transition: background-color 0.3s ease;
}

.v-card-title:hover {
  background-color: #92278F;
  /* Add red color on hover */
  color: white;
}

@media (max-width: 1280px) {
  .rounded-bg {
    width: unset
  }

}


@media (max-width: 600px) {
  return .blue-text {
    font-size: 2rem;
    width: 100%;
  }

  h2 {
    font-size: 18px !important;
    /* Smaller size for mobile */
    text-align: justify;
  }

  .text-sm {
    font-size: 18px !important;
    /* Smaller size for mobile */
  }

  .v-icon {
    font-size: 24px !important;
    /* Reduce icon size */
  }

  .fixed-image {
    height: 20px !important;
    /* Adjust image size for mobile */
  }

  .rounded-bg {
    width: 100%;
    padding: 12px;
  }

  .text-h6 {
    font-size: 2rem;
  }
}

@media (min-width: 1920px) {
  .v-container {
    max-width: 1200px;
  }
}

@media (max-width: 900px) {
  .blue-text {
    font-size: 1.5rem;
    width: 100%;
  }

  .margin-access {
    margin-top: 0px;
  }

  .card-height {
    height: 100vh;
  }

  .rounded-bg {
    padding: 16px;
  }
}

.spinner-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80vh;
  position: relative;
}

.loader {
  position: relative;
  width: 100px;
  height: 100px;
  border: 6px solid #3498db;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.logo-in-loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}

</style>