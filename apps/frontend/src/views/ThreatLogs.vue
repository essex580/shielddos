<template>
  <div class="h-full flex flex-col p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldAlert class="w-6 h-6 text-red-500" />
          Threat Intelligence Suites
        </h2>
        <p class="text-xs text-zinc-500 mt-1">AI-Powered Forensic Analysis & Global SIEM Aggregation</p>
      </div>

      <!-- AI Search Input -->
      <div class="relative w-96 group">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Sparkles class="h-4 w-4 text-emerald-400 opacity-70 group-focus-within:opacity-100 transition-opacity" />
        </div>
        <input 
          v-model="searchQuery" 
          @keyup.enter="performSearch"
          type="text" 
          class="block w-full pl-10 pr-3 py-2 border border-zinc-800 rounded-lg leading-5 bg-zinc-900/50 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:bg-zinc-900 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all sm:text-sm font-mono" 
          placeholder="Ask AI: 'Who attacked the login API today?'" 
        />
        <div class="absolute inset-y-0 right-0 pr-2 flex items-center">
            <kbd class="hidden sm:inline-block border border-zinc-800 rounded px-2 py-0.5 text-[10px] font-sans text-zinc-500">↵</kbd>
        </div>
      </div>
    </div>

    <!-- Top Metrics Strip -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <div class="flex items-center gap-2 text-zinc-400 mb-2">
              <Shield class="w-4 h-4" />
              <span class="text-xs uppercase tracking-wider font-semibold">Total Blocks (24h)</span>
          </div>
          <div class="text-3xl font-light text-white">{{ totalBlocks }}<span class="text-sm text-zinc-500 ml-1">reqs</span></div>
      </div>
      <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <div class="flex items-center gap-2 text-zinc-400 mb-2">
              <Activity class="w-4 h-4 text-orange-500" />
              <span class="text-xs uppercase tracking-wider font-semibold">Peak WAF Velocity</span>
          </div>
          <div class="text-3xl font-light text-white">420<span class="text-sm text-zinc-500 ml-1">req/s</span></div>
      </div>
      <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <div class="flex items-center gap-2 text-zinc-400 mb-2">
              <Database class="w-4 h-4 text-emerald-500" />
              <span class="text-xs uppercase tracking-wider font-semibold">Bandwidth Saved</span>
          </div>
          <div class="text-3xl font-light text-white">1.4<span class="text-sm text-zinc-500 ml-1">GB</span></div>
      </div>
      <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover:bg-red-500/20 transition-all"></div>
          <div class="flex items-center gap-2 text-red-400 mb-2 relative z-10">
              <Crosshair class="w-4 h-4" />
              <span class="text-xs uppercase tracking-wider font-semibold">Top Threat Origin</span>
          </div>
          <div class="text-3xl font-light text-white relative z-10">{{ topCountry || 'N/A' }}</div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 min-h-0 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col overflow-hidden relative">
      
      <!-- Table Header -->
      <div class="bg-zinc-900/80 px-4 py-3 border-b border-zinc-800 flex justify-between items-center z-10">
        <h3 class="text-sm font-semibold text-white flex items-center gap-2">
            <ListFilter class="w-4 h-4 text-zinc-400" />
            Firewall Event Log
        </h3>
        <button @click="fetchLogs" class="text-zinc-400 hover:text-white transition-colors" :class="{'animate-spin': loading}">
            <RefreshCw class="w-4 h-4" />
        </button>
      </div>

      <!-- Table Body -->
      <div class="flex-1 overflow-auto relative">
        <div v-if="loading && logs.length === 0" class="absolute inset-0 flex items-center justify-center bg-zinc-950/50 z-20">
            <Loader2 class="w-8 h-8 text-zinc-600 animate-spin" />
        </div>

        <table class="w-full text-left border-collapse">
            <thead class="sticky top-0 bg-zinc-900/95 backdrop-blur z-10 text-[10px] uppercase tracking-wider text-zinc-500">
                <tr>
                    <th class="px-4 py-3 font-medium border-b border-zinc-800">Time</th>
                    <th class="px-4 py-3 font-medium border-b border-zinc-800">Action</th>
                    <th class="px-4 py-3 font-medium border-b border-zinc-800">Domain</th>
                    <th class="px-4 py-3 font-medium border-b border-zinc-800">IP Address</th>
                    <th class="px-4 py-3 font-medium border-b border-zinc-800">Method</th>
                    <th class="px-4 py-3 font-medium border-b border-zinc-800">Path</th>
                </tr>
            </thead>
            <tbody class="text-xs divide-y divide-zinc-800/50">
                <tr v-for="log in logs" :key="log.id" 
                    @click="openDrawer(log)"
                    class="hover:bg-zinc-900/50 cursor-pointer transition-colors group">
                    
                    <td class="px-4 py-3 text-zinc-400 whitespace-nowrap">
                        {{ new Date(log.timestamp).toLocaleTimeString([], {hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit'}) }}
                    </td>
                    
                    <td class="px-4 py-3">
                        <span v-if="log.blocked" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                            <ShieldAlert class="w-3 h-3" /> Blocked
                        </span>
                        <span v-else class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <CheckCircle2 class="w-3 h-3" /> Allowed
                        </span>
                    </td>

                    <td class="px-4 py-3 text-zinc-300 truncate max-w-[150px]">{{ log.domain || log.siteId }}</td>
                    
                    <td class="px-4 py-3 font-mono text-zinc-400 group-hover:text-white transition-colors">
                        <div class="flex items-center gap-2">
                            <span :title="log.country" class="text-sm">{{ getFlagEmoji(log.country) }}</span>
                            {{ log.ipAddress }}
                        </div>
                    </td>
                    
                    <td class="px-4 py-3">
                        <span class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold border border-zinc-700">
                            {{ log.method }}
                        </span>
                    </td>
                    
                    <td class="px-4 py-3 text-zinc-500 truncate max-w-[200px] font-mono" :title="log.path">
                        {{ log.path }}
                    </td>
                </tr>
                <tr v-if="logs.length === 0 && !loading">
                  <td colspan="6" class="px-4 py-12 text-center text-zinc-500">
                    <ShieldCheck class="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No threats detected. Infrastructure is secure.
                  </td>
                </tr>
            </tbody>
        </table>
      </div>

    </div>

    <!-- Right Side AI Forensic Drawer -->
    <Teleport to="body">
      <div v-if="selectedLog" class="fixed inset-0 z-50 overflow-hidden">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" @click="closeDrawer"></div>
        <div class="fixed inset-y-0 right-0 w-[500px] flex">
          <div class="h-full w-full bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out font-mono">
            
            <div class="p-6 border-b border-zinc-800 flex justify-between items-start bg-zinc-900/30">
                <div>
                    <h2 class="text-xl font-bold text-white mb-1 flex items-center gap-2">
                        Event Details 
                        <span v-if="selectedLog.blocked" class="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-500 border border-red-500/30 uppercase tracking-widest">WAF Match</span>
                    </h2>
                    <p class="text-xs text-zinc-500">{{ selectedLog.id }}</p>
                </div>
                <button @click="closeDrawer" class="text-zinc-500 hover:text-white transition-colors p-1 bg-zinc-900 rounded border border-zinc-800">
                    <X class="w-5 h-5" />
                </button>
            </div>

            <div class="flex-1 overflow-y-auto p-6 space-y-6">
                
                <!-- AI Analysis Card -->
                <div class="bg-gradient-to-br from-indigo-950/30 to-purple-900/20 border border-indigo-500/30 rounded-xl p-5 relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-sm font-bold text-indigo-400 flex items-center gap-2">
                            <Sparkles class="w-4 h-4" /> ShieldDOS AI Forensics
                        </h3>
                        <button v-if="!aiExplanation && !aiLoading" @click="analyzeThreat" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-md shadow transition-colors border border-indigo-400/50">
                            Analyze Vector
                        </button>
                        <Loader2 v-if="aiLoading" class="w-4 h-4 text-indigo-400 animate-spin" />
                    </div>
                    
                    <div v-if="aiExplanation" class="text-xs text-zinc-300 leading-relaxed font-sans prose prose-invert max-w-none" v-html="formatMarkdown(aiExplanation)"></div>
                    <div v-else-if="!aiLoading" class="text-xs text-zinc-500 italic font-sans">
                        Click "Analyze Vector" to generate a natural language breakdown of this payload using Gemini Flash.
                    </div>
                </div>

                <!-- Raw Data Grid -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
                        <label class="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Target Host</label>
                        <div class="text-sm text-white truncate">{{ selectedLog.domain || selectedLog.siteId }}</div>
                    </div>
                    
                    <div class="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
                        <label class="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Attacker IP</label>
                        <div class="text-sm font-bold text-red-400">{{ selectedLog.ipAddress }}</div>
                    </div>

                    <div class="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
                        <label class="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Origin Country</label>
                        <div class="text-sm text-zinc-300 flex items-center gap-2">
                            <span>{{ getFlagEmoji(selectedLog.country) }}</span>
                            {{ selectedLog.country || 'Unknown' }}
                        </div>
                    </div>

                    <div class="col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
                        <label class="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">HTTP Resource</label>
                        <div class="text-sm text-zinc-300 break-all">
                            <span class="text-emerald-400 font-bold mr-2">{{ selectedLog.method }}</span>
                            {{ selectedLog.path }}
                        </div>
                    </div>

                    <div class="col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
                        <label class="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">User Agent</label>
                        <div class="text-xs text-zinc-400 break-all leading-relaxed">
                            {{ selectedLog.userAgent || 'None Provided' }}
                        </div>
                    </div>
                </div>

            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { 
    ShieldAlert, Sparkles, Shield, Activity, Database, Crosshair, 
    ListFilter, RefreshCw, Loader2, CheckCircle2, X, ShieldCheck
} from 'lucide-vue-next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const logs = ref<any[]>([]);
const loading = ref(true);
const totalBlocks = ref(0);
const topCountry = ref('');
const searchQuery = ref('');

const selectedLog = ref<any>(null);
const aiLoading = ref(false);
const aiExplanation = ref('');

const fetchLogs = async () => {
    loading.value = true;
    try {
        const res = await axios.get(`${API_URL}/analytics/logs/advanced`);
        logs.value = res.data;
        totalBlocks.value = logs.value.filter(l => l.blocked).length;
        
        // Fetch aggregations inline to show the top country
        const countryRes = await axios.get(`${API_URL}/analytics/aggregation/countries`);
        if (countryRes.data && countryRes.data.length > 0) {
            topCountry.value = countryRes.data[0].country;
        }
    } catch (e) {
        console.error("Failed to fetch analytical logs", e);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchLogs();
});

const openDrawer = (log: any) => {
    selectedLog.value = log;
    aiExplanation.value = '';
    aiLoading.value = false;
};

const closeDrawer = () => {
    selectedLog.value = null;
    aiExplanation.value = '';
};

const analyzeThreat = async () => {
    if (!selectedLog.value) return;
    aiLoading.value = true;
    try {
        const res = await axios.post(`${API_URL}/ai/explain-threat`, selectedLog.value);
        aiExplanation.value = res.data.explanation;
    } catch (e) {
        aiExplanation.value = "⚠️ **Connection Error:** Could not reach the NestJS AI Control Plane.";
    } finally {
        aiLoading.value = false;
    }
};

const performSearch = () => {
    alert("Natural Language DB Querying initializing... (This module will map to /ai/query-logs)");
};

const getFlagEmoji = (countryCode: string) => {
    if (!countryCode || countryCode.length !== 2) return '🌐';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
};

const formatMarkdown = (text: string) => {
    // A tiny, crude markdown formatter for the AI output
    let html = text;
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/`(.*?)`/g, '<code class="bg-zinc-900/50 text-indigo-300 px-1 py-0.5 rounded border border-indigo-500/20">$1</code>');
    html = html.replace(/\n\n/g, '<br><br>');
    html = html.replace(/\n/g, '<br>');
    return html;
};
</script>
