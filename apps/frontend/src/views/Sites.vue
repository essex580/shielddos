<template>
  <div class="p-8 space-y-6 max-w-7xl mx-auto">
    <header class="flex justify-between items-end pb-6 border-b border-slate-800">
      <div>
        <h2 class="text-2xl font-bold text-white flex items-center gap-2">
          <Globe class="w-6 h-6 text-blue-500" /> Sites
        </h2>
        <p class="text-slate-400 mt-1 text-sm">Target domains configuration.</p>
      </div>
      <button @click="showAddModal = true" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors shadow-sm flex items-center gap-2 font-medium text-sm">
        <Plus class="w-4 h-4" /> Add Site
      </button>
    </header>

    <!-- Project List -->
    <div class="bg-[#1e293b] rounded border border-slate-700 overflow-hidden shadow-sm">
      <div v-if="loading" class="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
        <Loader2 class="w-6 h-6 animate-spin text-blue-500" />
        <span class="text-sm">Loading...</span>
      </div>
      
      <table v-else class="w-full text-left text-sm">
        <thead class="bg-slate-800 text-slate-400 font-medium uppercase tracking-wider text-xs border-b border-slate-700">
          <tr>
            <th class="p-4 pl-6">Domain</th>
            <th class="p-4">Origin IP</th>
            <th class="p-4">Status</th>
            <th class="p-4">Security</th>
            <th class="p-4 text-right pr-6">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-700 text-slate-300">
          <tr v-for="site in sites" :key="site.id" class="hover:bg-slate-700/50 transition-colors">
            <td class="p-4 pl-6 font-medium text-white">{{ site.domain }}</td>
            <td class="p-4 font-mono text-xs text-slate-400">{{ site.targetIp }}</td>
            <td class="p-4">
              <span :class="site.isActive ? 'text-emerald-400' : 'text-slate-500'" class="flex items-center gap-2 text-xs font-medium">
                <span class="w-2 h-2 rounded-full" :class="site.isActive ? 'bg-emerald-500' : 'bg-slate-600'"></span>
                {{ site.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="p-4">
              <div class="flex items-center gap-2 text-slate-400 text-xs">
                <Shield class="w-4 h-4" />
                <span class="capitalize">{{ site.securityLevel }}</span>
              </div>
            </td>
            <td class="p-4 text-right pr-6">
              <div class="flex justify-end gap-2">
                <button @click="openRules(site)" class="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded text-xs border border-slate-600 transition-colors">
                  Rules
                </button>
                <button @click="deleteSite(site.id)" class="text-slate-500 hover:text-rose-400 transition-colors p-1" title="Delete">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="sites.length === 0">
            <td colspan="5" class="p-12 text-center text-slate-500">
                No sites configured yet.
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
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-[#1e293b] p-6 rounded border border-slate-700 w-full max-w-md shadow-xl">
        <h3 class="text-lg font-bold text-white mb-4">Add New Domain</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">Domain Name</label>
            <input v-model="newSite.domain" type="text" placeholder="example.com" class="w-full bg-[#0f172a] border border-slate-600 rounded p-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm">
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">Target Origin IP</label>
            <input v-model="newSite.targetIp" type="text" placeholder="123.45.67.89" class="w-full bg-[#0f172a] border border-slate-600 rounded p-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm">
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button @click="showAddModal = false" class="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
            <button @click="addSite" :disabled="!newSite.domain || !newSite.targetIp" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors disabled:opacity-50 text-sm font-medium">Save</button>
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
