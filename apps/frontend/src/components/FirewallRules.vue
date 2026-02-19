<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div class="bg-slate-900 border border-slate-700 rounded w-full max-w-3xl shadow-xl max-h-[90vh] flex flex-col">
      <div class="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800">
        <div>
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert class="w-5 h-5 text-slate-400" />
                Firewall Rules
            </h3>
            <p class="text-xs text-slate-500 mt-1">{{ siteDomain }}</p>
        </div>
        <button @click="$emit('close')" class="text-slate-400 hover:text-white">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-6 overflow-y-auto flex-1 space-y-6 bg-[#0f172a]">
          <!-- Add Rule Form -->
          <div class="bg-slate-800 p-4 rounded border border-slate-700">
              <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Create Rule</h4>
              <div class="grid grid-cols-1 md:grid-cols-12 gap-2">
                  <div class="md:col-span-3">
                      <select v-model="newRule.type" class="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm focus:outline-none focus:border-blue-500">
                          <option value="BLOCK_IP">Block IP</option>
                          <option value="BLOCK_COUNTRY">Block Country</option>
                          <option value="RATE_LIMIT">Rate Limit</option>
                          <option value="ALLOW_IP">Allow IP</option>
                          <option value="CHALLENGE">JS Challenge</option>
                      </select>
                  </div>
                  <div class="md:col-span-7">
                      <input v-model="newRule.value" type="text" :placeholder="newRule.type === 'BLOCK_COUNTRY' ? 'Country Code (e.g. RO)' : 'Value (e.g. 1.2.3.4)'" class="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm focus:outline-none focus:border-blue-500">
                  </div>
                  <div class="md:col-span-2">
                      <button @click="addRule" :disabled="loading || !newRule.value" class="w-full h-full bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium transition-colors disabled:opacity-50">
                          Add Rule
                      </button>
                  </div>
              </div>
          </div>

          <!-- Rules List -->
          <div>
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Existing Rules</h4>
            
            <div v-if="loading" class="flex justify-center py-8">
                <Loader2 class="w-6 h-6 animate-spin text-blue-500" />
            </div>
            
            <div v-else-if="rules.length === 0" class="text-center py-8 text-slate-500 bg-slate-800/50 rounded border border-dashed border-slate-700">
                No active rules.
            </div>
            
            <div v-else class="space-y-2">
                <div v-for="rule in rules" :key="rule.id" class="flex items-center justify-between p-3 bg-slate-800 rounded border border-slate-700 hover:border-slate-600 transition-colors">
                    <div class="flex items-center gap-3">
                        <div :class="{
                            'text-rose-400': rule.type.includes('BLOCK'),
                            'text-emerald-400': rule.type.includes('ALLOW'),
                            'text-amber-400': rule.type === 'CHALLENGE' || rule.type === 'RATE_LIMIT'
                        }">
                            <ShieldAlert v-if="rule.type.includes('BLOCK')" class="w-4 h-4" />
                            <CheckCircle v-else-if="rule.type.includes('ALLOW')" class="w-4 h-4" />
                            <AlertTriangle v-else class="w-4 h-4" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-white">
                                {{ formatType(rule.type) }}: <span class="font-mono text-slate-300">{{ rule.value }}</span>
                            </p>
                            <p class="text-xs text-slate-500">
                                {{ rule.hits }} hits • Added {{ new Date(rule.createdAt).toLocaleDateString() }}
                            </p>
                        </div>
                    </div>
                    <button @click="deleteRule(rule.id)" class="text-slate-500 hover:text-rose-400 p-2 transition-colors" title="Remove">
                        <Trash2 class="w-4 h-4" />
                    </button>
                </div>
            </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { X, Plus, Trash2, ShieldAlert, Loader2, CheckCircle, AlertTriangle } from 'lucide-vue-next';

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
