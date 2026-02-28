<template>
    <!-- Provider/index -->

    <div v-if="phoneWidth <= 750">
        <v-container fluid style="padding:0px" @click="navigationStateChange()">
            <div v-if="providerInfo != null"
                :style="{ 'background-image': `url(${middlewareBaseUrl}/assets/content_provider/${providerInfo?.custom_data.featured_img})` }"
                style="background-repeat: no-repeat; background-position: center; background-size: cover; height:300px">
            </div>

            <v-row no-gutters>
                <v-col class="d-flex justify-center" :style="styles.SidebarStyle" style="padding-top: 10px;">
                    <div class="d-flex flex-column justify-start align-start mb-6 pl-5">
                        <div class="d-flex justify-between align-center justify-center">
                            <img :src="providerInfo?.content_provider_logo"
                                style="cursor: pointer; width: 80px; height: 80px; border-radius: 50%;"
                                @click="goToProviderPage(providerInfo?.content_provider_id)">
                            <div class="d-flex flex-column justify-start">
                                <div class="font-weight-medium provider-name pl-10">{{
                                    providerInfo?.content_provider_name
                                }}</div>
                                <div class="font-weight-medium text-h6 pl-10">{{ providerInfo?.custom_data.country }}
                                </div>
                            </div>
                        </div>

                        <div class="font-weight-medium text-subtitle-2 text-left mt-10 mb-10">
                            {{ providerInfo?.content_provider_description }}
                        </div>

                        <div class="d-flex align-center" style="width: 30vw;">
                            <div class="d-flex align-center">
                                <a v-if="providerInfo?.custom_data.social_media && providerInfo?.custom_data.social_media.website != ''"
                                    :href="providerInfo.custom_data.social_media.website" target="_blank"
                                    rel="noopener noreferrer">
                                    <v-img :src="WebLogo" :aspect-ratio="1" width="40" height="40"
                                        style="cursor: pointer;" />
                                </a>
                                <v-img class="ml-2"
                                    v-if="providerInfo?.custom_data.social_media && providerInfo?.custom_data.social_media.facebook != ''"
                                    :src="FacebookLogo" :aspect-ratio="1" width="40" height="40"
                                    style="cursor: pointer;" />
                                <v-img class="ml-2"
                                    v-if="providerInfo?.custom_data.social_media && providerInfo?.custom_data.social_media.instagram != ''"
                                    :src="InstagramLogo" :aspect-ratio="1" width="40" height="40"
                                    style="cursor: pointer;" />
                                <v-img class="ml-2"
                                    v-if="providerInfo?.custom_data.social_media && providerInfo?.custom_data.social_media.whatsapp != ''"
                                    :src="WhatsappLogo" :aspect-ratio="1" width="40" height="40"
                                    style="cursor: pointer;" />
                                <v-img class="ml-2"
                                    v-if="providerInfo?.custom_data.social_media && providerInfo?.custom_data.social_media.youtube != ''"
                                    :src="YoutubeLogo" :aspect-ratio="1" width="40" height="40"
                                    style="cursor: pointer;" />
                                <v-img class="ml-2"
                                    v-if="providerInfo?.custom_data.social_media && providerInfo?.custom_data.social_media.twitter != ''"
                                    :src="TwitterLogo" :aspect-ratio="1" width="40" height="40"
                                    style="cursor: pointer;" />
                            </div>
                        </div>

                    </div>
                </v-col>
            </v-row>
            <v-card v-if="providerInfo != null">
                <v-tabs v-model="activeItem" align-tabs="center" fixed-tabs :style="styles.NavStyle"
                    class="provider-tab-heders">
                    <v-tab v-for="(tab, i) in Tabs" :key="i" :value="tab.value" @click="tabClick(tab.value)"
                        :style="tab.value == activeItem ? styles.TabStyle : ''">
                        {{ tab.name }}
                    </v-tab>
                </v-tabs>
                <v-card-text>
                    <v-window v-model="activeItem" :disabled=true>
                        <v-window-item value="videos">
                            <ProviderVideo :providerId="providerId" category="Uploaded Videos" />
                        </v-window-item>

                        <v-window-item value="live">
                            <ProviderVideo :providerId="providerId" category="Upcoming or Past Live Videos" />
                        </v-window-item>

                        <v-window-item value="film">
                            <ProviderTabFilmSeries :providerId="providerId" />
                        </v-window-item>

                        <v-window-item value="subscription">
                            <ProviderSubscription :providerId="providerId" />
                        </v-window-item>
                    </v-window>
                </v-card-text>
            </v-card>
        </v-container>
    </div>
    <div v-else>
        <v-container fluid style="padding:0px" @click="navigationStateChange()">
            <div v-if="providerInfo != null"
                :style="{ 'background-image': `url(${middlewareBaseUrl}/assets/content_provider/${providerInfo?.custom_data.featured_img})` }"
                style="background-repeat: no-repeat; background-position: center; background-size: cover;">
                <v-row no-gutters>
                    <v-col cols="7" class="d-flex justify-starter provider-banner" :style="styles.SidebarStyle">
                        <div class="d-flex flex-column justify-start align-start mb-6 pl-16">
                            <div class="d-flex justify-between align-center justify-center">
                                <img :src="providerInfo?.content_provider_logo"
                                    style="cursor: pointer; width: 80px; height: 80px; border-radius: 50%;"
                                    @click="goToProviderPage(providerInfo?.content_provider_id)">
                                <div class="d-flex flex-column justify-start">
                                    <div class="font-weight-medium text-h3 pl-10">{{ providerInfo?.content_provider_name
                                        }}
                                    </div>
                                    <div class="font-weight-medium text-h6 pl-10">{{ providerInfo?.custom_data.country
                                        }}
                                    </div>
                                </div>
                            </div>

                            <div class="font-weight-medium text-subtitle-2 text-left mt-10 mb-10">
                                {{ providerInfo?.content_provider_description }}
                            </div>

                            <div class="d-flex align-center" style="width: 30vw;">
                                <div class="d-flex align-center">
                                    <a v-if="providerInfo?.custom_data.social_media && providerInfo?.custom_data.social_media.website != ''"
                                        :href="providerInfo.custom_data.social_media.website" target="_blank"
                                        rel="noopener noreferrer">
                                        <v-img :src="WebLogo" :aspect-ratio="1" width="40" height="40"
                                            style="cursor: pointer;" />
                                    </a>
                                    <v-img class="ml-2"
                                        v-if="providerInfo?.custom_data.social_media && providerInfo?.custom_data.social_media.facebook != ''"
                                        :src="FacebookLogo" :aspect-ratio="1" width="40" height="40"
                                        style="cursor: pointer;" />
                                    <v-img class="ml-2"
                                        v-if="providerInfo?.custom_data.social_media && providerInfo?.custom_data.social_media.instagram != ''"
                                        :src="InstagramLogo" :aspect-ratio="1" width="40" height="40"
                                        style="cursor: pointer;" />
                                    <v-img class="ml-2"
                                        v-if="providerInfo?.custom_data.social_media && providerInfo?.custom_data.social_media.whatsapp != ''"
                                        :src="WhatsappLogo" :aspect-ratio="1" width="40" height="40"
                                        style="cursor: pointer;" />
                                    <v-img class="ml-2"
                                        v-if="providerInfo?.custom_data.social_media && providerInfo?.custom_data.social_media.youtube != ''"
                                        :src="YoutubeLogo" :aspect-ratio="1" width="40" height="40"
                                        style="cursor: pointer;" />
                                    <v-img class="ml-2"
                                        v-if="providerInfo?.custom_data.social_media && providerInfo?.custom_data.social_media.twitter != ''"
                                        :src="TwitterLogo" :aspect-ratio="1" width="40" height="40"
                                        style="cursor: pointer;" />
                                </div>
                            </div>
                        </div>
                    </v-col>
                </v-row>
            </div>
            <v-card v-if="providerInfo != null">
                <v-tabs v-model="activeItem" fixed-tabs :style="styles.NavStyle" class="provider-tab-heders">
                    <v-tab v-for="(tab, i) in Tabs" :key="i" :value="tab.value" @click="tabClick(tab.value)"
                        :style="tab.value == activeItem ? styles.TabStyle : ''">
                        {{ tab.name }}
                    </v-tab>
                </v-tabs>
                <v-card-text>
                    <v-window v-model="activeItem" :disabled=true>
                        <v-window-item value="videos" v-if="VideoEventCount > 0">
                            <ProviderVideo :providerId="providerId" category="Uploaded Videos" />
                        </v-window-item>

                        <v-window-item value="live" v-if="LiveEventCount > 0">
                            <ProviderVideo :providerId="providerId" category="Upcoming or Past Live Videos" />
                        </v-window-item>

                        <v-window-item value="film" v-if="FilmSeriesCount > 0">
                            <ProviderTabFilmSeries :providerId="providerId" />
                        </v-window-item>

                        <v-window-item value="subscription" v-if="SubscriptionCount > 0">
                            <ProviderSubscription :providerId="providerId" />
                        </v-window-item>
                    </v-window>
                </v-card-text>
            </v-card>
        </v-container>
    </div>
