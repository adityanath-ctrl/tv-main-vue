<!-- /src/views/Category/CategoryContents.vue -->
<template>
  <v-container fluid style="padding-left: 28px; padding-right: 28px;" @click="navigationStateChange()">
    <div class="d-flex flex-column text-left mt-10 mr-10">
      <div class="text-h5" style="margin-top: 75px; margin-bottom: 25px;">
        {{ getTitle }}
      </div>
    </div>

    <!-- SKELETONS for SVOD posters (exact same size as CardVod on this page) -->
    <template v-if="isLoading && menuContentType == 'SVOD'">
      <v-row>
        <!-- Match SVOD layout: xs=4 (cols), sm=3, md=3, lg=2  => 3/4/4/6 per row -->
        <v-col v-for="n in skeletonCount" :key="'skel-'+n" cols="4" sm="3" md="3" lg="2">
          <!-- Match CardVod outer padding when :isViewMore="true" => py-3 -->
          <div class="d-flex flex-column bg-none w-100 py-3">
            <!-- Match poster aspect & radius (same as .slider-img-container in CardVod) -->
            <div class="skeleton-wrapper">
              <v-skeleton-loader type="image" class="skeleton-fill" />
            </div>
          </div>
        </v-col>
      </v-row>
    </template>

    <!-- LIVE EVENTS -->
    <v-row v-else-if="menuContentType == 'LIVE_EVENTS'">
      <v-col lg="3" md="4" sm="6" xs="12" v-for="(item, index) in items" :key="index" class="pr-5">
        <div :style="isMobile && 'min-width: 90vw;'">
          <CardEvents :item="item" :isViewMore="true" class="subscription-item" />
        </div>
      </v-col>
    </v-row>

    <!-- SVOD -->
    <v-row v-else-if="menuContentType == 'SVOD'">
      <v-col lg="2" md="3" sm="3" xs="4" v-for="(item, index) in items" :key="index">
        <div :style="isMobile && 'min-width: 20vw;'">
          <CardVod :item="item" :isViewMore="true" class="subscription-item" />
        </div>
      </v-col>
    </v-row>

    <!-- LIVE TV -->
    <v-row v-else-if="menuContentType == 'LIVE_TV'">
      <v-col lg="3" md="4" sm="6" xs="12" v-for="(item, index) in items" :key="index">
        <div :style="isMobile && 'min-width: 90vw;'">
          <CardLiveTV :item="item" :isViewMore="true" class="subscription-item" />
        </div>
      </v-col>
    </v-row>

    <!-- LIVE RADIO -->
    <v-row v-else-if="menuContentType == 'LIVE_RADIO'">
      <v-col lg="2" md="3" sm="3" v-for="(item, index) in items" :key="index">
        <CardRadioStation :item="item" :isViewMore="true" class="subscription-item" />
      </v-col>
    </v-row>

    <!-- LIVE SPORTS -->
    <v-row v-else-if="menuContentType == 'LIVE_SPORTS'">
      <v-col lg="3" md="4" sm="6" xs="12" style="padding: 8px;" v-for="(item, index) in items" :key="index">
        <div :style="isMobile && 'min-width: 90vw;'">
          <CardLiveSports :item="item" :isViewMore="true" class="subscription-item" />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeMount, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useDisplay } from 'vuetify';

import CardLiveTV from "@/components/cards/CardLiveTV.vue";
import CardRadioStation from "@/components/cards/CardRadioStation.vue";
import CardLiveSports from "@/components/cards/CardLiveSports.vue";
import CardEvents from "@/components/cards/CardEvents.vue";
import CardVod from "@/components/cards/CardVod.vue";

import useEventsStore from "@/store/useEventsStore";
import useSVODStore from "@/store/useSVODStore";
import useLiveStore from "@/store/useLiveStore";
import useSportsStore from "@/store/useSportsStore";
import useRadioStationsStore from "@/store/useRadioStationsStore";
import useMenuStore from "@/store/useMenuStore";
import useNavigationStore from "@/store/useNavigationStore";

const route = useRoute();
const { xs: isMobile, mdAndUp, lgAndUp } = useDisplay();

const categoryId = ref(route.params.categoryId);
const menuContentType = ref(route.params.menuContentType);
const menuType = ref(route.params.menuType);

const eventsStore = useEventsStore();
const svodStore = useSVODStore();
const liveStore = useLiveStore();
const sportsStore = useSportsStore();
const radioStationsStore = useRadioStationsStore();
const menuStore = useMenuStore();
const navigationStore = useNavigationStore();

