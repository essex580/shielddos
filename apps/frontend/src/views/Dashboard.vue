<template>
  <div class="p-6 space-y-6 max-w-full font-mono text-sm">
    <header class="flex justify-between items-end pb-4 border-b border-zinc-800">
      <div>
        <h2 class="text-xl font-bold text-white flex items-center gap-3">
          <Activity class="w-5 h-5 text-blue-500" /> System Status
        </h2>
        <p class="text-zinc-500 mt-1 text-xs">Traffic monitoring and intrusion detection.</p>
      </div>
      <div class="flex space-x-3">
        <button @click="fetchData" class="terminal-button-outline flex items-center gap-2 text-xs font-semibold">
          <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': loading }" /> 
          Refresh
        </button>
      </div>
    </header>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="terminal-card">
        <div class="flex items-center justify-between mb-4">
          <p class="text-zinc-500 text-xs font-semibold">Total Requests</p>
          <BarChart3 class="w-4 h-4 text-zinc-600" />
        </div>
        <h3 class="text-3xl font-bold text-white">{{ stats.totalRequests }}</h3>
        <span class="text-zinc-600 text-[10px] mt-2 block font-medium">Last 24h</span>
      </div>
      
      <div class="terminal-card">
        <div class="flex items-center justify-between mb-4">
          <p class="text-zinc-500 text-xs font-semibold">Threats Blocked</p>
          <ShieldAlert class="w-4 h-4 text-zinc-600" />
        </div>
        <h3 class="text-3xl font-bold text-white">{{ stats.blocked }}</h3>
        <span class="text-zinc-600 text-[10px] mt-2 block font-medium uppercase" v-if="stats.blocked > 0">
           <span class="text-white bg-red-900/50 text-red-200 px-1.5 py-0.5 rounded-sm">Detected</span>
        </span>
        <span class="text-zinc-600 text-[10px] mt-2 block font-medium uppercase" v-else>
           <span class="text-green-500">Secure</span>
        </span>
      </div>
      
      <div class="terminal-card">
        <div class="flex items-center justify-between mb-4">
          <p class="text-zinc-500 text-xs font-semibold">Active Nodes</p>
          <Globe class="w-4 h-4 text-zinc-600" />
        </div>
        <h3 class="text-3xl font-bold text-white">{{ stats.activeSites }}</h3>
        <span class="text-zinc-600 text-[10px] mt-2 block font-medium">Domains Up</span>
      </div>
      
      <div class="terminal-card">
        <div class="flex items-center justify-between mb-4">
          <p class="text-zinc-500 text-xs font-semibold">Unique IPs</p>
          <Users class="w-4 h-4 text-zinc-600" />
        </div>
        <h3 class="text-3xl font-bold text-white">{{ stats.uniqueIps }}</h3>
        <span class="text-zinc-600 text-[10px] mt-2 block font-medium">Visitors</span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      <!-- Globe Section -->
      <div class="lg:col-span-2 terminal-card min-h-[400px] flex flex-col p-4 border border-zinc-800">
          <h3 class="font-bold text-white mb-4 flex items-center gap-2 text-[11px] uppercase tracking-wider border-b border-zinc-800/50 pb-2">
            <Globe class="w-3.5 h-3.5 text-blue-500" /> Global Threat Surface (Live)
          </h3>
          <div class="flex-1 w-full bg-black/50 rounded-lg overflow-hidden border-zinc-800/50 relative">
             <NetworkGlobe :attacks="liveAttacks" />
             <div class="absolute bottom-3 left-3 flex gap-4 text-[9px] font-mono select-none">
                 <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> Valid Request</div>
                 <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-rose-500"></span> Threat Blocked</div>
             </div>
          </div>
      </div>

      <!-- Chart Section -->
      <div class="lg:col-span-2 terminal-card min-h-[350px]">
        <h3 class="font-bold text-white mb-6 flex items-center gap-2 text-sm border-b border-zinc-800 pb-3">
            <Activity class="w-4 h-4 text-blue-500" /> Traffic Flow
        </h3>
        <div class="h-64 w-full">
            <Line :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Recent Calls Feed -->
      <div class="lg:col-span-2 terminal-card flex flex-col p-0 overflow-hidden">
        <div class="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
          <h3 class="font-bold text-white flex items-center gap-2 text-sm">
            <List class="w-4 h-4 text-blue-500" /> Event Log
          </h3>
          <div class="flex items-center gap-2 text-[10px] text-zinc-500 font-semibold uppercase">
             <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span> Live
          </div>
        </div>
        <div class="overflow-x-auto flex-1">
          <table class="w-full text-left text-xs font-mono">
            <thead class="bg-zinc-900/50 text-zinc-500 font-semibold border-b border-zinc-800 text-xs">
              <tr>
                <th class="p-3 pl-4">Time</th>
                <th class="p-3">Method</th>
                <th class="p-3">Path</th>
                <th class="p-3">IP Address</th>
                <th class="p-3">Country</th>
                <th class="p-3">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800 text-zinc-400">
              <tr v-for="log in paginatedLogs" :key="log.id" class="hover:bg-zinc-900 transition-colors">
                <td class="p-3 pl-4 text-zinc-600 whitespace-nowrap">{{ new Date(log.timestamp).toLocaleTimeString() }}</td>
                <td class="p-3">
                    <span class="font-bold" 
                        :class="{
                            'text-green-500': log.method === 'GET',
                            'text-blue-500': log.method === 'POST',
                            'text-yellow-500': log.method === 'PUT',
                            'text-red-500': log.method === 'DELETE'
                        }">
                        {{ log.method }}
                    </span>
                </td>
                <td class="p-3 text-zinc-300 truncate max-w-[150px]" :title="log.path">{{ log.path }}</td>
                <td class="p-3 text-zinc-500">{{ log.ipAddress }}</td>
                <td class="p-3 text-zinc-600">{{ log.country || 'N/A' }}</td>
                <td class="p-3">
                  <span v-if="log.blocked" class="text-red-500 bg-red-900/20 px-2 py-0.5 rounded-md font-semibold text-[10px]">
                      {{ log.statusCode === 429 ? 'Rate Limited' : log.statusCode === 403 ? 'WAF/Bot Blocked' : 'Blocked' }}
                  </span>
                  <span v-else :class="log.statusCode >= 500 ? 'text-red-500' : log.statusCode >= 400 ? 'text-yellow-500' : 'text-green-500'" class="font-semibold text-[11px] bg-zinc-900 px-2 py-0.5 rounded-md">
                    {{ log.statusCode }}
                  </span>
                </td>
              </tr>
               <tr v-if="logs.length === 0">
                <td colspan="6" class="p-8 text-center text-zinc-500">
                    No data available
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination Controls -->
        <div class="p-3 border-t border-zinc-800 flex justify-between items-center bg-zinc-950">
            <span class="text-[10px] text-zinc-600 uppercase">PAGE {{ currentPage }} / {{ totalPages || 1 }}</span>
            <div class="flex gap-1">
                <button @click="prevPage" :disabled="currentPage === 1" class="px-2 py-1 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[10px]">
                    PREV
                </button>
                <button @click="nextPage" :disabled="currentPage === totalPages" class="px-2 py-1 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[10px]">
                    NEXT
                </button>
            </div>
        </div>
      </div>

      <!-- Top Attacking IPs / Stats -->
      <div class="terminal-card h-fit">
        <h3 class="font-bold text-white mb-4 flex items-center gap-2 text-sm border-b border-zinc-800 pb-3">
          <Zap class="w-4 h-4 text-blue-500" /> Traffic Sources
        </h3>
        <div class="space-y-1">
             <div v-for="(ip, index) in topIps" :key="ip.ip" class="flex justify-between items-center bg-zinc-900/50 p-2 border border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                <div class="flex items-center gap-3">
                  <span class="text-zinc-600 text-[10px] font-mono w-4">#{{ index + 1 }}</span>
                  <span class="text-zinc-300 font-mono text-xs">{{ ip.ip }}</span>
                </div>
                <span class="text-white text-xs bg-zinc-800 px-1.5 py-0.5">{{ ip.count }}</span>
             </div>
             <div v-if="topIps.length === 0" class="text-zinc-500 text-center text-xs py-4 border border-zinc-800 rounded-md">
                 No source data
             </div>
        </div>
      </div>
    </div>

    <!-- Advanced Edge Analytics Row (Phase 9 GraphQL) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Traffic Distribution -->
       <div class="terminal-card flex flex-col p-5">
         <h3 class="font-bold text-white mb-4 w-full text-left flex items-center gap-2 text-sm border-b border-zinc-800 pb-3">
           <Filter class="w-4 h-4 text-emerald-500" /> Layer 7 Methods
         </h3>
         <div class="h-32 w-full relative flex items-center justify-center mt-2">
            <Doughnut v-if="trafficDistChartData.datasets[0].data.length > 0" :data="trafficDistChartData" :options="chartOptionsDoughnut" />
            <div v-else class="text-zinc-600 font-mono text-xs text-center border-4 border-zinc-800 rounded-full w-24 h-24 flex items-center justify-center">No Data</div>
         </div>
       </div>

       <!-- Edge Cache Hit Ratio -->
       <div class="terminal-card flex flex-col p-5">
         <h3 class="font-bold text-white mb-4 w-full text-left flex items-center gap-2 text-sm border-b border-zinc-800 pb-3">
           <Database class="w-4 h-4 text-blue-500" /> Edge Cache CDN
         </h3>
         <div class="flex items-center gap-4 w-full mt-2">
            <div class="h-28 w-28 relative flex-shrink-0">
                <Doughnut v-if="cacheHitChartData.datasets[0].data.reduce((a, b) => a + b, 0) > 0" :data="cacheHitChartData" :options="chartOptionsDoughnut" />
                <div v-else class="flex h-full items-center justify-center border-4 border-zinc-800 rounded-full text-zinc-600 text-[10px] w-full text-center">Empty</div>
            </div>
            <div class="flex flex-col gap-2 flex-1">
                <div class="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800 flex justify-between items-center">
                    <span class="text-[10px] text-zinc-500 font-bold uppercase">Hits (RAM-bound)</span>
                    <span class="text-xs text-emerald-400 font-mono">{{ stats.cacheHits }}</span>
                </div>
                <div class="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800 flex justify-between items-center">
                    <span class="text-[10px] text-zinc-500 font-bold uppercase">Misses (Origin)</span>
                    <span class="text-xs text-zinc-400 font-mono">{{ stats.cacheMisses }}</span>
                </div>
            </div>
         </div>
       </div>

       <!-- Active Tarpits -->
       <div class="terminal-card flex flex-col p-5 justify-between">
         <div class="w-full">
             <h3 class="font-bold text-white mb-4 flex items-center gap-2 text-sm border-b border-zinc-800 pb-3">
               <HardDrive class="w-4 h-4 text-purple-500" /> Persistent Tarpits
             </h3>
             <p class="text-[10px] text-zinc-400 mb-6 leading-relaxed">Malicious vulnerability scanners permanently suspended in 1-byte TCP proxy loops. Draining attacker server resources.</p>
         </div>
         <div class="w-full flex items-end justify-between border-t border-zinc-800/50 pt-4 mt-auto">
             <div>
                <h3 class="text-5xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">{{ stats.activeTarpits }}</h3>
             </div>
             <div class="text-[10px] font-bold text-purple-400/50 uppercase flex items-center gap-1 animate-pulse">
                <span class="w-1.5 h-1.5 bg-purple-500 rounded-full"></span> Traps Active
             </div>
         </div>
       </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import axios from 'axios'
