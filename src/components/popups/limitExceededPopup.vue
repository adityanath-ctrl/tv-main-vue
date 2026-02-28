<!-- /src/components/popups/limitExceededPopp.vue -->
<template>
  <ButtonFlowTemplate :dialog="dialogComputed" :popupContentType="currentStep" :close-popup="handleClose"
    :persistent="isError">
    <!-- Step 1: Initial Prompt -->
    <template #device-limit-initial>
      <v-card-text class="text-large">
        This device isn't connected to your account.
      </v-card-text>

      <v-card-text class="text-small">
        What would you like to do?
      </v-card-text>

      <!-- Stacked primary actions -->
      <div class="stacked-actions">
        <!-- 1) Connect to Watch (maps to your old "Yes") -->
        <v-btn class="btn-lep-grey btn-wide" @click="openRequestToConnect" :loading="isLoading">
          Connect to Watch
        </v-btn>

        <!-- 2) Manage Devices (same handler as before) -->
        <v-btn v-if="showManageDevicesButton" class="btn-lep-grey btn-wide" @click="goToManageDevices">
          Manage Devices
        </v-btn>

        <!-- 3) Cancel (maps to your old "No") -->
        <v-btn class="btn-lep-grey btn-wide" @click="handleSignout">
          Cancel
        </v-btn>
      </div>

      <!-- Divider -->
      <div class="divider">
        <span class="divider-text">OR</span>
      </div>

      <!-- 4) Learn More -->
      <div class="stacked-actions">
        <v-btn class="btn-lep-grey btn-wide" @click="learnMoreDialog = true">
          Learn More
        </v-btn>
      </div>
    </template>

    <!-- Step 2: Success Message -->
    <template #device-limit-request-success>
      <v-card-title class="d-flex justify-center">
        <h1 class="popupHeading">{{ popupTitle }}</h1>
      </v-card-title>
      <v-card-text class="popupSubHeading">{{ message }}</v-card-text>
      <v-card-actions class="d-flex justify-center align-center">
        <v-btn v-if="showManageDevicesButton" class="popup-btn" @click="goToManageDevices">
          Manage Devices
        </v-btn>
        <v-btn class="popup-btn" @click="handleSignout">Sign out</v-btn>
      </v-card-actions>
    </template>

    <!-- Step 3: Error Message -->
    <template #device-limit-request-error>
      <v-card-title class="d-flex justify-center">
        <h1 class="popupHeading">{{ popupTitle }}</h1>
      </v-card-title>
      <v-card-text class="popupSubHeading">{{ message }}</v-card-text>
      <v-card-actions class="d-flex justify-center align-center">
        <v-btn class="popup-btn" @click="handleSignout">Sign out</v-btn>
      </v-card-actions>
    </template>
  </ButtonFlowTemplate>

  <RequestToConnectPopup :dialog="requestDialog" @back="requestDialog = false" @close="requestDialog = false"
    @sent="handleRequestSent" />

  <RequestDeviceSent :dialog="requestSentDialog" @close="requestSentDialog = false" />

  <LearnMore :closePopup="closeLearnMoreDialog" :dialog="learnMoreDialog" />
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { addDeviceRequest } from '../../utils/siberAPI';
import LearnMore from './learnMore.vue';
import { ENABLE_MANAGE_OWN_DEVICES } from '@/mainConfig';
import useAuthStore from '@/store/useAuthStore';
import useAccountStore from '@/store/useAccountStore';
import ButtonFlowTemplate from './btnFlowTemplate.vue';
import RequestToConnectPopup from './requestToConnectPopup.vue';
import RequestDeviceSent from './requestDeviceSent.vue';

const props = defineProps({
  closePopup: { type: Function, required: true },
  dialog: { type: Boolean, required: true },
});

const router = useRouter();
const authStore = useAuthStore();
const accountStore = useAccountStore();

const currentStep = ref('initial'); // 'initial', 'success', 'error'
const isLoading = ref(false);
const popupTitle = ref('');
const message = ref('');
const learnMoreDialog = ref(false);
const requestDialog = ref(false);
const requestSentDialog = ref(false);

