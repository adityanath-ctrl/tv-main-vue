import { defineStore } from 'pinia'
import { getGuestToken, getProviderInfo, isTokenExpired } from '@/utils/siberAPI'

interface ProviderState {
  providers: any
}

const useProviderStore = defineStore('providerStore', {
  state: (): ProviderState => ({
    providers: null
  }),
  getters: {
    getProvider: (state) => state.providers
  },
  actions: {
    async setProvider(payload: { providerId: string }) {
      const token = localStorage.getItem('authToken') || ''
      const apiParams = { token, providerId: payload.providerId }

      if (isTokenExpired(token)) {
        const guestTokenResponse = await getGuestToken() // Fetch guest token
        apiParams.token = guestTokenResponse.data.access_token
      }

      const res = await getProviderInfo(apiParams)
      this.providers = res.data
    }
  }
})

export default useProviderStore
