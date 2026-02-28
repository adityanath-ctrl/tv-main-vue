<!-- /src/components/MediaPlayer.vue -->
<template>
  <v-container fluid class="full-bleed" :class="{ 'is-fullscreen': fullscreenMode }">
    <v-row class="no-gutters player-row" align="stretch">
      <v-col cols="12" :md="noInfoColumn ? 12 : 8" class="player-column pa-0">
        <!-- Poster-only shell (also used when showing inline access overlay) -->
        <div
          v-if="shouldPosterOnly || showAccessMessage"
          class="poster-shell"
          :class="{ 'fill-viewport': fullscreenMode }"
          ref="posterShellRef"
          :style="rmpViewportStyle"
        >
          <v-img :src="posterUrlComputed" cover class="poster-img" @load="syncPanelHeight" />
          <!-- Inline access overlay (e.g., needsCode) -->
          <div v-if="showAccessMessage" class="access-overlay">
            <p class="access-message">{{ accessMessage }}</p>
            <v-btn v-if="showGetAccessButton" outlined color="white" class="popup-btn" @click="triggerPremiumAccess">
              Get Access
            </v-btn>
          </div>

          <!-- Events: Pending overlay -->
          <div
            v-if="isEvent && (isPendingEvent || pendingFromError)"
            class="pending-overlay"
          >
            <div class="pending-text">
              This Livestream has not started yet.<br /><br />
              <span class="pending-date">It is scheduled to start at <br /> {{ formattedEventDate }}</span>
            </div>
          </div>
        </div>

        <!-- Real player only when there is a playable URL and no blocking overlay -->
        <div
          v-else
          :key="playerKey"
          id="rmp-container"
          ref="rmpContainer"
          :class="{ 'fill-viewport': fullscreenMode }"
          :style="rmpViewportStyle"
        >
        </div>
      </v-col>

      <v-col v-if="showInfoColumn" cols="12" md="4" class="info-column pa-0">
        <div class="info-card d-flex flex-column" :style="infoCardStyle" ref="infoPanelRef">
          <div v-if="!hideTabs && visibleTabs.length" class="custom-tabs px-2 py-2 d-flex justify-start ga-2">
            <v-btn
              v-for="tab in visibleTabs"
              :key="tab.id"
              :color="activeTab === tab.id ? HIGHLIGHT_COLOR_1 : '#363636'"
              class="tab-button"
              stacked
              variant="flat"
              @click="activeTab = tab.id"
            >
              <v-icon :icon="tab.icon"></v-icon>
              {{ tab.title }}
            </v-btn>
          </div>

          <v-window v-model="activeTab" class="flex-grow-1 pane-window">
            <!-- ABOUT -->
            <v-window-item value="about" class="pa-4">
              <!-- Sports About (iframe sub-tabs) -->
              <div v-if="isSports && contentData" class="sports-about">
                <div class="subtabs mb-3">
                  <v-slide-group v-model="activeSportsSubTab" show-arrows>
                    <v-slide-group-item v-for="s in sportsSubTabs" :key="s.id" :value="s.id">
                      <v-btn class="mx-1" size="small" :color="activeSportsSubTab === s.id ? HIGHLIGHT_COLOR_1 : '#363636'" @click="onChangeSportsSubTab(s.id)">
                        {{ s.title }}
                      </v-btn>
                    </v-slide-group-item>
                  </v-slide-group>
                </div>

                <div class="widget-wrap">
                  <div v-if="iframeLoading" class="main-fader">
                    <div class="loader">
                      <svg viewBox="0 0 866 866" xmlns="http://www.w3.org/2000/svg">
                        <svg viewBox="0 0 164.83 151.5">
                          <path class="path-0" d="M117.24,69.24A8,8,0,0,0,115.67,67c-4.88-4-9.8-7.89-14.86-11.62A4.93,4.93,0,0,0,96.93,55c-5.76,1.89-11.4,4.17-17.18,6a4.36,4.36,0,0,0-3.42,4.12c-1,6.89-2.1,13.76-3,20.66a4,4,0,0,0,1,3.07c5.12,4.36,10.39,8.61,15.68,12.76a3.62,3.62,0,0,0,2.92.75c6.29-2.66,12.52-5.47,18.71-8.36a3.49,3.49,0,0,0,1.68-2.19c1.34-7.25,2.54-14.55,3.9-22.58Z" fill="#FAD701" />
                          <path class="path-1" d="M97.55,38.68A43.76,43.76,0,0,1,98,33.44c.41-2.36-.5-3.57-2.57-4.64C91.1,26.59,87,24,82.66,21.82a6.18,6.18,0,0,0-4-.71C73.45,22.55,68.32,24.25,63.22,26c-3.63,1.21-6.08,3.35-5.76,7.69a26.67,26.67,0,0,1-.6,4.92c-1.08,8.06-1.08,8.08,5.86,11.92,3.95,2.19,7.82,5.75,11.94,6.08s8.76-2.41,13.12-3.93c9.33-3.29,9.33-3.3,9.78-14Z" fill="#FAD701" />
                          <path class="path-2" d="M66.11,126.56c5.91-.91,11.37-1.7,16.81-2.71a3.3,3.3,0,0,0,1.87-2.17c1-4.06,1.73-8.19,2.84-12.24.54-2-.11-3-1.55-4.15-5-4-9.9-8.12-15-12a6.19,6.19,0,0,0-4.15-1.1c-5.35.66-10.7,1.54-16,2.54A4,4,0,0,0,48.34,97a109.13,109.13,0,0,0-3,12.19,4.47,4.47,0,0,0,1.34,3.6c5.54,4.36,11.23,8.53,16.91,12.69a10.84,10.84,0,0,0,2.57,1.11Z" fill="#FAD701" />
                          <path class="path-3" d="M127.42,104.12c4.1-2.1,8-3.93,11.72-6a6,6,0,0,0,2.27-3,58.22,58.22,0,0,0,3.18-29.92c-.26-1.7-8-7.28-9.71-6.85A5,5,0,0,0,133,59.65c-2.81,2.49-5.71,4.88-8.33,7.56a9.46,9.46,0,0,0-2.47,4.4c-1.29,6.49-2.38,13-3.35,19.55a5.73,5.73,0,0,0,.83,3.91c2.31,3.08,5,5.88,7.7,9Z" fill="#FAD701" />
                          <path class="path-4" d="M52.58,29.89c-2.15-.36-3.78-.54-5.39-.9-2.83-.64-4.92.1-7,2.32A64.1,64.1,0,0,0,26.09,54.64c-2.64,7.92-2.62,7.84,5.15,10.87,1.76.69,2.73.45,3.93-1C39.79,59,44.54,53.65,49.22,48.2a4.2,4.2,0,0,0,1.13-2c.8-5.32,1.49-10.68,2.24-16.34Z" fill="#FAD701" />
                          <path class="path-5" d="M23,68.13c0,2.51,0,4.7,0,6.87a60.49,60.49,0,0,0,9.75,32.15c1.37,2.13,6.4,3,7,1.2,1.55-5,2.68-10.2,3.82-15.34.13-.58-.58-1.38-.94-2.06-2.51-4.77-5.47-9.38-7.45-14.37C32.94,71,28.22,69.84,23,68.13Z" fill="#FAD701" />
                          <path class="path-6" d="M83.91,12.86c-.32.36-.66.71-1,1.07.9,1.13,1.57,2.62,2.73,3.33,4.71,2.84,9.56,5.48,14.39,8.1a9.29,9.29,0,0,0,3.13.83c5.45.69,10.89,1.38,16.35,1.94a10.41,10.41,0,0,0,3.07-.71c-11.48-9.9-24.26-14.61-38.71-14.56Z" fill="#FAD701" />
                          <path class="path-7" d="M66.28,132.51c13.36,3.78,25.62,3.5,38-.9C91.68,129.59,79.36,128,66.28,132.51Z" fill="#FAD701" />
                          <path class="path-8" d="M127.2,30.66l-1.27.37a18.58,18.58,0,0,0,1,3.08c3,5.52,6.21,10.89,8.89,16.54,1.34,2.83,3.41,3.82,6.49,4.9a60.38,60.38,0,0,0-15.12-24.9Z" fill="#FAD701" />
                          <path class="bb-9" d="M117.35,125c5.58-2.32,16.9-13.84,18.1-19.2-2.41,1.46-5.18,2.36-6.78,4.23-4.21,5-7.89,10.37-11.32,15Z" fill="#FAD701" />
                        </svg>
                      </svg>
                    </div>
                  </div>
                  <iframe class="widget-frame" :src="sportsWidgetUrl" frameborder="0" allowfullscreen @load="iframeLoading = false"></iframe>
                </div>
              </div>

              <!-- Events About -->
              <div v-else-if="isEvent && contentData">
                <div class="about-event">
                  <v-img :src="contentData.live_event_image || contentData.live_event_image_wide" class="about-poster" cover />
                  <div class="about-meta">
                    <h2 class="about-title">
                      {{ contentData.live_event_name_short || contentData.live_event_name_long }}
                    </h2>
                    <div class="about-date">
                      {{ formattedEventDate }}
                    </div>
                  </div>
                  <div v-if="contentData?.live_event_description" class="about-desc">
                    {{ contentData.live_event_description }}
                  </div>
                </div>
              </div>

              <!-- Live TV / default About -->
              <div v-else>
                <div v-if="contentData" class="d-flex mb-4">
                  <v-avatar rounded="lg" size="64" class="mr-4 flex-shrink-0">
                    <v-img :src="contentData.icon_url" />
                  </v-avatar>
                  <div>
                    <h2 class="text-subtitle-1 font-weight-bold">
                      {{ contentData.caption_short || contentData.name_short || contentData.title }}
                    </h2>
                    <div class="d-flex align-center mt-1">
                      <v-chip v-if="isLive" color="red" size="small" label>LIVE</v-chip>
                    </div>
                  </div>
                </div>

                <div v-if="!showAccessMessage">
                  <div v-if="nowNextLoading" class="text-center my-4">
                    <v-progress-circular indeterminate size="24" />
                  </div>

                  <div v-else>
                    <div class="epg-header mb-3">
                      <span class="epg-title">
                        {{ showNextProgram ? 'Now & Next' : 'Now Showing' }}
                      </span>
                    </div>

                    <div v-if="currentProgram" class="prog-row mb-3">
                      <div class="thumb-wrap">
                        <v-img :src="currentProgram.icon_poster" class="thumb" cover />
                      </div>
                      <div class="prog-body">
                        <div class="prog-title text-truncate">{{ currentProgram.progName }}</div>
                        <div class="prog-desc">
                          {{ currentProgram.progDesc }}
                        </div>
                        <div class="prog-time">
                          {{ formatTime(currentProgram.progStart_ms) }} – {{ formatTime(currentProgram.progStop_ms) }}
                        </div>
                        <v-progress-linear :model-value="currentProgramProgress" :color="HIGHLIGHT_COLOR_2" height="4" class="mt-2" />
                      </div>
                    </div>

                    <div v-if="showNextProgram && nextProgram" class="prog-row">
                      <div class="thumb-wrap">
                        <v-img :src="nextProgram.icon_poster" class="thumb" cover />
                      </div>
                      <div class="prog-body">
                        <div class="prog-title text-truncate">{{ nextProgram.progName }}</div>
                        <div class="prog-desc">
                          {{ truncate(nextProgram.progDesc, 120) }}
                        </div>
                        <div class="prog-time">
                          {{ formatTime(nextProgram.progStart_ms) }} – {{ formatTime(nextProgram.progStop_ms) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </v-window-item>

            <!-- STREAMS (Events only) -->
            <v-window-item value="streams" class="pa-4">
              <template v-if="isEvent && streamGroups.length">
                <div class="subtabs mb-3">
                  <v-slide-group v-model="activeStreamGroup" show-arrows>
                    <v-slide-group-item v-for="(g, idx) in streamGroups" :key="g.id ?? idx" :value="idx">
                      <v-btn class="mx-1" size="small" :color="idx === activeStreamGroup ? HIGHLIGHT_COLOR_1 : '#363636'">
                        {{ g.title }}
                      </v-btn>
                    </v-slide-group-item>
                  </v-slide-group>
                </div>

                <div class="list-rows">
                  <div
                    v-for="ev in (streamGroups[activeStreamGroup]?.items || [])"
                    :key="ev.live_event_id"
                    class="list-row focusable-item"
                    tabindex="0"
                    :class="{ 'is-active': isSelected(ev) }"
                    @click="emitSelectEvent(ev)"
                  >
                    <div class="row-thumb">
                      <v-img :src="ev.live_event_image || ev.live_event_image_wide" cover />
                    </div>
                    <div class="row-body">
                      <div class="row-title text-truncate">{{ ev.live_event_name_short || ev.live_event_name_long }}</div>
                      <div class="row-sub row-sub--desc">
                        {{ ev.live_event_description || ' ' }}
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <div v-else class="text-center py-8 opacity-70">No streams available.</div>
            </v-window-item>

            <!-- VIDEOS (Events only) -->
            <v-window-item value="videos" class="pa-4">
              <template v-if="isEvent && videoGroups.length">
                <div class="subtabs mb-3">
                  <v-slide-group v-model="activeVideoGroup" show-arrows>
                    <v-slide-group-item v-for="(g, idx) in videoGroups" :key="g.id ?? idx" :value="idx">
                      <v-btn class="mx-1" size="small" :color="idx === activeVideoGroup ? HIGHLIGHT_COLOR_1 : '#363636'">
                        {{ g.title }}
                      </v-btn>
                    </v-slide-group-item>
                  </v-slide-group>
                </div>

                <div class="list-rows">
                  <div
                    v-for="ev in (videoGroups[activeVideoGroup]?.items || [])"
                    :key="ev.live_event_id"
                    class="list-row focusable-item"
                    tabindex="0"
                    :class="{ 'is-active': isSelected(ev) }"
                    @click="emitSelectEvent(ev)"
                  >
                    <div class="row-thumb">
                      <v-img :src="ev.live_event_image || ev.live_event_image_wide" cover />
                    </div>
                    <div class="row-body">
                      <div class="row-title text-truncate">{{ ev.live_event_name_short || ev.live_event_name_long }}</div>
                      <div class="row-sub row-sub--desc">
                        {{ ev.live_event_description || ' ' }}
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <div v-else class="text-center py-8 opacity-70">No videos available.</div>
            </v-window-item>
          </v-window>
        </div>
      </v-col>
    </v-row>

    <ButtonFlowTemplate
      v-if="buttonFlowTemplatePopupRef"
      :closePopup="closePopup"
      :dialog="buttonFlowTemplatePopupRef"
      :popupContentType="popupContentType"
      zIndex="10001"
    >
      <template #sign-in-required>
        <v-card-title class="d-flex justify-center">
          <h1 class="popupHeading">Log In Required</h1>
        </v-card-title>
        <v-card-text class="popupSubHeading">{{ popupMessage }}</v-card-text>
        <v-card-actions class="d-flex justify-center align-center">
          <v-btn outlined color="white" class="popup-btn" @click="closePopup">Cancel</v-btn>
          <v-btn outlined color="white" class="popup-btn" @click="handleSignIn">Login</v-btn>
        </v-card-actions>
      </template>

      <template #premium-access-required>
        <v-card-title class="d-flex justify-center">
          <h1 class="popupHeading">Premium Content Access</h1>
        </v-card-title>
        <v-card-text class="d-flex justify-center popupSubHeading">
          This content is available as part of our premium package.<br /><br />
          To access it, please click the "Continue" button and enter your access code or top-up code to unlock the content.
        </v-card-text>
        <v-card-actions class="d-flex justify-center align-center">
          <v-btn outlined color="white" class="popup-btn" @click="closePopup">Cancel</v-btn>
          <v-btn outlined color="white" class="popup-btn" @click="handleContinueToEnterCode">Continue</v-btn>
        </v-card-actions>
      </template>
    </ButtonFlowTemplate>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, defineExpose, nextTick } from 'vue';
import { useDisplay } from 'vuetify';
import {
  HIGHLIGHT_COLOR_1,
  HIGHLIGHT_COLOR_2,
  BACKGROUND_COLOR_2,
  RADIANTMEDIAPLAYER_LICENCE_KEY,
  MUX_ENV_KEY,
  APPLICATION_ID,
  SITE_TITLE,
  FOOTBALL_WIDGETS_URL
} from '@/mainConfig';
import useAuthStore from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import ButtonFlowTemplate from '@/components/popups/btnFlowTemplate.vue';
import { getUUID } from '@/utils/siberAPI';
import StreamNotStarted from '@/assets/img/app-stream-not-started.jpg';

const emit = defineEmits(['selectEvent']);

const props = defineProps({
  contentData: { type: Object, required: true },
  // Supported types (movies removed): 'live_tv' | 'events' | 'sports'
  contentType: { type: String, required: true },
  contentId: { type: [String, Number], default: null },

  nowNextPrograms: { type: Array, default: () => [] },
  nowNextLoading: { type: Boolean, default: false },

  streamGroups: { type: Array, default: () => [] },
  videoGroups: { type: Array, default: () => [] },
  eventItems: { type: Array, default: () => [] },

  showNextProgram: { type: Boolean, default: true },
  hideInfoWhenStacked: { type: Boolean, default: false },
  hideTabs: { type: Boolean, default: false },
  infoMinWidth: { type: Number, default: 960 },

  playerSkin: { type: String, default: 's1' },
  fullscreenMode: { type: Boolean, default: false },
  noInfoColumn: { type: Boolean, default: false },
  deferAccessCheck: { type: Boolean, default: false },
  useResponsiveSizing: { type: Boolean, default: false },
  fullscreenOffsetPx: { type: Number, default: 0 },
});

const { width } = useDisplay();
const authStore = useAuthStore();
const uiStore = useUIStore();

let rmpInstance = null;
const rmpContainer = ref(null);
const infoPanelRef = ref(null);

// Height management (locked so info card won't expand when player grows)
const infoPanelLockedHeight = ref(0);
const infoPanelMax = ref(0);

const playerKey = ref(0);

const isEvent = computed(() => props.contentType === 'events');
const isSports = computed(() => props.contentType === 'sports');

const activeTab = ref('about');
const currentTime = ref(Date.now());
let timeInterval = null;

const buttonFlowTemplatePopupRef = ref(false);
const popupContentType = ref('');
const popupMessage = ref('');

const showAccessMessage = ref(false);
const accessMessage = ref('');
const showGetAccessButton = ref(false);

const activeStreamGroup = ref(0);
const activeVideoGroup = ref(0);
const lastSrcKey = ref('');

/* Sports sub-tabs */
const sportsSubTabs = [
  { id: 'details', title: 'Details' },
  { id: 'summary', title: 'Summary' },
  { id: 'lineups', title: 'Line-Ups' },
  { id: 'stats', title: 'Stats' },
  { id: 'table', title: 'Table' },
];
const activeSportsSubTab = ref('details');
const iframeLoading = ref(true);
const cacheBust = ref(0);
const posterShellRef = ref(null);

function onChangeSportsSubTab(id) {
  if (activeSportsSubTab.value !== id) {
    iframeLoading.value = true;
    activeSportsSubTab.value = id;
  } else {
    iframeLoading.value = true;
    cacheBust.value = Date.now();
  }
}
watch(() => activeSportsSubTab.value, () => { iframeLoading.value = true; });

const showInfoColumn = computed(() => {
  if (props.noInfoColumn) return false;
  if (!props.hideInfoWhenStacked) return true;
  return (width?.value ?? 0) >= props.infoMinWidth;
});

const isLive = computed(() => props.contentType === 'live_tv');

const nowNext = computed(() => Array.isArray(props.nowNextPrograms) ? props.nowNextPrograms : []);
const currentProgram = computed(() => nowNext.value?.[0] || null);
const nextProgram = computed(() => nowNext.value?.[1] || null);
const currentProgramProgress = computed(() => {
  if (!currentProgram.value) return 0;
  const start = currentProgram.value.progStart_ms;
  const end = currentProgram.value.progStop_ms;
  const progress = ((currentTime.value - start) / (end - start)) * 100;
  return Math.max(0, Math.min(progress, 100));
});

/* Auto-grouping for Events */
const STATUS_STREAM = new Set(['live', 'is_live', 'upcoming', 'scheduled', 'starting_soon', 'waiting']);
const STATUS_VIDEO = new Set(['recently_uploaded', 'uploaded', 'published', 'archive', 'archived', 'replay', 'vod', 'available']);
const norm = (s) => String(s || '').toLowerCase();

const rawEventItems = computed(() => {
  if (Array.isArray(props.eventItems) && props.eventItems.length) return props.eventItems;
  const c = props.contentData || {};
  const candidates = [c.events, c.items, c.related_events, c.related, c.videos];
  return candidates.find(a => Array.isArray(a) && a.length) || [];
});

const toListItem = (ev) => ({
  live_event_id: ev.live_event_id ?? ev.id,
  live_event_image: ev.live_event_image ?? ev.image ?? ev.poster_url,
  live_event_image_wide: ev.live_event_image_wide ?? ev.image_wide ?? ev.backdrop_url,
  live_event_name_short: ev.live_event_name_short ?? ev.caption_short ?? ev.title ?? ev.name,
  live_event_name_long: ev.live_event_name_long ?? ev.caption_long ?? ev.title ?? ev.name,
  live_event_description: ev.live_event_description ?? ev.description ?? ev.synopsis ?? '',
  live_event_date: ev.live_event_date ?? ev.start_time ?? ev.start_date ?? ev.publish_date,
  live_event_url: ev.live_event_url ?? ev.streaming_url ?? ev.url,
  cdn_type: ev.cdn_type,
  timeshift_status: ev.timeshift_status,
});

const streamGroups = computed(() => {
  if (!isEvent.value) return [];
  if (Array.isArray(props.streamGroups) && props.streamGroups.length) return props.streamGroups;
  const streams = rawEventItems.value.filter(ev => STATUS_STREAM.has(norm(ev.live_event_playback_status)) || ev.is_live);
  return streams.length ? [{ id: 'auto-streams', title: 'Stream', items: streams.map(toListItem) }] : [];
});

const videoGroups = computed(() => {
  if (!isEvent.value) return [];
  if (Array.isArray(props.videoGroups) && props.videoGroups.length) return props.videoGroups;
  const videos = rawEventItems.value.filter(ev => STATUS_VIDEO.has(norm(ev.live_event_playback_status)) || ev.is_vod || ev.is_archive || ev.replay_status);
  return videos.length ? [{ id: 'auto-videos', title: 'Videos', items: videos.map(toListItem) }] : [];
});

const isSelected = (ev) => {
  const id = ev?.live_event_id ?? ev?.id ?? null;
  return id != null && id === effectiveContentId.value;
};

/* Tabs per content type (movies removed) */
const tabsForType = computed(() => {
  if (isEvent.value) {
    const base = [{ id: 'about', title: 'About', icon: 'mdi-information-outline' }];
    if (streamGroups.value?.length) base.push({ id: 'streams', title: 'Stream', icon: 'mdi-broadcast' });
    if (videoGroups.value?.length) base.push({ id: 'videos', title: 'Videos', icon: 'mdi-play-box-multiple-outline' });
    return base;
  }
  if (isSports.value) return [{ id: 'about', title: 'About', icon: 'mdi-information-outline' }];
  return [{ id: 'about', title: 'About', icon: 'mdi-information-outline' }];
});

const visibleTabs = computed(() => props.hideTabs ? [] : tabsForType.value);

const effectiveContentId = computed(() => {
  const c = props.contentData || {};
  return props.contentId ?? c.id ?? c.live_event_id ?? c.match_id ?? null;
});

const truncate = (s, n = 120) => (s ? (s.length > n ? s.slice(0, n - 1) + '…' : s) : '');
const formatTime = (timestampMs) => new Date(timestampMs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
const formatEventDate = (dtString) => {
  if (!dtString) return '';
  const d = new Date(dtString.replace(' ', 'T') + 'Z');
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'long' });
  const year = d.getFullYear();
  let timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  timeStr = timeStr.toLowerCase();
  return `${day} ${month} ${year} - ${timeStr}`;
};
const formattedEventDate = computed(() =>
  formatEventDate(props.contentData?.live_event_date || props.contentData?.datetime)
);

