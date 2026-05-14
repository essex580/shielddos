<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Dashboard from './views/Dashboard.vue'
import Sites from './views/Sites.vue'
import ThreatLogs from './views/ThreatLogs.vue'
import PlatformSettings from './views/PlatformSettings.vue'
import Firewall from './views/Firewall.vue'
import Login from './views/Login.vue'
import Landing from './views/Landing.vue'

const currentPage = ref('dashboard')
const isAuthenticated = ref(!!localStorage.getItem('access_token'))
const currentAuthView = ref<'landing' | 'login'>('landing')

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
    case 'firewall': return Firewall
    case 'settings': return PlatformSettings
    default: return Dashboard
  }
})
</script>

<template>
  <div v-if="!isAuthenticated" class="h-screen w-screen bg-black overflow-hidden font-sans">
      <Landing v-if="currentAuthView === 'landing'" @go-to-login="currentAuthView = 'login'" />
      <Login v-else @login-success="onLoginSuccess" @go-back="currentAuthView = 'landing'" />
  </div>

  <div v-else class="flex h-screen bg-[color:var(--bg-main)] text-[color:var(--text-main)] font-sans text-sm selection:bg-[color:var(--accent)] selection:text-white transition-colors">
    <Sidebar :current-page="currentPage" @page="(p: string) => p === 'logout' ? logout() : currentPage = p" />
    
    <main class="flex-1 overflow-y-auto overflow-x-hidden bg-[color:var(--bg-main)] flex flex-col relative transition-colors">
      <header class="app-header shadow-2xl flex items-center justify-between px-8 py-5">
        <h2 class="text-xl font-bold tracking-tight capitalize">{{ currentPage.replace('_', ' ') }}</h2>
        <div class="flex items-center space-x-4">
          <input placeholder="Search resources..." class="terminal-input px-4 py-2 w-72 text-sm" />
          <button class="terminal-button text-sm flex items-center gap-2">
             Add Site
          </button>
        </div>
      </header>

      <div class="p-8 w-full max-w-[1600px] mx-auto flex-1">
        <component :is="currentView" />
      </div>
    </main>
  </div>
</template>

<style>
/* Base overrides inside style.css */
</style>
