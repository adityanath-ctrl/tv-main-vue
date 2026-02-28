import { defineStore } from 'pinia'
import { getRadioStationsByCategoryId } from '../utils/siberAPI'
import useAuthStore from './useAuthStore'

export const useRadioStationsStore = defineStore('radioStations', {
  state: () =>
    ({
      radio_stations: {}
    }) as any,
  actions: {
    async setRadioStationsByCategoryId(payload: any) {
    const authStore = useAuthStore();
      const token = authStore.getToken;
      const apiParams = {
        token: token,
        category_id: payload.CategoryId
      }

      try {
        const res = await getRadioStationsByCategoryId(apiParams)
        const radio_stations = res.data.response.radio_stations

        // Directly mutating the state
        this.radio_stations[payload.CategoryId] = radio_stations
      } catch (error) {
        console.error('Failed to fetch radio stations:', error)
      }
    }
  }
})

export default useRadioStationsStore