/* Sports widget URL */
const sportsWidgetUrl = computed(() => {
  if (!isSports.value || !props.contentData) return '';
  const leagueId = props.contentData.match_external_league_id || props.contentData.league_id || '';
  const matchId  = props.contentData.match_external_id || props.contentData.external_match_id || '';
  if (!leagueId || !matchId) return '';
  const section = activeSportsSubTab.value;
  const c1 = HIGHLIGHT_COLOR_1.substring(1);
  const c2 = HIGHLIGHT_COLOR_2.substring(1);
  const qs = new URLSearchParams({
    league_id: String(leagueId),
    match_id: String(matchId),
    section,
    high_color1: c1,
    high_color2: c2
  }).toString();
  const base = `${FOOTBALL_WIDGETS_URL}?${qs}`;
  return cacheBust.value ? `${base}&_=${cacheBust.value}` : base;
});

/* Access gating */
const userIsLoggedIn = computed(() => authStore.isUserLoggedIn);
const hasPackage     = computed(() => !!props.contentData?.package_status);
const needsCode      = computed(() => !!(props.contentData?.packages?.length && props.contentData.packages[0]?.package_code_status));
const loginRequired  = computed(() => {
  if (typeof props.contentData?.login_required === 'boolean') return props.contentData.login_required;
  return !!props.contentData?.login_required;
});
const accessInfoKnown = computed(() => {
  const c = props.contentData || {};
  return typeof c.package_status === 'boolean'
      || typeof c.login_required === 'boolean'
      || (Array.isArray(c.packages) && c.packages.length > 0);
});

