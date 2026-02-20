<template>
  <div class="flex items-center justify-center min-h-screen bg-zinc-950 text-sm">
    <div class="w-full max-w-md p-8 border border-zinc-800 bg-zinc-950 rounded-xl shadow-lg relative">
      <div class="flex justify-center mb-8">
        <ShieldCheck class="w-16 h-16 text-white stroke-1" />
      </div>
      
      <div class="text-center mb-10">
        <h2 class="text-2xl font-bold text-white mb-2 uppercase tracking-widest">SHIELD<span class="text-zinc-600">DOS</span></h2>
        <p class="text-zinc-500 text-xs">{{ isRegistering ? 'Create a secure edge account' : 'Sign in to your dashboard' }}</p>
      </div>
      
      <form @submit.prevent="authenticate" class="space-y-6">
        <div>
          <label class="block text-zinc-500 text-xs font-semibold mb-2">Username</label>
          <input v-model="username" type="text" 
                 class="terminal-input w-full p-3 border focus:border-zinc-500" 
                 placeholder="Enter your username" required>
        </div>
        
        <div>
          <label class="block text-zinc-500 text-xs font-semibold mb-2">Password</label>
          <input v-model="password" type="password" 
                 class="terminal-input w-full p-3 border focus:border-zinc-500" 
                 placeholder="Enter your password" required>
        </div>

        <div v-if="error" class="flex items-center gap-2 text-red-500 text-xs font-bold p-3 border border-red-900 rounded-md bg-red-900/10">
          <ShieldAlert class="w-4 h-4 shrink-0" />
          {{ error }}
        </div>

        <button type="submit" :disabled="loading" 
                class="w-full bg-white hover:bg-zinc-200 text-black font-semibold py-3 rounded-md transition-colors flex justify-center items-center gap-2 disabled:opacity-50 mt-4 text-sm">
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          {{ loading ? 'Authenticating...' : (isRegistering ? 'Sign Up' : 'Sign In') }}
        </button>
      </form>
      
      <div class="mt-6 text-center">
        <button @click="isRegistering = !isRegistering" type="button" class="text-xs text-blue-500 hover:text-blue-400 transition-colors font-semibold">
            {{ isRegistering ? 'Already have an account? Sign in' : 'Create an account' }}
        </button>
      </div>
      
      <div class="mt-8 pt-6 border-t border-zinc-900 text-center">
        <p class="text-zinc-600 text-[10px] flex items-center justify-center gap-1 uppercase tracking-wider">
          <Lock class="w-3 h-3" /> Secure Connection
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
const isRegistering = ref(false)
const loading = ref(false)
const error = ref('')

const emit = defineEmits(['login-success'])

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const authenticate = async () => {
  loading.value = true;
  error.value = '';
  
  try {
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
