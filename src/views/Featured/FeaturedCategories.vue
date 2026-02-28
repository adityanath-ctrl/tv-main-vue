<!-- /src/views/Featured/FeaturedCategories.vue -->
<template>
  <v-container fluid style="padding:0px" @click="navigationStateChange()">
    <!-- Featured slider (shows when there are featured items) -->
    <v-row :style="{ marginBottom: hasFeatured ? '30px' : '0px' }">
      <v-col cols="12" md="12">
        <Slider v-if="hasFeatured" :FeaturedSlider="FeaturedItems" />
      </v-col>
    </v-row>

    <!-- Spacer only when there's NO slider: pushes rows below TopBar -->
    <div class="topbar-spacer" :style="{ height: (hasFeatured || isEPG) ? '0px' : spacerHeight }" aria-hidden="true">
    </div>

    <!-- Iterate over filteredCategories so empty ones are removed -->
    <v-row dense v-for="category in filteredCategories" :key="category.id" :id="`cat-item-${category.id}`">
      <!-- Category header (only show if content exists) -->
      <template v-if="shouldShowCategoryHeader(category)">
        <v-col cols="8">
          <h4 :class="['text-left fcw', isMobile ? 'ml-4' : 'ml-10']">
            {{ category.categoryName }}
          </h4>
        </v-col>
        <v-col cols="4" :class="viewMoreColClass">
          <div
            :class="['fcw text font-weight-bold', isMobile ? 'ml-2' : 'ml-10']"
            :style="viewMoreButtonStyle"
            @click="goToCategoryPage(category.menuCategoryIds || category.categoryName, category.menuContentType, category.menuType)"
          >
            View All
          </div>
        </v-col>
      </template>


      <v-col cols="12" md="12">
        <CardContinueWatchingRow
          v-if="(category.menuType.includes('continue_watching')) && category.menuContentType == 'SVOD' && isUserLoggedIn"
          :category="category" @no-content="handleNoContent(category.id)" />
        <CardEventsRow :categoryId="Number(category.menuCategoryIds)" :rowDefinitionId="category.id"
          :contentProviderId="category.menu_item_content_provider ? Number(category.menu_item_content_provider) : undefined"
          v-if="category.menuContentType == 'LIVE_EVENTS'" @no-content="handleNoContent(category.id)" />

        <CardLiveTVRow :categoryId="Number(category.menuCategoryIds)" :rowDefinitionId="category.id"
          :contentProviderId="category.menu_item_content_provider ? Number(category.menu_item_content_provider) : undefined"
          v-if="category.menuContentType == 'LIVE_TV'" @no-content="handleNoContent(category.id)" />

        <CardVodRow :categoryId="Number(category.menuCategoryIds)" :rowDefinitionId="category.id"
          :contentProviderId="category.menu_item_content_provider ? Number(category.menu_item_content_provider) : undefined"
           :menuContentType="category.menuContentType"
           :menuType="category.menuType"
           :categoryName="category.categoryName"
          v-if="category.menuCategoryIds !== '' && category.menuContentType == 'SVOD'
            && !category.menuType.includes('continue_watching') && !category.menuType.includes('recently_watched')"
          @no-content="handleNoContent(category.id)" />

        <CardLiveSportsRow :categoryId="Number(category.menuCategoryIds)" :rowDefinitionId="category.id"
          :contentProviderId="category.menu_item_content_provider ? Number(category.menu_item_content_provider) : undefined"
          v-if="category.menuContentType == 'LIVE_SPORTS'" @no-content="handleNoContent(category.id)" />

        <CardRadioStationsRow :categoryId="Number(category.menuCategoryIds)" :rowDefinitionId="category.id"
          :contentProviderId="category.menu_item_content_provider ? Number(category.menu_item_content_provider) : undefined"
          v-if="category.menuContentType == 'LIVE_RADIO'" @no-content="handleNoContent(category.id)" />

        <CardRecentlyWatchedRow
          v-if="(category.menuType.includes('recently_watched')) && category.menuContentType == 'SVOD' && isUserLoggedIn"
          :category="category" @no-content="handleNoContent(category.id)" />
      </v-col>
    </v-row>

    <div v-if="isEPG && epgChannelListMap?.length > 0">
      <EPG />
    </div>
  </v-container>
</template>

