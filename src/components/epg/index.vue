<!-- /src/components/epg/index.vue -->
<template>
  <div @click="navigationStateChange()" class="outer-container">
    <div class="top-container">
      <div id="epgPlayer" v-if="playerChannel" ref="epgPlayerRef">
        <MediaPlayer
          ref="playerRef"
          :content-data="playerChannel"
          content-type="live_tv"
          :content-id="playerChannel?.id"
          :show-next-program="epgPlayerWidth >= 1280"
          :hide-info-when-stacked="true"
          :hide-tabs="true"
          :info-min-width="768"
          :now-next-programs="nowNextPrograms"
          :now-next-loading="nowNextLoading"
        />
      </div>

      <div v-else class="player-placeholder">
        <p>Select a program to start watching</p>
      </div>

      <div class="selector-container" v-show="channelCategoriesForSelect?.length">
        <v-select
          v-model="selectedCategoryId"
          :items="channelCategoriesForSelect"
          density="comfortable"
          variant="solo-filled"
          hide-details
          class="epg-channel-select"
          :menu-props="{ contentClass: 'epg-dropdown-menu' }"
        />
      </div>
    </div>

    <div class="epg-container">
      <div class="corner-box" style="position: absolute; top: 0px; z-index: 11; left: 0px;">
        {{ cornerBoxText }}
      </div>

      <div class="epg-scroller" ref="epgRef" @scroll="timeframeScrollListener">
        <div style="position: sticky; z-index: 10; top: 0; height: 30px;">
          <div style="height: 50px; position: relative;" :style="{ marginLeft: `${channelWidth + 2}px`, top: 0 }">
            <div
              v-for="i in numberOfHours"
              :key="i"
              :style="{
                backgroundColor: BACKGROUND_COLOR_1,
                width: `${hourWidth}px`,
                height: '100%',
                position: 'absolute',
                left: `${(i - 1) * hourWidth}px`
              }"
            >
              <span
                :style="{
                  position: 'absolute',
                  left: i === 1 ? '0px' : '-24px',
                  top: '13px',
                  color: '#a0aec0',
                  fontSize: '15px'
                }"
              >
                {{ getHours(startTime, i - 1) }}
              </span>
              <div
                v-for="j in 4"
                :key="j"
                :style="{
                  backgroundColor: '#718096',
                  position: 'absolute',
                  left: `${(j - 1) * (hourWidth / 4)}px`,
                  bottom: '6px',
                  height: '10px',
                  width: '1px'
                }"
              />
            </div>
          </div>
        </div>

        <div style="position: sticky; left: 0; bottom: 0px; float: left; width: 100px; z-index: 9;">
          <div
            v-for="(item, channelIndex) in epgChannelListMapFiltered"
            :key="item.channel.id"
            class="epg-channel-item"
            style="display: flex; justify-content: center; align-items: center; cursor: pointer"
            :style="{
              position: 'absolute',
              top: `${channelIndex * (programHeight + 5) + 25}px`,
              height: `${programHeight + 5}px`,
              backgroundColor: BACKGROUND_COLOR_1
            }"
            @click="playCurrentProgramByChannelId(item.channel.id)"
          >
            <div class="channel-logo-container">
              <img
                :src="item.channel.icon_url"
                :alt="item.channel.name"
                :class="{ 'locked-channel-logo': !item.channel.package_status }"
              />
              <div v-if="!item.channel.package_status" class="lock-overlay">
                <img :src="LockImage" alt="locked" style="width: 15px; height: 15px;" />
              </div>
            </div>
          </div>
        </div>

        <div style="position: absolute; left: 0px; top: 60px; width: 7200px;">
          <div style="position: relative; left: 100px;">
            <div
              class="time-bar"
              :style="{
                left: `${currentTimeLineX}px`,
                height: `${(epgChannelListMapFiltered?.length || 0) * (programHeight + 5)}px`
              }"
            />
            <div style="display: flex; flex-direction: column; flex: 1; padding-left: 10px;">
              <div>
                <div
                  v-for="(item, channelIndex) in epgChannelListMapFiltered"
                  :key="item.channel.id"
                  style="height: 100px; position: absolute;"
                  :style="{ top: `${channelIndex * (programHeight + 5)}px` }"
                >
                  <div
                    v-for="program in item.programs"
                    :key="program.programme_id"
                    class="program-card"
                    :class="{ selected: selectedProgramUUID === program.uuid }"
                    :style="{
                      height: `${programHeight}px`,
                      width: `${getProgramWidth(program)}px`,
                      position: 'absolute',
                      left: `${getProgramLeft(program)}px`
                    }"
                    @click="playProgram(item, program)"
                  >
                    <div v-if="program.icon_poster && getProgramWidth(program) > 150" style="height: 80%; width: 80px; margin-right: 5px;">
                      <img :src="program.icon_poster" width="100%" height="100%" style="object-fit: contain;" :alt="program.progName" />
                    </div>
                    <div class="epg-card-text">
                      <div class="program-title">{{ program.progName }}</div>
                      <div class="program-time">{{ getProgramTime(program) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <v-dialog v-model="hasNotStartedDialog" persistent width="auto">
    <v-card>
      <v-card-title class="text-h5">Alert</v-card-title>
      <v-card-text>{{ clickedProgramForDialog?.progName }} has not started</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn :style="ButtonColor" variant="text" @click="hasNotStartedDialog = false">Ok</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, watch, nextTick } from "vue";
import { to12HourFormatShort, formatMilliseconds } from "../../utils/date";
import {
  EPG_START_HRS_AGO, EPG_END_HRS_FUTURE,
  BACKGROUND_COLOR_1, BACKGROUND_COLOR_2, HIGHLIGHT_COLOR_1, HIGHLIGHT_COLOR_2,
  FONT_COLOR_1, EPG_INITIAL_CHANNEL_ID
} from "@/mainConfig";
import useEPGStore from "@/store/useEPGStore";
import useNavigationStore from "@/store/useNavigationStore";
import LockImage from "@/assets/img/lock_icon_white.svg";
import MediaPlayer from "@/components/MediaPlayer.vue";

const KEY_EPG_LAST_CATEGORY_ID = "KEY_EPG_LAST_CATEGORY_ID";
const KEY_LAST_CHANNEL_ID = "KEY_LAST_CHANNEL_ID";

export default {
  name: "EPG",
  components: { MediaPlayer },

  setup() {
    const epgStore = useEPGStore();

    // Player refs/state
    const playerRef = ref(null);
    const playerChannel = ref(null);
    const epgPlayerRef = ref(null);
    const epgPlayerWidth = ref(0);

    // EPG UI state
    const hasNotStartedDialog = ref(false);
    const selectedProgramUUID = ref(null);
    const clickedProgramForDialog = ref(null);
    const selectedCategoryId = ref(localStorage.getItem(KEY_EPG_LAST_CATEGORY_ID) || "-1");

    // Store-driven data
    const epgChannelListMapAll = computed(() => epgStore.epgChannelListMap || []);
    const channelCategoriesAll = computed(() => epgStore.channelCategories || []);

    // Filter channels by selected category
    const epgChannelListMapFiltered = computed(() => {
      const selectedId = String(selectedCategoryId.value);
      if (selectedId === "-1") return epgChannelListMapAll.value;

      return epgChannelListMapAll.value.filter(({ channel }) => {
        if (Array.isArray(channel.categories_array)) {
          return channel.categories_array.some(cat => String(cat.category_id) === selectedId);
        }
        if (typeof channel.category_ids === "string" && channel.category_ids.length > 0) {
          const ids = channel.category_ids.split(",");
          return ids.includes(selectedId);
        }
        if (channel.tv_category_id !== undefined) {
          return String(channel.tv_category_id) === selectedId;
        }
        return false;
      });
    });

    const channelCategoriesForSelect = computed(() =>
      channelCategoriesAll.value.map(({ cat_id, cat_name_short }) => ({
        title: cat_name_short,
        value: String(cat_id),
      }))
    );

    watch(selectedCategoryId, (v) => {
      localStorage.setItem(KEY_EPG_LAST_CATEGORY_ID, v);
    });

    // Derive Now & Next for current playerChannel; pass to MediaPlayer
    const nowNextPrograms = computed(() => {
      const ch = playerChannel.value;
      if (!ch) return [];
      const row = epgChannelListMapAll.value.find(({ channel }) => String(channel.id) === String(ch.id));
      if (!row) return [];
      const list = Array.isArray(row.programs) ? row.programs.slice() : [];
      const now = Date.now();

      const current = list.find(p => p.progStart_time <= now && p.progStop_time > now) || null;
      const next = current
        ? list.find(p => p.progStart_time >= current.progStop_time) || null
        : list.find(p => p.progStart_time > now) || null;

      const toMs = (t) => (t < 1e12 ? t * 1000 : t);
      const mapProg = (p) => ({
        ...p,
        progStart_ms: toMs(p.progStart_time),
        progStop_ms: toMs(p.progStop_time),
      });

      return [current && mapProg(current), next && mapProg(next)].filter(Boolean);
    });

    const nowNextLoading = computed(() => !epgChannelListMapAll.value || epgChannelListMapAll.value.length === 0);

    // Measure player width (for Now-only vs Now&Next)
    const measure = () => {
      epgPlayerWidth.value = epgPlayerRef.value?.offsetWidth || 0;
    };

    return {
      epgStore,
      // refs
      playerRef, playerChannel, epgPlayerRef, epgPlayerWidth, measure,
      // ui
      hasNotStartedDialog, selectedProgramUUID, clickedProgramForDialog,
      selectedCategoryId,
      // lists
      epgChannelListMapFiltered, channelCategoriesForSelect,
      // constants
      LockImage,
      BACKGROUND_COLOR_1, BACKGROUND_COLOR_2, HIGHLIGHT_COLOR_1, HIGHLIGHT_COLOR_2, FONT_COLOR_1,
      // now/next for MediaPlayer
      nowNextPrograms, nowNextLoading,
    };
  },

  data() {
    const nowMillis = new Date().setMinutes(0);
    const epgStart = nowMillis - EPG_START_HRS_AGO * 60 * 60 * 1000;
    const epgEnd = nowMillis + EPG_END_HRS_FUTURE * 60 * 60 * 1000;

    return {
      intervalId: null,
      startTime: epgStart,
      endTime: epgEnd,
      programHeight: 50,
      channelWidth: 100,
      hourWidth: 300,
      currentTime: Date.now(),
      currentTimeLineX: 0,
      ButtonColor: {
        backgroundColor: `${HIGHLIGHT_COLOR_1} !important`,
        color: `${FONT_COLOR_1} !important`,
      },
      cornerBoxText: "",
    };
  },

  computed: {
    msWidth() { return this.hourWidth / (60 * 60 * 1000); },
    numberOfHours() { return Math.ceil((this.endTime - this.startTime) / 3600000); },
  },

  methods: {
    /** Default channel: lowest 'position' that is enabled & has a stream */
    pickDefaultChannelId(list) {
      let best = null;
      for (const row of Array.isArray(list) ? list : []) {
        const ch = row?.channel || {};
        const pos = Number(ch?.position);
        if (!ch || ch.channel_status === false) continue;
        if (!ch.streaming_url) continue;
        if (Number.isNaN(pos)) continue;
        if (best === null || pos < best.pos) best = { id: ch.id, pos };
      }
      return best?.id ?? (list?.[0]?.channel?.id ?? null);
    },

    timeframeScrollListener(e) {
      const scrollableDiv = e.target;
      const offset = this.startTime + scrollableDiv.scrollLeft / this.msWidth;
      this.cornerBoxText = formatMilliseconds(offset);
    },

    updateCurrentTime() {
      this.currentTime = Date.now();
      this.currentTimeLineX = this.getPositionLeft(this.currentTime);
    },

    async playCurrentProgramByChannelId(channelId) {
      const foundObj = this.epgStore.epgChannelListMap.find(({ channel }) => String(channel.id) === String(channelId));
      if (!foundObj) return;

      const now = Date.now();
      const currentProgram = foundObj.programs?.find(
        ({ progStart_time, progStop_time }) => progStart_time <= now && progStop_time > now
      );
      const nextProgram = !currentProgram
        ? [...(foundObj.programs || [])]
            .sort((a, b) => a.progStart_time - b.progStart_time)
            .find((p) => p.progStart_time > now)
        : null;

      const sameChannel = String(this.playerChannel?.id) === String(foundObj.channel.id);

      this.playerChannel = foundObj.channel;
      localStorage.setItem(KEY_LAST_CHANNEL_ID, String(foundObj.channel.id));
      await nextTick();

      // If selecting the same channel while coming from an archive playback,
      // force the player back to the live/DVR URL.
      if (sameChannel) {
        this.$refs.playerRef?.playLiveNow?.();
      }

      if (currentProgram) {
        this.selectedProgramUUID = currentProgram.uuid;
        // Seek to start only if channel has timeshift enabled
        if (foundObj.channel?.timeshift_status) {
          setTimeout(() => {
            try { this.$refs.playerRef?.dvrSeekToEpoch?.(currentProgram.progStart_time); } catch {}
          }, sameChannel ? 500 : 800); // allow init/rebuild time
        }
      } else if (nextProgram) {
        this.selectedProgramUUID = nextProgram.uuid;
      }
    },

    navigationStateChange() {
      const navigationStore = useNavigationStore();
      navigationStore.changeNavigationState(false);
    },

    getHours(timeMs, i) {
      const date = new Date(timeMs);
      date.setHours(date.getHours() + i);
      return to12HourFormatShort(date);
    },
    getProgramWidth(program) {
      const { progStart_time, progStop_time } = program;
      const diff = progStop_time - progStart_time;
      const width = this.msWidth * diff;
      return Math.max(width - 5, 10);
    },
    getProgramLeft(program) {
      const { progStart_time } = program;
      const diff = progStart_time - this.startTime;
      return diff * this.msWidth;
    },
    getPositionLeft(ms) {
      const diff = ms - this.startTime;
      return diff * this.msWidth;
    },
    getProgramTime(program) {
      const { progStart_time, progStop_time } = program;
      return `${to12HourFormatShort(progStart_time)} - ${to12HourFormatShort(progStop_time)}`;
    },

    async playProgram(channelData, program) {
      const nowMillis = Date.now();
      this.clickedProgramForDialog = program;
      this.selectedProgramUUID = program.uuid;

      const { id } = channelData.channel;
      const { progStart_time, progStop_time } = program;

      // Future program
      if (progStart_time > nowMillis) {
        this.hasNotStartedDialog = true;
        return;
      }

      const sameChannel = String(this.playerChannel?.id) === String(channelData.channel.id);

      // Switch the player to this channel
      this.playerChannel = channelData.channel;
      localStorage.setItem(KEY_LAST_CHANNEL_ID, String(id));
      await nextTick();

      // Past program → archive slice
      if (progStop_time <= nowMillis) {
        try { this.$refs.playerRef?.playPastProgram?.(progStart_time, progStop_time); } catch {}
        return;
      }

      // Current program → ensure live/DVR URL then (optionally) seek to program start
      if (sameChannel) {
        this.$refs.playerRef?.playLiveNow?.(); // go back to live if we were on archive
      }
      if (channelData.channel?.timeshift_status) {
        setTimeout(() => {
          try { this.$refs.playerRef?.dvrSeekToEpoch?.(progStart_time); } catch {}
        }, sameChannel ? 500 : 800);
      }
    },
  },

  async mounted() {
    const lastChannelId = localStorage.getItem(KEY_LAST_CHANNEL_ID) || null;

    // Once EPG data is available, pick a starting channel.
    // Fix: don't call stop() before it's assigned; schedule it for the next tick.
    let stopWatch = null;
    stopWatch = this.$watch(
      () => this.epgStore.epgChannelListMap,
      (newList) => {
        if (Array.isArray(newList) && newList.length > 0) {
          const initialId =
            lastChannelId || this.pickDefaultChannelId(newList) || EPG_INITIAL_CHANNEL_ID;
          this.playCurrentProgramByChannelId(initialId);
          nextTick(() => { if (stopWatch) stopWatch(); });
        } else if (newList) {
          nextTick(() => { if (stopWatch) stopWatch(); });
        }
      },
      { immediate: true }
    );

    // Time/progress updates
    this.updateCurrentTime();
    this.intervalId = setInterval(this.updateCurrentTime, 30000);

    // Scroll to "now" (existing behavior)
    if (this.$refs.epgRef) {
      setTimeout(() => {
        if (this.$refs.epgRef) {
          const scrollAmount = this.currentTimeLineX - this.$refs.epgRef.offsetWidth * 0.4;
          this.$refs.epgRef.scrollLeft = Math.max(0, scrollAmount);
        }
      }, 100);
    }

    // Measure player width & observe resizes
    const measureNow = () => this.measure();
    measureNow();
    window.addEventListener("resize", measureNow);
    this.$watch(() => this.$refs.epgPlayerRef?.offsetWidth, measureNow);

    if ("ResizeObserver" in window && this.$refs.epgPlayerRef) {
      const ro = new ResizeObserver(measureNow);
      ro.observe(this.$refs.epgPlayerRef);
      this._epgRO = ro;
    }
  },

  beforeUnmount() {
    if (this.intervalId) clearInterval(this.intervalId);
    window.removeEventListener("resize", this.measure);
    if (this._epgRO) { this._epgRO.disconnect(); this._epgRO = null; }
  },
};
</script>


<style scoped>
/* --- Page layout --- */
.outer-container {
  display: flex;
  flex-direction: column;
  height: calc(120vh);
  margin-top: 64px;
  overflow: hidden;
}

.top-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  margin: 0;
}

