<!-- /src/components/Slider.vue -->
<template>
  <div v-if="SliderItems.length > 0">
    <v-carousel
      :show-arrows="false"
      show-arrows-on-hover
      style="width: 100vw; height: 46.4vw"
      class="carousel_first"
      v-model="currentSlide"
    >
      <v-carousel-item
        :style="{ opacity: opacityLevel }"
        v-for="(item, i) in SliderItems"
        :key="i"
      >
        <!-- gradient mask for non-video modes -->
        <div v-if="!usesVideo"
          style="background: linear-gradient(to top, rgba(0,0,0,0.20), rgba(0,0,0,0)); position:absolute; top:0; bottom:0; left:0; right:0; z-index:1">
      </div>

        <!-- image modes -->
        <img v-if="isMobile" :src="item.portraitImage" class="silder-img w-100" />
        <img v-else-if="isTablet" :src="item.landscapeImage" class="silder-img w-100" />

        <!-- video mode (desktop) -->
        <video
          v-else
          :ref="el => videoRefs[i] = el"
          playsinline
          loop
          class="w-100"
          :poster="item.landscapeImage"
          style="opacity:0.5;"
        >
          <source :src="item.trailer_url" type="video/mp4">
        </video>

        <v-sheet color="transparent" class="home-overlay-content">
          <v-row class="d-flex flex-column fill-height" align="center" justify="center">
            <v-col cols="12" class="mb-3 preview-scene d-flex flex-column justify-center" style="max-width: 100%;">
              <div class="d-flex justify-start mb-3 film-title">
                <img v-if="item.titleImage" :src="item.titleImage" class="img-title" :class="{ 'shrunk': isTitleShrunk }" />
                <p v-else class="text-h3 font-weight-black text-left" id="film_subject">
                  {{ getItemTitle(item) }}
                </p>
              </div>

              <!-- desktop description fades only when video layout is used -->
              <div v-if="usesVideo">
                <transition name="fade">
                  <div v-if="showDescription" class="description-wrapper">
                    <div
                      class="text-subtitle-1 font-weight-medium text-justify mb-2 film-descrip"
                      style="line-height: 20px"
                      v-html="getItemDescription(item)"
                    />
                  </div>
                </transition>
              </div>

              <!-- Action buttons -->
              <div
                v-if="item.contentID && item.contentID.length > 0"
                class="d-flex justify-start align-center mt-4 slider-actions"
                style="gap: 16px;"
              >
                <!-- Play -->
                <v-btn
                  class="slider-action-btn slider-play-btn"
                  @mouseenter="isPlayHovered = true"
                  @mouseleave="isPlayHovered = false"
                  @click="onGoPlayer(item, 'play')"
                  :style="{ background: isPlayHovered ? HIGHLIGHT_COLOR_2 : HIGHLIGHT_COLOR_1 }"
                >
                  <v-icon start>mdi-play</v-icon>
                  Play
                </v-btn>

                <!-- See Details -->
                <v-btn
                  v-if="item.contentType === 'svod_movies' || item.contentType === 'svod_series'"
                  class="slider-action-btn slider-details-btn"
                  @mouseenter="isDetailsHovered = true"
                  @mouseleave="isDetailsHovered = false"
                  @click="onGoPlayer(item, 'details')"
                  :style="{ background: isDetailsHovered ? 'rgba(70, 70, 70, 0.9)' : 'rgba(100, 100, 100, 0.7)' }"
                >
                  See Details
                </v-btn>

                <!-- Mute toggle only in video mode -->
                <v-btn v-if="usesVideo" class="mute-btn" icon variant="tonal" @click="toggleMute">
                  <v-icon>{{ isVideoMuted ? 'mdi-volume-off' : 'mdi-volume-high' }}</v-icon>
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-sheet>
      </v-carousel-item>
    </v-carousel>
  </div>

  <div v-else>
    <Preloader />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick, computed } from 'vue';
import { useRouter } from 'vue-router';
import Preloader from './Preloader.vue';
import { getMovieDetail, getEventDetail, getSVODSeriesById } from "@/utils/siberAPI";
import { HIGHLIGHT_COLOR_1, HIGHLIGHT_COLOR_2 } from '@/mainConfig';
import useAuthStore from "@/store/useAuthStore";

const { FeaturedSlider } = defineProps({
  FeaturedSlider: { type: Array, required: true },
});

const showDescription = ref(false);
const currentSlide = ref(0);
const isPlayHovered = ref(false);
const isDetailsHovered = ref(false);
const isTitleShrunk = ref(false);
const router = useRouter();
const phoneWidth = ref(window.innerWidth);
const SliderItems = ref(FeaturedSlider);
const authStore = useAuthStore();
const opacityLevel = 1;

