<template>
  <div class="p-8 space-y-8">
    <header class="flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-bold text-white">Dashboard</h2>
        <p class="text-slate-400">Real-time attack monitoring</p>
      </div>
      <div class="flex space-x-4">
        <button class="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition">
          Last 24 Hours
        </button>
        <button @click="refreshStats" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition shadow-lg shadow-blue-500/30">
          Refresh
        </button>
      </div>
    </header>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm">
        <p class="text-slate-400 text-sm">Total Requests</p>
        <h3 class="text-4xl font-bold text-white mt-2">{{ stats.totalRequests }}</h3>
        <span class="text-green-400 text-sm mt-2 block">↑ 12% from yesterday</span>
      </div>
      <div class="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm">
        <p class="text-slate-400 text-sm">Threats Blocked</p>
        <h3 class="text-4xl font-bold text-red-500 mt-2">{{ stats.blocked }}</h3>
        <span class="text-red-400 text-sm mt-2 block">3 attacks detected</span>
      </div>
      <div class="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm">
        <p class="text-slate-400 text-sm">Active Sites</p>
        <h3 class="text-4xl font-bold text-blue-400 mt-2">{{ stats.activeSites }}</h3>
      </div>
      <div class="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm">
        <p class="text-slate-400 text-sm">Bandwidth (Est.)</p>
        <h3 class="text-4xl font-bold text-purple-400 mt-2">{{ stats.bandwidth }} MB</h3>
      </div>
    </div>

    <!-- Charts Area (Placeholder for Chart.js) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h3 class="text-xl font-bold text-white mb-4">Traffic Traffic</h3>
        <div class="h-64 flex items-center justify-center border-2 border-dashed border-slate-700 rounded-lg text-slate-500">
          [Chart.js Area]
        </div>
      </div>
      <div class="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h3 class="text-xl font-bold text-white mb-4">Top Attacking IPs</h3>
        <div class="space-y-4">
             <div v-for="ip in stats.topIps" :key="ip.ip" class="flex justify-between items-center bg-slate-700/50 p-3 rounded">
                <span class="text-slate-300 font-mono">{{ ip.ip }}</span>
                <span class="text-red-400 font-bold">{{ ip.count }} reqs</span>
             </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const stats = ref({
    totalRequests: 0,
    blocked: 0,
    activeSites: 0,
    bandwidth: 0,
    topIps: [
        { ip: '192.168.1.55', count: 1240 },
        { ip: '45.32.11.90', count: 850 },
        { ip: '10.0.0.5', count: 320 },
    ]
})

const refreshStats = async () => {
    // In a real app, fetch from API
    // const res = await axios.get('http://localhost:3000/analytics')
    // stats.value = res.data
    console.log('Refreshing stats...')
    stats.value.totalRequests += Math.floor(Math.random() * 100);
}

onMounted(() => {
    refreshStats()
})
</script>
