import { ActionContext } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import Auth from '../types/authType'
import TVChannel from '@/types/tvChannelType'
import TVCategory from '@/types/tvCategoriesType'
import { getLiveTVByCategoryId, getEPGNowTime } from '../utils/siberapi'

export const LiveStore = {
  state: {
    tv_categories: [],
    tv_channels: {},
    epg_map: {},
  },
  getters: {
    getLiveTVCategory(state: any): any {
      return state.tv_categories
    },
    getLiveTVChannel(state: any): any {
      return state.tv_channels
    },
    // getLiveEventsByCategoryId(state: Auth): Auth{
    //   return state;
    // },
    // getLiveEventById(state: Auth): Auth{
    //   return state;
    // },
    // getNPVRStatus(state: Auth): Auth{
    //   return state;
    // },
    // getEPGCurrent(state: Auth): Auth{
    //   return state;
    // },
    // getEPGAll(state: Auth): Auth{
    //   return state;
    // },
    // getEPGByChannelId(state: Auth): Auth{
    //   return state;
    // },
    // getEPGBySearch(state: Auth): Auth{
    //   return state;
    // }
  },
  actions: {
    getEPGNowTime(context: ActionContext<any, any>) {
      let auth = context.getters.getAuth
      let apiParams = {
        token: auth.auth.msalToken,
      }

      getEPGNowTime(apiParams).then((res) => {
        const epgMap = res.data.reduce((map: any, data: any) => {
          if (!map[data.id]) map[data.id] = {}

          map[data.id].epg = data
          return map
        }, {})

        context.commit('setEPGMap', epgMap)
      })
    },
    getLiveTVByCategoryId(
      context: ActionContext<any, any>,
      playload: any
    ): void {
      let auth = context.getters.getAuth
      let apiParams = {
        token: auth.auth.msalToken,
        category_id: Number(playload.CategoryId),
      }

      getLiveTVByCategoryId(apiParams).then((res) => {
        context.commit('setLiveTVByCategoryId', {
          data: res.data.response?.tv_channel || [],
          category_id: apiParams.category_id,
        })
        if (res.data.response?.tv_categories) {
          context.commit(
            'setLiveTVCategories',
            res.data.response?.tv_categories
          )
        }
      })
    },
  },
  mutations: {
    setLiveTVByCategoryId(state: any, data: any): void {
      state.tv_channels[data.category_id] = data.data.sort(sortByBkpPosition)
    },
    setLiveTVCategories(state: any, data: any): void {
      state.tv_categories = data
    },
    setEPGMap(state: any, data: any): void {
      state.epg_map = data
    },
  },
  // plugins: [
  //   // createPersistedState({
  //   //   auth: {
  //   //     // getItem: (key) => window.localStorage.getItem('signInfo'),
  //   //     // setItem(key, value) => commit('setToken', value)
  //   //   }
  //   // })
  // ],
}

const sortByBkpPosition = (a: any, b: any) => {
  if (a.bkp_position < b.bkp_position) {
    return -1
  }
  if (a.bkp_position > b.bkp_position) {
    return 1
  }
  return 0
}
