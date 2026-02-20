<template>
  <div class="h-full">
    <div class="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
        <span class="flex items-center gap-2 text-white font-bold text-sm">
            <ShieldAlert class="w-4 h-4 text-emerald-500" />
            Firewall Rules / {{ siteDomain }}
        </span>
        <button @click="$emit('close')" class="text-zinc-500 hover:text-white transition-colors">
            <X class="w-4 h-4" />
        </button>
    </div>
    
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
                          <option value="CUSTOM_RULE">Advanced Custom Rule</option>
                      </select>
                  </div>
                  <div class="md:col-span-7">
                      <input v-if="newRule.type !== 'CUSTOM_RULE'" v-model="newRule.value" type="text" :placeholder="newRule.type === 'BLOCK_COUNTRY' ? 'Country Code (e.g. RO)' : 'Value (e.g. 1.2.3.4)'" class="terminal-input w-full p-2 text-xs">
                      
                      <div v-else class="flex flex-col gap-2">
                          <div class="flex gap-2">
                              <select v-model="customRule.action" class="bg-zinc-950 border border-zinc-700 p-2 text-white text-xs rounded-md">
                                  <option value="BLOCK">Block</option>
                                  <option value="CHALLENGE">Challenge</option>
                              </select>
                              <select v-model="customRule.field" class="bg-zinc-950 border border-zinc-700 p-2 text-white text-xs rounded-md flex-1">
                                  <option value="path">URI Path</option>
                                  <option value="header">HTTP Header</option>
                                  <option value="query">Query Parameter</option>
                              </select>
                          </div>
                           <div class="flex gap-2" v-if="customRule.field === 'header'">
                              <input v-model="customRule.headerName" type="text" placeholder="Header Name (e.g. User-Agent)" class="terminal-input w-full p-2 text-xs">
                          </div>
                          <div class="flex gap-2" v-if="customRule.field === 'query'">
                              <input v-model="customRule.queryName" type="text" placeholder="Query Name (e.g. id)" class="terminal-input w-full p-2 text-xs">
                          </div>
                          <div class="flex gap-2">
                              <select v-model="customRule.operator" class="bg-zinc-950 border border-zinc-700 p-2 text-white text-xs rounded-md">
                                  <option value="contains">Contains</option>
                                  <option value="equals">Equals</option>
                                  <option value="starts_with">Starts With</option>
                              </select>
                              <input v-model="customRule.match" type="text" placeholder="Match string..." class="terminal-input w-full p-2 text-xs flex-1">
                          </div>
                      </div>
                  </div>
                  <div class="md:col-span-2">
                      <button @click="addRule" :disabled="loading || (!newRule.value && newRule.type !== 'CUSTOM_RULE') || (newRule.type === 'CUSTOM_RULE' && !customRule.match)" class="w-full h-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold rounded-md transition-colors disabled:opacity-50 min-h-[38px]">
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
                            'text-red-500': rule.type.includes('BLOCK') || (rule.type === 'CUSTOM_RULE' && rule.value.includes('BLOCK')),
                            'text-green-500': rule.type.includes('ALLOW'),
                            'text-yellow-500': rule.type === 'CHALLENGE' || rule.type === 'RATE_LIMIT' || (rule.type === 'CUSTOM_RULE' && rule.value.includes('CHALLENGE'))
                        }">
                            <ShieldAlert v-if="rule.type.includes('BLOCK') || (rule.type === 'CUSTOM_RULE' && rule.value.includes('BLOCK'))" class="w-3 h-3" />
                            <CheckCircle v-else-if="rule.type.includes('ALLOW')" class="w-3 h-3" />
                            <AlertTriangle v-else class="w-3 h-3" />
                        </div>
                        <div class="flex-1 overflow-hidden">
                            <p class="text-sm font-semibold text-white capitalize break-all">
                                {{ formatType(rule.type) }} <span class="font-mono text-zinc-400 normal-case">: {{ formatRuleValue(rule.type, rule.value) }}</span>
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

const customRule = ref({
    action: 'BLOCK',
    field: 'path',
    headerName: '',
    queryName: '',
    operator: 'contains',
    match: ''
});

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
    if (newRule.value.type === 'CUSTOM_RULE') {
        if (!customRule.value.match) return;
        newRule.value.value = JSON.stringify(customRule.value);
    } else {
        if (!newRule.value.value) return;
    }

    loading.value = true;
    try {
        await axios.post(`${API_URL}/sites/${props.siteId}/rules`, newRule.value);
        newRule.value.value = ''; // Reset
        customRule.value.match = ''; // Reset custom
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
    if (type === 'CUSTOM_RULE') return 'Advanced Rule';
    return type.replace(/_/g, ' ');
}

const formatRuleValue = (type: string, value: string) => {
    if (type === 'CUSTOM_RULE') {
        try {
            const parsed = JSON.parse(value);
            return `[${parsed.action}] If ${parsed.field}${parsed.headerName ? `(${parsed.headerName})` : ''}${parsed.queryName ? `(${parsed.queryName})` : ''} ${parsed.operator} "${parsed.match}"`;
        } catch {
            return value;
        }
    }
    return value;
}

onMounted(() => {
    fetchRules();
});
</script>
