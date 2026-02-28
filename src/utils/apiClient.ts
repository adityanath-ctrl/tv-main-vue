import axios from 'axios'
import { renewTokenIfNeeded } from './authUtils'

const apiClient = axios.create({});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await renewTokenIfNeeded();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      const err = error as any; // assert type as any so we can access error.errorCode
      if (err.errorCode === "interaction_required") {
        //console.log("Token expired - triggering login popup");
        // Reject with a custom error object so that the frontend view can pick it up
        return Promise.reject({
          sessionExpired: true,
          message: "Session expired. Please log in again."
        });
      }
      //console.error("Token renewal interceptor error:", error);
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error)
);

export default apiClient;
