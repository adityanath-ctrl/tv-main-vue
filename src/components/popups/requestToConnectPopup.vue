<template>
  <ButtonFlowTemplate :dialog="dialog" :popupContentType="currentStep" :close-popup="handleClose" :persistent="isError">
    <!-- Step 1: Initial -->
    <template #device-limit-initial>
      <v-card-title class="d-flex justify-center">
        <h1 class="popupHeading">Request to Connect Device</h1>
      </v-card-title>

      <v-card-text class="text-small">
        To connect this one, you’ll need to remove another.
      </v-card-text>

      <v-card-text class="text-small">
        Would you like to send a request to connect this device?
      </v-card-text>

      <!-- Row buttons: Back | Send Request -->
      <div class="row-actions">
        <v-btn class="btn-lep-grey btn-wide" @click="emitBack">Back</v-btn>
        <v-btn class="btn-lep-grey btn-wide" :loading="isLoading" @click="handleAddDeviceRequest">
          Send Request
        </v-btn>
      </div>

      <!-- Divider -->
      <div class="divider">
        <span class="divider-text">OR</span>
      </div>

      <!-- Learn More -->
      <div class="stacked-actions">
        <v-btn class="btn-lep-grey btn-wide" @click="learnMoreDialog = true">
          Learn More
        </v-btn>
      </div>
    </template>

    <!-- Step 2: Success -->
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

    <!-- Step 3: Error -->
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

  <LearnMore :closePopup="closeLearnMoreDialog" :dialog="learnMoreDialog" />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import ButtonFlowTemplate from './btnFlowTemplate.vue';
import LearnMore from './learnMore.vue';
import { addDeviceRequest } from '@/utils/siberAPI';
import { ENABLE_MANAGE_OWN_DEVICES } from '@/mainConfig';
import useAuthStore from '@/store/useAuthStore';
import useAccountStore from '@/store/useAccountStore';

const props = defineProps<{
  dialog: boolean;
}>();

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'close'): void;
  (e: 'sent'): void;
}>();

const router = useRouter();
const authStore = useAuthStore();
const accountStore = useAccountStore();

const currentStep = ref<'initial' | 'success' | 'error'>('initial');
const isLoading = ref(false);
const popupTitle = ref('');
const message = ref('');
const learnMoreDialog = ref(false);

const isError = computed(() => currentStep.value === 'error');
const showManageDevicesButton = computed(() => ENABLE_MANAGE_OWN_DEVICES);

const emitBack = () => emit('back');

const handleAddDeviceRequest = async () => {
  isLoading.value = true;

  // These may be undefined; guard them before calling the API.
  const token = authStore.getToken as string | undefined;
  const userMiddlewareIdRaw = accountStore.getAccount?.account_limits?.user_id as number | string | undefined;

  try {
    if (!token || userMiddlewareIdRaw === undefined || userMiddlewareIdRaw === null) {
      // Show a friendly error instead of throwing a TS/type error
      popupTitle.value = "We're sorry";
      message.value = "We couldn't identify your account. Please sign in again and try the request once more.";
      currentStep.value = 'error';
      return;
    }

    // Coerce to the union the API expects
    const userId: number | string =
      typeof userMiddlewareIdRaw === 'number' ? userMiddlewareIdRaw : String(userMiddlewareIdRaw);

    const response = await addDeviceRequest(userId, token);

    if (response?.data?.status === 200) {
      // Tell parent to close previous popups and open the "Request Sent" popup
      emit('sent');
      emit('close');
      return;
    } else {
      popupTitle.value = "We're sorry";
      message.value = `${response?.data?.message || 'Unable to send request'}. Try again later.`;
      currentStep.value = 'error';
    }
  } catch (e) {
    popupTitle.value = 'An Error Occurred';
    message.value = 'Could not process your request. Please try again later.';
    currentStep.value = 'error';
  } finally {
    isLoading.value = false;
  }
};



const handleSignout = () => {
  emit('close'); // close this popup
  authStore.logoutUser(); // sign out
};

const goToManageDevices = () => {
  router.push('/manage-devices');
  emit('close');
};

const closeLearnMoreDialog = () => {
  learnMoreDialog.value = false;
};

const handleClose = () => {
  // Only the initial step is escapable by clicking away; success/error require a button.
  if (currentStep.value === 'initial') emit('close');
};

// Reset internal state if reopened
watch(
  () => props.dialog,
  (open) => {
    if (open) currentStep.value = 'initial';
  }
);
</script>

<style scoped>
.text-small {
  font-size: 0.95rem;
  text-align: center;
  padding: 0 1rem;
  margin: 0.35rem 0;
  opacity: 0.9;
}

.row-actions {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 10px;
  place-items: center;
}

.stacked-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Button sizing like the mock */
.btn-wide {
  width: 100%;
  max-width: 240px;
}

.divider {
  width: 80%;
  text-align: center;
  border-bottom: 1px solid #555;
  line-height: 0.1em;
  margin: 1.2rem auto;
}

.divider-text {
  background: #1a1919;
  /* match card bg */
  padding: 0 10px;
  color: #888;
  font-size: 0.8rem;
  font-weight: bold;
}

/* Shared popup styles (match your other popup) */
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

/* Grey button style to match your theme */
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
</style>