/* --------- Layout breakpoints --------- */
const BREAKPOINTS = {
  mobileMax: 1024,      // phones + small tablets use image (portrait)
  desktopVideoMin: 1280 // real desktops use video
};
const isMobile  = computed(() => phoneWidth.value <= BREAKPOINTS.mobileMax);
const usesVideo = computed(() => phoneWidth.value >= BREAKPOINTS.desktopVideoMin);
const isTablet  = computed(() => !isMobile.value && !usesVideo.value);
/* -------------------------------------- */

// video refs only matter on desktop video layout
const videoRefs = ref([]);
const isVideoMuted = ref(true);

const toggleMute = () => {
  isVideoMuted.value = !isVideoMuted.value;
  const activeVideo = videoRefs.value[currentSlide.value];
  if (activeVideo) {
    activeVideo.muted = isVideoMuted.value;
    if (!isVideoMuted.value && activeVideo.paused) {
      activeVideo.play().catch(e => console.error("Error playing video on unmute:", e));
    }
  }
};

watch(currentSlide, async (newIndex, oldIndex) => {
  // Only manage videos when we're in video mode
  if (usesVideo.value) {
    if (oldIndex !== undefined) {
      const oldVideo = videoRefs.value[oldIndex];
      if (oldVideo) {
        oldVideo.pause();
        oldVideo.currentTime = 0;
      }
    }
    await nextTick();
    const newVideo = videoRefs.value[newIndex];
    if (newVideo) {
      newVideo.muted = isVideoMuted.value;
      const playPromise = newVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          isVideoMuted.value = true;
          newVideo.muted = true;
          newVideo.play().catch(() => {});
        });
      }
    }
  }
  toggleDescriptionVisibility();
});

// show description initially on mount and animate title
onMounted(() => {
  if (usesVideo.value) {
    const firstVideo = videoRefs.value[0];
    if (firstVideo) {
      firstVideo.muted = true;
      firstVideo.play().catch(e => console.error("Initial video play failed:", e));
    }
  }
  toggleDescriptionVisibility();
  updateSliderItems();
  window.addEventListener('resize', updatePhoneWidth);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updatePhoneWidth);
});

const toggleDescriptionVisibility = () => {
  showDescription.value = true;
  isTitleShrunk.value = false;
  setTimeout(() => {
    showDescription.value = false;
    isTitleShrunk.value = true;
  }, 6000);
};

const updatePhoneWidth = () => {
  phoneWidth.value = window.innerWidth;
};

const updateSliderItems = async () => {
  if (SliderItems.value.length === 0) return;

  const token = authStore.getToken;
  let isUpdated = false;

  const updatedItems = await Promise.all(
    SliderItems.value.map(async (item) => {
      const newItem = { ...item };
      try {
        if (newItem.contentType === "events" && newItem.contentID) {
          const response = await getEventDetail({ token, eventId: newItem.contentID });
          const detail = response?.data?.response?.events;
          if (detail) { newItem.eventDetail = detail; isUpdated = true; }
        } else if (newItem.contentType === "svod_movies" && newItem.contentID) {
          const response = await getMovieDetail({ token, vodId: newItem.contentID });
          const detail = response?.data?.response?.movie_info;
          if (detail) { newItem.movieDetail = detail; isUpdated = true; }
        } else if (newItem.contentType === "svod_series" && newItem.contentID) {
          const response = await getSVODSeriesById({ token, vodId: newItem.contentID });
          const detail = response?.data?.response?.series;
          if (detail) { newItem.seriesDetail = detail; isUpdated = true; }
        }
      } catch (e) {
        console.error(`Failed to fetch details for ${newItem.contentType} ID ${newItem.contentID}:`, e);
      }
      return newItem;
    })
  );

  if (isUpdated) SliderItems.value = updatedItems;
};

watch(() => FeaturedSlider, (newVal) => {
  SliderItems.value = newVal;
  updateSliderItems();
});

const onGoPlayer = (item, action = 'details') => {
  const contentId = item.contentID;
  const contentType = item.contentType;
  if (!contentId) return;

  let path = '';
  let query = {};

  switch (contentType) {
    case "svod_movies":
      path = (action === 'play') ? `/player/movie/${contentId}` : `/svod/movie/${contentId}`;
      break;

    case "svod_series":
      if (action === 'play') {
        path = `/player/series/${contentId}`;
        const seriesData = item.seriesDetail;
        const firstSeason = seriesData?.seasons?.[0];
        const firstEpisode = firstSeason?.episodes?.find(ep => ep.vod_position === 1) || firstSeason?.episodes?.[0];
        if (firstSeason && firstEpisode) {
          query = { season: firstSeason.id, episode: firstEpisode.id, resume: 0 };
        }
      } else {
        path = `/svod/series/${contentId}`;
      }
      break;

    case "events":
      path = `/player/video/${contentId}`;
      break;

    case "sports":
      path = `/player/sport/${contentId}`;
      break;
  }

  if (path) router.push({ path, query });
};

