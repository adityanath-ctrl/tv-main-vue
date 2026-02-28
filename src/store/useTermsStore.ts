import { defineStore } from 'pinia'
import type Auth from '../types/authType'

const useTermsStore = defineStore('termsStore', {
  state: () => ({
    auth: {
      loggedIn: false,
      msalToken: ''
    } as Auth
  }),
  getters: {
    getTermsStore: (state) => state.auth
  },
  actions: {
    setTermsStore(data: Auth) {
      this.auth = data
    }
  }
})

export default useTermsStore
