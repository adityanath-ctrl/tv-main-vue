<template>
    <!-- player/event/id -->
    <div class="d-container" @click="navigationStateChange()">
        <!-- Updated iframe with original style -->
        <iframe
            id="siberPlayer"
            name="siberPlayer"
            style="height: calc(87vh); width: 100vw;"
            :src="iframeSrc"
            allowfullscreen
            frameborder="0"
            scrolling="false"
            @load="postData"
        ></iframe>
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
import { useStore } from 'vuex'
import { devMode } from '../../utils/devConfig';
import { PLAYER_URL, msalConfig, SSO_TENANT_ID} from '@/mainConfig';
// import iframeResizer from "iframe-resizer";

export default {
    name: 'EventPlayer',
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
    setup() {
        return {
            modules: []
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
            SVODs: [],
            isDev: devMode,
            iframeSrc: `${PLAYER_URL}player.php?stream=` + this.$route.params.eventId + "&about=1&streams=1&videos=1&channels=1&matches=1&movies=1&tv_shows=1&apps=0&chat=0&donation=1&epg=0&packages=1&resume=optional"
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
            iFrameResize({ scrolling: false, heightCalculationMethod: 'taggedElement', checkOrigin: false}, '#siberPlayer');
            window.addEventListener('resize', this.postData, true);
        };
    },
    beforeUnmount() {
        window.removeEventListener("resize", this.resizeListener);
        window.removeEventListener("message", this.messageListener);
    },
    methods: {
        getSVODs() {
            this.$store.dispatch("setSVODByCategoryId",
                {
                    CategoryId: this.categoryId
                });
        },
        resizeCardSpace(cnt) {
            this.cardSpaceMargin = cnt * 10;
        },
        postData() {
            let allAccounts = this.$root.$msal.instance.getAllAccounts();
            if (!allAccounts || allAccounts.length === 0){
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
        storeToken(token) {
            let signInfo = {
                loggedIn: true,
                msalToken: token,
                tokenMode: "Bearer",
            }

            this.$store.dispatch('setToken', signInfo)
                .then(() => {
                    localStorage.setItem('authToken', token)
                    window.sessionStorage.setItem('tokenMode', "Bearer")
                    window.localStorage.setItem('signInfo', JSON.stringify(signInfo))
                })
                .catch((err) => {
                    console.log(err)
                })
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

            if (allAccounts || allAccounts.length !== 0){
                if (event.data.account){
                    console.log("Received Account Object from Child!" + JSON.stringify(event.data.account));
                    const account = event.data.account;
                    if(!account || account.length === 0){
                        console.log("Post Data to Child");
                        postData();
                    }
                    
                    
                    /* 
                    //console.log("Account: " + JSON.stringify(account));
                    //console.log("Account Client ID: " + msalConfig.auth.clientId);
                    //console.log("Account Client Username: " + account.username);


                    const silentRequest = {
                        scopes: ["openid", "offline_access", msalConfig.auth.clientId],
                        domainHint: SSO_TENANT_ID,
                        loginHint: account.username
                    };
                
                    try {
                        const loginResponse = await this.$root.$msal.instance.ssoSilent(silentRequest);
                        //console.log('Login Success');
                        console.log("loginResponse: " + JSON.stringify(loginResponse));
                        //console.log("Local Accounts: " + JSON.stringify(this.$root.$msal.instance.getAllAccounts()));
                        //this.storeToken(loginResponse.accessToken);
                        this.storeToken(loginResponse.accessToken);
                        var cookie_now = new Date();
                        cookie_now.setMonth(cookie_now.getMonth() + 120);
                        var cookie_expire = cookie_now.toUTCString();
                        document.cookie = "ssoIsLoggedIn=true; SameSite=None; expires=" + cookie_expire + "; path=/; Secure";
                    } catch (error) {
                        if (error instanceof msal.InteractionRequiredAuthError) {
                        console.log('Login failure InteractionRequiredAuthError', error);
                        const loginResponse = await this.$root.$msal.instance.loginPopup(silentRequest).catch(error => {
                            console.log('Login failure if:', error);
                        });
                        } else {
                        console.log('Login failure else:', error);
                        }
                    } */
                }
            }
        }
    },
    computed: {
        devConfig() {
            return this.$store.state.SVODStore.SVODs[this.categoryId];
        },
        SVODs() {
            let svdCnt = this.$store.state.SVODStore.SVODs.length;
            if (svdCnt == 0) {
                this.getSVODs();
            }
            if (svdCnt < 7) {
                // this.slidesPerViewCnt = svdCnt;
                // this.resizeCardSpace(this.slidesPerViewCnt);
            }

            return this.$store.state.SVODStore.SVODs[this.categoryId];
        },
    },
    watch: {
        SVODs(newVal) {
            return newVal;
        },
        categoryId(newVal) {
            return newVal;
        }
    }
} 
</script>
     