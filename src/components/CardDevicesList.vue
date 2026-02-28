<!-- /src/components/CardDevicesList.vue -->
<template>
  <div style="width: 100%;" v-if="renderDevices(listHeader).length !== 0">
    <hr class="mt-5 border-t border-gray-300 border-width" v-if="!(listHeader === 'Devices To Add')" />
    <div class="device-connect-limit">
      <div class="device-connect-limit">
        <h2 class="text-start text-device">
          {{ listHeader }}
        </h2>
        <div v-if="listHeader === 'Connected Devices'">
          <h1 class="text-increase">
            Device Limit: {{ userDevices.length }} of
            {{ accountData?.account_limits?.user_mobile_device_limit }}
          </h1>
        </div>
      </div>
      <div v-if="listHeader === 'Connected Devices'" :style="hidden">
        <h2 class="text-increase">Increase Device Limit</h2>
      </div>
    </div>

    <div class="device-container">
      <ul v-for="(item, index) in renderDevices(listHeader)" :key="index" class="card-size-fix">
        <li style="list-style: none;">
          <div class="box" :style="{
            backgroundColor: item?.device_status === 0 && item?.device_signed_out === 0 ? '#464545' : '#F9FAFB'
          }">
            <div class="grid-container">
              <div class="list">
                <div class="content">
                  <h4 class="mt-3 mb-2 text-center"
                    :style="{ color: item?.device_status === 0 && item?.device_signed_out === 0 ? '#ffffff' : '#393839' }">
                    <span class="device-title-container">
                      <span class="device-title-text">
                        {{ item?.device_nickname === '' ? handleDeviceTitle(item?.device_type) : item?.device_nickname
                        }}
                      </span>
                      <span class="device-id"> ({{ item?.device_id }}) </span>
                    </span>
                  </h4>

                  <div class="heading-container">
                    <button
                      :style="{ color: item?.device_status === 0 && item?.device_signed_out === 0 ? '#ffffff' : '#393839' }"
                      class="edit" @click="setEditPopup(item)">
                      Edit
                    </button>
                  </div>

                  <div class="horizontal-line-white"></div>

                  <div style="display: flex; align-items: flex-start; justify-content: space-between;">
                    <div style="flex: 1;">
                      <p class="sm-text mt-1"
                        :style="{ color: item?.device_status === 0 && item?.device_signed_out === 0 ? '#ffffff' : '#393839' }">
                        Profile Name:
                        {{ accountData?.user_name.slice(0, 1).toUpperCase() + accountData?.user_name.slice(1) }}
                      </p>

                      <p class="sm-text mt-1"
                        :style="{ color: item?.device_status === 0 && item?.device_signed_out === 0 ? '#ffffff' : '#393839' }">
                        Last Viewed:
                        {{
                          item?.device_last_seen === null || item?.device_last_seen === ''
                            ? formatLastViewedDate(item?.device_reg_date)
                            : formatLastViewedDate(item?.device_last_seen)
                        }}
                      </p>

                      <p class="sm-text mt-1"
                        :style="{ color: item?.device_status === 0 && item?.device_signed_out === 0 ? '#ffffff' : '#393839' }">
                        Country: {{ item?.device_country === '' ? 'N/A' : item?.device_country }}
                      </p>

                      <p class="sm-text mt-1"
                        :style="{ color: item?.device_status === 0 && item?.device_signed_out === 0 ? '#ffffff' : '#393839' }">
                        Status:
                        <span :style="{
                          color:
                            item?.device_status === 0 && item?.device_signed_out === 0
                              ? 'blue'
                              : item?.device_status === 0 && item?.device_signed_out === 1
                                ? 'red'
                                : item?.device_status === 1 && item?.device_signed_out === 0
                                  ? 'green'
                                  : item?.device_status === 1 && item?.device_signed_out === 1
                                    ? 'gray'
                                    : '#393839',
                          fontWeight: 'bold'
                        }">
                          {{
                            item?.device_status === 0 && item?.device_signed_out === 0
                              ? 'Pending Approval'
                              : item?.device_status === 0 && item?.device_signed_out === 1
                                ? 'Deactivated'
                                : item?.device_status === 1 && item?.device_signed_out === 0
                                  ? 'Active (Logged In)'
                                  : item?.device_status === 1 && item?.device_signed_out === 1
                          ? 'Active (Logged Out)'
                          : ''
                          }}
                        </span>
                      </p>
                    </div>

                    <!-- Desktop buttons (two stacks) -->
                    <div class="buttons mt-9 md-buttons flex flex-col gap-2"
                      v-if="item?.device_status === 0 && item?.device_signed_out === 0">
                      <v-btn class="btn-approve" :loading="isItemLoading(item.device_id)"
                        :disabled="isItemLoading(item.device_id)" @click="handleActivatePending(item)" v-if="
                          item?.device_status === 0 &&
                          item?.device_signed_out === 0 &&
                          !(accountData.account_limits.user_mobile_device_limit >
                            accountData.account_limits.user_mobile_devices)
                        ">
                        Activate
                      </v-btn>

                      <v-btn class="btn-approve" :loading="isItemLoading(item.device_id)"
                        :disabled="isItemLoading(item.device_id)" @click="directActivate(item)" v-if="
                          accountData.account_limits.user_mobile_device_limit >
                          accountData.account_limits.user_mobile_devices
                        ">
                        Activate
                      </v-btn>

                      <v-btn class="btn-deny" :loading="isItemLoading(item.device_id)"
                        :disabled="isItemLoading(item.device_id)" @click="directDelete(item)">
                        Delete
                      </v-btn>
                    </div>

                    <div class="buttons mt-9 md-buttons flex flex-col gap-2">
                      <v-btn class="btn" :loading="isItemLoading(item.device_id)"
                        :disabled="isItemLoading(item.device_id)" @click="handleReactivateDevice(item)"
                        v-if="item?.device_status === 0 && item?.device_signed_out === 1">
                        Reactivate
                      </v-btn>

                      <v-btn class="btn" :loading="isItemLoading(item.device_id)"
                        :disabled="isItemLoading(item.device_id)" @click="openDeactivate(item)"
                        v-if="item?.device_status === 1 && (item?.device_signed_out === 0 || item?.device_signed_out === 1)">
                        Deactivate
                      </v-btn>

                      <v-btn v-if="!(item?.device_status === 0 && item?.device_signed_out === 0)" class="btn"
                        :loading="isItemLoading(item.device_id)" :disabled="isItemLoading(item.device_id)"
                        @click="directDelete(item)">
                        Delete
                      </v-btn>
                    </div>
                  </div>

                  <p class="sm-text mt-1 mb-4"
                    :style="{ color: item?.device_status === 0 && item?.device_signed_out === 0 ? '#ffffff' : '#393839' }">
                    Ip Address: {{ item?.device_reg_ip }}
                  </p>

                  <!-- Mobile duplicate button blocks -->
                  <div class="parent-container mt-2 mb-2">
                    <div class="d-md-none" style="display: flex; flex-direction: column; gap: 10px;"
                      v-if="item?.device_status === 0 && item?.device_signed_out === 0">
                      <v-btn class="btn-approve" :loading="isItemLoading(item.device_id)"
                        :disabled="isItemLoading(item.device_id)" @click="handleActivatePending(item)" v-if="
                          item?.device_status === 0 &&
                          item?.device_signed_out === 0 &&
                          !(accountData.account_limits.user_mobile_device_limit >
                            accountData.account_limits.user_mobile_devices)
                        ">
                        Activate
                      </v-btn>
                      <v-btn class="btn-approve" :loading="isItemLoading(item.device_id)"
                        :disabled="isItemLoading(item.device_id)" @click="directActivate(item)" v-if="
                          accountData.account_limits.user_mobile_device_limit >
                          accountData.account_limits.user_mobile_devices
                        ">
                        Activate
                      </v-btn>
                      <v-btn class="btn-deny" :loading="isItemLoading(item.device_id)"
                        :disabled="isItemLoading(item.device_id)" @click="directDelete(item)">
                        Delete
                      </v-btn>
                    </div>
                  </div>

                  <div>
                    <div class="parent-container mt-2 mb-2">
                      <div class="buttons d-md-none" style="display: flex; flex-direction: column; gap: 10px;">
                        <v-btn class="btn" :loading="isItemLoading(item.device_id)"
                          :disabled="isItemLoading(item.device_id)" @click="handleReactivateDevice(item)"
                          v-if="item?.device_status === 0 && item?.device_signed_out === 1">
                          Reactivate
                        </v-btn>

                        <v-btn class="btn" :loading="isItemLoading(item.device_id)"
                          :disabled="isItemLoading(item.device_id)" @click="openDeactivate(item)"
                          v-if="item?.device_status === 1 && (item?.device_signed_out === 0 || item?.device_signed_out === 1)">
                          Deactivate
                        </v-btn>

                        <v-btn v-if="!(item?.device_status === 0 && item?.device_signed_out === 0)" class="btn"
                          :loading="isItemLoading(item.device_id)" :disabled="isItemLoading(item.device_id)"
                          @click="directDelete(item)">
                          Delete
                        </v-btn>
                      </div>
                    </div>
                  </div>
                  <!-- /mobile duplicates -->
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- POPUPS (unchanged structure) -->
    <ButtonFlowTemplate :closePopup="closeButtonFlowTemplate" :dialog="buttonFlowTemplatePopupRef"
      :popupContentType="popupContentType">
      <template v-slot:edit-device-name>
        <v-card-title class="d-flex justify-center">
          <h2 class="heading">Edit Your Device </h2>
        </v-card-title>
        <div v-if="isLoading">
          <Loader :isLoading="isLoading" />
        </div>
        <div v-else>
          <v-card-text class="text-center white-text">
            <p>Edit the name of your device.</p>
          </v-card-text>
          <div class="card-btn1" width="100%">
            <input type="text" v-model="editNameInput" class="edit-input" />
          </div>
          <v-card-actions class="d-flex justify-center align-center mt-10 gap-[3.5rem]">
            <v-btn outlined color="white" class="popup-btn" @click="closeButtonFlowTemplate">Cancel</v-btn>
            <v-btn outlined color="white" class="popup-btn" :loading="isLoading" :disabled="isLoading"
              @click="handleDeviceName">Save</v-btn>
          </v-card-actions>
        </div>
      </template>

      <template v-slot:add-device-info>
        <div v-if="activeDeviceInPopup">
          <v-card-title class="d-flex justify-center">
            <h1 class="heading">Add New Device</h1>
          </v-card-title>
          <v-card-text class="subHeading">
            The following device is requesting to be added to your account.
          </v-card-text>
          <hr class="border-t border-gray-300 border-width" />
          <div class="my-5 device-details-wrapper">
            <p class="device-details">Device Type: <span>{{ devicesLookupTable[activeDeviceInPopup?.device_type]
                }}</span></p>
            <p class="device-details">Request Country: <span>{{ activeDeviceInPopup?.device_country }}</span></p>
            <p class="device-details">Ip Address: <span>{{ activeDeviceInPopup?.device_reg_ip }}</span></p>
            <p class="device-details">Request Date: <span>{{ formatDate(activeDeviceInPopup?.device_reg_date) }}</span>
            </p>
            <p class="device-details">Request Time: <span>{{ formattedTime(activeDeviceInPopup?.device_reg_date)
                }}</span></p>
          </div>
          <v-card-actions class="d-flex justify-center align-center card-btn-wrapper">
            <v-btn outlined color="white" class="popup-btn" @click="closeButtonFlowTemplate">Cancel</v-btn>
            <v-btn outlined color="white" class="popup-btn" :loading="isLoading" :disabled="isLoading"
              @click="handleAddDevice">Continue</v-btn>
          </v-card-actions>
        </div>
      </template>

      <template #device-limit-exceed>
        <v-card-title class="d-flex justify-center">
          <h1 class="heading">Device Limitation Reached</h1>
        </v-card-title>
        <v-card-text class="italic">
          {{ userDevices.length + '/' + accountData.account_limits.user_mobile_device_limit }} Devices Connected
        </v-card-text>
        <v-card-text class="subHeading">
          To add your request device, you'll need to disable an existing device from this account.
        </v-card-text>
        <v-card-actions class="d-flex justify-center align-center mt-10 card-btn-wrapper">
          <v-btn outlined color="white" class="popup-btn" @click="closeButtonFlowTemplate">Cancel</v-btn>
          <v-btn outlined color="white" class="popup-btn" @click="showDevicesToDeactivate">Continue</v-btn>
        </v-card-actions>
      </template>

      <template #deactivate-device-first>
        <v-card-title class="d-flex justify-center">
          <h1 class="heading">Deactivate a Device</h1>
        </v-card-title>
        <v-card-text class="subHeading">
          Please click on a deactivate button to deactivate a device.
        </v-card-text>
        <ul v-for="(item, index) in connectedDevices" :key="index" class="popup-item-ul">
          <li style="list-style: none;">
            <div class="card-btn" width="100%">
              <p class="device-name device-title-container">
                <span class="device-title-text">{{ item?.device_nickname === '' ? handleDeviceTitle(item?.device_type) :
                  item?.device_nickname }}</span>
                <span class="device-id">({{ item?.device_id }})</span>
              </p>
              <v-btn class="btn-deactivate" :loading="isItemLoading(item.device_id)"
                :disabled="isItemLoading(item.device_id)" @click="deviceSelectedToDeactivate(item)">Deactivate</v-btn>
            </div>
          </li>
        </ul>
        <v-card-actions class="d-flex justify-center gap-10 align-center mt-5">
          <v-btn outlined color="white" class="popup-btn" @click="closeButtonFlowTemplate">Back</v-btn>
        </v-card-actions>
      </template>

      <template #deactivate-device-confirm>
        <v-card-title class="d-flex justify-center">
          <h1 class="heading">{{ popupFlow === 'delete' ? 'Delete' : 'Deactivate' }} a Device</h1>
        </v-card-title>
        <v-card-text class="subHeading" v-if="popupFlow !== 'delete'">
          Are you sure you want to deactivate this device?
        </v-card-text>
        <v-card-text class="subHeading" v-else>
          <p class="mb-5">Are you sure you want to delete this device?</p>
          <p>This will completely remove this device from your account management area.</p>
        </v-card-text>
        <div class="card-btn1" width="100%">
          <p style="text-align: center; width: 100%;" class="device-name device-title-container">
            <span class="device-title-text">{{ activeDeviceInPopup?.device_nickname === '' ?
              handleDeviceTitle(activeDeviceInPopup?.device_type) : activeDeviceInPopup?.device_nickname }}</span>
            <span v-if="activeDeviceInPopup?.device_id" class="device-id">({{ activeDeviceInPopup.device_id }})</span>
          </p>
        </div>
        <v-card-actions class="d-flex justify-center align-center mt-10 card-btn-wrapper">
          <v-btn outlined color="white" class="popup-btn" @click="closeButtonFlowTemplate">Back</v-btn>
          <v-btn outlined color="white" class="popup-btn" :loading="isLoading" :disabled="isLoading"
            @click="confirmedDeactivateThisDevice">Yes</v-btn>
        </v-card-actions>
      </template>

      <template #device-deactivated>
        <v-card-title class="d-flex justify-center">
          <h1 class="heading" v-if="popupFlow !== 'delete'">Device Deactivated</h1>
          <h1 class="heading" v-else>Device Deleted</h1>
        </v-card-title>
        <v-card-text class="subHeading" v-if="popupFlow !== 'delete'">
          The following device has been deactivated.
        </v-card-text>
        <v-card-text class="subHeading" v-else>
          The following device has been deleted.
        </v-card-text>
        <hr class="mb-5 border-t border-gray-300 border-width" />
        <div class="card-btn1" width="100%">
          <p style="text-align: center; width: 100%;" class="device-name device-title-container">
            <span class="device-title-text">{{ activeDeviceInPopup?.device_nickname === '' ?
              handleDeviceTitle(activeDeviceInPopup?.device_type) : activeDeviceInPopup?.device_nickname }}</span>
            <span v-if="activeDeviceInPopup?.device_id" class="device-id">({{ activeDeviceInPopup.device_id }})</span>
          </p>
        </div>
        <v-card-actions class="d-flex justify-center align-center mt-10">
          <v-btn outlined color="white" class="popup-btn" @click="continueAddingDevice">Continue</v-btn>
        </v-card-actions>
      </template>

      <template v-slot:add-new-device>
        <div v-if="activeDeviceInPopup">
          <v-card-title class="d-flex justify-center">
            <h1 class="heading">Add New Device</h1>
          </v-card-title>
          <v-card-text class="subHeading">
            Click "Continue" to complete adding the following device to your account.
          </v-card-text>
          <hr class="border-t border-gray-300 border-width" />
          <div class="my-5">
            <p class="device-details">Device Type: {{ devicesLookupTable[activeDeviceInPopup.device_type] }}</p>
            <p class="device-details">Request Country: {{ activeDeviceInPopup.device_country }}</p>
            <p class="device-details">Ip Address: {{ activeDeviceInPopup.device_reg_ip }}</p>
          </div>
          <v-card-actions class="d-flex justify-center align-center mt-10 card-btn-wrapper">
            <v-btn outlined color="white" class="popup-btn" @click="closeButtonFlowTemplate()">Cancel</v-btn>
            <v-btn outlined color="white" class="popup-btn" :loading="isLoading" :disabled="isLoading"
              @click="confirmContinueAddingDevice">Continue</v-btn>
          </v-card-actions>
        </div>
      </template>

      <template v-slot:device-added>
        <div v-if="activeDeviceInPopup">
          <v-card-title class="d-flex justify-center">
            <h1 class="heading">Device Added</h1>
          </v-card-title>
          <v-card-text class="subHeading">
            Your Device has been added to your account.
          </v-card-text>
          <hr class="border-t border-gray-300 border-width" />
          <div class="my-5">
            <p class="device-details">Device Type: {{ devicesLookupTable[activeDeviceInPopup.device_type] }}</p>
            <p class="device-details">Request Country: {{ activeDeviceInPopup.device_country }}</p>
            <p class="device-details">Ip Address: {{ activeDeviceInPopup.device_reg_ip }}</p>
          </div>
          <v-card-actions class="d-flex justify-center align-center mt-10 gap-[3.5rem]">
            <v-btn outlined color="white" class="popup-btn" @click="closeButtonFlowTemplate">Continue</v-btn>
          </v-card-actions>
        </div>
      </template>

      <template #reactivate-device>
        <v-card-title class="d-flex justify-center">
          <h1 class="heading">Reactivate a Device</h1>
        </v-card-title>
        <v-card-text class="subHeading">
          Do you want to reactivate this device?
        </v-card-text>
        <div class="card-btn" width="100%">
          <p style="text-align: center; width: 100%;" class="device-name device-title-container">
            <span class="device-title-text">{{ activeDeviceInPopup?.device_nickname === '' ?
              handleDeviceTitle(activeDeviceInPopup?.device_type) : activeDeviceInPopup?.device_nickname }}</span>
            <span v-if="activeDeviceInPopup?.device_id" class="device-id">({{ activeDeviceInPopup.device_id }})</span>
          </p>
        </div>
        <v-card-actions class="d-flex justify-center align-center mt-10 card-btn-wrapper">
          <v-btn outlined color="white" class="popup-btn" @click="closeButtonFlowTemplate">Back</v-btn>
          <v-btn outlined color="white" class="popup-btn" :loading="isLoading" :disabled="isLoading"
            @click="handleAddDevice">Yes</v-btn>
        </v-card-actions>
      </template>

      <template #reactivate-device-confirm>
        <v-card-title class="d-flex justify-center">
          <h1 class="heading">Reactivate a Device</h1>
        </v-card-title>
        <v-card-text class="subHeading">
          Please click on the reactivate button to confirm activating the device.
        </v-card-text>
        <div class="card-btn">
          <p class="device-name device-title-container">
            <span class="device-title-text">{{ activeDeviceInPopup?.device_nickname === '' ?
              handleDeviceTitle(activeDeviceInPopup?.device_type) : activeDeviceInPopup?.device_nickname }}</span>
            <span v-if="activeDeviceInPopup?.device_id" class="device-id">({{ activeDeviceInPopup.device_id }})</span>
          </p>
          <v-btn class="btn-deactivate" :loading="isLoading" :disabled="isLoading"
            @click="handleAddDevice">Reactivate</v-btn>
        </div>
        <v-card-actions class="d-flex justify-center align-center mt-10">
          <v-btn outlined color="white" class="popup-btn" @click="closeButtonFlowTemplate">Back</v-btn>
        </v-card-actions>
      </template>

      <template #device-reactivated>
        <v-card-title class="d-flex justify-center">
          <h1 class="heading">Device Reactivated</h1>
        </v-card-title>
        <v-card-text class="subHeading">
          Device name is now activated.
        </v-card-text>
        <div class="card-btn" width="100%">
          <p style="text-align: center; width: 100%;" class="device-name device-title-container">
            <span class="device-title-text">{{ activeDeviceInPopup?.device_nickname === '' ?
              handleDeviceTitle(activeDeviceInPopup?.device_type) : activeDeviceInPopup?.device_nickname }}</span>
            <span v-if="activeDeviceInPopup?.device_id" class="device-id">({{ activeDeviceInPopup.device_id }})</span>
          </p>
        </div>
        <v-card-actions class="d-flex justify-center align-center mt-10">
          <v-btn outlined color="white" class="popup-btn" @click="closeButtonFlowTemplate">Continue</v-btn>
        </v-card-actions>
      </template>
    </ButtonFlowTemplate>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import ButtonFlowTemplate from '@/components/popups/btnFlowTemplate.vue';