const premiumLoginMessage = computed(() => {
  switch (props.contentType) {
    case 'live_tv': return 'Log in is required to access this premium channel.';
    case 'sports':  return 'Log in is required to access this premium sport match.';
    case 'events':  return 'Log in is required to access this premium stream.';
    default:        return 'Log in is required to access this premium content.';
  }
});

function setAccessState() {
  showAccessMessage.value = false;
  showGetAccessButton.value = false;
  accessMessage.value = '';
  buttonFlowTemplatePopupRef.value = false;
  popupMessage.value = '';
  popupContentType.value = '';

  if (!accessInfoKnown.value && props.deferAccessCheck) return;
  if (!accessInfoKnown.value && !hasPlayableSrc.value) return;

  if (!userIsLoggedIn.value) {
    if (loginRequired.value || !hasPackage.value) {
      popupMessage.value = loginRequired.value
        ? 'This content is free to watch but requires you to log in.'
        : premiumLoginMessage.value;
      popupContentType.value = 'sign-in-required';
      buttonFlowTemplatePopupRef.value = true;
    }
    return;
  }

  if (!hasPackage.value) {
    if (needsCode.value) {
      showAccessMessage.value = true;
      showGetAccessButton.value = true;
      accessMessage.value =
        'You currently do not have access to this premium content. Click the Get Access button below to unlock it.';
    } else {
      popupContentType.value = 'premium-access-required';
      buttonFlowTemplatePopupRef.value = true;
    }
  }
}

