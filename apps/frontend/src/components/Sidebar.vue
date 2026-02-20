<template>
  <aside class="w-64 bg-zinc-950 border-r border-zinc-800 text-zinc-400 flex flex-col h-full font-mono text-sm">
    <div class="p-4 flex items-center space-x-3 border-b border-zinc-800">
      <ShieldCheck class="w-6 h-6 text-white" />
      <div>
        <h1 class="text-sm font-bold text-white tracking-tight uppercase">SHIELD<span class="text-zinc-600">DOS</span></h1>
      </div>
    </div>
    
    <nav class="flex-1 p-0 space-y-px overflow-y-auto">
      <div class="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-6 mb-2 px-4">System</div>
      
      <a href="#" @click="$emit('page', 'dashboard')" 
         :class="currentPage === 'dashboard' ? 'bg-white text-black' : 'hover:bg-zinc-900 hover:text-white'"
         class="flex items-center space-x-3 px-4 py-3 transition-none border-l-2"
         :style="currentPage === 'dashboard' ? 'border-color: #fff' : 'border-color: transparent'">
        <LayoutDashboard class="w-4 h-4" />
        <span class="font-medium">/dashboard</span>
      </a>
      
      <a href="#" @click="$emit('page', 'sites')" 
         :class="currentPage === 'sites' ? 'bg-white text-black' : 'hover:bg-zinc-900 hover:text-white'"
         class="flex items-center space-x-3 px-4 py-3 transition-none border-l-2"
         :style="currentPage === 'sites' ? 'border-color: #fff' : 'border-color: transparent'">
        <Globe class="w-4 h-4" />
        <span class="font-medium">/sites</span>
      </a>
      
      <div class="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-6 mb-2 px-4">Config</div>

      <a href="#" @click="$emit('page', 'settings')" 
         :class="currentPage === 'settings' ? 'bg-white text-black' : 'hover:bg-zinc-900 hover:text-white'"
         class="flex items-center space-x-3 px-4 py-3 transition-none border-l-2"
         :style="currentPage === 'settings' ? 'border-color: #fff' : 'border-color: transparent'">
        <Settings class="w-4 h-4" />
        <span class="font-medium">/settings</span>
      </a>
    </nav>

    <div class="p-4 border-t border-zinc-800 bg-zinc-950">
      <div class="flex items-center space-x-3 mb-4 p-2 border border-zinc-800 rounded-md">
        <div class="w-8 h-8 bg-zinc-900 flex items-center justify-center border border-zinc-800 rounded-md">
            <User class="w-4 h-4 text-zinc-500" />
        </div>
        <div class="flex flex-col">
          <span class="text-xs font-bold text-white">{{ role }}</span>
          <span class="text-[10px] text-zinc-500 font-semibold">{{ username }}</span>
        </div>
      </div>
      <button @click="$emit('page', 'logout')" class="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 rounded-md transition-colors text-xs font-medium tracking-wider">
        <LogOut class="w-4 h-4" />
        <span>Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ShieldCheck, LayoutDashboard, Globe, Settings, User, LogOut } from 'lucide-vue-next';

defineProps<{
  currentPage: string
}>()

const username = ref('User');
const role = ref('Client');

onMounted(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            username.value = payload.username || 'Unknown';
            role.value = payload.role === 'admin' ? 'SYSTEM ADMINISTRATOR' : 'TENANT ACCOUNT';
        } catch (e) {
            // parse error
        }
    }
});
</script>
