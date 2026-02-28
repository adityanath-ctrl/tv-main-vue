<!-- /src/views/Players/LiveTVPlayer.vue -->
<template>
  <div class="d-container d-flex flex-column media-layout">
    <div v-if="isLoading" class="d-flex justify-center align-center fill-height">
      <v-progress-circular indeterminate color="primary" size="64" />
    </div>

    <MediaPlayer v-else-if="channelData && channelData.streaming_url" :content-data="channelData" content-type="live_tv"
      :content-id="Number($route.params.liveId)" :now-next-programs="nowNextPrograms" :now-next-loading="nowNextLoading"
      :show-next-program="true" :hide-info-when-stacked="false" :hide-tabs="false" :info-min-width="960"
      class="flex-grow-0" />

    <div v-else class="d-flex justify-center align-center text-center pa-4" style="min-height: 40vh;">
      <p v-if="!channelData">Could not load channel data.</p>
      <p v-else>This stream is currently unavailable. Please try again later.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import MediaPlayer from '@/components/MediaPlayer.vue';
import useAuthStore from '@/store/useAuthStore';
import { getApiData, getUUID } from '@/utils/siberAPI';
import { MIDDLEWARE_API_URL, APPLICATION_ID } from '@/mainConfig';

const route = useRoute();
const authStore = useAuthStore();

const channelData = ref(null);
const isLoading = ref(true);

/* Now & Next (moved here from MediaPlayer) */
const nowNextPrograms = ref([]);
const nowNextLoading = ref(false);

/* Fetch channel info */
const fetchChannelData = async (channelId) => {
  if (!channelId) return;
  isLoading.value = true;
  channelData.value = null;

  try {
    const token = authStore.getToken;
    if (!token) throw new Error('Authentication token not available.');
    const uuid = getUUID();
    const url = `${MIDDLEWARE_API_URL}Channels/${channelId}?device_id=${uuid}&device=web&application_id=${APPLICATION_ID}`;
    const response = await getApiData(url, token);

    if (response.data?.response?.tv_channel?.[0]) {
      const mainData = response.data.response.tv_channel[0];
      const accountData = response.data.response.account;
      channelData.value = { ...mainData, account: accountData };

      // refresh Now & Next for this channel
      fetchNowNext(mainData.id);
    } else {
      console.error('Failed to fetch channel data or data format is incorrect:', response);
    }
  } catch (error) {
    console.error('Error fetching channel data:', error);
  } finally {
    isLoading.value = false;
  }
};

/* Fetch Now & Next for a single channel */
const toMs = (t) => (t < 1e12 ? t * 1000 : t);
async function fetchNowNext(channelId) {
  nowNextLoading.value = true;
  nowNextPrograms.value = [];
  try {
    const token = authStore.getToken;
    const uuid = getUUID();
    const now = Math.floor(Date.now() / 1000);
    const end = now + (6 * 60 * 60);
    const url = `${MIDDLEWARE_API_URL}Epg?start=${now}&end=${end}&device_id=${uuid}&device=web&application_id=${APPLICATION_ID}&channel_id=${channelId}`;
    const response = await getApiData(url, token);

    if (response.data?.[0]?.programs?.length) {
      nowNextPrograms.value = response.data[0].programs
        .map(p => ({
          ...p,
          progStart_ms: toMs(p.progStart_time),
          progStop_ms: toMs(p.progStop_time),
        }))
        .sort((a, b) => a.progStart_ms - b.progStart_ms)
        .slice(0, 2);
    }
  } catch (e) {
    console.error('Error fetching Now & Next:', e);
  } finally {
    nowNextLoading.value = false;
  }
}

/* Reactivity */
watch(() => route.params.liveId, (newId) => {
  if (newId) fetchChannelData(newId);
}, { immediate: true });

watch(() => authStore.isUserLoggedIn, (/* loggedIn */) => {
  if (channelData.value?.id) {
    // Optional: refresh Now & Next after login state changes
    fetchNowNext(channelData.value.id);
  }
});
</script>


<style scoped>
.d-container {
  height: 100%;
}

.media-layout {
  min-height: 100dvh;
}

/* Popup styles to match your card */
.popupHeading {
  padding: 0;
  margin: 0;
  font-size: 20px;
  font-weight: bold;
}

.popupSubHeading {
  padding-top: 0;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 0;
  text-align: center;
}

.popup-btn {
  background-color: white !important;
  color: black !important;
  text-transform: capitalize;
  font-weight: 600;
  border-radius: 30px;
  padding: 0 20px;
}
</style>
