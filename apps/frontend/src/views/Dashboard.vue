<template>
  <div class="p-6 space-y-6 max-w-full font-mono text-sm">
    <header class="flex justify-between items-end pb-4 border-b border-zinc-800">
      <div>
        <h2 class="text-xl font-bold text-white flex items-center gap-3 uppercase tracking-widest">
          <Activity class="w-5 h-5 text-zinc-500" /> SYSTEM_STATUS
        </h2>
        <p class="text-zinc-500 mt-1 text-xs">Traffic monitoring and intrusion detection system.</p>
      </div>
      <div class="flex space-x-3">
        <button @click="fetchData" class="terminal-button-outline flex items-center gap-2 text-xs uppercase tracking-wider">
          <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': loading }" /> 
          SYNC_DATA
        </button>
      </div>
    </header>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="terminal-card">
        <div class="flex items-center justify-between mb-4">
          <p class="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">TOTAL_REQ</p>
          <BarChart3 class="w-4 h-4 text-zinc-600" />
        </div>
        <h3 class="text-3xl font-bold text-white">{{ stats.totalRequests }}</h3>
        <span class="text-zinc-600 text-[10px] mt-2 block font-medium">BUFFER: 100</span>
      </div>
      
      <div class="terminal-card">
        <div class="flex items-center justify-between mb-4">
          <p class="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">THREATS_BLOCKED</p>
          <ShieldAlert class="w-4 h-4 text-zinc-600" />
        </div>
        <h3 class="text-3xl font-bold text-white">{{ stats.blocked }}</h3>
        <span class="text-zinc-600 text-[10px] mt-2 block font-medium uppercase" v-if="stats.blocked > 0">
           <span class="text-white bg-zinc-800 px-1">DETECTED</span>
        </span>
        <span class="text-zinc-600 text-[10px] mt-2 block font-medium uppercase" v-else>
           <span class="text-zinc-500">SECURE</span>
        </span>
      </div>
      
      <div class="terminal-card">
        <div class="flex items-center justify-between mb-4">
          <p class="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">ACTIVE_NODES</p>
          <Globe class="w-4 h-4 text-zinc-600" />
        </div>
        <h3 class="text-3xl font-bold text-white">{{ stats.activeSites }}</h3>
        <span class="text-zinc-600 text-[10px] mt-2 block font-medium">DOMAINS UP</span>
      </div>
      
      <div class="terminal-card">
        <div class="flex items-center justify-between mb-4">
          <p class="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">UNIQUE_IV</p>
          <Users class="w-4 h-4 text-zinc-600" />
        </div>
        <h3 class="text-3xl font-bold text-white">{{ stats.uniqueIps }}</h3>
        <span class="text-zinc-600 text-[10px] mt-2 block font-medium">IP_ADDR</span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Chart Section -->
      <div class="lg:col-span-3 terminal-card min-h-[350px]">
        <h3 class="font-bold text-white mb-6 flex items-center gap-2 text-xs uppercase tracking-widest border-b border-zinc-800 pb-2">
            <Activity class="w-4 h-4 text-zinc-500" /> TRAFFIC_FLOW // REQ_PER_SEC
        </h3>
        <div class="h-64 w-full">
            <Line :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Recent Calls Feed -->
      <div class="lg:col-span-2 terminal-card flex flex-col p-0 overflow-hidden">
        <div class="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
          <h3 class="font-bold text-white flex items-center gap-2 text-xs uppercase tracking-widest">
            <List class="w-4 h-4 text-zinc-500" /> EVENT_LOG
          </h3>
          <div class="flex items-center gap-2 text-[10px] text-zinc-500 uppercase">
             <span class="w-2 h-2 bg-white animate-pulse"></span> LIVE
          </div>
        </div>
        <div class="overflow-x-auto flex-1">
          <table class="w-full text-left text-xs font-mono">
            <thead class="bg-zinc-900/50 text-zinc-500 font-bold border-b border-zinc-800 uppercase tracking-wider">
              <tr>
                <th class="p-3 pl-4">TIMESTAMP</th>
                <th class="p-3">METHOD</th>
                <th class="p-3">PATH</th>
                <th class="p-3">SRC_IP</th>
                <th class="p-3">GEO</th>
                <th class="p-3">CODE</th>
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
                  <span v-if="log.blocked" class="text-red-500 font-bold">BLOCKED</span>
                  <span v-else :class="log.statusCode >= 500 ? 'text-red-500' : log.statusCode >= 400 ? 'text-yellow-500' : 'text-green-500'" class="font-bold">
                    {{ log.statusCode }}
                  </span>
                </td>
              </tr>
               <tr v-if="logs.length === 0">
                <td colspan="6" class="p-8 text-center text-zinc-600">
                    // NO_DATA_RECEIVED
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
        <h3 class="font-bold text-white mb-4 flex items-center gap-2 text-xs uppercase tracking-widest border-b border-zinc-800 pb-2">
          <Zap class="w-4 h-4 text-zinc-500" /> TRAFFIC_SOURCES
        </h3>
        <div class="space-y-1">
             <div v-for="(ip, index) in topIps" :key="ip.ip" class="flex justify-between items-center bg-zinc-900/50 p-2 border border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                <div class="flex items-center gap-3">
                  <span class="text-zinc-600 text-[10px] font-mono w-4">#{{ index + 1 }}</span>
                  <span class="text-zinc-300 font-mono text-xs">{{ ip.ip }}</span>
                </div>
                <span class="text-white text-xs bg-zinc-800 px-1.5 py-0.5">{{ ip.count }}</span>
             </div>
             <div v-if="topIps.length === 0" class="text-zinc-600 text-center text-[10px] py-4 border border-dashed border-zinc-800">
                 // NO_SOURCE_DATA
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
import { Activity, RefreshCw, BarChart3, ShieldAlert, Globe, Users, List, Zap, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-vue-next';
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

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
})

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

const topIps = computed(() => {
  const counts: Record<string, number> = {};
  logs.value.forEach(l => {
    counts[l.ipAddress] = (counts[l.ipAddress] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([ip, count]) => ({ ip, count }));
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const fetchData = async () => {
    loading.value = true;
    try {
        const siteRes = await axios.get(`${API_URL}/sites`);
        stats.value.activeSites = siteRes.data.filter((s: any) => s.isActive).length;

        const logRes = await axios.get(`${API_URL}/analytics`);
        logs.value = logRes.data; 
        
        updateStats();
        // Initial chart fetch
        await updateChart();

    } catch (e) {
        console.error("Error fetching dashboard data", e);
    } finally {
        loading.value = false;
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

const updateStats = () => {
    stats.value.totalRequests = logs.value.length;
    stats.value.blocked = logs.value.filter(l => l.blocked).length;
    stats.value.uniqueIps = new Set(logs.value.map(l => l.ipAddress)).size;
}

onMounted(() => {
    fetchData();

    socket.value = io(API_URL);
    
    socket.value.on('connect', () => {
        console.log('Connected to WebSocket');
    });

    socket.value.on('new_traffic', (data: any) => {
        logs.value.unshift(data);
        updateStats();
        // Update chart live? Or just refresh periodically? Or increment last bucket?
        // For simplicity, let's refresh chart every 10s to be accurate, 
        // or just append if we match current minute.
        // Let's just create interval for chart refresh (separate from list)
    });
    
    // Refresh chart every 10s
    const chartInterval = setInterval(updateChart, 10000);
    
    onUnmounted(() => {
        clearInterval(chartInterval);
        if (socket.value) socket.value.disconnect();
    })
})
</script>
