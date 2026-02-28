<template>
  <swiper 
    v-if="!isLoadingInitialData || LiveTV.length > 0"
    :modules="[Navigation, Mousewheel]" 
    :navigation="true" 
    :breakpoints="liveTvBreakpoints" 
    ref="swiperRef"
    class="card-vod-slider card-slider bg-none" 
    :mousewheel="{
      forceToAxis: true,
      sensitivity: 0.5,
      releaseOnEdges: true,
    }" 
    :direction="'horizontal'" 
    @slideChange="onSlideChange"
  >
    <swiper-slide v-for="(item, index) in LiveTV" :key="item.id || index" class="item no-border bg-none subscription-item">
      <CardLiveTV :item="item" />
    </swiper-slide>

    <template #button-prev>
      <div @click="swiperRef?.swiperInstance?.slidePrev()" class="swiper-top-position swiper-button-prev"></div>
    </template>
    <template #button-next>
      <div @click="swiperRef?.swiperInstance?.slideNext()" class="swiper-top-position swiper-button-next"></div>
    </template>
  </swiper>
  <div v-else-if="isLoadingInitialData && LiveTV.length === 0" class="loading-placeholder">
    <!-- Optional: You can put a v-progress-circular or text here -->
    <!-- <p>Loading category {{ props.categoryId }}...</p> -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, watch, ref, nextTick, getCurrentInstance } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Mousewheel } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/mousewheel';

import CardLiveTV from '../cards/CardLiveTV.vue';
import useLiveStore from '@/store/useLiveStore';
import { liveTvBreakpoints } from '@/utils/constants';

const props = defineProps({
  categoryId: Number, // This is menuCategoryIds (for content fetching based on API category ID)
  rowDefinitionId: { // This is the unique category.id from the menu definition (for identifying this specific row)
    type: [Number, String],
    required: true,
  },
});
const emit = defineEmits(['no-content']);

const liveStore = useLiveStore();
const swiperRef = ref<any>(null);
const isLoadingInitialData = ref(true); 

const instance = getCurrentInstance();
const instanceUID = instance?.uid || Math.random().toString(36).substring(7);

const LiveTV = computed(() => {
  const logPrefix = `CardLiveTVRow [${instanceUID}] (rowDefId: ${props.rowDefinitionId}, contentId: ${props.categoryId}): LiveTV Computed -`;
  // Content fetching still uses props.categoryId
  if (props.categoryId === undefined || props.categoryId === null) { 
    // console.log(`${logPrefix} contentId (categoryId prop) is invalid, returning [].`);
    return [];
  }
  const channels = liveStore.tv_channels[props.categoryId];
  // console.log(`${logPrefix} channels from store for contentId ${props.categoryId}:`, channels ? channels.length : 'is undefined');
  return channels || [];
});

