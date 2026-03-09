<!-- /src/components/NavigationBar.vue -->
<template>
  <v-navigation-drawer expand-on-hover enable-resize-watcher class="lighten-3" app
    style="color: #fff; box-shadow: 0px 0px 0px 0px; border: 0px; top: 0px; padding-top: 105px; padding-left: 20px; padding-right: 10vw; height: 100vh"
    :style="showMenuBar ? backgroundStyle_show : backgroundStyle_hide">
    <v-list nav :style="navStyle">
      <template v-for="(menuItem, index) in menuItems" :key="menuItem.id">

        <v-list-group
          v-if="menuItem.menuType === 'SUB_MENU_ITEMS' && menuItem.sub_menu_items && menuItem.sub_menu_items.length > 0"
          :value="menuItem.id">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              class="mb-3 focusable-item"
              :class="{ 'kb-focused': getFlatIndex(index, null) === focusedIndex }"
              :prepend-avatar="getIconUrl(menuItem)"
              :style="currentRoute == menuItem.id ? activeItemStyle : inActiveItemStyle"
              @click="onClickParentMenu(index, menuItem, true)"
              :title="menuItem?.menuItemName">
            </v-list-item>
          </template>

          <v-list-item
            v-for="(subItem, subIndex) in menuItem.sub_menu_items"
            :key="subItem.id"
            class="custom-sub-menu-item focusable-item"
            :class="{ 'kb-focused': getFlatIndex(index, subIndex) === focusedIndex }"
            :prepend-avatar="getIconUrl(subItem, true)"
            :style="currentRoute == subItem.id ? activeItemStyle : inActiveItemStyle"
            @click="onClickSubMenu(index, subIndex, subItem)"
            :title="subItem?.subMenuName">
          </v-list-item>
        </v-list-group>

        <v-list-item
          v-else
          :key="menuItem.id + '_single'"
          class="mb-3 focusable-item"
          :class="{ 'kb-focused': getFlatIndex(index, null) === focusedIndex }"
          :prepend-avatar="getIconUrl(menuItem)"
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
      <template #sign-in-required>
        <v-card-title class="d-flex justify-center">
          <h1 class="popupHeading">Log In Required</h1>
        </v-card-title>
        <v-card-text class="popupSubHeading">
          You must be logged in to access this feature.
        </v-card-text>
        <v-card-actions class="d-flex justify-center align-center">
          <v-btn outlined color="white" class="popup-btn" @click="closeButtonFlowTemplate">Cancel</v-btn>
          <v-btn outlined color="white" class="popup-btn" @click="handleSignIn">Login</v-btn>
        </v-card-actions>
      </template>

      <template #enter-code>
        <v-card-title class="d-flex justify-center">
          <h1 class="popupHeading">Log In Required</h1>
        </v-card-title>
        <v-card-text class="popupSubHeading">
          Please log in to your account to enter a code.
        </v-card-text>
        <v-card-actions class="d-flex justify-center align-center">
          <v-btn outlined color="white" class="popup-btn" @click="closeButtonFlowTemplate">Cancel</v-btn>
          <v-btn outlined color="white" class="popup-btn" @click="handleSignIn">Login</v-btn>
        </v-card-actions>
      </template>
    </ButtonFlowTemplate>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed, reactive, watch, watchEffect, onMounted, onUnmounted } from 'vue';
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
const showMenuBar = computed(() => navigationStore.getNavigationState);

// ─── KEYBOARD NAV: pure index tracking, zero DOM focus() calls ───────────────
const focusedIndex = ref(0);

// Flat ordered list of every nav item (parents + their sub-items in order)
const flatItems = computed(() => {
  const result = [];
  menuItems.value.forEach((menuItem, index) => {
    const hasSubItems =
      menuItem.menuType === 'SUB_MENU_ITEMS' &&
      menuItem.sub_menu_items?.length > 0;

    result.push({ parentIndex: index, subIndex: null, menuItem, subItem: null });

    if (hasSubItems) {
      menuItem.sub_menu_items.forEach((subItem, subIndex) => {
        result.push({ parentIndex: index, subIndex, menuItem, subItem });
      });
    }
  });
  return result;
});

