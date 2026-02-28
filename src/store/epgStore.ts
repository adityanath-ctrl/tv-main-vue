import { ActionContext } from 'vuex'
import {
  getChannelCategories,
  getEPGTime,
  getChannels,
} from '../utils/siberapi'

export const EPGStore = {
  state: {
    channelCategories: [],
    epgChannelListMap: [],
  },
  getters: {
    getEPGChannelListMap(state: any) {
      return state.epgChannelListMap
    },
  },
  actions: {
    async getChannelCategories(
      context: ActionContext<any, any>
    ): Promise<void> {
      let auth = context.getters.getAuth
      let apiParams = {
        token: auth.auth.msalToken,
      }

      const catResult = await getChannelCategories(apiParams)
      let categories = [
        {
          cat_name_short: 'All Channels',
          cat_id: '-1',
          cat_position: 0,
        },
      ].concat(catResult.data.response?.categories || [])

      const epgResult = await getEPGTime(apiParams)
      const epgArray = epgResult.data
      if (!epgArray) return

      const channelsResult = await getChannels(apiParams)

      const channelsList = channelsResult.data?.response?.tv_channel
      if (!channelsList) return

      // Only keep categories for which channel is available
      categories = categories.filter(
        ({ cat_id }) =>
          cat_id === '-1' ||
          channelsList.find(
            ({ tv_category_id }: any) =>
              String(tv_category_id) === String(cat_id)
          )
      )

      context.commit('setChannelCategories', categories)

      const epgChannelListMap = []

      for (const epgObj of epgArray) {
        let programsList = epgObj.programs || []

        const channelId = epgObj.id

        for (const foundChannel of channelsList) {
          if (String(foundChannel.id) === String(channelId)) {
            // If not EPG available
            if (!programsList?.length) {
              programsList = []

              let nowMillis = new Date().getTime()
              let epgStart = nowMillis - 24 * 60 * 60 * 1000
              let epgEnd = nowMillis + 4 * 60 * 60 * 1000

              let diff = epgEnd - epgStart
              let seconds = diff / 1000
              let minutes = seconds / 60
              let hours = minutes / 60
              let totalHours = hours * 2

              let duration = epgStart
              for (let k = 0; k < totalHours; k++) {
                const channelProgram = {
                  progStart_time: duration,
                  progStop_time: (duration += 0.5 * 60 * 60 * 1000),
                  progName: 'No EPG Data Available',
                }

                programsList.push(channelProgram)
              }
            }

            programsList.forEach((program: any) => {
              program.uuid = crypto.randomUUID()
            })

            epgChannelListMap.push({
              channel: foundChannel,
              programs: programsList,
            })

            break
          }
        }
      }

      context.commit('setEPGChannelListMap', epgChannelListMap)
    },
  },
  mutations: {
    setChannelCategories(state: any, data: any): void {
      state.channelCategories = data
    },
    setEPGChannelListMap(state: any, data: any): void {
      state.epgChannelListMap = data
    },
  },
}
