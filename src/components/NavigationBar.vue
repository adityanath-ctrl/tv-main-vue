<!-- /src/components/NavigationBar.vue -->
<template>
  <v-navigation-drawer expand-on-hover enable-resize-watcher class="lighten-3" app
    style="color: #fff; box-shadow: 0px 0px 0px 0px; border: 0px; top: 0px; padding-top: 105px; padding-left: 20px; padding-right: 10vw; height: 100vh"
    :style="showMenuBar ? backgroundStyle_show : backgroundStyle_hide">
    <v-list nav :style="navStyle">
      <!-- Dynamically generated menu items from API -->
      <template v-for="(menuItem, index) in menuItems" :key="menuItem.id">
        <v-list-group
          v-if="menuItem.menuType === 'SUB_MENU_ITEMS' && menuItem.sub_menu_items && menuItem.sub_menu_items.length > 0"
          :value="menuItem.id">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" :prepend-avatar="getIconUrl(menuItem)" class="mb-3"
              :style="currentRoute == menuItem.id ? activeItemStyle : inActiveItemStyle"
              @click="onClickParentMenu(index, menuItem, true)" :title="menuItem?.menuItemName">
            </v-list-item>
          </template>

          <v-list-item v-for="(subItem, subIndex) in menuItem.sub_menu_items" :key="subItem.id"
            :prepend-avatar="getIconUrl(subItem, true)"
            :style="currentRoute == subItem.id ? activeItemStyle : inActiveItemStyle"
            @click="onClickSubMenu(index, subIndex, subItem)" :title="subItem?.subMenuName"
            class="custom-sub-menu-item">
          </v-list-item>
        </v-list-group>

        <v-list-item v-else :key="menuItem.id + '_single'" :prepend-avatar="getIconUrl(menuItem)" class="mb-3"
          :style="currentRoute == menuItem.id ? activeItemStyle : inActiveItemStyle"
          @click="onClickParentMenu(index, menuItem, false)">
          <v-list-item-title>
            {{ (!isUserLoggedIn && menuItem.menuItemLayout === 'Log_Out') ? 'Sign In' : menuItem.menuItemName }}
          </v-list-item-title>
        </v-list-item>
      </template>

    </v-list>

    <ButtonFlowTemplate :closePopup="closeButtonFlowTemplate" :dialog="buttonFlowTemplatePopupRef"
      :popupContentType="popupContentType">
      <!-- Slot for the 'sign-in-required' popup -->
      <template #sign-in-required>
        <v-card-title class="d-flex justify-center">
          <h1 class="popupHeading">Log In Required</h1>
        </v-card-title>
        <v-card-text class="popupSubHeading">
          You must be logged in to access this feature.
        </v-card-text>
        <v-card-actions class="d-flex justify-center align-center">
          <v-btn outlined color="white" class="popup-btn" @click="closeButtonFlowTemplate">
            Cancel
          </v-btn>
          <v-btn outlined color="white" class="popup-btn" @click="handleSignIn">
            Login
          </v-btn>
        </v-card-actions>
      </template>

      <!-- Slot for the 'enter-code' popup -->
      <template #enter-code>
        <v-card-title class="d-flex justify-center">
          <h1 class="popupHeading">Log In Required</h1>
        </v-card-title>
        <v-card-text class="popupSubHeading">
          Please log in to your account to enter a code.
        </v-card-text>
        <v-card-actions class="d-flex justify-center align-center">
          <v-btn outlined color="white" class="popup-btn" @click="closeButtonFlowTemplate">
            Cancel
          </v-btn>
          <v-btn outlined color="white" class="popup-btn" @click="handleSignIn">
            Login
          </v-btn>
        </v-card-actions>
      </template>

    </ButtonFlowTemplate>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed, reactive, watch, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import {
  FONT_COLOR_1,
  HIGHLIGHT_COLOR_1,
  SIDEEFFECTBAR_1,
  SIDEEFFECTBAR_2,
  SIDEEFFECTBAR_3,
  SIDEEFFECTBAR_4,
} from "@/mainConfig";
import useNavigationStore from "@/store/useNavigationStore";
import useMenuStore from "@/store/useMenuStore";
import useAuthStore from '@/store/useAuthStore';
import ButtonFlowTemplate from '@/components/popups/btnFlowTemplate.vue';
import { useMsal } from '@/composition-api/useMsal';
import { useUIStore } from '@/store/useUIStore';

const router = useRouter();
const authStore = useAuthStore();
const menuStore = useMenuStore();
const navigationStore = useNavigationStore();
const { instance } = useMsal();
const uiStore = useUIStore();

const currentRoute = ref("");
const isUserLoggedIn = computed(() => authStore.isUserLoggedIn);

const pos = (x) => {
  const n = Number(x?.position);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER; // push missing to end
};

