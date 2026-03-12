<!-- /src/components/TopBar.vue -->
<template>
  <v-app-bar app class="d-flex justify-space-between align-baseline" :style="backgroundStyle">
    <router-link to="/" style="position: absolute; left: calc(50% - 25px);" class="centered-logo">
      <div>
        <img :src="logo" class="d-flex justify-start align-center" style="height:35px;" />
      </div>
    </router-link>

    <div class="d-flex justify-center justify-md-start align-items-center first-division">
      <v-btn v-if="showHamburger" icon id="menu_flat_icon" class="mx-5 for-responsive pb-10"
        @click="changeStateValue()" data-tv-focusable>
        <v-icon size="40">mdi-menu</v-icon>
      </v-btn>
      <div v-else class="hamburger-spacer mx-5"></div>

      <router-link to="/" class="left-aligned-logo" :style="logoOffsetStyle" @click="handleLogoClick">
        <div class="appLogo">
          <img :src="logo" class="d-flex justify-start align-center" style="height:35px;" />
        </div>
      </router-link>
    </div>

    <div class="d-flex justify-end align-center mr-20" style="margin-left: auto; gap: 20px;" @click="navigationChange()"
      id="menu_hidden">
      <SearchInput v-if="showSearch" />
      <v-menu open-on-hover v-for="(menu, index) in TopMenu" :key="index">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" class="d-flex align-center top-bar-menu" @mouseenter="menu.isHovered = true"
            @mouseleave="menu.isHovered = false" @click="menu.action && handleMenuItemClick(menu)" :style="{
              textTransform: 'capitalize',
              fontSize: '16px',
              fontWeight: '400',
              borderRadius: '30px',
              backgroundColor: menu.isHovered ? HIGHLIGHT_COLOR_1 : 'transparent',
            }" v-if="(menu.item !== 'Broadcast') || (menu.item === 'Broadcast' && isUserLoggedIn)"
            :disabled="hasDeviceIdInParams" data-tv-focusable>
            <img v-if="menu.icon !== ''" :src="menu.icon" class="mr-2"
              style="width: 20px; height: 20px; margin-right: 10px;" />
            {{ menu.item }}
          </v-btn>
        </template>
        <v-list v-if="menu.subItems.length > 0">
          <v-list-item v-for="(item, id) in menu.subItems" :key="id">
            <v-list-item-title class="d-flex align-center"
              style="border-radius: 30px; text-transform: capitalize; font-size: 16px; font-weight: 400;">
              <v-btn class="d-flex align-center top-bar-menu hover-effect" @mouseenter="item.isHovered = true"
                @mouseleave="item.isHovered = false" @click="item.action && item.isHovered && handleMenuItemClick(item)"
                :style="{
                  textTransform: 'capitalize',
                  fontSize: '16px',
                  fontWeight: '400',
                  borderRadius: '30px',
                }" :disabled="hasDeviceIdInParams" data-tv-focusable>
                <img v-if="item.icon !== ''" :src="item.icon" class="mr-2" style="width: 20px; height: 20px" />
                {{ item.name }}
              </v-btn>
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <div class="d-flex justify-end align-center right-controls realtive">
      <v-btn depressed color="white" class="white--text top-bar-menu" @mouseenter="isHovered = true"
        @mouseleave="isHovered = false" @click="handleSignIn" :style="{
          backgroundColor: isHovered ? HIGHLIGHT_COLOR_2 : HIGHLIGHT_COLOR_1,
          textTransform: 'capitalize',
          fontSize: '16px',
          fontWeight: '400',
          borderRadius: '30px',
          margin: '10px',
        }" v-if="!isUserLoggedIn" data-tv-focusable>
        Sign In
      </v-btn>

      <v-menu :open-on-hover="isDesktop" v-if="isUserLoggedIn">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" icon x-large class="top-bar-menu mx-5"
            style="border-radius: 30px; background-color: #ffffff; color: #000; font-size: 20px;" data-tv-focusable>
            <v-icon x-large>mdi-account</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item class="d-flex align-center justify-center">
            <v-list-item-title style="font-size: 16px; font-weight: 400;">
              {{ userEmail }}
            </v-list-item-title>
          </v-list-item>
          <v-list-item v-for="(item, index) in SignoutMenu[0].subItems" :key="index">
            <v-btn class="d-flex align-center top-bar-menu" @click="item.action && handleMenuItemClick(item)"
              style="text-transform: capitalize; font-size: 16px; font-weight: 400;" :disabled="hasDeviceIdInParams" data-tv-focusable>
              <v-list-item-title>{{ item.name }}</v-list-item-title>
            </v-btn>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </v-app-bar>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { TopMenu, Signout } from '../mainConfig';
import logo from '../assets/img/starter-logo.png';
import { useRoute, useRouter } from 'vue-router';
import { HIGHLIGHT_COLOR_1, HIGHLIGHT_COLOR_2, ONLY_MANAGE_ACCOUNT } from '@/mainConfig';
import useAuthStore from '@/store/useAuthStore';
import useAccountStore from '@/store/useAccountStore';
import useNavigationStore from '@/store/useNavigationStore';
import useMenuStore from '@/store/useMenuStore';
import { jwtDecode } from 'jwt-decode';
import SearchInput from './SearchInput.vue';


const isDesktop = ref(true)
const updateIsDesktop = () => {
  isDesktop.value = window.innerWidth >= 767;
};
onMounted(() => {
  updateIsDesktop();
  window.addEventListener('resize', updateIsDesktop);
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateIsDesktop);
});

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const navigationStore = useNavigationStore();
const accountStore = useAccountStore();
const menuStore = useMenuStore();

