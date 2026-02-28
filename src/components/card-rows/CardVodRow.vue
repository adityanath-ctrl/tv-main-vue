<!-- /src/components/card-rows/CardVodRow.vue -->
<template>
  <swiper
    v-if="!isLoadingData || displayItems.length > 0"
    :modules="[Navigation, Mousewheel]"
    @swiper="onSwiperInitialized"
    :navigation="true"
    :breakpoints="vodBreakpoints"
    ref="swiperRefInternal"
    class="card-vod-slider card-slider bg-none"
    :mousewheel="{ forceToAxis: true, sensitivity: 0.5, releaseOnEdges: true }"
    direction="horizontal"
  >
    <swiper-slide
      v-for="item in displayItems"
      :key="item.__kind === 'viewAll' ? 'view-all' : item.id"
      class="item no-border bg-none subscription-item"
    >
      <!-- Regular VOD card -->
      <CardVod v-if="item.__kind !== 'viewAll'" :item="item" />

      <!-- 15th 'View All' card (wrapped with same padding as CardVod) -->
      <div v-else class="d-flex flex-column bg-none w-100 pb-10 pt-2 focusable-item" tabindex="0" @click="goToViewAll">
        <div class="view-all-card" title="View All">
          <div class="view-all-card__inner">View All</div>
        </div>
      </div>
    </swiper-slide>

    <template #button-prev>
      <div @click="prevSlide" class="swiper-top-position swiper-button-prev"></div>
    </template>
    <template #button-next>
      <div @click="nextSlide" class="swiper-top-position swiper-button-next"></div>
    </template>
  </swiper>

  <div v-else-if="isLoadingData && displayItems.length === 0" class="loading-placeholder">
    <!-- optional loader -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick, withDefaults, defineProps } from 'vue';
import type { Swiper as SwiperClass } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Mousewheel } from 'swiper/modules';
import { useRouter } from 'vue-router';
import { webOSFocusManager } from '@/utils/webosFocusManager';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/mousewheel';

import CardVod from '../cards/CardVod.vue';
import useSVODStore from '@/store/useSVODStore';
import { vodBreakpoints } from '@/utils/constants';

/** Props */
const props = withDefaults(defineProps<{
  items?: any[];
  categoryId?: number | string | null;
  rowDefinitionId?: number | string | null;
  title?: string;
  menuContentType?: string;
  menuType?: string;
  categoryName?: string;
}>(), {
  items: () => [],
  categoryId: null,
  rowDefinitionId: null,
  title: '',
  menuContentType: 'SVOD',
  menuType: '',
  categoryName: ''
});

const emit = defineEmits<{ (e: 'no-content', uniqueRowId: number | string | null): void }>();

const router = useRouter();
const svodStore = useSVODStore();

const swiperRefInternal = ref<SwiperClass | null>(null);
const isLoadingData = ref(true);

function onSwiperInitialized(swiper: SwiperClass) {
  swiperRefInternal.value = swiper;
}

const hasProvidedItems = computed(() => Array.isArray(props.items) && props.items.length > 0);

function getStoreVodsLimitedFirst(categoryId: number | string | null | undefined) {
  if (categoryId === null || categoryId === undefined) return [];
  const anyStore = svodStore as any;

  if (anyStore.SVODsLimited) {
    const lim = anyStore.SVODsLimited[categoryId] ?? anyStore.SVODsLimited[String(categoryId)];
    if (Array.isArray(lim)) return lim;
  }
  const full = svodStore.SVODs as Record<any, any[] | undefined>;
  return full[categoryId as any] || full[String(categoryId)] || [];
}

const baseList = computed<any[]>(() => {
  if (hasProvidedItems.value) return props.items!;
  return getStoreVodsLimitedFirst(props.categoryId);
});

const limited14 = computed<any[]>(() => baseList.value.slice(0, 14));

const displayItems = computed<any[]>(() => {
  if (limited14.value.length >= 14 && props.categoryId != null) {
    return [...limited14.value, { __kind: 'viewAll' }];
  }
  return limited14.value;
});

async function maybeFetchFromStore() {
  const contentFetchingId = props.categoryId;
  const uniqueRowId = props.rowDefinitionId;

  if (hasProvidedItems.value) {
    isLoadingData.value = false;
    return;
  }
  if (contentFetchingId === undefined || contentFetchingId === null) {
    isLoadingData.value = false;
    await nextTick();
    if (displayItems.value.length === 0) emit('no-content', uniqueRowId ?? null);
    return;
  }

  try {
    isLoadingData.value = true;
    const anyStore = svodStore as any;
    if (typeof anyStore.setSVODByCategoryIdLimited === 'function') {
      await anyStore.setSVODByCategoryIdLimited({ CategoryId: contentFetchingId, Limit: 14 });
    } else {
      await svodStore.setSVODByCategoryId({ CategoryId: contentFetchingId });
    }
  } catch {
    /* ignore */
  } finally {
    await nextTick();
    if (displayItems.value.length === 0) emit('no-content', uniqueRowId ?? null);
    isLoadingData.value = false;
  }
}

onMounted(() => { 
  maybeFetchFromStore();
  // Ensure proper focus after component mounts
  nextTick(() => {
    setTimeout(() => {
      webOSFocusManager.refreshSpatialNavigation(200);
    }, 200);
  });
});

watch(
  () => [props.categoryId, props.rowDefinitionId, hasProvidedItems.value],
  async ([newCategoryId, _newRowId, nowProvided], [oldCategoryId, _oldRowId, wasProvided]) => {
    const providedChanged = nowProvided !== wasProvided;
    const categoryChanged = newCategoryId !== oldCategoryId;
    if (providedChanged || (!nowProvided && categoryChanged)) {
      await maybeFetchFromStore();
      // Re-initialize focus after content updates
      nextTick(() => {
        setTimeout(() => {
          webOSFocusManager.refreshSpatialNavigation(100);
        }, 100);
      });
    }
  }
);

function prevSlide() { swiperRefInternal.value?.slidePrev(); }
function nextSlide() { swiperRefInternal.value?.slideNext(); }

function goToViewAll() {
  const idOrName =
    props.categoryId !== '' && props.categoryId !== null && props.categoryId !== undefined
      ? props.categoryId
      : props.categoryName;

  router.push({
    path: `/category/${idOrName}/${props.menuContentType || 'SVOD'}/${props.menuType || ''}`
  });
}
</script>

<style scoped lang="scss">
@use '../../styles/home' as *;

.swiper-slide {
  position: relative;
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
}

.swiper-button-prev,
.swiper-button-next {
  width: 50px !important;
  height: 100% !important;
  top: 0;
}

/* Match CardVod poster box (3:2 aspect, same rounded corners) */
.view-all-card {
  position: relative;
  width: 100%;
  padding-bottom: 150%;          /* 3:2 like CardVod's .slider-img-container */
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);  /* same grey feel as posters' bg */
  /* remove any outlines/borders */
  border: none;
  box-shadow: none;
  cursor: pointer;
  transition: transform .15s ease, background .15s ease;
}
.view-all-card:hover {
  transform: scale(1.02);
  background: rgba(255, 255, 255, 0.12);
}

.view-all-card__inner {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: .02em;
}
</style>