const getItemDescription = (item) => {
  if (item.contentType === "events" && item.eventDetail?.length > 0) {
    return item.eventDetail[0].live_event_description;
  } else if (item.contentType === "svod_movies" && item.movieDetail?.length > 0) {
    return item.movieDetail[0].description;
  } else if (item.contentType === "svod_series" && item.seriesDetail) {
    return item.seriesDetail.description;
  }
  return item.description;
};

const getItemTitle = (item) => {
  if (item.contentType === "events" && item.eventDetail?.length > 0) {
    return item.eventDetail[0].live_event_name_short;
  } else if (item.contentType === "svod_movies" && item.movieDetail?.length > 0) {
    return item.movieDetail[0].name_short;
  } else if (item.contentType === "svod_series" && item.seriesDetail) {
    return item.seriesDetail.name_short;
  }
  return item.title;
};

const setRuntime = (val) => {
  if (!val) return '';
  let hours = Math.floor(val / 60);
  let minutes = val % 60;
  if (hours > 0) return `${hours}HR ${minutes}M`;
  return `${minutes}M`;
};
</script>

<style>
.v-responsive__content .v-sheet { max-width: 55%; }

.home-overlay-content {
  position: absolute;
  top: 65%;
  transform: translateY(-65%);
  left: 100px;
  z-index: 2;
}

/* Title image */
.img-title {
  width: 25vw;
  max-width: 800px;
  max-height: 400px;
  object-fit: contain;
  transition: all 0.5s ease-in-out;
  margin-bottom: 1rem;
}
.img-title.shrunk { width: 18vw; max-width: 300px; margin-bottom: 1.5rem; }

/* Description wrapper */
.description-wrapper { max-width: 800px; }
.description-wrapper .film-descrip { font-size: 18px !important; line-height: 1.6 !important; color: #f0f0f0 !important; }

.preview-scene { align-items: flex-start !important; }

#film_subject { font-size: 2rem !important; font-weight: 400; line-height: 3.125rem; }

.mute-btn {
  border: 1px solid rgba(255, 255, 255, 0.7);
  background-color: rgba(42, 42, 42, 0.6) !important;
}
.mute-btn:hover { background-color: rgba(70, 70, 70, 0.9) !important; }

.slider-action-btn {
  height: 56px !important;
  padding: 0 24px !important;
  font-size: 20px !important;
  font-weight: 500 !important;
  text-transform: none !important;
  border-radius: 8px !important;
  color: #fff !important;
  transition: background-color 0.2s ease-in-out;
}
.slider-action-btn .v-icon { font-size: 28px !important; margin-right: 8px !important; }

.silder-img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;      /* crop instead of letterboxing */
}

/* <= 1024px: treat as mobile (image layout) */
@media screen and (max-width: 1024px) {
  .home-overlay-content { top: 40%; transform: translateY(-10%); left: 100px; z-index: 2; }
  #film_subject { font-size: 1.5rem !important; line-height: 2rem; }
  .preview-scene { align-items: center !important; }
  .v-responsive__content { padding-left: 0%; }
  .v-responsive__content .v-sheet { max-width: inherit; left: 0 !important; width: 100%; }
  .released-year, .film-descrip { display: none !important; }
  .preview-scene { margin-top: 30px !important; }
  .carousel_first { height: 100vw !important; }
  .img-title { width: 150px !important; }
  #film_subject { font-size: 25px !important; width: 250px !important; margin-left: 80px !important; }
  .v-carousel__controls { background: transparent !important; }
}

.carousel_first .v-btn__overlay { background-color: transparent !important; }
.carousel_first .v-carousel__controls { background-color: transparent !important; }
.carousel_first .v-btn--active i { color: #fff !important; opacity: 1; }

/* Fade animation */
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter, .fade-leave-to { opacity: 0; }

/* Phones (<= 600px) — compact spacing for dots, keep original size */
@media (max-width: 600px) {
  .slider-actions { gap: 10px !important; }
  .slider-action-btn { height: 42px !important; padding: 0 14px !important; font-size: 16px !important; border-radius: 8px !important; min-width: unset !important; }
  .slider-action-btn .v-icon { font-size: 20px !important; margin-right: 6px !important; }

  .carousel_first .v-carousel__controls { padding: 4px 6px !important; }
  .carousel_first .v-carousel__controls .v-btn {
    min-width: unset !important;
    margin: 0 2px !important;   /* tighter gaps, keep default dot size */
    padding: 0 !important;
  }
}

/* Small tablets */
@media (min-width: 601px) and (max-width: 960px) {
  .carousel_first .v-carousel__controls { padding: 6px 8px !important; }
  .carousel_first .v-carousel__controls .v-btn { margin: 0 3px !important; }
}
</style>
