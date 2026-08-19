<template>
  <div class="space-y-4 md:space-y-6 max-w-4xl">
    <div>
      <h2 class="text-xl font-bold text-white flex items-center gap-3">
        <Settings class="w-5 h-5 text-orange-500" /> Platform Settings
      </h2>
      <p class="text-zinc-500 mt-1 text-xs">Global configuration for the ShieldDOS edge network.</p>
    </div>

    <!-- General -->
    <section class="terminal-card p-5 space-y-4">
      <h3 class="text-sm font-bold text-white border-b border-zinc-800 pb-2 flex items-center gap-2">
        <Globe class="w-4 h-4 text-blue-500" /> General
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 font-semibold">Admin Username</label>
          <input v-model="form.username" disabled class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 font-mono" />
        </div>
        <div>
          <label class="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 font-semibold">API Endpoint</label>
          <input :value="apiUrl" disabled class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 font-mono" />
        </div>
      </div>
    </section>

    <!-- Security -->
    <section class="terminal-card p-5 space-y-4">
      <h3 class="text-sm font-bold text-white border-b border-zinc-800 pb-2 flex items-center gap-2">
        <ShieldCheck class="w-4 h-4 text-emerald-500" /> Security Defaults
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 font-semibold">Default Security Level</label>
          <select v-model="form.securityLevel" class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-blue-500">
            <option value="off">Off</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="under_attack">Under Attack</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 font-semibold">Global Rate Limit (req/min)</label>
          <input v-model.number="form.rateLimit" type="number" min="1" class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 font-mono focus:outline-none focus:border-blue-500" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
        <label class="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-zinc-900 transition-colors">
          <input type="checkbox" v-model="form.botProtection" class="accent-emerald-500" />
          <span class="text-xs text-zinc-300">Bot Protection</span>
        </label>
        <label class="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-zinc-900 transition-colors">
          <input type="checkbox" v-model="form.wafEnabled" class="accent-emerald-500" />
          <span class="text-xs text-zinc-300">WAF</span>
        </label>
        <label class="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-zinc-900 transition-colors">
          <input type="checkbox" v-model="form.waitingRoom" class="accent-emerald-500" />
          <span class="text-xs text-zinc-300">Waiting Room</span>
        </label>
        <label class="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-zinc-900 transition-colors">
          <input type="checkbox" v-model="form.cacheEnabled" class="accent-emerald-500" />
          <span class="text-xs text-zinc-300">Edge Cache</span>
        </label>
      </div>
    </section>

    <!-- AI Engine -->
    <section class="terminal-card p-5 space-y-4">
      <h3 class="text-sm font-bold text-white border-b border-zinc-800 pb-2 flex items-center gap-2">
        <Sparkles class="w-4 h-4 text-purple-500" /> AI Engine
      </h3>
      <div>
        <label class="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 font-semibold">Gemini API Key</label>
        <div class="relative">
          <input :type="showKey ? 'text' : 'password'" v-model="form.geminiKey" placeholder="AIza..." class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 font-mono focus:outline-none focus:border-purple-500 pr-20" />
          <button @click="showKey = !showKey" class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 hover:text-white transition-colors px-2 py-1 border border-zinc-700 rounded">
            {{ showKey ? 'HIDE' : 'SHOW' }}
          </button>
        </div>
        <p class="text-[10px] text-zinc-600 mt-1.5">Used for AI Forensics, autonomous threat hunting, and natural language queries.</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full" :class="form.geminiKey ? 'bg-emerald-500' : 'bg-red-500'"></span>
        <span class="text-[10px] font-semibold uppercase tracking-wider" :class="form.geminiKey ? 'text-emerald-400' : 'text-red-400'">
          {{ form.geminiKey ? 'AI Engine Online' : 'AI Engine Offline' }}
        </span>
      </div>
    </section>

    <!-- Cache Management -->
    <section class="terminal-card p-5 space-y-4">
      <h3 class="text-sm font-bold text-white border-b border-zinc-800 pb-2 flex items-center gap-2">
        <RefreshCw class="w-4 h-4 text-purple-500" /> Edge Cache Management
      </h3>
      <div class="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
         <div>
            <p class="text-sm font-semibold text-zinc-300">Purge Everything</p>
            <p class="text-[10px] text-zinc-500 mt-1">Clear all cached static assets across the entire edge network immediately.</p>
         </div>
         <button @click="purgeGlobalCache" class="px-4 py-2 bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white transition-colors rounded border border-purple-500/50 text-xs font-bold flex items-center gap-2 shrink-0 self-start sm:self-auto" :disabled="purgingCache">
            <Loader2 v-if="purgingCache" class="w-3 h-3 animate-spin" />
            <RefreshCw v-else class="w-3 h-3" />
            {{ purgingCache ? 'Purging...' : 'Purge All Cache' }}
         </button>
      </div>
      <p v-if="purgeMessage" class="text-xs font-semibold text-emerald-400 mt-2">{{ purgeMessage }}</p>
    </section>

    <!-- SSL / TLS -->
    <section class="terminal-card p-5 space-y-4">
      <h3 class="text-sm font-bold text-white border-b border-zinc-800 pb-2 flex items-center gap-2">
        <Lock class="w-4 h-4 text-cyan-500" /> SSL / TLS
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 font-semibold">TLS Mode</label>
          <select v-model="form.tlsMode" class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-cyan-500">
            <option value="self-signed">Self-Signed (Development)</option>
            <option value="lets-encrypt">Let's Encrypt (Auto)</option>
            <option value="custom">Custom Certificate</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 font-semibold">Min TLS Version</label>
          <select v-model="form.minTls" class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-cyan-500">
            <option value="1.2">TLS 1.2</option>
            <option value="1.3">TLS 1.3</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Actions -->
    <div class="flex items-center gap-3">
      <button @click="saveSettings" class="terminal-button text-sm flex items-center gap-2" :disabled="saving">
        <Loader2 v-if="saving" class="w-3.5 h-3.5 animate-spin" />
        <Save v-else class="w-3.5 h-3.5" />
        {{ saving ? 'Saving...' : 'Save Settings' }}
      </button>
      <span v-if="saved" class="text-emerald-400 text-xs font-semibold animate-pulse">✓ Settings saved</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Settings, Globe, ShieldCheck, Sparkles, Lock, Save, Loader2, RefreshCw } from 'lucide-vue-next';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const showKey = ref(false);
