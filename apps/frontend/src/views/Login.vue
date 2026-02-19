<template>
  <div class="flex items-center justify-center min-h-screen bg-slate-900">
    <div class="bg-[#1e293b] p-8 rounded-lg shadow-2xl border border-slate-700 w-full max-w-md">
      <div class="flex justify-center mb-6">
        <ShieldCheck class="w-12 h-12 text-blue-500" />
      </div>
      <h2 class="text-2xl font-bold text-white text-center mb-6">ShieldDOS Login</h2>
      
      <form @submit.prevent="login" class="space-y-4">
        <div>
          <label class="block text-slate-400 text-sm font-medium mb-1">Username</label>
          <input v-model="username" type="text" class="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" placeholder="Enter username" required>
        </div>
        
        <div>
          <label class="block text-slate-400 text-sm font-medium mb-1">Password</label>
          <input v-model="password" type="password" class="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" placeholder="Enter password" required>
        </div>

        <div v-if="error" class="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded border border-red-500/20">
          {{ error }}
        </div>

        <button type="submit" :disabled="loading" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded transition-colors flex justify-center items-center gap-2">
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
      
      <p class="text-center text-slate-500 text-xs mt-6">
        Secure Access Only. Unauthorized attempts are logged.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { ShieldCheck, Loader2 } from 'lucide-vue-next';

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
