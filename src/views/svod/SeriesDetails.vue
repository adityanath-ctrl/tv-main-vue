<!-- /src/views/svod/SeriesDetails.vue -->
<template>
  <div v-if="seriesInfo" class="details-page-wrapper" @click="navigationStateChange()">
    
    <!-- 1. Background Image -->
    <div class="background-image" :style="{ backgroundImage: `url(${backdropImage})` }"></div>

    <!-- 2. Main Content Area -->
    <div class="main-content">
      
      <!-- Section 1: Series Info -->
      <div class="info-container">
        <v-container>
            <div class="info-col">
              <img v-if="titleImage" :src="titleImage" class="title-logo" alt="Series Title Logo" />
              <h1 v-else class="text-h2 text-left font-weight-bold mb-4">{{ seriesInfo.name_short }}</h1>
              
              <p class="description-text text-left mb-8">
                {{ seriesInfo.description }}
              </p>
              
              <div class="action-buttons">
                <v-btn class="play-btn" size="x-large" @click="handlePlayClick">
                  <v-icon start>mdi-play</v-icon> Play
                </v-btn>
              </div>
            </div>
        </v-container>
      </div>

      <!-- Section 2: Episodes -->
      <div class="episodes-section">
        <v-container>
            <div class="tabs-bar">
              <span class="tab-item active">EPISODES</span>
            </div>

            <div class="season-selector-wrapper">
              <v-select
                v-model="selectedSeasonId"
                :items="seasonOptions"
                item-title="caption"
                item-value="id"
                variant="solo-filled"
                density="compact"
                hide-details
              ></v-select>
            </div>

            <div class="episode-grid">
              <div
                v-for="episode in selectedSeasonEpisodes"
                :key="episode.id"
                class="episode-card"
                @click="handleEpisodeClick(episode)"
              >
                <div class="episode-thumbnail-wrapper">
                  <img :src="episode.icon_url" class="episode-thumbnail" />
                  <div class="play-icon-overlay"><v-icon>mdi-play</v-icon></div>
                </div>
                <div class="episode-card-info">
                  <div class="episode-title">{{ episode.caption }}</div>
                  <div class="episode-description">{{ episode.description }}</div>
                </div>
              </div>
            </div>
        </v-container>
      </div>

    </div>
  </div>
  
  <div v-else class="details-loader">
    <v-progress-circular indeterminate size="64"></v-progress-circular>
  </div>

  <!-- Popups -->
  <ButtonFlowTemplate :closePopup="closePopup" :dialog="buttonFlowTemplatePopupRef" :popupContentType="popupContentType">
    <template #sign-in-required>
      <v-card-title class="d-flex justify-center"><h1 class="popupHeading">Log In Required</h1></v-card-title>
      <v-card-text class="popupSubHeading">{{ popupMessage }}</v-card-text>
      <v-card-actions class="d-flex justify-center align-center">
        <v-btn outlined class="popup-btn" @click="closePopup">Cancel</v-btn>
        <v-btn outlined class="popup-btn" @click="handleSignIn">Login</v-btn>
      </v-card-actions>
    </template>
    <template #premium-access-required>
      <v-card-title class="d-flex justify-center"><h1 class="popupHeading">Premium Content Access</h1></v-card-title>
      <v-card-text class="popupSubHeading">This content is available as part of our premium package.<br><br>Please click the continue button to enter your access code.</v-card-text>
      <v-card-actions class="d-flex justify-center align-center">
        <v-btn outlined class="popup-btn" @click="closePopup">Cancel</v-btn>
        <v-btn outlined class="popup-btn" @click="handleContinueToEnterCode">Continue</v-btn>
      </v-card-actions>
    </template>
    <template #continue-watching>
  <v-card-title class="d-flex justify-center">
    <h1 class="popupHeading">Continue watching?</h1>
  </v-card-title>

  <v-card-text class="popupSubHeading">
    <div v-if="continueEpisode">
      {{ continueEpisode.caption || 'Episode' }}
      <span v-if="continueResumeMs > 0"> — resume at {{ humanTimeMs(continueResumeMs) }}</span>
    </div>
  </v-card-text>

  <v-card-actions class="d-flex justify-center align-center" style="gap: 12px;">
    <v-btn outlined class="popup-btn" @click="onPlayFromBeginning">
      Play from beginning
    </v-btn>
    <v-btn outlined class="popup-btn" @click="onContinueWatching">
      Continue watching
    </v-btn>
  </v-card-actions>
</template>
  </ButtonFlowTemplate>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import useAuthStore from '@/store/useAuthStore';
import useSVODStore from '@/store/useSVODStore';
import useNavigationStore from '@/store/useNavigationStore';
import { useUIStore } from '@/store/useUIStore';
import ButtonFlowTemplate from '@/components/popups/btnFlowTemplate.vue';

// --- State and Stores ---
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const svodStore = useSVODStore();
const navigationStore = useNavigationStore();
const uiStore = useUIStore();

