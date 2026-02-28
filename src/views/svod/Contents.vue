<template>
    <v-img :src="isDev ? CardVod : item.poster_url" class="card-vod-img" style="opacity: 1;">
        <v-img :src=PlayIcon width="140" class="card-play-icon">

        </v-img>
        <v-progress-linear color="white" height="5" background-color="#019dff" background-opacity="0.6"
            class="card-vod-progress"></v-progress-linear>
    </v-img>
</template>
      
<style scoped lang="scss">
@use '../../styles/home' as *;
</style>

<script>
import CardVod from '../../assets/img/card-vod.png';
import CardLive from '../../assets/img/card-live.png';
import PlayIcon from '../../assets/img/icon-play.png';
import useSVODStore from '@/store/useSVODStore';

export default {
    name: 'SvodContents',
    components: {
    },
    props: {
        categoryId: {
            type: Number,
            required: true,
        },
    },
    data() {
        return {
            PlayIcon: PlayIcon,
            CardVod: CardVod,
            CardLive: CardLive,
            cardSpaceMargin: 5,
            slidesPerViewCnt: 7
        }
    },
    mounted() {

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
            modules: [Pagination],
        };
    },
} 
</script>
      