import useAuthStore from '@/store/useAuthStore';
import { useRouter } from 'vue-router';
import { deactivateDevice, activateDevice, showUserDevices, signout, renameDeviceName } from '@/utils/siberAPI';
import Loader from '@/components/loader.vue';
import { devicesLookupTable, ENABLE_MANAGE_OWN_DEVICES } from '@/mainConfig';
import useDeviceStore from '@/store/useDeviceStore';

const props = defineProps({
  listHeader: { type: String, required: true },
  handleDeviceTitle: { type: Function, required: true },
  isUserVerifiedByEmail: { type: Boolean, required: false },
});

const authStore = useAuthStore();
const deviceStore = useDeviceStore();
const { listHeader, handleDeviceTitle } = props;

const isLoading = ref(false); // popup-level loader
const actionLoading = ref({}); // per-device loaders: { [device_id]: true/false }

const isItemLoading = (id) => !!actionLoading.value[id];
const setItemLoading = (id, v) => { if (id != null) actionLoading.value = { ...actionLoading.value, [id]: v }; };
const runWithItemLoading = async (item, fn) => {
  const id = item?.device_id;
  try { setItemLoading(id, true); return await fn(); }
  finally { setItemLoading(id, false); }
};

const urlObj = new URL(window.location.href);
const hidden = { display: 'none' };
const pendingDeviceId = ref(urlObj.searchParams.get('device_id'));
const router = useRouter();

