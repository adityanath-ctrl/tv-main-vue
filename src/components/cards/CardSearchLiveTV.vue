<template>
  <div class="d-flex flex-column bg-none w-100 pb-10 pt-2" @click="onItemClicked()" style="cursor: pointer">
    <div class="slider-img-container">


      <div class="d-flex flex-column">
        <img :src="item.channel_image" class="card-img" />
      </div>
      <div class="position-absolute w-100 pb-4" style="bottom: 0; background-color: #000c;">
        <div class="d-flex flex-row text-left justify-space-between align-center pt-2 px-2">
          <div style="max-width: 80%;">
            <div class="single-line-text text-body-1" style="font-size: 18px !important;">
              {{ item.title }}
            </div>
          </div>
          <div>

            <img :src="item.icon_url || item.channel_image" style="width: 4vw; height: 4vw; border-radius: 1vw;" />
          </div>
        </div>


      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles/home' as *;
</style>

<script setup>
import { useRouter } from 'vue-router';
import {
  BACKGROUND_COLOR_2
} from '@/mainConfig';

// Define props
const props = defineProps({
  item: { type: Object, required: true }
});

// Use Vue Router
const router = useRouter();

function onItemClicked() {
  router.push({ path: '/live/player/' + (props.item.id || props.item.channel_id) });
}

</script>

<style scoped>
.slider-img-container {
  background-color: v-bind(BACKGROUND_COLOR_2);
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  border-radius: 10px;
  overflow: hidden;
}

.card-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.premium-ribbon {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>