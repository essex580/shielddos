<template>
  <aside class="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-full font-sans">
    <div class="p-6 flex items-center space-x-3 border-b border-slate-800">
      <ShieldCheck class="w-8 h-8 text-blue-500" />
      <div>
        <h1 class="text-xl font-bold text-white tracking-tight">ShieldDOS</h1>
        <p class="text-xs text-slate-500">Protection Panel</p>
      </div>
    </div>
    
    <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
      <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">Menu</div>
      
      <a href="#" @click="$emit('page', 'dashboard')" 
         :class="currentPage === 'dashboard' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 hover:text-white'"
         class="flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group">
        <LayoutDashboard class="w-5 h-5" :class="currentPage === 'dashboard' ? 'text-blue-500' : 'text-slate-400'" />
        <span class="text-sm font-medium">Dashboard</span>
      </a>
      
      <a href="#" @click="$emit('page', 'sites')" 
         :class="currentPage === 'sites' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 hover:text-white'"
         class="flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group">
        <Globe class="w-5 h-5" :class="currentPage === 'sites' ? 'text-blue-500' : 'text-slate-400'" />
        <span class="text-sm font-medium">Sites</span>
      </a>
      
      <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-8 mb-4 px-3">System</div>

      <a href="#" @click="$emit('page', 'settings')" 
         :class="currentPage === 'settings' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 hover:text-white'"
         class="flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group">
        <Settings class="w-5 h-5" :class="currentPage === 'settings' ? 'text-blue-500' : 'text-slate-400'" />
        <span class="text-sm font-medium">Settings</span>
      </a>
    </nav>

    <div class="p-4 border-t border-slate-800 bg-slate-900">
      <div class="flex items-center space-x-3 mb-4 p-2">
        <div class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <User class="w-4 h-4 text-slate-400" />
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-medium text-white">Administrator</span>
          <span class="text-xs text-slate-500">Logged in</span>
        </div>
      </div>
      <button @click="$emit('page', 'logout')" class="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors text-xs font-medium border border-slate-700">
        <LogOut class="w-3 h-3" />
        <span>Sign Out</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ShieldCheck, LayoutDashboard, Globe, Settings, User, LogOut } from 'lucide-vue-next';

defineProps<{
  currentPage: string
}>()
</script>
