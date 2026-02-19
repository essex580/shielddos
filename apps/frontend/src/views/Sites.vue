<template>
  <div class="p-6 space-y-6 max-w-full font-mono text-sm">
    <header class="flex justify-between items-end pb-4 border-b border-zinc-800">
      <div>
        <h2 class="text-xl font-bold text-white flex items-center gap-3">
          <Globe class="w-5 h-5 text-blue-500" /> Network Nodes
        </h2>
        <p class="text-zinc-500 mt-1 text-xs">Target domain configuration and firewall rules.</p>
      </div>
      <button @click="showAddModal = true" class="terminal-button flex items-center gap-2 text-xs font-semibold">
        <Plus class="w-3 h-3" /> Add Node
      </button>
    </header>

    <!-- Project List -->
    <div class="terminal-card p-0 overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-zinc-500 flex flex-col items-center gap-2">
        <Loader2 class="w-6 h-6 animate-spin text-zinc-400" />
        <span class="text-xs">Loading data...</span>
      </div>
      
      <table v-else class="w-full text-left text-xs font-mono">
        <thead class="bg-zinc-900/50 text-zinc-500 font-semibold border-b border-zinc-800 text-xs text-left">
          <tr>
            <th class="p-3 pl-4">Domain / Status</th>
            <th class="p-3">Origin IP</th>
            <th class="p-3">Protection</th>
            <th class="p-3">Verification</th>
            <th class="p-3 text-right pr-6">Controls</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-800 text-zinc-400">
          <tr v-for="site in sites" :key="site.id" class="hover:bg-zinc-900 transition-colors group">
            <td class="p-3 pl-4">
               <div class="font-bold text-white group-hover:text-zinc-200">{{ site.domain }}</div>
               <div class="flex items-center gap-2 text-[10px] font-semibold mt-1" :class="site.isActive ? 'text-green-500' : 'text-zinc-500'">
                <span class="w-1.5 h-1.5 rounded-full" :class="site.isActive ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-zinc-500'"></span>
                {{ site.isActive ? 'Active' : 'Offline' }}
              </div>
            </td>
            <td class="p-3 text-zinc-500">{{ site.targetIp }}</td>
            <td class="p-3">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2 text-xs font-semibold" :class="site.wafEnabled ? 'text-emerald-500' : 'text-zinc-600'">
                  <ShieldCheck class="w-3 h-3" /> WAF: {{ site.wafEnabled ? 'On' : 'Off' }}
                </div>
                <div class="flex items-center gap-2 text-xs font-semibold" :class="site.botProtection ? 'text-blue-500' : 'text-zinc-600'">
                  <Bot class="w-3 h-3" /> Bot: {{ site.botProtection ? 'On' : 'Off' }}
                </div>
              </div>
            </td>
            <td class="p-3">
               <div v-if="site.verificationStatus" class="flex flex-col gap-1">
                  <div class="text-[10px] font-semibold flex items-center gap-1" :class="site.verificationStatus.isConfigured ? 'text-green-500' : 'text-red-500'">
                    <span v-if="site.verificationStatus.isConfigured" class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    <span v-else class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    {{ site.verificationStatus.isConfigured ? 'Connected' : 'Disconnected' }}
                  </div>
                  <div class="text-[10px] text-zinc-500 font-mono">{{ site.verificationStatus.resolvedIp }}</div>
               </div>
               <button v-else @click="verifySite(site)" class="text-[10px] font-semibold text-zinc-500 hover:text-white border border-zinc-700 rounded-md px-2 py-0.5">
                  Verify DNS
               </button>
            </td>
            <td class="p-3 text-right pr-6">
              <div class="flex justify-end gap-2">
                <button @click="openSettings(site)" class="border border-zinc-700 rounded-md hover:bg-zinc-800 text-zinc-300 px-2 py-1 text-xs font-semibold transition-colors" title="Settings">
                  <Settings class="w-3 h-3" />
                </button>
                <button @click="openRules(site)" class="border border-zinc-700 rounded-md hover:bg-zinc-800 text-zinc-300 px-2 py-1 text-xs font-semibold transition-colors">
                  Rules
                </button>
                <button @click="deleteSite(site.id)" class="text-zinc-600 hover:text-red-500 transition-colors p-1" title="Delete">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="sites.length === 0">
            <td colspan="5" class="p-12 text-center text-zinc-500 text-xs border border-zinc-800 rounded-md">
                No nodes configured
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit/Security Modal -->
    <TerminalModal v-if="showEditModal && selectedSite" @close="showEditModal = false">
      <template #title>Node Security Configuration</template>
      <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
              <label class="block text-[10px] font-bold text-zinc-500 uppercase">Under Attack Mode</label>
              <p class="text-[10px] text-zinc-600">JS Challenge for all visitors</p>
            </div>
            <button @click="toggleSecurityLevel" 
              class="w-10 h-5 rounded-full relative transition-colors"
              :class="selectedSite.securityLevel === 'under_attack' ? 'bg-red-600' : 'bg-zinc-800'">
              <div class="w-3 h-3 bg-white rounded-full absolute top-1 transition-all"
                :class="selectedSite.securityLevel === 'under_attack' ? 'left-6' : 'left-1'"></div>
            </button>
        </div>

        <div class="flex items-center justify-between">
            <div>
              <label class="block text-[10px] font-bold text-zinc-500 uppercase">Bot Protection</label>
              <p class="text-[10px] text-zinc-600">Block common automated scripts</p>
            </div>
            <button @click="toggleBotProtection" 
              class="w-10 h-5 rounded-full relative transition-colors"
              :class="selectedSite.botProtection ? 'bg-blue-600' : 'bg-zinc-800'">
              <div class="w-3 h-3 bg-white rounded-full absolute top-1 transition-all"
                :class="selectedSite.botProtection ? 'left-6' : 'left-1'"></div>
            </button>
        </div>

        <div class="flex items-center justify-between">
            <div>
              <label class="block text-[10px] font-bold text-zinc-500 uppercase">WAF Filter</label>
              <p class="text-[10px] text-zinc-600">Block SQLi, XSS and malicious payloads</p>
            </div>
            <button @click="toggleWaf" 
              class="w-10 h-5 rounded-full relative transition-colors"
              :class="selectedSite.wafEnabled ? 'bg-emerald-600' : 'bg-zinc-800'">
              <div class="w-3 h-3 bg-white rounded-full absolute top-1 transition-all"
                :class="selectedSite.wafEnabled ? 'left-6' : 'left-1'"></div>
            </button>
        </div>

        <div class="flex items-center justify-between">
            <div>
              <label class="block text-[10px] font-bold text-zinc-500 uppercase">Rate Limiting</label>
              <p class="text-[10px] text-zinc-600">Max requests per minute per IP</p>
            </div>
            <input type="number" 
              v-model.number="selectedSite.rateLimit" 
              @change="updateRateLimit"
              class="w-20 bg-zinc-950 border border-zinc-700 p-1.5 text-white text-xs rounded-md focus:outline-none focus:border-zinc-500 text-center">
        </div>
      </div>
      <template #footer>
        <button @click="showEditModal = false" class="terminal-button-outline">Done</button>
      </template>
    </TerminalModal>

    <!-- Firewall Rules Modal -->
    <FirewallRules v-if="showRulesModal && selectedSite" 
        :siteId="selectedSite.id" 
        :siteDomain="selectedSite.domain" 
        @close="showRulesModal = false" 
    />

    <!-- Add Modal -->
    <TerminalModal v-if="showAddModal" @close="showAddModal = false">
      <template #title>Initialize New Node</template>
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-zinc-400 mb-1">Target Domain</label>
          <input v-model="newSite.domain" type="text" placeholder="example.com" class="terminal-input w-full p-2 text-sm">
        </div>
        <div>
          <label class="block text-xs font-semibold text-zinc-400 mb-1">Origin Server IP</label>
          <input v-model="newSite.targetIp" type="text" placeholder="192.168.1.1" class="terminal-input w-full p-2 text-sm">
        </div>
      </div>
      <template #footer>
        <button @click="showAddModal = false" class="terminal-button-outline">Cancel</button>
        <button @click="addSite" :disabled="!newSite.domain || !newSite.targetIp" class="terminal-button disabled:opacity-50">Initialize</button>
      </template>
    </TerminalModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { Globe, Plus, Trash2, Shield, ShieldCheck, Bot, Loader2, Settings } from 'lucide-vue-next';