import { io, Socket } from 'socket.io-client'
import { Activity, RefreshCw, BarChart3, ShieldAlert, Globe, Users, List, Zap, ChevronLeft, ChevronRight, ShieldCheck, Database, HardDrive, Filter } from 'lucide-vue-next';
import { Line, Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement } from 'chart.js'
import NetworkGlobe from '../components/NetworkGlobe.vue';
import { getGeoCoordinates } from '../utils/geo';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement)

interface Log {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  ipAddress: string;
  statusCode: number;
  blocked: boolean;
  country?: string;
}

const stats = ref({
    totalRequests: 0,
    blocked: 0,
    activeSites: 0,
    uniqueIps: 0,
    activeTarpits: 0,
    cacheHits: 0,
    cacheMisses: 0
})

const siteStore = ref<any[]>([]);
const liveAttacks = ref<any[]>([]);

const logs = ref<Log[]>([])
const loading = ref(false)
const socket = ref<Socket | null>(null)
const chartData = ref<any>({
    labels: [],
    datasets: [
        {
            label: 'Requests',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: '#3b82f6',
            data: [],
            fill: true,
            tension: 0.4
        },
        {
            label: 'Blocked',
            backgroundColor: 'rgba(244, 63, 94, 0.2)',
            borderColor: '#f43f5e',
            data: [],
            fill: true,
            tension: 0.4
        }
    ]
})

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: {
            grid: { display: false, drawBorder: false },
            ticks: { color: '#52525b', font: { family: 'JetBrains Mono', size: 10 } }
        },
        y: {
            grid: { color: '#27272a', drawBorder: false },
            ticks: { color: '#52525b', font: { family: 'JetBrains Mono', size: 10 } },
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
            padding: 10
        }
    },
    elements: {
        line: {
            tension: 0, 
            borderWidth: 2,
            borderColor: '#fff',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            fill: true
        },
        point: {
            radius: 0,
            hitRadius: 10,
            hoverRadius: 4
        }
    }
}

