<template>
  <swiper :modules="[Navigation, Mousewheel]" :navigation="true" :breakpoints="liveTvBreakpoints" ref="swiper"
    class="card-vod-slider card-slider bg-none" :mousewheel="{
      forceToAxis: true,
      sensitivity: 0.5,
      releaseOnEdges: true,
    }" :direction="'horizontal'" @slideChange="onSlideChange">
    <swiper-slide v-for="(item, index) in LiveTV" :key="index" class="item no-border bg-none subscription-item">
      <CardLiveTV :item="item" />
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
import { onMounted, computed, watch, ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Mousewheel } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/mousewheel';
import 'swiper/css/keyboard';
import 'swiper/css/scrollbar';

import CardLiveTV from '../cards/CardLiveTV.vue';
import useLiveStore from '@/store/useLiveStore';
import { liveTvBreakpoints } from '@/utils/constants';

const props = defineProps({
  categoryId: Number,
});

const emit = defineEmits(['no-content']);

const liveStore = useLiveStore();

const LiveTV = computed(() => {
  if (!props.categoryId) {
    return [];
  }
  const categoryChannels = liveStore.tv_channels[props.categoryId];
  return categoryChannels ? categoryChannels : [];
});

watch(LiveTV, (newVal) => {
  if (newVal && newVal.length === 0) {
    //console.log(`Emitting no-content for category id ${props.categoryId}`);
    emit('no-content', props.categoryId);
  }
});

function getLiveTV() {
  if (props.categoryId !== undefined && props.categoryId !== null) {
    liveStore.getLiveTVByCategoryId({
      CategoryId: props.categoryId,
    });
  }
}
onMounted(() => {
  getLiveTV();
});

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
