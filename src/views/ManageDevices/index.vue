<!-- /src/views/ManageDevices/index.vue -->
<template>
  <v-container class="box-reqiured">
    <!-- Loader -->
    <div class="text-heading" v-if="isLoading">
      <div class="spinner-container">
        <img :src="Logo" class="logo-in-loader" style="height:40px;" />
        <div class="loader"></div>
      </div>
    </div>

    <!-- Content -->
    <div class="containers" v-if="!isLoading">
      <h1 class="text-heading" v-if="isUserLoggedIn">
        {{ isUserLoggedIn && enableManageOwnDevices ? "My Devices" : "Access Denied" }}
      </h1>

      <!-- NEW: divider right under the title -->
      <div
        v-if="isUserLoggedIn && enableManageOwnDevices"
        class="title-divider"
      ></div>

      <!-- NEW: centered user email under the title -->
      <div
        v-if="isUserLoggedIn && enableManageOwnDevices && userEmail"
        class="user-email"
      >
        {{ userEmail }}
      </div>

      <!-- Lists -->
      <v-row class="row set-box" v-if="isUserLoggedIn && enableManageOwnDevices">
        <CardDevicesList :listHeader="'Devices To Add'" :handleDeviceTitle="handleDeviceTitle" />
        <CardDevicesList :listHeader="'Connected Devices'" :handleDeviceTitle="handleDeviceTitle" />
        <CardDevicesList :listHeader="'Deactivated Devices'" :handleDeviceTitle="handleDeviceTitle" />
      </v-row>
    </div>

    <!-- Sign-in required popup -->
    <ButtonFlowTemplate
      v-if="!isUserLoggedIn"
      :closePopup="closeButtonFlowTemplate"
      :dialog="buttonFlowTemplatePopupRef"
      :popupContentType="popupContentType"
    >
      <template #sign-in-required>
        <v-card-title class="d-flex justify-center">
          <h1 class="heading">Log In Required</h1>
        </v-card-title>
        <v-card-text class="subHeading">
          You are required to log in to your {{ SITE_TITLE }}<br />
          management account to approve or deny <br />
          adding a new device to your account.
        </v-card-text>
        <v-card-actions class="d-flex justify-center align-center  gap-[3.5rem]">
          <v-btn outlined color="white" class="popup-btn" @click="handleLoginRequired">
            Cancel
          </v-btn>
          <v-btn outlined color="white" class="popup-btn" v-on:click="signIn('msal_login')">
            Continue
          </v-btn>
        </v-card-actions>
      </template>
    </ButtonFlowTemplate>
  </v-container>
</template>

<script>
import ButtonFlowTemplate from '@/components/popups/btnFlowTemplate.vue';
import Logo from '@/assets/img/starter-logo.png';

import { ref, computed, watchEffect, onMounted, onBeforeMount, watch } from 'vue';
import useAuthStore from '@/store/useAuthStore';
import useAccountStore from '@/store/useAccountStore'; // NEW
import { useRouter } from 'vue-router';
import { jwtDecode } from "jwt-decode";
import { HIGHLIGHT_COLOR_1, HIGHLIGHT_COLOR_2, SITE_TITLE, devicesLookupTable, ENABLE_MANAGE_OWN_DEVICES } from '../../mainConfig';
import { useMsal } from "@/composition-api/useMsal";
import Cookies from 'js-cookie';
import CardDevicesList from '@/components/CardDevicesList.vue';

