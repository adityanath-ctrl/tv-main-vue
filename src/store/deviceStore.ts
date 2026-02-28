import { type ActionContext } from 'vuex'
import createPersistedState from "vuex-persistedstate";
import type Auth from '../types/authType'



interface DeviceState {
  auth: Auth;
}

export const DeviceStore = {
  state: {
    auth: {
      loggedIn: false,
      msalToken: '',
    }

  },
  getters: {
    getDeviceStore(state: DeviceState): DeviceState {
      return state;
    }
  },
  actions: {
    setDeviceStore(context: ActionContext<DeviceState, any>, data: Auth): void {
      context.commit('setDeviceStore', data);
    }
  },
  mutations: {
    setDeviceStore(state: DeviceState, data: Auth): void {
      state.auth = data;
    }
  },
  plugins: [
    // createPersistedState({
    //   auth: {
    //     // getItem: (key) => window.localStorage.getItem('signInfo'),
    //     // setItem(key, value) => commit('setToken', value)
    //   }
    // })
  ],

}