const selectedSeasonId = ref(null);
const buttonFlowTemplatePopupRef = ref(false);
const popupContentType = ref('');
const popupMessage = ref('');
const seriesId = ref(route.params.id);
const continueEpisode = ref(null);
const continueResumeMs = ref(0);

/** Format milliseconds as h:mm:ss / m:ss */
const humanTimeMs = (ms) => {
  const totalSec = Math.max(0, Math.floor(Number(ms || 0) / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
};

/** Read any locally cached resume for this episode (stored as ms). */
const readLocalResumeMs = (episode) => {
  try {
    const key = `resume:series:${seriesId.value}:ep:${episode.id}`;
    const raw = Number(localStorage.getItem(key) || 0);
    if (!Number.isFinite(raw) || raw <= 0) return 0;

    // Backward-compat: if a very small value was stored (likely seconds),
    // and server resume is clearly milliseconds, upscale it.
    const serverMs = Number(episode?.resume || 0);
    if (raw > 0 && raw < 10000 && serverMs >= 10000) return raw * 1000;

    return Math.floor(raw);
  } catch {
    return 0;
  }
};

/** Server resume is already milliseconds; prefer the larger of server/local. */
const resolveResumeForEpisodeMs = (episode) => {
  const fromServerMs = Math.max(0, Math.floor(Number(episode?.resume || 0)));
  const fromLocalMs  = readLocalResumeMs(episode);
  return Math.max(fromServerMs, fromLocalMs);
};

// Open the popup (now using ms)
const openContinuePopup = (episode) => {
  continueEpisode.value   = episode;
  continueResumeMs.value  = resolveResumeForEpisodeMs(episode);
  popupContentType.value  = 'continue-watching';
  buttonFlowTemplatePopupRef.value = true;
};

// Popup handlers (use ms)
const onPlayFromBeginning = () => {
  buttonFlowTemplatePopupRef.value = false;
  if (continueEpisode.value) playEpisode(continueEpisode.value, 0);
};
const onContinueWatching = () => {
  buttonFlowTemplatePopupRef.value = false;
  if (continueEpisode.value) playEpisode(continueEpisode.value, continueResumeMs.value || 0);
};

// --- Data Fetching ---
onMounted(() => getSeriesData());
watch(() => route.params.id, (newId) => {
  if (newId && newId !== seriesId.value) {
    seriesId.value = newId;
    getSeriesData();
  }
});
const getSeriesData = () => {
  if (seriesId.value) {
    svodStore.setSVODSeriesById({ vodId: seriesId.value });
  }
};

// --- Computed Properties ---
const seriesData = computed(() => svodStore.SVOD?.[seriesId.value]);
const seriesInfo = computed(() => seriesData.value?.series);
const backdropImage = computed(() => seriesInfo.value?.backdrop || seriesInfo.value?.image);
const titleImage = computed(() => seriesInfo.value?.title_logo_url);

const seasonOptions = computed(() => seriesInfo.value?.seasons || []);
const selectedSeasonEpisodes = computed(() => {
  if (!selectedSeasonId.value || !seasonOptions.value.length) return [];
  const season = seasonOptions.value.find(s => s.id === selectedSeasonId.value);
  return season?.episodes || [];
});

watch(seasonOptions, (newSeasons) => {
  if (newSeasons && newSeasons.length > 0 && !selectedSeasonId.value) {
    selectedSeasonId.value = newSeasons[0].id;
  }
}, { immediate: true });

// --- Click Handlers ---
const navigationStateChange = () => navigationStore.changeNavigationState(false);

const checkAccessAndProceed = (callback) => {
  const userIsLoggedIn = authStore.isUserLoggedIn;
  if (!seriesInfo.value) return;

  const hasAccess = seriesInfo.value.package_status;
  const canGetAccess = seriesInfo.value.packages?.[0]?.package_code_status;

  if (userIsLoggedIn && !hasAccess && canGetAccess) {
    popupContentType.value = 'premium-access-required';
    buttonFlowTemplatePopupRef.value = true;
    return;
  }
  if (!userIsLoggedIn && (!hasAccess || seriesInfo.value.login_required)) {
    popupMessage.value = 'Please log in to watch this series.';
    popupContentType.value = 'sign-in-required';
    buttonFlowTemplatePopupRef.value = true;
    return;
  }
  callback();
};

const handlePlayClick = () => {
  checkAccessAndProceed(() => {
    const firstSeason  = seasonOptions.value?.[0];
    const firstEpisode = firstSeason?.episodes?.find(ep => ep.vod_position === 1) || firstSeason?.episodes?.[0];
    if (!firstEpisode) return;

    const resumeMs = resolveResumeForEpisodeMs(firstEpisode);
    if (resumeMs > 0) openContinuePopup(firstEpisode);
    else playEpisode(firstEpisode, 0);
  });
};

const handleEpisodeClick = (episode) => {
  checkAccessAndProceed(() => {
    const resumeMs = resolveResumeForEpisodeMs(episode);
    if (resumeMs > 0) openContinuePopup(episode);
    else playEpisode(episode, 0);
  });
};


// UPDATED: push start_ms (milliseconds). Only include when > 0
const playEpisode = (episode, startAtMs = null) => {
  sessionStorage.setItem(`cameFromDetails:series:${seriesId.value}`, '1');

  const sMs = (() => {
    const fromArg = startAtMs != null ? Number(startAtMs) : NaN;
    const fromEp  = Number(episode?.resume ?? 0); // already ms
    const chosen  = Number.isFinite(fromArg) ? fromArg : fromEp;
    return Math.max(0, Math.floor(chosen || 0));
  })();

  const query = {};
  if (sMs > 0) query.start_ms = sMs;

  router.push({
    name: 'SeriesPlayer',
    params: { seriesId: seriesId.value, episodeId: episode.id },
    query,
    state: { from: 'SeriesDetails' }
  });
};


const closePopup = () => { buttonFlowTemplatePopupRef.value = false; };
const handleSignIn = () => { closePopup(); authStore.loginUser(); };
const handleContinueToEnterCode = () => { closePopup(); uiStore.openEnterCodePopup(); };
</script>

<style scoped>
/* --- Main Wrapper & Loader --- */
.details-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}
.details-page-wrapper {
  width: 100%;
  color: #fff;
}

/* --- Background --- */
.background-image {
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-repeat: no-repeat;
  background-position: center top;
  background-size: cover;
  z-index: 0;
}
.background-image::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    linear-gradient(to right, #111 20%, rgba(17,17,17,0.8) 40%, transparent 70%),
    radial-gradient(ellipse at center, transparent 50%, #111 110%);
}

/* --- Main Content Layout --- */
.main-content {
  padding-top: 64px;
  position: relative;
  z-index: 2;
}

/* --- YOUR SPECIFIC INFO CONTAINER STYLES --- */
.info-container {
  min-height: 55vh; /* Reduced height to bring episodes up */
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4vh 6vw 0;
  position: relative;
}
.info-container::after {
  content: 'EPISODES BELOW';
  position: absolute;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.5);
  font-weight: bold;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  animation: bounce 2s infinite;
}
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  40% {
    transform: translateX(-50%) translateY(-10px);
  }
  60% {
    transform: translateX(-50%) translateY(-5px);
  }
}
/* --- END OF YOUR SPECIFIC STYLES --- */

