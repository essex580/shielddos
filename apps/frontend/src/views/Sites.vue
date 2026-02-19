<template>
  <div class="p-6 space-y-6 max-w-full font-mono text-sm">
    <header class="flex justify-between items-end pb-4 border-b border-zinc-800">
      <div>
        <h2 class="text-xl font-bold text-white flex items-center gap-3 uppercase tracking-widest">
          <Globe class="w-5 h-5 text-zinc-500" /> NETWORK_NODES
        </h2>
        <p class="text-zinc-500 mt-1 text-xs">Target domain configuration and firewall rules.</p>
      </div>
      <button @click="showAddModal = true" class="terminal-button flex items-center gap-2 text-xs uppercase tracking-wider">
        <Plus class="w-3 h-3" /> ADD_NODE
      </button>
    </header>

    <!-- Project List -->
    <div class="terminal-card p-0 overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-zinc-500 flex flex-col items-center gap-2 uppercase tracking-wide">
        <Loader2 class="w-6 h-6 animate-spin text-zinc-400" />
        <span class="text-xs">ESTABLISHING_CONNECTION...</span>
      </div>
      
      <table v-else class="w-full text-left text-xs font-mono">
        <thead class="bg-zinc-900/50 text-zinc-500 font-bold border-b border-zinc-800 uppercase tracking-wider">
          <tr>
            <th class="p-3 pl-4">DOMAIN_NAME</th>
            <th class="p-3">ORIGIN_IP</th>
            <th class="p-3">STATUS</th>
            <th class="p-3">SECURITY_LEVEL</th>
            <th class="p-3 text-right pr-6">CONTROLS</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-800 text-zinc-400">
          <tr v-for="site in sites" :key="site.id" class="hover:bg-zinc-900 transition-colors group">
            <td class="p-3 pl-4 font-bold text-white group-hover:text-zinc-200">{{ site.domain }}</td>
            <td class="p-3 text-zinc-500">{{ site.targetIp }}</td>
            <td class="p-3">
              <span class="flex items-center gap-2 text-[10px] font-bold uppercase">
                <span class="w-2 h-2" :class="site.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'"></span>
                {{ site.isActive ? 'ONLINE' : 'OFFLINE' }}
              </span>
            </td>
            <td class="p-3">
              <div class="flex items-center gap-2 text-zinc-500 text-[10px] uppercase font-bold">
                <Shield class="w-3 h-3" />
                <span>{{ site.securityLevel }}</span>
              </div>
            </td>
            <td class="p-3 text-right pr-6">
              <div class="flex justify-end gap-2">
                <button @click="openRules(site)" class="border border-zinc-700 hover:bg-zinc-800 text-zinc-300 px-2 py-1 text-[10px] uppercase font-bold transition-colors">
                  RULES
                </button>
                <button @click="deleteSite(site.id)" class="text-zinc-600 hover:text-red-500 transition-colors p-1" title="Delete">
                  <Trash2 class="w-3 h-3" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="sites.length === 0">
            <td colspan="5" class="p-12 text-center text-zinc-600 uppercase tracking-widest text-xs border-dashed border-zinc-800">
                // NO_NODES_CONFIGURED
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Firewall Rules Modal -->
    <FirewallRules v-if="showRulesModal && selectedSite" 
        :siteId="selectedSite.id" 
        :siteDomain="selectedSite.domain" 
        @close="showRulesModal = false" 
    />

    <!-- Add Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div class="bg-zinc-950 p-6 border border-zinc-700 w-full max-w-md shadow-2xl">
        <h3 class="text-sm font-bold text-white mb-6 uppercase tracking-widest border-b border-zinc-800 pb-2">Initialize New Node</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-[10px] font-bold text-zinc-500 mb-1 uppercase">Target Domain</label>
            <input v-model="newSite.domain" type="text" placeholder="example.com" class="terminal-input w-full p-2 text-sm">
          </div>
          <div>
            <label class="block text-[10px] font-bold text-zinc-500 mb-1 uppercase">Origin Server IP</label>
            <input v-model="newSite.targetIp" type="text" placeholder="192.168.1.1" class="terminal-input w-full p-2 text-sm">
          </div>
          <div class="flex justify-end space-x-3 mt-8">
            <button @click="showAddModal = false" class="terminal-button-outline text-xs">CANCEL</button>
            <button @click="addSite" :disabled="!newSite.domain || !newSite.targetIp" class="terminal-button text-xs disabled:opacity-50">INITIALIZE</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { Globe, Plus, Trash2, Shield, Loader2 } from 'lucide-vue-next';
import FirewallRules from '../components/FirewallRules.vue';

interface Site {
  id: string;
  domain: string;
  targetIp: string;
  isActive: boolean;
  securityLevel: string;
}

const sites = ref<Site[]>([])
const loading = ref(true)
const showAddModal = ref(false)
const showRulesModal = ref(false)
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

onMounted(() => {
    fetchSites();
})
</script>