/* Channel logo cells */
.channel-logo-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 50px;
  overflow: hidden;
  margin: auto;
}

.channel-logo-container img {
  width: 100%;
  height: auto;
  object-fit: contain;
}

.lock-overlay {
  position: absolute;
  bottom: 12px;
  right: 6px;
  width: 16px !important;
  height: 16px !important;
  min-width: 16px !important;
  min-height: 16px !important;
  padding: 0 !important;
  box-sizing: border-box !important;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

/* Controls the Player Width for Screens Sizes > 1280px */
#epgPlayer {
  width: 70%;
  margin: 0 auto;
}

/* Placeholder when no player */
.player-placeholder {
  width: 60%;
  max-width: 1280px;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.player-placeholder p {
  color: #a0aec0;
  font-size: 1.2rem;
}

/* Dropdown directly under player, left-aligned with the player's left edge */
.selector-container {
  width: 80%;
  max-width: 1600px;
  margin: 6px auto 0;
  box-sizing: border-box;
}

.epg-channel-select {
  max-width: 300px;
}

/* EPG grid */
.epg-container {
  flex-grow: 1;
  position: relative;
  overflow: hidden;
  width: 100%;
  padding: 0 10px;
  box-sizing: border-box;
}

.epg-scroller {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
  scroll-behavior: smooth;
}

.epg-scroller>div[style*="position: sticky"] {
  background-color: v-bind(BACKGROUND_COLOR_1);
}

.epg-scroller>div:first-child {
  z-index: 10;
}

.epg-scroller>div:nth-child(2) {
  z-index: 9;
}

.program-card {
  border-radius: 6px;
  margin-right: 10px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  font-size: 14px;
  overflow: hidden;
  background-color: v-bind(BACKGROUND_COLOR_2);
  cursor: pointer;
  color: v-bind(FONT_COLOR_1);
  box-sizing: border-box;
  min-height: 50px;
}

.program-card:hover {
  background-color: v-bind(HIGHLIGHT_COLOR_1) !important;
}

.selected {
  background-color: v-bind(HIGHLIGHT_COLOR_1) !important;
}

/* LEFT-aligned text inside EPG cards */
.epg-card-text {
  text-align: left;
}

.program-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  font-weight: 500;
  text-align: left !important;
}

