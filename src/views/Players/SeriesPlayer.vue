<!-- /src/views/Players/SeriesPlayer.vue -->
<template>
  <div class="movie-player-view">
    <!-- Header -->
    <div class="player-header" ref="headerRef">
      <div class="header-content">
        <v-btn icon variant="plain" class="back-button" @click="goBack">
          <v-icon size="x-large">mdi-arrow-left</v-icon>
        </v-btn>
        <h1 class="movie-title">
          {{ seriesTitle }}
          <template v-if="selectedEpisode?.caption"> — {{ selectedEpisode.caption }}</template>
        </h1>
      </div>
    </div>

    <!-- Loader -->
    <div v-if="loading" class="player-loader">
      <v-progress-circular indeterminate size="64" />
    </div>

    <!-- Player viewport (16:9 box) -->
    <div v-else-if="selectedEpisode" class="viewport" :style="viewportStyle">
      <div id="movie-rmp"></div>
    </div>

    <!-- Error -->
    <div v-else class="player-error">
      <p>Sorry, this episode could not be loaded.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
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

const seriesId = ref(route.params.seriesId || route.params.id);
const episodeId = ref(route.params.episodeId || route.query.episode);
const loading = ref(true);

watch(() => route.fullPath, () => {
  seriesId.value = route.params.seriesId || route.params.id;
  episodeId.value = route.params.episodeId || route.query.episode;
});

/* ---------- Entry guard: must come from SeriesDetails ---------- */
function cameFromDetailsGuard() {
  const fromState = (window.history?.state?.from) === 'SeriesDetails';
  const sessionFlag = sessionStorage.getItem(`cameFromDetails:series:${seriesId.value}`) === '1';
  return fromState || sessionFlag;
}

/* ---------- Header + viewport measurements ---------- */
const headerRef = ref(null);
const vpWidth = ref(window.innerWidth);
const vpHeight = ref(window.innerHeight);

function measureHeader() {} // reserved
function onResize() {
  vpWidth.value = window.innerWidth;
  vpHeight.value = window.innerHeight;
  measureHeader();
}

onMounted(() => {
  measureHeader();
  window.addEventListener('resize', onResize, { passive: true });
});
onBeforeUnmount(() => { window.removeEventListener('resize', onResize); });

/* Handheld detection */
const isHandheld = computed(() => {
  const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  return touch || vpWidth.value <= 1280;
});

/* 16:9 numeric box */
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
  const style = { width: `${box.value.w}px`, height: `${box.value.h}px`, left: '50%' };
  if (isHandheld.value) { style.top = '50%'; style.transform = 'translate(-50%, -50%)'; }
  else { style.top = '0'; style.transform = 'translateX(-50%)'; }
  return style;
});

/* ---------- Pull SeriesDetails from store & find episode ---------- */
const seriesDetail = computed(() =>
  svodStore.SVODSeries?.[seriesId.value]
  || svodStore.SVOD?.[seriesId.value]
  || svodStore.series?.[seriesId.value]
  || null
);

const seriesTitle = computed(() =>
  seriesDetail.value?.series?.name_short
  || seriesDetail.value?.name_short
  || ''
);

function flattenEpisodes(detail) {
  const seasons = detail?.series?.seasons || detail?.seasons || [];
  const all = [];
  for (const s of seasons) for (const e of (s.episodes || [])) all.push({ ...e, __season: s });
  return all;
}

const selectedEpisode = computed(() => {
  // Optional override via ?url=
  const direct = Array.isArray(route.query.url) ? route.query.url[0] : route.query.url;
  if (direct) return { vod_ott_url: String(direct), caption: route.query.caption || 'Episode' };

  const detail = seriesDetail.value;
  if (!detail) return null;
  const eid = Number(episodeId.value);
  if (!Number.isFinite(eid)) return null;
  return flattenEpisodes(detail).find(e => Number(e.id) === eid) || null;
});

const streamingUrl = computed(() => selectedEpisode.value?.vod_ott_url || '');