const isLoading = ref(true);

// Skeleton count: 3/4/6 per row → show ~3 rows of shimmer
const perRow = computed(() => (lgAndUp.value ? 6 : (mdAndUp.value ? 4 : 3)));
const skeletonCount = computed(() => perRow.value * 3);

const navigationStateChange = () => navigationStore.changeNavigationState(false);

onBeforeMount(() => window.scrollTo(0, 0));

const getTitle = computed(() => {
  if (isNaN(Number(categoryId.value))) return decodeURIComponent(categoryId.value);
  const menuData = menuStore.SideMenus || [];
  const allCategories = menuData.reduce((acc, curr) => acc.concat(curr.categories || []), []);
  const foundCategory = allCategories.find(cat => String(cat.menuCategoryIds) === String(categoryId.value));
  return foundCategory ? foundCategory.categoryName : "";
});

const items = computed(() => {
  switch (menuContentType.value) {
    case "LIVE_EVENTS":
      return eventsStore.Events[categoryId.value] || [];
    case "SVOD": {
      const cwTypes = ["continue_watching_movies", "continue_watching_series", "continue_watching", "recently_watched"];
      if (cwTypes.includes(menuType.value)) {
        if (menuType.value === "continue_watching_movies") return svodStore.continue_watching_movies || [];
        if (menuType.value === "continue_watching_series") return svodStore.continue_watching_series || [];
        if (menuType.value === "recently_watched") return svodStore.recently_watched || [];
        return svodStore.continue_watching || [];
      }
      return svodStore.SVODs[categoryId.value] || [];
    }
    case "LIVE_TV":
      return liveStore.tv_channels[categoryId.value] || [];
    case "LIVE_RADIO":
      return radioStationsStore.radio_stations[categoryId.value] || [];
    case "LIVE_SPORTS":
      return sportsStore.sports_events[categoryId.value] || [];
    default:
      return [];
  }
});

async function loadCategory() {
  isLoading.value = true;
  try {
    switch (menuContentType.value) {
      case "LIVE_EVENTS":
        await eventsStore.setLiveEventsByCategoryId({ CategoryId: categoryId.value });
        break;

      case "SVOD": {
        const cwTypes = ["continue_watching_movies", "continue_watching_series", "continue_watching", "recently_watched"];
        if (cwTypes.includes(menuType.value)) {
          if (menuType.value === "continue_watching_movies") {
            await svodStore.setSVODContinueWatching({ menuType: 'continue_watching_movies' });
          } else if (menuType.value === "continue_watching_series") {
            await svodStore.setSVODContinueWatching({ menuType: 'continue_watching_series' });
          } else if (menuType.value === "recently_watched") {
            await svodStore.setSVODContinueWatching({ menuType: 'recently_watched' });
          } else {
            await svodStore.setSVODContinueWatching({ menuType: 'continue_watching' });
          }
        } else {
          await svodStore.setSVODByCategoryId({ CategoryId: categoryId.value });
        }
        break;
      }

      case "LIVE_TV":
        await liveStore.getLiveTVByCategoryId({ CategoryId: categoryId.value });
        break;

      case "LIVE_RADIO":
        await radioStationsStore.setRadioStationsByCategoryId({ CategoryId: categoryId.value });
        break;

      case "LIVE_SPORTS":
        await sportsStore.getLiveSportsByCategoryId({ CategoryId: categoryId.value });
        break;

      default:
        break;
    }
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadCategory);

watch(
  () => [route.params.categoryId, route.params.menuContentType, route.params.menuType],
  ([newCat, newType, newMenuType]) => {
    categoryId.value = newCat;
    menuContentType.value = newType;
    menuType.value = newMenuType;
    loadCategory();
  }
);
</script>

<style>
/* Exact poster box sizing to match CardVod.vue */
.skeleton-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 150%;      /* 3:2 portrait box like CardVod */
  border-radius: 10px;
  overflow: hidden;
}

/* Force the loader and its internal “bone” to fill the whole box */
.skeleton-fill {
  position: absolute !important;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  border-radius: 10px;
  display: block;            /* helps Safari/WebKit */
}

/* Vuetify internals: make the bone fill the container */
.skeleton-fill .v-skeleton-loader__image,
.skeleton-fill .v-skeleton-loader__bone {
  width: 100% !important;
  height: 100% !important;
  border-radius: 10px;
}

</style>