.program-time {
  white-space: nowrap;
  overflow: hidden;
  font-size: 12px;
  padding-top: 3px;
  opacity: 0.8;
  text-align: left !important;
}

.corner-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 50px;
  font-size: 13px;
  text-align: center;
  box-sizing: border-box;
  color: v-bind(FONT_COLOR_1);
  background-color: v-bind(BACKGROUND_COLOR_1);
  border-right: 1px solid #333;
  border-bottom: 1px solid #333;
}

.time-bar {
  position: absolute;
  top: 0;
  width: 2px;
  background: v-bind(HIGHLIGHT_COLOR_2);
  pointer-events: none;
  z-index: 11;
}

/* v-select theming */
.epg-channel-select:deep(.v-field) {
  background-color: v-bind(BACKGROUND_COLOR_2) !important;
  border-radius: 30px !important;
  border: 1px solid #4a4a4a !important;
  box-shadow: none !important;
}

.epg-channel-select:deep(.v-select__selection-text) {
  color: #FFFFFF !important;
  font-size: 0.9rem;
}

.epg-channel-select:deep(.v-label) {
  color: rgba(255, 255, 255, 0.7) !important;
  opacity: 1;
}

.epg-channel-select:deep(.v-icon) {
  color: v-bind(FONT_COLOR_1) !important;
  opacity: 0.7;
}

