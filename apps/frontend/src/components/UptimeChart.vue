<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Activity class="w-4 h-4 text-blue-500" /> Origin Health
        </h3>
        <span class="text-[10px] text-zinc-500 uppercase font-semibold">
           Current Status: 
           <span v-if="currentStatus === 'up'" class="text-green-500 flex items-center gap-1 inline-flex">
               <span class="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_#22c55e]"></span> Online
           </span>
           <span v-else-if="currentStatus === 'down'" class="text-red-500 flex items-center gap-1 inline-flex">
               <span class="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_5px_#ef4444]"></span> Offline
           </span>
           <span v-else class="text-zinc-600">Waiting for Ping...</span>
        </span>
    </div>
    
    <div v-if="loading" class="h-40 flex items-center justify-center text-zinc-500 text-xs">
        <Loader2 class="w-5 h-5 animate-spin mr-2" /> Loading ping history...
    </div>
    
    <div v-else-if="logs.length === 0" class="h-40 flex items-center justify-center text-zinc-500 text-xs border border-zinc-800 border-dashed rounded-md">
        No ping data recorded yet.
    </div>

    <div v-else class="h-40 w-full relative">
        <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import axios from 'axios';
import { Activity, Loader2 } from 'lucide-vue-next';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

const props = defineProps<{
    siteId: string
}>();

const loading = ref(true);
const logs = ref<any[]>([]);

const currentStatus = computed(() => {
    if (logs.value.length === 0) return 'unknown';
    return logs.value[logs.value.length - 1].status; // Last element is the most recent (since we reverse in API)
});

const chartData = computed(() => {
    return {
        labels: logs.value.map(l => new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
        datasets: [
            {
                label: 'Latency (ms)',
                backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 150);
                    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
                    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
                    return gradient;
                },
                borderColor: '#3b82f6',
                data: logs.value.map(l => l.status === 'down' ? 0 : l.latencyMs),
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                pointBackgroundColor: logs.value.map(l => l.status === 'down' ? '#ef4444' : '#3b82f6'),
                borderWidth: 2,
            }
        ]
    }
});

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: '#52525b', font: { family: 'JetBrains Mono', size: 9 }, maxTicksLimit: 8 }
        },
        y: {
            grid: { color: '#27272a', borderDash: [2, 4] },
            ticks: { color: '#52525b', font: { family: 'JetBrains Mono', size: 9 }, callback: (val: any) => val + 'ms' },
            beginAtZero: true
        }
    },
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: '#09090b',
            titleColor: '#fff',
            bodyColor: '#a1a1aa',
            borderColor: '#27272a',
            borderWidth: 1,
            titleFont: { family: 'JetBrains Mono' },
            bodyFont: { family: 'JetBrains Mono' },
            displayColors: false,
            callbacks: {
                label: function(context: any) {
                    const idx = context.dataIndex;
                    const log = logs.value[idx];
                    if (log.status === 'down') return `Status: Offline (${log.errorMessage || 'Timeout'})`;
                    return `Latency: ${context.parsed.y}ms`;
                }
            }
        }
    }
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const fetchData = async () => {
    try {
        const res = await axios.get(`${API_URL}/uptime/sites/${props.siteId}`);
        logs.value = res.data;
    } catch (e) {
        console.error("Failed to fetch uptime history", e);
    } finally {
        loading.value = false;
    }
};

let pollInterval: any;

onMounted(() => {
    fetchData();
    pollInterval = setInterval(fetchData, 60000); // refresh every minute
});

onUnmounted(() => {
    clearInterval(pollInterval);
});
</script>