const byPosNameId = (getName) => (a, b) => {
  const pa = pos(a), pb = pos(b);
  if (pa !== pb) return pa - pb;
  const an = String(getName(a) ?? '');
  const bn = String(getName(b) ?? '');
  const nameCmp = an.localeCompare(bn, undefined, { numeric: true, sensitivity: 'base' });
  if (nameCmp) return nameCmp;
  return (Number(a.id) || 0) - (Number(b.id) || 0);
};

const sortParents = (arr = []) => arr.slice().sort(byPosNameId(i => i.menuItemName));
const sortSubs    = (arr = []) => arr.slice().sort(byPosNameId(i => i.subMenuName || i.menuItemName));


const backgroundStyle_hide = reactive({
  background: "transparent",
  width: "0vw",
  paddingRight: "6px",
  transform: "translateX(-2000%)!important",
});

const backgroundStyle_show = reactive({
  background: "linear-gradient(90deg, " + SIDEEFFECTBAR_1 + " 0%, " + SIDEEFFECTBAR_2 + " 53%, " + SIDEEFFECTBAR_3 + " 86%, " + SIDEEFFECTBAR_4 + " 100%)",
  width: "450px",
  paddingRight: "10vw",
  transform: "translateX(0%)!important",
});

const navStyle = reactive({
  textAlign: "left",
  color: FONT_COLOR_1,
});

const activeItemStyle = reactive({
  backgroundColor: HIGHLIGHT_COLOR_1,
  borderRadius: "25px",
});

const inActiveItemStyle = reactive({
  backgroundColor: "",
  borderLeft: "",
  borderTopLeftRadius: "",
  borderBottomLeftRadius: "",
});


const buttonFlowTemplatePopupRef = ref(false);
const popupContentType = ref("");
const loginButtonDisabled = ref(false);

function closeButtonFlowTemplate() {
  buttonFlowTemplatePopupRef.value = false;
}

const closePopup = () => {
  buttonFlowTemplatePopupRef.value = false
}

const handleSignIn = () => {
  closePopup()
  if (instance) {
    authStore.loginUser();
  }
}

watch(buttonFlowTemplatePopupRef, (newVal) => {
  if (newVal) {
    loginButtonDisabled.value = false;
  } 
});

const showMenuBar = computed(() => navigationStore.getNavigationState);

const menuItems = computed(() => {
  const sideMenus = menuStore.SideMenus || [];
  return sortParents(sideMenus).map(mi => ({
    ...mi,
    sub_menu_items: sortSubs(mi.sub_menu_items || [])
  }));
});



const onClickParentMenu = (index, menuItem, isParentGroupClick = false) => {
  const hasSubItems = menuItem.menuType === 'SUB_MENU_ITEMS' && menuItem.sub_menu_items && menuItem.sub_menu_items.length > 0;

  // This outer condition is fine, it correctly handles expandable groups.
  if (!hasSubItems || !isParentGroupClick) {
    navigationStore.changeNavigationState(false); // Close nav on any item click

    // --- START: RESTRUCTURED LOGIC ---
    // Create one single, clear chain of logic.

    if (menuItem.menuItemLayout === 'Log_Out') {
      if (!isUserLoggedIn.value) {
        console.log("NavigationBar: 'Sign In' clicked. Initiating login.");
        authStore.loginUser();
      } else {
        console.log("NavigationBar: 'Log Out' clicked. Initiating logout.");
        authStore.logoutUser();
      }
    }
    else if (menuItem.menuItemLayout === "My_Account") {
      if (isUserLoggedIn.value) {
        router.push('/my-account');
      } else {
        popupContentType.value = "sign-in-required";
        buttonFlowTemplatePopupRef.value = true;
      }
    }
    else if (menuItem.menuItemLayout === "Enter_Code") {
      if (isUserLoggedIn.value) {
        uiStore.openEnterCodePopup();
      } else {
        popupContentType.value = "enter-code";
        buttonFlowTemplatePopupRef.value = true;
      }
    }
    else if (menuItem.menuItemLayout === "View_Code_Package_Status") {
      if (isUserLoggedIn.value) {
        // Show PackageStatus component from /components/PackageStatus.vue
        uiStore.openPackageStatusPopup();
      } else {
        popupContentType.value = "sign-in-required";
        buttonFlowTemplatePopupRef.value = true;
      }
    }
    else if (menuItem.menu_item_external_url) {
      window.open(menuItem.menu_item_external_url, "_blank");
    }
    else if (menuItem.id) {
      // This is the default case for all other standard menu items.
      router.push({ path: `/menu/${menuItem.id}` });
    }
    // --- END: RESTRUCTURED LOGIC ---
  }
};

