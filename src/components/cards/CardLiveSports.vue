<!-- /src/components/cards/CardLiveSports.vue -->
<template>
  <div class="d-flex flex-column bg-none w-100" :class="[isViewMore ? 'py-3' : 'pb-10 pt-2']" @click="handleCardClick()" data-tv-focusable
    style="cursor: pointer;">
    <div class="subscription-item" style="overflow: hidden; border-radius: 10px; position: relative;">
      <div class="slider-img-container">
        <img :src="item.match_poster || item.match_poster_image" class="card-img" />
        <img v-if="!item.package_status" :src="PremiumRibbonIcon" class="premium-ribbon" />
      </div>

      <div class="description">
        <div class="text-body-1 single-line-text font-weight-bold">
          {{ matchName }}
        </div>
        <div class="text-body-1 single-line-text">
          {{ item.match_stage }}
        </div>
        <div class="text-caption single-line-text">
          {{ matchDate }}
        </div>
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


</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { changeTimeFormatEST } from '@/utils/date';
import { BACKGROUND_COLOR_2 } from '@/mainConfig';
import PremiumRibbonIcon from '../../assets/img/icon-premium-ribbon-16x9.png';
import useAuthStore from '@/store/useAuthStore';
import ButtonFlowTemplate from '@/components/popups/btnFlowTemplate.vue';
import { useUIStore } from '@/store/useUIStore';

const props = defineProps({
  item: { type: Object, required: true },
  isViewMore: { type: Boolean, default: false }
})

const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUIStore();

// Popup state
const buttonFlowTemplatePopupRef = ref(false)
const popupContentType = ref('')
const popupMessage = ref('')

// Computed display values
const matchName = computed(() =>
  `${props.item.match_team_a} vs ${props.item.match_team_b}`
)
const matchDate = computed(() =>
  changeTimeFormatEST(props.item.datetime || props.item.match_datetime)
)

// Handle click with login logic
const handleCardClick = () => {
  const userIsLoggedIn = authStore.isUserLoggedIn;
  const item = props.item;

  // Case 1: User is logged in, but doesn't have the package
  // Your logic: !package_status && packages array exists && package_code_status is true
  if (userIsLoggedIn && !item.package_status && item.packages?.[0]?.package_code_status) {
    popupContentType.value = 'premium-access-required';
    buttonFlowTemplatePopupRef.value = true;
    return; // Stop further checks
  }

  // Case 2: User is NOT logged in and content is premium
  if (!userIsLoggedIn && !item.package_status) {
    popupMessage.value = 'Log in is required to access this premium match.';
    popupContentType.value = 'sign-in-required';
    buttonFlowTemplatePopupRef.value = true;
    return;
  }

  // Case 3: User is NOT logged in and content requires login (but isn't premium)
  if (!userIsLoggedIn && item.login_required) {
    popupMessage.value = 'This match is free but requires you to log in.';
    popupContentType.value = 'sign-in-required';
    buttonFlowTemplatePopupRef.value = true;
    return;
  }

  // Case 4: User has access, proceed to player
  if (item.package_status) {
    router.push({ path: '/player/match/' + item.match_id });
  } else {
    // Fallback case: if none of the above, but user is logged in (e.g., free content), still let them through
    if (userIsLoggedIn) {
      router.push({ path: '/player/match/' + item.match_id });
    }
  }
};

const closePopup = () => {
  buttonFlowTemplatePopupRef.value = false
}

const handleSignIn = () => {
  closePopup()
  authStore.loginUser();
}

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
}

.card-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
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

.description {
  width: 100%;
  background-color: v-bind(BACKGROUND_COLOR_2);
  text-align: left;
  padding: 5px 10px;
}
</style>
