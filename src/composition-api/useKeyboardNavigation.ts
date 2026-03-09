import { computed, onMounted, onBeforeUnmount, watch, type Ref } from 'vue';
import { useFocusStore } from '@/store/useFocusStore';
import useNavigationStore from '@/store/useNavigationStore';
import type { Swiper as SwiperClass } from 'swiper';

export function useRowNavigation(props: { rowIndex?: number }, displayItems: Ref<any[]>, swiperRef: Ref<SwiperClass | null>) {
    const focusStore = useFocusStore();
    const navigationStore = useNavigationStore();

    const isRowFocused = computed(() => focusStore.activeSection === 'row' && focusStore.activeRowIndex === props.rowIndex);
    const activeCardIndex = computed({
        get: () => isRowFocused.value ? focusStore.activeCardIndex : -1,
        set: (val) => { if (isRowFocused.value) focusStore.activeCardIndex = val; }
    });

    // Auto-scroll when row is focused
    watch(isRowFocused, (focused) => {
        if (focused) {
            const el = document.querySelector(`.card-slider[rowIndex="${props.rowIndex}"]`) ||
                document.getElementById(`catid-${props.rowIndex}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    function handleKeyDown(e: KeyboardEvent) {
        if (!isRowFocused.value || navigationStore.getNavigationState) return;

        if (e.key === 'ArrowRight') {
            if (activeCardIndex.value < displayItems.value.length - 1) {
                activeCardIndex.value++;
                swiperRef.value?.slideTo(activeCardIndex.value);
                e.preventDefault();
            }
        } else if (e.key === 'ArrowLeft') {
            if (activeCardIndex.value > 0) {
                activeCardIndex.value--;
                swiperRef.value?.slideTo(activeCardIndex.value);
                e.preventDefault();
            } else {
                navigationStore.changeNavigationState(true);
                e.preventDefault();
            }
        } else if (e.key === 'ArrowUp') {
            if (props.rowIndex === 0) {
                focusStore.setFocusSection('slider');
            } else {
                focusStore.activeRowIndex--;
                focusStore.activeCardIndex = 0;
            }
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            focusStore.activeRowIndex++;
            focusStore.activeCardIndex = 0;
            e.preventDefault();
        } else if (e.key === 'Enter') {
            const activeEl = document.querySelector('.kb-focused') as HTMLElement;
            if (activeEl) activeEl.click();
        }
    }

    onMounted(() => window.addEventListener('keydown', handleKeyDown));
    onBeforeUnmount(() => window.removeEventListener('keydown', handleKeyDown));

    return { isRowFocused, activeCardIndex };
}
