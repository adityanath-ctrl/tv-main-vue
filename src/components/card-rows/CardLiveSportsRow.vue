<!-- /src/components/card-rows/CardLiveSportsRow.vue -->
<template>
  <swiper
    :modules="[Navigation, Mousewheel]"
    :navigation="true"
    :breakpoints="liveSportsBreakpoints"
    ref="swiper"
    class="card-vod-slider card-slider bg-none"
    :mousewheel="{
      forceToAxis: true,
      sensitivity: 0.5,
      releaseOnEdges: true,
    }"
    :direction="'horizontal'"
    @slideChange="onSlideChange"
  >
    <swiper-slide
      v-for="(item, index) in LiveSports"
      :key="item.match_id ?? item.id ?? index"
      class="item no-border bg-none subscription-item"
    >
      <CardLiveSports :item="item" />
    </swiper-slide>

    <template #button-prev>
      <div @click="swiperRef?.slidePrev()" class="swiper-top-position swiper-button-prev" data-tv-focusable></div>
    </template>
    <template #button-next>
      <div @click="swiperRef?.slideNext()" class="swiper-top-position swiper-button-next" data-tv-focusable></div>
    </template>
  </swiper>
</template>

<script setup lang="ts">
import { onMounted, computed, watch, ref, type PropType } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Mousewheel } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/mousewheel';
import 'swiper/css/keyboard';
import 'swiper/css/scrollbar';

import CardLiveSports from '../cards/CardLiveSports.vue';
import { useSportsStore } from '@/store/useSportsStore';
import { liveSportsBreakpoints } from '@/utils/constants';

// Props & emits
const props = defineProps({
  categoryId: { type: Number as PropType<number>, required: true },
  rowDefinitionId: {
    type: [Number, String] as PropType<number | string>,
    required: true,
  },
  contentProviderId: {
    type: Number as PropType<number | undefined>,
    required: false,
    default: undefined,
  },
});

const emit = defineEmits<{
  (e: 'no-content', uniqueRowId: number | string): void;
}>();

// Pinia store
const sportsStore = useSportsStore();

// Computed list (already sorted in the store)
const LiveSports = computed(() => {
  if (props.categoryId === undefined || props.categoryId === null) return [];
  const key = `${String(props.categoryId)}__cp:${props.contentProviderId ?? 'none'}`;
  return sportsStore.sports_events[key] || [];
});

watch(LiveSports, (arr) => {
  if (!arr.length) {
    emit('no-content', props.rowDefinitionId as (number | string));
  }
});

// Fetch on mount
onMounted(() => {
  getLiveSports();
});

// Re-fetch when category/provider changes
watch(
  () => [props.categoryId, props.contentProviderId],
  ([newCatId, newProvId], [oldCatId, oldProvId]) => {
    if (
      (newCatId !== undefined && newCatId !== null && newCatId !== oldCatId) ||
      (newProvId !== oldProvId)
    ) {
      getLiveSports();
    }
  },
  { immediate: false }
);

function getLiveSports() {
  if (props.categoryId !== undefined && props.categoryId !== null) {
    sportsStore.getLiveSportsByCategoryId({
      CategoryId: props.categoryId,
      ContentProviderId: props.contentProviderId,
    });
  }
}

const swiperRef = ref<any>(null);

const onSlideChange = () => {
  if (swiperRef.value && swiperRef.value.swiperInstance) {
    console.log('Slide changed to:', swiperRef.value.swiperInstance.activeIndex);
  }
};
</script>

<style scoped lang="scss">
@use '../../styles/home' as *;

// slide styling
.swiper-slide {
  position: relative;
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
}

// arrow styling (matches your offset)
.swiper-button-prev,
.swiper-button-next {
  width: 50px !important;
  height: 100% !important;
  top: 0;
}
</style>
