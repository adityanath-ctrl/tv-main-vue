<template>
    <div class="d-container" @click="navigationStateChange()">
        <iframe id="siberPlayer" name="siberPlayer" style="height: calc(87vh);width: 100vw;" :src=iframeSrc allowfullscreen
            frameborder="0" scrolling=false @load=postData>
        </iframe>
    </div>
</template>
      
<style scoped lang="scss">
@use '../../styles/home' as *;
</style>

<script>
import CardVod from '../../assets/img/card-vod.png';
import CardLive from '../../assets/img/card-live.png';
import PlayIcon from '../../assets/img/icon-play.png';
import useSVODStore from '@/store/useSVODStore';
import useNavigationStore from '@/store/useNavigationStore';
// import iframeResizer from "iframe-resizer";

export default {
    name: 'SVODPlayer',
    components: {
    },
    props: {
        categoryId: {
            type: Number,
            required: true,
        },
        vodId: {
            type: Number,
        }
    },
    data() {
        return {
            PlayIcon: PlayIcon,
            CardVod: CardVod,
            CardLive: CardLive,
            cardSpaceMargin: 5,
            slidesPerViewCnt: 7,
            iframeSrc: "https://player.streamtnt.com/player.php?movie=" + this.$route.params.vodId + "&about=1&movies=1"
        }
    },
    mounted() {
        window.addEventListener(
            "resize", function () {
                // this.postData();
            },
            true
        );
    },
    methods: {
        getSVODs() {
            const svodStore = useSVODStore()
            svodStore.setSVODByCategoryId({
                CategoryId: this.categoryId
            })
        },
        resizeCardSpace(cnt) {
            this.cardSpaceMargin = cnt * 10;
        },
        postData() {
            var parent_data = { "window_height": window.innerHeight };
            document.getElementById("siberPlayer").contentWindow.postMessage(parent_data, "*");
            // iFrameResize({ scrolling: false, heightCalculationMethod: "taggedElement", checkOrigin: false}, '#siberPlayer');
            // iframeResizer({ scrolling: false, heightCalculationMethod: "taggedElement", checkOrigin: false}, "#siberPlayer");
            // iFrameResize({ scrolling: false, heightCalculationMethod: "taggedElement", checkOrigin: false}, "#siberPlayer");
        },
        navigationStateChange() {
            const navigationStore = useNavigationStore()
            navigationStore.changeNavigationState(false)
        }
    },
    computed: {
        SVODs() {
            const svodStore = useSVODStore()
            let svdCnt = svodStore.SVODs.length;
            if (svdCnt == 0) {
                this.getSVODs();
            }
            if (svdCnt < 7) {
                // this.slidesPerViewCnt = svdCnt;
                // this.resizeCardSpace(this.slidesPerViewCnt);
            }

            return svodStore.SVODs[this.categoryId];
        },
    },
    watch: {
        SVODs(newVal) {
            return newVal;
        },
        categoryId(newVal) {
            return newVal;
        }
    },
    setup() {
        return {
            modules: [],
        };
    },
} 
</script>
      