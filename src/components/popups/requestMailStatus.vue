<template>
  <v-dialog v-model="dialogComputed" persistent>
    <v-card class="popup-box" style="border-radius: 40px;">
      <div class="logo-container">
        <img :src="logo" class="d-flex justify-start align-center" style="height:40px;" />
      </div>
      <v-card-text class="text-large">{{ titleComputed }}</v-card-text>
      <v-card-text class="text-small">{{ messageComputed }}</v-card-text>
      <v-card-text class="text-small">Do you want to continue as guest ?</v-card-text>
      <!-- <v-btn class="btn-ok mt-5" @click="props.closePopup()">No</v-btn> -->
      <v-btn class="btn-ms mt-5" @click="props.handleSignout()">Continue</v-btn>
      <v-btn class="btn-ms mt-5" @click="props.handleLearnMoreDialog()">Learn More</v-btn>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue';
import logo from '../../assets/img/starter-logo.png';

const props = defineProps({
  closePopup: { type: Function, required: true },
  dialog: { type: Boolean, required: true },
  message: { type: String, required: true },
  title: { type: String, required: true },

  handleSignout: { type: Function, required: true },
  handleLearnMoreDialog: { type: Function, required: true },
});





const dialogState = ref(props.dialog);

watchEffect(() => {
  dialogState.value = props.dialog;
});

const dialogComputed = computed(() => dialogState.value);
const titleComputed = computed(() => props.title);
const messageComputed = computed(() => props.message);
</script>

<style scoped>
.popup-box {
  background-color: #1A1919;
  width: 550px;
  padding: 45px;
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.4);
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 40px;
}


.rounded-card {
  border-radius: 12px;
  box-shadow: none;

}

.device-name {
  font-size: 20px;
  color: #333;
  margin-top: 7px;
  font-weight: 700;
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

.btn-limit {
  background-color: #333333;
  color: white;
  text-transform: none;
  font-weight: 600;
  padding: 5px 20px;
  border-radius: 20px;
}

.btn-group {
  display: flex;
  font-weight: 400;
  gap: 2.5rem;
  margin-top: 10px;
}

.text-large {
  font-size: 17px !important;
  text-align: center;
  font-weight: 700;
  padding: 0px !important;
  margin: 20px 0
}

.text-small {
  font-size: 10px;
  width: 100%;
  text-align: center;
  padding: 0px !important;
  margin: 10px 0
}

.btn-deactivate:hover {
  background-color: #555555;
}

.btn-ms {
  background-color: white;
  color: black;
  text-transform: none;
  font-weight: 600;
  padding: 8px 24px;
  border-radius: 20px;
  border: 1px solid #ccc;
}



.btn-ms:hover {
  background-color: white !important;
}

.heading {
  font-size: 25px;
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

/* Adjust for smaller screens */
@media (max-width: 767px) {
  .popup-box {

    width: 95%;
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
    padding: 2rem 1rem;
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

  .text-large {
    font-size: 14px !important;

  }

  .text-small {
    font-size: 13px !important;
    width: 90%;

  }

}
</style>