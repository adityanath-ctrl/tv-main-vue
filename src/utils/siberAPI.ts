/* /src/utils/siberAPI.ts */
import apiClient from '@/utils/apiClient'
import {
  APPLICATION_ID,
  BASE_URL,
  MIDDLEWARE_API_URL,
  API_BASE_URL,
  DEVICE_TYPE,
  GUEST_TOKEN_API,
  EPG_START_HRS_AGO,
  EPG_END_HRS_FUTURE,
  ADD_DEVICE_REQUEST_URL,
  REDEEM_CODE,
  PACKAGE_STATUS,
  RENAME_DEVICE_NAME
} from '../mainConfig'
import { Md5 } from 'ts-md5'
import { v4 as uuidv4 } from 'uuid'
import Cookies from 'js-cookie'

const DEVICE_UUID_KEY = 'device_uuid'; // Use a constant for the key
let inMemoryUUID: string | null = null;   // In-memory fallback for the current session

export const getUUID = (): string => {
  // 1. Try to get from in-memory variable first (fastest)
  if (inMemoryUUID) {
    return inMemoryUUID;
  }

  // 2. Try to get from localStorage (the preferred persistent storage)
  try {
    const uuidFromLocalStorage = localStorage.getItem(DEVICE_UUID_KEY);
    if (uuidFromLocalStorage) {
      inMemoryUUID = uuidFromLocalStorage;
      // When found, ensure the domain cookie is also set/synced correctly
      // ** NEW: Added domain attribute **
      Cookies.set(DEVICE_UUID_KEY, uuidFromLocalStorage, {
        expires: 365 * 10,
        domain: BASE_URL
      });
      return uuidFromLocalStorage;
    }
  } catch (e) {
    console.warn('Could not access localStorage. It might be disabled.');
  }

  // 3. Try to get from cookies (the fallback persistent storage)
  const uuidFromCookie = Cookies.get(DEVICE_UUID_KEY) || Cookies.get('uuid');
  if (uuidFromCookie) {
    inMemoryUUID = uuidFromCookie;
    // When found in cookie, sync it back to localStorage for faster access next time
    try {
      localStorage.setItem(DEVICE_UUID_KEY, uuidFromCookie);
    } catch (e) {
      // localStorage is still disabled, but that's okay.
    }
    return uuidFromCookie;
  }

  // 4. If not found anywhere, generate a new UUID
  const newUUID = Md5.hashStr(uuidv4()).slice(0, 20);
  console.log('Generating new persistent device UUID for domain:', BASE_URL, newUUID);

  // 5. Try to save the new UUID to all available storage mechanisms
  inMemoryUUID = newUUID;
  try {
    localStorage.setItem(DEVICE_UUID_KEY, newUUID);
  } catch (e) {
    // Failed to save to localStorage, but we'll still try cookies.
  }
  // ** NEW: Added domain attribute when setting the new cookie **
  Cookies.set(DEVICE_UUID_KEY, newUUID, {
    expires: 365 * 10,
    domain: BASE_URL
  });
  
  return newUUID;
};

