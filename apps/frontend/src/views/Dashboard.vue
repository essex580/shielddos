<template>
  <div class="p-6 space-y-6 max-w-full font-mono text-sm relative">
    
    <!-- Live Event Toast -->
    <transition name="toast">
      <div v-if="latestEvent" class="fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border bg-[color:var(--bg-panel)] backdrop-blur-md" :class="latestEvent.blocked ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'">
        <div class="relative flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" :class="latestEvent.blocked ? 'bg-red-400' : 'bg-emerald-400'"></span>
          <span class="relative inline-flex rounded-full h-3 w-3" :class="latestEvent.blocked ? 'bg-red-500' : 'bg-emerald-500'"></span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs font-bold text-[color:var(--text-main)]">{{ latestEvent.blocked ? 'Threat Blocked' : 'Valid Request' }}</span>
          <span class="text-[10px] text-[color:var(--text-muted)]"><span class="font-bold text-[color:var(--text-main)]">{{ latestEvent.ipAddress }}</span> requested {{ latestEvent.path }}</span>
        </div>
      </div>
    </transition>
    <header class="flex justify-between items-end pb-4 border-b border-[color:var(--border-subtle)]">
      <div>
        <h2 class="text-xl font-bold text-[color:var(--text-main)] flex items-center gap-3">
          <Activity class="w-5 h-5 text-blue-500" /> System Status
        </h2>
        <p class="text-[color:var(--text-muted)] mt-1 text-xs">Traffic monitoring and intrusion detection.</p>
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
      <div class="terminal-card transition-transform duration-300" :class="{ 'scale-105 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]': statsFlash.total }">
        <div class="flex items-center justify-between mb-4">
          <p class="text-[color:var(--text-muted)] text-xs font-semibold">Total Requests</p>
          <BarChart3 class="w-4 h-4 text-[color:var(--text-muted)]" />
        </div>
        <h3 class="text-3xl font-bold text-[color:var(--text-main)]">{{ stats.totalRequests }}</h3>
        <span class="text-[color:var(--text-muted)] text-[10px] mt-2 block font-medium">Last 24h</span>
      </div>
      
      <div class="terminal-card transition-transform duration-300" :class="{ 'scale-105 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]': statsFlash.blocked }">
        <div class="flex items-center justify-between mb-4">
          <p class="text-[color:var(--text-muted)] text-xs font-semibold">Threats Blocked</p>
          <ShieldAlert class="w-4 h-4 text-[color:var(--text-muted)]" />
        </div>
        <h3 class="text-3xl font-bold text-[color:var(--text-main)]">{{ stats.blocked }}</h3>
        <span class="text-[color:var(--text-muted)] text-[10px] mt-2 block font-medium uppercase" v-if="stats.blocked > 0">
           <span class="text-[color:var(--text-main)] bg-red-900/50 text-red-200 px-1.5 py-0.5 rounded-sm">Detected</span>
        </span>
        <span class="text-[color:var(--text-muted)] text-[10px] mt-2 block font-medium uppercase" v-else>
           <span class="text-green-500">Secure</span>
        </span>
      </div>
      
      <div class="terminal-card transition-colors duration-300" :class="stats.avgLatency > 500 ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : (stats.avgLatency > 200 ? 'border-amber-500' : '')">
        <div class="flex items-center justify-between mb-4">
          <p class="text-[color:var(--text-muted)] text-xs font-semibold">Proxy Latency</p>
          <Activity class="w-4 h-4" :class="stats.avgLatency > 500 ? 'text-red-500' : 'text-[color:var(--text-muted)]'" />
        </div>
        <h3 class="text-3xl font-bold text-[color:var(--text-main)] flex items-baseline gap-1">
          {{ stats.avgLatency || 0 }}<span class="text-xs text-[color:var(--text-muted)] font-medium">ms</span>
        </h3>
        <span class="text-[color:var(--text-muted)] text-[10px] mt-2 block font-medium">Proxy to Origin</span>
      </div>
      
      <div class="terminal-card transition-transform duration-300" :class="{ 'scale-105 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]': statsFlash.unique }">
        <div class="flex items-center justify-between mb-4">
          <p class="text-[color:var(--text-muted)] text-xs font-semibold">Unique IPs</p>
          <Users class="w-4 h-4 text-[color:var(--text-muted)]" />
        </div>
        <h3 class="text-3xl font-bold text-[color:var(--text-main)]">{{ stats.uniqueIps }}</h3>
        <span class="text-[color:var(--text-muted)] text-[10px] mt-2 block font-medium">Visitors</span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      
      <!-- Globe Section -->
      <div class="terminal-card flex flex-col p-3 border border-[color:var(--border-subtle)]">
          <h3 class="font-bold text-[color:var(--text-main)] mb-2 flex items-center gap-2 text-[11px] uppercase tracking-wider border-b border-[color:var(--border-subtle)]/50 pb-2">
            <Globe class="w-3.5 h-3.5 text-blue-500" /> Threat Map
          </h3>
          <div class="w-full h-[460px] bg-[color:var(--bg-panel)] rounded-lg overflow-hidden relative">
             <NetworkGlobe :attacks="liveAttacks" />
             <div class="absolute bottom-2 left-2 flex gap-3 text-[8px] font-mono select-none bg-[color:var(--bg-panel)] border border-[color:var(--border-subtle)] px-2 py-1 rounded">
                 <div class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Valid</div>
                 <div class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Blocked</div>
             </div>
          </div>
      </div>

      <!-- Chart Section -->
      <div class="lg:col-span-2 flex flex-col gap-4">
        <div class="terminal-card p-4 flex-1">
          <h3 class="font-bold text-[color:var(--text-main)] mb-3 flex items-center gap-2 text-[11px] uppercase tracking-wider border-b border-[color:var(--border-subtle)]/50 pb-2">
              <Activity class="w-3.5 h-3.5 text-blue-500" /> Traffic Flow
          </h3>
          <div class="h-[180px] w-full">
              <Line :data="chartData" :options="chartOptions" />
          </div>
        </div>
        
        <div class="terminal-card p-4 flex-1">
          <h3 class="font-bold text-[color:var(--text-main)] mb-3 flex items-center gap-2 text-[11px] uppercase tracking-wider border-b border-[color:var(--border-subtle)]/50 pb-2">
              <Zap class="w-3.5 h-3.5 text-emerald-500" /> Edge Bandwidth
          </h3>
          <div class="h-[180px] w-full">
              <Line :data="bandwidthChartData" :options="chartOptions" />
          </div>
        </div>
      </div>

    </div>

    <!-- Event Log + Traffic Sources -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div class="lg:col-span-3 terminal-card flex flex-col p-0 overflow-hidden max-h-[320px]">
        <div class="px-4 py-2.5 border-b border-[color:var(--border-subtle)] flex justify-between items-center bg-[color:var(--bg-surface)]">
          <h3 class="font-bold text-[color:var(--text-main)] flex items-center gap-2 text-[11px] uppercase tracking-wider">
            <List class="w-3.5 h-3.5 text-blue-500" /> Event Log
          </h3>
          <div class="flex items-center gap-2 text-[9px] text-[color:var(--text-muted)] font-semibold uppercase">
             <span class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span> Live
          </div>
        </div>
        <div class="overflow-auto flex-1">
          <table class="w-full text-left text-[11px] font-mono">
            <thead class="bg-[color:var(--bg-surface)] text-[color:var(--text-muted)] font-semibold border-b border-[color:var(--border-subtle)] text-[10px] uppercase tracking-wider sticky top-0">
              <tr>
                <th class="px-3 py-2">Time</th>
                <th class="px-3 py-2">Method</th>
                <th class="px-3 py-2">Path</th>
                <th class="px-3 py-2">IP</th>
                <th class="px-3 py-2">Country</th>
                <th class="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800/50 text-[color:var(--text-muted)] relative">
              <tr v-for="log in paginatedLogs" :key="log.id" class="hover:bg-[color:var(--bg-surface)] transition-colors" :class="{ 'bg-zinc-800/80 animate-pulse border-l-2 border-blue-500': recentEventIds.has(log.id) }">
                <td class="px-3 py-2 text-[color:var(--text-muted)] whitespace-nowrap">{{ new Date(log.timestamp).toLocaleTimeString([], {hour12:false}) }}</td>
                <td class="px-3 py-2">
                    <span class="font-bold text-[10px] px-1.5 py-0.5 rounded" :class="{
                            'text-emerald-400 bg-emerald-500/10': log.method === 'GET',
                            'text-blue-400 bg-blue-500/10': log.method === 'POST',
                            'text-amber-400 bg-amber-500/10': log.method === 'PUT',
                            'text-red-400 bg-red-500/10': log.method === 'DELETE'
                        }">{{ log.method }}</span>
                </td>
                <td class="px-3 py-2 text-[color:var(--text-main)] truncate max-w-[120px]" :title="log.path">{{ log.path }}</td>
                <td class="px-3 py-2 text-[color:var(--text-muted)]">{{ log.ipAddress }}</td>
                <td class="px-3 py-2 text-[color:var(--text-muted)]">{{ log.country || '—' }}</td>
                <td class="px-3 py-2">
                  <span v-if="log.blocked" class="text-red-400 bg-red-900/20 px-1.5 py-0.5 rounded text-[10px] font-semibold">Blocked</span>
                  <span v-else class="font-semibold text-[10px] px-1.5 py-0.5 rounded" :class="log.statusCode >= 500 ? 'text-red-400 bg-red-500/10' : log.statusCode >= 400 ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10'">{{ log.statusCode }}</span>
                </td>
              </tr>
              <tr v-if="logs.length === 0">
                <td colspan="6" class="px-3 py-6 text-center text-[color:var(--text-muted)] text-xs">No data available</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-3 py-2 border-t border-[color:var(--border-subtle)] flex justify-between items-center bg-[color:var(--bg-surface)]">
            <span class="text-[9px] text-[color:var(--text-muted)] uppercase">Page {{ currentPage }}/{{ totalPages || 1 }}</span>
            <div class="flex gap-1">
                <button @click="prevPage" :disabled="currentPage === 1" class="px-2 py-0.5 border border-[color:var(--border-subtle)] text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] disabled:opacity-30 transition-colors text-[9px]">PREV</button>
                <button @click="nextPage" :disabled="currentPage === totalPages" class="px-2 py-0.5 border border-[color:var(--border-subtle)] text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] disabled:opacity-30 transition-colors text-[9px]">NEXT</button>
            </div>
        </div>
      </div>

      <!-- Traffic Sources -->
      <div class="terminal-card p-3">
        <h3 class="font-bold text-[color:var(--text-main)] mb-3 flex items-center gap-2 text-[11px] uppercase tracking-wider border-b border-[color:var(--border-subtle)]/50 pb-2">
          <Zap class="w-3.5 h-3.5 text-amber-500" /> Top Sources
        </h3>
        <div class="space-y-1">
             <div v-for="(ip, index) in topIps" :key="ip.ip" class="flex justify-between items-center bg-[color:var(--bg-surface)] px-2 py-1.5 rounded border border-[color:var(--border-subtle)]/30 hover:bg-zinc-900/60 transition-colors">
                <div class="flex items-center gap-2">
                  <span class="text-[color:var(--text-muted)] text-[9px] font-mono">{{ index + 1 }}</span>
                  <span class="text-[color:var(--text-main)] font-mono text-[11px]">{{ ip.ip }}</span>
                </div>
                <span class="text-[color:var(--text-main)] text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded">{{ ip.count }}</span>
             </div>
             <div v-if="topIps.length === 0" class="text-[color:var(--text-muted)] text-center text-[10px] py-6">No source data</div>
        </div>
      </div>
    </div>

    <!-- Advanced Edge Analytics Row (Phase 9 GraphQL) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Traffic Distribution -->
       <div class="terminal-card flex flex-col p-5">
         <h3 class="font-bold text-[color:var(--text-main)] mb-4 w-full text-left flex items-center gap-2 text-sm border-b border-[color:var(--border-subtle)] pb-3">
           <Filter class="w-4 h-4 text-emerald-500" /> Layer 7 Methods
         </h3>
         <div class="h-32 w-full relative flex items-center justify-center mt-2">
            <Doughnut v-if="trafficDistChartData.datasets[0].data.length > 0" :data="trafficDistChartData" :options="chartOptionsDoughnut" />
            <div v-else class="text-[color:var(--text-muted)] font-mono text-xs text-center border-4 border-[color:var(--border-subtle)] rounded-full w-24 h-24 flex items-center justify-center">No Data</div>
         </div>
       </div>

       <!-- Edge Cache Hit Ratio -->
       <div class="terminal-card flex flex-col p-5">
         <h3 class="font-bold text-[color:var(--text-main)] mb-4 w-full text-left flex items-center gap-2 text-sm border-b border-[color:var(--border-subtle)] pb-3">
           <Database class="w-4 h-4 text-blue-500" /> Edge Cache CDN
         </h3>
         <div class="flex items-center gap-4 w-full mt-2">
            <div class="h-28 w-28 relative flex-shrink-0">
                <Doughnut v-if="cacheHitChartData.datasets[0].data.reduce((a, b) => a + b, 0) > 0" :data="cacheHitChartData" :options="chartOptionsDoughnut" />
                <div v-else class="flex h-full items-center justify-center border-4 border-[color:var(--border-subtle)] rounded-full text-[color:var(--text-muted)] text-[10px] w-full text-center">Empty</div>
            </div>
            <div class="flex flex-col gap-2 flex-1">
                <div class="bg-[color:var(--bg-surface)] p-2 rounded-lg border border-[color:var(--border-subtle)] flex justify-between items-center">
                    <span class="text-[10px] text-[color:var(--text-muted)] font-bold uppercase">Hits (RAM-bound)</span>
                    <span class="text-xs text-emerald-400 font-mono">{{ stats.cacheHits }}</span>
                </div>
                <div class="bg-[color:var(--bg-surface)] p-2 rounded-lg border border-[color:var(--border-subtle)] flex justify-between items-center">
                    <span class="text-[10px] text-[color:var(--text-muted)] font-bold uppercase">Misses (Origin)</span>
                    <span class="text-xs text-[color:var(--text-muted)] font-mono">{{ stats.cacheMisses }}</span>
                </div>
            </div>
         </div>
       </div>

       <!-- Active Tarpits -->
       <div class="terminal-card flex flex-col p-5 justify-between">
         <div class="w-full">
             <h3 class="font-bold text-[color:var(--text-main)] mb-4 flex items-center gap-2 text-sm border-b border-[color:var(--border-subtle)] pb-3">
               <HardDrive class="w-4 h-4 text-purple-500" /> Persistent Tarpits
             </h3>
             <p class="text-[10px] text-[color:var(--text-muted)] mb-6 leading-relaxed">Malicious vulnerability scanners permanently suspended in 1-byte TCP proxy loops. Draining attacker server resources.</p>
         </div>
         <div class="w-full flex items-end justify-between border-t border-[color:var(--border-subtle)]/50 pt-4 mt-auto">
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
import { isDemoMode } from '../demo/config';
import { createMockSocket, type MockSocket } from '../demo/mockSocket';

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
    cacheMisses: 0,
    avgLatency: 0
})

