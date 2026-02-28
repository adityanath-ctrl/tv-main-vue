<template>
    <!-- AccessContent -->

    <div v-if="phoneWidth < 750">
        <div class="package-banner" v-if="this.getPackage && this.getPackage.length > 0"
            style="margin: 10px; flex-direction:column" @click="navigationStateChange()">
            <v-img :src="isDev ? CardVod : this.packageObj[0].package_image" width="400" class="package-banner-img"
                style="border-radius: 10px;"></v-img>
            <div class="d-flex flex-column text-center align-start ma-3">
                <div class="d-flex ma-auto">
                    <v-img :src="this.packageObj[0].content_provider_logo" width="50" height="50"
                        style="border-radius: 50%;" class="mr-3"></v-img>
                    <div class="text-left text-subtitle-1">
                        {{ this.packageObj[0].package_name }}<br />
                        <p class="text-caption text--disabled">
                            {{ this.packageObj[0].package_description }}
                        </p>
                    </div>
                </div>
            </div>
            <div class="text-center">
                <div class="text-h5">
                    ${{ this.packageObj[0].package_pgroups_cards[0].pgroup_price }}
                </div>
                <div class="text-subtitle-1 round-md">
                    <v-btn depressed color="white" :style="ButtonColor"
                        :href="this.packageObj[0].package_pgroups_cards[0].custom_data.store_url" target="_blank">
                        Purchase
                    </v-btn>
                </div>
            </div>
        </div>
    </div>
    <div v-if="phoneWidth >= 750 && phoneWidth <= 1024">
        <div class="package-banner" v-if="this.getPackage && this.getPackage.length > 0"
            @click="navigationStateChange()">
            <v-img :src="isDev ? CardVod : this.packageObj[0].package_image" width="400" class="package-banner-img"
                style="border-radius: 10px;"></v-img>
            <div class="d-flex my-5">
                <div class="d-flex flex-column justify-start text-left align-start pl-16" style="width: 65vw;">
                    <div class="d-flex justify-start align-center mb-5">
                        <v-img :src="this.packageObj[0].content_provider_logo" width="50" height="50"
                            style="border-radius: 50%;" class="mr-3"></v-img>
                        <div class="d-flex justify-start align-start text-subtitle-1">
                            {{ this.packageObj[0].package_name }}
                        </div>
                    </div>

                    <div class="text-subtitle-1 justify-center align-start">
                        <p class="text-caption text--disabled">
                            {{ this.packageObj[0].package_description }}
                        </p>
                    </div>
                </div>
                <div class="ma-auto" style="align-items: center;">
                    <div class="text-subtitle-1">
                        Subscription
                    </div>
                    <div class="text-h5 my-2">
                        ${{ this.packageObj[0].package_pgroups_cards[0].pgroup_price }}
                    </div>
                    <div class="text-subtitle-1 round-md">
                        <v-btn depressed color="white" :style="ButtonColor"
                            :href="this.packageObj[0].package_pgroups_cards[0].custom_data.store_url" target="_blank">
                            Purchase
                        </v-btn>
                    </div>
                </div>
            </div>
        </div>
        <div class="text-h6 mb-2">
            All content included in Subscription
        </div>
    </div>
    <div v-if="phoneWidth > 1024">
        <div class="package-banner" v-if="this.getPackage && this.getPackage.length > 0"
            @click="navigationStateChange()">
            <v-img :src="isDev ? CardVod : this.packageObj[0].package_image" width="400" class="package-banner-img"
                style="border-radius: 10px;"></v-img>
            <div class="d-flex flex-column justify-start text-left align-start px-16" style="width: 65vw;">
                <div class="d-flex justify-start align-center mb-5">
                    <v-img :src="this.packageObj[0].content_provider_logo" width="50" height="50"
                        style="border-radius: 50%;" class="mr-3"></v-img>
                    <div class="d-flex justify-start align-start text-subtitle-1">
                        <!-- {{ item.title }} -->
                        {{ this.packageObj[0].package_name }}
                    </div>
                </div>

                <div class="text-subtitle-1 justify-center align-start">
                    <p class="text-caption text--disabled">
                        <!-- {{ item.subtitle }} -->
                        {{ this.packageObj[0].package_description }}
                    </p>
                </div>
            </div>
            <div class="d-flex flex-column justify-start pa-10 mr-10" style="align-items: center;">
                <div class="text-subtitle-1 mb-1">
                    <!-- {{ item.title }} -->
                    Subscription
                    <!-- <p class="text-caption text--disabled">{{ item.subtitle }}</p> -->
                </div>
                <div class="text-h5 mb-6">
                    <!-- {{ item.title }} -->
                    ${{ this.packageObj[0].package_pgroups_cards[0].pgroup_price }}
                    <!-- <p class="text-caption text--disabled">{{ item.subtitle }}</p> -->
                </div>
                <div class="text-subtitle-1 round-md">
                    <!-- {{ item.price }} -->

                    <v-btn depressed color="white" :style="ButtonColor"
                        :href="this.packageObj[0].package_pgroups_cards[0].custom_data.store_url" target="_blank">
                        Purchase
                    </v-btn>
                </div>
            </div>
        </div>
        <div class="text-h6 ma-5">
            All content included in Subscription
        </div>
    </div>
    <div>
        <v-divider class="mb-5"></v-divider>
        <v-row v-if="moviesInPackage && moviesInPackage.length > 0">
            <v-col cols="12" md="12">
                <h4 class="text-left ml-10 fcw">
                    Films
                </h4>
            </v-col>
            <v-col cols="12" md="12">
                <SVODAccessContents :categoryList="moviesInPackage" type="movies" />
            </v-col>
        </v-row>
        <v-row v-if="seriesInPackage && seriesInPackage.length > 0">
            <v-col cols="12" md="12">
                <h4 class="text-left ml-10 fcw">
                    Series
                </h4>
            </v-col>
            <v-col cols="12" md="12">
                <SVODAccessContents :categoryList="seriesInPackage" type="series" />
            </v-col>
        </v-row>
    </div>