import FirewallRules from '../components/FirewallRules.vue';
import TerminalModal from '../components/TerminalModal.vue';

interface Site {
  id: string;
  domain: string;
  targetIp: string;
  isActive: boolean;
  securityLevel: string;
  botProtection: boolean;
  wafEnabled: boolean;
  rateLimit: number;
  verificationStatus?: {
    resolvedIp: string;
    isConfigured: boolean;
    checking?: boolean;
  };
}

const sites = ref<Site[]>([])
const loading = ref(true)
const showAddModal = ref(false)
const showRulesModal = ref(false)
const showEditModal = ref(false)
const selectedSite = ref<any>(null)
const newSite = ref({ domain: '', targetIp: '' })

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const fetchSites = async () => {
    loading.value = true;
    try {
        const res = await axios.get(`${API_URL}/sites`);
        sites.value = res.data;
    } catch (e) {
        console.error("Failed to fetch sites", e);
    } finally {
        loading.value = false;
    }
}

const addSite = async () => {
    try {
        const res = await axios.post(`${API_URL}/sites`, newSite.value);
        sites.value.push(res.data);
        showAddModal.value = false;
        newSite.value = { domain: '', targetIp: '' }
    } catch (e) {
        console.error("Failed to add site", e);
        alert('Failed to add site');
    }
}