const devicesData = computed(() => authStore.getDevices);
const accountData = computed(() => deviceStore.getAccount);
const enableManageOwnDevicesComputed = computed(() => ENABLE_MANAGE_OWN_DEVICES);

const connectedDevices = computed(() => {
  const devices = Array.isArray(devicesData.value) ? [...devicesData.value] : [];
  return devices.filter((d) => d.device_status === 1 && (d.device_signed_out === 0 || d.device_signed_out === 1));
});
const userDevices = computed(() => connectedDevices.value.filter((d) => d.device_status === 1));
const isDeviceLimitExceed = computed(
  () => userDevices.value.length >= accountData.value?.account_limits?.user_mobile_device_limit
);

onMounted(async () => { await fetchUserDevices(); });

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-GB');
const formattedTime = (dateString) =>
  new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

/* API wrappers with per-item loading */
const handleActivate = async (item) =>
  runWithItemLoading(item, async () => {
    const response = await activateDevice(authStore?.auth?.msalToken, item?.device_id);
    if (response?.data?.status === 200) { await fetchUserDevices(); }
    return response;
  });

const handleDeactivate = async (item) =>
  runWithItemLoading(item, async () => {
    const response = await deactivateDevice(authStore?.auth?.msalToken, item?.device_id);
    if (response?.data?.status === 200) { await fetchUserDevices(); popupContentType.value = 'device-deactivated'; }
    return response;
  });

