<template>
  <div class="flex items-center justify-center min-h-screen bg-[#000] text-sm">
    <div class="w-full max-w-md p-10 border border-[#1a1a1a] bg-[#050505] rounded-3xl shadow-2xl relative">
      <button @click="$emit('go-back')" class="absolute top-6 left-6 text-[#666] hover:text-white transition-colors" title="Back to Home">
          <ArrowLeft class="w-5 h-5" />
      </button>
      
      <div class="flex justify-center mb-8">
        <ShieldCheck class="w-16 h-16 text-[#f6821f] drop-shadow-[0_0_12px_rgba(246,130,31,0.4)]" />
      </div>
      
      <div class="text-center mb-10">
        <h2 class="text-2xl font-bold text-white mb-2 uppercase tracking-tight">SHIELD<span class="text-[#f6821f]">DOS</span></h2>
        <p class="text-[#888] text-xs font-medium">{{ isRegistering ? 'Create a secure edge account' : 'Sign in to Enterprise Dashboard' }}</p>
      </div>
      
      <form @submit.prevent="authenticate" class="space-y-6">
        <div>
          <label class="block text-[#aaa] text-[11px] font-bold tracking-widest uppercase mb-2">Username / Email</label>
          <input v-model="username" type="text" 
                 class="terminal-input w-full p-3 font-mono" 
                 placeholder="admin" required>
        </div>
        
        <div>
          <label class="block text-[#aaa] text-[11px] font-bold tracking-widest uppercase mb-2">Password</label>
          <input v-model="password" type="password" 
                 class="terminal-input w-full p-3 font-mono" 
                 placeholder="••••••••" required>
        </div>

        <div v-if="error" class="flex items-center gap-3 text-red-400 text-xs font-semibold p-4 border border-red-900/50 rounded-lg bg-red-950/20 backdrop-blur-sm">
          <ShieldAlert class="w-5 h-5 shrink-0" />
          {{ error }}
        </div>

        <button type="submit" :disabled="loading" 
                class="terminal-button w-full flex justify-center items-center gap-2 disabled:opacity-50 mt-4 text-sm tracking-wide">
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          {{ loading ? 'Authenticating...' : (isRegistering ? 'Create Account' : 'Authenticate') }}
        </button>
      </form>
      
      <div class="mt-8 text-center">
        <button @click="isRegistering = !isRegistering" type="button" class="text-xs text-[#888] hover:text-[#f6821f] transition-colors font-medium">
            {{ isRegistering ? 'Already have an account? Sign in' : 'Request Edge Access' }}
        </button>
      </div>
      
      <div class="mt-8 pt-6 border-t border-[#1a1a1a] text-center">
        <p v-if="isDemoMode" class="text-[#666] text-[10px] mb-3 uppercase tracking-widest font-bold">
          Preview credentials: demo / demo
        </p>
        <p class="text-[#444] text-[9px] flex items-center justify-center gap-1.5 uppercase tracking-widest font-bold">
          <Lock class="w-3 h-3 text-[#f6821f]" /> AES-256 Encrypted Connection
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { ShieldCheck, Loader2, ShieldAlert, Lock, ArrowLeft } from 'lucide-vue-next';
import { isDemoMode, enterDemoSession } from '../demo/config';

const username = ref('')
const password = ref('')
const isRegistering = ref(false)
const loading = ref(false)
const error = ref('')

const emit = defineEmits(['login-success', 'go-back'])

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const authenticate = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    if (isDemoMode) {
      if (!username.value.trim() || !password.value.trim()) {
        error.value = 'Please enter credentials';
        return;
      }
      enterDemoSession();
      emit('login-success');
      return;
    }

    const endpoint = isRegistering.value ? '/auth/register' : '/auth/login';
    const res = await axios.post(`${API_URL}${endpoint}`, {
      username: username.value,
      password: password.value
    });
    
    // Save token
    localStorage.setItem('access_token', res.data.access_token);
    
    // Notify parent
    emit('login-success');
    
  } catch (e: any) {
    console.error(e);
    if (e.response && e.response.data && e.response.data.message) {
        error.value = Array.isArray(e.response.data.message) ? e.response.data.message[0] : e.response.data.message;
    } else {
        error.value = isRegistering.value ? 'Registration failed. User may already exist.' : 'Invalid credentials';
    }
  } finally {
    loading.value = false;
  }
}
</script>