</template>

<style scoped lang="scss">
@use '../../styles/home' as *;
</style>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import WebLogo from '../../assets/img/web_logo.png';
import FacebookLogo from '../../assets/img/facebook_logo.png';
import InstagramLogo from '../../assets/img/instagram_logo.png';
import TwitterLogo from '../../assets/img/twitter_logo.png';
import WhatsappLogo from '../../assets/img/whatsapp_logo.png';
import YoutubeLogo from '../../assets/img/youtube_logo.png';
import ProviderVideo from '@/components/ProviderVideo.vue';
import ProviderTabFilmSeries from '@/components/ProviderTabFilmSeries.vue';
import ProviderSubscription from '@/components/ProviderSubscription.vue';
import { getSubscriptionSVOD, getSubscriptionLiveTV, getSubscriptionSports, getSubscriptionEvents } from '@/utils/siberAPI';
import {
    BACKGROUND_COLOR_1,
    HIGHLIGHT_COLOR_1,
    FONT_COLOR_1,
    SIDEEFFECTBAR_1,
    SIDEEFFECTBAR_2,
    SIDEEFFECTBAR_3,
    MIDDLEWARE_BASE_URL
} from '@/mainConfig';
import useAuthStore from '@/store/useAuthStore';
import useEventsStore from '@/store/useEventsStore';
import useProviderStore from '@/store/useProviderStore';
import useNavigationStore from '@/store/useNavigationStore';