export function getApiData(url: string, token?: string) {
  return apiClient.get(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
    .then((response) => {
      if (response.status === 200 && response.data) {
        return {
          data: response.data,
          status: response.status,
          message: `Fetching API successful` // Generic message, or could be more specific if needed
        };
      } else {
        throw new Error(`Unexpected response format: ${JSON.stringify(response)}`);
      }
    })
    .catch((error) => {
      console.error('API Error (GET):', error);
      // If error has a sessionExpired flag from the interceptor, propagate it
      if (error && (error as any).sessionExpired) {
        return Promise.reject(error); // Reject to allow higher-level catch
      }
      return {
        data: null,
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'An error occurred while fetching API data'
      };
    });
}

export function putApiData(data: object, url: string, token?: string) { // Signature: data, url, token
  // console.log('PUT request body:', JSON.stringify(data));
  // console.log('PUT request URL:', url);

  return apiClient.put(url, data, {
    headers: token
      ? {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
      : {
        'Content-Type': 'application/json'
      }
  })
    .then((response) => {
      if (response.status === 200 && response.data) {
        return {
          data: response.data,
          status: response.status,
          message: `PUT API successful` // Generic message
        };
      } else {
        throw new Error(`Unexpected response format: ${JSON.stringify(response)}`);
      }
    })
    .catch((error) => {
      console.error('API Error (PUT):', error);
      // If error has a sessionExpired flag from the interceptor, propagate it
      if (error && (error as any).sessionExpired) {
        return Promise.reject(error); // Reject to allow higher-level catch
      }
      return {
        data: null,
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'An error occurred while updating data'
      };
    });
}

export function postApiData(data: object, url: string, token?: string) { // Signature: data, url, token
  // console.log('POST request body:', JSON.stringify(data));
  // console.log('POST request URL:', url);

  return apiClient
    .post(url, data, {
      headers: token
        ? {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
        : {
          'Content-Type': 'application/json'
        }
    })
    .then((response) => {
      if ((response.status === 200 || response.status === 201) && response.data) { // 201 is also common for POST success
        return {
          data: response.data,
          status: response.status,
          message: response.data.message || 'POST API successful'
        }
      } else {
        throw new Error(`Unexpected response format: ${JSON.stringify(response)}`)
      }
    })
    .catch((error) => {
      console.error('API Error (POST):', error)
      // If error has a sessionExpired flag from the interceptor, propagate it
      if (error && (error as any).sessionExpired) {
        return Promise.reject(error); // Reject to allow higher-level catch
      }
      return {
        data: null,
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'An error occurred while posting data'
      }
    })
}

// --- Specific API endpoint functions refactored ---

export const addDeviceRequest = (userMiddlewareId: string | number, customToken?: string) => {
  const token = customToken;
  const bodyData = {
    user_middleware_id: userMiddlewareId,
    application_id: APPLICATION_ID,
    device_id: getUUID(),
    device: DEVICE_TYPE,
    request_mode: localStorage.getItem('deviceMode'),
    request_country: localStorage.getItem('deviceCountry'),
    request_ip: localStorage.getItem('deviceIp')
  };
  const url = API_BASE_URL + ADD_DEVICE_REQUEST_URL;
  return postApiData(bodyData, url, token);
}

export const redeemCode = (code: string, mode: string, userMiddlewareId: string | number, customToken?: string) => {
  const token = customToken;
  const bodyData = {
    user_middleware_id: userMiddlewareId,
    application_id: APPLICATION_ID,
    device_id: getUUID(),
    device: DEVICE_TYPE,
    code: code,
    mode: mode
  };
  const url = API_BASE_URL + REDEEM_CODE;
  return postApiData(bodyData, url, token);
}

export const packageStatus = (userMiddlewareId: string | number, customToken?: string) => {
  const token = customToken;
  const bodyData = {
    user_middleware_id: userMiddlewareId, // Use the passed-in ID
    application_id: APPLICATION_ID,
    device_id: getUUID(),
    device: DEVICE_TYPE
  };
  const url = API_BASE_URL + PACKAGE_STATUS;
  return postApiData(bodyData, url, token);
}

export const getGuestToken = () => {
  // GUEST_TOKEN_API should be a full URL.
  // The apiClient interceptor will attempt to add an auth token,
  // but the /guest-token endpoint should ideally ignore it if not needed.
  return getApiData(GUEST_TOKEN_API); // No explicit token passed
}

export const getConnection = (customToken?: string) => {
  const token = customToken;
  const queryParams = new URLSearchParams({
    device_id: getUUID(),
    device: DEVICE_TYPE,
    application_id: APPLICATION_ID
  }).toString();
  const url = `${MIDDLEWARE_API_URL}Connect?${queryParams}`;
  return getApiData(url, token);
}

export const showUserDevices = (customToken?: string) => {
  const token = customToken;
  const queryParams = new URLSearchParams({
    device_id: getUUID(),
    application_id: APPLICATION_ID
  }).toString();
  const url = `${MIDDLEWARE_API_URL}Users/Devices?${queryParams}`;
  return getApiData(url, token);
}

export const renameDeviceName = (customToken: string, device_to_rename_id: string, nickname: string) => {
  const token = customToken;
  const queryParams = new URLSearchParams({
    device_id: getUUID(),
    application_id: APPLICATION_ID,
    rename_device_id: device_to_rename_id || '0' // Assuming '0' or similar for current device if id is null
  }).toString();

  const url = `${MIDDLEWARE_API_URL}${RENAME_DEVICE_NAME}?${queryParams}`;
  const bodyData = {
    device_nickname: nickname
  };
  return putApiData(bodyData, url, token);
}

export function signout(customToken?: string, device_to_remove_id: string | null = null) {
  const token = customToken;
  const queryParams = new URLSearchParams({
    device_id: getUUID(),
    application_id: APPLICATION_ID,
    remove_device_id: device_to_remove_id || '0'
  }).toString();
  const url = `${MIDDLEWARE_API_URL}Users/Devices/Remove?${queryParams}`;
  return getApiData(url, token); // Assuming this is a GET, if it's DELETE, create deleteApiData
}

export function activateDevice(customToken?: string, device_to_enable_id: string | null = null) {
  const token = customToken;
  const queryParams = new URLSearchParams({
    device_id: getUUID(),
    application_id: APPLICATION_ID,
    enable_device_id: device_to_enable_id || '0'
  }).toString();
  const url = `${MIDDLEWARE_API_URL}Users/Devices/Enable?${queryParams}`;
  return getApiData(url, token); // Assuming GET, adjust if it's POST/PUT
}

export function deactivateDevice(customToken?: string, device_to_disable_id: string | null = null) {
  const token = customToken;
  const queryParams = new URLSearchParams({
    device_id: getUUID(),
    application_id: APPLICATION_ID,
    disable_device_id: device_to_disable_id || '0'
  }).toString();
  const url = `${MIDDLEWARE_API_URL}Users/Devices/Disable?${queryParams}`;
  return getApiData(url, token); // Assuming GET, adjust if it's POST/PUT
}

export const getMenuList = (customToken?: string) => {
  const token = customToken;
  const queryParams = new URLSearchParams({
    action: 'view_list',
    device_id: getUUID(),
    device: DEVICE_TYPE,
    application_id: APPLICATION_ID
  }).toString();
  const url = `${MIDDLEWARE_API_URL}Menu?${queryParams}`;
  return getApiData(url, token);
}

interface VideoApiParams {
  token?: string;
  limit?: string | number;
  type?: string;
  category_id?: string; // This is for the URL path segment
  videoId?: string;
  vodId?: string;
  eventId?: string;
  packageId?: string;
  providerId?: string; // This was already here, perhaps for a different purpose or content provider ID for other APIs?
  // If this 'providerId' is THE content provider ID you want to use, ensure consistency.
  // Let's assume for the new sports filtering, we'll use a distinct 'contentProviderId'
  // to avoid confusion if 'providerId' is used differently elsewhere.
  // If they are the same concept, just ensure the name matches.

  contentProviderId?: number; // <<< ADDED THIS FOR CLARITY for the sports filter
  // If props.category.menu_item_content_provider is the one, this should be its type
  query?: string;
  // Allow any other string-keyed properties if needed for flexibility
  [key: string]: string | number | undefined;
}

export const getContinueWatchingContent = (apiParams: VideoApiParams) => {
  const token = apiParams.token;
  const params = new URLSearchParams({
    device_id: getUUID(),
    device: DEVICE_TYPE,
    application_id: APPLICATION_ID
  });
  if (apiParams.limit) params.set('limit', String(apiParams.limit));
  if (apiParams.type) params.set('type', apiParams.type);

  const url = `${MIDDLEWARE_API_URL}Video/ContinueWatching?${params.toString()}`;
  return getApiData(url, token);
}

export const getRecentlyWatchedContent = (apiParams: VideoApiParams) => {
  const token = apiParams.token;
  const params = new URLSearchParams({
    device_id: getUUID(),
    device: DEVICE_TYPE,
    application_id: APPLICATION_ID
  });
  if (apiParams.limit) params.set('limit', String(apiParams.limit));

  const url = `${MIDDLEWARE_API_URL}Video/RecentlyWatched?${params.toString()}`;
  return getApiData(url, token);
}

export const getLiveTVByCategoryId = (apiParams: VideoApiParams) => {
  const token = apiParams.token;
  const queryParams = new URLSearchParams({
    device_id: getUUID(),
    device: DEVICE_TYPE,
    application_id: APPLICATION_ID
  }).toString();

  let path = 'Channels';
  if (apiParams.category_id) {
    path = `Channels/Category/${apiParams.category_id}`;
  }
  const url = `${MIDDLEWARE_API_URL}${path}?${queryParams}`;
  return getApiData(url, token);
}

export const getEPGNowTime = (apiParams: Pick<VideoApiParams, 'token'>) => {
  const token = apiParams.token;
  const startTime = new Date().getTime();
  const endTime = startTime + 18000000; // Plus 5 hours

  const queryParams = new URLSearchParams({
    device_id: getUUID(),
    device: DEVICE_TYPE,
    application_id: APPLICATION_ID,
    start: String(startTime),
    end: String(endTime)
  }).toString();
  const url = `${MIDDLEWARE_API_URL}Epg/Now/?${queryParams}`;
  return getApiData(url, token);
}

export const getEPGTime = (apiParams: Pick<VideoApiParams, 'token'>) => {
  const token = apiParams.token;
  const startTime = new Date().getTime() - EPG_START_HRS_AGO * 60 * 60 * 1000;
  const endTime = new Date().getTime() + EPG_END_HRS_FUTURE * 60 * 60 * 1000;

  const queryParams = new URLSearchParams({
    device_id: getUUID(),
    device: DEVICE_TYPE,
    application_id: APPLICATION_ID,
    start: String(startTime),
    end: String(endTime)
  }).toString();
  const url = `${MIDDLEWARE_API_URL}Epg?${queryParams}`;
  return getApiData(url, token);
}

export const getChannelCategories = (apiParams: Pick<VideoApiParams, 'token'>) => {
  const token = apiParams.token;
  const queryParams = new URLSearchParams({
    device_id: getUUID(),
    device: DEVICE_TYPE,
    application_id: APPLICATION_ID
  }).toString();
  const url = `${MIDDLEWARE_API_URL}Channels/Categories?${queryParams}`;
  return getApiData(url, token);
}

export const getRadioStationsByCategoryId = (apiParams: VideoApiParams) => {
  const token = apiParams.token;
  const queryParams = new URLSearchParams({
    device_id: getUUID(),
    device: DEVICE_TYPE,
    application_id: APPLICATION_ID
  }).toString();
  const url = `${MIDDLEWARE_API_URL}Radio/Category/${apiParams.category_id}?${queryParams}`;
  return getApiData(url, token);
}

export const getChannels = (apiParams: Pick<VideoApiParams, 'token'>) => {
  const token = apiParams.token;
  const queryParams = new URLSearchParams({
    device_id: getUUID(),
    device: DEVICE_TYPE,
    application_id: APPLICATION_ID
  }).toString();
  const url = `${MIDDLEWARE_API_URL}Channels?${queryParams}`;
  return getApiData(url, token);
}

export const getLiveEventsByCategoryId = (apiParams: VideoApiParams) => {
  const token = apiParams.token;
  const queryParams = new URLSearchParams({
    device_id: getUUID(),
    device: DEVICE_TYPE,
    application_id: APPLICATION_ID
  }).toString();
  const url = `${MIDDLEWARE_API_URL}Events/Category/${apiParams.category_id}?${queryParams}`;
  return getApiData(url, token);
}

export const getSVODByCategoryId = (apiParams: VideoApiParams) => {
  const token = apiParams.token;

  const params = new URLSearchParams({
    device_id: getUUID(),
    device: DEVICE_TYPE,
    application_id: APPLICATION_ID,
    category_id: apiParams.category_id || ''
  });
  // NEW: only add limit if explicitly provided
  if (apiParams.limit != null) {
    params.set('limit', String(apiParams.limit));
  }
  const url = `${MIDDLEWARE_API_URL}Video/Movies/${apiParams.category_id}?${params.toString()}`;
  return getApiData(url, token);
}


export const getSVODById = (apiParams: VideoApiParams) => {
  const token = apiParams.token;
  const queryParams = new URLSearchParams({
    device_id: getUUID(),
    device: DEVICE_TYPE,
    application_id: APPLICATION_ID,
    movie_id: apiParams.vodId || ''
  }).toString();
  const url = `${MIDDLEWARE_API_URL}Video/MovieDetails?${queryParams}`;
  return getApiData(url, token);
}

export const getEventDetail = (apiParams: VideoApiParams) => {
  const token = apiParams.token;
  const queryParams = new URLSearchParams({
    device_id: getUUID(),
    device: DEVICE_TYPE,
    application_id: APPLICATION_ID
  }).toString();
  const url = `${MIDDLEWARE_API_URL}Events/${apiParams.eventId}?${queryParams}`;
  return getApiData(url, token); // Changed from getRemoteAPIData to standardized getApiData
}

export const getMovieDetail = (apiParams: VideoApiParams) => {
  const token = apiParams.token;
  const queryParams = new URLSearchParams({
    device_id: getUUID(),
    device: DEVICE_TYPE,
    application_id: APPLICATION_ID,
    movie_id: apiParams.vodId || ''
  }).toString();
  const url = `${MIDDLEWARE_API_URL}Video/MovieDetails?${queryParams}`;
  return getApiData(url, token); // Changed from getRemoteAPIData
}

export const getSVODSeriesById = (apiParams: VideoApiParams) => {
  const token = apiParams.token;
  const queryParams = new URLSearchParams({
    device_id: getUUID(),
    device: DEVICE_TYPE,
    application_id: APPLICATION_ID,
    seriesid: apiParams.vodId || '' // Assuming vodId is seriesid here
  }).toString();
  const url = `${MIDDLEWARE_API_URL}Video/SeriesDetails?${queryParams}`;
  return getApiData(url, token);
}

export const getPackagesById = (apiParams: VideoApiParams) => {
  const token = apiParams.token;
  const queryParams = new URLSearchParams({
    device_id: getUUID(),
    device: DEVICE_TYPE,
    application_id: APPLICATION_ID
  }).toString();
  const url = `${MIDDLEWARE_API_URL}Video/Packages/${apiParams.packageId}?${queryParams}`;
  return getApiData(url, token);
}

export const getProviderInfo = (apiParams: VideoApiParams) => {
  const token = apiParams.token;
  const queryParams = new URLSearchParams({
    device_id: getUUID(),
    device: DEVICE_TYPE,
    application_id: APPLICATION_ID,
    content_provider: apiParams.providerId || ''
  }).toString();
  const url = `${MIDDLEWARE_API_URL}Instance/ContentProviders?${queryParams}`;
  return getApiData(url, token);
}

export const getEventsByContentProviderId = (apiParams: VideoApiParams) => {
  const token = apiParams.token;
  const queryParams = new URLSearchParams({
    device_id: getUUID(),
    device: DEVICE_TYPE,
    application_id: APPLICATION_ID
  }).toString();
  const url = `${MIDDLEWARE_API_URL}Events/ContentProvider/${apiParams.providerId}?${queryParams}`;
  return getApiData(url, token);
}

export const getSeriesByContentProviderId = (apiParams: VideoApiParams) => {
  const token = apiParams.token;
  const queryParams = new URLSearchParams({
    device_id: getUUID(),
    device: DEVICE_TYPE,
    application_id: APPLICATION_ID,
    content_provider: apiParams.providerId || '',
    series: 'true'
  }).toString();
  const url = `${MIDDLEWARE_API_URL}Video/Movies?${queryParams}`; // Endpoint seems generic, filtered by params
  return getApiData(url, token);
}

export const getFilmsByContentProviderId = (apiParams: VideoApiParams) => {
  const token = apiParams.token;
  const queryParams = new URLSearchParams({
    device_id: getUUID(),
    device: DEVICE_TYPE,
    application_id: APPLICATION_ID,
    content_provider: apiParams.providerId || '',
    movies: 'true'
  }).toString();
  const url = `${MIDDLEWARE_API_URL}Video/Movies?${queryParams}`; // Endpoint seems generic
  return getApiData(url, token);
}

export const getSportsByCategory = (apiParams: VideoApiParams) => {
  const token = apiParams.token;
  const queryParamsObj: Record<string, string> = {
    device_id: getUUID(),
    device: DEVICE_TYPE,
    application_id: APPLICATION_ID,
  };

  // Conditionally add content_provider to the query parameters object
  // Use the correct property name from apiParams (contentProviderId)
  // and ensure the query parameter key matches what your API expects (e.g., "content_provider")
  if (apiParams.contentProviderId !== undefined && apiParams.contentProviderId !== null) {
    queryParamsObj.content_provider = String(apiParams.contentProviderId); // API usually expects string query params
  }

  const queryParams = new URLSearchParams(queryParamsObj).toString();

  // Ensure apiParams.category_id is used directly as it should be a string already
  // (as per the updated useSportsStore which sends String(payload.CategoryId))
  const url = `${MIDDLEWARE_API_URL}Sports/Category/${apiParams.category_id}?${queryParams}`;

  console.log(`siberAPI: getSportsByCategory - Calling URL: ${url}, Token: ${token ? 'Present' : 'Absent'}`);

  return getApiData(url, token); // Assuming getApiData handles the actual fetch
};

// Subscription related functions
const getSubscriptionGeneric = (apiParams: VideoApiParams, pathSegment: string) => {
  const token = apiParams.token;
  const queryParams = new URLSearchParams({
    device_id: getUUID(),
    device: DEVICE_TYPE,
    application_id: APPLICATION_ID,
    content_provider: apiParams.providerId || ''
  }).toString();
  const url = `${MIDDLEWARE_API_URL}${pathSegment}/Packages?${queryParams}`;
  return getApiData(url, token);
};

export const getSubscriptionSVOD = (apiParams: VideoApiParams) => {
  return getSubscriptionGeneric(apiParams, 'Video');
}
export const getSubscriptionLiveTV = (apiParams: VideoApiParams) => {
  return getSubscriptionGeneric(apiParams, 'Channels');
}
export const getSubscriptionSports = (apiParams: VideoApiParams) => {
  return getSubscriptionGeneric(apiParams, 'Sports');
}
export const getSubscriptionEvents = (apiParams: VideoApiParams) => {
  return getSubscriptionGeneric(apiParams, 'Events');
}

export const getSearchData = (apiParams: VideoApiParams) => {
  const token = apiParams.token;
  const queryParams = new URLSearchParams({
    device_id: getUUID(),
    device: DEVICE_TYPE,
    application_id: APPLICATION_ID,
    search: apiParams.query || ''
  }).toString();
  const url = `${MIDDLEWARE_API_URL}Search/?${queryParams}`;
  return getApiData(url, token);
}


// --- Utility functions (largely unchanged but kept for completeness) ---
export const isTokenExpired = (authToken: string | null | undefined): boolean => {
  // console.log('===== isTokenExpired Start =====');
  // console.log('authToken', authToken);

  if (!authToken) return true;

  try {
    const base64Url = authToken.split('.')[1];
    if (!base64Url) return true; // Invalid token format

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const { exp } = JSON.parse(jsonPayload);
    if (typeof exp !== 'number') return true; // Invalid 'exp' claim

    const expired = Date.now() >= exp * 1000;
    // console.log('isTokenExpired = ', expired);
    return expired;
  } catch (e) {
    console.error('Failed to decode or parse token:', e);
    return true; // Treat as expired if parsing fails
  }
};

// --- Watching API (movies + series episodes share the same endpoint) ---
export interface WatchVideoParams {
  token?: string;
  vodId: string | number;           // movie id OR episode id
  resume_ms?: number;               // milliseconds
  movie_duration_ms?: number;       // milliseconds (optional for series)
  keepalive?: boolean;              // pagehide/unload best-effort
}

/** Internal: build the URL for play/stop */
const buildWatchingUrl = (
  action: 'play' | 'stop',
  vodId: string | number,
  opts?: { resume_ms?: number; movie_duration_ms?: number }
) => {
  const q = new URLSearchParams();
  q.set('action', action);
  q.set('device_id', getUUID());
  q.set('device', DEVICE_TYPE);
  q.set('application_id', String(APPLICATION_ID));
  q.set('movie_id', String(vodId)); // backend expects "movie_id" even for episodes

  if (action === 'stop' && opts) {
    if (Number.isFinite(opts.resume_ms as number)) {
      q.set('resume', String(Math.max(0, Math.floor(Number(opts.resume_ms)))));
    }
    if (Number.isFinite(opts.movie_duration_ms as number)) {
      q.set('movie_duration', String(Math.max(0, Math.floor(Number(opts.movie_duration_ms)))));
    }
  }

  return `${MIDDLEWARE_API_URL}Video/Watching?${q.toString()}`;
};

/** Play (fire-and-forget GET) */
export const watchVideoPlay = (params: WatchVideoParams) => {
  const { token, vodId } = params;
  const url = buildWatchingUrl('play', vodId);
  return getApiData(url, token);
};

/** Stop/Progress (ms). Uses sendBeacon on keepalive for pagehide/unload. */
export const watchVideoStop = async (params: WatchVideoParams) => {
  const { token, vodId, resume_ms, movie_duration_ms, keepalive } = params;
  const url = buildWatchingUrl('stop', vodId, { resume_ms, movie_duration_ms });

  // Best-effort delivery when the page is closing
  if (keepalive && typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
    try {
      // No body required by backend; empty blob keeps content-type valid
      navigator.sendBeacon(url, new Blob([], { type: 'text/plain' }));
      return { data: null, status: 204, message: 'Beacon sent' };
    } catch {
      // fall through to normal GET if beacon fails
    }
  }

  return getApiData(url, token);
};