const dialogComputed = computed(() => props.dialog && currentStep.value !== 'closed');
const isError = computed(() => currentStep.value === 'error');
const showManageDevicesButton = computed(() => ENABLE_MANAGE_OWN_DEVICES);

const handleAddDeviceRequest = async () => {
  isLoading.value = true;
  const token = authStore.getToken;
  const userMiddlewareId = accountStore.getAccount?.account_limits?.user_id;

  try {
    const response = await addDeviceRequest(userMiddlewareId, token);
    if (response.data.status === 200) {
      popupTitle.value = 'Request Delivered';
      message.value =
        'Your Request has been sent, and the account holder can choose to accept or deny it.';
      currentStep.value = 'success';
    } else {
      popupTitle.value = "We're sorry";
      message.value = `${response.data.message}. Try after some time.`;
      currentStep.value = 'error';
    }
  } catch (error) {
    popupTitle.value = 'An Error Occurred';
    message.value = 'Could not process your request. Please try again later.';
    currentStep.value = 'error';
  } finally {
    isLoading.value = false;
  }
};

const handleSignout = () => {
  props.closePopup();
  authStore.logoutUser();
};

const goToManageDevices = () => {
  router.push('/manage-devices');
  props.closePopup();
};

const closeLearnMoreDialog = () => {
  learnMoreDialog.value = false;
};

const handleClose = () => {
  if (currentStep.value === 'initial') {
    props.closePopup();
  }
};

// Open the new popup when user clicks "Connect to Watch"
const openRequestToConnect = () => {
  requestDialog.value = true;
};

function handleRequestSent() {
  // close all previous
  requestDialog.value = false; // child
// also close the current parent popup if desired:
  // props.closePopup();  // uncomment if you want the original popup closed too
  // open the "Request Sent" popup
  requestSentDialog.value = true;
}

watch(
  () => props.dialog,
  (newVal) => {
    if (newVal) {
      currentStep.value = 'initial';
    }
  }
);
</script>

<style scoped>
.text-large {
  font-size: 1.1rem;
  text-align: center;
  font-weight: 700;
  padding: 0 !important;
  margin: 1rem 0;
  line-height: 1.4;
}

.text-small {
  font-size: 0.9rem;
  width: 90%;
  text-align: center;
  padding: 0 !important;
  margin: 0.5rem auto 1rem;
  opacity: 0.8;
}

/* Centered column of buttons */
.stacked-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
}

/* Consistent button width like the mock */
.btn-wide {
  width: 100%;
  max-width: 260px;
}

/* Divider */
.divider {
  width: 80%;
  text-align: center;
  border-bottom: 1px solid #555;
  line-height: 0.1em;
  margin: 1.5rem auto;
}

.divider-text {
  background: #1a1919;
  /* match card bg */
  padding: 0 10px;
  color: #888;
  font-size: 0.8rem;
  font-weight: bold;
}

/* Grey buttons */
.btn-lep-grey {
  background-color: #8e8e8e;
  color: black;
  text-transform: none;
  font-weight: 600;
  padding: 6px 24px;
  border-radius: 8px;
  border: 1px solid #555;
  font-size: 0.95rem !important;
  letter-spacing: normal;
}

.btn-lep-grey:hover {
  background-color: #D1D1D1FF !important;
}

/* Success/Error popups */
.popupHeading {
  font-size: 1.25rem;
  font-weight: bold;
  text-align: center;
}

.popupSubHeading {
  text-align: center;
  padding: 1rem;
  font-size: 1rem;
  line-height: 1.5;
  opacity: 0.9;
}

.v-card-actions {
  width: 100%;
  display: flex;
  margin-top: 1rem;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
}

.popup-btn {
  background-color: white !important;
  color: black !important;
  text-transform: capitalize;
  font-weight: 600;
  border-radius: 30px;
  padding: 0 25px;
}

/* Desktop / Tablet */
@media (min-width: 600px) {
  .text-large {
    font-size: 1.25rem;
  }

  .text-small {
    font-size: 1rem;
    width: 80%;
  }

  .btn-lep-grey {
    font-size: 1rem !important;
  }
}
</style>
