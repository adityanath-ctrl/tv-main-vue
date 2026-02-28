import { ActionContext } from 'vuex'
import createPersistedState from "vuex-persistedstate";
import Auth from '../types/authType'



export const DeviceStore = {
  state: {
    auth: {
      loggedIn: false,
      msalToken: '',
    }
    
  },
  getters: {
    getDeviceStore(state: Auth): Auth{
      return state;
    } 
  },
  actions: { 
    setDeviceStore(context: ActionContext<Auth, Auth>, data: Auth): void{
      context.commit('setDeviceStore', data);
    }
  },
  mutations: {
    setDeviceStore(state: Auth, data: Auth): void{
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