export default {
  components: {
    CardDevicesList,
    ButtonFlowTemplate
  },
  setup() {
    const popupContentType = ref('');
    const authStore = useAuthStore();
    const accountStore = useAccountStore(); // NEW
    const decoded = ref(null);
    const isHovered = ref(false);
    const url = window.location.href;

    const urlObj = new URL(url);
    const hasPendingDeviceId = ref(urlObj.searchParams.has("device_id"));
    const pendingDeviceId = ref(urlObj.searchParams.get("device_id"));
    const isUserVerifiedByEmail = ref(false);
    const deviceIp = computed(() => Cookies.get('device_ip'));
    const devicesData = computed(() => authStore.getDevices);
    const isUserLoggedIn = computed(() => authStore.isUserLoggedIn);
    const router = useRouter();

    const currentDevice = ref(null);
    const registeredDevice = ref(false);
    const buttonFlowTemplatePopupRef = ref(false);
    const authToken = computed(() => authStore.getToken);

    const devicesStatus = computed(() => authStore.getDevicesStatus);
    const isLoading = ref(true);
    const handleDeviceTitle = (deviceType) => devicesLookupTable[deviceType] || "Unknown Device";

    // NEW: Computed user email for the centered line
    const userEmail = computed(() => accountStore.getAccount?.user_email || '');

    // CLOSE POPUP
    const closeButtonFlowTemplate = () => {
      buttonFlowTemplatePopupRef.value = false;
    };

    onMounted(() => {
      if (urlObj.pathname === '/manage-devices') {
        popupContentType.value = 'sign-in-required';
        isLoading.value = true;
        setTimeout(() => {
          watch(
            () => isUserLoggedIn.value,
            (newState) => {
              if (!newState) {
                buttonFlowTemplatePopupRef.value = true;
              }
            },
            { immediate: true }
          );
          isLoading.value = false;
        }, 4000);
      }
    });

    onBeforeMount(() => {
      const deviceUuid = Cookies.get('uuid');
      registeredDevice.value = (devicesData.value ?? []).some(
        (device) => device.device_uid === deviceUuid && device.device_status === 1
      );
    });

    onMounted(() => {
      watch(
        () => authToken.value,
        () => {
          setTimeout(() => {
            isUserVerifiedByEmail.value = devicesData?.value?.some(
              (device) => device.device_id == pendingDeviceId.value && device.device_status === 0
            );
          }, 1000);
        },
        { immediate: true }
      );
    });

    const { instance } = useMsal();
    const signIn = (login_mode) => {
      const payload = {
        login_mode: login_mode,
        instance: instance
      };
      authStore.loginUser(payload);
    };

    const learndialogBooleans = computed(() => dialogs.value); // left as-is

    watchEffect(() => {
      const token = authToken.value;
      if (token) {
        try {
          decoded.value = jwtDecode(token);
        } catch (error) {
          console.error('Error decoding token:', error);
          decoded.value = null;
        }
      }
    });

    const handleLoginRequired = () => {
      closeButtonFlowTemplate();
      router.push('/');
    };

    return {
      SITE_TITLE,
      handleLoginRequired,
      enableManageOwnDevices: ENABLE_MANAGE_OWN_DEVICES,
      isUserLoggedIn,
      popupContentType,
      CardDevicesList,
      ButtonFlowTemplate,
      closeButtonFlowTemplate,
      buttonFlowTemplatePopupRef,
      registeredDevice,
      devicesStatus,
      isLoading,
      Logo,
      handleDeviceTitle,
      currentDevice,
      hasPendingDeviceId,
      pendingDeviceId,
      deviceIp,
      devicesData,
      isUserVerifiedByEmail,
      learndialogBooleans,
      HIGHLIGHT_COLOR_1,
      HIGHLIGHT_COLOR_2,
      isHovered,
      decoded,
      signIn,
      userEmail
    };
  },
};
</script>

<style scoped>
[v-cloak] { display: none; }

.heading { padding: 0; margin: 0; font-size: 20px; font-weight: bold; }
.subHeading { padding-top: 0; font-size: 14px; font-weight: 500; margin-bottom: 0; text-align: center; }
.v-card-actions { gap: 40px; }

.popup-btn {
  background-color: white !important;
  color: black !important;
  text-transform: capitalize;
  font-weight: 600;
  border-radius: 30px;
  padding: 0 20px;
}

.spinner-container {
  display: flex; align-items: center; justify-content: center;
  height: 80vh; position: relative;
}
.border-width { width: 860px; }
.device-container { display: flex; flex-wrap: wrap; gap: 20px; }

