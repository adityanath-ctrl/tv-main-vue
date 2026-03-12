<!-- /src/components/card-rows/ContinueWatchingRow.vue -->
<template>
  <swiper v-if="!isLoadingData || computedData.length > 0" :modules="[Navigation, Mousewheel]"
    @swiper="onSwiperInitialized" :navigation="true" :breakpoints="vodBreakpoints"
    class="card-vod-slider card-slider bg-none" :mousewheel="{
      forceToAxis: true,
      sensitivity: 0.5,
      releaseOnEdges: true,
    }" ref="swiperRefInternal">
    <swiper-slide v-for="(item, idx) in computedData" :key="item.id || idx" class="no-border bg-none subscription-item">
      <CardContinueWatching :item="item" :menuType="props.category.menuType" />
    </swiper-slide>

    <template #button-prev>
      <div @click="prevSlide" class="swiper-top-position swiper-button-prev" data-tv-focusable></div>
    </template>
    <template #button-next>
      <div @click="nextSlide" class="swiper-top-position swiper-button-next" data-tv-focusable></div>
    </template>
  </swiper>
  <div v-else-if="isLoadingData && computedData.length === 0" class="loading-placeholder">
    <!-- Optional: Loading placeholder -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick, getCurrentInstance, type PropType } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/mousewheel';
import type { Swiper as SwiperClass } from 'swiper';

import CardContinueWatching from '../cards/CardContinueWatching.vue';
import type { SVODItem } from '@/store/useSVODStore';
import useSVODStore from '@/store/useSVODStore';
import { vodBreakpoints } from '@/utils/constants';

interface CategoryProp {
  menuType: string;
  id: number | string; // Expect the unique row ID to be on the category object
  // ... other category properties
}

const props = defineProps({
  category: {
    type: Object as PropType<CategoryProp>,
    required: true,
  },
  // No rowDefinitionId prop needed IF category.id is passed in the category object
});

const emit = defineEmits<{
  (e: 'no-content', uniqueRowId: number | string): void;
}>();


const svodStore = useSVODStore();
const swiperRefInternal = ref<SwiperClass | null>(null);
const isLoadingData = ref(true);

const instance = getCurrentInstance();
const instanceUID = instance?.uid || Math.random().toString(36).substring(7);

const onSwiperInitialized = (swiper: SwiperClass) => {
  swiperRefInternal.value = swiper;
};

// Compute the correct array based on menuType
const computedData = computed(() => {
  let dataList: SVODItem[] = []; // <--- Explicitly type dataList
  switch (props.category?.menuType) {
    case 'continue_watching_movies':
      dataList = svodStore.continue_watching_movies;
      break;
    case 'continue_watching_series':
      dataList = svodStore.continue_watching_series;
      break;
    case 'recently_watched':
      dataList = svodStore.recently_watched;
      break;
    case 'continue_watching': // Generic fallback if used
      dataList = svodStore.continue_watching;
      break;
    default:
      dataList = []; // Ensure it's SVODItem[] even in default
  }
  return dataList || []; // || [] ensures it's always an array
});


async function fetchData() {
  const uniqueRowId = props.category.id; // The unique ID identifying this row, passed via the category object.
  const currentMenuType = props.category.menuType; // Get menuType
  const logPrefix = `CardContinueWatchingRow [${instanceUID}] (rowDefId: ${uniqueRowId}, menuType: ${props.category.menuType}):`;

  if (!uniqueRowId) {
    console.error(`${logPrefix} fetchData - category.id (uniqueRowId) is missing from category prop! Cannot emit correctly.`);
    isLoadingData.value = false;
    // Attempt to emit with a fallback, but this indicates a problem in the parent
    emit('no-content', uniqueRowId || props.category.menuType); // Fallback
    return;
  }

  console.log(`${logPrefix} fetchData - Starting.`);
  isLoadingData.value = true;
  let fetchError = false;

  try {
    // NOTE: This action fetches ALL continue watching types,
    // the computed property 'computedData' then selects the correct one.
    await svodStore.setSVODContinueWatching({ menuType: currentMenuType });
    console.log(`${logPrefix} fetchData - Store action setSVODContinueWatching completed.`);
  } catch (error) {
    fetchError = true;
    console.error(`${logPrefix} fetchData - Error during store action:`, error);
  } finally {
    await nextTick(); // Wait for Vue to update computedData based on store changes

    const currentDataLength = computedData.value.length;
    console.log(`${logPrefix} fetchData - In finally. fetchError: ${fetchError}, computedData length: ${currentDataLength}`);

    if (currentDataLength === 0) {
      console.log(`${logPrefix} fetchData - FINAL CHECK: computedData is empty. Emitting 'no-content' for rowDefinitionId: ${uniqueRowId}.`);
      emit('no-content', uniqueRowId as (number | string));
    } else {
      console.log(`${logPrefix} fetchData - FINAL CHECK: computedData has content. Length: ${currentDataLength}. Not emitting 'no-content'.`);
    }

    isLoadingData.value = false;
    console.log(`${logPrefix} fetchData - Finished. isLoadingData: ${isLoadingData.value}`);
  }
}

// Fetch on mount
onMounted(() => {
  console.log(`CardContinueWatchingRow [${instanceUID}] (rowDefId: ${props.category?.id}): Component mounted.`);
  fetchData();
});

// Watch for DATA changes and update swiper if needed
watch(computedData, (newList, oldList) => {
  // Avoid swiper updates if data hasn't meaningfully changed, or if swiper doesn't exist
  if (!swiperRefInternal.value) return;

  const logPrefix = `CardContinueWatchingRow [${instanceUID}] (rowDefId: ${props.category?.id}):`;
  // console.log(`${logPrefix} Watcher on computedData triggered. Length: ${newList?.length ?? 0}`);

  // Update swiper, e.g., if items were added/removed
  nextTick(() => {
    swiperRefInternal.value?.update();
    // Optionally reset to first slide ONLY if list went from 0 to >0,
    // or if required by your UX. Avoid resetting on every minor data update.
    if (oldList && oldList.length === 0 && newList && newList.length > 0) {
      swiperRefInternal.value?.slideTo(0, 0); // Reset to start, 0 speed
    }
  });
});

// Re-fetch if the category prop Object itself changes
watch(() => props.category,
  (newCategory, oldCategory) => {
    if (newCategory && oldCategory && newCategory.id !== oldCategory.id) {
      const logPrefix = `CardContinueWatchingRow [${instanceUID}] (newRowId: ${newCategory.id}):`;
      console.log(`${logPrefix} category prop (row ID) changed. Refetching.`);
      fetchData();
    }
  },
  { deep: true } // Deep watch needed if watching an object
);


// Prev/Next controls
function prevSlide() {
  swiperRefInternal.value?.slidePrev()
}
function nextSlide() {
  swiperRefInternal.value?.slideNext()
}
</script>

<style scoped lang="scss">
@use '@/styles/home' as *;

.swiper-slide {
  position: relative;
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
}

.swiper-button-prev,
.swiper-button-next {
  width: 50px !important;
  height: 100% !important;
  top: 0;
}
</style>