const handleDelete = async (item) =>
  runWithItemLoading(item, async () => {
    const response = await signout(authStore.auth.msalToken, item?.device_id);
    if (response?.data?.status === 200) { await fetchUserDevices(); popupContentType.value = 'device-deactivated'; }
    return response;
  });

/* Convenience for direct actions (no popups) */
const directActivate = async (item) => { await handleActivate(item); };
const directDelete = async (item) => { await handleDelete(item); };
const openDeactivate = (item) => { openPopup('deactivate-device-confirm', 'deactivate', item); };

const devicesToAddWithGetVariable = computed(() => {
  const devices = Array.isArray(devicesData.value) ? [...devicesData.value] : [];
  return devices.filter(
    (d) => d.device_status === 0 && d.device_signed_out === 0 && d.device_id === Number(pendingDeviceId.value)
  );
});
const devicesToAdd = computed(() => {
  const devices = Array.isArray(devicesData.value) ? [...devicesData.value] : [];
  return devices.filter((d) => d.device_status === 0 && d.device_signed_out === 0);
});
const deactivatedDevices = computed(() => {
  const devices = Array.isArray(devicesData.value) ? [...devicesData.value] : [];
  return devices.filter((d) => d.device_status === 0 && d.device_signed_out === 1);
});

const formatLastViewedDate = (gmtDateString) => {
  if (!gmtDateString) return 'N/A';
  const date = new Date(gmtDateString);
  const day = date.getDate();
  const suffix = ['th', 'st', 'nd', 'rd'][(day % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][day % 100] || 'th';
  return date
    .toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
    .replace(String(day), day + suffix);
};

const renderDevices = (category) => {
  switch (category) {
    case 'Devices To Add': return enableManageOwnDevicesComputed.value ? devicesToAdd.value : devicesToAddWithGetVariable.value;
    case 'Connected Devices': return connectedDevices.value;
    case 'Deactivated Devices': return deactivatedDevices.value;
    default: return [];
  }
};

const fetchUserDevices = async () => {
  try {
    const fetched = await showUserDevices(localStorage.getItem('authToken'));
    if (fetched.status === 200) {
      const devicesUpdatedData = fetched.data.response.devices;
      authStore.setDevices(devicesUpdatedData);
      deviceStore.setAccount(fetched.data.response.account);
    } else {
      throw new Error(fetched.message + '. ' + fetched.data.message);
    }
  } catch (err) { console.error(err); }
};

/* Popup state & flows */
const buttonFlowTemplatePopupRef = ref(false);
const popupContentType = ref('');
const popupFlow = ref('');
const activeDeviceInPopup = ref(null);
const pendingDeviceToAdd = ref(null);
const editNameInput = ref('');

const openPopup = (contentType, flowType, deviceItem) => {
  popupContentType.value = contentType;
  popupFlow.value = flowType;
  activeDeviceInPopup.value = deviceItem;
  buttonFlowTemplatePopupRef.value = true;
};

const closeButtonFlowTemplate = () => {
  buttonFlowTemplatePopupRef.value = false;
  setTimeout(() => {
    activeDeviceInPopup.value = null;
    pendingDeviceToAdd.value = null;
    popupContentType.value = '';
    popupFlow.value = '';
  }, 300);
};

const handleActivatePending = (item) => {
  pendingDeviceToAdd.value = item;
  openPopup('add-device-info', 'activate', item);
};
const handleReactivateDevice = (item) => { openPopup('reactivate-device', 'reactivate', item); };
const handleDeactivateDevice = (item) => { openPopup('deactivate-device-confirm', 'deactivate', item); };
const handleDeleteDevice = (item) => { openPopup('deactivate-device-confirm', 'delete', item); };

const setEditPopup = (item) => {
  editNameInput.value = item.device_nickname || handleDeviceTitle(item.device_type);
  openPopup('edit-device-name', 'edit', item);
};

const handleAddDevice = () => {
  if (isDeviceLimitExceed.value) {
    popupContentType.value = 'device-limit-exceed';
  } else if (popupFlow.value === 'activate') {
    popupContentType.value = 'add-new-device';
  } else if (popupFlow.value === 'reactivate') {
    isLoading.value = true;
    handleActivate(activeDeviceInPopup.value).then((response) => {
      isLoading.value = false;
      if (response?.data?.status === 200) popupContentType.value = 'device-reactivated';
    });
  }
};

const showDevicesToDeactivate = () => { popupContentType.value = 'deactivate-device-first'; };
const deviceSelectedToDeactivate = (item) => { activeDeviceInPopup.value = item; popupContentType.value = 'deactivate-device-confirm'; };

const confirmedDeactivateThisDevice = async () => {
  isLoading.value = true;
  const item = activeDeviceInPopup.value;
  const response = popupFlow.value === 'delete' ? await handleDelete(item) : await handleDeactivate(item);
  if (!response || response.data.status !== 200) { console.error('Failed to deactivate/delete device.'); closeButtonFlowTemplate(); }
  isLoading.value = false;
};

const continueAddingDevice = () => {
  if (popupFlow.value === 'activate') {
    activeDeviceInPopup.value = pendingDeviceToAdd.value;
    if (!isDeviceLimitExceed.value) popupContentType.value = 'add-new-device';
    else popupContentType.value = 'device-limit-exceed';
  } else {
    closeButtonFlowTemplate();
  }
};

const confirmContinueAddingDevice = async () => {
  isLoading.value = true;
  const item = activeDeviceInPopup.value;
  const response = await handleActivate(item);
  if (response?.data?.status === 200) {
    isLoading.value = false;
    popupContentType.value = 'device-added';
  }
  pendingDeviceToAdd.value = null;
};

const handleDeviceName = async () => {
  isLoading.value = true;
  const item = activeDeviceInPopup.value;
  const nickname = editNameInput.value;
  try {
    const response = await renameDeviceName(authStore?.auth?.msalToken, item?.device_id, nickname);
    if (response.data.status === 200) {
      await fetchUserDevices();
      setTimeout(() => { isLoading.value = false; closeButtonFlowTemplate(); }, 600);
    }
  } catch (err) {
    console.error(err);
    isLoading.value = false;
  }
};
</script>

<style scoped>
[v-cloak] {
  display: none
}

.popup-btn {
  background-color: #fff !important;
  color: #000 !important;
  border-radius: 30px;
  padding: 0 20px;
  font-weight: 600;
  text-transform: capitalize
}

.heading {
  padding: 0;
  margin: 0;
  font-size: 20px;
  font-weight: 800
}

.subHeading {
  padding-top: 0;
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 0;
  text-align: center
}

.device-details-wrapper {
  width: 100%
}

.device-details {
  font-size: 17px;
  font-weight: 600
}

.device-details span {
  font-weight: 400
}

.spinner-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80vh;
  position: relative
}

