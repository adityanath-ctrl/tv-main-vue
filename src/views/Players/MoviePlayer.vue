<!-- /src/views/Players/MoviePlayer.vue -->
<template>
  <div class="movie-player-view">
    <!-- Header -->
    <div class="player-header" ref="headerRef">
      <div class="header-content">
        <v-btn icon variant="plain" class="back-button" @click="goBack" data-tv-focusable>
          <v-icon size="x-large">mdi-arrow-left</v-icon>
        </v-btn>
        <h1 class="movie-title">{{ movieData?.name_short || 'Movie Player' }}</h1>
      </div>
    </div>

    <!-- Loader -->
    <div v-if="loading" class="player-loader">
      <v-progress-circular indeterminate size="64" />
    </div>

    <!-- Player viewport (16:9 box) -->
    <div v-else-if="movieData" class="viewport" :style="viewportStyle"
      @mouseenter="showOverlay" @mousemove="showOverlay" @mouseleave="hideOverlayDelayed">
      <div id="movie-rmp"></div>
      <!-- TV-navigable player overlay controls -->
      <div class="player-tv-overlay" :class="{ 'player-tv-overlay--visible': overlayVisible }">
        <div class="player-tv-controls">
          <button class="player-tv-control" data-tv-focusable @click="doRewind" title="Rewind 10s">
            <v-icon size="28">mdi-rewind-10</v-icon>
          </button>
          <button class="player-tv-control player-tv-control--main" data-tv-focusable @click="doPlayPause" title="Play/Pause">
            <v-icon size="40">{{ videoPaused ? 'mdi-play' : 'mdi-pause' }}</v-icon>
          </button>
          <button class="player-tv-control" data-tv-focusable @click="doForward" title="Forward 10s">
            <v-icon size="28">mdi-fast-forward-10</v-icon>
          </button>
          <button class="player-tv-control" data-tv-focusable @click="doMute" title="Mute/Unmute">
            <v-icon size="24">{{ videoMuted ? 'mdi-volume-off' : 'mdi-volume-high' }}</v-icon>
          </button>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else class="player-error">
      <p>Sorry, this movie could not be loaded.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePlayerNavigation } from '@/composables/usePlayerNavigation';
import useSVODStore from '@/store/useSVODStore';
import useAuthStore from '@/store/useAuthStore';
import {
  RADIANTMEDIAPLAYER_LICENCE_KEY,
  MUX_ENV_KEY,
  APPLICATION_ID,
  SITE_TITLE,
  MIDDLEWARE_API_URL
} from '@/mainConfig';
import { getUUID, getApiData, watchVideoPlay, watchVideoStop } from '@/utils/siberAPI';

const route = useRoute();
const router = useRouter();
const svodStore = useSVODStore();
const authStore = useAuthStore();

const vodId = ref(route.params.movieId);
const loading = ref(true);

/* ── TV overlay controls ── */
const overlayVisible = ref(false);
const videoPaused = ref(true);
const videoMuted = ref(false);
let overlayTimer = null;
let statePollTimer = null;

function showOverlay() {
  overlayVisible.value = true;
  if (overlayTimer) clearTimeout(overlayTimer);
  overlayTimer = setTimeout(() => { overlayVisible.value = false; }, 4000);
}
function hideOverlayDelayed() {
  if (overlayTimer) clearTimeout(overlayTimer);
  overlayTimer = setTimeout(() => { overlayVisible.value = false; }, 2000);
}
function getVid() { return document.querySelector('#movie-rmp video'); }
function syncVidState() { const v = getVid(); if (v) { videoPaused.value = v.paused; videoMuted.value = v.muted; } }
function doPlayPause() { const v = getVid(); if (v) { v.paused ? v.play() : v.pause(); syncVidState(); } showOverlay(); }
function doRewind() { const v = getVid(); if (v) v.currentTime = Math.max(0, v.currentTime - 10); showOverlay(); }
function doForward() { const v = getVid(); if (v) v.currentTime = Math.min(v.duration - 1, v.currentTime + 10); showOverlay(); }
function doMute() { const v = getVid(); if (v) { v.muted = !v.muted; syncVidState(); } showOverlay(); }