.loader {
  position: relative; width: 100px; height: 100px;
  border: 6px solid #3498db; border-top-color: transparent;
  border-radius: 50%; animation: spin 1s linear infinite;
}
.logo-in-loader {
  position: absolute; left: 50%; top: 50%;
  transform: translate(-50%, -50%); z-index: 1000;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.containers {
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  gap: 5px; padding: 1rem; overflow-y: hidden;
}

/* NEW: divider right under "My Devices" */
.title-divider {
  width: 100%;
  max-width: 1000px;
  height: 1px;
  background-color: #707070; /* subtle grey line */
  margin: 6px auto 8px;
  opacity: 0.6;
}

/* NEW: centered email line */
.user-email {
  margin-top: 2px;
  margin-bottom: 16px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  opacity: 0.95;
}

.device-connect { display: flex; flex-wrap: wrap; gap: 40px; justify-content: space-between; }
.text-increase { font-size: 15px; font-weight: 200; }
.text-device { font-size: 19px; font-weight: 700; }
.sm-text { font-size: 15px; padding-left: 1rem; }

.btn-approve, .btn-deny {
  padding: 5px 10px; font-size: 13px; background-color: #fff; color: black;
  border: none; border-radius: 20px; cursor: pointer;
}

.device-limit {
  width: 100%; display: flex; justify-content: flex-end;
  max-width: 1000px; margin: 0 auto;
}
.device-id { font-size: 12px; font-weight: 700; color: rgb(88, 88, 88) }

.box-reqiured { margin-top: 100px; }

.set-box {
  display: flex; flex-wrap: wrap; gap: 20px; justify-content: space-between;
  width: 100%; max-width: 1000px; margin: 0 auto;
}

.md-plus {
  display: inline-flex; justify-content: center; align-items: center;
  margin-top: 15px; width: 40px; height: 40px;
  border: 2px solid #b0b0b0; border-radius: 50%; background-color: transparent;
  margin-bottom: 20px;
}
.md-plus .mdi-plus { font-size: 25px; color: #b0b0b0; }

.heading { padding-top: 1rem; font-size: 16px; font-weight: bold; margin-bottom: 10px; padding-left: 1rem; }
.red-heading { color: red; font-size: 20px; }

.horizontal-line-white { width: 100%; height: 1px; background-color: rgb(212, 212, 212); margin: 5px 0 10px; }
.horizontal-line { width: 100%; height: 1px; background-color: rgb(2, 2, 2); margin: 5px 0 10px; }

.paragraph { font-size: 14px; margin-bottom: 20px; width: 200px; }

.heading-container { display: flex; justify-content: flex-end; position: absolute; top: 15px; right: 15px; color: #fff; }
.edit { display: block; flex-wrap: wrap; font-size: 16px; color: #4fadef; font-weight: 600; cursor: pointer; }
.dollar { display: block; flex-wrap: wrap; font-size: 34px; margin-top: -10px; font-weight: bold; color: #fff; cursor: pointer; }

.box {
  position: relative; width: 420px;
  padding-bottom: 7px; padding-left: 7px; padding-right: 7px;
  background-color: #F9FAFB; color: #040404;
  display: flex; flex-direction: column; justify-content: space-between; border-radius: 8px;
}
.black-box { background-color: #333333; display: flex; flex-direction: column; justify-content: space-between; color: #fff; margin-top: 20px; }

.grid-container { text-align: left; gap: 20px; }
.text-heading { font-weight: 500; font-size: 22px; text-align: center; }
.text-sum { text-align: end; }
.list { display: flex; flex-direction: column; gap: 2px; }

.buttons { display: flex; flex-direction: column; padding: 0rem 0.5rem; gap: 10px; }
.button  { display: flex; flex-direction: column; padding: 1rem; gap: 10px; }

.btn { padding: 5px 10px; font-size: 13px; background-color: #393839; color: #fff; border: none; border-radius: 20px; cursor: pointer; }
.btn:hover { background-color: #4F4848; }

@media (max-width: 768px) {
  .row { flex-direction: column; gap: 15px; }
  .border-width { width: 100%; }
  .device-container { grid-template-columns: 1fr; }
  .md-plus { margin-bottom: 20px; }
  .set-box>ul, .set-box>.box.black-box { flex: 1 1 100%; }
  .box { width: 100%; }
  .containers { display: flex; flex-direction: column; justify-content: center; gap: 20px; padding: 1rem; overflow-y: hidden; }
  .grid-container { flex-direction: column; width: 100%; gap: 15px; }
  .buttons { align-items: center; }
  .btn { width: 100%; }
}
</style>
