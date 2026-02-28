<template>
  <div class="d-flex flex-column bg-none w-100" :class="[isViewMore ? 'py-3' : 'pb-10 pt-2']" @click="handleCardClick()"
    style="cursor: pointer">
    <div class="slider-img-container">
      <img class="card-img" :src="EPG.icon_poster" />
      <img v-if="!item.package_status" :src="PremiumRibbonIcon" class="premium-ribbon" />
      <div class="overlay-container">
        <div class="d-flex flex-row text-left justify-space-between align-items-center pt-2 px-2 pb-1">
          <div style="max-width: 75%">
            <div class="single-line-text text-body-1" style="font-size: 16px !important">
              {{ EPG.title1 }}
            </div>
            <div class="single-line-text text-body-1" style="font-size: 12px !important">
              {{ EPG.title2 }}
            </div>
          </div>
          <div class="d-flex flex-column justify-center">
            <img :src="item.icon_url || item.channel_image" :style="{ width: '40px', borderRadius: '1vw' }" />
            <v-img v-if="item.channel_status === 'ACTIVE'" :src="LiveStatus" width="56" height="25" class="ml-10" />
          </div>
        </div>
        <div class="px-2">
          <v-progress-linear :color="HIGHLIGHT_COLOR_1" :background-color="HIGHLIGHT_COLOR_2" height="5"
            class="card-progress" :model-value="EPG.progress" />
        </div>
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
import LiveStatus from '../../assets/img/live-status.png';
import PremiumRibbonIcon from '../../assets/img/icon-premium-ribbon-16x9.png';
import { BACKGROUND_COLOR_2, HIGHLIGHT_COLOR_1, HIGHLIGHT_COLOR_2 } from '@/mainConfig';
import useLiveStore from '@/store/useLiveStore';
import useAuthStore from '@/store/useAuthStore';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import ButtonFlowTemplate from '@/components/popups/btnFlowTemplate.vue';
import { useUIStore } from '@/store/useUIStore';

const props = defineProps({
  item: { type: Object, required: true },
  isViewMore: { type: Boolean, required: false },
});

// --- State and Stores ---
const liveStore = useLiveStore();
const authStore = useAuthStore();
const uiStore = useUIStore(); // ADDED
const router = useRouter();

const buttonFlowTemplatePopupRef = ref(false);
const popupContentType = ref('');
const popupMessage = ref('');

// --- Computed Properties ---
const EPG = computed(() => {
  const epgObj = {
    icon_poster: props.item.icon_url,
    title1: props.item.caption || props.item.title || '',
    title2: props.item.caption_short || '',
    progress: 0,
  };
  const epg = liveStore.epg_map[props.item.id]?.epg;
  if (epg?.programs?.length) {
    const program = epg.programs[epg.programs.length - 1];
    epgObj.title1 = program.progName;
    epgObj.title2 = program.subtitles;
    epgObj.icon_poster = program.icon_poster || epgObj.icon_poster;
    const duration = program.progStop_time - program.progStart_time;
    const elapsed = Date.now() - program.progStart_time;
    epgObj.progress = (elapsed * 100) / duration;
  }
  return epgObj;
});

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
    popupMessage.value = 'Log in is required to access this premium channel.';
    popupContentType.value = 'sign-in-required';
    buttonFlowTemplatePopupRef.value = true;
    return;
  }

  // Case 3: Not logged in and content requires login (but isn't premium)
  if (!userIsLoggedIn && item.login_required) {
    popupMessage.value = 'This channel is free to watch but requires you to log in.';
    popupContentType.value = 'sign-in-required';
    buttonFlowTemplatePopupRef.value = true;
    return;
  }

  // Case 4: User has access, proceed to player
  router.push({ path: '/player/live-tv/' + (item.id || item.channel_id) });
};

// --- Popup and Action Handlers ---
const closePopup = () => {
  buttonFlowTemplatePopupRef.value = false;
};

const handleSignIn = () => {
  closePopup();
  authStore.loginUser(); // Simplified call, as store now handles MSAL instance
};

// ADDED: Handler for the premium content popup's "Continue" button
const handleContinueToEnterCode = () => {
  closePopup();
  uiStore.openEnterCodePopup();
};
</script>

<style scoped lang="scss">
.slider-img-container {
  background-color: v-bind(BACKGROUND_COLOR_2);
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  border-radius: 10px;
  overflow: hidden;
}

.card-img {
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

.overlay-container {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding-bottom: 1rem;
  background-color: #000c;
  z-index: 2;
}

/* ADDED: Styles for the popups to match the sports card */
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