const triggerPremiumAccess = () => { popupContentType.value = 'premium-access-required'; buttonFlowTemplatePopupRef.value = true; };
const closePopup = () => { buttonFlowTemplatePopupRef.value = false; };
const handleSignIn = () => { closePopup(); authStore.loginUser(); };
const handleContinueToEnterCode = () => { closePopup(); uiStore.openEnterCodePopup(); };

/* Poster-only logic */
const lower = (s) => String(s || '').toLowerCase();

const hasPlayableSrc = computed(() => {
  const c = props.contentData || {};
  if (isEvent.value)  return !!(c.live_event_url || c.streaming_url);
  if (isSports.value) return !!(c.match_streaming_url || c.streaming_url);
  return !!c.streaming_url; // live_tv / default
});
const isPendingMatch = computed(() =>
  isSports.value && ['pending', 'scheduled', 'upcoming', 'waiting', 'not_started'].includes(lower(props.contentData?.match_status))
);

// Events: treat playback_status/state fields as "pending" markers
const isPendingEvent = computed(() => {
  if (!isEvent.value) return false;
  const c = props.contentData || {};
  const statusCandidates = [
    c.live_event_playback_status,
    c.live_event_status,
    c.status,
  ].map(lower);
  return statusCandidates.some(s =>
    ['pending', 'scheduled', 'upcoming', 'starting_soon', 'waiting', 'not_started'].includes(s)
  );
});