const isHovered = ref(false);
const emit = defineEmits(['navigationChange', 'showModal']);
const SignoutMenu = Signout;
const isScrolled = ref(false);
const isGuestUser = ref(false);
const isUserLoggedIn = computed(() => authStore.isUserLoggedIn);
const userEmail = computed(() => accountStore.getAccount?.user_email || '');
const authToken = computed(() => authStore.getToken);
const urlObj = new URL(window.location.href);
const hasDeviceIdInParams = urlObj.searchParams.has('device_id');

const sideMenus = computed(() => menuStore.SideMenus);

const handleLogoClick = (event) => {
  // Check if the user is logged in but the menu is empty.
  // This is our "limbo state".
  if (isUserLoggedIn.value && (!sideMenus.value || sideMenus.value.length === 0)) {
    // Prevent the default router-link navigation
    event.preventDefault();
    // Force a full page reload to the home page
    window.location.href = '/';
  }
  // If the menu is not empty, or the user is a guest,
  // the <router-link> will navigate to "/" normally without a page reload.
};

const checkToken = () => {
  const token = authToken.value;
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      isGuestUser.value = !!(decodedToken?.name?.includes('guest'));
    } catch (error) {
      console.error('Error decoding token:', error);
      isGuestUser.value = false;
    }
  } else {
    isGuestUser.value = false;
  }
}

onMounted(() => {
  checkToken()
})

watch(() => authToken.value, checkToken)

const backgroundStyle = computed(() => (isScrolled.value ? 'background-color: #111111cc;' : 'background-color: transparent; box-shadow: 0px 0px 0px 0px;'))

const accountLoaded = ref(false);
watch(() => accountStore.getAccount, (newAccount) => {
  accountLoaded.value = !!newAccount;
}, { immediate: true });

const isLimitExceeded = computed(() => {
  const status = accountStore.getAccount?.status;
  return status === 429 || status === 403;
});

const shouldShowHeaderItems = computed(() => accountLoaded.value && !isLimitExceeded.value);

const showHamburger = computed(() => shouldShowHeaderItems.value && !ONLY_MANAGE_ACCOUNT);
const showSearch = computed(() => shouldShowHeaderItems.value && !ONLY_MANAGE_ACCOUNT && route.path !== '/search');

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
})

const changeStateValue = () => {
  navigationStore.changeNavigationState(!navigationStore.getNavigationState)
}

const handleMenuItemClick = (item) => {
  if (item.action === 'internal_function') {
    if (item.name === 'Sign Out') {
      authStore.logoutUser();
    } else if (item.name === 'My Account') {
      router.push({ path: `/my-account` });
    }
  } else if (item.action) {
    if (item.newtab) {
      window.open(item.action, '_blank');
    } else {
      window.location.href = item.action;
    }
  }
}

const handleSignIn = () => {
  const msalInstanceFromStore = authStore.getMsalInstance;
  if (msalInstanceFromStore) {
    authStore.loginUser();
  } else {
    console.error('MSAL instance not available in the store from TopBar.');
    // Optionally handle the case where msalInstance is not available
  }
}

const navigationChange = () => {
  navigationStore.changeNavigationState(false)
  emit('navigationChange', false)
}

// Reserve space where the hamburger would be when ONLY_MANAGE_ACCOUNT is true
const logoOffsetStyle = computed(() => {
  if (!ONLY_MANAGE_ACCOUNT) return {};
  // roughly matches the width of the hidden icon button + its margins
  return { paddingLeft: isDesktop.value ? '64px' : '48px' };
});
</script>

<style>
.centered-logo {
  display: none;
}

.image-wrapper::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  mix-blend-mode: color;
  pointer-events: none;
}

.left-aligned-logo {
  visibility: visible;
}

.v-toolbar__content {
  justify-content: space-between;
}

.right-controls {
  margin-right: 40px;
}

.notifaction-fixed {
  position: absolute;
  top: 42px;
  right: 46px;
}

.top-bar-menu:hover {
  opacity: 1;
  border-radius: 30px;
  background-color: #27AAE1;
  cursor: pointer;
}

.v-btn--variant-text .v-btn__overlay {
  border-radius: 30px;
}

.v-btn--variant-text .v-btn__underlay {
  border-radius: 30px;
}

.appLogo {
  float: left;
  width: 150px;
  margin-top: 4px;
}

.top-bar-menu.hover-effect:hover {
  opacity: 1;
  border-radius: 30px;
  background-color: #27AAE1;
  cursor: pointer;
}

@media screen and (max-width: 1024px) {
  .centered-logo {
    display: block;
  }

  .v-menu--active .v-menu__content {
    display: none !important;
  }

  .left-aligned-logo {
    visibility: hidden;
  }

  .notifaction-fixed {
    position: absolute;
    top: 39px;
    right: 3px;
  }

  .right-controls {
    margin-right: 12px;
  }

  .first-division {
    width: 100%;
  }

  .for-responsive {
    position: absolute !important;
    left: 0;
  }

  #menu_hidden {
    visibility: hidden;
    display: none !important;
  }

  .appLogo {
    margin-left: 50px;
    float: none;
  }

  .appLogo img {
    margin: 0 !important;
  }
}

@media screen and (max-width: 1024px) {
  #menu_hidden {
    display: none !important;
  }

  /* --- THE CENTERING FIX --- */
  .centered-logo {
    display: block;
    /* Make it visible */
    position: absolute;
    left: 50%;
    top: 50%;
    /* This is the key: transform it back by half of its own width and height */
    transform: translate(-50%, -50%);
  }

  /* Make sure the parent containers don't interfere */
  .first-division {
    width: 100%;
  }

  .right-controls {
    margin-right: 12px;
  }

  /* Position the hamburger menu absolutely on the left */
  .for-responsive {
    position: absolute !important;
    left: 0;
  }
}
</style>
