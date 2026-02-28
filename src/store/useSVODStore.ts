/* /src/store/useSVODStore.ts */
import { defineStore } from 'pinia';
import {
  getGuestToken,
  getSVODByCategoryId,
  getSVODById,
  getSVODSeriesById,
  getContinueWatchingContent,
  getRecentlyWatchedContent,
  isTokenExpired
} from '@/utils/siberAPI';
import useAuthStore from './useAuthStore'; // Assuming path is correct

export interface SVODItem {
  id: number | string;
  title?: string;
  // Add other common SVOD item properties
}

interface SVODState {
  SVODs: Record<string | number, SVODItem[]>;
  SVODsLimited: Record<string | number, SVODItem[]>; // NEW
  SVOD: Record<string, any>;
  movies_by_actor: SVODItem[];
  movies_by_director: SVODItem[];
  continue_watching: SVODItem[];
  continue_watching_movies: SVODItem[];
  continue_watching_series: SVODItem[];
  recently_watched: SVODItem[];
}

const useSVODStore = defineStore('svodStore', {
  state: (): SVODState => ({
    SVODs: {},
    SVODsLimited: {},
    SVOD: {},
    movies_by_actor: [],
    movies_by_director: [],
    continue_watching: [],
    continue_watching_movies: [],
    continue_watching_series: [],
    recently_watched: []
  }),
  getters: {
    getSVODsForCategory: (state) => (categoryId: string | number) => state.SVODs[categoryId] || [],
    // getSVOD: (state) => state.SVODs, // This getter might be ambiguous, renamed below
    getAllSVODsByCategory: (state) => state.SVODs,
    getSingleSVODDetail: (state) => (vodId: string) => state.SVOD[vodId],
    getSVODContinueWatching: (state) => state.continue_watching,
    getSVODContinueWatchingMovies: (state) => state.continue_watching_movies,
    getSVODContinueWatchingSeries: (state) => state.continue_watching_series,
    getSVODRecentlyWatched: (state) => state.recently_watched
  },
  actions: {
    async _getTokenForAPI() {
      const authStore = useAuthStore();
      let token = authStore.getToken;
      if (!token || isTokenExpired(token)) {
        // Fallback for guest token if authStore doesn't provide a fresh one.
        // This ideally should be less frequent if apiClient interceptor is robust.
        try {
          const guestTokenResponse = await getGuestToken();
          if (guestTokenResponse?.data?.access_token) {
            token = guestTokenResponse.data.access_token;
          } else { return null; }
        } catch { return null; }
      }
      return token;
    },

    async setSVODContinueWatching(payload: { menuType: string }) {
      const token = await this._getTokenForAPI();
      if (!token) {
        // Reset relevant state arrays on token failure
        if (payload?.menuType === 'continue_watching') this.continue_watching = [];
        else if (payload?.menuType === 'continue_watching_movies') this.continue_watching_movies = [];
        else if (payload?.menuType === 'continue_watching_series') this.continue_watching_series = [];
        else if (payload?.menuType === 'recently_watched') this.recently_watched = [];
        return;
      }

      try {
        let res;
        const commonParams = { token, limit: 12 };
        if (payload?.menuType === 'continue_watching') {
          res = await getContinueWatchingContent({ ...commonParams, type: '' });
          const series = res?.data?.response?.continue_watching?.series || [];
          const movies = res?.data?.response?.continue_watching?.movies || [];
          this.continue_watching = [...series, ...movies];
        } else if (payload?.menuType === 'continue_watching_movies') {
          res = await getContinueWatchingContent({ ...commonParams, type: 'movies' });
          this.continue_watching_movies = res?.data?.response?.continue_watching?.movies || [];
        } else if (payload?.menuType === 'continue_watching_series') {
          res = await getContinueWatchingContent({ ...commonParams, type: 'series' });
          this.continue_watching_series = res?.data?.response?.continue_watching?.series || [];
        } else if (payload?.menuType === 'recently_watched') {
          res = await getRecentlyWatchedContent({ token, limit: 12 });
          this.recently_watched = res?.data?.response?.recentlyWatched?.movies || [];
        }
      } catch (error) { /* console.error(`SVODStore: Error in setSVODContinueWatching for ${payload?.menuType}:`, error); */ }
    },

    async setSVODByCategoryId(payload: { CategoryId: string | number }) {
      const token = await this._getTokenForAPI();
      const catId = payload.CategoryId;

      if (!token) { this.SVODs[catId] = []; return; }
      if (Object.prototype.hasOwnProperty.call(this.SVODs, catId) && this.SVODs[catId]?.length > 0) return;

      this.SVODs[catId] = [];
      try {
        const res = await getSVODByCategoryId({ token, category_id: String(catId) }); // no limit => ALL
        this.SVODs[catId] = res?.data?.response?.movies || [];
      } catch { this.SVODs[catId] = []; }
    },

    async setSVODById(payload: { vodId: string }) {
      const token = await this._getTokenForAPI();
      const vodId = payload.vodId;
      if (!token) {
        this.SVOD[vodId] = { error: 'No token available' };
        return;
      }
      this.SVOD[vodId] = {}; // Initialize

      try {
        const res = await getSVODById({ token, vodId }); // vodId is already string here
        if (res?.data?.response) {
          this.SVOD[vodId] = res.data.response;
        } else {
          this.SVOD[vodId] = { error: 'Invalid data format from API' };
        }
      } catch (error) {
        this.SVOD[vodId] = { error: 'API fetch error' };
      }
    },

    async setSVODSeriesById(payload: { vodId: string }) {
      const token = await this._getTokenForAPI();
      const vodId = payload.vodId;
      if (!token) {
        this.SVOD[vodId] = { error: 'No token available' };
        return;
      }
      this.SVOD[vodId] = {}; // Initialize

      try {
        const res = await getSVODSeriesById({ token, vodId }); // vodId is already string here
        if (res?.data?.response) {
          this.SVOD[vodId] = res.data.response;
        } else {
          this.SVOD[vodId] = { error: 'Invalid data format for series from API' };
        }
      } catch (error) {
        this.SVOD[vodId] = { error: 'API fetch error for series' };
      }
    },
    
    async setSVODByCategoryIdLimited(payload: { CategoryId: string | number; Limit?: number }) {
      const token = await this._getTokenForAPI();
      const catId = payload.CategoryId;
      const limit = payload.Limit ?? 14;

      if (!token) { this.SVODsLimited[catId] = []; return; }
      if (Object.prototype.hasOwnProperty.call(this.SVODsLimited, catId) && this.SVODsLimited[catId]?.length > 0) return;

      this.SVODsLimited[catId] = [];
      try {
        const res = await getSVODByCategoryId({ token, category_id: String(catId), limit }); // limit => 14
        this.SVODsLimited[catId] = res?.data?.response?.movies || [];
      } catch { this.SVODsLimited[catId] = []; }
    }
  }
});

export default useSVODStore;