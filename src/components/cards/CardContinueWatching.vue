<!-- /src/components/cards/CardContinueWatching.vue -->
<template>
  <div @click="handleClickedItem(item.id)" style="cursor: pointer;">
    <div class="slider-cw-img-container">
      <!-- Premium ribbon for locked content -->
      <img v-if="!item.package_status" :src="PremiumRibbonIcon" class="premium-ribbon" />

      <!-- Overlay only for continue watching, not for recently watched -->
      <div class="cw-overlay" v-if="menuType !== 'recently_watched'"></div>

      <!-- Poster image -->
      <img :src="item.poster_url" :title="item.caption" class="card-img" />

      <!-- Progress bar for continue watching -->
      <div class="cw-progressbar" v-if="menuType !== 'recently_watched'">
        <v-progress-linear :color="HIGHLIGHT_COLOR_1" :background-color="HIGHLIGHT_COLOR_2" height="8"
          :model-value="Math.max(getVideoCompletionPercentage(item.duration_in_milliseconds, item.resume_in_milliseconds), 1)" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router"
import { HIGHLIGHT_COLOR_1, HIGHLIGHT_COLOR_2, BACKGROUND_COLOR_2 } from "@/mainConfig"
import PremiumRibbonIcon from "../../assets/img/icon-premium-ribbon-2x3.png"

const router = useRouter()
const props = defineProps({
  item: { type: Object, required: true },
  menuType: { type: String, required: true }
})

// Calculate resume percentage
const getVideoCompletionPercentage = (duration_in_milliseconds, resume_in_milliseconds) => {
  const duration = Number(duration_in_milliseconds);
  const resume = Number(resume_in_milliseconds);

  if (!Number.isFinite(duration) || duration <= 0) return 0;
  if (!Number.isFinite(resume) || resume <= 0) return 0;

  const pct = (resume / duration) * 100;
  // Return a Number (not a string), clamped to [0, 100] with 2-dec precision
  return Math.max(0, Math.min(100, Number(pct.toFixed(2))));
};


// Navigate based on whether it's a movie or series
const handleClickedItem = (id) => {
  const startMs = props.item.resume_in_milliseconds ?? 1;

  if (!props.item.series_id) {
    // movie
    router.push({
      path: `/player/movie/${id}`,
      query: { start_ms: startMs } // <-- milliseconds
    });
  } else {
    // series
    router.push({
      path: `/player/series/${props.item.series_id}/${props.item.id}`,
      query: { start_ms: startMs }
    });
  }
};

</script>

<style scoped lang="scss">
@use "../../styles/home" as *;

.slider-cw-img-container {
  background-color: v-bind(BACKGROUND_COLOR_2);
  position: relative;
  width: 100%;
  padding-bottom: 150%;
  border-radius: 10px;
  overflow: hidden;
}

.card-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.premium-ribbon {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: auto;
  z-index: 10;
  pointer-events: none;
}

.cw-overlay {
  position: absolute;
  padding: 2px;
  opacity: 0.3;
  background-color: #111111;
  width: 100%;
  z-index: 2;
  height: 100%;
}

.cw-progressbar {
  position: absolute;
  z-index: 3;
  bottom: 0;
  left: 0;
  width: 100%;
}
</style>