// Maps (parentIndex, subIndex) → position in flatItems
const getFlatIndex = (parentIndex, subIndex) => {
  return flatItems.value.findIndex(
    (item) => item.parentIndex === parentIndex && item.subIndex === subIndex
  );
};

const handleKeyDown = (e) => {
  // Only handle keys if sidebar is open
  if (!navigationStore.getNavigationState) return;

  if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) return;

  const total = flatItems.value.length;
  if (total === 0) return;

  if (e.key === 'ArrowRight') {
    // If pressing Right on the sidebar, close it and move to main content
    navigationStore.changeNavigationState(false);
    e.preventDefault();
    return;
  }

  e.preventDefault();

  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
    focusedIndex.value = Math.min(focusedIndex.value + 1, total - 1);

  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    focusedIndex.value = Math.max(focusedIndex.value - 1, 0);

  } else if (e.key === 'Enter') {
    const item = flatItems.value[focusedIndex.value];
    if (!item) return;
    if (item.subItem) {
      onClickSubMenu(item.parentIndex, item.subIndex, item.subItem);
    } else {
      const hasSubItems =
        item.menuItem.menuType === 'SUB_MENU_ITEMS' &&
        item.menuItem.sub_menu_items?.length > 0;
      onClickParentMenu(item.parentIndex, item.menuItem, hasSubItems);
    }
  }
};

// Reset to top whenever drawer opens
watch(showMenuBar, (isOpen) => {
  if (isOpen) focusedIndex.value = 0;
});

onMounted(() => document.addEventListener('keydown', handleKeyDown));
onUnmounted(() => document.removeEventListener('keydown', handleKeyDown));

