<template>
  <div class="h-screen w-screen bg-[#020617] text-white font-mono overflow-y-auto selection:bg-blue-500/30">
    
    <!-- Background Grid & Glows -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
      
      <!-- Top Blob -->
      <div class="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]"></div>
      <!-- Right Blob -->
      <div class="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-purple-600/10 blur-[120px]"></div>
    </div>

    <div class="relative z-10 max-w-6xl mx-auto px-6 pt-8 pb-20">
      
      <!-- Navbar -->
      <nav class="flex items-center justify-between mb-24 animate-in fade-in slide-in-from-top-4 duration-700">
        <div class="flex items-center gap-3">
            <div class="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/10 rounded-xl border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <Shield class="w-6 h-6 text-blue-400" />
            </div>
            <span class="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              SHIELD<span class="text-white">DOS</span>
            </span>
        </div>
        <div class="flex items-center gap-4">
            <a href="https://github.com/essex580/shielddos" target="_blank" class="text-sm font-semibold text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
                <Github class="w-4 h-4" /> GitHub
            </a>
            <button @click="$emit('go-to-login')" class="group relative px-5 py-2 text-sm font-bold bg-white text-black overflow-hidden rounded-md transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                <div class="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span class="relative flex items-center gap-2">Admin Login <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
            </button>
        </div>
      </nav>

      <!-- Hero Section -->
      <div class="flex flex-col items-center justify-center text-center max-w-4xl mx-auto mb-32 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 fill-mode-both">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
            <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Enterprise Edge Defense Platform
        </div>
        
        <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            <span class="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400">Zero-Trust.</span><br/>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Absolute Mitigation.</span>
        </h1>
        
        <p class="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A next-generation Layer 7 CDN, Artificial Intelligence WAF, and global Threat Telemetry mesh. Intercept malicious vulnerability scanners in infinite honeypots, serve assets at 0-ms latency, and secure backend routing via cryptographic edge signatures.
        </p>

        <div class="flex items-center gap-6">
            <button @click="$emit('go-to-login')" class="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:-translate-y-1 flex items-center gap-3">
                <Terminal class="w-5 h-5" /> Initialize Control Plane
            </button>
        </div>
      </div>

      <!-- Features Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
          
        <!-- Feature 1 -->
        <div class="group relative p-[1px] rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-950 hover:from-blue-500 hover:to-purple-600 transition-all duration-500">
            <div class="h-full bg-zinc-950/90 backdrop-blur-xl p-8 rounded-2xl flex flex-col gap-4">
                <div class="p-3 bg-blue-500/10 text-blue-400 rounded-xl w-fit border border-blue-500/20 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all">
                    <BrainCircuit class="w-6 h-6" />
                </div>
                <h3 class="text-xl font-bold text-white">AI Auto-Mitigation</h3>
                <p class="text-sm text-zinc-400 leading-relaxed">Gemini 2.5 Flash correlates global attack vectors. Automatically sinkholes IP ranges exhibiting polymorphic payload structures at the Proxy layer.</p>
            </div>
        </div>

        <!-- Feature 2 -->
        <div class="group relative p-[1px] rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-950 hover:from-purple-500 hover:to-pink-600 transition-all duration-500">
            <div class="h-full bg-zinc-950/90 backdrop-blur-xl p-8 rounded-2xl flex flex-col gap-4">
                <div class="p-3 bg-purple-500/10 text-purple-400 rounded-xl w-fit border border-purple-500/20 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all">
                    <HardDrive class="w-6 h-6" />
                </div>
                <h3 class="text-xl font-bold text-white">Infinite Honeypots</h3>
                <p class="text-sm text-zinc-400 leading-relaxed">Vulnerability scanners targeting `/wp-admin` are trapped in Tarpits. Edge connections hang indefinitely via 1-byte proxy loops, exhausting botnet server threads.</p>
            </div>
        </div>

        <!-- Feature 3 -->
        <div class="group relative p-[1px] rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-950 hover:from-emerald-500 hover:to-teal-600 transition-all duration-500">
            <div class="h-full bg-zinc-950/90 backdrop-blur-xl p-8 rounded-2xl flex flex-col gap-4">
                <div class="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit border border-emerald-500/20 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all">
                    <Lock class="w-6 h-6" />
                </div>
                <h3 class="text-xl font-bold text-white">Zero-Trust JWT Edge</h3>
                <p class="text-sm text-zinc-400 leading-relaxed">Bypass origins completely. High-risk administrative endpoints are isolated via HMAC-SHA256 asymmetric cryptographic checks enforced strictly at the network boundary.</p>
            </div>
        </div>

        <!-- Feature 4 -->
        <div class="group relative p-[1px] rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-950 hover:from-cyan-500 hover:to-blue-600 transition-all duration-500">
            <div class="h-full bg-zinc-950/90 backdrop-blur-xl p-8 rounded-2xl flex flex-col gap-4">
                <div class="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl w-fit border border-cyan-500/20 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
                    <Zap class="w-6 h-6" />
                </div>
                <h3 class="text-xl font-bold text-white">0-ms L7 CDN Cache</h3>
                <p class="text-sm text-zinc-400 leading-relaxed">Static HTTP assets are intercepted and buffered strictly into Redis memory. RAM-bound node routing drops origin server proxy footprint to zero for gigabytes of traffic.</p>
            </div>
        </div>

        <!-- Feature 5 -->
        <div class="group relative p-[1px] rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-950 hover:from-rose-500 hover:to-red-600 transition-all duration-500">
            <div class="h-full bg-zinc-950/90 backdrop-blur-xl p-8 rounded-2xl flex flex-col gap-4">
                <div class="p-3 bg-rose-500/10 text-rose-400 rounded-xl w-fit border border-rose-500/20 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all">
                    <Globe class="w-6 h-6" />
                </div>
                <h3 class="text-xl font-bold text-white">Global Pub/Sub Mesh</h3>
                <p class="text-sm text-zinc-400 leading-relaxed">When an attack happens in Tokyo, nodes in New York become immune in 3 milliseconds via massive ioredis infrastructure event streams.</p>
            </div>
        </div>

        <!-- Feature 6 -->
        <div class="group relative p-[1px] rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-950 hover:from-amber-500 hover:to-orange-600 transition-all duration-500">
            <div class="h-full bg-zinc-950/90 backdrop-blur-xl p-8 rounded-2xl flex flex-col gap-4">
                <div class="p-3 bg-amber-500/10 text-amber-400 rounded-xl w-fit border border-amber-500/20 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all">
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
          <div class="flex items-center gap-4 mt-2">
              <span class="flex items-center gap-1"><Shield class="w-3 h-3"/> Active Defense</span>
              <span class="w-1 h-1 bg-zinc-700 rounded-full"></span>
              <span class="flex items-center gap-1"><Terminal class="w-3 h-3"/> V 0.0.1 ALPHA</span>
          </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { Shield, Github, ArrowRight, BrainCircuit, HardDrive, Lock, Zap, Globe, BarChart3, Terminal } from 'lucide-vue-next';

defineEmits(['go-to-login']);
</script>
