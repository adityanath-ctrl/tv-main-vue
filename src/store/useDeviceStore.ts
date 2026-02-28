import { defineStore } from 'pinia'
import type Auth from '../types/authType'

interface AccountLimits {
  application_id: number;
  origin: string;
  user_concurrent_stream_limit: number;
  user_dvr_usage_limit: number;
  user_id: number;
  user_mobile_device_limit: number;
  user_mobile_devices: number;
  user_profile_limit: number;
  user_stb_device_limit: number;
  user_stb_devices: number;
}

interface Account {
  account_limits: AccountLimits;
  customer_id: number;
  child: boolean;
  client_ip: string;
  status: number;
  message: string;
  max_vod_rating: string;
  max_tv_rating: string;
  languages: string[];
  user_name: string;
  user_email: string;
  user_username: string;
  user_device_id: number;
  user_gender: string;
  user_age: string;
  dvr_usage_limit: number;
  dvr_usage: number;
  test_account: number;
  block_tvod: number;
  block_svod: number;
  block_ppv: number;
  npvr_status: number;
  catchup_status: number;
  restart_status: number;
  vod_status: number;
  token: string;
  wmsAuthSign: string;
  system_state: boolean;
  property_id: number;
  property_building: string;
  property_apartment: string;
  property_name: string;
  property_image: string;
  property_background_image: string;
  property_media_url: string;
  property_vast_url: string;
  ui_type: string;
  profiles: any[];
  messages: any[];
}

const defaultAccount: Account = {
  account_limits: {
    application_id: 1,
    origin: '',
    user_concurrent_stream_limit: 0,
    user_dvr_usage_limit: 0,
    user_id: 0,
    user_mobile_device_limit: 0,
    user_mobile_devices: 0,
    user_profile_limit: 0,
    user_stb_device_limit: 0,
    user_stb_devices: 0
  },
  customer_id: 0,
  child: false,
  client_ip: '',
  status: 0,
  message: '',
  max_vod_rating: '',
  max_tv_rating: '',
  languages: [],
  user_name: '',
  user_email: '',
  user_username: '',
  user_device_id: 0,
  user_gender: '',
  user_age: '',
  dvr_usage_limit: 0,
  dvr_usage: 0,
  test_account: 0,
  block_tvod: 0,
  block_svod: 0,
  block_ppv: 0,
  npvr_status: 0,
  catchup_status: 0,
  restart_status: 0,
  vod_status: 0,
  token: '',
  wmsAuthSign: '',
  system_state: false,
  property_id: 0,
  property_building: '',
  property_apartment: '',
  property_name: '',
  property_image: '',
  property_background_image: '',
  property_media_url: '',
  property_vast_url: '',
  ui_type: '',
  profiles: [],
  messages: []
};

const useDeviceStore = defineStore('deviceStore', {
  state: () => ({
    auth: {
      loggedIn: false,
      msalToken: ''
    } as Auth,
    Account: null as Account | null  // Initialize as null to delay rendering until fetched
  }),
  getters: {
    getDeviceStore: (state): Auth => state.auth,
    getAccount: (state) => state.Account
  },
  actions: {
    setDeviceStore(data: Auth) {
      this.auth = data;
    },
    setAccount(data: any) {
      this.Account = data;
    }
  }
});

export default useDeviceStore;
