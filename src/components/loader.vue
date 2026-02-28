<template>
  <div v-if="loadingState">
    <!-- <div class="text-heading" v-if="isLoading"> -->
    <div class="spinner-container">
      <!-- <div class="flex items-center justify-center h-screen"> -->
      <!-- <img :src="Logo" class="logo-in-loader" style="height:40px;" /> -->
      <div class="loader">
      </div>
    </div>
    <!-- Loading... -->
  </div>

</template>

<script setup>
import { watchEffect, ref } from 'vue';
// import Logo from '@/assets/img/app-logo-200h.png';
const props = defineProps({
  isLoading: {
    type: Boolean,
    required: true,
  }
})
const loadingState = ref(props.isLoading)
const { isLoading } = props

watchEffect(() => {
  loadingState.value = isLoading
})


</script>

<style scoped>
.spinner-container {
  display: flex;
  align-items: center;
  justify-content: center;

  position: relative;
}


.loader {
  position: relative;
  width: 40px;
  height: 40px;
  border: 3px solid #3498db;
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
</style>