const chartOptionsDoughnut = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
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
            displayColors: true,
            padding: 10
        }
    }
}

const trafficDistChartData = computed(() => {
    return {
        labels: trafficDist.value.map(d => d.name),
        datasets: [{
            data: trafficDist.value.map(d => parseInt(d.value)),
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
            borderColor: '#09090b',
            borderWidth: 3,
            hoverOffset: 4
        }]
    }
})

const cacheHitChartData = computed(() => {
    return {
        labels: ['Hits', 'Misses'],
        datasets: [{
            data: [stats.value.cacheHits, stats.value.cacheMisses],
            backgroundColor: ['#10b981', '#52525b'],
            borderColor: '#09090b',
            borderWidth: 3,
            hoverOffset: 4
        }]
    }
})

// Pagination ... (keep existing)
const currentPage = ref(1)
const itemsPerPage = 10

const paginatedLogs = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return logs.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(logs.value.length / itemsPerPage))

const nextPage = () => {
    if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
    if (currentPage.value > 1) currentPage.value--
}

const topIps = ref<any[]>([]);
const trafficDist = ref<any[]>([]);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const fetchData = async () => {
    loading.value = true;
    try {
        const siteRes = await axios.get(`${API_URL}/sites`);
        siteStore.value = siteRes.data;
        stats.value.activeSites = siteRes.data.filter((s: any) => s.isActive).length;

        // Fetch Raw Logs for Table
        const logRes = await axios.get(`${API_URL}/analytics`);
        logs.value = logRes.data; 
        
        // Fetch Phase 9 GraphQL Aggregations
        await fetchGraphql();

        // Initial chart fetch
        await updateChart();

    } catch (e) {
        console.error("Error fetching dashboard data", e);
    } finally {
        loading.value = false;
    }
}

