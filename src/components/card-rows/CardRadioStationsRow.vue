<template>
  <swiper
    ref="swiperRef"
    navigation
    :breakpoints="radioStationsBreakpoints"
    class="card-vod-slider card-slider bg-none"
  >
    <swiper-slide
      v-for="(item, index) in radioStations"
      :key="index"
      class="item no-border bg-none subscription-item"
    >
      <CardRadioStations :item="item" />
    </swiper-slide>

    <template #button-prev>
      <div
        @click="swiperRef?.slidePrev()"
        class="swiper-top-position swiper-button-prev" data-tv-focusable
      ></div>
    </template>
    <template #button-next>
      <div
        @click="swiperRef?.slideNext()"
        class="swiper-top-position swiper-button-next" data-tv-focusable
      ></div>
    </template>
  </swiper>
</template>

<script setup lang="ts">
import { onMounted, computed, watch, ref, type PropType } from 'vue' // Import 'ref'
import { Swiper, SwiperSlide } from 'swiper/vue'
import CardRadioStations from '../cards/CardRadioStation.vue'
import useRadioStationsStore from '@/store/useRadioStationsStore'
import { radioStationsBreakpoints } from '@/utils/constants'

// props & emits
const props = defineProps({
  categoryId: {
    type: Number as PropType<number>,
    required: true
  }
})
const emit = defineEmits(['no-content'])

// store
const store = useRadioStationsStore()

// reactive list
const radioStations = computed(() => store.radio_stations[props.categoryId] || [])

// if empty, tell parent
watch(radioStations, (list) => {
  if (list.length === 0) {
    emit('no-content', props.categoryId)
  }
})

// fetch helper
function fetchStations() {
  store.setRadioStationsByCategoryId({ CategoryId: props.categoryId })
}

// load on mount & when category changes
onMounted(fetchStations)
watch(() => props.categoryId, fetchStations)

// Create a ref for the swiper instance
const swiperRef = ref<any>(null); // Create the ref
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