import { type ActionContext   } from 'vuex'
import type Auth from '../types/authType'
import { getMenuList, getGuestToken, isTokenExpired, getConnection, showUserDevices } from '../utils/siberAPI';

interface AuthState {
    auth: Auth;
    devices?: Array<any>;
}

export const AuthStore = {
    state: {
        auth: {
            loggedIn: false,
            msalToken: "",
            tokenMode: 'guest',
            devices: []
        }
    },

    getters: {
        isUserLoggedIn(state: AuthState): boolean {
            return state.auth.tokenMode !== "guest";
        },
        getAuth(state: AuthState): Auth {
            return state.auth
        },
        getToken(state: AuthState): string {
            return state.auth.msalToken;
        }
    },
    actions: {
        setToken(context: ActionContext<AuthState, any>, playload: Auth): void {
            // ... (rest of the code)
            if (playload.tokenMode == 'guest') {
                var authToken = localStorage.getItem("authToken") || '';
                if (isTokenExpired(authToken)) {
                    getGuestToken().then(res => {
                        playload.msalToken = res.data.access_token;
                        playload.loggedIn = false;
                        localStorage.setItem("authToken", res.data.access_token);
                        context.commit('setToken', playload);
                        getConnection(res.data.access_token).then(res1 => {
                            if (res1.data.response.account.customer_id && res1.data.response.account.status != 400) {
                                getMenuList(res.data.access_token).then(res => {
                                    let accountData = res.data.response.account;
                                    let menuData = res.data.response.main_menu_items;
                                    console.log("Token Mode is GUEST authStore 1");
                                    context.dispatch('setAccount', accountData, { root: true });
                                    context.dispatch('setMainMenu', menuData, { root: true });
                                });
                            }
                            else if (res1.data.response.account.status == 400) {
                                console.log("Error 400 in login");
                            }
                        });
                    });
                } else {
                    playload.msalToken = authToken;
                    playload.loggedIn = false;
                    context.commit('setToken', playload);
                    getConnection(authToken).then(res1 => {
                        if (res1.data.response.account.customer_id && res1.data.response.account.status != 400) {
                            getMenuList(authToken).then(res => {
                                let accountData = res.data.response.account;
                                let menuData = res.data.response.main_menu_items;
                                console.log("Token Mode is GUEST authStore 2");
                                context.dispatch('setAccount', accountData, { root: true });
                                context.dispatch('setMainMenu', menuData, { root: true });
                            });
                        }
                        else if (res1.data.response.account.status == 400) {
                            console.log("Error 400 in login");
                        }
                    });
                }
            }

            else {
                if (isTokenExpired(playload.msalToken)) {
                    getGuestToken().then(res => {
                        playload.msalToken = res.data.access_token;
                        localStorage.setItem("authToken", res.data.access_token);
                        context.commit('setToken', playload);
                        getConnection(playload.msalToken).then(res1 => {
                            if (res1.data.response.account.customer_id && res1.data.response.account.status != 400) {
                                getMenuList(playload.msalToken).then(res => {
                                    window.sessionStorage.setItem("tokenMode", playload.tokenMode);
                                    let accountData = res.data.response.account;
                                    let menuData = res.data.response.main_menu_items;
                                    context.dispatch('setAccount', accountData, { root: true });
                                    context.dispatch('setMainMenu', menuData, { root: true });
                                });
                            }
                            else if (res1.data.response.account.status == 400) {
                                showUserDevices(playload.msalToken).then(res => {
                                    context.dispatch('setDevices', res.data.response.devices);
                                })
                            }
                        });
                    });
                }

                else {
                    context.commit('setToken', playload);
                    getConnection(playload.msalToken).then(res1 => {
                        if (res1.data.response.account.customer_id && res1.data.response.account.status != 400) {
                            getMenuList(playload.msalToken).then(res => {
                                window.sessionStorage.setItem("tokenMode", playload.tokenMode);
                                let accountData = res.data.response.account;
                                let menuData = res.data.response.main_menu_items;
                                context.dispatch('setAccount', accountData, { root: true });
                                context.dispatch('setMainMenu', menuData, { root: true });
                            });
                        }
                        else if (res1.data.response.account.status == 400) {
                            showUserDevices(playload.msalToken).then(res => {
                                context.dispatch('setDevices', res.data.response.devices);
                            })
                        }
                    });
                }
            }
        },
        setDevices(context: ActionContext<AuthState, any>, data: any): void {
            context.commit('setDevices', data);
        }
    },
    mutations: {
        setToken(state: AuthState, data: Auth): void {
            state.auth = data;
        },
        setDevices(state: AuthState, data: Array<any>): void {
            state.auth.devices = data;
        }
    }

}