const fetchGraphql = async () => {
    try {
        const query = `
            query {
              getGlobalAnalytics {
                totalRequests
                blockedRequests
                activeTarpits
                cacheHits
                cacheMisses
                topIps { name value }
                trafficDistribution { name value }
              }
            }
        `;
        const res = await axios.post(`${API_URL}/graphql`, { query }, {
            withCredentials: true
        });
        const data = res.data.data?.getGlobalAnalytics;
        if (data) {
            stats.value.totalRequests = data.totalRequests;
            stats.value.blocked = data.blockedRequests;
            stats.value.activeTarpits = data.activeTarpits || 0;
            stats.value.cacheHits = data.cacheHits || 0;
            stats.value.cacheMisses = data.cacheMisses || 0;
            topIps.value = (data.topIps || []).slice(0, 5).map((d: any) => ({ ip: d.name, count: d.value }));
            trafficDist.value = data.trafficDistribution || [];
        }
    } catch (e) {
        console.error('GraphQL Error', e);
    }
}

const updateChart = async () => {
    try {
        const res = await axios.get(`${API_URL}/analytics/chart`);
        const data = res.data; // [{ time: '12:00', count: "5", blocked: "0" }]
        
        chartData.value = {
            labels: data.map((d: any) => d.time),
            datasets: [
                {
                    ...chartData.value.datasets[0],
                    data: data.map((d: any) => parseInt(d.count))
                },
                {
                    ...chartData.value.datasets[1],
                    data: data.map((d: any) => parseInt(d.blocked || '0'))
                }
            ]
        }
    } catch (e) {
         console.error("Chart data error", e);
    }
}

