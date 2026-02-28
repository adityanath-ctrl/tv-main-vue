<template>
  <!-- Main content: Render only if user is logged in -->
  <div class="d-flex justify-center custom-container">
    <transition name="fade" mode="out-in">
      <!-- Step 1: Enter Code Input -->
      <div v-if="currentStep === 1" key="step1" class="animated-box">
        <v-card class="popup-box" elevation="0">
          <div class="popup-content-scrollable">
            <v-card-text class="text-small">
              Please enter your {{ SITE_TITLE }} top-up code.
            </v-card-text>
            <div class="input-container">
              <input type="text" v-model="enteredCodeInput" class="custom-input" placeholder="Enter code"
                @keyup.enter="handleCheckCode" />
            </div>
            <div class="btn-flex">
              <v-btn v-if="showCancelButton" class="popup-btn" @click="$emit('close')">Cancel</v-btn>
              <v-btn class="popup-btn" @click="handleCheckCode" :disabled="isLoading">
                <v-progress-circular v-if="isLoading" indeterminate size="20" class="mr-2"></v-progress-circular>
                Enter
              </v-btn>
            </div>
          </div>
        </v-card>
      </div>

      <!-- Step 2: Either Error Alert or Confirmation Details -->
      <div v-else-if="currentStep === 2" key="step2" class="animated-box">
        <v-card class="popup-box" elevation="0">
          <div class="popup-content-scrollable">
            <!-- Error/No Input Message -->
            <template v-if="step2Type !== 'confirm'">
              <v-card-text class="text-large">{{ step2Type === 'error' ? 'Code Invalid' : 'Nothing was Entered'
                }}</v-card-text>
              <v-card-text class="text-small" style="white-space: pre-line;">
                <template v-if="step2Type === 'error'">This code is not valid due to the following
                  reason:<br /></template>
                {{ alertMessage }}
              </v-card-text>
              <div class="btn-flex">
                <v-btn class="popup-btn" @click="resetToStep1">OK</v-btn>
              </div>
            </template>
            <!-- Confirmation Message -->
            <template v-else>
              <v-card-text class="text-large">
                {{ validCodeData.title || 'Package Confirmation' }}
                <br />
                {{ formatAccessString(validCodeData.access_length, 'title') }}
              </v-card-text>
              <v-card-text v-if="validCodeData.code_expiry_date_gmt" class="text-medium">
                Enter Code Before: <br />
                <span class="valid-yellow-text">{{ formatDate(validCodeData.code_expiry_date_gmt) }}</span>
              </v-card-text>
              <v-card-text class="text-small">
                You entered: <strong>{{ enteredCodeInput }}</strong><br />
                <span class="valid-yellow-text see-details" @click="showPackageDetails = true">See code details</span>
              </v-card-text>
              <v-card-text class="text-small">Do you want to redeem this code?</v-card-text>
              <div class="btn-flex">
                <v-btn class="popup-btn" @click="resetToStep1">Cancel</v-btn>
                <v-btn class="popup-btn" @click="handleRedeemCode" :disabled="isLoading">
                  <v-progress-circular v-if="isLoading" indeterminate size="20" class="mr-2"></v-progress-circular>
                  Redeem
                </v-btn>
              </div>
            </template>
          </div>
        </v-card>
      </div>

      <!-- Step 3: Code Entry Successful -->
      <div v-else-if="currentStep === 3" key="step3" class="animated-box">
        <v-card class="popup-box" elevation="0">
          <div class="popup-content-scrollable">
            <v-card-text class="text-large">Code Entry Successful</v-card-text>
            <v-card-text class="text-small">
              A {{ redeemCodeData.title || 'Your package' }} has been successfully added to your account.
              <br /><br />
              Your access is valid until {{ formatDate(redeemCodeData.expiry_date) }}.
            </v-card-text>
            <div class="btn-flex">
              <v-btn class="popup-btn" @click="handleSuccessAndReload">Ok</v-btn>
            </div>
          </div>
        </v-card>
      </div>
    </transition>

    <!-- Full-screen overlay for Package Details -->
    <transition name="fade">
      <div v-if="showPackageDetails" class="package-details-overlay" @click.self="showPackageDetails = false">
        <div class="package-details-content">
          <button class="close-btn" @click="showPackageDetails = false">
            <span>×</span>
          </button>
          <h2 class="package-details-title">Package Details</h2>
          <div class="package-details-scrollable">
            <div class="package-details-box">
              <div class="package-details-image">
                <img :src="validCodeData.image" alt="Package Image" />
              </div>
              <div class="package-details-info">
                <h3>{{ validCodeData.title || 'Package Name' }}</h3><br />
                <p class="description">
                  {{ truncatedDescription }}
                  <span v-if="isDescriptionTruncated" @click="isDescriptionExpanded = true" class="see-more-link">
                    ...see more
                  </span>
                </p><br />
                <p class="duration"><strong>Access Duration:</strong> {{ formatAccessString(validCodeData.access_length)
                  }}
                </p><br />
                <p v-if="validCodeData.code_expiry_date_gmt" class="expiry"><strong>Code must be used before:</strong>
                  {{
                    formatDate(validCodeData.code_expiry_date_gmt) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { SITE_TITLE } from "@/mainConfig";
import { redeemCode } from "@/utils/siberAPI";
import useAuthStore from '@/store/useAuthStore';
import useAccountStore from '@/store/useAccountStore';

// This component emits a 'close' event when it's done.
const emit = defineEmits(['close']);

// 'showCancelButton' will control the visibility of the cancel button.
defineProps({
  showCancelButton: {
    type: Boolean,
    default: true // The button will be visible by default unless specified otherwise.
  }
});

// --- State & Stores ---
const authStore = useAuthStore();
const accountStore = useAccountStore();

const currentStep = ref(1);
const step2Type = ref("");
const alertMessage = ref("");
const enteredCodeInput = ref("");
const validCodeData = ref(null);
const redeemCodeData = ref(null);
const showPackageDetails = ref(false);
const isLoading = ref(false);

const isDescriptionExpanded = ref(false);
const TRUNCATION_WORD_LIMIT = 30; // You can change this number

// Reset the expanded state when the details popup is closed
watch(showPackageDetails, (newVal) => {
  if (!newVal) {
    isDescriptionExpanded.value = false;
  }
});

const isDescriptionTruncated = computed(() => {
  const description = validCodeData.value?.description || '';
  const words = description.split(/\s+/); // Split by whitespace
  return words.length > TRUNCATION_WORD_LIMIT && !isDescriptionExpanded.value;
});

const truncatedDescription = computed(() => {
  const description = validCodeData.value?.description || 'No description available.';
  if (isDescriptionTruncated.value) {
    const words = description.split(/\s+/);
    return words.slice(0, TRUNCATION_WORD_LIMIT).join(' ');
  }
  return description;
});

// --- Helper Functions ---
const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};
const resetToStep1 = () => {
  currentStep.value = 1;
  alertMessage.value = "";
  //enteredCodeInput.value = "";
  validCodeData.value = null;
};
const formatAccessString = (apiAccessLength, mode = 'full') => {
  if (!apiAccessLength) return 'N/A';
  const parts = apiAccessLength.split('-');
  if (parts.length !== 2) return apiAccessLength;
  const value = parseFloat(parts[0]);
  const unit = parts[1].replace(/s$/, '');
  const capitalizedUnit = unit.charAt(0).toUpperCase() + unit.slice(1);
  if (mode === 'title') {
    return `${value}-${capitalizedUnit} Access`;
  } else {
    return value === 1 ? `1 ${unit}` : `${value} ${unit}s`;
  }
};
const handleSuccessAndReload = () => {
  // First, emit the 'close' event to hide the popup.
  // We use nextTick to ensure the popup is fully closed before we navigate.
  emit('close');

  // Use window.location.href to force a full page reload to the root.
  // This is better than router.push('/') for ensuring all data is re-fetched.
  window.location.href = '/';
};

// --- API Logic ---
const handleApiCall = async (mode) => {
  const code = enteredCodeInput.value.trim();
  if (!code) {
    alertMessage.value = "Please enter a code.";
    step2Type.value = "no_input";
    currentStep.value = 2;
    return null;
  }
  const token = authStore.getToken;
  const userMiddlewareId = accountStore.getAccount?.account_limits?.user_id;
  if (!token || !userMiddlewareId) {
    alertMessage.value = "Your session is invalid. Please try logging in again.";
    step2Type.value = "error";
    currentStep.value = 2;
    console.error("Missing token or userMiddlewareId for redeemCode API call.");
    return null;
  }

  isLoading.value = true;
  try {
    return await redeemCode(code, mode, userMiddlewareId, token);
  } catch (error) {
    console.error(`Error during code ${mode}:`, error);
    alertMessage.value = `An unexpected error occurred. Please try again.`;
    step2Type.value = "error";
    currentStep.value = 2;
    return null;
  } finally {
    isLoading.value = false;
  }
};

const handleCheckCode = async () => {
  const response = await handleApiCall("check_code");
  if (!response) return;

  if (response.data?.status === 200) {
    validCodeData.value = response.data;
    step2Type.value = "confirm";
  } else {
    alertMessage.value = response.data?.message || "Invalid code provided.";
    step2Type.value = "error";
  }
  currentStep.value = 2;
};

const handleRedeemCode = async () => {
  const response = await handleApiCall("redeem");
  if (!response) return;

  if (response.data?.status === 200) {
    redeemCodeData.value = response.data;
    currentStep.value = 3;
  } else {
    alertMessage.value = response.data?.message || "Failed to redeem the code.";
    step2Type.value = "error";
    currentStep.value = 2;
  }
};

</script>

<style scoped>
/* --- BASE STYLES (Mobile First) --- */
.popup-box {
  background-color: #111111;
  padding: 0;
  /* Let the scrollable container handle padding */
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;

  /* MODIFIED: Limit height and manage overflow */
  max-height: 90vh;
  /* Set a max height relative to the viewport */
  overflow: hidden;
  /* Hide overflow on the card itself */
}

/* NEW: Scrollable content wrapper */
.popup-content-scrollable {
  width: 100%;
  padding: 20px 15px;
  /* Apply padding here instead of the card */
  overflow-y: auto;
  /* Enable vertical scroll if content overflows */
  display: flex;
  flex-direction: column;
  align-items: center;
}


/* Text Styling */
.text-large {
  font-size: 1.25rem;
  text-align: center;
  font-weight: 700;
  margin-bottom: 2rem;
}

.text-medium {
  font-size: 1.1rem;
  text-align: center;
  font-weight: 600;
  margin-bottom: 2rem;
}

.text-small {
  font-size: 1rem;
  width: 90%;
  text-align: center;
  margin-bottom: 2rem;
}

.valid-yellow-text {
  color: yellow;
}

/* Input & Buttons */
.input-container {
  display: flex;
  width: 100%;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.custom-input {
  width: 100%;
  max-width: 300px;
  height: 40px;
  background-color: #666;
  border: none;
  border-radius: 20px;
  padding: 0 15px;
  font-size: 16px;
  color: #fff;
  outline: none;
  text-align: center;
}

.custom-input::placeholder {
  color: #ccc;
}

.btn-flex {
  display: flex;
  gap: 1rem;
}

.popup-btn {
  background-color: white !important;
  color: black !important;
  text-transform: capitalize;
  font-weight: 600;
  border-radius: 30px;
  padding: 0 20px;
}

/* Details Link */
.see-details {
  display: block;
  margin-top: 10px;
  cursor: pointer;
  transition: text-decoration 0.2s ease-in-out;
}

.see-details:hover {
  text-decoration: underline;
}

/* --- TABLET & DESKTOP STYLES (min-width: 600px) --- */
@media (min-width: 600px) {
  .popup-box {
    border-radius: 40px;
    width: 90%;
    max-width: 800px;
  }

  .popup-content-scrollable {
    padding: 40px;
    /* Restore larger padding for desktop */
  }

  .btn-flex {
    gap: 20px;
  }

  .text-small {
    width: 70%;
  }
}

/* --- Package Details Overlay --- */
.package-details-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 1rem;
  /* Add padding to overlay for small screens */
}

.package-details-content {
  background-color: #1a1a1a;
  padding: 0;
  /* Padding will be on scrollable child */
  border-radius: 20px;
  width: 100%;
  /* Use full width of padded overlay */
  max-width: 900px;
  position: relative;

  /* MODIFIED: Limit height and manage overflow */
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.4rem;
  color: #fff;
  cursor: pointer;
  z-index: 10;
}

.package-details-title {
  text-align: center;
  font-size: 24px;
  color: #fff;
  padding: 1.5rem;
  /* Give title its own padding */
  flex-shrink: 0;
  /* Prevent title from shrinking */
}

/* NEW: Scrollable content wrapper for details */
.package-details-scrollable {
  padding: 0 1.5rem 1.5rem;
  /* Add padding here */
  overflow-y: auto;
  /* Enable scroll on this part */
}

.package-details-box {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.package-details-image img {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 10px;
}

.package-details-info {
  color: #fff;
  text-align: left;
}

@media (min-width: 768px) {
  .package-details-content {
    padding: 0;
  }

  .package-details-title {
    padding: 2rem;
    margin-bottom: 0;
  }

  .package-details-scrollable {
    padding: 0 2rem 2rem;
  }

  .package-details-box {
    flex-direction: row;
    gap: 2rem;
  }

  .package-details-image {
    flex: 1;
  }

  .package-details-info {
    flex: 2;
  }
}

/* --- Transition Animation --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.package-details-info {
  color: #fff;
  text-align: left;
}
.package-details-info .description {
  /* Allow for multi-line text */
  white-space: pre-wrap;
  word-wrap: break-word; /* Ensure long words break */
}
.see-more-link {
  color: #25aae1; /* A highlight color for the link */
  font-weight: bold;
  cursor: pointer;
  margin-left: 4px; /* A little space before the link */
}
.see-more-link:hover {
  text-decoration: underline;
}
</style>