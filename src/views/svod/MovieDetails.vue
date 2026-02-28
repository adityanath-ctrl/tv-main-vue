<!-- /src/views/svod/MovieDetails.vue -->
<template>
  <div v-if="movieInfo" class="details-page-wrapper" @click="navigationStateChange()">
    <!-- DESKTOP / TABLET VIEW -->
    <div class="desktop-view">
      <div class="svod-cover-div-desktop" :style="{ backgroundImage: `url(${backdropImage})` }">
        <v-row no-gutters>
          <v-col cols="12" sm="8" md="7" lg="6" class="d-flex justify-center flex-column">
            <div class="desktop-info-container">
              <!-- Title Image or Text -->
              <img v-if="titleImage" :src="titleImage" class="title-logo" alt="Movie Title Logo" />
              <h1 v-else class="text-h2 text-left font-weight-bold mb-4">{{ movieInfo.name_short }}</h1>

              <!-- Metadata Pills -->
              <div class="meta-pills mb-6">
                <span v-if="movieInfo.content_rating">{{ movieInfo.content_rating }}</span>
                <span v-if="movieInfo.year">{{ movieInfo.year }}</span>
                <span v-if="runtimeFormatted">{{ runtimeFormatted }}</span>
                <span v-for="genre in genresArray" :key="genre">{{ genre }}</span>
              </div>

              <!-- Description -->
              <p class="description-text text-left mb-8">
                {{ movieInfo.description }}
              </p>

              <!-- Action Buttons -->
              <div class="action-buttons">
                <template v-if="resumeMs > 0">
                  <v-btn class="play-btn" size="x-large" @click="startMovie(resumeMs)">
                    <v-icon start>mdi-play</v-icon> Resume Playing
                  </v-btn>
                  <v-btn class="trailer-btn" size="x-large" variant="outlined" @click="startMovie(0)">
                    Play from Beginning
                  </v-btn>
                </template>
                <template v-else>
                  <v-btn class="play-btn" size="x-large" @click="startMovie(0)">
                    <v-icon start>mdi-play</v-icon> Play
                  </v-btn>
                </template>

                <v-btn
                  v-if="movieInfo.trailer_url"
                  class="trailer-btn"
                  size="x-large"
                  variant="outlined"
                  @click="showTrailerModal"
                >
                  Trailer
                </v-btn>
              </div>

              <!-- Cast & Crew Info -->
              <div class="cast-info mt-8 text-left">
                <div v-if="movieInfo.director" class="cast-row">
                  <strong class="cast-label">Directors:</strong>
                  <span>{{ formattedDirectors }}</span>
                </div>
                <div v-if="movieInfo.actors" class="cast-row">
                  <strong class="cast-label">Starring:</strong>
                  <span>{{ formattedActors }}</span>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
    </div>

    <!-- MOBILE VIEW -->
    <div class="mobile-view">
      <div class="mobile-poster" :style="{ backgroundImage: `url(${movieInfo.poster_url})` }"></div>
      <v-container class="mobile-info-container">
        <h1 class="text-h4 font-weight-bold mb-4">{{ movieInfo.name_short }}</h1>

        <div class="action-buttons my-4">
          <template v-if="resumeMs > 0">
            <v-btn class="play-btn" size="large" @click="startMovie(resumeMs)">
              <v-icon start>mdi-play</v-icon> Resume
            </v-btn>
            <v-btn class="trailer-btn" size="large" variant="outlined" @click="startMovie(0)">
              From Beginning
            </v-btn>
          </template>
          <template v-else>
            <v-btn class="play-btn" size="large" @click="startMovie(0)">
              <v-icon start>mdi-play</v-icon> Play
            </v-btn>
          </template>

          <v-btn
            v-if="movieInfo.trailer_url"
            class="trailer-btn"
            size="large"
            variant="outlined"
            @click="showTrailerModal"
          >
            Trailer
          </v-btn>
        </div>

        <p class="description-text text-left mb-6">
          {{ movieInfo.description }}
        </p>
        <div class="meta-pills mb-6">
          <span v-if="movieInfo.content_rating">{{ movieInfo.content_rating }}</span>
          <span v-if="movieInfo.year">{{ movieInfo.year }}</span>
          <span v-if="runtimeFormatted">{{ runtimeFormatted }}</span>
        </div>
        <div class="cast-info mt-4 text-left">
          <div v-if="movieInfo.director" class="cast-row">
            <strong class="cast-label">Directors:</strong>
            <span>{{ formattedDirectors }}</span>
          </div>
          <div v-if="movieInfo.actors" class="cast-row">
            <strong class="cast-label">Starring:</strong>
            <span>{{ formattedActors }}</span>
          </div>
        </div>
      </v-container>
    </div>

    <!-- Related Content -->
    <!-- keep for later -->
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
      <v-card-text class="popupSubHeading">
        This content is available as part of our premium package.<br><br>
        Please click the continue button to enter your access code.
      </v-card-text>
      <v-card-actions class="d-flex justify-center align-center">
        <v-btn outlined class="popup-btn" @click="closePopup">Cancel</v-btn>
        <v-btn outlined class="popup-btn" @click="handleContinueToEnterCode">Continue</v-btn>
      </v-card-actions>
    </template>
  </ButtonFlowTemplate>

  <v-dialog v-model="trailerDialog" persistent max-width="900">
    <v-card class="rounded-lg">
      <v-card-title class="text-h5 pl-10 pt-8 pb-5">
        <v-icon @click="trailerDialog = false" class="float-right" style="cursor: pointer;">mdi-close-circle-outline</v-icon>
      </v-card-title>
      <v-card-text class="d-flex justify-center align-center">
        <VideoPlayer v-if="trailer_url" :options="{ autoPlay: true, controls: true, sources: [{ src: trailer_url }] }" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useDisplay } from 'vuetify';
