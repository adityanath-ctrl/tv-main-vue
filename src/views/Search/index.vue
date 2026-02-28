<template>
  <v-container class="search-container" fluid>
    
    <!-- This v-row now uses Vuetify's props to control the layout -->
    <v-row class="header-row" align="center">
      
      <!-- 
        On mobile (xs), this column takes up all 12 grid spaces.
        On medium screens and up (md), it takes up 5.
        This automatically makes them stack on mobile and sit side-by-side on desktop.
      -->
      <v-col cols="12" md="5" class="header-title-col">
        <div class="text-h5">All Results / {{ query }}</div>
      </v-col>
      
      <v-col cols="12" md="7" class="header-search-col">
        <SearchInput alwaysExpanded />
      </v-col>

    </v-row>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="loader-container">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </div>

    <!-- Search Results -->
    <div v-else>
      <template v-for="categoryName in searchStore.searchCategories" :key="categoryName">
        
        <v-row class="category-header">
          <v-col cols="6">
            <h4 class="text-left category-title">{{ searchStore.getCategoryData(categoryName)?.name }}</h4>
          </v-col>
          <v-col v-if="type === 'all'" cols="6" class="d-flex justify-end">
            <div class="view-all-btn" @click="goToViewAllView(categoryName)">
              View All
            </div>
          </v-col>
        </v-row>

        <v-row class="content-row">
          <v-col cols="12">
            <CardLiveTVSearchRow v-if="categoryName === 'tv'" :items="searchStore.getCategoryData('tv')?.items" :seeAll="type !== 'all'" />
            <CardVodSearchRow v-if="categoryName === 'movies'" :items="searchStore.getCategoryData('movies')?.items" :categoryName="categoryName" :seeAll="type !== 'all'" />
            <CardVodSearchRow v-if="categoryName === 'series'" :items="searchStore.getCategoryData('series')?.items" :categoryName="categoryName" :seeAll="type !== 'all'" />
            <CardEventsSearchRow v-if="categoryName === 'events'" :items="searchStore.getCategoryData('events')?.items" :categoryName="categoryName" :seeAll="type !== 'all'"/>
            <CardLiveSportsSearchRow v-if="categoryName === 'sports'" :items="searchStore.getCategoryData('sports')?.items" :categoryName="categoryName" :seeAll="type !== 'all'" />
          </v-col>
        </v-row>
        
      </template>
    </div>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useSearchStore from '@/store/useSearchStore';
import SearchInput from '../../components/SearchInput.vue';
import CardLiveTVSearchRow from '../../components/card-rows/CardLiveTVSearchRow.vue';
import CardVodSearchRow from '../../components/card-rows/CardVodSearchRow.vue';
import CardEventsSearchRow from '../../components/card-rows/CardEventsSearchRow.vue';
import CardLiveSportsSearchRow from '../../components/card-rows/CardLiveSportsSearchRow.vue';

const route = useRoute();
const router = useRouter();
const searchStore = useSearchStore();

const query = ref(route.query.q || '');
const type = ref(route.query.type || 'all');
const isLoading = ref(false);

watch(() => route.query.q, (newQuery) => {
  if (newQuery) {
    query.value = newQuery;
    getSearchData(newQuery);
  }
});

const getSearchData = async (searchQuery) => {
  isLoading.value = true;
  await searchStore.getSearchData({ query: searchQuery });
  isLoading.value = false;
};

const goToViewAllView = (categoryType) => {
  router.push({
    name: 'SearchViewAll',
    params: { categoryName: categoryType },
    query: { q: query.value }
  });
};

onMounted(() => {
  if (query.value) {
    getSearchData(query.value);
  }
});
</script>

<style scoped>
/* --- BASE & DESKTOP STYLES --- */
.search-container {
  margin-top: 100px;
  padding: 0 2rem;
}
.header-row {
  align-items: center;
}
.header-title-col {
  text-align: left;
}
.category-title {
  font-size: 1.25rem;
  padding-left: 10px;
}
.v-row.category-header {
  margin: 0 !important;
  padding: 0 !important;
  min-height: auto;
  align-items: center;
}
.v-row.content-row {
  margin-top: -10px !important;
  margin-bottom: 2rem !important;
}

.view-all-btn {
  cursor: pointer;
  font-weight: bold;
}
.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

/* --- MOBILE STYLES (< 960px) --- */
@media (max-width: 959px) {
  .search-container {
    margin-top: 80px;
    padding: 0 1rem;
  }
  
  .header-row {
    /* Stack the columns vertically */
    flex-direction: column;
    align-items: center; /* Center the columns themselves */
    margin-bottom: 2rem;
  }

  .header-title-col {
    text-align: center;
    /* Remove Vuetify's default vertical padding */
    padding-top: 0 !important;
    padding-bottom: 0.5rem !important; /* Add just a small space below */
  }

  .header-search-col {
    /* Remove Vuetify's default vertical padding */
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }
}
</style>