<!-- /src/components/cards/CardVod.vue -->
<template>
  <div class="d-flex flex-column bg-none w-100 focusable-item" tabindex="0" :class="paddingClass" @click="onClickSVOD(item.id, item.is_series)"
    style="cursor: pointer">
    <div class="slider-img-container">
      <img :src="item.poster_url" :title="item.caption" class="card-img" />
      <img v-if="!item.package_status" :src="PremiumRibbonIcon" class="premium-ribbon" />
    </div>
  </div>
</template>

<!-- src/components/cards/CardVod.vue -->
<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import PremiumRibbonIcon from '../../assets/img/icon-premium-ribbon-2x3.png';
import { BACKGROUND_COLOR_2 } from '@/mainConfig';

// Define the props this component accepts
const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  isViewMore: {
    type: Boolean,
    default: false
  },
  usePadding: {
    type: Boolean,
    default: true
  },
  // ADDED: Accept the categoryName prop
  categoryName: {
    type: String,
    default: 'movies' // Default to 'movies' if not provided
  }
});

const router = useRouter();

const paddingClass = computed(() => {
  if (props.usePadding) {
    return props.isViewMore ? 'py-3' : 'pb-10 pt-2';
  }
  return '';
});

// MODIFIED: The click handler is now much smarter
const onClickSVOD = (vod_id) => {
  // Determine if it's a series based on the categoryName prop OR
  // the item's own is_series property for maximum compatibility.
  const isSeries = props.categoryName === 'series' || props.item.is_series === 'true' || props.item.is_series === true;

  const path = isSeries
    ? `/svod/series/${vod_id}`
    : `/svod/movie/${vod_id}`;
    
  router.push({ path });
};
</script>

<style scoped lang="scss">
@use '../../styles/home' as *;

/* 4:3 aspect‐ratio container */
.slider-img-container {
  background-color: v-bind('BACKGROUND_COLOR_2');
  position: relative;
  width: 100%;
  padding-bottom: 150%;
  /* 3 / 2 = 1.5 */
  border-radius: 10px;
  overflow: hidden;
}

/* poster covers entire container */
.card-img {
  position: absolute;
  inset: 0;
  /* shorthand for top:0; right:0; bottom:0; left:0 */
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ribbon pinned exactly to top-right */
.premium-ribbon {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: auto;
  z-index: 10;
  pointer-events: none;
}
</style>