.border-width {
  width: 100%;
  border-color: gray
}

.device-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 20px
}

.loader {
  position: relative;
  width: 100px;
  height: 100px;
  border: 6px solid #3498db;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite
}

.logo-in-loader {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000
}

@keyframes spin {
  0% {
    transform: rotate(0)
  }

  100% {
    transform: rotate(360deg)
  }
}

.containers {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  padding: 1rem;
  overflow-y: hidden
}

.device-connect-limit {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 40px;
  padding: 10px;
  justify-content: space-between
}

.text-increase {
  font-size: 15px;
  font-weight: 200
}

.text-device {
  font-size: 19px;
  font-weight: 700;
  margin-right: 10px
}

.sm-text {
  font-size: 15px;
  padding-left: 1rem
}

.btn-approve,
.btn-deny,
.btn {
  text-transform: none;
  font-weight: 600;
  border-radius: 20px;
}

.btn-approve {
  padding: 5px 40px;
  font-size: 13px;
  background: #fff;
  color: #000;
  border: none
}

.btn-deny {
  padding: 5px 10px;
  font-size: 13px;
  background: #fff;
  color: #000;
  border: none
}

.device-limit {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin: 0 auto
}

.device-id {
  font-size: 12px;
  font-weight: 700;
  color: #585858
}

