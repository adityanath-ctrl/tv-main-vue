<template>
  <swiper
    v-if="!isLoadingData || liveEvents.length > 0"
    :modules="[Navigation, Mousewheel]"
    :navigation="true"
    :breakpoints="eventsBreakpoints"
    ref="swiperRefInternal"
    class="bg-none card-slider card-events-slider"
    :mousewheel="{
      forceToAxis: true,
      sensitivity: 0.5,
      releaseOnEdges: true,
    }"
    :direction="'horizontal'" 
    @slideChange="onSlideChange"
  >
    <swiper-slide
      v-for="(item, idx) in liveEvents"
      :key="item.id || idx"
      class="item no-border bg-none subscription-item"
    >
      <CardEvents :item="item" />
    </swiper-slide>

        <template #button-prev>
      <div @click="swiperRef?.swiperInstance?.slidePrev()" class="swiper-top-position swiper-button-prev" data-tv-focusable></div>
    </template>
    <template #button-next>
      <div @click="swiperRef?.swiperInstance?.slideNext()" class="swiper-top-position swiper-button-next" data-tv-focusable></div>
    </template>
  </swiper>
  <div v-else-if="isLoadingData && liveEvents.length === 0" class="loading-placeholder">
    <!-- Optional: Loading placeholder -->
    <!-- <p>Loading events for row {{ props.rowDefinitionId }} (content ID {{ props.categoryId }})...</p> -->
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, ref, nextTick, getCurrentInstance, type PropType } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/mousewheel';

import CardEvents from '@/components/cards/CardEvents.vue';
import useEventsStore from '@/store/useEventsStore';
import { eventsBreakpoints } from '@/utils/constants';

const props = defineProps({
  categoryId: { type: Number as PropType<number>, required: true }, // Content fetching ID
  rowDefinitionId: { // Unique row definition ID
    type: [Number, String] as PropType<number | string>, // Explicitly type for PropType
    required: true,
  },
});

const emit = defineEmits<{
  (e: 'no-content', uniqueRowId: number | string): void; // Emit the unique rowDefinitionId
}>();


const eventsStore = useEventsStore();

const isLoadingData = ref(true);

const instance = getCurrentInstance();
const instanceUID = instance?.uid || Math.random().toString(36).substring(7);

const liveEvents = computed(() => {
  const logPrefix = `CardEventsRow [${instanceUID}] (rowDefId: ${props.rowDefinitionId}, contentId: ${props.categoryId}): liveEvents Computed -`;
  if (props.categoryId === undefined || props.categoryId === null) {
    // console.log(`${logPrefix} contentId (categoryId prop) is invalid, returning [].`);
    return [];
  }
  const storeKey = String(props.categoryId); // Assuming store uses string keys
  const list = eventsStore.Events[storeKey] || [];
  // console.log(`${logPrefix} events from store for key ${storeKey}:`, list.length);
  
  // Sorting logic - ensure live_event_date is valid
  const now = Date.now();
  return [...list].sort((a, b) => {
    const dateA = a.live_event_date ? new Date(a.live_event_date).getTime() : Infinity;
    const dateB = b.live_event_date ? new Date(b.live_event_date).getTime() : Infinity;
    const da = Math.abs(dateA - now);
    const db = Math.abs(dateB - now);
    return da - db;
  });
});

async function fetchDataForCategory() {
  const contentFetchingId = props.categoryId;
  const uniqueRowId = props.rowDefinitionId as (number | string); // Assert type for emit
  const logPrefix = `CardEventsRow [${instanceUID}] (rowDefId: ${uniqueRowId}, contentId: ${contentFetchingId}):`;

  if (contentFetchingId === undefined || contentFetchingId === null) {
    console.log(`${logPrefix} fetchDataForCategory - contentId (categoryId prop) is invalid.`);
    isLoadingData.value = false;
    // Let finally block handle emission
  } else {
    console.log(`${logPrefix} fetchDataForCategory - Starting.`);
    isLoadingData.value = true;
  }
  
  let fetchError = false;
  try {
    if (contentFetchingId !== undefined && contentFetchingId !== null) {
      await eventsStore.setLiveEventsByCategoryId({ CategoryId: contentFetchingId });
      console.log(`${logPrefix} fetchDataForCategory - Store action setLiveEventsByCategoryId completed for contentId ${contentFetchingId}.`);
    } else {
      console.log(`${logPrefix} fetchDataForCategory - Skipped store action due to invalid contentId.`);
    }
  } catch (error) {
    fetchError = true;
    console.error(`${logPrefix} fetchDataForCategory - Error during store action for contentId ${contentFetchingId}:`, error);
  } finally {
    await nextTick();

    const currentEventsLength = liveEvents.value.length;
    console.log(`${logPrefix} fetchDataForCategory - In finally. rowDefId (current): ${props.rowDefinitionId}, contentId (current): ${props.categoryId}, fetchError: ${fetchError}, liveEvents length: ${currentEventsLength}`);

    if (currentEventsLength === 0) {
      console.log(`${logPrefix} fetchDataForCategory - FINAL CHECK: liveEvents is empty. Emitting 'no-content' for rowDefinitionId: ${uniqueRowId}.`);
      emit('no-content', uniqueRowId); // EMIT with props.rowDefinitionId (uniqueRowId has asserted type)
    } else {
      console.log(`${logPrefix} fetchDataForCategory - FINAL CHECK: liveEvents has content. Length: ${currentEventsLength}. Not emitting 'no-content' for rowDefinitionId: ${uniqueRowId}.`);
    }

    if (props.rowDefinitionId === uniqueRowId) {
      isLoadingData.value = false;
    }
    console.log(`${logPrefix} fetchDataForCategory - Finished. isLoadingData (for rowDefId ${props.rowDefinitionId}): ${isLoadingData.value}`);
  }
}

onMounted(() => {
  const logPrefix = `CardEventsRow [${instanceUID}] (rowDefId: ${props.rowDefinitionId}, contentId: ${props.categoryId}):`;
  console.log(`${logPrefix} Component mounted.`);
  fetchDataForCategory();
});

watch(() => [props.categoryId, props.rowDefinitionId], ([newContentId, newRowId], [oldContentId, oldRowId]) => {
  const logPrefix = `CardEventsRow [${instanceUID}] (newRowId: ${newRowId}, newContentId: ${newContentId}):`;
  if ((newContentId !== undefined && newContentId !== null && newContentId !== oldContentId) || 
      (newRowId !== undefined && newRowId !== null && newRowId !== oldRowId)) {
    console.log(`${logPrefix} categoryId or rowDefinitionId prop changed. Old (content/row): (${oldContentId}/${oldRowId}). Refetching for new (content/row): (${newContentId}/${newRowId}).`);
    fetchDataForCategory();
  }
}, { immediate: false });

const swiperRef = ref<any>(null);

const onSlideChange = () => {
  if (swiperRef.value && swiperRef.value.swiperInstance) {
    console.log('Slide changed to:', swiperRef.value.swiperInstance.activeIndex);
  }
};
</script>

<style scoped lang="scss">
@use '../../styles/home' as *;

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