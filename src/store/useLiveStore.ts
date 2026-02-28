import { defineStore } from 'pinia';
import { 
  getLiveTVByCategoryId as fetchByCategory, 
  getEPGNowTime as fetchEPG,
  isTokenExpired, // Assuming you might want more robust token handling
  getGuestToken   // for guest token fallback if needed
} from '@/utils/siberAPI';
import useAuthStore from './useAuthStore';

interface Channel {
  id: number | string; // Ensure 'id' is part of the Channel interface
  position?: number;
  name?: string;
  icon_url?: string;
  // Add other known properties
}

export interface LiveState {
  tv_categories: any[]; 
  tv_channels: Record<number, Channel[]>; 
  epg_map: Record<number, any>; 
}

export const useLiveStore = defineStore('liveStore', {
  state: (): LiveState => ({
    tv_categories: [],
    tv_channels: {},
    epg_map: {}
  }),
  getters: {
    getLiveTVCategory: state => state.tv_categories,
    getLiveTVChannel:  state => state.tv_channels,
    getEPGMap: state => state.epg_map, // Added getter for epg_map
  },
  actions: {
    async _getTokenForAPI() { // Helper for consistent token access
      const authStore = useAuthStore();
      let token = authStore.getToken;
      if (!token || isTokenExpired(token)) {
        // Fallback if authStore token is invalid and apiClient doesn't handle it before this point
        try {
          const guestTokenResponse = await getGuestToken();
          if (guestTokenResponse.data?.access_token) {
            token = guestTokenResponse.data.access_token;
          } else { return null; }
        } catch { return null; }
      }
      return token;
    },

    async getEPGNowTime() {
      const token = await this._getTokenForAPI();
      if (!token) {
        // console.error('LiveStore: No auth token available for EPG fetch');
        this.epg_map = {};
        return; 
      }

      try {
        const res = await fetchEPG({ token });
        if (res.data && Array.isArray(res.data)) {
          const epgMap = res.data.reduce((map: Record<number, any>, dataItem: any) => {
            if (dataItem && dataItem.id !== undefined) {
              const id = Number(dataItem.id);
              if (!map[id]) map[id] = {};
              map[id].epg = dataItem; 
            }
            return map;
          }, {});
          this.epg_map = epgMap;
        } else {
          this.epg_map = {};
        }
      } catch (error) {
        this.epg_map = {};
      }
    },

    async getLiveTVByCategoryId(payload: { CategoryId: number }) {
      const token = await this._getTokenForAPI();
      console.log(`LiveStore: getLiveTVByCategoryId called for CategoryId: ${payload.CategoryId}. Token: ${token ? 'present' : 'absent'}`);
      
      if (!token) {
        
        this.tv_channels[payload.CategoryId] = [];
        return;
      }

      const params = { 
        token, 
        category_id: String(payload.CategoryId) // Convert number to string
      };
      
      try {
        const res = await fetchByCategory(params);

        if (res.data?.response?.tv_channel && Array.isArray(res.data.response.tv_channel)) {
          const tvChannels: Channel[] = res.data.response.tv_channel;
          this.tv_channels[payload.CategoryId] = tvChannels.length
            ? [...tvChannels].sort((a: Channel, b: Channel) => (a.position || 0) - (b.position || 0))
            : [];
        } else {
          this.tv_channels[payload.CategoryId] = [];
        }

        if (res.data?.response?.tv_categories && Array.isArray(res.data.response.tv_categories)) {
          this.tv_categories = res.data.response.tv_categories;
        } else if (!this.tv_categories.length) {
          // this.tv_categories = []; // Or avoid resetting if it's meant to be cumulative
        }
      } catch (error) {
    console.error(`LiveStore: Error fetching Live TV for category ${payload.CategoryId}:`, error);
    this.tv_channels[payload.CategoryId] = []; // Ensure it's set to empty on error
    console.log(`LiveStore: Error for CategoryId ${payload.CategoryId}. Setting tv_channels to empty array.`);
      }
    }
    
  }
});

export default useLiveStore;