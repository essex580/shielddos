<template>
  <div class="relative w-full h-full bg-transparent overflow-hidden" ref="globeContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, toRaw } from 'vue';
import Globe from 'globe.gl';
import { currentTheme } from '../utils/theme';

const props = defineProps<{
    attacks: any[]
}>();

const globeContainer = ref<HTMLElement | null>(null);
let world: any = null;
let resizeObs: ResizeObserver | null = null;

// Raw arrays to avoid Vue proxy overhead on Three.js internals
const arcsData: any[] = [];
const pointsData: any[] = [];
const seenIds = new Set<string>();

// Destination: Romania (server location)
const SERVER_LAT = 44.4268;
const SERVER_LNG = 26.1025;

onMounted(async () => {
    if (!globeContainer.value) return;

    // Fetch country polygons for realistic borders
    let countries: any = { features: [] };
    try {
        const res = await fetch('https://unpkg.com/world-atlas@2/countries-110m.json');
        const topoData = await res.json();
        const topojson = await import('topojson-client');
        countries = topojson.feature(topoData, topoData.objects.countries);
    } catch (e) {
        console.warn('[Globe] Could not load country polygons, using fallback');
    }

    world = (Globe as any)()(globeContainer.value)
        // Dark globe with country polygons
        .backgroundColor('rgba(0,0,0,0)')
        .showGlobe(true)
        .globeImageUrl('')
        .showAtmosphere(true)
        .atmosphereColor('#0ea5e9')
        .atmosphereAltitude(0.18)

        // Country polygons for realistic borders
        .polygonsData(countries.features)
        .polygonCapColor(() => currentTheme.value === 'dark' ? '#111827' : '#e2e8f0')
        .polygonSideColor(() => currentTheme.value === 'dark' ? '#1e293b' : '#cbd5e1')
        .polygonStrokeColor(() => currentTheme.value === 'dark' ? '#334155' : '#94a3b8')
        .polygonAltitude(0.005)

        // Animated arcs (attack trails)
        .arcsData(arcsData)
        .arcColor((d: any) => d.color)
        .arcStroke(0.6)
        .arcDashLength(0.6)
        .arcDashGap(0.3)
        .arcDashAnimateTime(2000)
        .arcsTransitionDuration(300)
        .arcAltitudeAutoScale(0.4)
        .arcLabel((d: any) => {
            if (!d.ipAddress) return '';
            const bg = currentTheme.value === 'dark' ? 'rgba(9, 9, 11, 0.9)' : 'rgba(255, 255, 255, 0.9)';
            const color = currentTheme.value === 'dark' ? '#fff' : '#000';
            return `
            <div style="background: ${bg}; border: 1px solid ${d.blocked ? '#ef4444' : '#10b981'}; border-radius: 6px; padding: 8px 12px; font-family: monospace; font-size: 11px; color: ${color}; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
                <div style="font-weight: bold; color: ${d.blocked ? '#ef4444' : '#10b981'}; margin-bottom: 4px;">${d.blocked ? 'Blocked' : 'Allowed'} Request</div>
                <div><span style="color: #a1a1aa">IP:</span> ${d.ipAddress}</div>
                <div><span style="color: #a1a1aa">Geo:</span> ${d.country}</div>
                <div style="margin-top: 4px; border-top: 1px solid #cbd5e1; padding-top: 4px;">
                    <span style="color: #3b82f6">${d.method}</span> ${d.path}
                </div>
            </div>`;
        })

        // Glowing points at attack source/destination
        .pointsData(pointsData)
        .pointColor((d: any) => d.color)
        .pointAltitude(0.01)
        .pointRadius((d: any) => d.isServer ? 0.6 : 0.3)
        .pointsMerge(false)
        .pointsTransitionDuration(300)

        // Ring pulse effect at impact points
        .ringsData([])
        .ringColor(() => (t: number) => `rgba(16, 185, 129, ${1 - t})`)
        .ringMaxRadius(3)
        .ringPropagationSpeed(2)
        .ringRepeatPeriod(1500);

    // Globe material
    const updateGlobeColors = () => {
        const globeMaterial = world.globeMaterial();
        if (currentTheme.value === 'dark') {
            globeMaterial.color.set('#030712');
            globeMaterial.emissive.set('#030712');
            world.atmosphereColor('#0ea5e9');
        } else {
            globeMaterial.color.set('#f1f5f9'); // slate-100 to match light mode
            globeMaterial.emissive.set('#f1f5f9');
            world.atmosphereColor('#38bdf8');
        }
        globeMaterial.emissiveIntensity = 0.08;
        globeMaterial.needsUpdate = true;
        
        // Force re-evaluation of polygon colors
        if (countries && countries.features) {
            world.polygonsData([...countries.features]);
        }
    };
    
    updateGlobeColors();
    watch(currentTheme, updateGlobeColors);

    // Camera & controls
    world.pointOfView({ lat: 45, lng: 25, altitude: 2.2 }); // Focus on Romania
    world.controls().autoRotate = true;
    world.controls().autoRotateSpeed = 0.4;
    world.controls().enableZoom = false;
    world.controls().enablePan = false;
    world.controls().minPolarAngle = Math.PI * 0.25;
    world.controls().maxPolarAngle = Math.PI * 0.75;

    // Add server point (Romania)
    pointsData.push({
        lat: SERVER_LAT,
        lng: SERVER_LNG,
        color: '#0ea5e9',
        isServer: true
    });
    world.pointsData([...pointsData]);

    // Add server ring
    world.ringsData([{
        lat: SERVER_LAT,
        lng: SERVER_LNG
    }]);

    // Responsive sizing
    resizeObs = new ResizeObserver(() => {
        if (globeContainer.value && world) {
            world.width(globeContainer.value.clientWidth);
            world.height(globeContainer.value.clientHeight);
        }
    });
    resizeObs.observe(globeContainer.value);

    // Initial size
    world.width(globeContainer.value.clientWidth);
    world.height(globeContainer.value.clientHeight);
});