const playerNav = usePlayerNavigation({
  getPlayer: () => rmp,
  onBack: () => goBack(),
  containerSelector: '#movie-rmp',
  seekStep: 10,
  autoHideMs: 4000
});

const svodDetail = computed(() => svodStore.SVOD?.[vodId.value]);
const movieData  = computed(() => svodDetail.value?.movie_info?.[0] || null);

/* ---------- Entry guard: must come from MovieDetails ---------- */
function cameFromDetailsGuard() {
  const fromState = (window.history?.state?.from) === 'MovieDetails';
  const fromSession = sessionStorage.getItem(`cameFromDetails:${vodId.value}`) === '1';
  return fromState || fromSession;
}

/* ---------- Header + viewport measurements ---------- */
const headerRef = ref(null);
const headerHeight = ref(64);
const vpWidth  = ref(window.innerWidth);
const vpHeight = ref(window.innerHeight);

function measureHeader() {
  headerHeight.value = headerRef.value?.offsetHeight || 64;
}
function onResize() {
  vpWidth.value  = window.innerWidth;
  vpHeight.value = window.innerHeight;
  measureHeader();
}

onMounted(() => {
  measureHeader();
  window.addEventListener('resize', onResize, { passive: true });
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
});

const startMs = computed(() => {
  // accept both start_ms (new) and start (legacy)
  const raw = route.query.start_ms;
  const v = Number(raw);
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
});
const startQuerySec = computed(() => Math.floor(startMs.value / 1000)); // rmp.seek wants seconds


/* Handheld detection (mobile/tablet in portrait & landscape) */
const isHandheld = computed(() => {
  const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  return touch || vpWidth.value <= 1280;
});

/* 16:9 numeric box based on available viewport */
const box = computed(() => {
  const maxH = vpHeight.value;
  const widthLimited = (vpWidth.value * 9 / 16) <= maxH;
  if (widthLimited) {
    const w = vpWidth.value;
    return { w, h: Math.round(w * 9 / 16) };
  } else {
    const h = maxH;
    return { h, w: Math.round(h * 16 / 9) };
  }
});

const viewportStyle = computed(() => {
  const style = {
    width:  `${box.value.w}px`,
    height: `${box.value.h}px`,
    left: '50%'
  };
  if (isHandheld.value) {
    style.top = '50%';
    style.transform = 'translate(-50%, -50%)';
  } else {
    style.top = '0';
    style.transform = 'translateX(-50%)';
  }
  return style;
});

/* ---------- Radiant single-init and sizing ---------- */
let rmp = null;
let lastSrcKey = '';
const RMP_SCRIPT_URL = '/radiantmediaplayer/rmp.min.js';
let radiantLoader = null;

function ensureRadiant() {
  if (typeof window !== 'undefined' && window.RadiantMP) return Promise.resolve();
  if (radiantLoader) return radiantLoader;
  radiantLoader = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = RMP_SCRIPT_URL;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return radiantLoader;
}

const streamingUrl = computed(() => {
  const c = movieData.value || {};
  return c.movie_url || c.streaming_url || '';
});

const muxDataSettings = computed(() => {
  const c = movieData.value || {};
  const account = c.account || {};
  const contentId = c.id ?? vodId.value ?? '';
  return {
    debug: true,
    data: {
      env_key: MUX_ENV_KEY,
      viewer_user_id: account.customer_id || getUUID(),
      video_title: `vod_movies~${contentId}`,
      player_name: SITE_TITLE,
      custom_1: new URLSearchParams({
        app_id: APPLICATION_ID,
        content_provider_id: c.content_provider_id || '',
        content_type: 'vod_movies',
        content_id: contentId,
        device_type: 'web',
        user_ip: account.client_ip || '',
        user_gender: account.user_gender || 'unknown',
        user_age: account.user_age || 'unknown',
      }).toString()
    }
  };
});

