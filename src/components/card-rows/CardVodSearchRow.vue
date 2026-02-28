<template>
  <swiper v-if="!seeAll && vodData.length" navigation :breakpoints="vodBreakpoints" :mousewheel="{ forceToAxis: true }"
    :slides-offset-after="50" ref="swiperRef" class="card-vod-slider card-slider bg-none">
    <swiper-slide v-for="item in vodData" :key="item.id" class="item no-border bg-none subscription-item">
      <CardVod :item="item" :use-padding="false" :category-name="props.categoryName" />
    </swiper-slide>

    <template #button-prev>
      <div @click="swiperRef?.slidePrev()" class="swiper-top-position swiper-button-prev"></div>
    </template>
    <template #button-next>
      <div @click="swiperRef?.slideNext()" class="swiper-top-position swiper-button-next"></div>
    </template>
  </swiper>

  <v-row v-else-if="seeAll && vodData.length" style="padding-left: 28px">
    <v-col lg="2" md="3" sm="3" xs="4" v-for="item in vodData" :key="item.id">
      <CardVod :item="item" class="subscription-item" :category-name="props.categoryName" />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed, ref, type PropType } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import type { Swiper as SwiperClass } from 'swiper';
import useSearchStore from '@/store/useSearchStore';
import type { SearchMovieItem, SearchSeriesItem } from '@/store/useSearchStore';
import CardVod from '../cards/CardVod.vue';
import { vodBreakpoints } from '@/utils/constants';

type VodItem = SearchMovieItem | SearchSeriesItem;

const props = defineProps({
  categoryName: {
    type: String as PropType<'movies' | 'series'>,
    required: true
  },
  seeAll: {
    type: Boolean as PropType<boolean>,
    default: false
  }
});

const searchStore = useSearchStore();

// --- DATA MAPPING FIX IS HERE ---
const vodData = computed(() => {
  const rawData = (searchStore.getCategoryData(props.categoryName)?.data || []) as VodItem[];

  // Map the raw data to a consistent format that CardVod expects
  return rawData.map(item => ({
    ...item,
    // Create a new 'id' property from either 'vod_id' (for movies) or 'vod_series_id' (for series)
    id: 'vod_id' in item ? item.vod_id : item.vod_series_id,
    // Also normalize the name and poster for consistency, which CardVod uses
    poster_url: item.poster_url,
    caption: 'vod_name_short' in item ? item.vod_name_short : item.vod_series_name_short
  }));
});

const swiperRef = ref<SwiperClass | null>(null);
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