.epg-dropdown-menu {
  background-color: #2d2d2d !important;
  border: 1px solid #4a4a4a !important;
  border-radius: 8px !important;
  padding-top: 4px;
  padding-bottom: 4px;
}

.epg-dropdown-menu .v-list-item-title {
  color: #FFFFFF !important;
  font-size: 0.9rem !important;
}

.epg-dropdown-menu .v-list-item:hover .v-list-item__overlay {
  background-color: v-bind(HIGHLIGHT_COLOR_1) !important;
  opacity: 0.8 !important;
}

.epg-dropdown-menu .v-list-item--active>.v-list-item__overlay {
  background-color: v-bind(HIGHLIGHT_COLOR_1) !important;
  opacity: 1 !important;
}

/* Fix Vuetify row/col gutters inside the embedded MediaPlayer so tabs aren't clipped */
#epgPlayer :deep(.v-row) {
  margin: 0 !important;
}

#epgPlayer :deep(.v-row > .v-col) {
  padding: 0 !important;
}

#epgPlayer :deep(.v-row.no-gutters) {
  margin: 0 !important;
}

#epgPlayer :deep(.v-row.no-gutters > .v-col) {
  padding: 0 !important;
}

/* Make the right info panel stretch with the player and not get cut off */
#epgPlayer :deep(.info-column) {
  align-items: stretch !important;
  overflow: visible !important;
}

