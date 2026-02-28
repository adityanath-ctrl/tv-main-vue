<template>
  <div class="settings-container" @click="navigationStateChange()">
    <div class="user-icon">
      <!-- <img src="path/to/user-icon.png" alt="User Icon" /> -->
    </div>
    <div class="auth-token">
      {{ authToken }}
    </div>
    <div class="button-container">
      <button @click="resetPassword" class="button">
        <!-- <img src="path/to/password-icon.png" alt="Password Icon" /> -->
        Forgot Password / Change Password
      </button>
      <button @click="viewSubscriptions" class="button">
        <!-- <img src="path/to/subscription-icon.png" alt="Subscription Icon" /> -->
        View Subscriptions
      </button>
    </div>
  </div>
</template>

<script>
import useNavigationStore from "@/store/useNavigationStore";
import { ref, onMounted } from "vue";

export default {
  setup() {
    const navigationStore = useNavigationStore()
    const authToken = ref("");

    onMounted(() => {
      authToken.value = localStorage.getItem('authToken');
    });

    const resetPassword = () => {
      window.location.href = 'https://xstreamtt.b2clogin.com/xstreamtt.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1_Reset_Password&client_id=32ffd2f4-0a68-4342-955c-95b32111373d&nonce=defaultNonce&redirect_uri=https%3A%2F%2Fdev.xstreamtt.com%2F&scope=openid&response_type=id_token&prompt=login';
    };

    const viewSubscriptions = () => {
      window.open('https://store.xstreamtt.com', '_blank');
    };

    const navigationStateChange = () => {
      navigationStore.changeNavigationState(false)
    };

    return { navigationStateChange, authToken, resetPassword, viewSubscriptions };
  },
};
</script>

<style scoped>
.settings-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(87vh);
  width: 100vw;
  margin-top: 120px;
}

.button-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.button {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
