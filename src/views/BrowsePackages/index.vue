<template>
  <v-container v-show="!enterCodeDialog" style="margin-top: 80px; width: 100%" class="full-screen-container"
    max-width="100vw">
    <!-- Title Section -->
    <v-row justify="center" class="mb-4">
      <h1 class="buy-content">Buy Content Subscription</h1>
    </v-row>
    <v-row justify="center" class="top-btn-container">
      <v-btn class="top-btn">Top Up With Code</v-btn>
      <v-btn text class="top-btn2">How to get a code</v-btn>

    </v-row>

    <!-- loader animation starts -->
    <div class="spinner-container" v-if="isLoading">
      <!-- <div class="flex items-center justify-center h-screen"> -->
      <img :src="Logo" class="logo-in-loader" style="height:40px;" />
      <div class="loader">
      </div>
    </div>
    <!-- loader animation ends -->



    <v-row align="center" class="cards-container" v-if="!isLoading">


      <v-col v-for="card in packagesAvailable" :key="card.id" class="d-flex justify-center ga-5 flex-wrap ">

        <v-card elevation="2" class="card">

          <!-- Card Image -->
          <v-img :src="card.image" class="card-image" cover></v-img>

          <!-- Card Content -->
          <v-card-title class="card-title">{{ card.title }}</v-card-title>

          <!-- <v-card-title class="card-subtitle">{{ card.access }}</v-card-title> -->
          <v-card-text class="card-description">
            {{ card.description }}
          </v-card-text>
          <hr class="divider" />
          <v-card-actions class="btn-container">
            <v-btn class="custom-btn enter-details" @click="handleOpenEnterCodePopup(card.id)">
              Enter Code
            </v-btn>
            <v-btn class="view-details">View Details</v-btn>
          </v-card-actions>
        </v-card>
        <v-card elevation="2" class="card">
          <!-- Card Image -->
          <v-img :src="card.image" class="card-image" cover></v-img>

          <!-- Card Content -->
          <v-card-title class="card-title">{{ card.title }}</v-card-title>
          <!-- <v-card-title class="card-subtitle">{{ card.access }}</v-card-title> -->
          <v-card-text class="card-description">
            {{ card.description }}
          </v-card-text>
          <hr class="divider" />
          <v-card-actions class="btn-container">
            <v-btn class="custom-btn enter-details" @click="handleOpenEnterCodePopup(card.id)">
              Enter Code
            </v-btn>
            <v-btn class="view-details">View Details</v-btn>
          </v-card-actions>
        </v-card>

      </v-col>
    </v-row>
    <v-row justify="center">


      <div v-if="packagesAvailable.length !== 0">

        <v-card class=" mb-4">

          <!-- Card Content -->
          <v-card-text class="card-title">{{ message }}</v-card-text>

        </v-card>
      </div>


    </v-row>

  </v-container>
</template>




<script setup>
import Logo from '@/assets/img/starter-logo.png';
import useAuthStore from '@/store/useAuthStore';
import { ref, onMounted, computed } from "vue";
import { packageStatus } from "@/utils/siberAPI";
const enterCodeDialog = ref(false);
const activeCardId = ref(null); // Track which card is active

const authStore = useAuthStore();

const isLoading = computed(() => authStore.getLoadingState);
const packagesAvailable = ref([]);
const message = ref('')

// console.log(isLoading.value, "this is value")



const handleOpenEnterCodePopup = (cardId) => {
  activeCardId.value = cardId; // Set active card ID
  enterCodeDialog.value = true;
};

const handleCloseEnterCodePopup = () => {
  enterCodeDialog.value = false;
  activeCardId.value = null; // Reset active card ID
};






// const formatDate = (dateString) => {
//   const date = new Date(dateString);

//   const day = date.getDate();
//   const month = date.toLocaleString('default', { month: 'long' });
//   const year = date.getFullYear();

//   // Function to add ordinal suffix
//   const getOrdinalSuffix = (day) => {
//     if (day % 10 === 1 && day !== 11) return `${day}st`;
//     if (day % 10 === 2 && day !== 12) return `${day}nd`;
//     if (day % 10 === 3 && day !== 13) return `${day}rd`;
//     return `${day}th`;
//   };

//   const formattedDay = getOrdinalSuffix(day);

//   return `${formattedDay} ${month}, ${year}`;
// }