const authStore = useAuthStore();
const eventsStore = useEventsStore();
const providerStore = useProviderStore()
const navigationStore = useNavigationStore()
const route = useRoute()
const router = useRouter()

const phoneWidth = window.innerWidth;
const providerId = route.params.providerId

const sub_vods = ref([]);
const sub_sports = ref([]);
const sub_liveTVs = ref([]);
const sub_events = ref([]);

const activeItem = ref('videos');

const middlewareBaseUrl = MIDDLEWARE_BASE_URL; // Assign MIDDLEWARE_BASE_URL to a variable for use in the template

const styles = reactive({
    ButtonColor: {
        backgroundColor: HIGHLIGHT_COLOR_1 + " !important",
        color: FONT_COLOR_1 + " !important"
    },
    SidebarStyle: {
        background: 'linear-gradient(94deg, ' + SIDEEFFECTBAR_1 + ' 0%, ' + SIDEEFFECTBAR_2 + ' 50%, ' + SIDEEFFECTBAR_3 + ' 76%, transparent 89%, transparent 100%)',
    },
    NavStyle: {
        backgroundColor: BACKGROUND_COLOR_1
    },
    TabStyle: {
        backgroundColor: HIGHLIGHT_COLOR_1,
        borderRadius: '25px'
    },
});

onMounted(() => {
    eventsStore.getEventsByContentProviderId({
        providerId
    });
    eventsStore.getFilmsByContentProviderId({
        providerId
    });

    eventsStore.getSeriesByContentProviderId({
        providerId
    });

    let auth = authStore.getAuth;
    let token = auth.auth.msalToken;
    if (token == '') {
        token = localStorage.getItem('authToken') || "";
    }

    let apiParams = {
        token,
        providerId
    };
    getSubscriptionSVOD(apiParams).then(res => {
        if (res.data.response.packages && res.data.response.packages != null && res.data.response.packages.length > 0) {
            sub_vods.value = res.data.response.packages;
        }
    });

    getSubscriptionSports(apiParams).then(res => {
        if (res.data.response.packages && res.data.response.packages != null && res.data.response.packages.length > 0) {
            sub_sports.value = res.data.response.packages;
        }
    });

    getSubscriptionLiveTV(apiParams).then(res => {
        if (res.data.response.packages && res.data.response.packages != null && res.data.response.packages.length > 0) {
            sub_liveTVs.value = res.data.response.packages;
        }
    });

    getSubscriptionEvents(apiParams).then(res => {
        if (res.data.response.packages && res.data.response.packages != null && res.data.response.packages.length > 0) {
            sub_events.value = res.data.response.packages;
        }
    });

    getProviderInfo();
});

