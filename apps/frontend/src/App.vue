<script setup lang="ts">
import { ref, computed } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Dashboard from './views/Dashboard.vue'
import Sites from './views/Sites.vue'

const currentPage = ref('dashboard')

const currentView = computed(() => {
  switch (currentPage.value) {
    case 'dashboard': return Dashboard
    case 'sites': return Sites
    default: return Dashboard
  }
})
</script>

<template>
  <div class="flex h-screen bg-slate-900 text-slate-200 font-sans">
    <Sidebar :current-page="currentPage" @page="(p: string) => currentPage = p" />
    
    <main class="flex-1 overflow-auto bg-slate-900 relative">
      <!-- Background glow effect -->
      <div class="absolute top-0 left-0 w-full h-96 bg-blue-900/10 blur-3xl pointer-events-none"></div>
      
      <component :is="currentView" />
    </main>
  </div>
</template>

<style>
body {
  @apply bg-slate-900;
}
</style>
