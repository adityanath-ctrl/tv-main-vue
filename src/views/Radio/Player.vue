<template>
    <!-- player/event/id -->
    <div class="d-container d-flex" @click="navigationStateChange()">
        <div>
            <!-- Updated iframe with original style -->
            <iframe id="siberPlayer" name="siberPlayer" style="height: calc(87vh);" :src="iframeSrc" allowfullscreen
                frameborder="0" scrolling="false" @load="postData"></iframe>
        </div>
    </div>
</template>
     
<style scoped lang="scss">
@import '../../styles/home.scss';
</style>

<script>
import { number } from '@intlify/core-base';
import { useStore } from 'vuex'
import { PLAYER_URL, msalConfig, SSO_TENANT_ID } from '@/mainConfig';
// import iframeResizer from "iframe-resizer";

export default {
    name: 'EventPlayer',
    data() {
        return {
            cardSpaceMargin: 5,
            slidesPerViewCnt: 7,
            devConfig: {},
            iframeSrc: `${PLAYER_URL}player.php?radio=` + this.$route.params.radioId + "&about=1&audioMode=audio"
        }
    },
    mounted() {
        window.addEventListener("resize", this.resizeListener, true);
        window.addEventListener("message", this.messageListener, false);

        // Load the iframe resizer script
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.1/iframeResizer.min.js';
        //script.integrity = 'sha512-ngVIPTfUxNHrVs52hA0CaOVwC3/do2W4jUEJIufgZQicmY27iAJAind8BPtK2LoyIGiAFcOkjO18r5dTUNLFAw==';
        script.crossorigin = 'anonymous';
        document.body.appendChild(script);

        // Load the iframe resizing and message handling logic
        script.onload = () => {
            iFrameResize({ scrolling: false, heightCalculationMethod: 'taggedElement', checkOrigin: false }, '#siberPlayer');
            window.addEventListener('resize', this.postData, true);
        };
    },
    beforeUnmount() {
        window.removeEventListener("resize", this.resizeListener);
        window.removeEventListener("message", this.messageListener);
    },
    methods: {
        resizeCardSpace(cnt) {
            this.cardSpaceMargin = cnt * 10;
        },
        postData() {
            let allAccounts = this.$root.$msal.instance.getAllAccounts();
            if (!allAccounts || allAccounts.length === 0) {
                var parent_data = {
                    "window_height": window.innerHeight
                };
            }
            else {
                var parent_data = {
                    "window_height": window.innerHeight,
                    "account": this.$root.$msal.instance.getAllAccounts()
                };
            }
            document.getElementById("siberPlayer").contentWindow.postMessage(parent_data, "*");
            //    iFrameResize({ scrolling: false, heightCalculationMethod: "taggedElement", checkOrigin: false}, '#siberPlayer');
            // iframeResizer({ scrolling: false, heightCalculationMethod: "taggedElement", checkOrigin: false}, "#siberPlayer");
            // iFrameResize({ scrolling: false, heightCalculationMethod: "taggedElement", checkOrigin: false}, "#siberPlayer");
        },
        navigationStateChange() {
            this.$store.dispatch("changeNavigationState", false);
        },
        resizeListener(event) {
            var parent_data = { "window_height": window.innerHeight };
            document.getElementById("siberPlayer").contentWindow.postMessage(parent_data, "*");
        },
        async messageListener(event) {
            // Log the received data
            //console.log("Received data from iframe:", event.data);

            const content_type = event.data.video_type;
            const content_id = event.data.id;

            console.log("Content Type: " + content_type + " | Content ID: " + content_id);


            //If both content_type and content_id are not null and valid, then
            //if content_type == "stream" then set update the URL without pushing to the page. "/player/event/"+ content_id

            if (content_type && content_id) {
                // Initialize newPath as null
                let newPath = null;

                // Check content_type
                switch (content_type) {
                    case 'stream':
                        newPath = `/player/event/${content_id}`;
                        break;
                    case 'movie':
                        newPath = `/player/movie/${content_id}`;
                        break;
                    case 'series':
                        newPath = `/player/series/${content_id}`;
                        break;
                    case 'match':
                        // Replace this with your actual path
                        newPath = `/player/match/${content_id}`;
                        break;
                    case 'channel':
                        // Replace this with your actual path
                        newPath = `/player/channel/${content_id}`;
                        break;
                }

                // Check if newPath is set and different from the current path
                if (newPath && this.$route.path !== newPath) {
                    // Update the URL and add to the history stack
                    //this.$router.push({ path: newPath }) //This navigates to the new URL
                    window.history.pushState(null, null, newPath);
                }
            }


            let allAccounts = this.$root.$msal.instance.getAllAccounts();
            //console.log("All Accounts: " + JSON.stringify(allAccounts));

            if (allAccounts || allAccounts.length !== 0) {
                if (event.data.account) {
                    console.log("Received Account Object from Child!" + JSON.stringify(event.data.account));
                    const account = event.data.account;
                    if (!account || account.length === 0) {
                        console.log("Post Data to Child");
                        postData();
                    }

                }
            }
        }
    },
} 
</script>
     

<style>
#siberPlayer {
    margin-left: 90px;
    width: 60vw;
}

@media screen and (max-width: 1024px) {
    #siberPlayer {
        margin-left: 0px;
        width: 100vw;
    }
}
</style>