// Stats calculate unique IPs locally as it's purely UI log based
const updateStats = () => {
    stats.value.uniqueIps = new Set(logs.value.map(l => l.ipAddress)).size;
}

onMounted(() => {
    fetchData();

    socket.value = io(API_URL);
    
    socket.value.on('connect', () => {
        console.log('Connected to WebSocket');
    });

    socket.value.on('new_traffic', async (data: any) => {
        logs.value.unshift(data);
        updateStats();
        // Background refresh graph silently on traffic spike
        if (Math.random() < 0.2) fetchGraphql(); 

        // 3D WebGL Globe Logic
        // Calculate Attacker Geo
        const attackerGeo = getGeoCoordinates(data.country || 'XX');
        
        // Calculate Destination Geo (Target Origin Node)
        let destGeo = getGeoCoordinates('US'); // Global Fallback
        const originSite = siteStore.value.find(s => s.id === data.siteId);
        
        if (originSite && Array.isArray(originSite.targetIp) && originSite.targetIp.length > 0) {
            const firstRegion = originSite.targetIp[0].region;
            if (firstRegion === 'EU') destGeo = getGeoCoordinates('DE');
            else if (firstRegion === 'AS') destGeo = getGeoCoordinates('JP');
            else if (firstRegion === 'OC') destGeo = getGeoCoordinates('AU');
            else if (firstRegion === 'AF') destGeo = getGeoCoordinates('ZA');
            else if (firstRegion === 'SA') destGeo = getGeoCoordinates('BR');
        }

        // Add 3D Arc
        liveAttacks.value.push({
            startLat: attackerGeo.lat,
            startLng: attackerGeo.lng,
            endLat: destGeo.lat,
            endLng: destGeo.lng,
            color: data.blocked ? '#ef4444' : '#10b981', // Red vs Green
            timestamp: Date.now()
        });

        // Delete old arcs so the GPU doesn't melt
        if (liveAttacks.value.length > 50) {
            liveAttacks.value.shift();
        }
    });
    
    // Refresh chart every 10s
    const chartInterval = setInterval(updateChart, 10000);
    
    onUnmounted(() => {
        clearInterval(chartInterval);
        if (socket.value) socket.value.disconnect();
    })
})
</script>
