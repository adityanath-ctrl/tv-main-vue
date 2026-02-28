<template>
  <ButtonFlowTemplate :dialog="dialog" :popupContentType="'initial'" :close-popup="handleClose" :persistent="false">
    <template #device-limit-initial>
      <v-card-title class="d-flex justify-center">
        <h1 class="popupHeading">Request Sent</h1>
      </v-card-title>

      <v-card-text class="section-title">How would you like to Proceed?</v-card-text>

      <div class="hr"></div>

      <!-- Section 1 -->
      <v-card-text class="text-small">
        <strong>Complete Request via Email</strong><br />
        Check your email at <span class="email">{{ emailText }}</span> to continue
        removing a device from your account and add your requested device.
      </v-card-text>

      <div class="stacked-actions">
        <v-btn class="btn-lep-grey btn-wide" @click="handleSignout">
          Continue As Guest
        </v-btn>
      </div>

      <div class="divider">
        <span class="divider-text">OR</span>
      </div>

      <!-- Section 2 -->
      <v-card-text class="text-small">
        <strong>Skip Request via Email</strong><br />
        Skip the email step and add your requested device yourself.
      </v-card-text>

      <div class="stacked-actions">
        <v-btn class="btn-lep-grey btn-wide" @click="goToManageDevices">
          Add Device Myself
        </v-btn>
      </div>
    </template>
  </ButtonFlowTemplate>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import ButtonFlowTemplate from './btnFlowTemplate.vue';
import useAuthStore from '@/store/useAuthStore';
import useAccountStore from '@/store/useAccountStore';

const props = defineProps<{
  dialog: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const router = useRouter();
const authStore = useAuthStore();
const accountStore = useAccountStore();

const emailText = computed(() => {
  // Try to show the signed-in email if available
  return (
    accountStore.getAccount?.user_email ||
    ''
  );
});

const handleSignout = () => {
  emit('close');         // close this popup
  authStore.logoutUser(); // same behavior you used for "Sign out"
};

const goToManageDevices = () => {
  router.push('/manage-devices');
  emit('close');
};

const handleClose = () => {
  // allow closing via backdrop on this one
  emit('close');
};
</script>

<style scoped>
.popupHeading {
  font-size: 1.25rem;
  font-weight: bold;
  text-align: center;
}

.section-title {
  text-align: center;
  opacity: 0.95;
  font-size: 1rem;
}

.hr {
  width: 90%;
  margin: 0.4rem auto 0.8rem;
  border-bottom: 1px solid #444;
  opacity: 0.8;
}

.text-small {
  font-size: 0.95rem;
  text-align: left;
  padding: 0 1rem;
  margin: 0.5rem 0 0.6rem;
  opacity: 0.95;
}

.email {
  color: #ddd;
}

.stacked-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.btn-wide {
  width: 100%;
  max-width: 260px;
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
  padding: 0 10px;
  color: #888;
  font-size: 0.8rem;
  font-weight: bold;
}

.v-card-text {
  padding: 0.5rem !important;
}

/* Grey button style to match the other popups */
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
  background-color: #a0a0a0 !important;
}
</style>
