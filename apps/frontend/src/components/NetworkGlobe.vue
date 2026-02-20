<template>
  <div class="relative w-full h-[400px] bg-transparent overflow-hidden" ref="globeContainer">
      <!-- We will mount globe.gl here -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Globe from 'globe.gl';

const globeContainer = ref<HTMLElement | null>(null);
let world: any = null;
let attackInterval: any;

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

    // Maintain a raw javascript array natively to avoid Vue Proxy interference, which causes 3D stuttering!
    const arcsData: any[] = [];
    const pointsData: any[] = [];

    attackInterval = setInterval(() => {
        const startLat = (Math.random() - 0.5) * 160;
        const startLng = (Math.random() - 0.5) * 360;
        const endLat = (Math.random() - 0.5) * 160;
        const endLng = (Math.random() - 0.5) * 360;
        const isBlocked = Math.random() > 0.4;

        arcsData.push({
            startLat, startLng, endLat, endLng,
            color: isBlocked ? '#ef4444' : '#10b981'
        });
        
        pointsData.push({ lat: startLat, lng: startLng });
        pointsData.push({ lat: endLat, lng: endLng });

        if (arcsData.length > 25) {
            arcsData.shift();
            pointsData.shift();
            pointsData.shift();
        }

        // Updating the globe with native arrays prevents the dash generator from completely restarting!
        world.arcsData(arcsData);
        world.pointsData(pointsData);
    }, 400);

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
    if (attackInterval) clearInterval(attackInterval);
    if (world) {
        // cleanup if possible
        const controls = world.controls();
        if (controls) controls.dispose();
    }
});
</script>
