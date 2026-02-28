import { defineStore } from 'pinia';
import {
  getLiveEventsByCategoryId,
  // getGuestToken, // Not directly fetched here; useAuthStore handles it.
  getEventsByContentProviderId,
  getSeriesByContentProviderId,
  getFilmsByContentProviderId,
  isTokenExpired // Can still be used for a quick client-side check if desired
} from '@/utils/siberAPI';
import useAuthStore from './useAuthStore'; // Primary source for token

// Define a comprehensive EventItem interface based on properties used in ProviderVideo.vue
// Ensure this is exported so ProviderVideo.vue can import it.
export interface EventItem {
  id: number | string; // Primary identifier for the event itself
  live_event_id?: number; // Often the same as 'id', or a specific ID for live events
  live_event_date?: string; // Raw date string from API
  live_event_playback_status?: 'uploaded' | 'pending_upload' | 'pending' | 'started' | 'finished' | string; // Status of the event
  live_event_image_wide?: string; // URL for the wide image
  package_status?: boolean | number | null; // Status of associated package (e.g., 0 for locked, 1 for unlocked, or boolean)
  content_provider_id?: number | string; // ID of the content provider
  content_provider_logo?: string; // URL for the provider's logo
  live_event_name_short?: string; // Short name/title of the event
  content_provider_name?: string; // Name of the content provider
  channel_status?: 'ACTIVE' | string; // Status of the channel, e.g., if it's currently live
  // Add any other properties that your API might return for an event item
  // For example:
  // description_short?: string;
  // description_long?: string;
  // genre?: string;
  // etc.
}

interface EventsState {
  EventPackages: Record<string, any[]>; // Keyed by CategoryId as string. Consider specific type for package items.
  Events: Record<string, EventItem[]>;  // Keyed by CategoryId as string, array of EventItem.
  ProviderEvents: EventItem[]; // This will hold events fetched by provider ID.
  FilmsEvents: any[]; // TODO: Define specific type for film items if different from EventItem.
  SeriesEvents: any[];// TODO: Define specific type for series items if different from EventItem.
}

const useEventsStore = defineStore('eventsStore', {
  state: (): EventsState => ({
    EventPackages: {},
    Events: {},
    ProviderEvents: [], // Initialize as empty array of EventItem
    FilmsEvents: [],
    SeriesEvents: []
  }),
  getters: {
    getLiveEvents: (state) => state.Events,
    getLiveEventsPackages: (state) => state.EventPackages,
    getProviderEvents: (state) => state.ProviderEvents,
    getSeriesEvents: (state) => state.SeriesEvents,
    getFilmsEvents: (state) => state.FilmsEvents
  },
  actions: {
    // Simplified helper to get a token, primarily from useAuthStore
    async _getValidToken(): Promise<string | null> {
      const authStore = useAuthStore();
      const token = authStore.getToken; 

      if (!token) {
        console.warn('EventsStore: No token found in authStore. AuthStore might not be initialized or its guest token fetch failed.');
        return null;
      }

      if (isTokenExpired(token)) {
        console.warn(`EventsStore: Token from authStore (mode: ${authStore.getTokenMode}) appears client-side expired. Proceeding, but API may reject.`);
      }
      
      return token;
    },

    async setLiveEventsByCategoryId(payload: { CategoryId: number | string }) {
      const categoryIdStr = String(payload.CategoryId);
      const token = await this._getValidToken();

      if (!token) {
        console.error(`EventsStore: No valid token for setLiveEventsByCategoryId (Category ID: ${categoryIdStr}).`);
        this.Events[categoryIdStr] = [];
        this.EventPackages[categoryIdStr] = []; // Assuming packages are also keyed this way
        return; 
      }

      const apiParams = {
        token: token,
        category_id: categoryIdStr
      };

      try {
        const res = await getLiveEventsByCategoryId(apiParams);
        // Use optional chaining and ensure the result is an array, cast to EventItem[]
        const events: EventItem[] = (res?.data?.response?.events && Array.isArray(res.data.response.events)) ? res.data.response.events : [];
        const packages: any[] = (res?.data?.response?.packages && Array.isArray(res.data.response.packages)) ? res.data.response.packages : [];

        this.Events[categoryIdStr] = events;
        this.EventPackages[categoryIdStr] = packages;
      } catch (error: any) { 
        console.error(`EventsStore: API Error for setLiveEventsByCategoryId (Cat ID: ${categoryIdStr}):`, error);
        this.Events[categoryIdStr] = [];
        this.EventPackages[categoryIdStr] = [];
        
        if (error.sessionExpired || error.status === 401) { 
          console.warn("EventsStore: Detected session expired from API error. Triggering authStore re-evaluation.");
          const authStore = useAuthStore();
          await authStore.clearAuthDataAndFetchGuestToken(); 
        }
      }
    },

    async getEventsByContentProviderId(payload: { providerId: string }) {
      const token = await this._getValidToken();
      if (!token) {
        console.error('EventsStore: No valid token for getEventsByContentProviderId.');
        this.ProviderEvents = [];
        return;
      }
      try {
        const apiParams = { token, providerId: payload.providerId };
        const res = await getEventsByContentProviderId(apiParams);
        // Cast to EventItem[] for type safety
        this.ProviderEvents = (res?.data?.response?.events && Array.isArray(res.data.response.events)) ? res.data.response.events as EventItem[] : [];
      } catch (error: any) {
        console.error('EventsStore: Error fetching events by provider ID:', error);
        this.ProviderEvents = [];
        if (error.sessionExpired || error.status === 401) {
          const authStore = useAuthStore();
          await authStore.clearAuthDataAndFetchGuestToken();
        }
      }
    },

    async getFilmsByContentProviderId(payload: { providerId: string }) {
      const token = await this._getValidToken();
      if (!token) {
        console.error('EventsStore: No valid token for getFilmsByContentProviderId.');
        this.FilmsEvents = []; // Assuming FilmsEvents is meant to be EventItem[] or similar typed array
        return;
      }
      try {
        const apiParams = { token, providerId: payload.providerId };
        const res = await getFilmsByContentProviderId(apiParams);
        // TODO: Define a FilmItem interface if different from EventItem
        this.FilmsEvents = (res?.data?.response?.movies && Array.isArray(res.data.response.movies)) ? res.data.response.movies : [];
      } catch(error: any) {
        console.error('EventsStore: Error fetching films by provider ID:', error);
        this.FilmsEvents = [];
        if (error.sessionExpired || error.status === 401) {
          const authStore = useAuthStore();
          await authStore.clearAuthDataAndFetchGuestToken();
        }
      }
    },

    async getSeriesByContentProviderId(payload: { providerId: string }) {
      const token = await this._getValidToken();
      if (!token) {
        console.error('EventsStore: No valid token for getSeriesByContentProviderId.');
        this.SeriesEvents = []; // Assuming SeriesEvents is meant to be EventItem[] or similar typed array
        return;
      }
      try {
        const apiParams = { token, providerId: payload.providerId };
        const res = await getSeriesByContentProviderId(apiParams);
        // TODO: Define a SeriesItem interface if different from EventItem
        this.SeriesEvents = (res?.data?.response?.series && Array.isArray(res.data.response.series)) ? res.data.response.series : [];
      } catch(error: any) {
        console.error('EventsStore: Error fetching series by provider ID:', error);
        this.SeriesEvents = [];
        if (error.sessionExpired || error.status === 401) {
          const authStore = useAuthStore();
          await authStore.clearAuthDataAndFetchGuestToken();
        }
      }
    }
  }
});

export default useEventsStore;