<template>
  <v-dialog v-model="dialogComputed" persistent class="realtive">
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
        <h2 class="heading">Deny Device Approval</h2>
      </v-card-title>
      <v-card-text class="text-center white-text">
        <p>
          Are you sure you want to deny this device's request?
        </p>
      </v-card-text>
      <v-card-actions class="d-flex justify-center align-center gap-4">
        <v-btn outlined color="white" class="popup-btn" @click="closePopup()">
          No
        </v-btn>
        <v-btn outlined color="white" class="popup-btn" @click="confirmAction">
          Yes
        </v-btn>
      </v-card-actions>
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



});


// Use the props directly
const { closePopup } = props;
const dialogState = ref(props.dialog);
// Update dialogState whenever props.dialog changes
watchEffect(() => {
  dialogState.value = props.dialog;
});
// Watch for dialogState changes and execute actions (like logging)
// watchEffect(() => {
//   if (dialogState.value) {
//     console.log('Dialog is open');
//   } else {
//     console.log('Dialog is closed');
//   }
// });
// Computed property to return the dialog state value
const dialogComputed = computed(() => dialogState.value);
// console.log(dialog, 'here')
const confirmAction = () => {
  // console.log("Action confirmed");
  closePopup();
};
</script>
<style scoped>
.popup-box {
  background-color: #1A1919;
  /* Gray background for the popup */
  /* Fixed width */
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




.heading {
  font-size: 20px;
  /* Set the text size to 40px */
  font-weight: medium;
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

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  color: white;
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