#epgPlayer :deep(.info-card) {
  padding-top: 8px;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 12px 28px rgba(0,0,0,.35);
}

#epgPlayer :deep(.v-window) {
  height: 100%;
}

#epgPlayer :deep(.player-row) {
  flex-wrap: nowrap !important;
  /* keep both columns on one line */
  align-items: stretch !important;
}

#epgPlayer :deep(.player-column) {
  flex: 0 0 50% !important;
  /* was ~66%, make 50% */
  max-width: 50% !important;
}

#epgPlayer :deep(.info-column) {
  flex: 0 0 50% !important;
  /* was ~33%, make 50% (≈50% wider) */
  max-width: 50% !important;
  overflow: visible !important;
}

/* Center the embedded MediaPlayer: kill its full-bleed behavior just for EPG */
#epgPlayer :deep(.full-bleed) {
  width: 100% !important;
  max-width: 1400px;           /* optional cap; tweak as you like */
  margin-left: auto !important;
  margin-right: auto !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

/* Remove the page gutter we give the player in other views */
#epgPlayer :deep(.player-column) {
  padding-left: 0 !important;
}

/* Keep the row centered within the epgPlayer box */
#epgPlayer :deep(.player-row) {
  justify-content: center !important;
}

.v-container{
  padding: 0px !important;
}

