import Auth from '../types/authType'
import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import Cookies from 'js-cookie'
import { AuthStore } from './authStore'
import { AccountStore } from './accountStore'
import { MenuStore } from './menuStore'
import { LiveStore } from './liveStore'
import { EPGStore } from './epgStore'
import { SearchStore } from './searchStore'
import { EventsStore } from './eventStore'
import { SVODStore } from './svodStore'
import { SportStore } from './sportStore'
import { DeviceStore } from './deviceStore'
import { NavigationStore } from './navigationStore'
import { PackageStore } from './packageStore'
import { ProviderStore } from './providerStore'
import { RadioStationsStore } from './radioStationsStore'

interface storeTypes extends Auth {}
export const key: InjectionKey<Store<storeTypes>> = Symbol()

export const store = createStore<storeTypes>({
  modules: {
    AuthStore,
    AccountStore,
    MenuStore,
    LiveStore,
    EPGStore,
    SearchStore,
    EventsStore,
    SVODStore,
    SportStore,
    DeviceStore,
    NavigationStore,
    PackageStore,
    ProviderStore,
    RadioStationsStore,
  },
  plugins: [
    createPersistedState({
      storage: {
        getItem: (key) => Cookies.get(key),
        setItem: (key, value) =>
          Cookies.set(key, value, { expires: 730, secure: true }), // 730 days = 2 years
        removeItem: (key) => Cookies.remove(key),
      },
    }),
  ],
})
