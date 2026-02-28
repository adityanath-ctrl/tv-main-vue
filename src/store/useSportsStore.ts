import { defineStore } from 'pinia';
import { getSportsByCategory, isTokenExpired } from '@/utils/siberAPI';
import useAuthStore from './useAuthStore';
import {
  LIVE_UPCOMING_MATCHES_CATEGORY_ID,
  RECENTLY_PAST_MATCHES_CATEGORY_ID,
} from '@/mainConfig';

// Export this interface so other components can use it if needed
export interface SportEvent {
  datetime: string;
  id?: number | string;
  content_provider_id?: number;
  [key: string]: any;
}

interface SportsState {
  sports_events: Record<string | number, SportEvent[]>;
}

interface GetLiveSportsPayload {
  CategoryId: string | number;
  ContentProviderId?: number;
}

const sportsKey = (categoryId: string | number, contentProviderId?: number) =>
  `${String(categoryId)}__cp:${contentProviderId ?? 'none'}`;

export const useSportsStore = defineStore('sportsStore', {
  state: (): SportsState => ({
    sports_events: {}
  }),
  getters: {
    getSportsEventsForCategory: (state) => (categoryId: string | number, contentProviderId?: number) =>
      state.sports_events[sportsKey(categoryId, contentProviderId)] || [],
  },
  actions: {
    async _getValidToken(): Promise<string | null> {
      const authStore = useAuthStore();
      const token = authStore.getToken;

      if (!token) {
        console.warn('SportsStore: No token found in authStore.');
        return null;
      }
      if (isTokenExpired(token)) {
        console.warn(`SportsStore: Token from authStore (mode: ${authStore.getTokenMode}) appears client-side expired.`);
      }
      return token;
    },

    async getLiveSportsByCategoryId(payload: GetLiveSportsPayload) {
      const token = await this._getValidToken();
      const storeKey = sportsKey(payload.CategoryId, payload.ContentProviderId);

      if (!token) {
        console.error(`SportsStore: No valid token for getLiveSportsByCategoryId (Key: ${storeKey}).`);
        this.sports_events[storeKey] = [];
        return;
      }

      const apiParams: {
        token: string;
        category_id: string;
        contentProviderId?: number;
      } = {
        token,
        category_id: String(payload.CategoryId),
      };

      if (payload.ContentProviderId !== undefined && payload.ContentProviderId !== null) {
        apiParams.contentProviderId = payload.ContentProviderId;
      }

      console.log(
        `SportsStore: Fetching sports for CatID: ${payload.CategoryId}, ProvID: ${payload.ContentProviderId} with params:`,
        apiParams
      );

      try {
        const res = await getSportsByCategory(apiParams);

        if (res.data?.response?.sport_events && Array.isArray(res.data.response.sport_events)) {
          const events: SportEvent[] = res.data.response.sport_events;

          // Choose sorter by category
          const catIdNum = Number(payload.CategoryId);
          let sorted: SportEvent[];

          if (catIdNum === LIVE_UPCOMING_MATCHES_CATEGORY_ID) {
            // Ascending (earliest first)
            sorted = [...events].sort(sortByDateTimeAsc);
          } else if (catIdNum === RECENTLY_PAST_MATCHES_CATEGORY_ID) {
            // Descending (latest first)
            sorted = [...events].sort(sortByDateTimeDesc);
          } else {
            // Special ordering for all other categories
            sorted = [...events].sort(specialSportsSort);
          }

          this.sports_events[storeKey] = sorted;

          console.log(`SportsStore: Stored ${events.length} events under Key: ${storeKey}`);
        } else {
          console.warn(`SportsStore: No sport_events array in response (Key: ${storeKey}).`, res.data);
          this.sports_events[storeKey] = [];
        }
      } catch (error: any) {
        console.error(`SportsStore: Failed to fetch sports events (Key: ${storeKey}):`, error);
        this.sports_events[storeKey] = [];
        if (error.sessionExpired || error.status === 401) {
          const authStore = useAuthStore();
          await authStore.clearAuthDataAndFetchGuestToken();
        }
      }
    }
  }
});

/* ---------------------- Time helpers & sorters ---------------------- */

/**
 * Normalize various event datetime fields to a timestamp (ms).
 * - Accepts "YYYY-MM-DD HH:mm:ss" and "YYYY-MM-DDTHH:mm:ss"
 * - If no timezone is present, assumes UTC (appends 'Z')
 * - Falls back to several common fields if `datetime` is absent
 * - Returns +Infinity for invalid/missing to push to the end in ascending sort
 */
