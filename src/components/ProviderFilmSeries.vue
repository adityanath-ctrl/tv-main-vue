<!-- File: src/components/ProviderFilmSeries.vue -->
<template>
  <div>
    <div v-if="events.length" class="text-h6 text-left ml-10 fcw mt-8">
      {{ category === 'film' ? 'Films' : 'Series' }}
    </div>

    <swiper
      v-if="events.length"
      :modules="[Navigation, Mousewheel]"
      @swiper="onSwiperInitialized"
      navigation
      :breakpoints="breakpoints"
      :mousewheel="{ forceToAxis: true, sensitivity: 0.5, releaseOnEdges: true }"
      :slides-offset-before="50"
      :slides-offset-after="50"
      class="card-vod-slider card-slider bg-none pl-5 pr-5 py-5 ProviderFilmSeries"
    >
      <swiper-slide
        v-for="item in events"
        :key="item.id"
        class="item no-border bg-none subscription-item"
      >
        <v-img
          :src="item.poster_url"
          :class="item.package_status ? 'card-vod-img' : 'card-vod-img-disabled'"
          :title="item.caption"
          cover
          @click="onClickSVOD(item.id, item.is_series)"
        >
          <template #placeholder>
            <div class="slider-img-container"></div>
          </template>
          <v-img
            v-if="!item.package_status"
            :src="PremiumRibbonIcon"
            class="premium-ribbon"
          />
        </v-img>
      </swiper-slide>

      <template #button-prev>
        <div
          @click="swiperInstance?.slidePrev()"
          class="swiper-top-position swiper-button-prev">
        </div>
      </template>
      <template #button-next>
        <div
          @click="swiperInstance?.slideNext()"
          class="swiper-top-position swiper-button-next">
        </div>
      </template>
    </swiper>

    <v-dialog v-model="dialog" persistent width="auto">
      <v-card>
        <v-card-title class="text-h5">Alert</v-card-title>
        <v-card-text>
          Please sign in to view the content or to see what packages are available
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn variant="text" @click="signIn">Sign In</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, type PropType } from 'vue';
import { useRouter } from 'vue-router';
import type { Swiper as SwiperClass } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/mousewheel';
import useEventsStore from '@/store/useEventsStore';
import useAuthStore from '@/store/useAuthStore';
import PremiumRibbonIcon from '@/assets/img/icon-premium-ribbon-2x3.png';
// import CardVodPlaceholder from '@/assets/img/card-vod.png'; // Not used in this template

// Define a more specific type for the items in categoryList and events
interface EventItem {
  id: number; // Assuming id from categoryList is number
  poster_url: string;
  package_status: boolean;
  name_short?: string; // From categoryList
  caption?: string;    // From categoryList or fetched details
  is_series?: boolean; // From categoryList or fetched details
  // Add other properties that your CardEvents component might expect
}

const props = defineProps({
  providerId: {
    type: String, // providerId is usually a string if it comes from URL params or API
    required: true
  },
  category: { // This prop determines if we're fetching films or series
    type: String as PropType<'film' | 'series'>,
    required: true
  },
  // categoryList prop might not be needed if this component always fetches its own data based on providerId and category type
  // If categoryList is passed, ensure its item type matches or is compatible with EventItem
  // For simplicity, let's assume this component fetches its own data
});

const router = useRouter();
const dialog = ref(false);
const authStore = useAuthStore();
const eventsStore = useEventsStore();

const events = computed((): EventItem[] => // Use the EventItem interface
  props.category === 'film'
    ? eventsStore.getFilmsEvents // Assuming this getter returns EventItem[]
    : eventsStore.getSeriesEvents // Assuming this getter returns EventItem[]
);

async function signIn() {
  dialog.value = false;
  try {
    await authStore.loginUser(); 
  } catch (error) {
    console.error('ProviderFilmSeries: Error during signIn attempt:', error);
  }
}

onMounted(() => {
  if (props.providerId) { // Ensure providerId is present
    if (props.category === 'film') {
      eventsStore.getFilmsByContentProviderId({ providerId: props.providerId });
    } else {
      eventsStore.getSeriesByContentProviderId({ providerId: props.providerId });
    }
  } else {
    console.warn("ProviderFilmSeries: providerId prop is missing.");
  }
});


function onClickSVOD(id: number | string, isSeriesFlag?: boolean) {
  // --- FIX: Use props.category to determine the type ---
  const isActuallySeries = props.category === 'series' || isSeriesFlag === true;
  // ----------------------------------------------------

  if (!authStore.isUserLoggedIn) {
    dialog.value = true;
  } else {
    router.push(isActuallySeries ? `/svod/series/${id}` : `/svod/movie/${id}`);
  }
}

const swiperInstance = ref<SwiperClass | null>(null);
const onSwiperInitialized = (swiper: SwiperClass) => {
  swiperInstance.value = swiper;
};

const breakpoints = {
  0:    { slidesPerView: 2, spaceBetween: 10 },
  500:  { slidesPerView: 4, spaceBetween: 10 },
  768:  { slidesPerView: 5, spaceBetween: 20 },
  1600: { slidesPerView: 8, spaceBetween: 20 },
  1900: { slidesPerView: 8, spaceBetween: 20 },
};
</script>

<style scoped lang="scss">
@use '../styles/home' as *;

.ProviderFilmSeries {
  /* hide native scrollbar */
  &::-webkit-scrollbar { display: none; }
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* slider arrows */
.swiper-button-prev,
.swiper-button-next {
  width: 50px !important;
  height: 100% !important;
  top: 0;
}

/* image ratio & placeholder */
.slider-img-container {
  position: relative;
  width: 100%;
  padding-bottom: 150%;
  border-radius: 10px;
  overflow: hidden;
}

.card-vod-img .v-img__img--cover,
.card-vod-img-disabled .v-img__img--cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.premium-ribbon {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
