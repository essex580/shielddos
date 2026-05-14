<template>
  <div class="h-full font-sans text-[#f5f5f5]">
    <div class="flex items-center justify-between mb-6 pb-4 border-b border-[#1a1a1a]">
        <span class="flex items-center gap-2 text-white font-bold text-sm tracking-wide">
            <Timer class="w-4 h-4 text-fuchsia-500" />
            Virtual Waiting Room Settings
        </span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        <!-- Configuration Card -->
        <div class="bg-[#050505] p-5 border border-[#1a1a1a] rounded-xl shadow-inner space-y-5">
            <h4 class="text-[11px] font-bold text-[#888] uppercase tracking-widest border-b border-[#1a1a1a] pb-3 mb-2 flex items-center justify-between">
                Room Configuration
                <div class="w-2 h-2 rounded-full" :class="site.waitingRoomEnabled ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'"></div>
            </h4>
            
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <label class="text-xs font-bold text-[#ddd]">Enable Virtual Waiting Room</label>
                    <button @click="$emit('toggle', 'waitingroom')" 
                        class="w-10 h-5 rounded-full relative transition-colors focus:outline-none"
                        :class="site.waitingRoomEnabled ? 'bg-fuchsia-600' : 'bg-[#222]'">
                        <div class="w-3 h-3 bg-white rounded-full absolute top-1 transition-all"
                        :class="site.waitingRoomEnabled ? 'left-6' : 'left-1'"></div>
                    </button>
                </div>
                
                <div class="space-y-2 opacity-50 cursor-not-allowed">
                    <label class="text-[10px] font-bold text-[#888] uppercase tracking-widest flex items-center justify-between">
                        Total Active Users Limits 
                        <span class="bg-[#222] text-[#aaa] px-1.5 py-0.5 rounded text-[8px]">PRO</span>
                    </label>
                    <input type="number" value="10000" disabled class="w-full bg-[#0a0a0a] border border-[#222] p-2 text-xs font-mono rounded-md">
                </div>
                
                <div class="space-y-2 opacity-50 cursor-not-allowed">
                    <label class="text-[10px] font-bold text-[#888] uppercase tracking-widest flex items-center justify-between">
                        New Users Per Minute 
                        <span class="bg-[#222] text-[#aaa] px-1.5 py-0.5 rounded text-[8px]">PRO</span>
                    </label>
                    <input type="number" value="500" disabled class="w-full bg-[#0a0a0a] border border-[#222] p-2 text-xs font-mono rounded-md">
                </div>
            </div>
            
            <div class="pt-2 border-t border-[#1a1a1a]">
                <p class="text-[10px] leading-relaxed text-[#666]">
                    <strong>Note:</strong> When traffic limits are reached, users are queued inside Redis temporarily before being pushed to your upstream servers.
                </p>
            </div>
        </div>

        <!-- Bot Management Card -->
        <div class="bg-[#050505] p-5 border border-[#1a1a1a] rounded-xl shadow-inner space-y-5">
            <h4 class="text-[11px] font-bold text-[#888] uppercase tracking-widest border-b border-[#1a1a1a] pb-3 mb-2 flex items-center justify-between">
                Advanced Bot Management
                <div class="w-2 h-2 rounded-full" :class="site.botProtection ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'"></div>
            </h4>
            
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <label class="text-xs font-bold text-[#ddd]">Deflect Automated Bots</label>
                    <button @click="$emit('toggle', 'bot')" 
                        class="w-10 h-5 rounded-full relative transition-colors focus:outline-none"
                        :class="site.botProtection ? 'bg-blue-600' : 'bg-[#222]'">
                        <div class="w-3 h-3 bg-white rounded-full absolute top-1 transition-all"
                        :class="site.botProtection ? 'left-6' : 'left-1'"></div>
                    </button>
                </div>
                
                <div class="flex justify-between items-center opacity-50">
                    <div>
                        <label class="text-xs font-bold text-[#ddd]">Machine Learning Bot Score</label>
                        <p class="text-[9px] text-[#666]">Block requests with Bot Score < 30</p>
                    </div>
                    <button disabled class="w-10 h-5 rounded-full relative transition-colors focus:outline-none bg-[#222] cursor-not-allowed">
                        <div class="w-3 h-3 bg-[#555] rounded-full absolute top-1 left-1 transition-all"></div>
                    </button>
                </div>

                <div class="flex justify-between items-center">
                    <div>
                        <label class="text-xs font-bold text-[#ddd]">Block Headless Browsers</label>
                        <p class="text-[9px] text-[#666] leading-tight">Inspect navigator.webdriver & fingerprint</p>
                    </div>
                    <button @click="headless = !headless" 
                        class="w-10 h-5 rounded-full relative transition-colors focus:outline-none"
                        :class="headless ? 'bg-emerald-600' : 'bg-[#222]'">
                        <div class="w-3 h-3 bg-white rounded-full absolute top-1 transition-all"
                        :class="headless ? 'left-6' : 'left-1'"></div>
                    </button>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Timer } from 'lucide-vue-next';

defineProps<{
  site: any
}>();

defineEmits(['toggle']);

const headless = ref(true);
</script>