/* Responsive */
@media (max-width: 1280px) {

  #epgPlayer,
  .player-placeholder,
  .selector-container {
    width: 80%;
  }
}

@media (max-width: 1024px) {

  #epgPlayer,
  .player-placeholder,
  .selector-container {
    width: 98%;
    max-width: none;
  }
}

@media (max-width: 767px) {
  .outer-container {
    margin-top: 56px;
    height: calc(100vh - 56px);
  }

  /* Make the container go full width */
  #epgPlayer,
  .player-placeholder,
  .selector-container {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    border-left: none;
    border-right: none;
  }

  /* CRITICAL: let the player column expand to full width on mobile */
  #epgPlayer :deep(.player-column) {
    flex: 1 1 100% !important;
    max-width: 100% !important;
  }

  /* Hide the info column on mobile just in case it renders */
  #epgPlayer :deep(.info-column) {
    display: none !important;
  }

  /* Ensure the RMP container/video scales to 100% width */
  #epgPlayer :deep(#rmp-container),
  #epgPlayer :deep(video) {
    width: 100% !important;
    height: auto !important;
  }

  .player-placeholder {
    max-height: 35vh;
  }

  .epg-container {
    padding: 0 5px;
  }
}

/* Desktop gap between player and the info panel */
@media (min-width: 960px) {
  #epgPlayer :deep(.info-card) { margin-left: 12px; }
}

/* Mobile: stacked directly, no gap */
@media (max-width: 959.98px) {
  #epgPlayer :deep(.info-card) { margin-left: 0 !important; }
}
</style>
