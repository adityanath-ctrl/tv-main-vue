<!-- src/views/Search/ViewAll.vue -->
<template>
    <v-container class="view-all-container" fluid>
        <div v-if="categoryData?.name" class="header-row">
            <router-link :to="`/search?q=${searchQuery}`" class="back-link">
                <v-icon>mdi-arrow-left</v-icon>
                <span>Back to All Results</span>
            </router-link>
            <h1 class="text-h4 mt-4">{{ categoryData.name }}</h1>
        </div>

        <div v-if="items.length > 0" class="results-grid" :class="gridClass">
            <!-- We reuse the same card components from your project -->
            <div v-for="item in items" :key="item.id || item.channel_id || item.match_id" class="grid-item">
                <!-- Render the correct card based on the category name -->
                <CardLiveTV v-if="categoryName === 'tv'" :item="mapItem(item)" />
                <CardVod v-if="categoryName === 'movies' || categoryName === 'series'" :item="mapItem(item)" />
                <CardEvent v-if="categoryName === 'events'" :item="mapItem(item)" />
                <CardLiveSport v-if="categoryName === 'sports'" :item="mapItem(item)" />
            </div>
        </div>

        <div v-else class="no-results">
            <p>No items found for this category.</p>
        </div>
    </v-container>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import useSearchStore from '@/store/useSearchStore';
// Import all the individual card components you use
import CardLiveTV from '@/components/cards/CardLiveTV.vue';
import CardVod from '@/components/cards/CardVod.vue';
import CardEvent from '@/components/cards/CardEvents.vue';
import CardLiveSport from '@/components/cards/CardLiveSports.vue';

const props = defineProps({
    categoryName: { type: String, required: true }
});

const route = useRoute();
const searchStore = useSearchStore();

// Get the original search query from the URL to build the "Back" link
const searchQuery = computed(() => route.query.q || '');

// Get the data for the specific category directly from the store
const categoryData = computed(() => searchStore.getCategoryData(props.categoryName));
const items = computed(() => categoryData.value?.data || []);

// This helper ensures that the card components receive the correct prop names (id, name, etc.)
// by mapping fields like 'vod_id' to a generic 'id'.
const mapItem = (item) => {
    if (props.categoryName === 'tv') {
        return {
            ...item,
            id: item.channel_id,
            icon_url: item.channel_image, // This is the key fix
            title: item.channel_name,
        };
    }
    if (props.categoryName === 'movies' || props.categoryName === 'series') {
        // This part is likely for CardVod, which might have different property names
        return {
            ...item,
            id: item.vod_id || item.vod_series_id,
            name: item.vod_name_short || item.vod_series_name_short,
            poster_url: item.poster_url,
        };
    }

    // Add mappers for sports and events if their ID/image fields differ
    if (props.categoryName === 'sports') {
        return { ...item, id: item.match_id };
    }
    if (props.categoryName === 'events') {
        return { ...item, id: item.live_event_id };
    }

    // Fallback for any other types
    return item;
};

const gridClass = computed(() => {
  // Define an array of categories that need the wider grid layout
  const wideLayoutCategories = ['tv', 'sports'];
  
  // If the current category is in our list, apply the wide grid class.
  if (wideLayoutCategories.includes(props.categoryName)) {
    return 'wide-grid'; // Use a more generic name
  }
  
  // Otherwise, use the default grid class.
  return 'default-grid';
});
</script>

<style scoped>
.view-all-container {
    margin-top: 80px;
    padding: 1rem 2rem;
}

.header-row {
    margin-bottom: 2rem;
}

.back-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: inherit;
    opacity: 0.8;
    margin-bottom: 1rem;
}

/* --- GRID STYLES --- */
.results-grid {
  display: grid;
  gap: 1.5rem;
}

/* Default grid for Movies, Series, etc. (portrait posters) */
.default-grid {
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

/* Specific grid for Live TV (landscape posters) */
.wide-grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}


.no-results {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 40vh;
  font-size: 1.2rem;
  opacity: 0.7;
}

/* Keep the mobile media query for smaller posters */
@media (max-width: 600px) {
  .default-grid, .wide-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}
</style>