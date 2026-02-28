import { type ActionContext   } from 'vuex'
import createPersistedState from "vuex-persistedstate";
import type Auth from '../types/authType'



interface PrivacyState {
  auth: Auth;
}

export const PrivacyStore = {
  state: {
    auth: {
      loggedIn: false,
      msalToken: '',
    }

  },
  getters: {
    getPrivacyStore(state: PrivacyState): PrivacyState {
      return state;
    }
  },
  actions: {
    setPrivacyStore(context: ActionContext<PrivacyState, any>, data: Auth): void {
      context.commit('setPrivacyStore', data);
    }
  },
  mutations: {
    setPrivacyStore(state: PrivacyState, data: Auth): void {
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
