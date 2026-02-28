<!-- File: src/components/ProviderVideo.vue -->
<template>
  <div v-if="processedLiveEvents.length" class="provider-video">
    <div class="text-h6 text-left ml-10 fcw mb-6 mt-8">
      {{ category }}
    </div>
    <swiper
      :modules="[Navigation, Mousewheel]"
      @swiper="onSwiperInitialized"
      :navigation="true"
      :breakpoints="breakpoints"
      :mousewheel="{ forceToAxis: true, sensitivity: 0.5, releaseOnEdges: true }"
      :slides-offset-before="50"
      :slides-offset-after="50"
      class="bg-none card-slider card-events-slider"
    >
      <swiper-slide
        v-for="event in processedLiveEvents"
        :key="event.display_id"
        class="item no-border bg-none subscription-item"
      >
        <div class="live-event w-100 py-10">
          <div
            class="slider-img-container"
            @click="onClickLiveTV(event.display_id)" 
          >
            <img
              :src="isDev ? CardLive : (event.live_event_image_wide || CardLive)"
              class="card-top-img event-vod-img"
              alt="Event image"
            />
            <!-- Check package_status safely. Assuming false or 0 means locked. -->
            <div v-if="event.package_status === false || event.package_status === 0" class="disabled-event-vod">
              <img
                :src="LockImage"
                alt="locked"
                style="width:100px; height:100px"
              />
            </div>
          </div>

          <div class="d-flex align-center mt-5 overflow-hidden">
            <v-avatar size="40" class="avatar-img">
              <img
                :src="event.content_provider_logo || DefaultProviderLogo"
                alt="provider logo"
                style="width:40px; height:40px; border-radius:50%"
                @click="onClickProvider(event.content_provider_id)"
              />
            </v-avatar>
            <div class="d-flex flex-column text-left px-2" style="width:100%">
              <div class="d-flex justify-space-between">
                <div
                  class="event-short fm fcw short_name text-truncate"
                >
                  <p class="text-truncate">{{ event.live_event_name_short || 'Event Title' }}</p>
                  <p class="text-truncate">{{ event.content_provider_name || 'Provider Name' }}</p>
                </div>
                <v-img
                  v-if="event.channel_status === 'ACTIVE'"
                  :src="LiveStatus"
                  width="56"
                  height="25"
                  class="ml-10"
                  alt="Live status"
                />
              </div>
              <h3
                class="fm fcg date-size text-truncate"
                style="font-size:14px; font-weight:100"
              >
                {{ event.formatted_live_event_date }} {/* Use the new formatted date property */}
              </h3>
            </div>
          </div>
        </div>
      </swiper-slide>

      <template #button-prev>
        <div class="swiper-top-position swiper-button-prev"></div>
      </template>
      <template #button-next>
        <div class="swiper-top-position swiper-button-next"></div>
      </template>
    </swiper>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { PropType } from 'vue';
import { useRouter } from 'vue-router';
import type { Swiper as SwiperClass } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Mousewheel } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/mousewheel';

// Import the EventItem interface from your store
import useEventsStore, { type EventItem } from '@/store/useEventsStore';
import { changeTimeFormatEST } from '@/utils/date';
import CardLive from '@/assets/img/card-live.png'; // Default image if event image is missing
import LiveStatus from '@/assets/img/live-status.png';
import LockImage from '@/assets/img/lock.svg';
import DefaultProviderLogo from '@/assets/img/starter-logo.png'; // Add a default provider logo image

// Props
const props = defineProps({
  providerId: { type: Number as PropType<number>, required: true },
  category:   { type: String as PropType<string>, required: true } // e.g., "Uploaded Videos" or "Live/Upcoming"
});

const router = useRouter();
const isDev = import.meta.env.DEV; // Correct way to check for dev mode in Vite

const swiperInstance = ref<SwiperClass | null>(null);
const onSwiperInitialized = (swiper: SwiperClass) => {
  swiperInstance.value = swiper;
};