<script setup lang="js">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import EPG from '@/components/epg/index.vue';
import Slider from '@/components/Slider.vue';
import CardEventsRow from '@/components/card-rows/CardEventsRow.vue';
import CardLiveTVRow from '@/components/card-rows/CardLiveTVRow.vue';
import CardLiveSportsRow from '@/components/card-rows/CardLiveSportsRow.vue';
import CardRadioStationsRow from '@/components/card-rows/CardRadioStationsRow.vue';
import CardContinueWatchingRow from '@/components/card-rows/CardContinueWatchingRow.vue';
import CardRecentlyWatchedRow from '@/components/card-rows/CardRecentlyWatchedRow.vue';
import CardVodRow from '@/components/card-rows/CardVodRow.vue';
import useEPGStore from '@/store/useEPGStore';
import useMenuStore from '@/store/useMenuStore';
import { useDisplay } from 'vuetify';
import useNavigationStore from '@/store/useNavigationStore';
import useLiveStore from '@/store/useLiveStore';
import useAuthStore from '@/store/useAuthStore';

const { mobile: isMobile } = useDisplay();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isUserLoggedIn = computed(() => authStore.isUserLoggedIn);
const menuStore = useMenuStore();
const epgStore = useEPGStore();

const FeaturedItems = ref([]);
const Categories = ref([]);
const emptyCategoryRowIds = ref([]);

// was: const viewMoreButtonStyle = ref({...})
const viewMoreButtonStyle = computed(() => ({
  cursor: 'pointer',
  display: 'inline-flex',          // don't take full width
  alignItems: 'center',
  justifyContent: 'flex-end',
  whiteSpace: 'nowrap',            // force single line
  width: 'auto',                   // let it size naturally
  minWidth: isMobile.value ? '0' : '120px'
}));

// new: smaller right padding on mobile to give the text more room
const viewMoreColClass = computed(() =>
  isMobile.value
    ? 'd-flex flex-row-reverse pr-2'
    : 'd-flex flex-row-reverse pr-6 pr-sm-16'
);

const isEPG = ref(false);
const isEnterCodeClicked = ref(false);
const isViewPackageStatusClicked = ref(false);

const hasFeatured = computed(() => Array.isArray(FeaturedItems.value) && FeaturedItems.value.length > 0);

/* -------- TopBar height measurement for spacer -------- */
const topBarHeight = ref(64); // sensible default
function measureTopBar() {
  try {
    const el = document.querySelector('.v-app-bar');
    const h = el?.getBoundingClientRect?.().height || el?.offsetHeight;
    if (h && Number.isFinite(h)) topBarHeight.value = Math.round(h);
  } catch { }
}
onMounted(() => {
  measureTopBar();
  window.addEventListener('resize', measureTopBar, { passive: true });
  // safety: re-measure after next tick in case TopBar animates in
  nextTick(measureTopBar);
});
onBeforeUnmount(() => window.removeEventListener('resize', measureTopBar));

const spacerHeight = computed(() => `${topBarHeight.value + 8}px`); // +8px breathing room
/* ------------------------------------------------------ */

const epgChannelListMap = computed(() => epgStore.epgChannelListMap || []);
const sideMenusFromStore = computed(() => menuStore.SideMenus);

const shouldShowCategoryHeader = (category) => {
  const alwaysShowHeaderTypes = ['LIVE_EVENTS', 'LIVE_TV', 'LIVE_RADIO', 'LIVE_SPORTS'];
  if (alwaysShowHeaderTypes.includes(category.menuContentType)) return true;
  if (category.menuContentType === 'SVOD') {
    const excluded = ['continue_watching_series', 'continue_watching_movies', 'recently_watched', 'continue_watching'];
    return !excluded.includes(category.menuType) || isUserLoggedIn.value;
  }
  return false;
};

const filteredCategories = computed(() =>
  Categories.value.filter(category => !emptyCategoryRowIds.value.includes(String(category.id)))
);

const prevMenuId = ref(null);
const prevSubMenuId = ref(null);

