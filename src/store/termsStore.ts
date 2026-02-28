import { type ActionContext   } from 'vuex'
import createPersistedState from "vuex-persistedstate";
import type Auth from '../types/authType'



interface TermsState {
  auth: Auth;
}

export const TermsStore = {
  state: {
    auth: {
      loggedIn: false,
      msalToken: '',
    }

  },
  getters: {
    getTermsStore(state: TermsState): TermsState {
      return state;
    }
  },
  actions: {
    setTermsStore(context: ActionContext<TermsState, any>, data: Auth): void {
      context.commit('setTermsStore', data);
    }
  },
  mutations: {
    setTermsStore(state: TermsState, data: Auth): void {
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
