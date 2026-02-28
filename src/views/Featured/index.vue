<!-- /src/views/Featured/index.vue -->
<template>
  <FeaturedCategories v-if="SideMenus.length" />
</template>

<script setup>
import { computed } from 'vue';
import FeaturedCategories from './FeaturedCategories.vue';
import useMenuStore from '@/store/useMenuStore';

const menuStore = useMenuStore();

const SideMenus = computed(() => {
  return menuStore?.SideMenus || [];
});
</script>