import useAuthStore from '@/store/useAuthStore';
import useSVODStore from '@/store/useSVODStore';
import useNavigationStore from '@/store/useNavigationStore';
import { useUIStore } from '@/store/useUIStore';
import ButtonFlowTemplate from '@/components/popups/btnFlowTemplate.vue';
import VideoPlayer from '@/components/TrailerVideoPlayer.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const svodStore = useSVODStore();
const navigationStore = useNavigationStore();
const uiStore = useUIStore();
const { mobile } = useDisplay();

const trailerDialog = ref(false);
const trailer_url = ref("");
const buttonFlowTemplatePopupRef = ref(false);
const popupContentType = ref('');
const popupMessage = ref('');
const vodId = ref(route.params.id);

onMounted(() => { getSVOD(); });
watch(() => route.params.id, (newId) => {
  if (newId && newId !== vodId.value) {
    vodId.value = newId;
    getSVOD();
  }
});
const getSVOD = () => { if (vodId.value) svodStore.setSVODById({ vodId: vodId.value }); };

const svodData = computed(() => svodStore.SVOD?.[vodId.value]);
const movieInfo = computed(() => svodData.value?.movie_info?.[0]);
const backdropImage = computed(() => movieInfo.value?.backdrop_poster_url || movieInfo.value?.poster_url);
const titleImage = computed(() => movieInfo.value?.title_logo_url);
const moviesByActor = computed(() => svodData.value?.movies_by_actor || []);
const moviesByDirector = computed(() => svodData.value?.movies_by_director || []);
const directorName = computed(() => movieInfo.value?.director?.split(',')[0]);

const runtimeFormatted = computed(() => {
  if (!movieInfo.value?.duration) return '';
  const duration = parseInt(movieInfo.value.duration);
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
});

const genresArray = computed(() => movieInfo.value?.genre ? movieInfo.value.genre.split(',').slice(0, 3) : []);
const formattedDirectors = computed(() => movieInfo.value?.director ? movieInfo.value.director.split(',').join(', ') : '');
const formattedActors = computed(() => movieInfo.value?.actors ? movieInfo.value.actors.split(',').join(', ') : '');

// Duration (sec) -> milliseconds. When duration_in_milliseconds goes live, prefer it.
const durationMs = computed(() => {
  const c = movieInfo.value || {};

  // Future field (already ms)
  const msAlt = Number(c.duration_in_milliseconds);
  if (Number.isFinite(msAlt) && msAlt > 0) return Math.floor(msAlt);

  // Current live field: seconds -> ms
  const sec = Number(c.duration);
  return Number.isFinite(sec) && sec > 0 ? Math.floor(sec * 1000) : 0;
});

const resumeMs = computed(() => {
  const c = movieInfo.value || {};
  const raw = Number(c.resume_in_milliseconds ?? c.resume_ms ?? c.resume); // all ms
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  const val = Math.floor(raw);
  return durationMs.value > 0 ? Math.min(val, Math.max(0, durationMs.value - 1000)) : val;
});

// Navigation / trailer
const navigationStateChange = () => { navigationStore.changeNavigationState(false); };
const showTrailerModal = () => {
  if (movieInfo.value?.trailer_url) {
    trailer_url.value = movieInfo.value.trailer_url;
    trailerDialog.value = true;
  }
};