</template>

<style scoped lang="scss">
@use '../../styles/home' as *;
</style>

<script>
import CardVod from '../../assets/img/card-live.png';
import iconLogo from '../../assets/img/icon-live-logo-red.png';
import PlayIcon from '../../assets/img/icon-play.png';
import SVODAccessContents from '../../components/SVODAccessContents.vue';


import { HIGHLIGHT_COLOR_1, FONT_COLOR_1 } from '@/mainConfig';
import useNavigationStore from '@/store/useNavigationStore';
import usePackageStore from '@/store/usePackageStore';

export default {
    name: 'SvodPackageDetails',
    components: {
        SVODAccessContents,
    },
    data() {
        return {
            phoneWidth: window.innerWidth,
            PlayIcon: PlayIcon,
            CardVod: CardVod,
            iconLogo: iconLogo,
            dialog: false,
            cardSpaceMargin: 5,
            slidesPerViewCnt: 7,
            SVOD: [],
            accessOptions: [
                {
                    icon_url: '',
                    title: 'Rent',
                    subtitle: 'for 48 hours',
                    price: '$4.99',
                },
                {
                    icon_url: '',
                    title: 'Subscribe',
                    subtitle: 'for 30 days Package Access',
                    price: '$5.99',
                },
                {
                    icon_url: '',
                    title: 'Subscribe',
                    subtitle: 'for 30 days Package Access',
                    price: '$6.99',
                },
                {
                    icon_url: '',
                    title: 'Rent',
                    subtitle: 'for 6 months Package Access',
                    price: '$29.99',
                },
                {
                    icon_url: '',
                    title: 'Rent',
                    subtitle: 'for 6 months Package Access',
                    price: '$35.99',
                },
            ],
            selectedItem: 0,
            packageObj: [],
            moviesInPackage: [],
            seriesInPackage: [],
            ButtonColor: {
                backgroundColor: HIGHLIGHT_COLOR_1 + " !important",
                color: FONT_COLOR_1 + " !important"
            }
        }
    },
    mounted() {
        this.getPackages();
        console.log('AccessContent', this);
    },
    methods: {
        clearAllComponents() {
            this.moviesInPackage = [];
            this.seriesInPackage = [];
            this.packageObj = [];
        },
        onShowAccessOptions() {
            this.dialog = true;
        },
        resizeCardSpace(cnt) {
            this.cardSpaceMargin = cnt * 10;
        },
        navigationStateChange() {
            const navigationStore = useNavigationStore()
            navigationStore.changeNavigationState(false)
        },
        getPackages() {
            const packageStore = usePackageStore()

            this.clearAllComponents();
            packageStore.setPackages(this.$route.params.packageId)
        },
        gotoSubscriptionUrl(url) {
            document.location.href = url;
        }
    },
    computed: {
        getPackage() {
            const packageStore = usePackageStore()

            this.packageObj = packageStore.packages;
            if (this.packageObj.length > 0) {
                // var moviesString = this.packageObj[0].MoviesInPackage;
                // this.moviesInPackage = moviesString.split(",");
                // var seriesString = this.packageObj[0].SeriesInPackage;
                // this.seriesInPackage = seriesString.split(",");
                // if(this.moviesInPackage[0] == "") {
                //     this.moviesInPackage = [];
                // }
                // if(this.seriesInPackage[0] == "") {
                //     this.seriesInPackage = [];
                // }
                this.moviesInPackage = this.packageObj[0].MoviesInPackageArray;
                this.seriesInPackage = this.packageObj[0].SeriesInPackageArray;
            }
            console.log('AccesContent', this);
            return this.packageObj;
        },
    },
    watch: {
        vodId(newVal) {
            this.getSVOD();
            return newVal;
        },
    },
    setup() {
        return {
            modules: [],
        };
    },
} 
</script>

<style>
.package-banner {
    display: flex;
    margin-top: 150px;
    margin-left: 100px;
}

.card-vod-img-disabled .v-img__img--cover {
    opacity: 1 !important;
}

@media screen and (max-width: 1024px) {
    .package-banner {
        display: block;
        margin-left: auto;
    }

    .package-banner-img {
        margin: auto;
    }
}

@media screen and (max-width: 750px) {
    .package-banner-img {
        margin-top: 150px;
    }
}
</style>