async function fetchDataForCategory() {
  const contentFetchingId = props.categoryId; // ID used to fetch content from store/API
  const uniqueRowId = props.rowDefinitionId; // ID used to identify this specific row component instance
  const logPrefix = `CardLiveTVRow [${instanceUID}] (rowDefId: ${uniqueRowId}, contentId: ${contentFetchingId}):`;

  if (contentFetchingId === undefined || contentFetchingId === null) {
    console.log(`${logPrefix} fetchDataForCategory - contentId (categoryId prop) is invalid.`);
    isLoadingInitialData.value = false; 
    // The 'finally' block will run, check LiveTV (which will be empty for this invalid contentId), and emit with uniqueRowId.
    // No direct emit here.
    // Ensure finally block still runs by not returning immediately, or by ensuring it's called if we return
    // For simplicity, let it fall through to finally.
  } else {
    console.log(`${logPrefix} fetchDataForCategory - Starting.`);
    isLoadingInitialData.value = true;
  }
  
  let fetchError = false;

  try {
    // Only fetch if contentFetchingId is valid
    if (contentFetchingId !== undefined && contentFetchingId !== null) {
        await liveStore.getLiveTVByCategoryId({ CategoryId: contentFetchingId });
        console.log(`${logPrefix} fetchDataForCategory - Store action getLiveTVByCategoryId completed for contentId ${contentFetchingId}.`);
    } else {
        // If contentFetchingId was invalid from the start, we effectively skip the fetch
        // and LiveTV will be empty, leading to no-content emission in finally.
        console.log(`${logPrefix} fetchDataForCategory - Skipped store action due to invalid contentId.`);
    }
  } catch (error) {
    fetchError = true;
    console.error(`${logPrefix} fetchDataForCategory - Error during store action for contentId ${contentFetchingId}:`, error);
  } finally {
    await nextTick(); 

    const currentLiveTVLength = LiveTV.value.length; 
    console.log(`${logPrefix} fetchDataForCategory - In finally. rowDefId (current): ${props.rowDefinitionId}, contentId (current): ${props.categoryId}, fetchError: ${fetchError}, LiveTV length: ${currentLiveTVLength}`);

    if (currentLiveTVLength === 0) {
      console.log(`${logPrefix} fetchDataForCategory - FINAL CHECK: LiveTV is empty. Emitting 'no-content' for rowDefinitionId: ${uniqueRowId}.`);
      emit('no-content', uniqueRowId); // <<< EMIT with props.rowDefinitionId
    } else {
      console.log(`${logPrefix} fetchDataForCategory - FINAL CHECK: LiveTV has content. Length: ${currentLiveTVLength}. Not emitting 'no-content' for rowDefinitionId: ${uniqueRowId}.`);
    }

    if (props.rowDefinitionId === uniqueRowId) { // Check against the captured uniqueRowId
        isLoadingInitialData.value = false;
    }
    console.log(`${logPrefix} fetchDataForCategory - Finished. isLoadingInitialData (for rowDefId ${props.rowDefinitionId}): ${isLoadingInitialData.value}`);
  }
}

onMounted(() => {
  const logPrefix = `CardLiveTVRow [${instanceUID}] (rowDefId: ${props.rowDefinitionId}, contentId: ${props.categoryId}):`;
  console.log(`${logPrefix} Component mounted.`);
  fetchDataForCategory();
});

watch(() => [props.categoryId, props.rowDefinitionId], ([newContentId, newRowId], [oldContentId, oldRowId]) => {
  const logPrefix = `CardLiveTVRow [${instanceUID}] (newRowId: ${newRowId}, newContentId: ${newContentId}):`;
  // Refetch if either the content ID or the row definition ID changes (though rowDefId changing on same instance is rare with proper keys)
  if ((newContentId !== undefined && newContentId !== null && newContentId !== oldContentId) || 
      (newRowId !== undefined && newRowId !== null && newRowId !== oldRowId)) {
    console.log(`${logPrefix} categoryId or rowDefinitionId prop changed. Old (content/row): (${oldContentId}/${oldRowId}). Refetching for new (content/row): (${newContentId}/${newRowId}).`);
    fetchDataForCategory();
  }
}, { immediate: false });


const onSlideChange = () => {
  const logPrefix = `CardLiveTVRow [${instanceUID}] (${props.categoryId}):`;
  const swiperInstance = swiperRef.value?.swiperInstance || swiperRef.value?.swiper;
  if (swiperInstance) {
    // console.log(`${logPrefix} Slide changed to:`, swiperInstance.activeIndex);
  }
};
</script>

<style scoped lang="scss">
@use '../../styles/home' as *;

.swiper-slide {
  position: relative;
  /* width: 100%; */ /* Swiper handles width */
  border-radius: 10px;
  overflow: hidden;
}

.swiper-button-prev,
.swiper-button-next {
  width: 50px !important;
  height: 100% !important;
  top: 0;
  z-index: 10; 
}
.loading-placeholder {
  min-height: 100px; /* Adjust as needed */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  color: white; /* Or your theme's text color */
  /* background-color: #333; */ /* Optional: if you want a placeholder bg */
  border-radius: 10px; /* Match swiper slide style */
  margin: 0 5px; /* Similar to swiper-slide margins if any */
}
</style>