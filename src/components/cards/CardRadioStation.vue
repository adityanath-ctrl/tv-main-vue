<template>
  <div class="d-flex flex-column bg-none w-100" :class="[isViewMore ? 'py-3' : 'pb-10 pt-2']"
    @click="onClickRadioStation(item.radio_id)" style="cursor: pointer">
    <div class="slider-img-container">

      <img :src="item.radio_image" class="radio-image" :title="item.radio_name_short" />

    </div>
  </div>
</template>

<script>
import {
  BACKGROUND_COLOR_2,
} from '@/mainConfig';

export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
    isViewMore: {
      type: Boolean,
      required: false
    }
  },
  data() {
    return {
      active_vod: 'active-vod',
      card_vod_img: 'card-vod-img',

      BACKGROUND_COLOR_2
    }
  },
  methods: {
    onClickRadioStation(radio_id) {
      this.$router.push({ path: "/player/radio/" + radio_id });
    },
  }
}
</script>

<style scoped>
.grid-item {
  width: 100%;
  height: 100%;
  object-fit: cover;
  min-width: 80px;
  border-radius: 10px;
}

.slider-img-container {
  background-color: v-bind(BACKGROUND_COLOR_2);
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  border-radius: 10px;
  overflow: hidden;
  min-width: 80px;
}

.radio-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
