<template>
  <div class="search-container" :class="{ expanded: alwaysExpanded }">
    <input type="text" v-model="searchQuery" placeholder="Search" @input="onSearch"
      :style="{ height: alwaysExpanded ? '40px' : '36px' }" @keyup.enter="performSearch" />
    <v-icon v-if="searchQuery && alwaysExpanded" class="close-icon" size="20" @click="clearSearch">
      mdi-close
    </v-icon>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const props = defineProps({
  alwaysExpanded: Boolean,
});

const router = useRouter();
const route = useRoute();
const searchQuery = ref('');
const timeoutId = ref(null);

// When component mounts, sync the input with the URL query
onMounted(() => {
  searchQuery.value = route.query.q || '';
});

// If the route changes (e.g., browser back button), update the input
watch(() => route.query.q, (newQuery) => {
  searchQuery.value = newQuery || '';
});

const onSearch = () => {
  if (timeoutId.value) {
    clearTimeout(timeoutId.value);
  }
  timeoutId.value = setTimeout(() => {
    performSearch();
  }, 1000); // Reduced delay for better UX
};

const performSearch = () => {
  // Only push to router if the query is not empty
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value } });
  }
};

const clearSearch = () => {
  searchQuery.value = '';
  // Optionally, you can also navigate to the base search page
  // router.push({ path: '/search' });
};
</script>

<style scoped>
.search-container {
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  /* Default desktop width */
  width: 250px;
}

.search-container input {
  width: 100%;
  transition: width 0.3s ease;
  background-color: #333;
  color: #fff;
  border: 1px solid #424242;
  outline: none;
  border-radius: 20px;
  text-align: center;
  padding: 0 30px;
  /* Add padding for the close icon */
}

.search-container .close-icon {
  position: absolute;
  right: 10px;
  /* Position inside the input padding */
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
}

/* --- MOBILE STYLES --- */
@media (max-width: 959px) {
  .search-container {
    /* On mobile, make the container take full width of its parent column */
    width: 100%;
    /* Center the input within the container */
    justify-content: center;
  }

  .search-container input {
    /* Control the actual input width on mobile */
    max-width: 350px;
  }
}
</style>