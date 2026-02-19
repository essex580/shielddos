<template>
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="glass-card w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-700/50 shadow-2xl relative overflow-hidden">
      <!-- Glow effect -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div class="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 relative z-10">
        <div>
            <h3 class="text-xl font-bold text-white flex items-center gap-2">
                <ShieldAlert class="w-6 h-6 text-rose-500" />
                Firewall Rules
            </h3>
            <p class="text-xs text-slate-400 mt-1 font-mono">{{ siteDomain }}</p>
        </div>
        <button @click="$emit('close')" class="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-6 overflow-y-auto flex-1 relative z-10 space-y-6">
          <!-- Add Rule Form -->
          <div class="bg-black/30 p-5 rounded-xl border border-white/10">
              <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Plus class="w-4 h-4" /> Add New Rule
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div class="md:col-span-3">
                      <select v-model="newRule.type" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors">
                          <option value="BLOCK_IP">Block IP</option>
                          <option value="BLOCK_COUNTRY">Block Country</option>
                          <option value="RATE_LIMIT">Rate Limit</option>
                          <option value="ALLOW_IP">Allow IP</option>
                          <option value="CHALLENGE">JS Challenge</option>
                      </select>
                  </div>
                  <div class="md:col-span-7">
                      <input v-model="newRule.value" type="text" :placeholder="newRule.type === 'BLOCK_COUNTRY' ? 'Country Code (e.g. RO, US, CN)' : 'Value (e.g. 1.2.3.4)'" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-600">
                  </div>
                  <div class="md:col-span-2">
                      <button @click="addRule" :disabled="loading || !newRule.value" class="w-full h-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold flex justify-center items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                          Add
                      </button>
                  </div>
              </div>
          </div>

          <!-- Rules List -->
          <div>
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Active Rules</h4>
            
            <div v-if="loading" class="flex justify-center py-12">
                <Loader2 class="w-8 h-8 animate-spin text-blue-500" />
            </div>
            
            <div v-else-if="rules.length === 0" class="text-center py-12 text-slate-500 bg-black/20 rounded-xl border border-dashed border-slate-800">
                <ShieldAlert class="w-8 h-8 opacity-20 mx-auto mb-2" />
                No firewall rules configured.
            </div>
            
            <div v-else class="space-y-3">
                <div v-for="rule in rules" :key="rule.id" class="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                    <div class="flex items-center gap-4">
                        <div :class="{
                            'bg-rose-500/10 text-rose-400': rule.type.includes('BLOCK'),
                            'bg-emerald-500/10 text-emerald-400': rule.type.includes('ALLOW'),
                            'bg-amber-500/10 text-amber-400': rule.type === 'CHALLENGE' || rule.type === 'RATE_LIMIT'
                        }" class="p-2 rounded-lg">
                            <ShieldAlert v-if="rule.type.includes('BLOCK')" class="w-5 h-5" />
                            <CheckCircle v-else-if="rule.type.includes('ALLOW')" class="w-5 h-5" />
                            <AlertTriangle v-else class="w-5 h-5" />
                        </div>
                        <div>
                            <p class="text-sm font-bold text-white flex items-center gap-2">
                                {{ formatType(rule.type) }}
                                <span class="px-1.5 py-0.5 rounded text-[10px] bg-slate-700 text-slate-300 font-mono">{{ rule.value }}</span>
                            </p>
                            <p class="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                <span>{{ rule.hits }} Hits</span>
                                <span class="w-1 h-1 rounded-full bg-slate-700"></span>
                                <span>{{ new Date(rule.createdAt).toLocaleDateString() }}</span>
                            </p>
                        </div>
                    </div>
                    <button @click="deleteRule(rule.id)" class="text-slate-500 hover:text-rose-400 p-2 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="Delete Rule">
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