const deleteSite = async (id: string) => {
    if (!confirm('Are you sure you want to remove this domain?')) return;
    try {
        await axios.delete(`${API_URL}/sites/${id}`);
        sites.value = sites.value.filter(s => s.id !== id);
    } catch (e) {
        console.error("Failed to delete site", e);
    }
}

const openRules = (site: Site) => {
    selectedSite.value = site;
    showRulesModal.value = true;
}

const openSettings = (site: Site) => {
    selectedSite.value = site;
    showEditModal.value = true;
}

const verifySite = async (site: Site) => {
    site.verificationStatus = { resolvedIp: '', isConfigured: false, checking: true };
    try {
        const res = await axios.post(`${API_URL}/sites/${site.id}/verify`);
        site.verificationStatus = { ...res.data, checking: false };
    } catch (e) {
        console.error("Verification failed", e);
        site.verificationStatus = { resolvedIp: 'ERROR', isConfigured: false, checking: false };
    }
}

const toggleSecurityLevel = async () => {
    if (!selectedSite.value) return;
    const newLevel = selectedSite.value.securityLevel === 'under_attack' ? 'normal' : 'under_attack';
    try {
        await axios.patch(`${API_URL}/sites/${selectedSite.value.id}`, { securityLevel: newLevel });
        selectedSite.value.securityLevel = newLevel;
        const s = sites.value.find(s => s.id === selectedSite.value.id);
        if (s) s.securityLevel = newLevel;
    } catch (e) {
        console.error("Failed to update security level", e);
    }
}

const toggleBotProtection = async () => {
    if (!selectedSite.value) return;
    const newVal = !selectedSite.value.botProtection;
    try {
        await axios.patch(`${API_URL}/sites/${selectedSite.value.id}`, { botProtection: newVal });
        selectedSite.value.botProtection = newVal;
        const s = sites.value.find(s => s.id === selectedSite.value.id);
        if (s) s.botProtection = newVal;
    } catch (e) {
        console.error("Failed to update bot protection", e);
    }
}

const toggleWaf = async () => {
    if (!selectedSite.value) return;
    const newVal = !selectedSite.value.wafEnabled;
    try {
        await axios.patch(`${API_URL}/sites/${selectedSite.value.id}`, { wafEnabled: newVal });
        selectedSite.value.wafEnabled = newVal;
        const s = sites.value.find(s => s.id === selectedSite.value.id);
        if (s) s.wafEnabled = newVal;
    } catch (e) {
        console.error("Failed to update WAF state", e);
    }
}

const updateRateLimit = async () => {
    if (!selectedSite.value) return;
    try {
        await axios.patch(`${API_URL}/sites/${selectedSite.value.id}`, { rateLimit: selectedSite.value.rateLimit || 200 });
        const s = sites.value.find(s => s.id === selectedSite.value.id);
        if (s) s.rateLimit = selectedSite.value.rateLimit;
    } catch (e) {
        console.error("Failed to update rate limit", e);
    }
}

onMounted(() => {
    fetchSites();
})
</script>
