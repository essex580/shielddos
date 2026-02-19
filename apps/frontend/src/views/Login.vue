<template>
  <div class="flex items-center justify-center min-h-screen bg-[#020617] relative overflow-hidden">
    <!-- Background Effects -->
    <div class="absolute inset-0 z-0">
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
    </div>

    <div class="glass-card p-10 rounded-2xl w-full max-w-md relative z-10 border border-slate-700/50">
      <div class="flex justify-center mb-8 relative">
        <div class="absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full"></div>
        <ShieldCheck class="w-16 h-16 text-blue-500 relative z-10" />
      </div>
      
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-white tracking-tight mb-2">Welcome Back</h2>
        <p class="text-slate-400 text-sm">Sign in to access your protection dashboard</p>
      </div>
      
      <form @submit.prevent="login" class="space-y-5">
        <div class="space-y-1.5">
          <label class="block text-slate-300 text-xs font-semibold uppercase tracking-wider ml-1">Username</label>
          <input v-model="username" type="text" 
                 class="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition-all duration-200" 
                 placeholder="Enter your username" required>
        </div>
        
        <div class="space-y-1.5">
          <label class="block text-slate-300 text-xs font-semibold uppercase tracking-wider ml-1">Password</label>
          <input v-model="password" type="password" 
                 class="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition-all duration-200" 
                 placeholder="••••••••" required>
        </div>

        <div v-if="error" class="flex items-center gap-2 text-red-400 text-sm p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <ShieldAlert class="w-4 h-4 shrink-0" />
          {{ error }}
        </div>

        <button type="submit" :disabled="loading" 
                class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-lg transition-all duration-200 shadow-lg shadow-blue-900/20 hover:shadow-blue-600/30 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2">
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          {{ loading ? 'Authenticating...' : 'Sign In' }}
        </button>
      </form>
      
      <div class="mt-8 pt-6 border-t border-slate-700/30 text-center">
        <p class="text-slate-500 text-xs flex items-center justify-center gap-1">
          <Lock class="w-3 h-3" /> Secure Enterprise Access
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { ShieldCheck, Loader2, ShieldAlert, Lock } from 'lucide-vue-next';

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const emit = defineEmits(['login-success'])

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const login = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const res = await axios.post(`${API_URL}/auth/login`, {
      username: username.value,
      password: password.value
    });
    
    // Save token
    localStorage.setItem('access_token', res.data.access_token);
    
    // Notify parent
    emit('login-success');
    
  } catch (e: any) {
    console.error(e);
    error.value = 'Invalid credentials';
  } finally {
    loading.value = false;
  }
}
</script>