const onClickSubMenu = (parentIndex, subIndex, subMenuItem) => {
  // ... (onClickSubMenu remains the same as previous correct version)
  navigationStore.changeNavigationState(false); // Close nav on item click

  if (subMenuItem) {
    const layoutType = subMenuItem.subMenuItemLayout || subMenuItem.menuItemLayout;

    if (layoutType === "My_Account") {
      if (isUserLoggedIn.value) {
        router.push('/my-account');
      } else {
        popupContentType.value = "sign-in-required";
        buttonFlowTemplatePopupRef.value = true;
      }
      return;
    } else if (layoutType === "Enter_Code") {
      console.log("Enter Code Clicked from onClickSubMenu");
      if (isUserLoggedIn.value) {
        uiStore.openEnterCodePopup();
      } else {
        popupContentType.value = "enter-code";
        buttonFlowTemplatePopupRef.value = true;
      }
      return;
    } else if (layoutType === "View_Code_Package_Status") {
      console.log("View Code Package Status Clicked from onClickSubMenu");
      if (isUserLoggedIn.value) {
        // Show PackageStatus component from /components/PackageStatus.vue
        uiStore.openPackageStatusPopup();
      } else {
        popupContentType.value = "sign-in-required";
        buttonFlowTemplatePopupRef.value = true;
      }
      return;
    }

    if (subMenuItem.menu_item_external_url) {
      window.open(subMenuItem.menu_item_external_url, "_blank");
    } else if (menuItems.value[parentIndex]?.id && subMenuItem.id) {
      router.push({ path: `/menu/${menuItems.value[parentIndex].id}/s/${subMenuItem.id}` });
    }
  }
};

// ... (onClickTopMenuParent, handleTopMenuItemClick, getIconUrl remain the same)
const onClickTopMenuParent = (menuItem) => {
  const hasSubItems = menuItem.subItems && menuItem.subItems.length > 0;
  if (!hasSubItems) {
    handleTopMenuItemClick(menuItem);
  }
  // If it has sub-items, v-list-group handles expansion.
};

const handleTopMenuItemClick = (item) => {
  navigationStore.changeNavigationState(false);

  if (item.action === 'internal_function') {
    if (item.name === 'Sign Out') {
      authStore.logoutUser();
    } else if (item.name === 'My Account') {
      if (isUserLoggedIn.value) {
        router.push('/my-account');
      } else {
        popupContentType.value = "sign-in-required";
        buttonFlowTemplatePopupRef.value = true;
      }
    }
  } else if (item.action && typeof item.action === 'string') {
    if (item.newtab) {
      window.open(item.action, '_blank');
    } else {
      if (item.action.startsWith('http://') || item.action.startsWith('https://')) {
        window.location.href = item.action;
      } else {
        router.push(item.action);
      }
    }
  } else if (item.path && typeof item.path === 'string') {
    router.push(item.path);
  }
};

const getIconUrl = (menuItem, isSubItem = false) => {
  const layout = isSubItem ? (menuItem.subMenuItemLayout || menuItem.menuItemLayout) : menuItem.menuItemLayout;

  if (!isUserLoggedIn.value && layout === "Log_Out") {
    return '/assets/img/ic_sign_in_white.png';
  }

  const iconUrl = menuItem?.icon_url || menuItem?.icon;
  if (iconUrl && !iconUrl.includes('landscape_image_broken.png')) {
    return iconUrl;
  }
  return '';
};


// ... (watchEffect for currentRoute and watch for router.currentRoute.value.fullPath remain the same)
watchEffect(() => {
  const routeParams = router.currentRoute.value.params;
  let newRouteId = routeParams.subMenuId || routeParams.menuId;

  if (newRouteId) {
    currentRoute.value = String(newRouteId);
  } else if (menuItems.value.length > 0 && router.currentRoute.value.name === 'FeaturedCategoriesRoot') {
    // Only set to first menu item on root Features page if no specific menuId/subMenuId
    currentRoute.value = String(menuItems.value[0].id);
  }
});

</script>

<style>
.v-navigation-drawer .v-list .v-list-item .v-list-item__prepend .v-avatar.v-theme--light {
  height: 28px !important;
  width: 28px !important;
  min-width: 28px !important;
  /* margin-right: 12px !important; */
  /* Default margin might be fine, adjust if needed */
}

.v-navigation-drawer .v-list .v-list-item .v-list-item__prepend .v-avatar.v-theme--light .v-img .v-img__img {
  height: 100% !important;
  width: 100% !important;
  object-fit: contain !important;
  /* or cover */
}

.v-avatar {
  border-radius: 0 !important;
}

.v-navigation-drawer__content {
  min-width: 350px;
}

nav .v-list-item:hover {
  background-color: #555;
  border-radius: 25px;
}

.v-list-group__items .v-list-item {
  padding-inline-start: calc(var(--v-list-item-padding-start) + 24px) !important;
}


@media screen and (min-width: 1025px) {
  #top_menus {
    display: none !important;
  }
}
</style>