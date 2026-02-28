<!-- /src/views/Players/EventsPlayer.vue -->
<template>
  <div class="d-container d-flex flex-column media-layout">
    <div v-if="isLoading" class="d-flex justify-center align-center fill-height">
      <v-progress-circular indeterminate color="primary" size="64" />
    </div>

    <MediaPlayer
      v-else-if="selectedEvent && (selectedEvent.live_event_url || selectedEvent.streaming_url)"
      :key="selectedEvent.live_event_id"
      :content-data="selectedEvent"
      content-type="events"
      :content-id="Number($route.params.eventId)"
      :hide-info-when-stacked="false"
      :hide-tabs="false"
      :info-min-width="960"
      :event-items="eventsList"
      class="flex-grow-0"
      @select-event="onSelectEvent"
    />

    <div v-else class="d-flex justify-center align-center text-center pa-4" style="min-height: 40vh;">
      <p v-if="!selectedEvent">Could not load event data.</p>
      <p v-else>This event is currently unavailable. Please try again later.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MediaPlayer from '@/components/MediaPlayer.vue';
import useAuthStore from '@/store/useAuthStore';
import { getApiData, getUUID } from '@/utils/siberAPI';
import { MIDDLEWARE_API_URL, APPLICATION_ID } from '@/mainConfig';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(true);
const selectedEvent = ref(null);
const eventsList = ref([]);

/* Helpers */
function normalizeEventFromDetail(resp) {
  const account = resp?.data?.response?.account || null;
  const arr = resp?.data?.response?.events || [];
  const e = arr[0] || null;
  return e ? { ...e, account } : null;
}

function normalizeEventsList(resp) {
  const arr = resp?.data?.response?.events || [];
  return Array.isArray(arr) ? arr : [];
}

/* Fetch: all events (for tabs) */
async function fetchAllEvents() {
  try {
    const token = authStore.getToken;
    const uuid = getUUID();
    const url = `${MIDDLEWARE_API_URL}Events?device_id=${uuid}&device=web&application_id=${APPLICATION_ID}`;
    const resp = await getApiData(url, token);
    eventsList.value = normalizeEventsList(resp);
  } catch (e) {
    console.error('EventsPlayer: failed to fetch events list', e);
    eventsList.value = [];
  }
}

/* Fetch: single event details */
async function fetchEventDetails(eventId) {
  if (!eventId) return;
  isLoading.value = true;
  selectedEvent.value = null;
  const firstLoad = !selectedEvent.value;
  if (firstLoad) isLoading.value = true;
  try {
    const token = authStore.getToken;
    const uuid = getUUID();
    const url = `${MIDDLEWARE_API_URL}Events/${eventId}?device_id=${uuid}&device=web&application_id=${APPLICATION_ID}`;
    const resp = await getApiData(url, token);
    const detail = normalizeEventFromDetail(resp);
    selectedEvent.value = detail;
  } catch (e) {
    console.error('EventsPlayer: failed to fetch event details', e);
    selectedEvent.value = null;
    if (!selectedEvent.value) selectedEvent.value = null; // only null if we truly had nothing
  } finally {
    isLoading.value = false;
    if (firstLoad) isLoading.value = false;
  }
}

/* When user picks an item inside MediaPlayer’s lists */
function onSelectEvent(item) {
  if (!item) return;

  const idNum = Number(item.live_event_id ?? item.id);

  // show spinner while we fetch the canonical details
  isLoading.value = true;

  // IMPORTANT: do NOT pass a playable URL yet (prevents the first autoplay)
  selectedEvent.value = {
    // keep some fields for UI, but strip URLs
    ...item,
    live_event_id: idNum,
    live_event_url: null,
    streaming_url: null,
    account: selectedEvent.value?.account || null
  };

  const newPath = `/player/video/${idNum}`;
  if (route.path !== newPath) router.replace(newPath).catch(() => {});

  // always fetch the canonical event (with the real stream URL) and let THAT start the player
  fetchEventDetails(idNum);
}


/* Reactivity */
watch(
  () => route.params.eventId,
  async (id) => {
    if (eventsList.value.length === 0) await fetchAllEvents();
    if (!id) return;
    const idNum = Number(id);
    await fetchEventDetails(idNum); // <-- do not early-return; this prevents the second init/race
  },
  { immediate: true }
);


onMounted(async () => {
  if (eventsList.value.length === 0) await fetchAllEvents();
});

onMounted(() => document.body.classList.add('lock-scroll'));
onBeforeUnmount(() => document.body.classList.remove('lock-scroll'));

</script>

<style scoped>
.d-container {
  height: 100%;
}

/* Keep consistent with LiveTVPlayer so it sits just below the TopBar
   and the player/info panel mirror that page’s sizing */
.media-layout {
  min-height: 100dvh;
}
</style>