const tabClick = (value) => {
    activeItem.value = value;
};

const getProviderInfo = () => {
    providerStore.setProvider({
        providerId
    });
};

const navigationStateChange = () => {
    navigationStore.changeNavigationState(false);
};

const goToProviderPage = (providerId) => {
    router.push({ path: '/provider/' + providerId });
};

const VideoEventCount = computed(() => {
    const eventsStore = useEventsStore();
    let ProviderEvents = eventsStore.ProviderEvents;
    let events = ProviderEvents.filter(item => item.live_event_playback_status == "uploaded" || item.live_event_playback_status == "pending_upload");
    return events ? events.length : 0;
});

const LiveEventCount = computed(() => {
    const eventsStore = useEventsStore();
    let ProviderEvents = eventsStore.ProviderEvents;
    let events = ProviderEvents.filter(item => item.live_event_playback_status == "pending" || item.live_event_playback_status == "started" || item.live_event_playback_status == "finished");
    return events ? events.length : 0;
});

const FilmSeriesCount = computed(() => {
    const eventsStore = useEventsStore();
    let count = 0;
    let films = eventsStore.FilmsEvents;
    let series = eventsStore.SeriesEvents;
    count += films ? films.length : 0;
    count += series ? series.length : 0;
    return count;
});

const SubscriptionCount = computed(() => {
    let subscription_cnt = 0;
    [sub_vods, sub_sports, sub_liveTVs, sub_events].forEach(sub => {
        sub.value.forEach(item => {
            if (item.package_pgroups_cards.length > 0) {
                subscription_cnt += item.package_pgroups_cards.length;
            }
        });
    });
    return subscription_cnt;
});

const providerInfo = computed(() => {
    let info = null;
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    const providerInfo = providerStore.providers;
    if (providerInfo != null) {
        // Spread the original providerInfo to include all its properties
        info = { ...providerInfo };

        // Parse the custom_data and merge it into the info object
        if (providerInfo.custom_data) {
            const customData = JSON.parse(providerInfo.custom_data);
            info.custom_data = {
                ...customData,
                country: regionNames.of(customData.country) // Add country name
            };
        }
    }
    return info;
});


const Tabs = computed(() => {
    let tabs = [];
    if (VideoEventCount.value > 0) {
        tabs.push({ name: 'VIDEOS', value: 'videos', visible: false });
    }
    if (LiveEventCount.value > 0) {
        tabs.push({ name: 'LIVE', value: 'live', visible: false });
    }
    if (FilmSeriesCount.value > 0) {
        tabs.push({ name: 'FILM & SERIES', value: 'film', visible: false });
    }
    if (SubscriptionCount.value > 0) {
        tabs.push({ name: 'Subscriptions & Rentals', value: 'subscription', visible: false });
    }
    return tabs;
});

watch(Tabs, () => {
    activeItem.value = Tabs.value?.[0].value;
});

watch(providerInfo, (newValue) => {
    console.log('providerInfo:', newValue);
    if (newValue && newValue.content_provider_logo) {
        console.log('Content Provider Logo:', newValue.content_provider_logo);
    } else {
        console.log('Content Provider Logo is undefined');
    }
});


</script>

<style>
.provider-banner {
    padding-top: 150px !important;
    padding-left: 100px;
}

.v-tabs {
    ::v-deep {
        .v-tabs-slider-wrapper {
            transition: none;
        }
    }
}

@media screen and (min-width: 750px) and (max-width: 1024px) {
    .provider-banner {
        padding-top: 150px;
        padding-left: 0;
    }
}

.provider-name {
    font-size: 3rem;
    line-height: 3.125rem;
}

@media screen and (max-width: 749px) {
    .provider-name {
        font-size: 1.5rem;
        line-height: 2rem;
    }
}

.provider-tab-heders .v-tab__slider {
    opacity: 0 !important;
}
</style>