// If RMP throws a 204 during init, fall back to the poster overlay too
const pendingFromError = ref(false);

const shouldPosterOnly = computed(() =>
  !hasPlayableSrc.value || isPendingMatch.value || isPendingEvent.value || pendingFromError.value
);

const posterUrlComputed = computed(() => {
  const content = props.contentData || {};
  if (isEvent.value)  {
    if (isPendingEvent.value || pendingFromError.value) return StreamNotStarted;
    return content.live_event_image_wide || content.live_event_image || content.image_wide || content.poster_url;
  }
  if (isSports.value) return content.match_poster || content.image_wide || content.poster_url;
  return content.image_wide || content.poster_url;
});

/* DVR helpers */
const getStreamUrlForDvr = (url, dvrMinutes, cdnType) => {
  if (!url) return '';
  const dvrSeconds = dvrMinutes > 0 ? dvrMinutes * 60 : 7200;
  cdnType = (cdnType || '').toLowerCase();

  if (cdnType === 'flussonic' && url.includes('index.m3u8')) {
    return url.replace('index.m3u8', `rewind-${dvrSeconds}.m3u8`);
  }
  if (cdnType === 'wmspanel' && url.includes('playlist_dvr.m3u8')) {
    return url.replace('playlist_dvr.m3u8', `playlist_dvr_timeshift-0-${dvrSeconds}.m3u8`);
  }
  if (url.includes('playlist_dvr.m3u8')) {
    return url.replace('playlist_dvr.m3u8', `playlist_dvr_timeshift-0-${dvrSeconds}.m3u8`);
  }
  return url;
};

function getStreamUrlForPastProgram(url, cdnType, programStartSec, programDurationSec, secondsOffset = 0) {
  if (!url) return '';
  const lowerUrl = url.toLowerCase();
  const ext = lowerUrl.includes('.m3u8') ? '.m3u8' : '.mpd';
  const lowerCdn = (cdnType || '').toLowerCase();

  if (lowerCdn === 'flussonic' || /index\.(m3u8|mpd)/i.test(url)) {
    if (programStartSec > 0) {
      return url.replace(/index\.(m3u8|mpd)/i, `archive-${programStartSec}-${programDurationSec}${ext}`);
    }
    return url;
  }

  if (lowerCdn === 'wmspanel' || /playlist_dvr\.(m3u8|mpd)/i.test(url)) {
    const newName = `playlist_dvr_timeshift-${secondsOffset > 0 ? secondsOffset : 0}-${programDurationSec}${ext}`;
    const qIndex = url.indexOf('?');
    const base = qIndex !== -1 ? url.substring(0, qIndex) : url;
    const query = qIndex !== -1 ? url.substring(qIndex) : '';
    const replaced = base.replace(/playlist_dvr\.(m3u8|mpd)/i, newName);
    return replaced + query;
  }

  return url;
}

/* ---- Effective URL with unified DVR logic ---- */
const effectiveStreamingUrl = computed(() => {
  const c = props.contentData || {};
  const rawUrl =
    isEvent.value  ? (c.live_event_url || c.streaming_url) :
    isSports.value ? (c.match_streaming_url || c.streaming_url) :
                     c.streaming_url;

  // Unified: respect c.timeshift_status for all content
  const tsEnabled  = !!c.timeshift_status;
  const dvrMinutes = c.dvr_duration ?? c.match_dvr_duration ?? c.dvr_duration;
  const cdnType    = c.cdn_type;

  if (tsEnabled) return getStreamUrlForDvr(rawUrl, dvrMinutes, cdnType);
  return rawUrl || '';
});