function buildSettings(src, widthPx, heightPx) {
  const poster =
    movieData.value?.backdrop_poster_url ||
    movieData.value?.wide_poster_url ||
    movieData.value?.poster_url ||
    '';
  return {
    licenseKey: RADIANTMEDIAPLAYER_LICENCE_KEY,
    pathToRmpFiles: '/radiantmediaplayer/',
    skin: 's2',
    autoplay: true,
    autoHeightMode: false,
    width:  widthPx,
    height: heightPx,
    src: src ? { hls: src } : undefined,
    skinBackgroundColor: 'rgba(0,0,0,0.9)',
    googleCast: true,
    airplay: true,
    pip: true,
    quickRewind: 10,
    quickForward: 10,
    dvrUIThreshold: 300,
    forceHlsJSOnAppleDevices: true,
    muxDataSettings: muxDataSettings.value,
    contentMetadata: poster ? { poster: [poster] } : undefined
  };
}

function applyBoxSize() {
  const el = document.getElementById('movie-rmp');
  if (!el) return;
  el.style.setProperty('width',  `${box.value.w}px`, 'important');
  el.style.setProperty('height', `${box.value.h}px`, 'important');

  try {
    if (typeof rmp?.resize === 'function') {
      rmp.resize(box.value.w, box.value.h);
    } else if (typeof rmp?.setSize === 'function') {
      rmp.setSize(box.value.w, box.value.h);
    }
  } catch {}
}

/* ---------- WATCHING API wiring ---------- */
// Token (try common places; fall back to localStorage if you keep it there)
const authToken = computed(() =>
  authStore?.token ||
  authStore?.account?.token ||
  authStore?.user?.token ||
  localStorage.getItem('authToken') ||
  ''
);

// State
const deviceId = getUUID();
const playSent = ref(false);
const lastResumeSecSent = ref(0);
const resumeSec = ref(0);
const progressPingTimer = ref(null);
const stopDebounceTimer = ref(null);

// duration from movie details (e.g. "5640")
const movieDurationSec = computed(() => {
  const raw = movieData.value?.duration;
  const n = typeof raw === 'string' ? parseInt(raw, 10) : Number(raw || 0);
  return Number.isFinite(n) && n > 0 ? n : 0;
});

const movieDurationMs = computed(() => {
  const ms = Number(movieData.value?.duration_in_milliseconds);
  if (Number.isFinite(ms) && ms > 0) return Math.floor(ms);
  return Math.floor((movieDurationSec.value || 0) * 1000);
});

// local backup
const RESUME_KEY = computed(() => `resume:movie:${vodId.value}`);
function saveLocalResume(sec) {
  try { localStorage.setItem(RESUME_KEY.value, String(Math.max(0, Math.floor(sec || 0)))); } catch {}
}

function readCurrentSeconds() {
  try {
    if (typeof rmp?.getCurrentTime === 'function') return Math.floor(rmp.getCurrentTime() || 0);
  } catch {}
  try {
    const v = document.querySelector('#movie-rmp video');
    if (v) return Math.floor(v.currentTime || 0);
  } catch {}
  return 0;
}

async function sendPlayWatching() {
  if (playSent.value) return;
  await watchVideoPlay({
    token: authToken.value,
    vodId: vodId.value
  });
  playSent.value = true;
}

async function sendStopWatching({ reason = 'progress', keepalive = false } = {}) {
  // capture ms
  const currentSec = readCurrentSeconds();
  const resume_ms = currentSec * 1000;

  // throttle tiny changes for heartbeat
  if (reason === 'progress' && Math.abs(currentSec - lastResumeSecSent.value) < 3) return;

  await watchVideoStop({
    token: authToken.value,
    vodId: vodId.value,
    resume_ms,
    movie_duration_ms: (movieDurationSec.value || 0) * 1000,
    keepalive
  });

  lastResumeSecSent.value = currentSec;
  saveLocalResume(currentSec);
}

function startProgressHeartbeat() {
  if (progressPingTimer.value) return;
  progressPingTimer.value = setInterval(() => {
    resumeSec.value = readCurrentSeconds();
    sendStopWatching({ reason: 'progress' });
  }, 15000);
}
function stopProgressHeartbeat() {
  if (progressPingTimer.value) { clearInterval(progressPingTimer.value); progressPingTimer.value = null; }
}
function queueStop(reason = 'seeked') {
  if (stopDebounceTimer.value) clearTimeout(stopDebounceTimer.value);
  stopDebounceTimer.value = setTimeout(() => sendStopWatching({ reason }), 800);
}

