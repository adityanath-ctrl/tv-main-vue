<template>
  <v-container fluid style="padding:0px" @click="navigationStateChange()">
    <v-row :style="{ marginBottom: FeaturedItems?.length ? '30px' : '120px' }">
      <v-col cols="12" md="12">
        <Slider v-if="FeaturedItems?.length" :FeaturedSlider="FeaturedItems" />
      </v-col>
    </v-row>

    <v-row v-for="(category, i) in Categories" :id="`catid-${category.menuCategoryIds}`"
      v-show="`catid-${category.menuCategoryIds}` !== `catid-${categoriesWithNoEvents}`">
      <v-col cols="6" md="6"
        v-if="category.menuContentType == 'LIVE_EVENTS' || category.menuContentType == 'LIVE_TV' || category.menuContentType == 'SVOD' || category.menuContentType == 'LIVE_STREAM' || category.menuContentType == 'SPORTS'">
        <h4 class="text-left ml-10 fcw">{{ category.categoryName }}</h4>
      </v-col>
      <v-col cols="6" md="6" class="d-flex flex-row-reverse pr-8"
        v-if="category.menuContentType == 'LIVE_EVENTS' || category.menuContentType == 'LIVE_TV' || category.menuContentType == 'SVOD' || category.menuContentType == 'LIVE_STREAM' || category.menuContentType == 'SPORTS'">
        <img class="ml-10 fcw" :src="ViewMoreButton" :style="viewMoreButtonStyle"
          @click="goToCategoryPage(category.menuCategoryIds, category.menuContentType)" />
      </v-col>
      <v-col cols="12" md="12">
        <CardEvents :categoryId="category.menuCategoryIds" v-if="category.menuContentType == 'LIVE_EVENTS'"
          @no-events="handleNoEvents" />
        <!-- <pre>{{ category.menuCategoryIds }}</pre> -->
        <CardLive :categoryId=category.menuCategoryIds v-if="category.menuContentType == 'LIVE_TV'" />
        <CardVod :categoryId=category.menuCategoryIds v-if="category.menuContentType == 'SVOD'" />
        <CardStream :categoryId=category.menuCategoryIds v-if="category.menuContentType == 'LIVE_STREAM'" />
        <CardSports :categoryId=category.menuCategoryIds v-if="category.menuContentType == 'SPORTS'" />
      </v-col>
    </v-row>

    <div v-if="isEPG">
      <EPG />
    </div>

  </v-container>
</template>

<script  lang="js">

// import { defineComponent } from 'vue';
import EPG from '../components/epg/index.vue';
import Slider from '../components/Slider.vue';
import CardEvents from '../components/card-rows/CardEventsRow.vue';
import CardLive from '../components/card-rows/CardLiveTVRow.vue';
import CardVod from '../components/card-rows/CardVodRow.vue';
import CardStream from '../components/CardStream.vue';
import CardSports from '../components/CardSports.vue';
import ViewMoreButton from '../assets/img/view-more-button-icon-words-only.svg';

export default ({
  name: 'DynamicHomeSub',
  components: {
    EPG,
    Slider,
    CardEvents,
    CardLive,
    CardVod,
    CardStream,
    CardSports,
  },
  data: () => ({
    open: ['Users'],
    FeaturedItems: [],
    Categories: [],
    categoriesWithNoEvents: '',
    ViewMoreButton: ViewMoreButton,
    viewMoreButtonStyle: {
      'width': '150px',
      'cursor': 'pointer'
    },

    isEPG: false
  }),
  mounted() {
    setTimeout(() => {
      this.getContent()
    }, 1000)
  },
  computed: {
    epgChannelListMap() {
      return this.$store.state.EPGStore.epgChannelListMap;
    },
    MainMenuTypes() {
      let MainMenuTypes = this.$store.state.MenuStore.MainMenuTypes;
      return MainMenuTypes;
    }
  },
  methods: {
    getContent() {
      let MainMenuTypes = this.MainMenuTypes;

      if (this.$route.params.subMenuId && MainMenuTypes[Number(this.$route.params.menuId)]) {
        let data = MainMenuTypes[Number(this.$route.params.menuId)].sub_menu_items.find(arr => Number(arr.id) == Number(this.$route.params.subMenuId));

        if (data.subMenuItemLayout === 'TV_Layout_1') {
          // EPG
          this.$store.dispatch("getChannelCategories");
          this.isEPG = true;
        } else {
          // Featured Items
          if (data.featured_items?.length) {
            this.FeaturedItems = data.featured_items
          }

          // Categories
          if (data.categories?.length) {
            this.Categories = data.categories
          }
        }
      }
    },
    handleNoEvents(categoryId) {
      this.categoriesWithNoEvents = categoryId;
    },
    goToCategoryPage(id, menuContentType) {
      this.$router.push({ path: '/category/' + id + '/' + menuContentType });
    },
    navigationStateChange() {
      this.$store.dispatch("changeNavigationState", false);
    }
  }
});

</script>