/* Player settings */
const playerSettings = computed(() => {
  const content = props.contentData || {};
  const account = content.account || {};
  const streamingUrl = effectiveStreamingUrl.value;

  const contentIdForMux = String(effectiveContentId.value ?? '');
  const muxCustomData = new URLSearchParams({
    app_id: APPLICATION_ID,
    content_provider_id: content.content_provider_id || '',
    content_type: props.contentType,
    content_id: content.id,
    device_type: 'web',
    user_ip: account.client_ip || '',
    user_gender: account.user_gender || 'unknown',
    user_age: account.user_age || 'unknown',
  }).toString();

  const settings = {
    licenseKey: RADIANTMEDIAPLAYER_LICENCE_KEY,
    pathToRmpFiles: './radiantmediaplayer/',
    src: streamingUrl ? { hls: streamingUrl } : undefined,
    autoplay: true,
    skin: props.playerSkin || 's1',
    skinBackgroundColor: props.fullscreenMode ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,.70)',
    skinAccentColor: HIGHLIGHT_COLOR_1.substring(1),
    googleCast: true,
    airplay: true,
    pip: true,
    dvrUIThreshold: 300,
    quickRewind: 10,
    quickForward: 10,
    forceHlsJSOnAppleDevices: true,
    muxDataSettings: {
      debug: true,
      data: {
        env_key: MUX_ENV_KEY,
        viewer_user_id: account.customer_id || getUUID(),
        video_title: `${props.contentType}~${contentIdForMux}`,
        player_name: SITE_TITLE,
        custom_1: muxCustomData
      }
    }
  };

  if (props.useResponsiveSizing) {
    settings.autoHeightMode = false;
    settings.width = '100%';
    settings.height = '100%';
  } else {
    settings.autoHeightMode = true;
  }

  const posterUrl = posterUrlComputed.value;
  if (posterUrl) settings.contentMetadata = { poster: [posterUrl] };
  return settings;
});

async function rebuildPlayerWithSrc(srcObj) {
  const base = playerSettings.value || {};
  const targetSrc = srcObj ?? base.src;
  const newKey = (targetSrc && targetSrc.hls) ? targetSrc.hls : '';
  if (!newKey) return;

  // Prevent duplicate init on same URL
  if (rmpInstance && lastSrcKey.value === newKey) return;

  // Destroy old instance on URL change
  if (rmpInstance) {
    try { rmpInstance.stop?.(); } catch {}
    try { rmpInstance.destroy?.(); } catch {}
    rmpInstance = null;
  }

  playerKey.value += 1;
  await nextTick();

  if (typeof RadiantMP === 'undefined') {
    console.error('MediaPlayer: RadiantMP global object not found.');
    return;
  }
  if (!document.getElementById('rmp-container')) {
    console.error('MediaPlayer: #rmp-container not found after remount.');
    return;
  }

  rmpInstance = new RadiantMP('rmp-container');
  try { rmpInstance.on?.('error', () => {}); } catch {}

  const settings = { ...(playerSettings.value || {}), src: { hls: newKey } };
  try { rmpInstance.init(settings); } catch (initErr) { console.error('MediaPlayer: init failed', initErr); }

  // If the player surfaces a 204 (RMP “no content”), switch to poster overlay
  try {
    rmpInstance.on?.('error', () => {
      try {
        const data = typeof rmpInstance.getErrorData === 'function' ? rmpInstance.getErrorData() : null;
        if ((data?.code === 204 || data?.code === '204') && isEvent.value) {
          pendingFromError.value = true;
          // Tear down player so the template re-renders the poster-shell
          try { rmpInstance.stop?.(); } catch {}
          try { rmpInstance.destroy?.(); } catch {}
          rmpInstance = null;
          lastSrcKey.value = '';
        }
      } catch {}
    });
  } catch {}

  const resync = () => requestAnimationFrame(syncPanelHeight);

// hook common lifecycle events that change size
try {
  const onOnce = (evt) => {
    const h = () => { resync(); try { rmpInstance.off?.(evt, h); } catch {} };
    rmpInstance.on?.(evt, h);
  };
  ['ready', 'loadedmetadata', 'resize', 'playing'].forEach(onOnce);
} catch {}

// quick stabilization pass – capture the moment when 16:9 settles
let tries = 0;
const tick = () => {
  tries += 1;
  resync();
  if (tries < 12) setTimeout(tick, 120); // ~1.4s total
};
setTimeout(tick, 60);


  // Start low quality then auto
  const forceLowStartThenAuto = () => {
    try {
      if (!rmpInstance) return;
      if ('quality' in rmpInstance) {
        rmpInstance.quality = 0;
        setTimeout(() => { if (rmpInstance) rmpInstance.quality = -1; }, 4000);
      }
    } catch {}
  };
  try {
    if (typeof rmpInstance.one === 'function') {
      rmpInstance.one('playing', forceLowStartThenAuto);
    } else if (typeof rmpInstance.on === 'function') {
      const onFirstPlaying = () => {
        forceLowStartThenAuto();
        try { rmpInstance?.off?.('playing', onFirstPlaying); } catch {}
      };
      rmpInstance.on('playing', onFirstPlaying);
    } else {
      setTimeout(forceLowStartThenAuto, 1000);
    }
  } catch {}

  lastSrcKey.value = newKey;
}

/* Layout sync */
const { value: vw } = width;
const isStacked = computed(() => (vw ?? 0) < 960);
const infoStackedHeight = ref(0);

const infoCardStyle = computed(() => {
  const base = { backgroundColor: BACKGROUND_COLOR_2 };
  if (!showInfoColumn.value) return base;
  if (isStacked.value) {
    return { ...base, minHeight: infoStackedHeight.value + 'px', maxHeight: infoStackedHeight.value + 'px' };
  }
  const h = infoPanelLockedHeight.value || infoPanelMax.value;
  return { ...base, minHeight: h + 'px', maxHeight: h + 'px' };
});

// For fullscreen usage keep controls visible by subtracting a header offset
const rmpViewportStyle = computed(() => {
  if (!props.fullscreenMode) return {};
  const raw = Number(props.fullscreenOffsetPx || 0);
  const offset = Math.min(Math.max(raw, 0), 160);
  return {
    '--vp-offset': `${offset}px`,
    height: 'calc(100vh - var(--vp-offset))',
    width: 'calc((100vh - var(--vp-offset)) * 16 / 9)',
    maxWidth: '100vw',
    margin: '0 auto'
  };
});

function getPlayerPixelHeight() {
  try {
    if (rmpInstance && typeof rmpInstance.getPlayerSize === 'function') {
      const s = rmpInstance.getPlayerSize();
      if (s && s.height) return Math.round(s.height);
    }
  } catch {}
  const videoEl =
    (rmpContainer.value && rmpContainer.value.querySelector('video')) ||
    rmpContainer.value ||
    posterShellRef.value;
  return Math.round(videoEl?.getBoundingClientRect?.().height || 0);
}

