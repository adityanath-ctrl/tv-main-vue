<template>
  <div class="d-flex flex-column bg-none live-event w-100 focusable-item" tabindex="0" :class="[isViewMore ? 'py-3' : 'pb-10 pt-2']"
    @click="handleCardClick()" style="cursor: pointer">
    <div class="slider-img-container">
      <img :src="item.live_event_image_wide" class="card-top-img event-vod-img" />
      <img v-if="!item.package_status" :src="PremiumRibbonIcon" class="premium-ribbon" />
    </div>

    <div class="d-flex align-center mt-5 overflow-hidden">
      <v-avatar v-if="item.content_provider_logo" size="40" class="avatar-img"
        @click.stop="onClickProvider(item.content_provider_id)">
        <img :src="item.content_provider_logo" style="width: 40px; height: 40px; border-radius: 50%; cursor: pointer" />
      </v-avatar>
      <div class="d-flex flex-column text-left px-2" style="width: 100%" @click.stop="handleCardClick()">
        <div class="d-flex justify-space-between">
          <div class="d-flex flex-column fm fcw event_short_name justify-center short_name overflow-auto"
            :style="{ fontSize: item.content_provider_name ? '12px' : '16px' }">
            <p class="text-truncate">{{ item.live_event_name_short }}</p>
            <p v-if="item.content_provider_name" class="text-truncate">
              {{ item.content_provider_name }}
            </p>
          </div>
          <v-img v-if="item.channel_status === 'ACTIVE'" :src="LiveStatus" width="56" height="25" class="ml-10" />
        </div>

        <h3 v-if="item.live_event_date" class="fm fcg text-truncate date-size overflow-auto"
          style="max-width: 17vw; font-size: 14px; font-weight: 100">
          {{ $filters.formattedDate(item.live_event_date) }}
        </h3>
      </div>
    </div>

    <ButtonFlowTemplate v-if="buttonFlowTemplatePopupRef" :closePopup="closePopup" :dialog="buttonFlowTemplatePopupRef"
      :popupContentType="popupContentType">
      <template #sign-in-required>
        <v-card-title class="d-flex justify-center">
          <h1 class="popupHeading">Log In Required</h1>
        </v-card-title>
        <v-card-text class="popupSubHeading">
          {{ popupMessage }}
        </v-card-text>
        <v-card-actions class="d-flex justify-center align-center">
          <v-btn outlined color="white" class="popup-btn" @click="closePopup">
            Cancel
          </v-btn>
          <v-btn outlined color="white" class="popup-btn" @click="handleSignIn">
            Login
          </v-btn>
        </v-card-actions>
      </template>
      
      <template #premium-access-required>
        <v-card-title class="d-flex justify-center">
          <h1 class="popupHeading">Premium Content Access</h1>
        </v-card-title>
        <v-card-text class="popupSubHeading">
          This content is available as part of our premium package.<br><br>
          To access it, please click the "Continue" button and enter your access code or top-up code to unlock the content.
        </v-card-text>
        <v-card-actions class="d-flex justify-center align-center">
          <v-btn outlined color="white" class="popup-btn" @click="closePopup">
            Cancel
          </v-btn>
          <v-btn outlined color="white" class="popup-btn" @click="handleContinueToEnterCode">
            Continue
          </v-btn>
        </v-card-actions>
      </template>
    </ButtonFlowTemplate>
  </div>
</template>

<script setup>
import LiveStatus from '../../assets/img/live-status.png'
import PremiumRibbonIcon from '../../assets/img/icon-premium-ribbon-16x9.png'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import useAuthStore from '@/store/useAuthStore'
import ButtonFlowTemplate from '@/components/popups/btnFlowTemplate.vue'
import { useUIStore } from '@/store/useUIStore'; // ADDED

const props = defineProps({
  item: { type: Object, required: true },
  isViewMore: { type: Boolean, default: false }
})

// --- State and Stores ---
const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore(); // ADDED

// MODIFIED: Renamed popup state variables for consistency
const buttonFlowTemplatePopupRef = ref(false)
const popupContentType = ref('')
const popupMessage = ref('')

// MODIFIED: Replaced with the comprehensive logic from the other cards
const handleCardClick = () => {
  const userIsLoggedIn = authStore.isUserLoggedIn;
  const item = props.item;

  // Case 1: Logged in, but needs to enter a code for premium access
  if (userIsLoggedIn && !item.package_status && item.packages?.[0]?.package_code_status) {
    popupContentType.value = 'premium-access-required';
    buttonFlowTemplatePopupRef.value = true;
    return;
  }

  // Case 2: Not logged in and content is premium
  if (!userIsLoggedIn && !item.package_status) {
    popupMessage.value = 'Log in is required to access this premium event.';
    popupContentType.value = 'sign-in-required';
    buttonFlowTemplatePopupRef.value = true;
    return;
  }

  // Case 3: Not logged in and content requires login (but isn't premium)
  if (!userIsLoggedIn && item.login_required) {
    popupMessage.value = 'This event is free but requires you to log in.';
    popupContentType.value = 'sign-in-required';
    buttonFlowTemplatePopupRef.value = true;
    return;
  }

  // Case 4: User has access, proceed to player
  router.push({ path: '/player/video/' + item.live_event_id })
}

// --- Popup and Action Handlers ---
const closePopup = () => {
  buttonFlowTemplatePopupRef.value = false
}

const handleSignIn = () => {
  closePopup()
  authStore.loginUser() // Simplified call
}

// ADDED: Handler for the premium content popup
const handleContinueToEnterCode = () => {
  closePopup();
  uiStore.openEnterCodePopup();
};

const onClickProvider = (id) => {
  router.push({ path: '/provider/' + id })
}
</script>

<style scoped lang="scss">
@use '../../styles/home' as *;

.slider-img-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  overflow: hidden;
  border-radius: 10px;
}

.card-top-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.premium-ribbon {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 10;
  pointer-events: none;
}

/* ADDED: Styles for the popups to ensure they look right */
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

.popup-btn {
  background-color: white !important;
  color: black !important;
  text-transform: capitalize;
  font-weight: 600;
  border-radius: 30px;
  padding: 0 20px;
}
</style>