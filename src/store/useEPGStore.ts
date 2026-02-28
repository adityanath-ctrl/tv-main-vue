// /src/store/useEPGStore.ts
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import {
  getEPGTime as apiGetEPGTime,
  getChannels as apiGetChannels,
  isTokenExpired,
} from '../utils/siberAPI';
import useAuthStore from './useAuthStore';

/** ---------- Types (exported to avoid “private name” TS warnings) ---------- */
export interface Category {
  cat_id: string | number;
  cat_name_short: string;
  cat_position: number;
}

export interface Program {
  progStart_time: number; // epoch ms
  progStop_time: number;  // epoch ms
  progName: string;
  uuid?: string;
  icon_poster?: string;
  progDesc?: string;
  programme_id?: string | number;
}

export interface ChannelCategoryEntry {
  category_id: number;
  category_name_short: string;
  category_name_long: string;
}

export interface ChannelData {
  id: string | number;
  tv_category_id?: string | number;
  categories_array?: ChannelCategoryEntry[];
  channel_status?: boolean;
  streaming_url?: string;
  [key: string]: any;
}

export interface EPGChannelMapItem {
  channel: ChannelData;
  programs: Program[];
}

export interface EPGState {
  channelCategories: Category[];
  epgChannelListMap: EPGChannelMapItem[];
}

/** ------------------------------- Store ----------------------------------- */
const useEPGStore = defineStore('epgStore', {
  state: (): EPGState => ({
    channelCategories: [],
    epgChannelListMap: [],
  }),

  getters: {
    getEPGChannelListMap: (state): EPGChannelMapItem[] => state.epgChannelListMap,
    getEPGChannelCategories: (state): Category[] => state.channelCategories,
  },

  actions: {
    async _getValidToken(): Promise<string | null> {
      const authStore = useAuthStore();
      const token = authStore.getToken;

      if (!token) {
        console.warn('EPGStore: No token found in authStore.');
        return null;
      }
      if (isTokenExpired(token)) {
        // Not fatal—backend may still accept it if server time differs.
        console.warn('EPGStore: Token appears client-side expired.');
      }
      return token;
    },

    /**
     * Fetch channels + EPG time grid and build:
     *  - channelCategories (dynamic from channels.categories_array)
     *  - epgChannelListMap (merge channels with their programs; synthesize placeholders if missing)
     */
    async getChannelCategories(): Promise<void> {
      const token = await this._getValidToken();

      if (!token) {
        console.error('EPGStore: No valid token available for getChannelCategories().');
        this.channelCategories = [{ cat_name_short: 'All Channels', cat_id: '-1', cat_position: 0 }];
        this.epgChannelListMap = [];
        return;
      }

      try {
        const apiParams = { token };
        const [epgResult, channelsResult] = await Promise.all([
          apiGetEPGTime(apiParams),
          apiGetChannels(apiParams),
        ]);

        // ---------------- Channels ----------------
        const channelsList: ChannelData[] =
          channelsResult?.data?.response?.tv_channel ?? [];

        if (!Array.isArray(channelsList) || channelsList.length === 0) {
          console.warn('EPGStore: Channels list empty. Using defaults.');
          this.channelCategories = [{ cat_name_short: 'All Channels', cat_id: '-1', cat_position: 0 }];
          this.epgChannelListMap = [];
          return;
        }

        // ---------------- Categories (dynamic) ----------------
        const map: Record<string, Category> = {};
        for (const channel of channelsList) {
          if (Array.isArray(channel.categories_array)) {
            for (const cat of channel.categories_array) {
              const id = String(cat.category_id);
              if (!map[id]) {
                map[id] = {
                  cat_id: id,
                  cat_name_short: cat.category_name_short,
                  cat_position: 0,
                };
              }
            }
          }
        }

        const finalCategories: Category[] = Object.values(map)
          .sort((a, b) => a.cat_name_short.localeCompare(b.cat_name_short));
        finalCategories.unshift({ cat_name_short: 'All Channels', cat_id: '-1', cat_position: 0 });
        this.channelCategories = finalCategories;

        // ---------------- EPG merge ----------------
        const epgArray: Array<{ id: string | number; programs?: Program[] }> =
          Array.isArray(epgResult?.data) ? epgResult.data : [];

        const processed: EPGChannelMapItem[] = [];

        for (const epgObj of epgArray) {
          if (!epgObj || epgObj.id === undefined) continue;

          const channelIdStr = String(epgObj.id);
          const channel = channelsList.find(ch => String(ch.id) === channelIdStr);
          if (!channel) continue;

          let programs: Program[] = Array.isArray(epgObj.programs) ? epgObj.programs : [];

          if (programs.length === 0) {
            // Synthesize half-hour slots for the last 24h to avoid empty rows
            const now = Date.now();
            const start = now - 24 * 60 * 60 * 1000;
            const slot = 30 * 60 * 1000;
            programs = Array.from({ length: 48 }, (_, i) => {
              const s = start + i * slot;
              return {
                progStart_time: s,
                progStop_time: s + slot,
                progName: 'No EPG Data Available',
                uuid: uuidv4(),
              };
            });
          } else {
            programs = programs.map(p => ({ ...p, uuid: p.uuid ?? uuidv4() }));
          }

          processed.push({ channel, programs });
        }

        this.epgChannelListMap = processed;
      } catch (error: any) {
        console.error('EPGStore: Error in data fetching pipeline:', error);
        this.channelCategories = [{ cat_name_short: 'All Channels', cat_id: '-1', cat_position: 0 }];
        this.epgChannelListMap = [];

        if (error?.sessionExpired || error?.status === 401) {
          const authStore = useAuthStore();
          await authStore.clearAuthDataAndFetchGuestToken();
        }
      }
    },
  },
});

export default useEPGStore;