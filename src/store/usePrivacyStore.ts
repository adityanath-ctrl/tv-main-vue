import { defineStore } from 'pinia'
import type Auth from '../types/authType'

const usePrivacyStore = defineStore('privacyStore', {
  state: () => ({
    auth: {
      loggedIn: false,
      msalToken: ''
    } as Auth
  }),
  getters: {
    getPrivacyStore: (state) => state.auth
  },
  actions: {
    setPrivacyStore(data: Auth) {
      this.auth = data
    }
  }
})

export default usePrivacyStore
