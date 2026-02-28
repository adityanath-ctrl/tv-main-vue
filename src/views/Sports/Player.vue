<template>
    <div class="d-container" @click="navigationStateChange()">
        <iframe id="siberPlayer" name="siberPlayer" style="height: calc(86vh);width: 100vw; margin: auto;" :src="iframeSrc"
            allowfullscreen frameborder="0" scrolling=false @load=postData>
        </iframe>
    </div>
</template>
     
<style scoped lang="scss">
@import '../../styles/home.scss';
</style>

<script>

import { devMode } from '../../utils/devConfig';
// import iframeResizer from "iframe-resizer";
import { PLAYER_URL, msalConfig, SSO_TENANT_ID } from '@/mainConfig';

export default {
    name: 'SportPlayer',
    components: {
    },
    data() {
        return {
            cardSpaceMargin: 5,
            slidesPerViewCnt: 7,
            devConfig: {},
            SVODs: [],
            isDev: devMode,
            iframeSrc: `${PLAYER_URL}player.php?match=` + this.$route.params.sportId + "&about=1&matches=1"
        }
    },
    mounted() {
        window.addEventListener(
            "resize", this.postData
            ,
            true
        );
    },
    methods: {
        resizeCardSpace(cnt) {
            this.cardSpaceMargin = cnt * 10;
        },
        postData() {
            var parent_data = { "window_height": window.innerHeight };
            document.getElementById("siberPlayer").contentWindow.postMessage(parent_data, "*");
        },
        navigationStateChange() {
            this.$store.dispatch("changeNavigationState", false);
        }
    },
    setup() {
        return {
            modules: [],
        };
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.postData);
    }
} 
</script>
     