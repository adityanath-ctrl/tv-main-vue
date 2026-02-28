<template>
  <swiper v-if="!seeAll && liveTVData.length" navigation :breakpoints="liveTvBreakpoints"
    :mousewheel="{ forceToAxis: true }" :slides-offset-after="50" ref="swiperRef"
    class="card-vod-slider card-slider bg-none">
    <swiper-slide v-for="item in liveTVData" :key="item.channel_id" class="item no-border bg-none subscription-item">
      <!-- The CardLiveTV component receives the mapped item -->
      <CardLiveTV :item="item" />
    </swiper-slide>

    <template #button-prev>
      <div @click="swiperRef?.slidePrev()" class="swiper-top-position swiper-button-prev"></div>
    </template>
    <template #button-next>
      <div @click="swiperRef?.slideNext()" class="swiper-top-position swiper-button-next"></div>
    </template>
  </swiper>

  <v-row v-else-if="seeAll && liveTVData.length" style="padding-left: 28px">
    <v-col lg="3" md="4" sm="6" xs="12" v-for="item in liveTVData" :key="item.channel_id">
      <div style="min-width: 180px;">
        <CardLiveTV :item="item" class="subscription-item" />
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed, ref, type PropType } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import type { Swiper as SwiperClass } from 'swiper';
import useSearchStore, { type SearchTVItem } from '@/store/useSearchStore';
import CardLiveTV from '../cards/CardLiveTV.vue'; // Use the full-featured card
import { liveTvBreakpoints } from '@/utils/constants';

const props = defineProps({
  seeAll: {
    type: Boolean as PropType<boolean>,
    default: false
  },
});

const searchStore = useSearchStore();
const swiperRef = ref<SwiperClass | null>(null);

// --- TYPE GUARD FUNCTION ---
// This function checks if an item is a valid SearchTVItem
function isSearchTVItem(item: any): item is SearchTVItem {
  // Check for a unique property that only exists on SearchTVItem
  return item && typeof item.channel_id !== 'undefined';
}

// --- DATA MAPPING WITH TYPE GUARD ---
const liveTVData = computed(() => {
  const rawData = searchStore.getCategoryData('tv')?.data || [];

  return rawData
    // 1. Filter out any items that don't match our specific type
    .filter(isSearchTVItem)
    // 2. Now, map the data. TypeScript knows every `item` is a valid SearchTVItem.
    .map(item => ({
      ...item,
      id: item.channel_id,
      icon_url: item.channel_image,
      title: item.channel_name,
    }));
});
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