const parseEventTimeMs = (e: SportEvent): number => {
  const raw: unknown =
    e.datetime ??
    e.match_datetime ??
    e.start_time ??
    e.start_date ??
    e.live_event_date ??
    null;

  if (raw == null) return Number.POSITIVE_INFINITY;

  // number → epoch ms
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw : Number.POSITIVE_INFINITY;
  }

  // Date object (avoid TS2358 by casting to object first)
  if ((raw as object) instanceof Date) {
    const ms = (raw as Date).getTime();
    return Number.isNaN(ms) ? Number.POSITIVE_INFINITY : ms;
  }

  // string-like → normalize to ISO
  let s = String(raw).trim();
  if (!s) return Number.POSITIVE_INFINITY;

  if (!s.includes('T')) s = s.replace(' ', 'T');

  // If no timezone info present, assume UTC
  // NOTE: '-' doesn’t need escaping in a class when placed at ends; use [+-]
  const hasTZ = /[zZ]|[+-]\d{2}:?\d{2}$/.test(s);
  if (!hasTZ) s += 'Z';

  const ms = Date.parse(s);
  return Number.isNaN(ms) ? Number.POSITIVE_INFINITY : ms;
};


const sortByDateTimeAsc = (a: SportEvent, b: SportEvent): number => {
  const aMs = parseEventTimeMs(a);
  const bMs = parseEventTimeMs(b);
  // Invalids (+Infinity) go last
  if (!Number.isFinite(aMs) && !Number.isFinite(bMs)) return 0;
  if (!Number.isFinite(aMs)) return 1;
  if (!Number.isFinite(bMs)) return -1;
  return aMs - bMs; // earliest first
};

const sortByDateTimeDesc = (a: SportEvent, b: SportEvent): number => {
  const aMs = parseEventTimeMs(a);
  const bMs = parseEventTimeMs(b);
  // Invalids (+Infinity) go last
  if (!Number.isFinite(aMs) && !Number.isFinite(bMs)) return 0;
  if (!Number.isFinite(aMs)) return 1;
  if (!Number.isFinite(bMs)) return -1;
  return bMs - aMs; // latest first
};

// UTC midnight for a given timestamp
const startOfUTCDay = (ms: number): number => {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

/**
 * Special ordering for "other" categories:
 *  0) LIVE now (match_status === 'started')
 *  1) Later today (>= now, < tomorrow)                — ascending
 *  2) Tomorrow (>= startTomorrow, < dayAfterTomorrow) — ascending
 *  3) Later future (>= dayAfterTomorrow)              — ascending
 *  4) Older past (< yesterday)                        — descending
 *  5) Yesterday (>= yesterday, < today)               — ascending (and LAST)
 *  6) Invalid dates                                   — very last
 */
const specialSportsSort = (a: SportEvent, b: SportEvent): number => {
  const nowMs = Date.now();
  const startToday = startOfUTCDay(nowMs);
  const startTomorrow = startToday + 86400000;
  const startDayAfterTomorrow = startTomorrow + 86400000;
  const startYesterday = startToday - 86400000;

  const aMs = parseEventTimeMs(a);
  const bMs = parseEventTimeMs(b);

  const aStatus = String(a.match_status ?? a.status ?? '').toLowerCase();
  const bStatus = String(b.match_status ?? b.status ?? '').toLowerCase();

  const rank = (ms: number, status: string): number => {
    if (!Number.isFinite(ms)) return 6; // invalid last
    if (status === 'started') return 0;

    if (ms >= nowMs && ms < startTomorrow) return 1;               // later today
    if (ms >= startTomorrow && ms < startDayAfterTomorrow) return 2;// tomorrow
    if (ms >= startDayAfterTomorrow) return 3;                      // later future
    if (ms < startYesterday) return 4;                              // older past
    if (ms >= startYesterday && ms < startToday) return 5;          // yesterday
    // ms < now but today (earlier today — treat as older past just before yesterday)
    return 4;
  };

  const ra = rank(aMs, aStatus);
  const rb = rank(bMs, bStatus);

  if (ra !== rb) return ra - rb;

  // Within-bucket secondary ordering
  switch (ra) {
    case 0: // live
    case 1: // today future
    case 2: // tomorrow
    case 3: // later future
      return aMs - bMs; // earlier first
    case 4: // older past
      return bMs - aMs; // most recent past first
    case 5: // yesterday (last)
      return aMs - bMs; // earlier yesterday first (arbitrary, but stable)
    default:
      return 0;
  }
};

export default useSportsStore;
