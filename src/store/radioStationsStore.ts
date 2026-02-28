import { ActionContext } from 'vuex'
import { getRadioStationsByCategoryId } from '../utils/siberapi'

export const RadioStationsStore = {
  state: {
    radio_stations: {},
  },
  actions: {
    setRadioStationsByCategoryId(
      context: ActionContext<any, any>,
      payload: any
    ): void {
      let auth = context.getters.getAuth
      let token = auth.auth.msalToken
      if (token == '') {
        token = localStorage.getItem('authToken') || ''
      }

      let apiParams = {
        token: token,
        category_id: payload.CategoryId,
      }

      getRadioStationsByCategoryId(apiParams).then((res) => {
        let radio_stations = {
          radio_stations: res.data.response.radio_stations,
          category_id: payload.CategoryId,
        }

        context.commit('setRadioStationsByCategoryId', radio_stations)
      })
    },
  },
  mutations: {
    setRadioStationsByCategoryId(state: any, data: any): void {
      state.radio_stations[data.category_id] = data.radio_stations
    },
  },
}