const siteStore = ref<any[]>([]);
const liveAttacks = ref<any[]>([]);

const logs = ref<Log[]>([])
const loading = ref(false)
const socket = ref<Socket | MockSocket | null>(null)
const latestEvent = ref<any>(null);
const recentEventIds = ref<Set<string>>(new Set());
let eventClearTimeout: any;
const statsFlash = ref({ total: false, blocked: false, unique: false });
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

const bandwidthChartData = ref<any>({
    labels: [],
    datasets: [
        {
            label: 'Bandwidth (KB)',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: '#10b981',
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
        y: {
            beginAtZero: true,
            grid: {
                color: 'rgba(39, 39, 42, 0.4)',
                drawBorder: false,
            },
            ticks: {
                color: '#52525b',
                font: { size: 9, family: 'JetBrains Mono, monospace' },
                padding: 8,
                maxTicksLimit: 5,
            },
            border: { display: false },
        },
        x: {
            grid: { display: false },
            ticks: {
                color: '#52525b',
                font: { size: 9, family: 'JetBrains Mono, monospace' },
                maxRotation: 0,
                maxTicksLimit: 8,
            },
            border: { display: false },
        }
    },
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: '#09090b',
            titleColor: '#e4e4e7',
            bodyColor: '#a1a1aa',
            borderColor: '#27272a',
            borderWidth: 1,
            titleFont: { size: 11, family: 'JetBrains Mono, monospace' },
            bodyFont: { size: 10, family: 'JetBrains Mono, monospace' },
            displayColors: true,
            padding: 10,
            cornerRadius: 6,
            boxPadding: 4,
        }
    },
    elements: {
        line: {
            tension: 0.4,
            borderWidth: 2,
        },
        point: {
            radius: 0,
            hitRadius: 20,
            hoverRadius: 4,
            hoverBorderWidth: 2,
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
        };
        // Bandwidth Chart fetch
        const bwRes = await axios.get(`${API_URL}/analytics/bandwidth`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        
        if (bwRes.data) {
            bandwidthChartData.value = {
                ...bandwidthChartData.value,
                labels: bwRes.data.map((d: any) => d.time),
                datasets: [
                    {
                        ...bandwidthChartData.value.datasets[0],
                        data: bwRes.data.map((d: any) => Math.round((parseInt(d.bytes || '0')) / 1024))
                    }
                ]
            }
        }
    } catch (e) {
         console.error("Chart data error", e);
    }
}

// Stats calculate unique IPs locally as it's purely UI log based
const updateStats = (oldUnique: number, oldTotal: number, oldBlocked: number) => {
    stats.value.uniqueIps = new Set(logs.value.map(l => l.ipAddress)).size;
    
    // Flash animations
    if (stats.value.uniqueIps > oldUnique) flashStat('unique');
    if (stats.value.totalRequests > oldTotal) flashStat('total');
    if (stats.value.blocked > oldBlocked) flashStat('blocked');
}

const flashStat = (key: 'total' | 'blocked' | 'unique') => {
    statsFlash.value[key] = true;
    setTimeout(() => { statsFlash.value[key] = false; }, 600);
}

onMounted(() => {
    fetchData();

    if (isDemoMode) {
        socket.value = createMockSocket();
    } else {
        socket.value = io(API_URL);
    }
    
    socket.value.on('connect', () => {
        console.log('Connected to WebSocket');
    });

    socket.value.on('new_traffic', async (data: any) => {
        const oldUnique = stats.value.uniqueIps;
        const oldTotal = stats.value.totalRequests;
        const oldBlocked = stats.value.blocked;
        
        // Add to logs
        logs.value.unshift(data);
        if (logs.value.length > 500) logs.value.pop();
        
        // Update stats counters
        stats.value.totalRequests++;
        if (data.blocked) stats.value.blocked++;
        
        updateStats(oldUnique, oldTotal, oldBlocked);
        
        // Update latency avg (rolling average approximation for UI)
        if (data.responseTime) {
            if (stats.value.avgLatency === 0) stats.value.avgLatency = data.responseTime;
            else stats.value.avgLatency = Math.round((stats.value.avgLatency * 9 + data.responseTime) / 10);
        }
        
        // Background refresh graph silently on traffic spike
        if (Math.random() < 0.2) {
             fetchGraphql();
             updateChart();
        }
        
        // Pulse table row
        recentEventIds.value.add(data.id);
        setTimeout(() => { recentEventIds.value.delete(data.id); }, 2000);
        
        // Show toast
        latestEvent.value = data;
        if (eventClearTimeout) clearTimeout(eventClearTimeout);
        eventClearTimeout = setTimeout(() => { latestEvent.value = null; }, 4000);

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
            timestamp: Date.now(),
            ipAddress: data.ipAddress,
            country: data.country || 'Unknown',
            path: data.path,
            method: data.method,
            blocked: data.blocked
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

