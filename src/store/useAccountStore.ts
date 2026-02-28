import { defineStore } from 'pinia'

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

export default defineStore('accountStore', {
  state: () => ({
    Account: null as Account | null  // Initialize as null
  }),
  getters: {
    getAccount: (state) => state.Account
  },
  actions: {
    setAccount(data: any) {
      this.Account = data
    }
  }
})
