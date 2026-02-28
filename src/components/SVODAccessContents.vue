<!-- File: src/components/SVODAccessContents.vue -->
<template>
  <swiper
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
      v-for="(item, idx) in SVODs"
      :key="item.id || idx" 
      class="item no-border bg-none subscription-item"
    >
      <v-img
        :src="item.poster_url"
        :class="item.package_status ? activeClass : disabledClass"
        :title="item.name_short"
        @click="onClickVod(item.id)"
        style="position: relative; border-radius: 10px"
        cover
      >
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
        class="swiper-top-position swiper-button-prev"
      ></div>
    </template>
    <template #button-next>
      <div
        @click="swiperInstance?.slideNext()"
        class="swiper-top-position swiper-button-next"
      ></div>
    </template>
  </swiper>
</template>

<script setup lang="ts">
import { ref, onMounted, type PropType } from 'vue';
import type { Swiper as SwiperClass } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/mousewheel';
import {
  getSVODById,
  getSVODSeriesById,
  getGuestToken,
  isTokenExpired
} from '@/utils/siberAPI';
import useAuthStore from '@/store/useAuthStore';
import CardVodPlaceholder from '@/assets/img/card-vod.png'; // Renamed for clarity
import PremiumRibbonIcon from '@/assets/img/icon-premium-ribbon-16x9.png';

interface CategoryListItem {
  id: number; // From props
  poster_url: string;
  package_status: boolean;
  name_short: string;
}

interface FetchedSVODDetails {
  // Define properties that getSVODById or getSVODSeriesById actually return
  // This will likely overlap with CategoryListItem but might have more details
  title?: string;
  description?: string;
  // ... other relevant fields from the API response for movie_info or series
}

// This will be the type for items in the SVODs.value array
type SVODDisplayItem = CategoryListItem & Partial<FetchedSVODDetails>;


const props = defineProps({
  categoryList: {
    type: Array as PropType<CategoryListItem[]>,
    required: true
  },
  type: {
    type: String as PropType<'movies' | 'series'>,
    required: true
  }
});

const SVODs = ref<SVODDisplayItem[]>([]);
const activeClass = 'card-vod-img';
const disabledClass = 'card-vod-img-disabled';

const swiperInstance = ref<SwiperClass | null>(null);
const onSwiperInitialized = (swiper: SwiperClass) => {
  swiperInstance.value = swiper;
};

const breakpoints = {
  0:    { slidesPerView: 2, spaceBetween: 10 },
  500:  { slidesPerView: 4, spaceBetween: 10 },
  768:  { slidesPerView: 5, spaceBetween: 20 },
  1600: { slidesPerView: 8, spaceBetween: 20 },
  1900: { slidesPerView: 8, spaceBetween: 20 }
};

async function fetchSVODDetails(initialItem: CategoryListItem): Promise<SVODDisplayItem | null> {
  const authStore = useAuthStore();
  let token = authStore.getToken; // Prioritize token from authStore

  if (!token || (isTokenExpired(token) && authStore.getTokenMode === 'guest')) {
    try {
      const guest = await getGuestToken();
      if (guest.data?.access_token) {
        token = guest.data.access_token;
        // localStorage.setItem('authToken', token); // Avoid direct localStorage manipulation here if authStore handles it
      } else {
        console.error(`SVODAccessContents: Failed to get guest token for VOD ${initialItem.id}.`);
        return null;
      }
    } catch (error) {
      console.error(`SVODAccessContents: Error fetching guest token for VOD ${initialItem.id}:`, error);
      return null;
    }
  }

  if (!token) {
      console.error(`SVODAccessContents: No valid token to fetch VOD ${initialItem.id}.`);
      return null;
  }

  const params = { token, vodId: String(initialItem.id) }; // Convert vodId to string

  try {
    const response =
      props.type === 'movies'
        ? await getSVODById(params)
        : await getSVODSeriesById(params);

    let fetchedDetails: FetchedSVODDetails | null = null;
    if (props.type === 'movies' && response?.data?.response?.movie_info?.[0]) {
      fetchedDetails = response.data.response.movie_info[0];
    } else if (props.type === 'series' && response?.data?.response?.series) {
      fetchedDetails = response.data.response.series;
    }

    if (fetchedDetails) {
      return { ...initialItem, ...fetchedDetails }; // Merge initial data with fetched details
    } else {
      // console.warn(`SVODAccessContents: No valid info for VOD ${initialItem.id} of type ${props.type}.`);
      return initialItem; // Return initial item if fetch fails but we still want to display something
    }
  } catch (error) {
    console.error(`SVODAccessContents: Error fetching SVOD ${initialItem.id} of type ${props.type}:`, error);
    return initialItem; // Return initial item on error
  }
}

onMounted(async () => {
  // Map over categoryList to create promises, then update SVODs once all are settled
  const promises = props.categoryList.map(item => fetchSVODDetails(item));
  const results = await Promise.allSettled(promises);
  
  SVODs.value = results
    .filter(result => result.status === 'fulfilled' && result.value !== null)
    .map(result => (result as PromiseFulfilledResult<SVODDisplayItem>).value);
});

function onClickVod(vodId: number | string) { // vodId could be number from initial list or string from API
  const path =
    props.type === 'movies'
      ? `/svod/movie/${vodId}`
      : `/svod/series/${vodId}`;
  window.location.href = path; // Or router.push(path) for SPA navigation
}
</script>

<style scoped lang="css">

.swiper-slide {
  position: relative;
  /* width: 100%; /* Swiper handles slide width based on slidesPerView */
  border-radius: 10px;
  overflow: hidden;
}

.swiper-button-prev,
.swiper-button-next {
  width: 50px !important;
  height: 100% !important;
  top: 0;
  /* Add other necessary styles for positioning and appearance if default is not enough */
}

.premium-ribbon {
  position: absolute;
  top: 0;
  right: 0;
  width: auto; /* Let the image define its width, or set specific dimensions */
  height: auto;/* Let the image define its height, or set specific dimensions */
  max-width: 50px; /* Example max size */
  max-height: 50px;/* Example max size */
  /* object-fit: contain; /* Removed as v-img has 'cover' by default, this might conflict */
  pointer-events: none;
}

/* Ensure v-img within swiper-slide behaves as expected */
.swiper-slide .v-img {
  display: block;
  width: 100%;
  height: 100%; /* If you want the image to fill the slide's aspect ratio */
}
</style>