function syncPanelHeight() {
  nextTick(() => {
    if (!showInfoColumn.value) return;

    const playerH = getPlayerPixelHeight();
    if (!playerH) return; // don’t lock on zero/unknown

    const target = Math.max(playerH, 340);

    // allow both grow and shrink (tiny hysteresis)
    const diff = target - infoPanelLockedHeight.value;
    if (infoPanelLockedHeight.value === 0 || Math.abs(diff) > 2) {
      infoPanelLockedHeight.value = target;
    }
    infoPanelMax.value = target;

    if (isStacked.value) {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const gap = 12;
      const stacked = Math.max(160, vh - playerH - gap);
      if (Math.abs(stacked - infoStackedHeight.value) > 2) {
        infoStackedHeight.value = stacked;
      }
    }
  });
}


watch(() => posterUrlComputed.value, () => { nextTick(syncPanelHeight); });
watch(() => sportsWidgetUrl.value, (val) => { iframeLoading.value = !!val; }, { immediate: true });

/* Emit helper for Events list selections */
function emitSelectEvent(ev) {
  if (!ev || !(ev.live_event_id ?? ev.id)) return;
  emit('selectEvent', ev);
}

onMounted(() => {
  if (accessInfoKnown.value || hasPlayableSrc.value) setAccessState();
  timeInterval = setInterval(() => { currentTime.value = Date.now(); }, 30000);
  syncPanelHeight();
  window.addEventListener('resize', syncPanelHeight, { passive: true });
});

onBeforeUnmount(() => {
  if (rmpInstance) {
    try { rmpInstance.stop?.(); } catch {}
    try { rmpInstance.destroy?.(); } catch {}
  }
  rmpInstance = null;
  if (timeInterval) clearInterval(timeInterval);
  window.removeEventListener('resize', syncPanelHeight);
});

// Reset info-panel lock whenever content truly changes
watch(
  () => [props.contentData?.id, props.contentData?.live_event_id, props.contentData?.match_id],
  () => { infoPanelLockedHeight.value = 0; nextTick(syncPanelHeight); }
);

// Only init when we can show the player AND the URL changed
const canInit = computed(() =>
  !shouldPosterOnly.value && !buttonFlowTemplatePopupRef.value && !showAccessMessage.value
);

watch([effectiveStreamingUrl, canInit], async ([url, ok]) => {
  if (!ok) {
    if (rmpInstance) {
      try { rmpInstance.stop?.(); } catch {}
      try { rmpInstance.destroy?.(); } catch {}
      rmpInstance = null;
      lastSrcKey.value = '';
    }
    return;
  }
  if (url) await rebuildPlayerWithSrc({ hls: url });
}, { immediate: true });

/* Rebuild iframe when switching sports sub-tabs */
watch(() => activeSportsSubTab.value, () => { /* computed src auto-updates */ });

/* Exposed controls */
function dvrSeekToEpoch(epochMs) {
  if (!rmpInstance || typeof rmpInstance.dvrSeekTo !== 'function') return;
  try {
    const duration = typeof rmpInstance.getDuration === 'function' ? rmpInstance.getDuration() : -1;
    if (duration <= 0) return;
    const now = Date.now();
    const windowStart = now - duration;
    const offset = epochMs - windowStart;
    const clamped = Math.max(0, Math.min(offset, duration - 1000));
    rmpInstance.dvrSeekTo(clamped);
  } catch (e) {
    console.warn('dvrSeekToEpoch failed', e);
  }
}

function playPastProgram(startMs, stopMs) {
  try {
    const content = props.contentData || {};
    const sourceUrl = isEvent.value
      ? (content.live_event_url || content.streaming_url)
      : isSports.value
        ? (content.match_streaming_url || content.streaming_url)
        : content.streaming_url;
    const startSec = Math.floor(startMs / 1000);
    const durationSec = Math.max(1, Math.floor((stopMs - startMs) / 1000));
    const archiveUrl = getStreamUrlForPastProgram(
      sourceUrl,
      content.cdn_type,
      startSec,
      durationSec,
      0
    );
    if (archiveUrl) rebuildPlayerWithSrc({ hls: archiveUrl });
  } catch (e) {
    console.warn('playPastProgram failed', e);
  }
}

function playLiveNow() {
  rebuildPlayerWithSrc();
}

defineExpose({ playLiveNow, dvrSeekToEpoch, playPastProgram });
</script>

<style scoped>
.full-bleed {
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  padding-left: 5px;
  padding-right: 5px;
  box-sizing: border-box;
}

.is-fullscreen {
  padding-left: 0;
  padding-right: 0;
}

.player-row {
  flex-wrap: nowrap;
  align-items: stretch !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.player-row > .v-col { padding-left: 0 !important; padding-right: 0 !important; }

.player-column {
  background-color: transparent;
  display: flex;
  align-items: stretch;
  padding: 0;
  padding-left: 16px;
}

.is-fullscreen .player-column { padding-left: 0; }

.info-column { display: flex; align-items: stretch; padding: 0; }

.info-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 0;
  padding-top: 0;
  box-sizing: border-box;
  margin-left: 10px;
  border-radius: 14px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, .35);
  overflow: hidden;
}

/* Make the window and its items fill the info-card vertically */
.info-card .pane-window { height: 100%; overflow: hidden; }
.info-card .pane-window .v-window__container,
.info-card .pane-window .v-window-item { height: 100%; }

/* Inside the About pane, make the content columnar and stretchy */
.info-card .pane-window .v-window-item.pa-4 {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

/* Sports About layout */
.sports-about { display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; }

.subtabs { flex: 0 0 auto; }

.widget-wrap { position: relative; flex: 1 1 auto; min-height: 280px; }

.widget-frame {
  width: 100%; height: 100%; border: 0; border-radius: 10px; overflow: hidden; background: #111;
}

/* Loader overlay */
.main-fader {
  position: absolute; inset: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.75); z-index: 10;
  display: flex; align-items: center; justify-content: center;
}

.loader { position: static; transform: none; }
.loader svg { height: 150px; width: auto; }
@media (max-width: 768px) { .loader svg { height: 120px; } }
@media (max-width: 480px) { .loader svg { height: 90px; } }

.loader svg path { animation-duration: 1s; animation-name: pulse; animation-iteration-count: infinite; }
.path-7{animation-delay:-1s}.path-6{animation-delay:-.875s}.path-5{animation-delay:-.75s}.path-4{animation-delay:-.625s}
.path-3{animation-delay:-.5s}.path-2{animation-delay:-.375s}.path-1{animation-delay:-.25s}.path-0{animation-delay:-.125s}
@keyframes pulse { 0%{opacity:.1} 30%{opacity:.8} 100%{opacity:.1} }

