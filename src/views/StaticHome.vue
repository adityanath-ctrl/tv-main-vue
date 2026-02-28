<template>
  <!-- bind the background via :style -->
  <div class="static-home" :style="bgStyle">
    <div class="overlay">
      <div class="content">
        <h1 class="visually-hidden">Welcome</h1>
        <v-btn size="x-large" class="cta-btn" @click="onPrimaryClick">
          {{ isLoggedIn ? 'My Account' : 'Sign In' }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import useAuthStore from '@/store/useAuthStore';

// ✅ Import the image so Vite resolves it in dev & build
import staticHomeBG from '@/assets/img/static-home-bg.jpg';

const router = useRouter();
const authStore = useAuthStore();

const isLoggedIn = computed(() => authStore.isUserLoggedIn);

// ✅ Build the inline style object using the imported URL
const bgStyle = computed(() => ({
  backgroundImage: `url(${staticHomeBG})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
}));

const onPrimaryClick = () => {
  if (isLoggedIn.value) {
    router.push({ name: 'MyAccount' });
  } else {
    authStore.loginUser();
  }
};
</script>

<style scoped>
.static-home {
  position: relative;
  width: 100%;
  height: 100vh;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.cta-btn {
  border-radius: 9999px;
  padding: 14px 28px;
}

.visually-hidden {
  position: absolute !important;
  left: -9999px !important;
}
</style>