.box-reqiured {
  margin-top: 100px
}

.set-box {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-between;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto
}

.md-plus {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
  width: 40px;
  height: 40px;
  border: 2px solid #b0b0b0;
  border-radius: 50%;
  background: transparent;
  margin-bottom: 20px
}

.md-plus .mdi-plus {
  font-size: 25px;
  color: #b0b0b0
}

.red-heading {
  color: red;
  font-size: 20px
}

.horizontal-line-white {
  width: 100%;
  height: 1px;
  background: #d4d4d4;
  margin-top: 5px;
  margin-bottom: 10px
}

.horizontal-line {
  width: 100%;
  height: 1px;
  background: #020202;
  margin-top: 5px;
  margin-bottom: 10px
}

.paragraph {
  font-size: 14px;
  margin-bottom: 20px;
  width: 200px
}

.heading-container {
  display: flex;
  justify-content: flex-end;
  position: absolute;
  top: 15px;
  right: 15px;
  color: #fff
}

.edit {
  display: block;
  flex-wrap: wrap;
  font-size: 15px;
  color: #4fadef !important;
  font-weight: 600;
  cursor: pointer
}

.parent-container {
  display: flex;
  justify-content: center;
  align-items: center
}

.dollar {
  display: block;
  flex-wrap: wrap;
  font-size: 34px;
  margin-top: -10px;
  font-weight: bold;
  color: #fff;
  cursor: pointer
}