const breakpoints = {
  0:    { slidesPerView: 1, spaceBetween: 10 },
  500:  { slidesPerView: 2, spaceBetween: 10 },
  768:  { slidesPerView: 3, spaceBetween: 20 },
  1600: { slidesPerView: 4, spaceBetween: 20 }
};

const eventsStore = useEventsStore();

onMounted(() => {
  eventsStore.getEventsByContentProviderId({
    providerId: String(props.providerId) // Store action expects string
  });
});

// Renamed from liveEvents to avoid conflict and clarify it's processed
const processedLiveEvents = computed(() => {
  // Explicitly type the events from the store
  const providerEventsTyped = (eventsStore.ProviderEvents || []) as EventItem[];

  return providerEventsTyped
    .map(ev => {
      // Create a new object to avoid modifying the store state directly,
      // and to add/ensure properties for the template.
      const displayId = ev.live_event_id !== undefined ? ev.live_event_id : ev.id;
      return {
        // Spread original event properties
        ...ev, 
        // Ensure a reliable ID for keys and navigation
        display_id: displayId, 
        // Safely format date
        formatted_live_event_date: ev.live_event_date ? changeTimeFormatEST(ev.live_event_date) : 'Date N/A',
      };
    })
    .sort((a, b) => {
      // Sort by original date, ensuring dates are valid before comparison
      const dateA = a.live_event_date ? new Date(a.live_event_date).getTime() : 0;
      const dateB = b.live_event_date ? new Date(b.live_event_date).getTime() : 0;
      return dateB - dateA; // Descending order (newest first)
    })
    .filter(ev => {
      // Safe access to playback status
      const status = ev.live_event_playback_status ?? ''; // Default to empty string if undefined
      if (props.category === 'Uploaded Videos') {
        return ['uploaded', 'pending_upload'].includes(status);
      } else { // Assuming other categories are for pending/started/finished
        return ['pending', 'started', 'finished'].includes(status);
      }
    });
});

// Use `processedLiveEvents` in v-if in the template
const liveEvents = computed(() => processedLiveEvents.value); // Keep original name if template relies on it for v-if

// Navigation handlers
function onClickLiveTV(id?: number | string) { // Make id optional
  if (id !== undefined && id !== null) {
    router.push(`/player/video/${id}`);
  } else {
    console.warn("ProviderVideo: onClickLiveTV called with undefined id");
  }
}

function onClickProvider(id?: number | string) { // Make id optional
  if (id !== undefined && id !== null) {
    router.push(`/provider/${id}`);
  } else {
    console.warn("ProviderVideo: onClickProvider called with undefined id");
  }
}
</script>

<style scoped lang="scss">
@use '../styles/home' as *; 

/* hide native scrollbar */
.card-events-slider::-webkit-scrollbar { display: none }
.card-events-slider { -ms-overflow-style: none; scrollbar-width: none }

/* slide & arrows */
.swiper-slide {
  position: relative;
  /* width: 100%; Swiper handles width */
  border-radius: 10px;
  overflow: hidden;
}
.swiper-button-prev,
.swiper-button-next {
  width: 50px !important;
  height: 100% !important;
  top: 0;
  z-index: 10; /* Ensure buttons are clickable */
}

/* image container */
.slider-img-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
  border-radius: 10px;
  overflow: hidden;
  background-color: #222; /* Placeholder background while image loads */
  cursor: pointer;
}

/* cover image */
.event-vod-img {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  object-fit: cover; /* Ensures image covers the area, might crop */
}

/* locked overlay */
.disabled-event-vod {
  position: absolute;
  inset: 0; /* Covers the entire parent */
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2; /* Above the image */
}

/* avatar & text */
.avatar-img img { 
  cursor: pointer;
  border: 1px solid #444; /* Optional: slight border for avatar */
}
.event-short { max-width: calc(100% - 70px); } /* Adjust based on LiveStatus width + margin */
.date-size   { /* max-width: 40%;  Let it take remaining space or set fixed width */ }
</style>