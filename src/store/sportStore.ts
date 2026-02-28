import { ActionContext } from 'vuex'
import { getSportsByCategory } from '../utils/siberapi'

export const SportStore = {
  state: {
    sports_events: [],
  },
  actions: {
    getLiveSportsByCategoryId(context: ActionContext<any, any>, payload: any) {
      let auth = context.getters.getAuth
      let apiParams = {
        token: auth.auth.msalToken,
        category_id: Number(payload.CategoryId),
      }

      getSportsByCategory(apiParams).then((res) => {
        const events = res.data.response.sport_events.sort(sortByDateTime)

        context.commit('setSportsEvents', {
          data: events || [],
          category_id: apiParams.category_id,
        })
      })
    },
  },
  mutations: {
    setSportsEvents(state: any, data: any): void {
      state.sports_events[data.category_id] = data.data
    },
  },
}

const sortByDateTime = (a: any, b: any) => {
  if (a.datetime > b.datetime) {
    return -1
  }
  if (a.datetime < b.datetime) {
    return 1
  }
  return 0
}
