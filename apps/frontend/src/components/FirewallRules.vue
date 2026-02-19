<template>
  <TerminalModal @close="$emit('close')">
    <template #title>
        <span class="flex items-center gap-2">
            <ShieldAlert class="w-4 h-4 text-zinc-400" />
            Firewall Rules / {{ siteDomain }}
        </span>
    </template>
    
    <div class="space-y-6">
          <!-- Add Rule Form -->
          <div class="bg-zinc-900 p-4 border border-zinc-800 rounded-lg">
              <h4 class="text-xs font-semibold text-zinc-400 mb-3">Create Rule</h4>
              <div class="grid grid-cols-1 md:grid-cols-12 gap-2">
                  <div class="md:col-span-3">
                      <select v-model="newRule.type" class="w-full bg-zinc-950 border border-zinc-700 p-2 text-white text-xs rounded-md focus:outline-none focus:border-zinc-500">
                          <option value="BLOCK_IP">Block IP</option>
                          <option value="BLOCK_COUNTRY">Block Country</option>
                          <option value="RATE_LIMIT">Rate Limit</option>
                          <option value="ALLOW_IP">Allow IP</option>
                          <option value="CHALLENGE">JS Challenge</option>
                      </select>
                  </div>
                  <div class="md:col-span-7">
                      <input v-model="newRule.value" type="text" :placeholder="newRule.type === 'BLOCK_COUNTRY' ? 'Country Code (e.g. RO)' : 'Value (e.g. 1.2.3.4)'" class="terminal-input w-full p-2 text-xs">
                  </div>
                  <div class="md:col-span-2">
                      <button @click="addRule" :disabled="loading || !newRule.value" class="w-full h-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold rounded-md transition-colors disabled:opacity-50">
                          Add
                      </button>
                  </div>
              </div>
          </div>

          <!-- Rules List -->
          <div>
            <h4 class="text-xs font-semibold text-zinc-400 mb-3">Active Rules</h4>
            
            <div v-if="loading" class="flex justify-center py-8">
                <Loader2 class="w-6 h-6 animate-spin text-zinc-600" />
            </div>
            
            <div v-else-if="rules.length === 0" class="text-center py-6 text-zinc-500 text-xs border border-zinc-800 rounded-lg">
                No active rules
            </div>
            
            <div v-else class="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                <div v-for="rule in rules" :key="rule.id" class="flex items-center justify-between p-2 bg-zinc-900 border border-zinc-800 rounded-md hover:border-zinc-600 transition-colors group">
                    <div class="flex items-center gap-3">
                        <div :class="{
                            'text-red-500': rule.type.includes('BLOCK'),
                            'text-green-500': rule.type.includes('ALLOW'),
                            'text-yellow-500': rule.type === 'CHALLENGE' || rule.type === 'RATE_LIMIT'
                        }">
                            <ShieldAlert v-if="rule.type.includes('BLOCK')" class="w-3 h-3" />
                            <CheckCircle v-else-if="rule.type.includes('ALLOW')" class="w-3 h-3" />
                            <AlertTriangle v-else class="w-3 h-3" />
                        </div>
                        <div>
                            <p class="text-sm font-semibold text-white capitalize">
                                {{ formatType(rule.type) }} <span class="font-mono text-zinc-400 normal-case">: {{ rule.value }}</span>
                            </p>
                            <p class="text-xs text-zinc-500">
                                {{ rule.hits }} hits &bull; {{ new Date(rule.createdAt).toLocaleDateString() }}
                            </p>
                        </div>
                    </div>
                    <button @click="deleteRule(rule.id)" class="text-zinc-600 hover:text-red-500 p-1 transition-colors opacity-0 group-hover:opacity-100" title="Remove">
                        <Trash2 class="w-3 h-3" />
                    </button>
                </div>
            </div>
          </div>
      </div>
  </TerminalModal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { X, Plus, Trash2, ShieldAlert, Loader2, CheckCircle, AlertTriangle } from 'lucide-vue-next';
import TerminalModal from './TerminalModal.vue';

const props = defineProps<{
  siteId: string,
  siteDomain: string
}>();

defineEmits(['close']);

const rules = ref<any[]>([]);
const loading = ref(true);
const newRule = ref({ type: 'BLOCK_IP', value: '' });

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const fetchRules = async () => {
    loading.value = true;
    try {
        const res = await axios.get(`${API_URL}/sites/${props.siteId}/rules`);
        rules.value = res.data;
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
}

const addRule = async () => {
    if (!newRule.value.value) return;
    loading.value = true;
    try {
        await axios.post(`${API_URL}/sites/${props.siteId}/rules`, newRule.value);
        newRule.value.value = ''; // Reset
        await fetchRules();
    } catch (e) {
        console.error(e);
        alert('Failed to add rule');
    } finally {
        loading.value = false;
    }
}

const deleteRule = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
        await axios.delete(`${API_URL}/sites/${props.siteId}/rules/${id}`);
        await fetchRules();
    } catch (e) { console.error(e); }
}

const formatType = (type: string) => {
    return type.replace(/_/g, ' ');
}

onMounted(() => {
    fetchRules();
});
</script>
