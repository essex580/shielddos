<template>
  <div class="p-8 space-y-8">
    <header class="flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-bold text-white">Sites</h2>
        <p class="text-slate-400">Manage your protected domains</p>
      </div>
      <button @click="showAddModal = true" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition shadow-lg shadow-blue-500/30 flex items-center">
        <span class="mr-2">+</span> Add Site
      </button>
    </header>

    <!-- Sites List -->
    <div class="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table class="w-full text-left">
            <thead class="bg-slate-900 text-slate-400">
                <tr>
                    <th class="p-4">Domain</th>
                    <th class="p-4">Target IP</th>
                    <th class="p-4">Status</th>
                    <th class="p-4">Security</th>
                    <th class="p-4">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700 text-slate-300">
                <tr v-for="site in sites" :key="site.id" class="hover:bg-slate-700/50 transition">
                    <td class="p-4 font-medium text-white">{{ site.domain }}</td>
                    <td class="p-4 font-mono text-sm">{{ site.targetIp }}</td>
                    <td class="p-4">
                        <span :class="site.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'" class="px-2 py-1 rounded text-xs">
                            {{ site.isActive ? 'Active' : 'Inactive' }}
                        </span>
                    </td>
                    <td class="p-4">
                        <span class="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">{{ site.securityLevel }}</span>
                    </td>
                    <td class="p-4">
                        <button @click="deleteSite(site.id)" class="text-red-400 hover:text-red-300 transition">Delete</button>
                    </td>
                </tr>
                <tr v-if="sites.length === 0">
                    <td colspan="5" class="p-8 text-center text-slate-500">
                        No sites configured. Add one to get started.
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Simplified Add Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
        <div class="bg-slate-800 p-8 rounded-xl border border-slate-700 w-full max-w-md">
            <h3 class="text-2xl font-bold text-white mb-6">Add New Site</h3>
            <div class="space-y-4">
                <div>
                    <label class="block text-slate-400 mb-1">Domain Name</label>
                    <input v-model="newSite.domain" type="text" placeholder="example.com" class="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-slate-400 mb-1">Target Origin IP</label>
                    <input v-model="newSite.targetIp" type="text" placeholder="123.45.67.89:80" class="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-blue-500">
                </div>
                <div class="flex justify-end space-x-3 mt-6">
                    <button @click="showAddModal = false" class="px-4 py-2 text-slate-400 hover:text-white transition">Cancel</button>
                    <button @click="addSite" class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition">Save Site</button>
                </div>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

const sites = ref<any[]>([])
const showAddModal = ref(false)
const newSite = ref({ domain: '', targetIp: '' })

// Mock API calls for now - will be replaced with real backend calls
const addSite = async () => {
    // try { await axios.post('http://localhost:3000/sites', newSite.value) } ...
    const id = Math.random().toString(36).substr(2, 9);
    sites.value.push({ 
        id, 
        domain: newSite.value.domain, 
        targetIp: newSite.value.targetIp, 
        isActive: true, 
        securityLevel: 'normal' 
    })
    showAddModal.value = false;
    newSite.value = { domain: '', targetIp: '' }
}

const deleteSite = (id: string) => {
    sites.value = sites.value.filter(s => s.id !== id)
}
</script>
