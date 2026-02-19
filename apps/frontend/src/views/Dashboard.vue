<template>
  <div class="p-8 space-y-8 max-w-7xl mx-auto">
    <header class="flex justify-between items-end pb-6 border-b border-white/5">
      <div>
        <h2 class="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Activity class="w-8 h-8 text-blue-500" /> Dashboard
        </h2>
        <p class="text-slate-400 mt-2 font-medium">Real-time traffic analysis and threat mitigation.</p>
      </div>
      <div class="flex space-x-3">
        <button @click="fetchData" class="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg hover:text-white transition-all duration-200 border border-white/10 flex items-center gap-2 text-sm font-semibold backdrop-blur-sm group shadow-lg">
          <RefreshCw class="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" :class="{ 'animate-spin': loading }" /> 
          Refresh Data
        </button>
      </div>
    </header>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="glass-card p-6 rounded-2xl relative overflow-hidden group hover:bg-slate-800/60 transition-colors">
        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BarChart3 class="w-24 h-24 text-blue-500 transform rotate-12 translate-x-4 -translate-y-4" />
        </div>
        <div class="flex items-center justify-between mb-4 relative z-10">
          <p class="text-blue-200/70 text-xs font-bold uppercase tracking-widest">Total Requests</p>
          <BarChart3 class="w-5 h-5 text-blue-500" />
        </div>
        <h3 class="text-4xl font-bold text-white tracking-tight relative z-10">{{ stats.totalRequests }}</h3>
        <span class="text-slate-500 text-xs mt-3 block relative z-10 font-medium">Last 100 log entries</span>
      </div>
      
      <div class="glass-card p-6 rounded-2xl relative overflow-hidden group hover:bg-slate-800/60 transition-colors border-rose-500/20">
        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldAlert class="w-24 h-24 text-rose-500 transform rotate-12 translate-x-4 -translate-y-4" />
        </div>
        <div class="flex items-center justify-between mb-4 relative z-10">
          <p class="text-rose-200/70 text-xs font-bold uppercase tracking-widest">Threats Blocked</p>
          <ShieldAlert class="w-5 h-5 text-rose-500" />
        </div>
        <h3 class="text-4xl font-bold text-white tracking-tight relative z-10">{{ stats.blocked }}</h3>
        <span class="text-rose-400 text-xs mt-3 block font-bold relative z-10 flex items-center gap-1" v-if="stats.blocked > 0">
            <ShieldAlert class="w-3 h-3" /> Action Required
        </span>
        <span class="text-emerald-400 text-xs mt-3 block font-bold relative z-10 flex items-center gap-1" v-else>
            <ShieldCheck class="w-3 h-3" /> System Secure
        </span>
      </div>
      
      <div class="glass-card p-6 rounded-2xl relative overflow-hidden group hover:bg-slate-800/60 transition-colors">
        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Globe class="w-24 h-24 text-emerald-500 transform rotate-12 translate-x-4 -translate-y-4" />
        </div>
        <div class="flex items-center justify-between mb-4 relative z-10">
          <p class="text-emerald-200/70 text-xs font-bold uppercase tracking-widest">Active Sites</p>
          <Globe class="w-5 h-5 text-emerald-400" />
        </div>
        <h3 class="text-4xl font-bold text-white tracking-tight relative z-10">{{ stats.activeSites }}</h3>
        <span class="text-slate-500 text-xs mt-3 block relative z-10 font-medium">Protected Domains</span>
      </div>
      
      <div class="glass-card p-6 rounded-2xl relative overflow-hidden group hover:bg-slate-800/60 transition-colors">
        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users class="w-24 h-24 text-purple-500 transform rotate-12 translate-x-4 -translate-y-4" />
        </div>
        <div class="flex items-center justify-between mb-4 relative z-10">
          <p class="text-purple-200/70 text-xs font-bold uppercase tracking-widest">Unique Visitors</p>
          <Users class="w-5 h-5 text-purple-400" />
        </div>
        <h3 class="text-4xl font-bold text-white tracking-tight relative z-10">{{ stats.uniqueIps }}</h3>
        <span class="text-slate-500 text-xs mt-3 block relative z-10 font-medium">Distinct IP Addresses</span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Chart Section -->
      <div class="lg:col-span-3 glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none"></div>
        <h3 class="font-bold text-white mb-6 flex items-center gap-2 relative z-10 text-lg">
            <Activity class="w-5 h-5 text-blue-500" /> Traffic Overview
        </h3>
        <div class="h-80 w-full relative z-10">
            <Line :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Recent Calls Feed -->
      <div class="lg:col-span-2 glass-card rounded-2xl overflow-hidden shadow-xl flex flex-col">
        <div class="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h3 class="font-bold text-white flex items-center gap-2 text-lg">
            <List class="w-5 h-5 text-blue-500" /> Recent Traffic
          </h3>
          <span class="px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <div class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div> Live Feed
          </span>
        </div>
        <div class="overflow-x-auto flex-1">
          <table class="w-full text-left text-sm">
            <thead class="bg-black/20 text-slate-400 font-semibold text-xs border-b border-white/5 uppercase tracking-wider">
              <tr>
                <th class="p-4 pl-6">Time</th>
                <th class="p-4">Method</th>
                <th class="p-4">Path</th>
                <th class="p-4">IP Address</th>
                <th class="p-4">Location</th>
                <th class="p-4">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5 text-slate-300 font-medium">
              <tr v-for="log in paginatedLogs" :key="log.id" class="hover:bg-white/5 transition-colors animate-fade-in-down group">
                <td class="p-4 pl-6 text-slate-500 group-hover:text-slate-300 transition-colors whitespace-nowrap">{{ new Date(log.timestamp).toLocaleTimeString() }}</td>
                <td class="p-4">
                    <span class="px-2 py-1 rounded text-xs font-bold" 
                        :class="{
                            'bg-green-500/20 text-green-400': log.method === 'GET',
                            'bg-blue-500/20 text-blue-400': log.method === 'POST',
                            'bg-yellow-500/20 text-yellow-400': log.method === 'PUT',
                            'bg-red-500/20 text-red-400': log.method === 'DELETE'
                        }">
                        {{ log.method }}
                    </span>
                </td>
                <td class="p-4 font-mono text-xs text-slate-400 group-hover:text-white transition-colors truncate max-w-[200px]" :title="log.path">{{ log.path }}</td>
                <td class="p-4 font-mono text-xs text-blue-300/80">{{ log.ipAddress }}</td>
                <td class="p-4">
                    <div class="flex items-center gap-2" v-if="log.country">
                        <span class="text-xs font-bold text-slate-300">{{ log.country }}</span>
                    </div>
                     <span class="text-xs text-slate-600" v-else>N/A</span>
                </td>
                <td class="p-4">
                  <span v-if="log.blocked" class="inline-flex items-center gap-1 text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full text-xs font-bold border border-rose-500/20">
                    <ShieldAlert class="w-3 h-3" /> BLOCKED
                  </span>
                  <span v-else :class="log.statusCode >= 500 ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : log.statusCode >= 400 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border">
                    {{ log.statusCode }}
                  </span>
                </td>
              </tr>
               <tr v-if="logs.length === 0">
                <td colspan="6" class="p-12 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
                    <div class="p-3 bg-slate-800 rounded-full mb-2">
                        <Activity class="w-6 h-6 text-slate-600" />
                    </div>
                    No traffic recorded yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination Controls -->
        <div class="p-4 border-t border-white/5 flex justify-between items-center bg-black/20">
            <span class="text-xs text-slate-500 font-medium">Showing page {{ currentPage }} of {{ totalPages || 1 }}</span>
            <div class="flex gap-2">
                <button @click="prevPage" :disabled="currentPage === 1" class="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <ChevronLeft class="w-4 h-4" />
                </button>
                <button @click="nextPage" :disabled="currentPage === totalPages" class="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <ChevronRight class="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>

      <!-- Top Attacking IPs / Stats -->
      <div class="glass-card rounded-2xl p-6 shadow-xl h-fit">
        <h3 class="font-bold text-white mb-6 flex items-center gap-2 text-lg">
          <Zap class="w-5 h-5 text-amber-500" /> Top Sources
        </h3>
        <div class="space-y-3">
             <div v-for="(ip, index) in topIps" :key="ip.ip" class="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5 hover:bg-white/10 transition-colors group">
                <div class="flex items-center gap-3">
                  <div class="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-slate-900" 
                    :class="index === 0 ? 'bg-amber-400' : index === 1 ? 'bg-slate-300' : index === 2 ? 'bg-amber-700' : 'bg-slate-700 text-slate-400'">
                    {{ index + 1 }}
                  </div>
                  <span class="text-slate-300 font-mono text-xs group-hover:text-white transition-colors">{{ ip.ip }}</span>
                </div>
                <span class="text-white font-bold text-sm bg-black/20 px-2 py-0.5 rounded">{{ ip.count }}</span>
             </div>
             <div v-if="topIps.length === 0" class="text-slate-500 text-center text-xs py-8 bg-black/20 rounded-lg border border-dashed border-slate-800">No data available</div>
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
    plugins: {
        legend: { display: false },
        tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#1e293b',
            titleColor: '#fff',
            bodyColor: '#cbd5e1',
            borderColor: '#334155',
            borderWidth: 1
        }
    },
    scales: {
        x: {
            grid: { display: false, drawBorder: false },
            ticks: { color: '#64748b', maxTicksLimit: 8 }
        },
        y: {
            grid: { color: '#1e293b', drawBorder: false },
            ticks: { color: '#64748b', stepSize: 1 },
            beginAtZero: true
        }
    },
    interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
    }
} as any

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
