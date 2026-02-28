import { defineStore } from 'pinia'
import { getGuestToken, getPackagesById, isTokenExpired } from '@/utils/siberAPI'
import Cookies from 'js-cookie'

interface PackageState {
  packages: any[] // Replace 'any' with a more specific type if available
}

const usePackageStore = defineStore('packageStore', {
  state: (): PackageState => ({
    packages: []
  }),
  getters: {
    getPackages: (state) => state.packages
  },
  actions: {
    async setPackages(payload: any) {
      const token = localStorage.getItem('authToken') || ''
      const apiParams = { token, packageId: payload }

      if (isTokenExpired(token)) {
        const guestTokenResponse = await getGuestToken() // Fetch guest token
        apiParams.token = guestTokenResponse.data.access_token
      }

      const res = await getPackagesById(apiParams)
      this.packages = res.data.response.packages
    }
  }
})

export default usePackageStore