.info-col { text-align: left; }
.title-logo { max-width: 450px; max-height: 180px; object-fit: contain; margin-bottom: 1.5rem; }
.description-text { font-size: 1rem; line-height: 1.6; opacity: 0.9; max-width: 50%;}
.action-buttons { display: flex; gap: 1rem; margin-top: 2rem; }
.play-btn { background-color: #f9f9f9 !important; color: #111 !important; font-weight: bold; }
.trailer-btn { border-color: rgba(255, 255, 255, 0.7) !important; color: #f9f9f9 !important; }

/* --- Episodes Section --- */
.episodes-section {
  background-color: transparent; 
  padding: 1rem 6vw 4rem;
}
.tabs-bar {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}
.tab-item {
  padding: 0.5rem 0.25rem;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  position: relative;
  font-weight: bold;
  text-transform: uppercase;
}
.tab-item.active { color: #fff; }
.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #fff;
}
.season-selector-wrapper { max-width: 300px; margin-bottom: 2rem; }
.episode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
.episode-card {
  background-color: #1c1c1e;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease-in-out, background-color 0.2s;
}
.episode-card:hover { transform: scale(1.03); background-color: #2c2c2e; }
.episode-thumbnail-wrapper { position: relative; }
.episode-thumbnail { width: 100%; display: block; aspect-ratio: 16/9; object-fit: cover; }
.play-icon-overlay {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  display: flex; justify-content: center; align-items: center;
  background-color: rgba(0,0,0,0.5);
  color: white; opacity: 0;
  transition: opacity 0.2s ease-in-out;
  font-size: 3rem;
}
.episode-card:hover .play-icon-overlay { opacity: 1; }
.episode-card-info { padding: 1rem; }
.episode-title { font-weight: bold; margin-bottom: 0.5rem; }
.episode-description {
  font-size: 0.8rem;
  opacity: 0.8;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;  
  overflow: hidden;
}

/* --- Popups Styles --- */
.popupHeading { font-size: 20px; font-weight: bold; text-align: center; }
.popupSubHeading { text-align: center; }
.popup-btn { background-color: white !important; color: black !important; border-radius: 30px; }

/* --- Responsive --- */
@media (max-width: 959px) {
  .info-container { min-height: auto; padding: 2rem 1rem; }
  .info-container::after { display: none; }
  .episodes-section { padding-left: 1rem; padding-right: 1rem; }
  .description-text { max-width: 95%; }
  .title-logo { max-width: 80%; }
}

@media (max-width: 599px) {
  .info-container .info-col { text-align: center; }
  .info-container .action-buttons { justify-content: center; }
  .info-container .description-text { max-width: 100%; }
  .info-container h1 { font-size: 2.5rem !important; line-height: 1.2; text-align: center; }
}
</style>
