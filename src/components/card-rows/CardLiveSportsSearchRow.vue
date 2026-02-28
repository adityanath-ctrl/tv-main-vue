<template>
  <swiper v-if="!seeAll" navigation :breakpoints="liveSportsBreakpoints" ref="swiperRef"
    class="bg-none card-slider card-events-slider">
    <swiper-slide v-for="(item, index) in sportsData" :key="index" class="item no-border bg-none subscription-item">
      <CardLiveSports :item="item" />
    </swiper-slide>

    <template #button-prev>
      <div @click="swiperRef?.slidePrev()" class="swiper-top-position swiper-button-prev"></div>
    </template>

    <template #button-next>
      <div @click="swiperRef?.slideNext()" class="swiper-top-position swiper-button-next"></div>
    </template>
  </swiper>

  <v-row v-else style="padding-left: 28px">
    <v-col lg="3" md="4" sm="6" xs="12" v-for="(item, index) in sportsData" :key="index">
      <CardLiveSports :item="item" class="subscription-item" />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed, ref, type PropType } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import type { Swiper as SwiperClass } from 'swiper'; // For swiperInstance ref typing
// import { Navigation, Mousewheel } from 'swiper/modules'; // Not explicitly used in <swiper> props, but good to keep if intended
import CardLiveSports from '../cards/CardLiveSports.vue';
import useSearchStore from '@/store/useSearchStore';
import type { SearchState } from '@/store/useSearchStore'; // Import SearchState if it's exported for stricter typing
import { liveSportsBreakpoints } from '@/utils/constants';

type ValidSearchCategoryKey = keyof Omit<SearchState, 'searchCategories' | 'isLoading'>;

// Props
const props = defineProps({
  seeAll: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  categoryName: {
    type: String as PropType<'sports'>,
    required: true
  }
});

// Pull sports data from your search store using the getter
const searchStore = useSearchStore();

const sportsData = computed(() => searchStore.getCategoryData(props.categoryName)?.data || []);


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