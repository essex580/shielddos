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
import { Menu } from 'lucide-vue-next'
import { isDemoMode, enterDemoSession } from './demo/config'

const currentPage = ref('dashboard')
const isAuthenticated = ref(!!localStorage.getItem('access_token'))
const currentAuthView = ref<'landing' | 'login'>('landing')
const sidebarOpen = ref(false)

const onLoginSuccess = () => {
    isAuthenticated.value = true
}

const enterPreview = () => {
    enterDemoSession()
    isAuthenticated.value = true
}

const logout = () => {
    localStorage.removeItem('access_token')
    isAuthenticated.value = false
    currentAuthView.value = 'landing'
    sidebarOpen.value = false
}

const onPageChange = (page: string) => {
    if (page === 'logout') {
        logout()
        return
    }
    currentPage.value = page
    sidebarOpen.value = false
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
  <div v-if="!isAuthenticated" class="min-h-screen w-full overflow-x-hidden bg-black font-sans">
      <Landing v-if="currentAuthView === 'landing'" @go-to-login="currentAuthView = 'login'" @enter-preview="enterPreview" />
      <Login v-else @login-success="onLoginSuccess" @go-back="currentAuthView = 'landing'" />
  </div>

  <div v-else class="flex h-screen bg-[color:var(--bg-main)] text-[color:var(--text-main)] font-sans text-sm selection:bg-[color:var(--accent)] selection:text-white transition-colors">
    <div v-if="isDemoMode" class="fixed top-0 left-0 right-0 z-[100] bg-amber-500/10 border-b border-amber-500/30 text-amber-200 text-[10px] font-bold uppercase tracking-widest text-center py-1.5 pointer-events-none">
      Preview Mode — simulated data
    </div>

    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/60 z-40 lg:hidden"
      @click="sidebarOpen = false"
    />

    <Sidebar
      :current-page="currentPage"
      :open="sidebarOpen"
      @page="onPageChange"
    />
    
    <main class="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-[color:var(--bg-main)] flex flex-col relative transition-colors" :class="{ 'pt-7': isDemoMode }">
      <header class="app-header shadow-2xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 md:px-8 md:py-5">
        <div class="flex items-center gap-3 min-w-0">
          <button
            type="button"
            class="lg:hidden p-2 rounded-lg border border-[color:var(--border-subtle)] text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] hover:bg-[color:var(--bg-surface)] transition-colors shrink-0"
            aria-label="Open menu"
            @click="sidebarOpen = true"
          >
            <Menu class="w-5 h-5" />
          </button>
          <h2 class="text-lg sm:text-xl font-bold tracking-tight capitalize truncate">{{ currentPage.replace('_', ' ') }}</h2>
        </div>
        <div class="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <input placeholder="Search resources..." class="terminal-input hidden md:block px-4 py-2 w-full md:w-72 text-sm" />
          <button class="terminal-button text-sm flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
             <span class="hidden sm:inline">Add Site</span>
             <span class="sm:hidden">Add</span>
          </button>
        </div>
      </header>

      <div class="p-4 md:p-8 w-full max-w-[1600px] mx-auto flex-1 min-w-0">
        <component :is="currentView" />
      </div>
    </main>
  </div>
</template>

<style>
/* Base overrides inside style.css */
</style>
