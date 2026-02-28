import { defineStore } from 'pinia';
import { getSearchData } from '../utils/siberAPI';

// --- 1. DEFINE SPECIFIC TYPES FOR EACH CATEGORY ---
// These interfaces describe the exact shape of the data from your API.

export interface SearchTVItem {
  type: "LIVE_CHANNEL";
  channel_id: number;
  channel_name: string;
  channel_image: string;
  package_status: boolean;
  login_required: boolean;
  packages?: any[];
}

export interface SearchMovieItem {
  vod_id: number;
  vod_name_short: string;
  poster_url: string;
  package_status: boolean;
  login_required: boolean;
  is_series: "false"; // Search results for movies have this
}

export interface SearchSeriesItem {
  vod_series_id: number;
  vod_series_name_short: string;
  poster_url: string;
  package_status: boolean;
  login_required: boolean;
  is_series?: "true"; // This might not exist in search but is good to anticipate
}

// Add types for Sports and Events here when you have their JSON structure
export interface SearchSportItem {
  match_id: number;
  // ... other properties like match_team_a, match_poster, package_status, etc.
}

export interface SearchEventItem {
  live_event_id: number;
  // ... other properties like live_event_name_short, live_event_image_wide, etc.
}


// --- 2. DEFINE THE MAIN STATE INTERFACE ---
// It uses the specific types we created above.
export interface SearchState {
  searchCategories: CategoryKey[]; 
  lastQuery: string;
  tv: { name: string; data: SearchTVItem[] }; 
  movies: { name: string; data: SearchMovieItem[] };
  series: { name: string; data: SearchSeriesItem[] };
  sports: { name: string; data: SearchSportItem[] };
  events: { name: string; data: SearchEventItem[] };
  isLoading: boolean;
}

// A helper type to get the valid keys for our categories
type CategoryKey = keyof Omit<SearchState, 'searchCategories' | 'isLoading' | 'lastQuery'>;


// --- 3. DEFINE THE STORE ---
const useSearchStore = defineStore('searchStore', {
  state: (): SearchState => ({
    searchCategories: [],
    lastQuery: '',
    tv: { name: 'Live TV', data: [] },
    movies: { name: 'Movies', data: [] },
    series: { name: 'Series', data: [] },
    sports: { name: 'Sports', data: [] },
    events: { name: 'Events', data: [] },
    isLoading: false,
  }),
  getters: {
    // --- 4. A FULLY TYPED GETTER ---
    // This getter is now simple and fully type-safe.
    getCategoryData: (state) => (categoryKey: CategoryKey) => state[categoryKey],
    // Other getters can be added here if needed
    getIsLoadingSearch: (state) => state.isLoading,
  },
  actions: {
    async getSearchData(payload: { query: string }) {
      if (payload.query === this.lastQuery && !this.isLoading) {
        return; // Skip API call if query is the same
      }
      this.isLoading = true;
      this.resetData();
      this.lastQuery = payload.query;

      try {
        const res = await getSearchData({ query: payload.query });

        if (res.data?.response) {
          const { 
            tv, 
            svod_movies, 
            svod_series, 
            sports, 
            events 
          } = res.data.response;

          // Call the strictly typed setters
          if (tv?.length) this.setTV(tv);
          if (svod_movies?.length) this.setMovies(svod_movies);
          if (svod_series?.length) this.setSeries(svod_series);
          if (sports?.length) this.setSports(sports);
          if (events?.length) this.setEvents(events);
        }
      } catch (error) {
        console.error('SearchStore: Failed to fetch search data:', error);
      } finally {
        this.isLoading = false;
      }
    },

    resetData() {
      this.searchCategories = [];
      // Do NOT reset lastQuery here, so we can prevent refetching on back navigation
      this.tv.data = [];
      this.movies.data = [];
      this.series.data = [];
      this.sports.data = [];
      this.events.data = [];
    },
    
    // --- 5. STRICTLY TYPED SETTERS ---
    setTV(data: SearchTVItem[]) {
      if (!this.searchCategories.includes('tv')) this.searchCategories.push('tv');
      this.tv.data = data;
    },
    setMovies(data: SearchMovieItem[]) {
      if (!this.searchCategories.includes('movies')) this.searchCategories.push('movies');
      this.movies.data = data;
    },
    setSeries(data: SearchSeriesItem[]) {
      if (!this.searchCategories.includes('series')) this.searchCategories.push('series');
      this.series.data = data;
    },
    setSports(data: SearchSportItem[]) {
      if (!this.searchCategories.includes('sports')) this.searchCategories.push('sports');
      this.sports.data = data;
    },
    setEvents(data: SearchEventItem[]) {
      if (!this.searchCategories.includes('events')) this.searchCategories.push('events');
      this.events.data = data;
    }
  }
});

export default useSearchStore;