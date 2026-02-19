<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div class="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
      <div class="p-6 border-b border-slate-800 flex justify-between items-center">
        <h3 class="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert class="w-5 h-5 text-red-500" />
            Firewall Rules: {{ siteDomain }}
        </h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-white">
          <X class="w-6 h-6" />
        </button>
      </div>

      <div class="p-6 overflow-y-auto flex-1">
          <!-- Add Rule Form -->
          <div class="bg-slate-800/50 p-4 rounded-lg border border-slate-700 mb-6">
              <h4 class="text-sm font-medium text-slate-300 mb-3">Add New Rule</h4>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <select v-model="newRule.type" class="bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm">
                      <option value="BLOCK_IP">Block IP</option>
                      <option value="BLOCK_COUNTRY">Block Country</option>
                      <option value="RATE_LIMIT">Rate Limit</option>
                      <option value="ALLOW_IP">Allow IP</option>
                      <option value="CHALLENGE">JS Challenge</option>
                  </select>
                  <input v-model="newRule.value" type="text" placeholder="Value (e.g. 1.2.3.4 or RO)" class="bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm col-span-2">
                  <button @click="addRule" :disabled="loading" class="bg-blue-600 hover:bg-blue-500 text-white rounded p-2 text-sm font-medium flex justify-center items-center">
                      <Plus class="w-4 h-4 mr-1" /> Add
                  </button>
              </div>
          </div>

          <!-- Rules List -->
          <div v-if="loading" class="flex justify-center py-8">
              <Loader2 class="w-8 h-8 animate-spin text-blue-500" />
          </div>
          <div v-else-if="rules.length === 0" class="text-center py-8 text-slate-500">
              No firewall rules configured.
          </div>
          <div v-else class="space-y-2">
              <div v-for="rule in rules" :key="rule.id" class="flex items-center justify-between p-3 bg-slate-800/30 rounded border border-slate-700/50 group hover:border-slate-600 transition-colors">
                  <div class="flex items-center gap-3">
                      <div :class="{
                          'bg-red-500/10 text-red-400': rule.type.includes('BLOCK'),
                          'bg-green-500/10 text-green-400': rule.type.includes('ALLOW'),
                          'bg-yellow-500/10 text-yellow-400': rule.type === 'CHALLENGE' || rule.type === 'RATE_LIMIT'
                      }" class="p-1.5 rounded">
                          <ShieldAlert v-if="rule.type.includes('BLOCK')" class="w-4 h-4" />
                          <CheckCircle v-else-if="rule.type.includes('ALLOW')" class="w-4 h-4" />
                          <AlertTriangle v-else class="w-4 h-4" />
                      </div>
                      <div>
                          <p class="text-sm font-medium text-slate-200">
                              {{ formatType(rule.type) }}
                              <span class="text-slate-500 mx-1">•</span>
                              <span class="font-mono text-xs bg-slate-700 px-1.5 py-0.5 rounded">{{ rule.value }}</span>
                          </p>
                          <p class="text-xs text-slate-500">Hits: {{ rule.hits }} • Created: {{ new Date(rule.createdAt).toLocaleDateString() }}</p>
                      </div>
                  </div>
                  <button @click="deleteRule(rule.id)" class="bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 p-2 rounded transition-colors" title="Delete Rule">
                      <Trash2 class="w-4 h-4" />
                  </button>
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
