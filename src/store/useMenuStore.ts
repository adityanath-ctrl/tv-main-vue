import { defineStore } from 'pinia'

const useMenuStore = defineStore('menuStore', {
  state: () => ({
    SideMenus: [] as any
  }),
  actions: {
    setSideMenu(payload: any) {
      this.SideMenus = payload
    }
  }
})

export default useMenuStore
