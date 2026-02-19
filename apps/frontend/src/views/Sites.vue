<template>
  <div class="p-8 space-y-6 max-w-7xl mx-auto">
    <header class="flex justify-between items-end border-b border-slate-800 pb-6">
      <div>
        <h2 class="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Globe class="w-6 h-6 text-blue-500" /> Sites
        </h2>
        <p class="text-slate-400 mt-1">Manage protected domains and configuration.</p>
      </div>
      <button @click="showAddModal = true" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors shadow-sm flex items-center gap-2 font-medium text-sm">
        <Plus class="w-4 h-4" /> Add Site
      </button>
    </header>

    <!-- Project List -->
    <div class="bg-[#0f172a] rounded-lg border border-slate-800 overflow-hidden shadow-sm">
      <div v-if="loading" class="p-8 text-center text-slate-500">Loading sites...</div>
      
      <table v-else class="w-full text-left text-sm">
        <thead class="bg-slate-900/50 text-slate-400 font-medium uppercase tracking-wider text-xs border-b border-slate-800">
          <tr>
            <th class="p-4 pl-6">Domain</th>
            <th class="p-4">Origin IP</th>
            <th class="p-4">Status</th>
            <th class="p-4">Security Level</th>
            <th class="p-4 text-right pr-6">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800 text-slate-300">
          <tr v-for="site in sites" :key="site.id" class="hover:bg-slate-800/30 transition-colors">
            <td class="p-4 pl-6 font-medium text-white">{{ site.domain }}</td>
            <td class="p-4 font-mono text-slate-400">{{ site.targetIp }}</td>
            <td class="p-4">
              <span :class="site.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'" class="px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-fit">
                <span class="w-1.5 h-1.5 rounded-full" :class="site.isActive ? 'bg-emerald-400' : 'bg-rose-400'"></span>
                {{ site.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="p-4">
              <div class="flex items-center gap-2">
                <Shield class="w-4 h-4 text-slate-500" />
                <span class="capitalize">{{ site.securityLevel }}</span>
              </div>
            </td>
            <td class="p-4 text-right pr-6">
              <button @click="deleteSite(site.id)" class="text-slate-500 hover:text-rose-400 transition-colors p-1.5 hover:bg-rose-500/10 rounded">
                <Trash2 class="w-4 h-4" />
              </button>
            </td>
          </tr>
          <tr v-if="sites.length === 0">
            <td colspan="5" class="p-12 text-center">
              <div class="flex flex-col items-center gap-3 text-slate-500">
                <Globe class="w-10 h-10 opacity-20" />
                <p>No sites configured yet.</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-[#1e293b] p-6 rounded-lg border border-slate-700 w-full max-w-md shadow-2xl transform transition-all scale-100">
        <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Globe class="w-5 h-5 text-blue-500" /> New Domain
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Domain Name</label>
            <input v-model="newSite.domain" type="text" placeholder="example.com" class="w-full bg-[#0f172a] border border-slate-700 rounded-md p-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm">
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Target Origin IP</label>
            <input v-model="newSite.targetIp" type="text" placeholder="123.45.67.89:80" class="w-full bg-[#0f172a] border border-slate-700 rounded-md p-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm">
          </div>
          <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-700/50">
            <button @click="showAddModal = false" class="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">Cancel</button>
            <button @click="addSite" :disabled="!newSite.domain || !newSite.targetIp" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm">Save Configuration</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { Globe, Plus, Trash2, Shield } from 'lucide-vue-next';

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

onMounted(() => {
    fetchSites();
})
</script>
