<template>
  <div>
    <p class="text-large">
      {{ packagesAvailable.length === 0 ? message : "My Code Package Status" }}
    </p>
    <div class='popup-box-wrapper' v-for="(packageItem, index) in packagesAvailable" :key="index">
      <div class="popup-box" v-if="packagesAvailable.length !== 0">
        <div class="premium-box">
          <img :src="packageItem.image" alt="package image">
          <!-- MODIFIED: Added a class to this div -->
          <div class="premium-box-info">
            <v-card-text class="text-premium pa-0">
              {{ packageItem.title }}
            </v-card-text>
            <v-card-text class="text-small pa-0">
              Start Date: <span class="text-date">{{ formatDate(packageItem.start_date_gmt) }}</span>
            </v-card-text>
            <v-card-text class="text-smalls pa-0">
              Expiration Date & Time: <span class="text-date-sum">{{ formatDate(packageItem.expiration_date_gmt) }}</span>
            </v-card-text>
            <v-card-text class="description pa-0">
              {{ packageItem.description }}
            </v-card-text>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { onMounted, ref } from 'vue';
import { packageStatus } from '../utils/siberAPI';
import useAuthStore from '@/store/useAuthStore';
import useAccountStore from '@/store/useAccountStore';

const authStore = useAuthStore();
const accountStore = useAccountStore();
const packagesAvailable = ref([]);
const message = ref('');

// Treat incoming GMT strings as UTC even if they lack a timezone.
// Handles: "YYYY-MM-DD HH:mm:ss", "YYYY-MM-DDTHH:mm:ss", and already-UTC forms.
const normalizeAsUtc = (s) => {
  if (!s || typeof s !== 'string') return s;

  // Already has an explicit timezone? (Z, ±HH:MM, GMT, UTC)
  if (/Z$|[+-]\d{2}:?\d{2}$|GMT|UTC/i.test(s)) {
    return s.replace(' ', 'T'); // make sure it's ISO-ish
  }

  // "YYYY-MM-DD HH:mm:ss"  or  "YYYY-MM-DD HH:mm"
  let m = s.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}(?::\d{2})?)$/);
  if (m) return `${m[1]}T${m[2]}Z`;

  // "YYYY-MM-DDTHH:mm:ss"  (no timezone)
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(s)) return `${s}Z`;

  // Fallback: return as-is (Date may still parse it)
  return s;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';

  const normalized = normalizeAsUtc(dateString);
  const date = new Date(normalized);

  if (isNaN(date.getTime())) return 'Invalid Date';

  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();

  const getOrdinalSuffix = (d) => {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const timePart = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    // Uncomment to show user’s timezone abbreviation:
    // timeZoneName: 'short',
  });

  return `${day}${getOrdinalSuffix(day)} ${month}, ${year} ${timePart}`;
};

const viewPackageStatus = async () => {
  // 1. Get the required data from the stores
  const token = authStore.getToken;
  const userMiddlewareId = accountStore.getAccount?.account_limits?.user_id;

  // 2. Add a guard clause to ensure we have the data
  if (!token || !userMiddlewareId) {
    console.error("Cannot fetch package status: token or userMiddlewareId is missing.");
    message.value = "Your session is invalid. Please try logging in again.";
    return;
  }

  try {
    // 3. Pass the data to the API function
    const response = await packageStatus(userMiddlewareId, token);

    if (response.data.status === 200 && Array.isArray(response.data.packages)) {
      packagesAvailable.value = response.data.packages;
    } else {
      packagesAvailable.value = [];
    }
    if (packagesAvailable.value.length === 0) {
      message.value = "There are no active Codes Packages for your account";
    }
  } catch (error) {
    console.error("Error fetching package status:", error);
    packagesAvailable.value = [];
    message.value = "Failed to fetch package status";
  }
};

onMounted(() => {
  viewPackageStatus()
})

</script>

<style scoped>
/* --- BASE STYLES (Mobile First) --- */
.text-large {
  font-size: 1.25rem; /* 20px */
  text-align: center;
  font-weight: 700;
  padding: 0 1rem;
  margin-bottom: 2rem;
}

.popup-box-wrapper {
  /* This ensures that if there are multiple packages, they stack vertically */
  width: 100%;
}

.popup-box {
  background-color: #2e2e2e; /* A slightly lighter grey for the card */
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 15px;
  width: 100%;
}

.premium-box {
  display: flex;
  flex-direction: column; /* Stack image and text vertically on mobile */
  align-items: center; /* Center items for a clean mobile look */
  gap: 1rem;
  text-align: center;
}

.premium-box img {
  width: 100%;
  max-width: 250px; /* Limit image size on mobile */
  height: auto;
  border-radius: 10px;
  object-fit: cover;
}

.premium-box-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.text-premium {
  font-size: 1.2rem;
  font-weight: bold;
}
.text-access {
  font-size: 1rem;
  opacity: 0.8;
  margin-bottom: 1rem;
}
.text-small, .text-smalls {
  font-size: 0.9rem;
  line-height: 1.4;
}
.text-date {
  color: #25aae1;
  font-weight: 500;
}
.text-date-sum {
  color: #ff4d4d;
  font-weight: 500;
}
.description {
  font-size: 0.8rem;
  opacity: 0.7;
  margin-top: 1rem;
}


/* --- TABLET & DESKTOP STYLES (min-width: 768px) --- */
@media (min-width: 768px) {
  .popup-box {
    padding: 2rem; /* Restore larger padding */
  }
  .premium-box {
    flex-direction: row; /* Side-by-side layout for larger screens */
    text-align: left; /* Align text left */
    gap: 2.5rem; /* Restore larger gap */
  }
  .premium-box img {
    width: 250px; /* Fixed width on desktop */
    flex-shrink: 0; /* Prevent the image from shrinking */
  }
}
</style>