// ─── SORTING ─────────────────────────────────────────────────────────────────
const pos = (x) => {
  const n = Number(x?.position);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
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

// ─── STYLES ──────────────────────────────────────────────────────────────────
const backgroundStyle_hide = reactive({
  background: "transparent",
  width: "0vw",
  paddingRight: "6px",
  transform: "translateX(-2000%)!important",
  visibility: "hidden",
});

const backgroundStyle_show = reactive({
  background: "linear-gradient(90deg, " + SIDEEFFECTBAR_1 + " 0%, " + SIDEEFFECTBAR_2 + " 53%, " + SIDEEFFECTBAR_3 + " 86%, " + SIDEEFFECTBAR_4 + " 100%)",
  width: "450px",
  paddingRight: "10vw",
  transform: "translateX(0%)!important",
});

const navStyle        = reactive({ textAlign: "left", color: FONT_COLOR_1 });
const activeItemStyle = reactive({ backgroundColor: HIGHLIGHT_COLOR_1, borderRadius: "25px" });
const inActiveItemStyle = reactive({ backgroundColor: "", borderLeft: "", borderTopLeftRadius: "", borderBottomLeftRadius: "" });

// ─── POPUP ───────────────────────────────────────────────────────────────────
const buttonFlowTemplatePopupRef = ref(false);
const popupContentType = ref("");
const loginButtonDisabled = ref(false);

function closeButtonFlowTemplate() { buttonFlowTemplatePopupRef.value = false; }
const closePopup = () => { buttonFlowTemplatePopupRef.value = false; };
const handleSignIn = () => { closePopup(); if (instance) authStore.loginUser(); };

watch(buttonFlowTemplatePopupRef, (v) => { if (v) loginButtonDisabled.value = false; });

const menuItems = computed(() => {
  const sideMenus = menuStore.SideMenus || [];
  return sortParents(sideMenus).map(mi => ({
    ...mi,
    sub_menu_items: sortSubs(mi.sub_menu_items || [])
  }));
});

const onClickParentMenu = (index, menuItem, isParentGroupClick = false) => {
  const hasSubItems = menuItem.menuType === 'SUB_MENU_ITEMS' && menuItem.sub_menu_items?.length > 0;

  if (!hasSubItems || !isParentGroupClick) {
    navigationStore.changeNavigationState(false);

    if (menuItem.menuItemLayout === 'Log_Out') {
      !isUserLoggedIn.value ? authStore.loginUser() : authStore.logoutUser();
    } else if (menuItem.menuItemLayout === "My_Account") {
      isUserLoggedIn.value ? router.push('/my-account') : (() => { popupContentType.value = "sign-in-required"; buttonFlowTemplatePopupRef.value = true; })();
    } else if (menuItem.menuItemLayout === "Enter_Code") {
      isUserLoggedIn.value ? uiStore.openEnterCodePopup() : (() => { popupContentType.value = "enter-code"; buttonFlowTemplatePopupRef.value = true; })();
    } else if (menuItem.menuItemLayout === "View_Code_Package_Status") {
      isUserLoggedIn.value ? uiStore.openPackageStatusPopup() : (() => { popupContentType.value = "sign-in-required"; buttonFlowTemplatePopupRef.value = true; })();
    } else if (menuItem.menu_item_external_url) {
      window.open(menuItem.menu_item_external_url, "_blank");
    } else if (menuItem.id) {
      router.push({ path: `/menu/${menuItem.id}` });
    }
  }
};

const onClickSubMenu = (parentIndex, subIndex, subMenuItem) => {
  navigationStore.changeNavigationState(false);
  if (!subMenuItem) return;

  const layoutType = subMenuItem.subMenuItemLayout || subMenuItem.menuItemLayout;

  if (layoutType === "My_Account") {
    isUserLoggedIn.value ? router.push('/my-account') : (() => { popupContentType.value = "sign-in-required"; buttonFlowTemplatePopupRef.value = true; })();
    return;
  } else if (layoutType === "Enter_Code") {
    isUserLoggedIn.value ? uiStore.openEnterCodePopup() : (() => { popupContentType.value = "enter-code"; buttonFlowTemplatePopupRef.value = true; })();
    return;
  } else if (layoutType === "View_Code_Package_Status") {
    isUserLoggedIn.value ? uiStore.openPackageStatusPopup() : (() => { popupContentType.value = "sign-in-required"; buttonFlowTemplatePopupRef.value = true; })();
    return;
  }

  if (subMenuItem.menu_item_external_url) {
    window.open(subMenuItem.menu_item_external_url, "_blank");
  } else if (menuItems.value[parentIndex]?.id && subMenuItem.id) {
    router.push({ path: `/menu/${menuItems.value[parentIndex].id}/s/${subMenuItem.id}` });
  }
};

const getIconUrl = (menuItem, isSubItem = false) => {
  const layout = isSubItem ? (menuItem.subMenuItemLayout || menuItem.menuItemLayout) : menuItem.menuItemLayout;
  if (!isUserLoggedIn.value && layout === "Log_Out") return '/assets/img/ic_sign_in_white.png';
  const iconUrl = menuItem?.icon_url || menuItem?.icon;
  if (iconUrl && !iconUrl.includes('landscape_image_broken.png')) return iconUrl;
  return '';
};

watchEffect(() => {
  const routeParams = router.currentRoute.value.params;
  let newRouteId = routeParams.subMenuId || routeParams.menuId;
  if (newRouteId) {
    currentRoute.value = String(newRouteId);
  } else if (menuItems.value.length > 0 && router.currentRoute.value.name === 'FeaturedCategoriesRoot') {
    currentRoute.value = String(menuItems.value[0].id);
  }
});
</script>

<style>
.v-navigation-drawer .v-list .v-list-item .v-list-item__prepend .v-avatar.v-theme--light {
  height: 28px !important;
  width: 28px !important;
  min-width: 28px !important;
}

.v-navigation-drawer .v-list .v-list-item .v-list-item__prepend .v-avatar.v-theme--light .v-img .v-img__img {
  height: 100% !important;
  width: 100% !important;
  object-fit: contain !important;
}

.v-avatar { border-radius: 0 !important; }

.v-navigation-drawer__content { min-width: 350px; }

nav .v-list-item:hover {
  background-color: #555;
  border-radius: 25px;
}

.v-list-group__items .v-list-item {
  padding-inline-start: calc(var(--v-list-item-padding-start) + 24px) !important;
}

/* Keyboard focus highlight — driven by Vue class, NOT :focus pseudo */
.focusable-item {
  outline: none !important;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.focusable-item.kb-focused {
  transform: scale(1.05);
  box-shadow: 0 0 15px #00ffcc !important;
  background: rgba(255, 255, 255, 0.1) !important;
  border-radius: 25px;
}

@media screen and (min-width: 1025px) {
  #top_menus { display: none !important; }
}
</style>