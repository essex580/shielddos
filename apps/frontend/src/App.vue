<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Dashboard from './views/Dashboard.vue'
import Sites from './views/Sites.vue'
import ThreatLogs from './views/ThreatLogs.vue'
import Login from './views/Login.vue'

const currentPage = ref('dashboard')
const isAuthenticated = ref(!!localStorage.getItem('access_token'))

const onLoginSuccess = () => {
    isAuthenticated.value = true
    // Axios interceptor gets the token dynamically, no need to reload
}

const logout = () => {
    localStorage.removeItem('access_token')
    isAuthenticated.value = false
}

onMounted(() => {
    window.addEventListener('auth-expired', logout);
})

const currentView = computed(() => {
  switch (currentPage.value) {
    case 'dashboard': return Dashboard
    case 'sites': return Sites
    case 'logs': return ThreatLogs
    default: return Dashboard
  }
})
</script>

<template>
  <div v-if="!isAuthenticated" class="h-screen w-screen bg-[#020617] overflow-hidden">
      <Login @login-success="onLoginSuccess" />
  </div>

  <div v-else class="flex h-screen bg-zinc-950 text-zinc-300 font-mono text-sm selection:bg-white selection:text-black">
    <Sidebar :current-page="currentPage" @page="(p: string) => p === 'logout' ? logout() : currentPage = p" />
    
    <main class="flex-1 overflow-y-auto overflow-x-hidden bg-zinc-950">
      <component :is="currentView" />
    </main>
  </div>
</template>

<style>
body {
  @apply bg-slate-900;
}
</style>
