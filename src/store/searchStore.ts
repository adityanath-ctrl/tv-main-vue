import { ActionContext } from 'vuex'
import { getSearchData } from '../utils/siberapi'

export const SearchStore = {
  state: {
    searchCategories: [],

    tv: {},
    movies: {},
    series: {},
    sports: {},
    events: {},
  },
  getters: {
    getSearchCategories(state: any): any {
      return state.tv_categories
    },
    getCategoryData(state: any, payload: any): any {
      return state[payload]
    },
  },
  actions: {
    getSearchData(context: ActionContext<any, any>, playload: any): void {
      let auth = context.getters.getAuth
      let apiParams = {
        token: auth.auth.msalToken,
        query: playload.query,
      }
      getSearchData(apiParams).then((res) => {
        context.commit('resetData')

        const tv = res.data.response.tv
        const movies = res.data.response.svod_movies
        const series = res.data.response.svod_series
        const sports = res.data.response.sports
        const events = res.data.response.events

        if (tv?.length) {
          context.commit('setTV', {
            type: 'tv',
            name: 'Live TV',
            data: tv,
          })
        }

        if (movies?.length) {
          context.commit('setSVODMovies', {
            type: 'movies',
            name: 'Movies',
            data: movies,
          })
        }

        if (series?.length) {
          context.commit('setSVODSeries', {
            type: 'series',
            name: 'Series',
            data: series,
          })
        }

        if (events?.length) {
          context.commit('setEvents', {
            type: 'events',
            name: 'Events',
            data: events,
          })
        }

        // context.commit('setLiveTVCategories', res.data.response.tv_categories)
      })
    },
  },
  mutations: {
    resetData(state: any) {
      state.searchCategories = []
      state.tv = {}
      state.movies = {}
      state.series = {}
      state.sports = {}
      state.events = {}
    },
    setTV(state: any, data: any): void {
      state.searchCategories.push('tv')
      state.tv = data
    },
    setSVODMovies(state: any, data: any): void {
      state.searchCategories.push('movies')
      state.movies = data
    },
    setSVODSeries(state: any, data: any): void {
      state.searchCategories.push('series')
      state.series = data
    },
    setSports(state: any, data: any): void {
      state.searchCategories.push('sports')
      state.sports = data
    },
    setEvents(state: any, data: any): void {
      state.searchCategories.push('events')
      state.events = data
    },
  },
}