/* Poster-only shell */
.poster-shell {
  position: relative; width: 100%; aspect-ratio: 16 / 9;
  border-radius: 14px; overflow: hidden;
  box-shadow: 0 10px 24px rgba(0, 0, 0, .35);
  background: #000;
}
.poster-shell.fill-viewport {
  width: 100vw; height: 100vh; aspect-ratio: auto;
  border-radius: 0; box-shadow: none;
}
.poster-img { width: 100%; height: 100%; object-fit: cover; }

/* Inline access overlay above the poster */
.access-overlay {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; background: rgba(0,0,0,.45);
  text-align: center; padding: 16px;
}
.access-message { color: white; max-width: 520px; margin-bottom: 14px; padding: 0 16px; }

.pending-overlay {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.55);
  text-align: center; padding: 20px;
}
.pending-text {
  color: #fff; font-weight: 700; line-height: 1.35;
  font-size: clamp(.9rem, .8vw + .9rem, 1.2rem);
  text-shadow: 0 2px 6px rgba(0,0,0,.5);
}
.pending-date {
  display: inline-block;
  font-weight: 600; opacity: 0.95;
  font-size: clamp(.9rem, .8vw + .9rem, 1.2rem);
}

.popup-btn {
  background-color: white !important; color: black !important;
  text-transform: capitalize; font-weight: 600; border-radius: 30px; padding: 0 20px;
}

#rmp-container {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 10px 24px rgba(0, 0, 0, .35);
}
#rmp-container.fill-viewport {
  width: 100vw; height: 100vh; aspect-ratio: auto;
  border-radius: 0; box-shadow: none;
}

.custom-tabs {
  border-bottom: 1px solid #424242;
  padding-top: 8px; margin-top: 0; background: transparent;
}

.tab-button {
  height: 48px !important;
  width: 90px !important;
  border-radius: 12px !important;
  text-transform: none; font-size: 0.72rem;
}

.epg-header { display: flex; align-items: center; justify-content: flex-start; }
.epg-title { font-size: 0.85rem; opacity: 0.9; }

.prog-row {
  display: grid; grid-template-columns: 120px 1fr;
  gap: 12px; align-items: center;
}
.thumb-wrap { width: 100%; }
.thumb {
  width: 100%; aspect-ratio: 16 / 9; object-fit: cover; background: #000; border-radius: 6px;
}

.prog-body { display: flex; flex-direction: column; justify-content: center; min-width: 0; text-align: left; }
.prog-title { font-weight: 600; font-size: 0.95rem; text-align: left; }
.prog-desc {
  font-size: 0.82rem; opacity: 0.85; line-height: 1.2; margin-top: 2px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.prog-time { font-size: 0.75rem; opacity: 0.8; margin-top: 4px; text-align: left; }

.list-rows { display: flex; flex-direction: column; gap: 10px; }
.list-row {
  display: grid; grid-template-columns: 100px 1fr; gap: 12px; align-items: center;
  padding: 10px 8px; border-radius: 10px; background: rgba(255,255,255,.04); cursor: pointer;
}
.list-row:hover { background: rgba(255,255,255,.08); }
.list-row.is-active { background: rgba(255,255,255,.12); box-shadow: 0 0 0 2px rgba(255,255,255,.18); }
.row-thumb { width: 100%; }
.row-thumb .v-img { aspect-ratio: 16 / 9; border-radius: 8px; }
.row-body { min-width: 0; text-align: left; }
.row-title { font-weight: 600; font-size: 0.95rem; }
.row-sub { font-size: 0.8rem; opacity: .8; }
.row-sub--desc {
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; line-height: 1.3; max-height: calc(1.3em * 2); text-overflow: ellipsis;
}

.about-event {
  display: grid;
  grid-template-columns: 160px 1fr;
  grid-template-areas: "poster meta" "desc desc";
  gap: 12px 14px; align-items: start;
}
.about-poster {
  grid-area: poster; aspect-ratio: 16 / 9; width: 100%; max-width: 180px;
  border-radius: 10px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,.25);
}
.about-meta { grid-area: meta; min-width: 0; text-align: left; }
.about-title {
  margin: 2px 0 6px; line-height: 1.2; font-weight: 700; text-align: left;
  font-size: clamp(0.95rem, 0.35vw + 0.95rem, 1.15rem);
}
.about-date { text-align: left; opacity: .9; font-size: clamp(0.85rem, 0.25vw + 0.85rem, 0.95rem); }
.about-desc { grid-area: desc; text-align: left; margin-top: 6px; line-height: 1.35; opacity: .92; font-size: clamp(0.9rem, .2vw + .88rem, 1rem); }

.popup-btn {
  background-color: white !important; color: black !important;
  text-transform: capitalize; font-weight: 600; border-radius: 30px; padding: 0 20px;
}

@media (max-width: 960px) {
  .player-row { flex-wrap: wrap; }
  .info-card { margin-left: 0; }
  .tab-button { width: 76px !important; }
  .prog-row { grid-template-columns: 100px 1fr; }
  .player-column { padding-left: 0; }
  .about-event { grid-template-columns: 1fr; grid-template-areas: "poster" "meta" "desc"; }
  .about-poster { max-width: 100%; }
}
@media (max-width: 600px) {
  .info-card .pane-window .v-window-item.pa-4 {
    padding-left: 5px !important; padding-right: 5px !important;
  }
}


/* >= 1280px (covers 1440p laptops/monitors nicely) */
@media (min-width: 1280px) {
  .pending-text { font-size: clamp(1.15rem, 1.1vw + 1rem, 2rem); }
  .pending-date { font-size: clamp(1rem, 0.95vw + 0.9rem, 1.6rem); }
}

/* >= 1920px (1080p/1440p desktops; makes it more legible when viewed larger) */
@media (min-width: 1920px) {
  .pending-text { font-size: clamp(1.3rem, 1vw + 1.1rem, 2.4rem); }
  .pending-date { font-size: clamp(1.1rem, 0.9vw + 1rem, 1.8rem); }
}

/* >= 2560px (4K and ultra-wide; scale up a bit more without overwhelming) */
@media (min-width: 2560px) {
  .pending-text { font-size: clamp(1.5rem, 0.9vw + 1.2rem, 3rem); }
  .pending-date { font-size: clamp(1.25rem, 0.8vw + 1.1rem, 2.2rem); }
}
</style>
