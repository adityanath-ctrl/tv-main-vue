<template>
    <div class="d-container" @click="navigationStateChange()">
        <iframe id="siberPlayer" name="siberPlayer" style="height: calc(87vh);width: 100vw;" :src=getIframeUrl
            allowfullscreen frameborder="0" scrolling=false @load=postData>
        </iframe>
    </div>
</template>
     
<style scoped lang="scss">
@import '../../styles/home.scss';
</style>

<script>
import CardVod from '../../assets/img/card-vod.png';
import CardLive from '../../assets/img/card-live.png';
import PlayIcon from '../../assets/img/icon-play.png';
import { number } from '@intlify/core-base';

import { devMode } from '../../utils/devConfig';
import { PLAYER_URL } from '@/mainConfig';
// import iframeResizer from "iframe-resizer";

export default {
    name: 'SeriesPlayer',
    components: {
    },
    props: {
        categoryId: {
            type: number,
            required: true,
        },
        vodId: {
            type: Number
        }
    },
    data() {
        return {
            PlayIcon: PlayIcon,
            CardVod: CardVod,
            CardLive: CardLive,
            cardSpaceMargin: 5,
            slidesPerViewCnt: 7,
            devConfig: {},
            id: this.$route.params.playerId,
            SVODs: [],
            isDev: devMode,
            iframeSrc: `${PLAYER_URL}player.php?series=` + this.$route.params.playerId + "&about=1&streams=1&videos=1&channels=1&matches=1&svods=1&apps=0&chat=1&donation=1&epg=0"
        }
    },
    mounted() {

        window.addEventListener(
            "resize", function (event) {
                this.postData();
            },
            true
        );
    },
    methods: {
        postData() {
            var parent_data = { "window_height": window.innerHeight };
            document.getElementById("siberPlayer").contentWindow.postMessage(parent_data, "*");
            //    iFrameResize({ scrolling: false, heightCalculationMethod: "taggedElement", checkOrigin: false}, '#siberPlayer');
            // iframeResizer({ scrolling: false, heightCalculationMethod: "taggedElement", checkOrigin: false}, "#siberPlayer");
            // iFrameResize({ scrolling: false, heightCalculationMethod: "taggedElement", checkOrigin: false}, "#siberPlayer");
        },
        navigationStateChange() {
            this.$store.dispatch("changeNavigationState", false);
        }
    },
    computed: {
        getIframeUrl() {
            // https://player.xstreamtt.com/player.php?series=9&season=120&episode=1740&about=1&streams=1&videos=1&channels=1&matches=1&movies=1&tv_shows=1&apps=0&chat=0&donation=1&epg=0&packages=1&resume=1OR0
            if (this.$router.currentRoute.value.query.resume) {
                this.iframeSrc = `${PLAYER_URL}player.php?series=` + this.id + "&season=" + this.$router.currentRoute.value.query.season + "&episode=" + this.$router.currentRoute.value.query.episode + "&about=1&streams=1&videos=1&channels=1&matches=1&movies=1&tv_shows=1&apps=0&chat=0&donation=1&epg=0&packages=1&resume=" + this.$router.currentRoute.value.query.resume;
            } else {
                this.iframeSrc = `${PLAYER_URL}player.php?series=` + this.id + "&about=1&streams=1&videos=1&channels=1&matches=1&svods=1&apps=0&chat=1&donation=1&epg=0";
            }
            return this.iframeSrc;
        },
    },
    watch: {
        getIframeUrl(newVal) {
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
     