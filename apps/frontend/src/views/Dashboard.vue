<template>
  <div class="p-8 space-y-8 max-w-7xl mx-auto">
    <header class="flex justify-between items-end border-b border-slate-800 pb-6">
      <div>
        <h2 class="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Activity class="w-6 h-6 text-blue-500" /> Dashboard
        </h2>
        <p class="text-slate-400 mt-1">Real-time traffic analysis and threat mitigation.</p>
      </div>
      <div class="flex space-x-3">
        <button @click="fetchData" class="px-4 py-2 bg-[#1e293b] text-slate-300 rounded-md hover:bg-slate-700 hover:text-white transition-colors border border-slate-700 flex items-center gap-2 text-sm font-medium">
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" /> Refresh
        </button>
      </div>
    </header>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-[#0f172a] p-6 rounded-lg border border-slate-800 shadow-sm transition-all hover:border-slate-700">
        <div class="flex items-center justify-between mb-4">
          <p class="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Requests</p>
          <BarChart3 class="w-5 h-5 text-blue-500" />
        </div>
        <h3 class="text-3xl font-bold text-white tracking-tight">{{ stats.totalRequests }}</h3>
        <span class="text-slate-500 text-xs mt-2 block">Last 100 requests</span>
      </div>
      
      <div class="bg-[#0f172a] p-6 rounded-lg border border-slate-800 shadow-sm transition-all hover:border-slate-700">
        <div class="flex items-center justify-between mb-4">
          <p class="text-slate-400 text-xs font-medium uppercase tracking-wider">Threats Blocked</p>
          <ShieldAlert class="w-5 h-5 text-rose-500" />
        </div>
        <h3 class="text-3xl font-bold text-white tracking-tight">{{ stats.blocked }}</h3>
        <span class="text-rose-500/80 text-xs mt-2 block font-medium" v-if="stats.blocked > 0">Action Required</span>
        <span class="text-emerald-500/80 text-xs mt-2 block font-medium" v-else>System Secure</span>
      </div>
      
      <div class="bg-[#0f172a] p-6 rounded-lg border border-slate-800 shadow-sm transition-all hover:border-slate-700">
        <div class="flex items-center justify-between mb-4">
          <p class="text-slate-400 text-xs font-medium uppercase tracking-wider">Active Sites</p>
          <Globe class="w-5 h-5 text-emerald-400" />
        </div>
        <h3 class="text-3xl font-bold text-white tracking-tight">{{ stats.activeSites }}</h3>
        <span class="text-slate-500 text-xs mt-2 block">Protected Domains</span>
      </div>
      
      <div class="bg-[#0f172a] p-6 rounded-lg border border-slate-800 shadow-sm transition-all hover:border-slate-700">
        <div class="flex items-center justify-between mb-4">
          <p class="text-slate-400 text-xs font-medium uppercase tracking-wider">Unique IPs</p>
          <Users class="w-5 h-5 text-purple-400" />
        </div>
        <h3 class="text-3xl font-bold text-white tracking-tight">{{ stats.uniqueIps }}</h3>
        <span class="text-slate-500 text-xs mt-2 block">Distinct Visitors</span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Recent Calls Feed -->
      <div class="lg:col-span-2 bg-[#0f172a] rounded-lg border border-slate-800 overflow-hidden shadow-sm">
        <div class="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 class="font-bold text-white flex items-center gap-2">
            <List class="w-4 h-4 text-blue-500" /> Recent Traffic
          </h3>
          <span class="text-xs text-slate-500">Live Feed</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-900/50 text-slate-400 font-medium text-xs border-b border-slate-800">
              <tr>
                <th class="p-3 pl-4">Time</th>
                <th class="p-3">Method</th>
                <th class="p-3">Path</th>
                <th class="p-3">IP</th>
                <th class="p-3">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800 text-slate-300">
              <tr v-for="log in logs" :key="log.id" class="hover:bg-slate-800/30 transition-colors">
                <td class="p-3 pl-4 text-slate-500">{{ new Date(log.timestamp).toLocaleTimeString() }}</td>
                <td class="p-3 font-mono text-xs">{{ log.method }}</td>
                <td class="p-3 font-mono text-xs truncate max-w-[200px]" :title="log.path">{{ log.path }}</td>
                <td class="p-3 font-mono text-xs">{{ log.ipAddress }}</td>
                <td class="p-3">
                  <span :class="log.statusCode >= 500 ? 'text-rose-400' : log.statusCode >= 400 ? 'text-amber-400' : 'text-emerald-400'" class="font-bold">
                    {{ log.statusCode }}
                  </span>
                </td>
              </tr>
               <tr v-if="logs.length === 0">
                <td colspan="5" class="p-8 text-center text-slate-500 text-xs">No traffic recorded yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Top Attacking IPs / Stats -->
      <div class="bg-[#0f172a] rounded-lg border border-slate-800 p-6 shadow-sm">
        <h3 class="font-bold text-white mb-4 flex items-center gap-2">
          <Zap class="w-4 h-4 text-amber-500" /> Top Sources
        </h3>
        <div class="space-y-3">
             <div v-for="ip in topIps" :key="ip.ip" class="flex justify-between items-center bg-slate-800/50 p-3 rounded border border-slate-700/50">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span class="text-slate-300 font-mono text-xs">{{ ip.ip }}</span>
                </div>
                <span class="text-white font-bold text-sm">{{ ip.count }}</span>
             </div>
             <div v-if="topIps.length === 0" class="text-slate-500 text-center text-xs py-4">No data available</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { Activity, RefreshCw, BarChart3, ShieldAlert, Globe, Users, List, Zap } from 'lucide-vue-next';

interface Log {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  ipAddress: string;
  statusCode: number;
  blocked: boolean;
}

const stats = ref({
    totalRequests: 0,
    blocked: 0,
    activeSites: 0,
    uniqueIps: 0,
})

const logs = ref<Log[]>([])
const loading = ref(false)
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
        // Fetch sites
        const siteRes = await axios.get(`${API_URL}/sites`);
        stats.value.activeSites = siteRes.data.filter((s: any) => s.isActive).length;

        // Fetch logs
        const logRes = await axios.get(`${API_URL}/analytics`);
        logs.value = logRes.data;

        // Calc stats from logs
        stats.value.totalRequests = logs.value.length;
        stats.value.blocked = logs.value.filter(l => l.blocked).length;
        stats.value.uniqueIps = new Set(logs.value.map(l => l.ipAddress)).size;

    } catch (e) {
        console.error("Error fetching dashboard data", e);
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    fetchData()
    // Auto refresh every 5s
    setInterval(fetchData, 5000);
})
</script>