/* ---------- Init / swap RMP and hook events ---------- */
async function initOrSwap(src, startAt = startQuerySec.value) {
  if (!src) {
    console.warn('[MoviePlayer] No streaming URL found for this title.');
    return;
  }
  if (src === lastSrcKey && rmp) {
    applyBoxSize();
    return;
  }

  await ensureRadiant().catch((e) => console.error('Failed to load Radiant script', e));
  if (!window.RadiantMP) {
    console.error('RadiantMP global not found');
    return;
  }

  if (rmp) {
    try { rmp.stop?.(); } catch {}
    try { rmp.destroy?.(); } catch {}
    rmp = null;
  }

  const container = document.getElementById('movie-rmp');
  if (!container) return;

  rmp = new window.RadiantMP('movie-rmp');
  try { rmp.on?.('error', (e) => console.warn('RMP error', e)); } catch {}

  // NEW: perform a single seek to the requested start time
  const targetStart = Number(startAt) || 0;
  let didInitialSeek = false;
  const doSeekOnce = () => {
    if (didInitialSeek || targetStart <= 0) return;
    try {
      if (typeof rmp.seek === 'function') {
        rmp.seek(targetStart);
      } else {
        // fallback: native video element
        const v = document.querySelector('#movie-rmp video');
        if (v) v.currentTime = targetStart;
      }
      didInitialSeek = true;
    } catch {}
  };

  // Attach BEFORE init so we don't miss early events
  try {
    if (typeof rmp.one === 'function') {
      ['loadedmetadata', 'ready', 'playing'].forEach(evt => rmp.one(evt, doSeekOnce));
    } else {
      ['loadedmetadata', 'ready', 'playing'].forEach(evt => {
        const h = () => { doSeekOnce(); try { rmp.off?.(evt, h); } catch {} };
        rmp.on?.(evt, h);
      });
    }
  } catch {}

  try {
    rmp.init(buildSettings(src, box.value.w, box.value.h));
  } catch (e) {
    console.error('RMP init failed', e);
  }

  // optional: start low then auto
  try {
    const nudge = () => {
      try {
        if (rmp && 'quality' in rmp) {
          rmp.quality = 0;
          setTimeout(() => { if (rmp) rmp.quality = -1; }, 3000);
        }
      } catch {}
    };
    if (typeof rmp.one === 'function') rmp.one('playing', nudge);
    else if (typeof rmp.on === 'function') {
      const onPlayOnce = () => { nudge(); try { rmp?.off?.('playing', onPlayOnce); } catch {} };
      rmp.on('playing', onPlayOnce);
    } else setTimeout(nudge, 1000);
  } catch {}

  // --- Watching API hooks ---
  try {
    // First actual playback -> send play + start heartbeat
    const onFirstPlaying = () => { sendPlayWatching(); startProgressHeartbeat(); };
    if (typeof rmp.one === 'function') rmp.one('playing', onFirstPlaying);
    else rmp.on?.('playing', onFirstPlaying);
  } catch {}

  try {
    // Keep resume up-to-date
    const onTime = () => {
      resumeSec.value = readCurrentSeconds();
      saveLocalResume(resumeSec.value);
    };
    rmp.on?.('timeupdate', onTime);
    rmp.on?.('time', onTime);
  } catch {}

  try {
    // User finished seeking -> debounce a stop with fresh resume
    const onSeeked = () => { resumeSec.value = readCurrentSeconds(); queueStop('seeked'); };
    rmp.on?.('seeked', onSeeked);
  } catch {}

  try {
    // Pause / Ended
    const onPause = () => queueStop('pause');
    const onEnded = () => {
      resumeSec.value = movieDurationSec.value || readCurrentSeconds();
      sendStopWatching({ reason: 'ended' });
    };
    rmp.on?.('pause', onPause);
    rmp.on?.('ended', onEnded);
  } catch {}

  lastSrcKey = src;
  applyBoxSize();
}

/* ---------- Load & watch ---------- */
async function loadMovie() {
  if (!vodId.value) return;
  loading.value = true;
  await svodStore.setSVODById({ vodId: vodId.value });
  loading.value = false;
  initOrSwap(streamingUrl.value, startQuerySec.value);
}

