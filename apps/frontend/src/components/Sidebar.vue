<template>
  <aside class="w-[280px] bg-[color:var(--sidebar-bg)] border-r border-[color:var(--border-color)] text-[color:var(--text-muted)] flex flex-col h-full font-sans text-sm shadow-[4px_0_24px_rgba(0,0,0,0.1)] z-40 relative transition-colors">
    <div class="p-6 flex items-center space-x-3 border-b border-[#1a1a1a] bg-[#050505]">
      <ShieldCheck class="w-8 h-8 text-[#f6821f] drop-shadow-[0_0_8px_rgba(246,130,31,0.5)]" />
      <div>
        <h1 class="text-base font-bold text-white tracking-tight uppercase">SHIELD<span class="text-[#f6821f]">DOS</span></h1>
        <p class="text-[10px] uppercase tracking-widest text-[#666] font-semibold">Enterprise Edge</p>
      </div>
    </div>
    
    <nav class="flex-1 py-6 space-y-1 overflow-y-auto px-3">
      <div class="text-[10px] font-bold text-[#555] uppercase tracking-widest mt-2 mb-3 px-3">Compute & Routing</div>
      
      <a href="#" @click="$emit('page', 'dashboard')" 
         :class="currentPage === 'dashboard' ? 'bg-[color:var(--bg-surface)] text-[color:var(--text-main)] font-medium shadow-inner border-[color:var(--border-subtle)]' : 'hover:bg-[color:var(--bg-surface)] hover:text-[color:var(--text-main)] border-transparent'"
         class="flex items-center space-x-3 px-3 py-2.5 transition-all rounded-lg border">
        <LayoutDashboard class="w-4 h-4" :class="currentPage === 'dashboard' ? 'text-[#f6821f]' : ''" />
        <span>Overview</span>
      </a>
      
      <a href="#" @click="$emit('page', 'sites')" 
         :class="currentPage === 'sites' ? 'bg-[color:var(--bg-surface)] text-[color:var(--text-main)] font-medium shadow-inner border-[color:var(--border-subtle)]' : 'hover:bg-[color:var(--bg-surface)] hover:text-[color:var(--text-main)] border-transparent'"
         class="flex items-center space-x-3 px-3 py-2.5 transition-all rounded-lg border">
        <Globe class="w-4 h-4" :class="currentPage === 'sites' ? 'text-[#f6821f]' : ''" />
        <span>Websites & Zones</span>
      </a>

      <a href="#" @click="$emit('page', 'logs')" 
         :class="currentPage === 'logs' ? 'bg-[color:var(--bg-surface)] text-[color:var(--text-main)] font-medium shadow-inner border-[color:var(--border-subtle)]' : 'hover:bg-[color:var(--bg-surface)] hover:text-[color:var(--text-main)] border-transparent'"
         class="flex items-center space-x-3 px-3 py-2.5 transition-all rounded-lg border">
        <ShieldAlert class="w-4 h-4" :class="currentPage === 'logs' ? 'text-[#f6821f]' : ''" />
        <span>Security Analytics</span>
      </a>

      <a href="#" @click="$emit('page', 'firewall')" 
         :class="currentPage === 'firewall' ? 'bg-[color:var(--bg-surface)] text-[color:var(--text-main)] font-medium shadow-inner border-[color:var(--border-subtle)]' : 'hover:bg-[color:var(--bg-surface)] hover:text-[color:var(--text-main)] border-transparent'"
         class="flex items-center space-x-3 px-3 py-2.5 transition-all rounded-lg border">
        <Lock class="w-4 h-4" :class="currentPage === 'firewall' ? 'text-[#f6821f]' : ''" />
        <span>WAF Rules</span>
      </a>
      
      <div class="text-[10px] font-bold text-[#555] uppercase tracking-widest mt-8 mb-3 px-3">Management</div>

      <a href="#" @click="$emit('page', 'settings')" 
         :class="currentPage === 'settings' ? 'bg-[color:var(--bg-surface)] text-[color:var(--text-main)] font-medium shadow-inner border-[color:var(--border-subtle)]' : 'hover:bg-[color:var(--bg-surface)] hover:text-[color:var(--text-main)] border-transparent'"
         class="flex items-center space-x-3 px-3 py-2.5 transition-all rounded-lg border">
        <Settings class="w-4 h-4" :class="currentPage === 'settings' ? 'text-[#f6821f]' : ''"/>
        <span>Platform Settings</span>
      </a>
    </nav>

    <div class="p-6 border-t border-[color:var(--border-color)] bg-[color:var(--sidebar-bg)] transition-colors">
      <div class="flex justify-between items-center mb-5">
        <div class="flex items-center space-x-3 p-3 bg-[color:var(--bg-panel)] border border-[color:var(--border-subtle)] rounded-xl shadow-inner flex-1">
          <div class="w-10 h-10 bg-[color:var(--bg-surface)] flex items-center justify-center border border-[color:var(--border-color)] rounded-lg shadow-sm">
              <User class="w-5 h-5 text-[color:var(--text-muted)]" />
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-bold text-[color:var(--text-main)]">{{ username }}</span>
            <span class="text-[11px] text-[#f6821f] font-semibold">{{ role }}</span>
          </div>
        </div>
      </div>
      <div class="flex gap-2">
        <button @click="$emit('page', 'logout')" class="flex-1 flex items-center justify-center space-x-2 px-3 py-2.5 bg-[color:var(--bg-surface)] hover:bg-[color:var(--bg-panel)] hover:text-[color:var(--text-main)] text-[color:var(--text-muted)] border border-[color:var(--border-subtle)] rounded-lg transition-all text-[10px] font-bold tracking-widest uppercase hover:border-[color:var(--border-color)]">
          <LogOut class="w-4 h-4" />
          <span>Disconnect</span>
        </button>
        <button @click="toggleTheme" class="flex items-center justify-center px-3 py-2.5 bg-[color:var(--bg-surface)] hover:bg-[color:var(--bg-panel)] hover:text-[color:var(--text-main)] text-[color:var(--text-muted)] border border-[color:var(--border-subtle)] rounded-lg transition-all hover:border-[color:var(--border-color)]" title="Toggle Theme">
          <Sun v-if="isDark" class="w-4 h-4" />
          <Moon v-else class="w-4 h-4" />
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ShieldCheck, LayoutDashboard, Globe, Settings, User, LogOut, ShieldAlert, Sun, Moon, Lock } from 'lucide-vue-next';
import { currentTheme, toggleTheme } from '../utils/theme';

const isDark = computed(() => currentTheme.value === 'dark');

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
