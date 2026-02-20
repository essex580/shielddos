<template>
  <div class="relative w-full h-[400px] bg-transparent overflow-hidden" ref="globeContainer">
      <!-- We will mount globe.gl here -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import Globe from 'globe.gl';

// Suppress THREE.Clock deprecation warning from globe.gl internls
const originalWarn = console.warn;
console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('THREE.Clock: This module has been deprecated')) return;
    originalWarn.apply(console, args);
};

const props = defineProps<{
    attacks: any[] // { startLat, startLng, endLat, endLng, color }
}>();

const globeContainer = ref<HTMLElement | null>(null);
let world: any = null;

onMounted(() => {
    if (!globeContainer.value) return;

    world = (Globe as any)()(globeContainer.value)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
        .backgroundColor('rgba(0,0,0,0)')
        .arcColor('color')
        .arcDashLength(0.4)
        .arcDashGap(0.2)
        .arcDashAnimateTime(1500)
        .arcsTransitionDuration(0)
        // Set points for origins or attack sources
        .pointColor(() => '#ef4444')
        .pointAltitude(0.01)
        .pointRadius(0.5);

    // Auto-rotate
    world.controls().autoRotate = true;
    world.controls().autoRotateSpeed = 1.2;
    world.controls().enableZoom = false; // keep it clean

    // Initial render
    updateGlobe(props.attacks);

    // Make it responsive
    const resizeObserver = new ResizeObserver(() => {
        if (globeContainer.value && world) {
            world.width(globeContainer.value.clientWidth);
            world.height(globeContainer.value.clientHeight);
        }
    });
    resizeObserver.observe(globeContainer.value);
});

onUnmounted(() => {
    if (world) {
        // cleanup if possible
        const controls = world.controls();
        if (controls) controls.dispose();
    }
});

const updateGlobe = (data: any[]) => {
    if (!world) return;
    world.arcsData(data);
    
    // Add points for all start/end locations
    const pointsData: any[] = [];
    data.forEach(arc => {
        pointsData.push({ lat: arc.startLat, lng: arc.startLng });
        pointsData.push({ lat: arc.endLat, lng: arc.endLng });
    });
    world.pointsData(pointsData);
};

watch(() => props.attacks, (newVal) => {
    // CRITICAL BUG FIX: Deep clone the array before passing to globe.gl
    // 3D libraries mutate data objects to attach internal __threeObj properties.
    // If passed a Vue Reactive Proxy, this triggers an infinite update loop that crashes the browser!
    try {
        const rawData = JSON.parse(JSON.stringify(newVal));
        updateGlobe(rawData);
    } catch (e) {
        console.error('Globe update error', e);
    }
}, { deep: true });
</script>
