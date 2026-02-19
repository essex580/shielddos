<template>
  <aside class="w-64 bg-slate-900 border-r border-slate-700 text-white flex flex-col h-full">
    <div class="p-6 flex items-center justify-center border-b border-slate-700">
      <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">ShieldDOS</h1>
    </div>
    
    <nav class="flex-1 p-4 space-y-2">
      <a href="#" @click="$emit('page', 'dashboard')" :class="{'bg-slate-800 text-blue-400': currentPage === 'dashboard', 'hover:bg-slate-800': true}" class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors">
        <span class="text-xl">📊</span>
        <span>Dashboard</span>
      </a>
      <a href="#" @click="$emit('page', 'sites')" :class="{'bg-slate-800 text-blue-400': currentPage === 'sites', 'hover:bg-slate-800': true}" class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors">
        <span class="text-xl">🌐</span>
        <span>Sites</span>
      </a>
      <a href="#" @click="$emit('page', 'settings')" :class="{'bg-slate-800 text-blue-400': currentPage === 'settings', 'hover:bg-slate-800': true}" class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors">
        <span class="text-xl">⚙️</span>
        <span>Settings</span>
      </a>
    </nav>

    <div class="p-4 border-t border-slate-700">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500"></div>
        <span class="font-medium">Admin</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  currentPage: string
}>()
</script>
