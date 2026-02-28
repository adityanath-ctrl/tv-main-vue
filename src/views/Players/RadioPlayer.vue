<template>
    <div class="d-container d-flex" @click="navigationStateChange()">
        <div>
            <iframe id="siberPlayer" name="siberPlayer" style="height: calc(87vh); overflow: hidden;" :src="iframeSrc"
                allowfullscreen @load="postData"></iframe>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { PLAYER_URL } from '@/mainConfig';
import useNavigationStore from '@/store/useNavigationStore';
import { msalInstance } from '@/mainConfig'

const route = useRoute();
const navigationStore = useNavigationStore();
const iframeSrc = ref(`${PLAYER_URL}player.php?radio=${route.params.radioId}&about=1&audioMode=audio`);

const postData = () => {
    const allAccounts = msalInstance.getAllAccounts();

    const parent_data = {
        "window_height": window.innerHeight,
        "account": allAccounts && allAccounts.length > 0 ? allAccounts : undefined,
    };

    document.getElementById("siberPlayer").contentWindow.postMessage(parent_data, "*");
};

const navigationStateChange = () => {
    navigationStore.changeNavigationState(false);
};

const resizeListener = () => {
    const parent_data = { "window_height": window.innerHeight };
    document.getElementById("siberPlayer").contentWindow.postMessage(parent_data, "*");
};

const messageListener = async (event) => {
    const content_type = event.data?.video_type;
    const content_id = event.data?.id;
    console.log("Content Type: " + content_type + " | Content ID: " + content_id);
};

// Mounted and beforeUnmount lifecycle hooks
onMounted(() => {
    window.addEventListener("resize", resizeListener, true);
    window.addEventListener("message", messageListener, false);

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.9/iframeResizer.min.js';
    script.crossOrigin = 'anonymous';
    document.body.appendChild(script);

    script.onload = () => {
        iFrameResize({ scrolling: false, heightCalculationMethod: 'taggedElement', checkOrigin: false }, '#siberPlayer');
        window.addEventListener('resize', postData, true);
    };
});

onBeforeUnmount(() => {
    window.removeEventListener("resize", resizeListener);
    window.removeEventListener("message", messageListener);
});
</script>



<style>
@media screen and (max-width: 1024px) {
    #siberPlayer {
        margin-left: 0px;
        width: 100vw;
    }
}
</style>