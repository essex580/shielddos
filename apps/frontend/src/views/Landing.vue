<template>
  <div class="h-screen w-screen bg-[#020617] text-white font-mono overflow-y-auto selection:bg-blue-500/30">
    
    <!-- Background Grid -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
    </div>

    <div class="relative z-10 max-w-6xl mx-auto px-6 pt-8 pb-20">
      
      <!-- Navbar -->
      <nav class="flex items-center justify-between mb-24 animate-in fade-in slide-in-from-top-4 duration-700">
        <div class="flex items-center gap-3">
            <div class="p-2 border border-zinc-800 rounded-xl">
                <Shield class="w-6 h-6 text-white" />
            </div>
            <span class="text-xl font-bold tracking-wider text-white">
              SHIELD<span class="text-zinc-500">DOS</span>
            </span>
        </div>
        <div class="flex items-center gap-4">
            <a href="https://github.com/essex580/shielddos" target="_blank" class="text-sm font-semibold text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
                <Github class="w-4 h-4" /> GitHub
            </a>
            <button @click="$emit('go-to-login')" class="px-5 py-2 text-sm font-bold bg-white hover:bg-zinc-200 text-black rounded-md transition-colors flex items-center gap-2">
                Login <ArrowRight class="w-4 h-4" />
            </button>
        </div>
      </nav>

      <!-- Hero Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto mb-32 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 fill-mode-both">
        
        <!-- Globe on the Left -->
        <div class="order-2 lg:order-1 relative w-full h-[350px] lg:h-[450px] pointer-events-none flex items-center justify-center">
           <NetworkGlobe :attacks="[]" :simulate="true" />
        </div>

        <!-- Text on the Right -->
        <div class="order-1 lg:order-2 flex flex-col items-start justify-center text-left">
            <h1 class="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                <span class="text-white">Zero-Trust.</span><br/>
                <span class="text-zinc-500">Absolute Mitigation.</span>
            </h1>
            
            <p class="text-lg text-zinc-400 max-w-xl mb-8 leading-relaxed">
                A next-generation Layer 7 CDN, Artificial Intelligence WAF, and global Threat Telemetry mesh. Intercept malicious vulnerability scanners in infinite honeypots, serve assets at 0-ms latency, and secure backend routing via cryptographic edge signatures.
            </p>
        </div>
      </div>

      <!-- Features Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
          
        <!-- Feature 1 -->
        <div class="group relative rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-colors duration-500">
            <div class="h-full p-8 rounded-2xl flex flex-col gap-4">
                <div class="p-3 bg-zinc-800 text-zinc-300 rounded-xl w-fit border border-zinc-700 transition-colors">
                    <BrainCircuit class="w-6 h-6" />
                </div>
                <h3 class="text-xl font-bold text-white">AI Auto-Mitigation</h3>
                <p class="text-sm text-zinc-400 leading-relaxed">Gemini 2.5 Flash correlates global attack vectors. Automatically sinkholes IP ranges exhibiting polymorphic payload structures at the Proxy layer.</p>
            </div>
        </div>

        <!-- Feature 2 -->
        <div class="group relative rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-colors duration-500">
            <div class="h-full p-8 rounded-2xl flex flex-col gap-4">
                <div class="p-3 bg-zinc-800 text-zinc-300 rounded-xl w-fit border border-zinc-700 transition-colors">
                    <HardDrive class="w-6 h-6" />
                </div>
                <h3 class="text-xl font-bold text-white">Infinite Honeypots</h3>
                <p class="text-sm text-zinc-400 leading-relaxed">Vulnerability scanners targeting `/wp-admin` are trapped in Tarpits. Edge connections hang indefinitely via 1-byte proxy loops, exhausting botnet server threads.</p>
            </div>
        </div>

        <!-- Feature 3 -->
        <div class="group relative rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-colors duration-500">
            <div class="h-full p-8 rounded-2xl flex flex-col gap-4">
                <div class="p-3 bg-zinc-800 text-zinc-300 rounded-xl w-fit border border-zinc-700 transition-colors">
                    <Lock class="w-6 h-6" />
                </div>
                <h3 class="text-xl font-bold text-white">Zero-Trust JWT Edge</h3>
                <p class="text-sm text-zinc-400 leading-relaxed">Bypass origins completely. High-risk administrative endpoints are isolated via HMAC-SHA256 asymmetric cryptographic checks enforced strictly at the network boundary.</p>
            </div>
        </div>

        <!-- Feature 4 -->
        <div class="group relative rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-colors duration-500">
            <div class="h-full p-8 rounded-2xl flex flex-col gap-4">
                <div class="p-3 bg-zinc-800 text-zinc-300 rounded-xl w-fit border border-zinc-700 transition-colors">
                    <Zap class="w-6 h-6" />
                </div>
                <h3 class="text-xl font-bold text-white">0-ms L7 CDN Cache</h3>
                <p class="text-sm text-zinc-400 leading-relaxed">Static HTTP assets are intercepted and buffered strictly into Redis memory. RAM-bound node routing drops origin server proxy footprint to zero for gigabytes of traffic.</p>
            </div>
        </div>

        <!-- Feature 5 -->
        <div class="group relative rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-colors duration-500">
            <div class="h-full p-8 rounded-2xl flex flex-col gap-4">
                <div class="p-3 bg-zinc-800 text-zinc-300 rounded-xl w-fit border border-zinc-700 transition-colors">
                    <Globe class="w-6 h-6" />
                </div>
                <h3 class="text-xl font-bold text-white">Global Pub/Sub Mesh</h3>
                <p class="text-sm text-zinc-400 leading-relaxed">When an attack happens in Tokyo, nodes in New York become immune in 3 milliseconds via massive ioredis infrastructure event streams.</p>
            </div>
        </div>

        <!-- Feature 6 -->
        <div class="group relative rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-colors duration-500">
            <div class="h-full p-8 rounded-2xl flex flex-col gap-4">
                <div class="p-3 bg-zinc-800 text-zinc-300 rounded-xl w-fit border border-zinc-700 transition-colors">
                    <BarChart3 class="w-6 h-6" />
                </div>
                <h3 class="text-xl font-bold text-white">GraphQL Analytics</h3>
                <p class="text-sm text-zinc-400 leading-relaxed">NestJS API concurrently queries PostgreSQL matrices and Redis edge arrays within solitary Apollo Graph resolvers, manifesting high-density SIEM dashboards instantly.</p>
            </div>
        </div>

      </div>
      
      <!-- Footer -->
      <div class="mt-32 text-center text-zinc-600 text-xs flex flex-col items-center justify-center gap-2 animate-in fade-in duration-1000 delay-500 fill-mode-both">
          <p>Developed with ❤️ by Essex. ShieldDOS is open-source mitigation.</p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { Shield, Github, ArrowRight, BrainCircuit, HardDrive, Lock, Zap, Globe, BarChart3, Terminal } from 'lucide-vue-next';
import NetworkGlobe from '../components/NetworkGlobe.vue';

defineEmits(['go-to-login']);
</script>