const processMenuData = (currentMenuIdParam, currentSubMenuIdParam) => {
  const currentResolvedMenuId = currentMenuIdParam;
  const currentResolvedSubMenuId = currentSubMenuIdParam;

  const mainContextChanged =
    (currentResolvedMenuId !== prevMenuId.value) || (currentResolvedSubMenuId !== prevSubMenuId.value);

  let needsEPGCall = false;

  if (mainContextChanged) {
    FeaturedItems.value = [];
    Categories.value = [];
    emptyCategoryRowIds.value = [];
    isEPG.value = false;
    isEnterCodeClicked.value = false;
    isViewPackageStatusClicked.value = false;
  }

  const currentSideMenus = sideMenusFromStore.value;
  if (!currentSideMenus || currentSideMenus.length === 0) {
    Categories.value = []; emptyCategoryRowIds.value = []; isEPG.value = false;
    prevMenuId.value = currentResolvedMenuId; prevSubMenuId.value = currentResolvedSubMenuId;
    return;
  }

  let activeMenuItem = null;
  const menuIdToUse = currentResolvedMenuId !== undefined ? currentResolvedMenuId : (currentSideMenus[0] ? String(currentSideMenus[0].id) : null);

  if (menuIdToUse) {
    const topLevelMenuItem = currentSideMenus.find(({ id }) => String(id) === String(menuIdToUse));
    if (topLevelMenuItem) {
      if (currentResolvedSubMenuId && topLevelMenuItem.sub_menu_items?.length > 0) {
        activeMenuItem = topLevelMenuItem.sub_menu_items.find(({ id }) => String(id) === String(currentResolvedSubMenuId));
      } else {
        activeMenuItem = topLevelMenuItem;
      }
    }
  }

  if (!activeMenuItem && currentSideMenus.length > 0 && prevMenuId.value === null && prevSubMenuId.value === null) {
    activeMenuItem = currentSideMenus[0];
  }

  if (activeMenuItem) {
    const layout = activeMenuItem.menuItemLayout || activeMenuItem.subMenuItemLayout;

    if (layout === 'TV_Layout_1') {
      if (!isEPG.value) {
        isEPG.value = true;
        needsEPGCall = true;
      }
      Categories.value = [];
      if (mainContextChanged) emptyCategoryRowIds.value = [];
    } else {
      isEPG.value = false;
      FeaturedItems.value = activeMenuItem.featured_items?.length ? activeMenuItem.featured_items : [];
      if (activeMenuItem.categories?.length) {
        Categories.value = [...activeMenuItem.categories].sort((a, b) => (a.position || 0) - (b.position || 0));
      } else {
        Categories.value = [];
      }
      // re-measure after the slider show/hide toggles, just in case
      nextTick(measureTopBar);
    }
  } else {
    FeaturedItems.value = []; Categories.value = []; emptyCategoryRowIds.value = []; isEPG.value = false;
  }

  if (needsEPGCall) epgStore.getChannelCategories();

  prevMenuId.value = currentResolvedMenuId;
  prevSubMenuId.value = currentResolvedSubMenuId;
};

const goToCategoryPage = (idOrName, menuContentType, menuType) => {
  router.push({ path: `/category/${idOrName}/${menuContentType}/${menuType || ''}` });
};

const handleNoContent = (categoryRowDefinitionId) => {
  const idStr = String(categoryRowDefinitionId);
  if (!emptyCategoryRowIds.value.includes(idStr)) emptyCategoryRowIds.value.push(idStr);
};

const navigationStateChange = () => {
  const navigationStoreInstance = useNavigationStore();
  navigationStoreInstance.changeNavigationState(false);
};

const getEPGNowTime = () => {
  const liveStoreInstance = useLiveStore();
  liveStoreInstance.getEPGNowTime();
};

watch(
  [sideMenusFromStore, () => route.path],
  async ([newMenu, newPath], [oldMenu, oldPath]) => {
    const menusJustLoaded = (!oldMenu || oldMenu.length === 0) && newMenu && newMenu.length > 0;
    const onRootPath = newPath === '/';

    if (menusJustLoaded && onRootPath) {
      const firstMenuItem = newMenu[0];
      if (firstMenuItem?.id) {
        router.replace({ path: `/menu/${firstMenuItem.id}` });
        return;
      }
    } else {
      await nextTick();
      processMenuData(route.params.menuId, route.params.subMenuId);
    }
  },
  { immediate: true, deep: true }
);

onMounted(() => {
  getEPGNowTime();
});
</script>

<style>

.topbar-spacer {
  width: 100%;
  pointer-events: none;
}

.v-row {
  margin-bottom: 0 !important;
}

.description-all {
  margin-left: 50px;
}

@media screen and (max-width: 1024px) {
  .card-slider {
    padding-left: 20px !important;
  }
}

@media screen and (max-width: 750px) {
  .run-time {
    display: none;
  }

  .view-more {
    visibility: hidden;
  }

  .description-all {
    font-size: 16px !important;
    margin-left: 10px;
  }

  .d-flex.flex-column.bg-none.live-event.w-100.py-10 {
    padding: 10px 0 !important;
  }
  
  .card-slider {
    padding-left: 20px !important;
  }
}
</style>