const saving = ref(false);
const saved = ref(false);
const purgingCache = ref(false);
const purgeMessage = ref('');

const form = ref({
    username: 'admin',
    securityLevel: 'under_attack',
    rateLimit: 60,
    botProtection: true,
    wafEnabled: true,
    waitingRoom: false,
    cacheEnabled: true,
    geminiKey: '',
    tlsMode: 'self-signed',
    minTls: '1.2',
});

onMounted(async () => {
    // Load current values from localStorage or defaults
    const stored = localStorage.getItem('shield_settings');
    if (stored) {
        try { Object.assign(form.value, JSON.parse(stored)); } catch {}
    }
    // Fetch global security level
    try {
        const res = await axios.get(`${apiUrl}/waf/status`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        if (res.data.securityLevel) {
            form.value.securityLevel = res.data.securityLevel;
        }
    } catch (e) {
        console.error('Failed to fetch security level', e);
    }
});

const saveSettings = async () => {
    saving.value = true;
    saved.value = false;
    
    try {
        await axios.post(`${apiUrl}/waf/status`, { securityLevel: form.value.securityLevel }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
    } catch (e) {
        console.error('Failed to save security level', e);
    }
    
    // Persist locally for other generic settings
    localStorage.setItem('shield_settings', JSON.stringify(form.value));
    
    saving.value = false;
    saved.value = true;
    setTimeout(() => saved.value = false, 3000);
};

const purgeGlobalCache = async () => {
    purgingCache.value = true;
    purgeMessage.value = '';
    try {
        const res = await axios.post(`${apiUrl}/cache/purge`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        purgeMessage.value = `Successfully cleared ${res.data.cleared} cached items.`;
        setTimeout(() => purgeMessage.value = '', 5000);
    } catch (e) {
        purgeMessage.value = 'Failed to purge cache.';
    } finally {
        purgingCache.value = false;
    }
};
</script>