const viewPackageStatus = async () => {
  try {
    authStore.setLoading(true);
    const response = await packageStatus();
    console.log('response :', response)

    if (response.data.status === 200) {
      if (Array.isArray(response.data.packages) && response.data.packages.length >= 0) {
        console.log('here')
        packagesAvailable.value = response.data.packages;
      } else if (Array.isArray(response.data.lots) && response.data.lots.length >= 0) {
        console.log('here 2')
        packagesAvailable.value = response.data.lots;

      } else {
        console.log('here 3')

        packagesAvailable.value = []; // Ensure it’s always an array
      }
      message.value = response.data.message || "No message available";
      console.log(message.value, 'message')

    } else {
      packagesAvailable.value = [];
      message.value = "Invalid response status";
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
/* loading animation starts from here  */
.spinner-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40vh;
  position: relative;
}

.loader {
  position: relative;
  width: 100px;
  height: 100px;
  border: 6px solid #3498db;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;

}

.logo-in-loader {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* loading animation ends from here  */

.v-row {
  display: flex;
  flex-wrap: wrap;
  flex: none;
  /* flex: 1 1 auto; */
  margin: -12px;
}

/* Full Screen Container */
.background-dark {
  background-color: black;
}

.full-screen-container {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  /* z-index: 999999; */
  /* background-color: black; */
}

/* Cards Section */

.cards-container {
  margin-top: 0px;
  background: rgb(2, 85, 128);
  border-radius: 20px;
  padding: 0px;
  display: flex;

  /* justify-content: center; */
  max-width: 2200px;
  margin-inline: auto;

}



/* Individual Cards */
.card {
  background-color: rgb(55, 55, 55);
  border-radius: 10px;
  display: flex;
  flex-direction: column;

  height: 100%;
  /* Ensures cards have consistent height */
  max-width: 360px;
  text-align: center;
  padding: 12px 12px;
  padding-bottom: 18px;
}

/* Card Image */
.card-image {
  height: 140px;
  border-radius: 12px;
  object-fit: cover;
  object-position: top;
}

/* Card Titles and Descriptions */
.card-title {
  font-weight: bold;
  font-size: 16px;
  margin: 10px 0;
  min-height: 20px;
  /* Ensures consistent alignment for titles */
  line-height: 0;
  /* overflow: visible; */
  text-wrap: wrap;
  text-align: center;
  margin-bottom: 0px;
  /* border: 2px solid red; */
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 80px;
  /* border: 2px solid red; */
  padding: 2px 0px 0px 0px;
  color: rgb(229, 224, 224) !important;
}

.card-subtitle {
  margin: 0px;
  font-size: 13px;
  color: rgb(229, 224, 224) !important;
  /* border: 2px solid red; */
  text-overflow: ellipsis;
  padding: 7px 0;
  /* margin-bottom: 5px; */
}

.divider {
  border: 0.7px solid rgb(84, 84, 84);
}

.card-description {
  text-align: justify;
  margin-bottom: 0px;
  margin: 10px;
  max-height: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  text-align: left;
  padding-inline: 0;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 6;
  /* Limits description to 3 lines */
  font-size: 12px;
  color: rgb(229, 224, 224) !important;
  /* border: 2px solid red; */
}

/* Button Container */
.btn-container {
  display: flex;
  flex-direction: column;
}

.enter-details,
.view-details {
  border-radius: 20px;
  color: rgb(229, 224, 224) !important;
  /* font-size: 14px; */
  /* margin: 5px 0; */
  margin-top: 2px;
  font-size: 12px;
}

.custom-btn {
  color: rgb(229, 224, 224) !important;
  display: inline-block;
  padding-inline: 40px;
  margin-top: 6px;
  font-size: 12px;
  border-radius: 20px;
  background: rgb(2, 85, 128);
  /* color: white; */
  text-transform: none;
}

/* .enter-code {
    background-color: blue;
    color: white;
  } */

.view-details {
  background-color: gray;
  color: white;
  display: inline-block;
  padding-inline: 38px;
  text-transform: none;
}

/* Top Buttons */
.top-btn-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.buy-content {
  font-size: 28px;
  font-weight: 600;
  /* border: 2px solid red; */

}

.top-btn {
  width: 260px;
  border-radius: 50px;

  border-radius: 50px;

  background: rgb(2, 85, 128);
}

.top-btn2 {
  width: 260px;
  border-radius: 50px;
  color: yellow;
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
