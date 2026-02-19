<template>
  <aside class="w-64 bg-[#0f172a] border-r border-slate-800 text-slate-300 flex flex-col h-full font-sans">
    <div class="p-6 flex items-center space-x-3 border-b border-slate-800">
      <ShieldCheck class="w-8 h-8 text-blue-500" />
      <h1 class="text-xl font-bold text-white tracking-tight">ShieldDOS</h1>
    </div>
    
    <nav class="flex-1 px-4 py-6 space-y-1">
      <a href="#" @click="$emit('page', 'dashboard')" 
         :class="currentPage === 'dashboard' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 hover:text-white'"
         class="flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group">
        <LayoutDashboard class="w-5 h-5 group-hover:text-blue-400 transition-colors" :class="currentPage === 'dashboard' ? 'text-blue-500' : 'text-slate-400'" />
        <span class="text-sm font-medium">Dashboard</span>
      </a>
      
      <a href="#" @click="$emit('page', 'sites')" 
         :class="currentPage === 'sites' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 hover:text-white'"
         class="flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group">
        <Globe class="w-5 h-5 group-hover:text-blue-400 transition-colors" :class="currentPage === 'sites' ? 'text-blue-500' : 'text-slate-400'" />
        <span class="text-sm font-medium">Sites</span>
      </a>
      
      <a href="#" @click="$emit('page', 'settings')" 
         :class="currentPage === 'settings' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 hover:text-white'"
         class="flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group">
        <Settings class="w-5 h-5 group-hover:text-blue-400 transition-colors" :class="currentPage === 'settings' ? 'text-blue-500' : 'text-slate-400'" />
        <span class="text-sm font-medium">Settings</span>
      </a>
    </nav>

    <div class="p-4 border-t border-slate-800 bg-slate-900/50">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
          <User class="w-4 h-4 text-slate-400" />
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-medium text-white">Administrator</span>
          <span class="text-xs text-slate-500">Root Access</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ShieldCheck, LayoutDashboard, Globe, Settings, User } from 'lucide-vue-next';

defineProps<{
  currentPage: string
}>()
</script>
