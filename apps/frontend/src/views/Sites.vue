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
          <template v-for="site in sites" :key="site.id">
            <tr class="hover:bg-zinc-900 transition-colors group">
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
                  <button @click="openDrawer(site, 'settings')" class="border border-zinc-700 bg-zinc-900 text-zinc-300 rounded-md hover:bg-zinc-800 hover:text-white px-2 py-1 text-xs font-semibold transition-colors" title="Settings">
                    <Settings class="w-3 h-3" />
                  </button>
                  <button @click="purgeCache(site)" class="border border-zinc-700 bg-blue-900/30 text-blue-400 rounded-md hover:bg-blue-900/50 px-2 py-1 text-xs font-semibold transition-colors" title="Purge Edge Cache">
                    Purge Cache
                  </button>
                  <button @click="openDrawer(site, 'rules')" class="border border-zinc-700 bg-zinc-900 text-zinc-300 rounded-md hover:bg-zinc-800 hover:text-white px-2 py-1 text-xs font-semibold transition-colors">
                    Rules
                  </button>
                  <button @click="deleteSite(site.id)" class="text-zinc-600 hover:text-red-500 transition-colors p-1" title="Delete">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

          </template>
          <tr v-if="sites.length === 0">
            <td colspan="5" class="p-12 text-center text-zinc-500 text-xs border border-zinc-800 rounded-md">
                No nodes configured
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- New Offcanvas settings drawer -->
    <SiteDrawer 
      :is-open="isDrawerOpen" 
      :site="selectedSite"
      @close="closeDrawer"
      @purge-cache="purgeCache"
      @toggle-waf="toggleWaf"
      @toggle-bot="toggleBotProtection"
      @toggle-security="toggleSecurityLevel"
      @update-rate="updateRateLimit"
      @update-pages="updateCustomPages"
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
import TerminalModal from '../components/TerminalModal.vue';
import SiteDrawer from '../components/SiteDrawer.vue';

interface Site {
  id: string;
  domain: string;
  targetIp: string;
  isActive: boolean;
  securityLevel: string;
  botProtection: boolean;
  wafEnabled: boolean;
  rateLimit: number;
  customErrorPage403?: string;
  customErrorPage404?: string;
  customErrorPage502?: string;
  verificationStatus?: {
    resolvedIp: string;
    isConfigured: boolean;
    checking?: boolean;
  };
}

const sites = ref<Site[]>([])
const loading = ref(true)
const showAddModal = ref(false)
const selectedSite = ref<any>(null)
const newSite = ref({ domain: '', targetIp: '' })

const isDrawerOpen = ref(false)

const openDrawer = (site: Site, initialTab: 'settings' | 'rules') => {
    selectedSite.value = site;
    isDrawerOpen.value = true;
    // We could pass initialTab to the drawer via a prop if we want it to open directly to rules or settings. 
    // Currently SiteDrawer defaults to 'rules' subTab. We can add a prop to SiteDrawer if needed, 
    // but for now just opening it is fine since it's an all-in-one Bento grid.
}

const closeDrawer = () => {
    isDrawerOpen.value = false;
    setTimeout(() => {
        selectedSite.value = null; // Clear after animation
    }, 300);
}

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
        if (selectedSite.value?.id === id) {
            closeDrawer();
        }
    } catch (e) {
        console.error("Failed to delete site", e);
    }
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

const updateRateLimit = async (newLimit: number) => {
    if (!selectedSite.value) return;
    try {
        await axios.patch(`${API_URL}/sites/${selectedSite.value.id}`, { rateLimit: newLimit || 200 });
        selectedSite.value.rateLimit = newLimit;
        const s = sites.value.find(s => s.id === selectedSite.value.id);
        if (s) s.rateLimit = newLimit;
    } catch (e) {
        console.error("Failed to update rate limit", e);
    }
}

const updateCustomPages = async (payload: { type: '403' | '502', value: string }) => {
    if (!selectedSite.value) return;
    
    selectedSite.value[`customErrorPage${payload.type}`] = payload.value;
    
    try {
        await axios.patch(`${API_URL}/sites/${selectedSite.value.id}`, {
            customErrorPage403: selectedSite.value.customErrorPage403,
            customErrorPage502: selectedSite.value.customErrorPage502
        });
        const s = sites.value.find(s => s.id === selectedSite.value.id);
        if (s) {
            s.customErrorPage403 = selectedSite.value.customErrorPage403;
            s.customErrorPage502 = selectedSite.value.customErrorPage502;
        }
    } catch (e) {
        console.error("Failed to update custom pages", e);
    }
}

const purgeCache = async (site: Site) => {
    try {
        const res = await axios.post(`${API_URL}/sites/${site.id}/purge-cache`);
        alert(`Purged ${res.data.cleared} cached items for ${site.domain} at the Edge.`);
    } catch (e) {
        console.error("Failed to purge cache", e);
        alert('Failed to purge cache.');
    }
}

onMounted(() => {
    fetchSites();
})
</script>