/** Shared movie start handler; startAtSec may be 0 or a resume value. */
const startMovie = (startAtMs = 0) => {
  const userIsLoggedIn = authStore.isUserLoggedIn;
  if (!movieInfo.value) return;

  // (your existing access gating stays the same)
  if (userIsLoggedIn && !movieInfo.value.package_status && movieInfo.value.packages?.[0]?.package_code_status) {
    popupContentType.value = 'premium-access-required';
    buttonFlowTemplatePopupRef.value = true;
    return;
  }
  if (!userIsLoggedIn && !movieInfo.value.package_status) {
    popupMessage.value = 'Log in is required to access this premium movie.';
    popupContentType.value = 'sign-in-required';
    buttonFlowTemplatePopupRef.value = true;
    return;
  }
  if (!userIsLoggedIn && movieInfo.value.login_required) {
    popupMessage.value = 'This movie is free but requires you to log in.';
    popupContentType.value = 'sign-in-required';
    buttonFlowTemplatePopupRef.value = true;
    return;
  }

  // mark the guard
  sessionStorage.setItem(`cameFromDetails:${vodId.value}`, '1');

  const query = {};
  if (Number.isFinite(startAtMs) && startAtMs > 0) {
    query.start_ms = Math.floor(startAtMs); // standardized ms param
  }

  router.push({
    path: `/player/movie/${vodId.value}`,
    query,
    state: { from: 'MovieDetails' }
  });
};


// Popup controls
const closePopup = () => { buttonFlowTemplatePopupRef.value = false; };
const handleSignIn = () => { closePopup(); authStore.loginUser(); };
const handleContinueToEnterCode = () => { closePopup(); uiStore.openEnterCodePopup(); };
</script>

<style scoped>
/* --- Loader & Main Wrapper --- */
.details-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

/* --- Desktop / Tablet Specific --- */
.desktop-view {
  display: block;
}
.mobile-view {
  display: none;
}

.svod-cover-div-desktop {
  width: 100%;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  background-repeat: no-repeat;
  background-position: center top;
  background-size: cover;
}

/* This ::after pseudo-element creates the entire overlay effect */
.svod-cover-div-desktop::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  
  /* --- ADJUSTED GRADIENTS --- */
  background:
    /* Layer 1: Left-side fade for text readability */
    linear-gradient(to right, #111 20%, rgba(17,17,17,0.8) 40%, transparent 70%),
    /* Layer 2: Radial vignette to darken edges */
    radial-gradient(ellipse at center, transparent 50%, #111 110%),
    /* Layer 3: Bottom fade for transition to related content */
    linear-gradient(to top, #111 5%, transparent 30%);
}

.desktop-info-container {
  padding-left: 6vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 2; /* Ensures text is on top of the ::after pseudo-element */
}

/* --- Mobile Specific --- */
.mobile-poster {
  width: 100%;
  height: 60vh;
  background-size: cover;
  background-position: center top;
  position: relative;
}
.mobile-poster::after {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: linear-gradient(to top, #111 20%, transparent 100%);
}
.mobile-info-container {
  padding: 1rem;
  margin-top: -20vh;
  position: relative;
  z-index: 3;
}

/* --- Shared Styles --- */
.title-logo { max-width: 450px; max-height: 200px; object-fit: contain; margin-bottom: 1.5rem; }
.meta-pills { display: flex; flex-wrap: wrap; gap: 1rem; }
.meta-pills span { padding: 4px 12px; border: 1px solid rgba(255,255,255,0.3); border-radius: 16px; font-size: 0.9rem; }
.description-text { font-size: 1rem; line-height: 1.6; opacity: 0.9; max-width: 85%;}
.cast-info { font-size: 0.9rem; opacity: 0.8; }
.cast-row { display: flex; margin-bottom: 0.5rem; }
.cast-label { flex-shrink: 0; width: 100px; font-weight: bold; }
.action-buttons { display: flex; gap: 1rem; }
.play-btn { background-color: #f9f9f9 !important; color: #111 !important; font-weight: bold; }
.trailer-btn { border-color: rgba(255, 255, 255, 0.7) !important; color: #f9f9f9 !important; }
.related-content-container { padding-top: 2rem; background-color: #111; }

/* --- Popups --- */
.popupHeading { font-size: 20px; font-weight: bold; text-align: center;}
.popupSubHeading { text-align: center; }
.popup-btn { background-color: white !important; color: black !important; border-radius: 30px; }

/* --- Responsive Breakpoint --- */
@media (max-width: 959px) {
  .desktop-view { display: none; }
  .mobile-view { display: block; }
  .description-text { max-width: 100%; }
  .mobile-info-container { text-align: left; }
  .action-buttons, .meta-pills { justify-content: flex-start; }
}
</style>