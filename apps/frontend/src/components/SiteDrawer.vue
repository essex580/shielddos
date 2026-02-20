<template>
    <div v-if="isOpen && site" class="fixed inset-0 z-50 flex justify-end">
        <!-- Backdrop Blur overlay -->
        <div 
            class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            @click="$emit('close')"
        ></div>

        <!-- Sliding Right Drawer -->
        <div class="relative w-full max-w-2xl bg-zinc-950 border-l border-zinc-800 shadow-2xl h-full flex flex-col transform transition-transform duration-300 translate-x-0">
            
            <!-- Drawer Header -->
            <div class="flex items-center justify-between p-6 border-b border-zinc-800 shrink-0 bg-zinc-900/50">
                <div>
                    <h2 class="text-xl font-bold text-white flex items-center gap-3">
                        {{ site.domain }}
                    </h2>
                    <div class="flex items-center gap-2 mt-2">
                        <div class="text-[10px] font-semibold flex items-center gap-1" :class="site.isActive ? 'text-green-500' : 'text-zinc-500'">
                            <span class="w-1.5 h-1.5 rounded-full" :class="site.isActive ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-zinc-500'"></span>
                            {{ site.isActive ? 'Active' : 'Offline' }}
                        </div>
                        <span class="text-zinc-700 text-[10px]">•</span>
                        <div class="text-[10px] text-zinc-500 font-mono">{{ site.targetIp }}</div>
                    </div>
                </div>
                
                <div class="flex items-center gap-3">
                    <button @click="$emit('purge-cache', site)" class="border border-zinc-700 bg-zinc-900 text-zinc-300 rounded-md hover:bg-zinc-800 hover:text-white px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-2">
                        <RefreshCw class="w-3 h-3" /> Purge Cache
                    </button>
                    <button @click="$emit('close')" class="text-zinc-500 hover:text-white transition-colors p-2 rounded-full hover:bg-zinc-800">
                        <X class="w-5 h-5" />
                    </button>
                </div>
            </div>

            <!-- Drawer Content (Scrollable Bento Grid) -->
            <div class="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                
                <!-- BENTO GRID -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <!-- Uptime Chart (Full Width Span) -->
                    <div class="md:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 shadow-sm">
                        <UptimeChart :site-id="site.id" />
                    </div>

                    <!-- WAF Protection Card -->
                    <div class="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col justify-between group hover:border-zinc-700 transition-colors">
                        <div class="flex items-start justify-between mb-4">
                            <div class="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                <ShieldCheck class="w-5 h-5" />
                            </div>
                            <button @click="$emit('toggle-waf')" 
                                class="w-10 h-5 rounded-full relative transition-colors focus:outline-none"
                                :class="site.wafEnabled ? 'bg-emerald-600' : 'bg-zinc-800'">
                                <div class="w-3 h-3 bg-white rounded-full absolute top-1 transition-all"
                                :class="site.wafEnabled ? 'left-6' : 'left-1'"></div>
                            </button>
                        </div>
                        <div>
                            <h3 class="text-sm font-bold text-white mb-1">Web App Firewall</h3>
                            <p class="text-[10px] text-zinc-400 leading-tight">Block SQLi, XSS, and complex layer 7 payload attacks automatically.</p>
                        </div>
                    </div>

                    <!-- Bot Protection Card -->
                    <div class="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col justify-between group hover:border-zinc-700 transition-colors">
                        <div class="flex items-start justify-between mb-4">
                            <div class="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                <Bot class="w-5 h-5" />
                            </div>
                            <button @click="$emit('toggle-bot')" 
                                class="w-10 h-5 rounded-full relative transition-colors focus:outline-none"
                                :class="site.botProtection ? 'bg-blue-600' : 'bg-zinc-800'">
                                <div class="w-3 h-3 bg-white rounded-full absolute top-1 transition-all"
                                :class="site.botProtection ? 'left-6' : 'left-1'"></div>
                            </button>
                        </div>
                        <div>
                            <h3 class="text-sm font-bold text-white mb-1">Bot Management</h3>
                            <p class="text-[10px] text-zinc-400 leading-tight">Challenge automated scripts, scrapers, and headless browsers.</p>
                        </div>
                    </div>

                    <!-- Under Attack Mode Card (Full Width Span) -->
                    <div class="md:col-span-2 bg-gradient-to-r from-red-950/20 to-zinc-900/60 border border-zinc-800 rounded-xl p-5 shadow-sm flex items-center justify-between group hover:border-red-900/50 transition-colors">
                        <div class="flex gap-4 items-center">
                            <div class="p-2 rounded-lg bg-red-500/10 text-red-500 shrink-0">
                                <AlertTriangle class="w-5 h-5" />
                            </div>
                            <div>
                                <h3 class="text-sm font-bold" :class="site.securityLevel === 'under_attack' ? 'text-red-400' : 'text-white'">Under Attack Mode</h3>
                                <p class="text-[10px] text-zinc-400 mt-0.5">Forces a JavaScript challenge for <strong class="text-zinc-300">all visitors</strong> to mitigate advanced Application DDoS attacks.</p>
                            </div>
                        </div>
                        <button @click="$emit('toggle-security')" 
                            class="w-10 h-5 rounded-full relative transition-colors shrink-0 focus:outline-none"
                            :class="site.securityLevel === 'under_attack' ? 'bg-red-600' : 'bg-zinc-800'">
                            <div class="w-3 h-3 bg-white rounded-full absolute top-1 transition-all shadow-sm"
                            :class="site.securityLevel === 'under_attack' ? 'left-6' : 'left-1'"></div>
                        </button>
                    </div>

                    <!-- Rate Limiting & Rules -->
                    <div class="md:col-span-2 mt-4 space-y-4">
                        
                        <!-- Mini Tabs for Custom Rules vs Settings -->
                        <div class="flex items-center gap-4 border-b border-zinc-800 pb-2">
                             <button @click="activeSubTab = 'rules'" class="text-xs font-semibold pb-2 border-b-2 transition-colors" :class="activeSubTab === 'rules' ? 'text-white border-blue-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'">Firewall Rules</button>
                             <button @click="activeSubTab = 'advanced'" class="text-xs font-semibold pb-2 border-b-2 transition-colors" :class="activeSubTab === 'advanced' ? 'text-white border-blue-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'">Advanced Settings</button>
                        </div>

                        <!-- Rules Tab Content -->
                        <div v-if="activeSubTab === 'rules'" class="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <FirewallRules :siteId="site.id" :siteDomain="site.domain" />
                        </div>

                        <!-- Advanced Settings Tab Content -->
                        <div v-if="activeSubTab === 'advanced'" class="space-y-6 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            
                            <div class="bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-4">
                                <div class="flex items-center justify-between mb-2">
                                    <label class="text-xs font-bold text-zinc-300">Rate Limiting</label>
                                    <input type="number" 
                                        :value="site.rateLimit" 
                                        @change="(e) => $emit('update-rate', Number((e.target as HTMLInputElement).value))"
                                        class="w-24 bg-zinc-950 border border-zinc-700 p-1.5 text-white text-xs rounded-md focus:outline-none focus:border-zinc-500 text-center">
                                </div>
                                <p class="text-[10px] text-zinc-500">Maximum allowed requests per minute per unique IP address before returning HTTP 429.</p>
                            </div>

                            <div class="bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-4 space-y-4">
                                <h4 class="text-xs font-bold text-zinc-300 border-b border-zinc-800/50 pb-2 mb-3">Custom Error Pages</h4>
                                
                                <div>
                                    <label class="block text-[10px] font-bold text-zinc-500 uppercase mb-1 flex justify-between">
                                        <span>403 Access Denied</span>
                                        <span class="text-zinc-600 font-normal">WAF / Bot Blocks</span>
                                    </label>
                                    <textarea 
                                        :value="site.customErrorPage403" 
                                        @change="(e) => updateCustomPages('403', (e.target as HTMLTextAreaElement).value)" 
                                        class="w-full bg-zinc-950 border border-zinc-700/50 p-3 text-zinc-400 font-mono text-xs rounded-md focus:border-zinc-500 h-24 placeholder-zinc-800 focus:outline-none resize-none" 
                                        placeholder="<html>&#10;  <body>&#10;    <h1>Access Denied by WAF</h1>&#10;  </body>&#10;</html>"></textarea>
                                </div>
                                
                                <div>
                                    <label class="block text-[10px] font-bold text-zinc-500 uppercase mb-1 flex justify-between">
                                        <span>502 Bad Gateway</span>
                                        <span class="text-zinc-600 font-normal">Origin Server Offline</span>
                                    </label>
                                    <textarea 
                                        :value="site.customErrorPage502" 
                                        @change="(e) => updateCustomPages('502', (e.target as HTMLTextAreaElement).value)" 
                                        class="w-full bg-zinc-950 border border-zinc-700/50 p-3 text-zinc-400 font-mono text-xs rounded-md focus:border-zinc-500 h-24 placeholder-zinc-800 focus:outline-none resize-none" 
                                        placeholder="<html>&#10;  <body>&#10;    <h1>Origin Offline (502)</h1>&#10;  </body>&#10;</html>"></textarea>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { X, RefreshCw, ShieldCheck, Bot, AlertTriangle } from 'lucide-vue-next';
import UptimeChart from './UptimeChart.vue';
import FirewallRules from './FirewallRules.vue';

const props = defineProps<{
    site: any | null,
    isOpen: boolean
}>();

const emit = defineEmits([
    'close', 
    'purge-cache', 
    'toggle-waf', 
    'toggle-bot', 
    'toggle-security', 
    'update-rate',
    'update-pages'
]);

const activeSubTab = ref<'rules' | 'advanced'>('rules');

const updateCustomPages = (type: '403' | '502', value: string) => {
    emit('update-pages', { type, value });
};
</script>
