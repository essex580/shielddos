<template>
  <div class="p-8 space-y-8 max-w-7xl mx-auto">
    <header class="flex justify-between items-end pb-6 border-b border-white/5">
      <div>
        <h2 class="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Globe class="w-8 h-8 text-blue-500" /> Sites
        </h2>
        <p class="text-slate-400 mt-2 font-medium">Manage protected domains and configuration.</p>
      </div>
      <button @click="showAddModal = true" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/20 flex items-center gap-2 font-semibold text-sm">
        <Plus class="w-4 h-4" /> Add Site
      </button>
    </header>

    <!-- Project List -->
    <div class="glass-card rounded-2xl overflow-hidden shadow-xl">
      <div v-if="loading" class="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
        <Loader2 class="w-8 h-8 animate-spin text-blue-500" />
        <p class="text-sm font-medium">Loading sites...</p>
      </div>
      
      <table v-else class="w-full text-left text-sm">
        <thead class="bg-black/20 text-slate-400 font-semibold uppercase tracking-wider text-xs border-b border-white/5">
          <tr>
            <th class="p-4 pl-6">Domain</th>
            <th class="p-4">Origin IP</th>
            <th class="p-4">Status</th>
            <th class="p-4">Security Level</th>
            <th class="p-4 text-right pr-6">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5 text-slate-300 font-medium">
          <tr v-for="site in sites" :key="site.id" class="hover:bg-white/5 transition-colors group">
            <td class="p-4 pl-6">
                <div class="flex items-center gap-3">
                    <div class="p-2 rounded bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors">
                        <Globe class="w-4 h-4" />
                    </div>
                    <span class="font-bold text-white tracking-tight">{{ site.domain }}</span>
                </div>
            </td>
            <td class="p-4 font-mono text-xs text-slate-400">{{ site.targetIp }}</td>
            <td class="p-4">
              <span :class="site.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'" class="px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 w-fit">
                <span class="w-1.5 h-1.5 rounded-full animate-pulse" :class="site.isActive ? 'bg-emerald-400' : 'bg-rose-400'"></span>
                {{ site.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="p-4">
              <div class="flex items-center gap-2 text-slate-400">
                <Shield class="w-4 h-4 text-slate-500" />
                <span class="capitalize text-xs font-semibold">{{ site.securityLevel }}</span>
              </div>
            </td>
            <td class="p-4 text-right pr-6">
              <div class="flex justify-end gap-2">
                <button @click="openRules(site)" class="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 flex items-center gap-1.5 transition-all">
                  <Shield class="w-3 h-3" /> Rules
                </button>
                <button @click="deleteSite(site.id)" class="text-slate-500 hover:text-rose-400 transition-colors p-1.5 hover:bg-rose-500/10 rounded-lg">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="sites.length === 0">
            <td colspan="5" class="p-16 text-center">
              <div class="flex flex-col items-center gap-4 text-slate-500">
                <div class="p-4 bg-white/5 rounded-full border border-white/5">
                    <Globe class="w-8 h-8 opacity-50" />
                </div>
                <p class="font-medium">No sites configured yet.</p>
                <button @click="showAddModal = true" class="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <Plus class="w-3 h-3" /> Add your first site
                </button>
              </div>
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
    <div v-if="showAddModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="glass-card p-8 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden border border-slate-700/50">
        <div class="absolute inset-0 bg-blue-500/5 pointer-events-none"></div>
        <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3 relative z-10">
          <div class="p-2 bg-blue-500/20 rounded-lg">
             <Globe class="w-5 h-5 text-blue-500" />
          </div>
          New Domain
        </h3>
        <div class="space-y-5 relative z-10">
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Domain Name</label>
            <input v-model="newSite.domain" type="text" placeholder="example.com" class="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm placeholder-slate-600">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Target Origin IP</label>
            <input v-model="newSite.targetIp" type="text" placeholder="123.45.67.89:80" class="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm placeholder-slate-600">
          </div>
          <div class="flex justify-end space-x-3 mt-8 pt-6 border-t border-white/10">
            <button @click="showAddModal = false" class="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">Cancel</button>
            <button @click="addSite" :disabled="!newSite.domain || !newSite.targetIp" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold">Save Configuration</button>
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
