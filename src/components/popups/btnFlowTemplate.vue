<!-- /src/components/popups/btnFlowTemplate.vue -->
<template>
  <v-dialog
    v-model="dialogComputed"
    :persistent="false"
    @click:outside="handleClose"
    class="relative"
    :z-index="zIndex"
  >
    <v-card ref="popupCard" class="popup-box" style="border-radius: 40px; position: relative;">
      
      <!-- <v-btn icon class="close-btn" @click="handleClose">
        <v-icon>mdi-close</v-icon>
      </v-btn> -->

      <!-- Logo at the Top -->
      <div class="logo-container">
        <img :src="logo" class="d-flex justify-start align-center" style="height:40px;" />
      </div>

      <!-- Popup Content via Named Slots -->
      <slot name="sign-in-required" v-if="popupContentTypeRef === 'sign-in-required'"></slot>
      <slot name="not-enabled" v-if="popupContentTypeRef === 'not-enabled'"></slot>
      <slot name="edit-device-name" v-if="popupContentTypeRef === 'edit-device-name'"></slot>
      <slot name="add-device-info" v-if="popupContentTypeRef === 'add-device-info'"></slot>
      <slot name="device-limit-exceed" v-if="popupContentTypeRef === 'device-limit-exceed'"></slot>
      <slot name="deactivate-device-first" v-if="popupContentTypeRef === 'deactivate-device-first'"></slot>
      <slot name="deactivate-device-confirm" v-if="popupContentTypeRef === 'deactivate-device-confirm'"></slot>
      <slot name="device-deactivated" v-if="popupContentTypeRef === 'device-deactivated'"></slot>
      <slot name="add-new-device" v-if="popupContentTypeRef === 'add-new-device'"></slot>
      <slot name="device-added" v-if="popupContentTypeRef === 'device-added'"></slot>
      <slot name="reactivate-device" v-if="popupContentTypeRef === 'reactivate-device'"></slot>
      <slot name="reactivate-device-confirm" v-if="popupContentTypeRef === 'reactivate-device-confirm'"></slot>
      <slot name="device-reactivated" v-if="popupContentTypeRef === 'device-reactivated'"></slot>
      <slot name="enter-code" v-if="popupContentTypeRef === 'enter-code'"></slot>
      <slot name="premium-access-required" v-if="popupContentTypeRef === 'premium-access-required'"></slot>
      <slot name="continue-watching" v-if="popupContentTypeRef === 'continue-watching'"></slot>
      <slot name="device-limit-initial" v-if="popupContentTypeRef === 'initial'"></slot>
      <slot name="device-limit-request-success" v-if="popupContentTypeRef === 'success'"></slot>
      <slot name="device-limit-request-error" v-if="popupContentTypeRef === 'error'"></slot>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import logo from '../../assets/img/starter-logo.png'

// Props for handling the popup and actions
const props = defineProps({
  closePopup: { type: Function, required: true },
  dialog: { type: Boolean, required: true },
  popupContentType: { type: String, required: true },
  zIndex: { type: [String, Number], default: 2400 }
})

// Local reactive state to mirror the parent prop for dialog visibility.
const isDialogOpen = ref(props.dialog)
watch(() => props.dialog, (newVal) => {
  isDialogOpen.value = newVal
})

// Ref for the popup element so we can check if a touch event is outside.
const popupCard = ref(null)

// Unified close action
const handleClose = () => {
  props.closePopup()
}

// Computed property for v-model binding with a getter and setter.
// When set to false (e.g. clicking outside or touch outside), it calls handleClose.
const dialogComputed = computed({
  get() {
    return isDialogOpen.value
  },
  set(val) {
    if (!val) {
      handleClose()
    }
    isDialogOpen.value = val
  }
})

// Compute the popup content type
const popupContentTypeRef = computed(() => props.popupContentType)

// This handler will be attached to touchstart events.
const handleTouchOutside = (event) => {
  if (popupCard.value && !popupCard.value.contains(event.target)) {
    handleClose()
  }
}

// When the dialog opens, add a document-level touchstart listener.
// Remove it when the dialog closes.
watch(isDialogOpen, (newVal) => {
  if (newVal) {
    document.addEventListener('touchstart', handleTouchOutside)
  } else {
    document.removeEventListener('touchstart', handleTouchOutside)
  }
})

// Cleanup the event listener when the component is unmounted.
onBeforeUnmount(() => {
  document.removeEventListener('touchstart', handleTouchOutside)
})
</script>

<style scoped lang="scss">
.popup-box {
  background-color: #1A1919;
  padding: 40px;
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.4);
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 550px;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #000;       /* black circle background */
  border: 2px solid #FFC107;    /* bright yellow border */
  border-radius: 50%;
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn .v-icon {
  color: #FFC107; /* bright yellow X */
  font-size: 20px;
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
}

.v-overlay {
  background-color: rgba(0, 0, 0, 0.32) !important;
  backdrop-filter: blur(1px);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
}

.v-card-actions {
  width: 100%;
  display: flex;
  margin-top: 3rem;
  justify-content: center;
  align-items: center;
  gap: 80px;
}

:deep(.v-card-actions) {
  gap: 50px;
}

.popup-btn {
  background-color: #F7F5F4 !important;
  color: #332F2F !important;
  border-radius: 30px;
  width: 8rem;
  font-weight: 600;
  text-transform: capitalize;
  transition: background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
}

.popup-btn:hover {
  background-color: #E0DFDE !important;
  transform: scale(1.05);
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
}

.popup-btn:active {
  transform: scale(0.95);
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.15);
  transition: transform 0.1s ease-out;
}

@media (max-width: 700px) {
  .popup-box {
    padding: 2rem;
    width: 100%;
  }
  .popupHeading {
    font-size: 14px !important;
  }
  .v-card-actions {
    gap: 1rem;
  }
  .popup-btn {
    width: 5rem;
    height: 2rem;
  }
}

@media (max-width: 450px) {
  .popup-box {
    padding: 2rem;
  }
}
</style>
