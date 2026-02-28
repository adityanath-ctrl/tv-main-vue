<template>
  <v-dialog v-model="dialogComputed" persistent>
    <v-card class="popup-box" style="border-radius: 20px;">
      <!-- Close Icon at the Top -->
      <v-btn icon class="close-btn" @click="closePopup" aria-label="Close"
        style="background-color: transparent; border: 1px solid #fff;">
        <v-icon style="background-color: none!important;">mdi-close</v-icon>
      </v-btn>
      <!-- Logo at the Top -->
      <div class="logo-container">
        <img :src="logo" class="d-flex justify-start align-center" style="height:40px;" />
      </div>
      <!-- Popup Content -->
      <v-card-title class="d-flex justify-center">
        <h2 class="heading">Deactivate a device</h2>
      </v-card-title>
      <v-card-text class="text-center white-text">
        <p>
          Please Deactivate a device first to enable adding another in its place.
        </p>
      </v-card-text>

      <!-- First Card -->

      <ul v-for="(item, index) in devicesData" :key="index" class="popup-item-ul">
        <li style=" list-style: none;">
          <div class=" card-btn" width="100%">

            <p class="device-name"> {{ handleDeviceTitle(item.device_type) }}</p>

            <v-btn class="btn-deactivate" @click="handleDeactivate(item)">Deactivate</v-btn>

          </div>
        </li>
      </ul>


      <!-- Second Card -->
      <!-- <v-card color="white card-2" class="btn-lg rounded-card">
        <p class="device-name">Google Set Top Box</p>
        <v-btn class="btn-deactivate">Deactivate</v-btn>
      </v-card> -->

      <!-- Cancel Button -->
      <v-btn class="btn-cancel mt-10" @click="confirmAction">Cancel</v-btn>
    </v-card>
  </v-dialog>

</template>
<script setup>
import { watchEffect, computed, ref } from 'vue';
import logo from '../../assets/img/starter-logo.png';

// Define props for handling the popup and actions
const props = defineProps({
  closePopup: {
    type: Function,
    required: true,
  },
  dialog: {
    type: Boolean,
    required: true,
  },
  devicesData: {
    type: Array,
    required: true,
  },
  handleDeactivate: {
    type: Function,
    required: true,
  },
  handleDeviceTitle: {
    type: Function,
    required: true,
  }
  // logo: {
  //   type: String,
  //   required: true,
  // }
});


// Use the props directly
const { closePopup, handleDeviceTitle } = props;
const dialogState = ref(props.dialog);
// Update dialogState whenever props.dialog changes
watchEffect(() => {
  dialogState.value = props.dialog;
});

// Computed property to return the dialog state value
const dialogComputed = computed(() => dialogState.value);
// console.log(dialog, 'here')
const confirmAction = () => {
  closePopup();
};
</script>
<style scoped>
.popup-box {
  background-color: #1A1919;
  /* Gray background for the popup */
  padding: 45px;
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.4);
  /* Add a subtle shadow */
  margin: auto;
  /* Center horizontally */
  display: flex;
  /* Use flexbox for centering */
  flex-direction: column;
  /* Stack children vertically */
  align-items: center;
  /* Center align horizontally */
  justify-content: center;
  /* Center align vertically */
  border-radius: 40px;
  /* Add rounded corners */
}



.rounded-card {
  border-radius: 12px;
  /* Matches the rounded card shape */
  box-shadow: none;
  /* Add or remove shadow if needed */
}

.device-name {
  font-size: 15px;
  margin-left: 20px;
  font-weight: 600;
  color: #333;
  margin-top: 7px;
}

.btn-deactivate {
  background-color: #333333;
  color: white;
  text-transform: none;
  font-weight: 600;
  padding: 5px 20px;
  border-radius: 16px;
}

.card-btn {
  background-color: #fff;
  display: flex;
  padding: 10px;
  justify-content: space-between;
  width: 100%;
  border-radius: 10px;

}

.popup-item-ul {
  width: 100%;
  margin-bottom: 10px;
}

.btn-bg {
  padding: 10px 41px;
}

.btn-lg {
  padding: 10px 41px;
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  /* Add spacing between the logo and heading */
}

.white-text p {
  color: white;
  /* White color for paragraph text */
  font-weight: bold;
  /* Make the text bold */
}

.v-overlay {
  background-color: rgba(0, 0, 0, 0.32) !important;
  /* Background with opacity */
  backdrop-filter: blur(1px);
  /* Blur effect */
  position: fixed;
  /* Position to overlay over everything */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  /* Ensure it appears above other content */
}



.btn-deactivate:hover {
  background-color: #555555;
}

.btn-cancel {
  background-color: white;
  color: black;
  text-transform: none;
  font-weight: 600;
  padding: 8px 24px;
  border-radius: 16px;
  border: 1px solid #ccc;
}

.btn-cancel:hover {
  background-color: white !important;
}

.heading {
  font-size: 20px;
  /* Set the text size to 40px */
  font-weight: bold;
  /* Make the heading text bold */
}

.v-card-actions {
  width: 100%;
  /* Ensure full width */
  display: flex;
  margin-top: 3rem;
  justify-content: center;
  /* Center align horizontally */
  align-items: center;
  /* Center align vertically */
  gap: 80px;
  /* Increased gap between buttons */
}

.popup-btn {
  background-color: white !important;
  /* White button background */
  color: black !important;
  /* Black button text */
  border-radius: 30px;
  width: 8rem;
  /* Fixed width for buttons */
}

.v-btn:hover {
  background-color: #6A6767;
  /* Slight hover effect */
}

/* Base styling for the cards */
.card-1 {
  display: flex;
  gap: 20rem;
  margin-top: 20px;
}

.card-2 {
  display: flex;
  gap: 13rem;
  margin-top: 20px;
}



.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  color: white;
}

/* Adjust for smaller screens */
@media (max-width: 767px) {
  .card-1 {
    gap: 8rem;
  }

  .card-2 {
    gap: 1rem;
  }

  .btn-bg {
    padding: 10px 24px;
  }

  .btn-lg {
    padding: 10px 24px;
  }

  .device-name {
    font-size: 1rem;
  }
}

@media (max-width: 400px) {
  .card-1 {
    gap: 5rem;
  }

  .card-2 {
    gap: 1rem;
  }
}


@media (max-width: 600px) {
  .popup-box {
    padding: 1rem;
  }

  .heading {
    font-size: 1.2rem;
  }

  .v-card-actions {
    gap: 1rem;
  }

  .popup-btn {
    width: 5rem;
    height: 2rem;
  }
}
</style>