.box {
  position: relative;
  width: 100%;
  padding: 7px;
  padding-bottom: 7px;
  padding-left: 7px;
  padding-right: 7px;
  background: #F9FAFB;
  color: #040404;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 20px
}

.black-box {
  background: #333;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #fff;
  margin-top: 20px
}

.grid-container {
  text-align: left;
  gap: 20px
}

.text-heading {
  font-weight: 500;
  font-size: 22px;
  text-align: center
}

.text-sum {
  text-align: end
}

.list {
  display: flex;
  flex-direction: column;
  gap: 2px
}

.buttons {
  display: flex;
  flex-direction: column;
  padding-top: 0rem;
  padding-left: .5rem;
  padding-right: .5rem;
  gap: 10px
}

.button {
  display: flex;
  flex-direction: column;
  padding-top: 1rem;
  padding-left: 1rem;
  padding-right: 1rem;
  gap: 10px
}

.btn {
  padding: 5px 40px;
  font-size: 13px;
  background: #393839;
  color: #fff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  margin-right: 10px !important
}

.btn:hover {
  background: #4F4848
}

.device-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-top: 5px;
  margin-bottom: 5px
}

.btn-deactivate {
  background: #333;
  color: #fff;
  text-transform: none;
  font-weight: 600;
  padding: 5px 15px;
  border-radius: 16px
}

