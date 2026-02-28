<!-- File: src/components/ProviderSubscriptionLiveTV.vue -->
<template>
  <div v-if="subscriptions.length">
    <div class="text-h6 text-left ml-10 fcw mb-3 mt-8">
      Live TV Packages
    </div>
    <swiper :modules="[Navigation, Mousewheel]" @swiper="onSwiperInitialized" navigation :breakpoints="breakpoints"
      :mousewheel="{ forceToAxis: true, sensitivity: 0.5, releaseOnEdges: true }" :slides-offset-before="50"
      :slides-offset-after="50" class="bg-none card-slider card-events-slider">
      <swiper-slide v-for="pkg in subscriptions" :key="`${pkg.package_id}-${pkg.ppgroup_price}`"
        class="item no-border bg-none subscription-item" @click="goToPackage(pkg.package_id)">
        <div class="live-event w-100 py-10">
          <div class="slider-img-container">
            <img :src="pkg.package_image" class="card-top-img event-vod-img" alt="package" />
          </div>
          <div class="d-flex align-center mt-5 overflow-hidden">
            <div class="d-flex flex-column text-left px-2 text-truncate" style="width:100%">
              <div class="text-wrap package-name">
                {{ pkg.package_name }}
              </div>
              <div class="package-price">
                $ {{ pkg.ppgroup_price }}
              </div>
            </div>
          </div>
        </div>
      </swiper-slide>

      <template #button-prev>
        <div @click="swiperInstance?.slidePrev()" class="swiper-top-position swiper-button-prev" />
      </template>
      <template #button-next>
        <div @click="swiperInstance?.slideNext()" class="swiper-top-position swiper-button-next" />
      </template>
    </swiper>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, type PropType } from 'vue'; // Added PropType
import { useRouter } from 'vue-router';
import type { Swiper as SwiperClass } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/mousewheel';
import { getSubscriptionLiveTV, getGuestToken, isTokenExpired } from '@/utils/siberAPI'; // Import token helpers
import useAuthStore from '@/store/useAuthStore';

interface PackageDisplayItem {
  package_id: number | string;
  package_name: string;
  package_image: string;
  ppgroup_price: string | number;
}

// Props
const props = defineProps({
  providerId: {
    type: Number as PropType<number>, // Prop remains a number as passed by parent
    required: true
  }
});

const router = useRouter();
const authStore = useAuthStore(); // Initialize once

// Raw API data for packages
const rawPackages = ref<any[]>([]); // Consider a more specific type for raw package structure

// Swiper instance
const swiperInstance = ref<SwiperClass | null>(null);
const onSwiperInitialized = (swiper: SwiperClass) => {
  swiperInstance.value = swiper;
};

// Fetch & flatten on mount
onMounted(async () => {
  let token = authStore.getToken;

  if (!token || isTokenExpired(token)) {
    // Fallback logic, ideally apiClient interceptor handles most token issues
    // console.warn(`ProviderSubscriptionLiveTV: Token invalid/missing for provider ${props.providerId}, attempting guest token.`);
    try {
      const guestTokenResponse = await getGuestToken();
      if (guestTokenResponse.data?.access_token) {
        token = guestTokenResponse.data.access_token;
      } else {
        console.error(`ProviderSubscriptionLiveTV: Failed to get guest token for provider ${props.providerId}.`);
        rawPackages.value = [];
        return;
      }
    } catch (error) {
      console.error(`ProviderSubscriptionLiveTV: Error fetching guest token for provider ${props.providerId}:`, error);
      rawPackages.value = [];
      return;
    }
  }
  
  if (!token) {
    console.error(`ProviderSubscriptionLiveTV: No valid token to fetch subscriptions for provider ${props.providerId}.`);
    rawPackages.value = [];
    return;
  }

  try {
    // --- FIX: Convert providerId to string for the API call ---
    const apiParams = { token, providerId: String(props.providerId) };
    // -----------------------------------------------------------
    // console.log(`ProviderSubscriptionLiveTV: Fetching subscriptions for provider ${props.providerId} with params:`, apiParams);
    const res = await getSubscriptionLiveTV(apiParams);
    // console.log(`ProviderSubscriptionLiveTV: API Response for provider ${props.providerId}:`, JSON.parse(JSON.stringify(res)));

    if (res.data?.response?.packages && Array.isArray(res.data.response.packages)) {
      rawPackages.value = res.data.response.packages;
    } else {
      // console.warn(`ProviderSubscriptionLiveTV: No packages found or invalid format for provider ${props.providerId}. Response:`, res);
      rawPackages.value = [];
    }
  } catch (error) {
    console.error(`ProviderSubscriptionLiveTV: Error fetching subscriptions for provider ${props.providerId}:`, error);
    rawPackages.value = [];
  }
});

// Flatten into individual entries for display
const subscriptions = computed((): PackageDisplayItem[] =>
  rawPackages.value.flatMap(pkg =>
    (pkg.package_pgroups_cards || []).map((card: any) => ({
      package_id:    pkg.package_id,
      package_name:  pkg.package_name,
      package_image: pkg.package_image,
      ppgroup_price: card.pgroup_price
    }))
  )
);

// Navigate to package
function goToPackage(id: number | string) { // id can be number or string
  // Assuming live TV packages also go to a generic package detail page
  router.push(`/svod/package/${id}`); // Adjust path if live TV packages have a different route
}

// Responsive breakpoints
const breakpoints = {
  0:    { slidesPerView: 1, spaceBetween: 10 },
  500:  { slidesPerView: 2, spaceBetween: 10 },
  768:  { slidesPerView: 3, spaceBetween: 20 },
  1600: { slidesPerView: 4, spaceBetween: 20 }
};
</script>

<style scoped lang="scss">
@use '../styles/home' as *;

/* hide native scrollbar */
.card-events-slider::-webkit-scrollbar {
  display: none
}

.card-events-slider {
  -ms-overflow-style: none;
  scrollbar-width: none
}

/* slide & arrows */
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

/* image container */
.slider-img-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  /* 16:9 */
  border-radius: 10px;
  overflow: hidden;
}

.event-vod-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