// Watch for new attacks from WebSocket
watch(() => props.attacks, (newVal) => {
    if (!world || !newVal) return;

    const raw = toRaw(newVal);
    let changed = false;

    raw.forEach((attack: any) => {
        const id = `${attack.timestamp}`;
        if (seenIds.has(id)) return;
        seenIds.add(id);
        changed = true;

        // Use real coordinates from attack data, fallback to server location for destination
        const srcLat = attack.startLat ?? 0;
        const srcLng = attack.startLng ?? 0;
        const dstLat = attack.endLat ?? SERVER_LAT;
        const dstLng = attack.endLng ?? SERVER_LNG;

        arcsData.push({
            startLat: srcLat,
            startLng: srcLng,
            endLat: dstLat,
            endLng: dstLng,
            color: attack.color || '#10b981',
            ipAddress: attack.ipAddress,
            country: attack.country,
            method: attack.method,
            path: attack.path,
            blocked: attack.blocked
        });

        // Source point (attacker)
        pointsData.push({
            lat: srcLat,
            lng: srcLng,
            color: attack.color || '#10b981',
            isServer: false,
            ipAddress: attack.ipAddress
        });
    });

    // Keep max 40 arcs
    while (arcsData.length > 40) {
        arcsData.shift();
    }
    // Keep server point + max 60 attack points
    while (pointsData.length > 61) {
        pointsData.splice(1, 1); // Don't remove index 0 (server)
    }

    if (changed) {
        world.arcsData([...arcsData]);
        world.pointsData([...pointsData]);
    }
}, { deep: true });

onUnmounted(() => {
    if (resizeObs) resizeObs.disconnect();
    if (world) {
        try { world.controls().dispose(); } catch {}
        world._destructor?.();
    }
});
</script>