.card-btn {
  background: #fff;
  display: flex;
  padding: 10px 10px 10px 30px;
  justify-content: space-between;
  width: 100%;
  border-radius: 20px
}

.card-btn1 {
  background: #fff;
  display: flex;
  padding: 10px;
  justify-content: space-between;
  width: 100%;
  border-radius: 20px
}

.card-btn-wrapper {
  width: 100%;
  gap: 2.5rem
}

.popup-item-ul {
  width: 100%;
  margin-bottom: 10px
}

.popup-item-ul .device-name,
.card-btn1 .device-name,
.card-btn .device-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-top: 5px;
  margin-bottom: 5px
}

.popup-item-ul .device-name .device-id,
.card-btn1 .device-name .device-id,
.card-btn .device-name .device-id {
  font-size: 14px;
  font-weight: 400;
  color: #333
}

.btn-active {
  padding: 7px 10px;
  width: 148px;
  font-size: 13px;
  text-align: center;
  background: #393839;
  color: #fff;
  border: none;
  border-radius: 20px;
  display: block;
  margin-bottom: 15px;
  margin-top: 10px;
  flex-direction: column;
  cursor: pointer
}

.parent-container {
  text-align: center
}

.btn-connected {
  padding: 7px 10px;
  width: 148px;
  font-size: 13px;
  text-align: center;
  background: #fff;
  color: #000;
  border: none;
  border-radius: 20px;
  display: block;
  margin-bottom: 15px;
  margin-top: 10px;
  flex-direction: column;
  cursor: pointer
}

.edit-input {
  font-size: 15px;
  margin-left: 5px;
  width: 100%;
  font-weight: 600;
  color: #333;
  outline: none
}

.device-title-container {
  display: flex;
  align-items: baseline;
  justify-content: center;
  flex-wrap: wrap;
  gap: .25rem
}

@media (max-width:400px) {
  .box {
    width: 100%;
    max-width: none
  }

  .device-connect {
    display: block
  }

  .card-size-fix {
    width: 100%
  }

  .text-increase {
    padding: 0 10px;
    margin-top: 0 !important;
    text-align: justify
  }

  .device-details {
    font-size: 13px
  }
}

@media (max-width:500px) {
  .card-size-fix {
    width: 100%
  }

  .heading {
    font-size: 15px
  }

  .subHeading {
    font-size: 13px !important
  }

  .popup-btn {
    margin: 0;
    font-size: 14px !important
  }
}

@media (max-width:768px) {
  .row {
    flex-direction: column;
    gap: 15px
  }

  .device-name,
  .popup-btn {
    margin: 0;
    font-size: 14px !important
  }

  .border-width {
    width: 100%
  }

  .device-details {
    font-size: 14px
  }

  .md-buttons {
    display: none
  }

  .device-container {
    grid-template-columns: 1fr
  }

  .md-plus {
    margin-bottom: 20px
  }

  .set-box>ul,
  .set-box>.box.black-box {
    flex: 1 1 100%
  }

  .device-connect {
    gap: 5px
  }

  .box {
    width: 100%;
    max-width: none
  }

  .containers {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 20px;
    padding: 1rem;
    overflow-y: hidden
  }

  .grid-container {
    flex-direction: column;
    width: 100%;
    gap: 15px
  }

  .buttons {
    align-items: center
  }

  .btn {
    width: 100%
  }
}

@media (max-width:600px) {
  .device-connect-limit {
    gap: 0
  }
}

@media (min-width:769px) and (max-width:959px) {

  .parent-container .btn-approve,
  .parent-container .btn-deny {
    display: none !important
  }
}

@media (min-width:769px) and (max-width:959px) {

  .parent-container .btn,
  .parent-container .btn {
    display: none !important
  }
}
</style>
