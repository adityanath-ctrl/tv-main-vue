<!-- /src/views/Players/SportsPlayer.vue -->
<template>
  <div class="d-container d-flex flex-column media-layout">
    <div v-if="isLoading" class="d-flex justify-center align-center fill-height">
      <v-progress-circular indeterminate color="primary" size="64" />
    </div>

    <MediaPlayer
      v-else-if="matchData"
      :content-data="matchData"
      content-type="sports"
      :content-id="Number(currentMatchId)"
      :hide-info-when-stacked="false"
      :hide-tabs="false"
      :info-min-width="960"
    />

    <div v-else class="d-flex justify-center align-center text-center pa-4" style="min-height: 40vh;">
      <p>Could not load match data.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRoute } from 'vue-router';
import MediaPlayer from '@/components/MediaPlayer.vue';
import useAuthStore from '@/store/useAuthStore';
import { getApiData, getUUID } from '@/utils/siberAPI';
import { MIDDLEWARE_API_URL, APPLICATION_ID } from '@/mainConfig';

const route = useRoute();
const authStore = useAuthStore();

const isLoading = ref(true);
const matchData = ref(null);

const currentMatchId = computed(() => {
  return route.params.sportId ?? route.params.matchId ?? route.params.id ?? route.params.eventId ?? null;
});

function normalizeMatchFromDetail(resp) {
  const account = resp?.data?.response?.account || null;
  const packages = resp?.data?.response?.packages || [];
  const arr = resp?.data?.response?.sport_events || [];
  const m = Array.isArray(arr) ? arr[0] || null : null;
  return m ? { ...m, account, packages } : null;
}

async function fetchMatchDetails(id) {
  if (!id) return;
  isLoading.value = true;
  matchData.value = null;
  try {
    const token = authStore.getToken;
    const uuid = getUUID();
    const url = `${MIDDLEWARE_API_URL}Sports/${id}?device_id=${uuid}&device=web&application_id=${APPLICATION_ID}`;
    const resp = await getApiData(url, token);
    matchData.value = normalizeMatchFromDetail(resp);
  } catch (e) {
    console.error('SportsPlayer: failed to fetch match details', e);
    matchData.value = null;
  } finally {
    isLoading.value = false;
  }
}

watch(
  () => currentMatchId.value,
  async (id) => {
    if (!id) return;
    await fetchMatchDetails(id);
  },
  { immediate: true }
);

onMounted(() => document.body.classList.add('lock-scroll'));
onBeforeUnmount(() => document.body.classList.remove('lock-scroll'));
</script>

<style scoped>
.d-container {
  height: 100%;
}

.media-layout {
  min-height: 100dvh;
}
</style>
