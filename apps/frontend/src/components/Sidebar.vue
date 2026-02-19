<template>
  <aside class="w-72 glass-card border-r-0 border-r-slate-800/50 text-slate-300 flex flex-col h-full font-sans z-20 relative">
    <div class="p-6 flex items-center space-x-3 border-b border-slate-700/30 bg-gradient-to-r from-blue-900/20 to-transparent">
      <div class="relative">
        <ShieldCheck class="w-8 h-8 text-blue-500" />
        <div class="absolute inset-0 bg-blue-500 blur-lg opacity-20"></div>
      </div>
      <div>
        <h1 class="text-xl font-bold text-white tracking-tight">ShieldDOS</h1>
        <p class="text-[10px] text-blue-400 font-medium tracking-wider uppercase">Enterprise Protection</p>
      </div>
    </div>
    
    <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
      <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">Main Menu</div>
      
      <a href="#" @click="$emit('page', 'dashboard')" 
         :class="currentPage === 'dashboard' ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500' : 'hover:bg-slate-800/50 hover:text-white border-l-2 border-transparent'"
         class="flex items-center space-x-3 px-3 py-3 text-sm font-medium transition-all duration-200 group rounded-r-lg">
        <LayoutDashboard class="w-5 h-5 group-hover:scale-110 transition-transform duration-300" :class="currentPage === 'dashboard' ? 'text-blue-500' : 'text-slate-400 group-hover:text-white'" />
        <span>Dashboard</span>
      </a>
      
      <a href="#" @click="$emit('page', 'sites')" 
         :class="currentPage === 'sites' ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500' : 'hover:bg-slate-800/50 hover:text-white border-l-2 border-transparent'"
         class="flex items-center space-x-3 px-3 py-3 text-sm font-medium transition-all duration-200 group rounded-r-lg">
        <Globe class="w-5 h-5 group-hover:scale-110 transition-transform duration-300" :class="currentPage === 'sites' ? 'text-blue-500' : 'text-slate-400 group-hover:text-white'" />
        <span>Sites & Rules</span>
      </a>
      
      <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-8 mb-4 px-3">System</div>

      <a href="#" @click="$emit('page', 'settings')" 
         :class="currentPage === 'settings' ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500' : 'hover:bg-slate-800/50 hover:text-white border-l-2 border-transparent'"
         class="flex items-center space-x-3 px-3 py-3 text-sm font-medium transition-all duration-200 group rounded-r-lg">
        <Settings class="w-5 h-5 group-hover:scale-110 transition-transform duration-300" :class="currentPage === 'settings' ? 'text-blue-500' : 'text-slate-400 group-hover:text-white'" />
        <span>Configuration</span>
      </a>
    </nav>

    <div class="p-4 border-t border-slate-700/30 bg-slate-900/30">
      <div class="flex items-center space-x-3 mb-4 p-2 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer">
        <div class="relative">
             <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border border-slate-600 shadow-lg">
                <User class="w-4 h-4 text-white" />
             </div>
             <div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-semibold text-white">Administrator</span>
          <span class="text-xs text-slate-500">Root / SuperUser</span>
        </div>
      </div>
      <button @click="$emit('page', 'logout')" class="w-full flex items-center justify-center space-x-2 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all duration-200 text-xs font-medium border border-slate-700 hover:border-slate-600 shadow-sm hover:shadow-md group">
        <LogOut class="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
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
