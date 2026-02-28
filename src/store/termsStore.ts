import { ActionContext } from 'vuex'
import createPersistedState from "vuex-persistedstate";
import Auth from '../types/authType'



export const TermsStore = {
  state: {
    auth: {
      loggedIn: false,
      msalToken: '',
    }
    
  },
  getters: {
    getTermsStore(state: Auth): Auth{
      return state;
    } 
  },
  actions: { 
    setTermsStore(context: ActionContext<Auth, Auth>, data: Auth): void{
      context.commit('setTermsStore', data);
    }
  },
  mutations: {
    setTermsStore(state: Auth, data: Auth): void{
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