onMounted(async () => {
  if (!cameFromDetailsGuard()) {
    router.replace({ name: 'MovieDetails', params: { id: vodId.value } });
    return;
  }
  // page lifecycle
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('beforeunload', onPageHide);

  await loadMovie();
  // Enable player keyboard nav (arrows = seek/volume, Enter = play/pause, Esc = back)
  playerNav.enable();
  statePollTimer = setInterval(syncVidState, 1000);
});

watch(() => route.params.movieId, async (newId) => {
  if (newId && newId !== vodId.value) {
    await sendStopWatching({ reason: 'switch', keepalive: true });
    vodId.value = newId;
    playSent.value = false;
    lastResumeSecSent.value = 0;
    await loadMovie();
  }
});

watch(streamingUrl, (newUrl) => {
  if (!loading.value) initOrSwap(newUrl, startQuerySec.value);
});

// Optional: if the query param changes on-the-fly, seek immediately
watch(() => route.query.start_ms, (v) => {
  const ms = Number(v);
  if (rmp && Number.isFinite(ms) && ms > 0) {
    try { rmp.seek(Math.floor(ms / 1000)); } catch {}
  }
});


// keep the player sized correctly on every resize/orientation change
watch([box, isHandheld], () => applyBoxSize());

function onPageHide() {
  // best-effort final stop with keepalive (includes Authorization)
  sendStopWatching({ reason: 'pagehide', keepalive: true });
}

onBeforeUnmount(() => {
  stopProgressHeartbeat();
  sendStopWatching({ reason: 'unmount', keepalive: true });
  window.removeEventListener('pagehide', onPageHide);
  window.removeEventListener('beforeunload', onPageHide);
  playerNav.disable();
  if (overlayTimer) clearTimeout(overlayTimer);
  if (statePollTimer) clearInterval(statePollTimer);
  if (rmp) {
    try { rmp.stop?.(); } catch {}
    try { rmp.destroy?.(); } catch {}
  }
  rmp = null;
});

// Back (await tokened request before navigating)
const goBack = async () => {
  stopProgressHeartbeat();
  await sendStopWatching({ reason: 'nav', keepalive: false }); // uses getApiData with Authorization
  router.back();
};
</script>

<style scoped>
/* Full-screen canvas */
.movie-player-view {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  z-index: 9999;
}

/* Header overlay */
.player-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  padding: 16px 24px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%);
  pointer-events: none;
}
.header-content { display: flex; align-items: center; gap: 16px; }
.back-button { pointer-events: auto; }
.movie-title {
  color: #fff; font-size: 1.5rem; font-weight: 500;
  text-shadow: 1px 1px 3px rgba(0,0,0,.8); margin: 0;
}

/* The 16:9 viewport. Position is driven by :style so we can switch centering per device */
.viewport {
  position: absolute;
  overflow: hidden;
  border-radius: 0;
  box-shadow: none;
}

/* Force the Radiant root element to fill the viewport even if it sets 640x360 inline */
#movie-rmp { width: 100% !important; height: 100% !important; }

/* Loader / error */
.player-loader, .player-error { color: #fff; }

/* ── Player TV overlay controls ─────────────────────── */
.player-tv-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 24px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s ease;
  z-index: 20;
}
.player-tv-overlay--visible { opacity: 1; pointer-events: auto; }

.player-tv-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.player-tv-control {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}
.player-tv-control:hover {
  background: rgba(39, 170, 225, 0.4);
  border-color: #27AAE1;
  transform: scale(1.1);
}
.player-tv-control--main {
  width: 68px;
  height: 68px;
  border-width: 3px;
  border-color: rgba(255, 255, 255, 0.6);
  background: rgba(39, 170, 225, 0.25);
}
.player-tv-control--main:hover { background: rgba(39, 170, 225, 0.6); }

.player-tv-control.tv-focused {
  background: rgba(39, 170, 225, 0.6) !important;
  border-color: #27AAE1 !important;
  transform: scale(1.15) !important;
  box-shadow: 0 0 20px rgba(39, 170, 225, 0.7) !important;
  outline: none !important;
}
</style>
