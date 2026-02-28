import { defineStore } from 'pinia'

const useNavigationStore = defineStore('navigationStore', {
  state: () => ({
    navigationState: false,
  }),
  getters: {
    getNavigationState: (state) => state.navigationState,
  },
  actions: {
    changeNavigationState(payload: boolean) {
      this.navigationState = payload
    },
  },
})

export default useNavigationStore