/* ---------- Radiant single-init and sizing ---------- */
let rmp = null;
let lastSrcKey = '';
const RMP_SCRIPT_URL = './radiantmediaplayer/rmp.min.js';
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

/* ---------- Mux ---------- */
const muxDataSettings = computed(() => {
  const account = seriesDetail.value?.account || {};
  return {
    debug: true,
    data: {
      env_key: MUX_ENV_KEY,
      viewer_user_id: account.customer_id || getUUID(),
      video_title: `vod_series~${seriesId.value}~${episodeId.value}`,
      player_name: SITE_TITLE,
      custom_1: new URLSearchParams({
        app_id: APPLICATION_ID,
        content_provider_id: seriesDetail.value?.content_provider_id || '',
        content_type: 'vod_series',
        content_id: String(episodeId.value),
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
    seriesDetail.value?.backdrop ||
    seriesDetail.value?.wide ||
    seriesDetail.value?.image ||
    '';
  return {
    licenseKey: RADIANTMEDIAPLAYER_LICENCE_KEY,
    pathToRmpFiles: './radiantmediaplayer/',
    skin: 's2',
    autoplay: true,
    autoHeightMode: false,
    width: widthPx,
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
  el.style.setProperty('width', `${box.value.w}px`, 'important');
  el.style.setProperty('height', `${box.value.h}px`, 'important');
  try {
    if (typeof rmp?.resize === 'function') rmp.resize(box.value.w, box.value.h);
    else if (typeof rmp?.setSize === 'function') rmp.setSize(box.value.w, box.value.h);
  } catch {}
}

/* ---------- Start-at (ms) ---------- */
// Prefer ?start_ms (milliseconds). Fallback to legacy ?start (seconds).
const startQueryMs = computed(() => {
  const rawMs = Array.isArray(route.query.start_ms) ? route.query.start_ms[0] : route.query.start_ms;
  const rawStartSec = Array.isArray(route.query.start) ? route.query.start[0] : route.query.start;
  let ms = Number(rawMs);
  if (!(Number.isFinite(ms) && ms > 0)) {
    const s = Number(rawStartSec);
    ms = Number.isFinite(s) && s > 0 ? s * 1000 : 0;
  }
  return Math.max(0, Math.floor(ms || 0));
});

function msToSecFloor(ms) { return Math.max(0, Math.floor((Number(ms) || 0) / 1000)); }
function getDurationMsMaybe() {
  try { const d = Number(rmp?.getDuration?.() || 0); return d > 0 ? Math.floor(d * 1000) : 0; } catch { return 0; }
}

function tryApplyStartMs(ms) {
  const targetSec = msToSecFloor(ms);
  if (!targetSec) return;
  try {
    const durSec = Number(rmp?.getDuration?.() || 0);
    let t = targetSec;
    if (durSec > 0 && t >= durSec) t = Math.max(0, durSec - 1);
    if (typeof rmp?.seek === 'function') { rmp.seek(t); return; }
    if (typeof rmp?.setCurrentTime === 'function') { rmp.setCurrentTime(t); return; }
  } catch {}
  try {
    const v = document.querySelector('#movie-rmp video');
    if (!v) return;
    if (v.readyState >= 1) { v.currentTime = targetSec; }
    else {
      v.addEventListener('loadedmetadata', () => { try { v.currentTime = targetSec; } catch {} }, { once: true });
    }
  } catch {}
}

/* ---------- WATCHING API wiring (ms) ---------- */
const authToken = computed(() =>
  authStore?.token ||
  authStore?.account?.token ||
  authStore?.user?.token ||
  localStorage.getItem('authToken') ||
  ''
);

// We keep ms everywhere in this file
const playSent = ref(false);
const lastResumeMsSent = ref(0);
const resumeMs = ref(0);
const progressPingTimer = ref(null);
const stopDebounceTimer = ref(null);

const RESUME_KEY = computed(() => `resume:series:${seriesId.value}:ep:${episodeId.value}`);

function saveLocalResumeMs(ms) {
  try { localStorage.setItem(RESUME_KEY.value, String(Math.max(0, Math.floor(ms || 0)))); } catch {}
}

function readCurrentMillis() {
  let sec = 0;
  try { if (typeof rmp?.getCurrentTime === 'function') sec = Number(rmp.getCurrentTime() || 0); } catch {}
  if (!sec) {
    try {
      const v = document.querySelector('#movie-rmp video');
      if (v) sec = Number(v.currentTime || 0);
    } catch {}
  }
  // return milliseconds
  return Math.max(0, Math.floor(sec * 1000));
}

async function sendPlayWatching() {
  if (playSent.value) return;
  await watchVideoPlay({
    token: authToken.value,
    vodId: episodeId.value // episode id for series
  });
  playSent.value = true;
}

async function sendStopWatching({ reason = 'progress', keepalive = false } = {}) {
  const currentMs = readCurrentMillis();

  // throttle tiny changes for heartbeat (3s)
  if (reason === 'progress' && Math.abs(currentMs - lastResumeMsSent.value) < 3000) return;

  await watchVideoStop({
    token: authToken.value,
    vodId: episodeId.value,                 // episode id here
    resume_ms: currentMs,
    movie_duration_ms: getDurationMsMaybe(),// often absent for series; ok to send 0
    keepalive
  });

  lastResumeMsSent.value = currentMs;
  saveLocalResumeMs(currentMs);
}

function startProgressHeartbeat() {
  if (progressPingTimer.value) return;
  progressPingTimer.value = setInterval(() => {
    resumeMs.value = readCurrentMillis();
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
async function initOrSwap(src, startAtMs = startQueryMs.value) {
  if (!src) { console.warn('[SeriesPlayer] No streaming URL for this episode.'); return; }
  if (src === lastSrcKey && rmp) { applyBoxSize(); tryApplyStartMs(startAtMs); return; }

  await ensureRadiant().catch((e) => console.error('Failed to load Radiant script', e));
  if (!window.RadiantMP) { console.error('RadiantMP global not found'); return; }

  if (rmp) {
    try { rmp.stop?.(); } catch {}
    try { rmp.destroy?.(); } catch {}
    rmp = null;
  }

  const container = document.getElementById('movie-rmp');
  if (!container) return;

  rmp = new window.RadiantMP('movie-rmp');
  try { rmp.on?.('error', (e) => console.warn('RMP error', e)); } catch {}

  // Perform a single seek to start_ms
  let didInitialSeek = false;
  const doSeekOnce = () => {
    if (didInitialSeek) return;
    tryApplyStartMs(startAtMs);
    didInitialSeek = true;
  };

  // Attach BEFORE init so we don't miss early events
  try {
    if (typeof rmp.one === 'function') ['loadedmetadata', 'ready', 'playing'].forEach(evt => rmp.one(evt, doSeekOnce));
    else ['loadedmetadata', 'ready', 'playing'].forEach(evt => {
      const h = () => { doSeekOnce(); try { rmp.off?.(evt, h); } catch {} };
      rmp.on?.(evt, h);
    });
  } catch {}

  try { rmp.init(buildSettings(src, box.value.w, box.value.h)); } catch (e) { console.error('RMP init failed', e); }

  // quality nudge (optional)
  try {
    const nudge = () => {
      try { if (rmp && 'quality' in rmp) { rmp.quality = 0; setTimeout(() => { if (rmp) rmp.quality = -1; }, 3000); } } catch {}
    };
    if (typeof rmp.one === 'function') rmp.one('playing', nudge);
    else if (typeof rmp.on === 'function') {
      const onPlayOnce = () => { nudge(); try { rmp?.off?.('playing', onPlayOnce); } catch {} };
      rmp.on('playing', onPlayOnce);
    } else setTimeout(nudge, 1000);
  } catch {}

  // Watching hooks
  try {
    const onFirstPlaying = () => { sendPlayWatching(); startProgressHeartbeat(); };
    if (typeof rmp.one === 'function') rmp.one('playing', onFirstPlaying);
    else rmp.on?.('playing', onFirstPlaying);
  } catch {}
  try {
    const onTime = () => { resumeMs.value = readCurrentMillis(); saveLocalResumeMs(resumeMs.value); };
    rmp.on?.('timeupdate', onTime);
    rmp.on?.('time', onTime);
  } catch {}
  try { rmp.on?.('seeked', () => { resumeMs.value = readCurrentMillis(); queueStop('seeked'); }); } catch {}
  try { rmp.on?.('pause', () => queueStop('pause')); } catch {}
  try {
    rmp.on?.('ended', () => {
      resumeMs.value = getDurationMsMaybe() || readCurrentMillis();
      sendStopWatching({ reason: 'ended' });
    });
  } catch {}

  lastSrcKey = src;
  applyBoxSize();
}

/* ---------- Load ---------- */
async function loadSeries() {
  loading.value = true;
  if (typeof svodStore.setSVODSeriesById === 'function') {
    await svodStore.setSVODSeriesById({ vodId: seriesId.value });
  } else if (typeof svodStore.setSVODById === 'function') {
    await svodStore.setSVODById({ vodId: seriesId.value });
  }
  loading.value = false;
  initOrSwap(streamingUrl.value, startQueryMs.value);
}

onMounted(async () => {
  if (!cameFromDetailsGuard()) {
    router.replace({ name: 'SeriesDetails', params: { id: seriesId.value } });
    return;
  }
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('beforeunload', onPageHide);
  await loadSeries();
});

// React to query changes (ms preferred)
watch(() => route.query.start_ms, (v) => {
  const raw = Array.isArray(v) ? v[0] : v;
  const ms = Number(raw);
  if (rmp && Number.isFinite(ms) && ms > 0) tryApplyStartMs(ms);
});

// Legacy fallback: ?start=seconds
watch(() => route.query.start, (v) => {
  const s = Number(v);
  if (rmp && Number.isFinite(s) && s > 0) tryApplyStartMs(s * 1000);
});

watch(() => route.params.seriesId, async (newSid) => {
  if (newSid && newSid !== seriesId.value) {
    try { await sendStopWatching({ reason: 'switch', keepalive: true }); } catch {}
    seriesId.value = newSid;
    playSent.value = false;
    lastResumeMsSent.value = 0;
    await loadSeries();
  }
});

watch(() => route.params.episodeId, async (newEid) => {
  if (newEid && newEid !== episodeId.value) {
    try { await sendStopWatching({ reason: 'switch', keepalive: true }); } catch {}
    episodeId.value = newEid;
    playSent.value = false;
    lastResumeMsSent.value = 0;
    initOrSwap(streamingUrl.value, startQueryMs.value);
  }
});

watch(streamingUrl, (newUrl) => {
  if (!loading.value) initOrSwap(newUrl, startQueryMs.value);
});

watch([box, isHandheld], () => applyBoxSize());

function onPageHide() { sendStopWatching({ reason: 'pagehide', keepalive: true }); }

onBeforeUnmount(() => {
  stopProgressHeartbeat();
  sendStopWatching({ reason: 'unmount', keepalive: true });
  window.removeEventListener('pagehide', onPageHide);
  window.removeEventListener('beforeunload', onPageHide);
  if (rmp) { try { rmp.stop?.(); } catch {} try { rmp.destroy?.(); } catch {} }
  rmp = null;
});

// Back
const goBack = async () => {
  stopProgressHeartbeat();
  try {
    await sendStopWatching({ reason: 'nav', keepalive: false });
  } catch (e) {
    console.warn('watch stop failed on nav:', e);
  } finally {
    router.back();
  }
};
</script>


<style scoped>
.movie-player-view {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  z-index: 9999;
}

.player-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  padding: 16px 24px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%);
  pointer-events: none;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-button {
  pointer-events: auto;
}

.movie-title {
  color: #fff;
  font-size: 1.5rem;
  font-weight: 500;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, .8);
  margin: 0;
}

.viewport {
  position: absolute;
  overflow: hidden;
  border-radius: 0;
  box-shadow: none;
}

#movie-rmp {
  width: 100% !important;
  height: 100% !important;
}

.player-loader,
.player-error {
  color: #fff;
}
</style>
