<template>
  <v-dialog v-model="dialogComputed" persistent fullscreen>
    <v-card class="popup-box">
      <!-- Logo at the Top -->
      <div class="logo-container">
        <img :src="logo" class="d-flex justify-start align-center app-logo" />
      </div>

      <div class="premium-box">
        <div>
          <v-card-text class="text-small-heading">
            Why Connect Your Device to Your {{ SITE_TITLE }} Account?
          </v-card-text>

          <v-card-text class="text-small-description">
            Connecting your device to your {{ SITE_TITLE }} account allows you to enjoy seamless, secure access to your favorite content and all {{ SITE_TITLE }} features on your TV.
          </v-card-text>

          <v-card-text class="text-small-heading">
            How It Works:
          </v-card-text>

          <v-card-text class="text-small-description">
            <strong>Request to Connect:</strong> When you send a connection request, it will be sent to the account holder for approval.
          </v-card-text>

          <v-card-text class="text-small-description">
            <strong>Account Holder Approval:</strong> The account holder will review your request and can either accept or deny it.
          </v-card-text>

          <v-card-text class="text-small-description">
            <strong>Enjoy Streaming:</strong> Once approved, your device will be linked to the {{ SITE_TITLE }} account, and you can start streaming right away!
          </v-card-text>

          <v-card-text class="text-small-heading">
            Need Help?
          </v-card-text>

          <v-card-text class="text-small-description">
            If you're having trouble or need further assistance, please contact our support team.
          </v-card-text>

          <div class="logo-container">
            <v-btn class="btn-ok mt-5" @click="confirmAction">Back</v-btn>
          </div>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>


<script setup>
import { watchEffect, computed, ref } from 'vue';
import logo from '../../assets/img/starter-logo.png';
import { SITE_TITLE } from '@/mainConfig';
// import { addDeviceRequest } from '../../utils/siberAPI';
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
const { closePopup, dialog } = props;
const dialogState = ref(props.dialog);

// console.log(dialogState, 'state')
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
  background-color: #363636;
  padding: 40px;
  display: flex;
  flex-direction: column; /* stack vertically */
  overflow-y: auto;       /* allow scrolling */
  height: 100vh;          /* take full screen height */
}

.input-container {
  display: flex;
  margin-bottom: 30px;
}

.text-date {
  color: #25aae1;
}

.text-date-sum {
  color: #ff0000;
}

.box-blue {
  background-color: #25aae1;
  padding: 20px 140px;
  border-radius: 15px;
}

.btn-flex {
  display: flex;
  gap: 20px;
}

.custom-input {
  width: 300px;
  height: 40px;
  background-color: #666;
  /* Gray background similar to the image */
  border: none;
  border-radius: 20px;
  /* Rounded edges */
  padding: 0 15px;
  font-size: 16px;
  color: #fff;
  /* White text */
  outline: none;
  box-shadow: none;
  text-align: center;
}

.custom-input::placeholder {
  color: #ccc;
  /* Placeholder text color */
}

.rounded-card {
  border-radius: 12px;
  /* Matches the rounded card shape */
  box-shadow: none;
  /* Add or remove shadow if needed */
}

.device-name {
  font-size: 16px;
  color: #333;
  margin-top: 7px;
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
  margin-bottom: 40px;
  /* Add spacing between the logo and heading */
}

.app-logo {
  height: 80px;
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
  /* position: fixed; */
  /* Position to overlay over everything */
  top: 0;
  left: 0;
  width: 100%;

  z-index: 9999;

  /* Ensure it appears above other content */
}

.btn-limit {
  background-color: #333333;
  color: white;
  text-transform: none;
  font-weight: 600;
  padding: 5px 20px;
  border-radius: 16px;
}

.premium-box {
  display: flex;
  gap: 40px;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.btn-group {
  display: flex;
  font-weight: 400;
  gap: 20px
}

.text-large {
  font-size: 20px;
  text-align: center;
  font-weight: 700;
  padding: 0px !important;
  margin-bottom: 40px;
  margin-top: 40px;
}

.text-small-heading {
  font-size: 25px;
  text-align: left;
  font-weight: 800;
  color: #25aae1;
  padding: 0px !important;
  margin-bottom: 10px !important;
}

.text-small-description {
  font-size: 25px;
  text-align: left;
  padding: 0px !important;
  margin-bottom: 45px;
}

.btn-deactivate:hover {
  background-color: #555555;
}

.btn-ok {
  background-color: white;
  color: black;
  text-transform: none;
  font-size: 25px;
  width: 200px;
  height: 50px !important;
  border-radius: 30px;
  border: 1px solid #ccc;
  font-weight: 900;
}

.btn-ok:hover {
  background-color: white !important;
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
  font-size: 24px;
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
  gap: 21rem;
  margin-top: 20px;
}

.card-2 {
  display: flex;
  gap: 13rem;
  margin-top: 20px;
}

.device-name {
  font-size: 1.2rem;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  color: white;
}

@media (max-width: 1600px) {
  .heading {
    font-size: 22px;
    font-weight: bold;
  }

  .text-large {
    font-size: 18px;

    margin-bottom: 40px;
    margin-top: 40px;
  }

  .text-small-heading {
    font-size: 20px;
  }

  .text-small-description {
    font-size: 18px;
    margin-bottom: 30px;
  }

  .btn-ok {
    font-size: 18px;
    width: 150px;
    height: 40px !important;
    border-radius: 25px;

  }


}

@media (max-width: 767px) {
  .logo-container {
    margin-top: 10px;
    margin-bottom: 20px;
  }

  .premium-box {
    display: flex;
    gap: 40px;
    flex-direction: column;

  }

  .box-blue {
    background-color: #25aae1;
    padding: 100px 140px;
    border-radius: 15px;
  }

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

  .app-logo {
    height: 50px;
    width: auto;
    max-width: 100%;
  }

}

@media (max-width: 640px) {
  .card-1 {
    gap: 5rem;
  }

  .card-2 {
    gap: 1rem;
  }

  .heading {
    font-size: 20px;
    font-weight: bold;
  }

  .text-large {
    font-size: 17px;

    margin-bottom: 40px;
    margin-top: 40px;
  }

  .text-small-heading {
    font-size: 15px;
  }

  .text-small-description {
    font-size: 15px;
    margin-bottom: 20px;
  }

  .btn-ok {
    font-size: 14px;
    width: 130px;
    height: 30px !important;
    border-radius: 25px;

  }
}
</style>