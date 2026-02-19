<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Dashboard from './views/Dashboard.vue'
import Sites from './views/Sites.vue'
import Login from './views/Login.vue'

const currentPage = ref('dashboard')
const isAuthenticated = ref(!!localStorage.getItem('access_token'))

const onLoginSuccess = () => {
    isAuthenticated.value = true
    window.location.reload() // Reload to attach token to axios
}

const logout = () => {
    localStorage.removeItem('access_token')
    isAuthenticated.value = false
}

const currentView = computed(() => {
  switch (currentPage.value) {
    case 'dashboard': return Dashboard
    case 'sites': return Sites
    default: return Dashboard
  }
})
</script>

<template>
  <div v-if="!isAuthenticated" class="h-screen w-screen bg-[#020617] overflow-hidden">
      <Login @login-success="onLoginSuccess" />
  </div>

  <div v-else class="flex h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30 selection:text-blue-200">
    <!-- Main Background Gradients -->
    <div class="fixed inset-0 z-0 pointer-events-none">
        <div class="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[128px] opacity-50"></div>
        <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[128px] opacity-50"></div>
    </div>

    <Sidebar :current-page="currentPage" @page="(p: string) => p === 'logout' ? logout() : currentPage = p" />
    
    <main class="flex-1 overflow-y-auto overflow-x-hidden relative z-10 scroll-smooth">
      <component :is="currentView" />
    </main>
  </div>
</template>

<style>
body {
  @apply bg-slate-900;
}
</style>
