<template>
  <div class="h-full font-sans">
    <div class="flex items-center justify-between mb-6 pb-4 border-b border-[#1a1a1a]">
        <span class="flex items-center gap-2 text-white font-bold text-sm tracking-wide">
            <ShieldAlert class="w-4 h-4 text-[#f6821f]" />
            Visually Construct WAF Rule
        </span>
    </div>
    
    <div class="space-y-6">
        <!-- Add Rule Form -->
        <div class="bg-[#050505] p-5 border border-[#1a1a1a] rounded-xl shadow-inner relative overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-r from-[#f6821f]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <h4 class="text-[11px] font-bold text-[#888] uppercase tracking-widest mb-4">Rule Builder</h4>
            
            <div class="space-y-4 relative z-10">
                
                <!-- Action Row -->
                <div class="flex items-center gap-3">
                    <span class="text-xs font-bold text-white uppercase tracking-wider w-16">Action</span>
                    <select v-model="newRule.action" class="bg-[#0a0a0a] border border-[#222222] p-2 text-white text-xs font-bold rounded-lg focus:outline-none focus:border-[#f6821f] transition-all w-48 shadow-sm">
                        <option value="BLOCK" class="text-red-400">Block</option>
                        <option value="CHALLENGE" class="text-[#f6821f]">Managed Challenge</option>
                        <option value="LOG" class="text-blue-400">Log (Simulate)</option>
                        <option value="ALLOW" class="text-green-400">Allow</option>
                    </select>
                </div>

                <!-- Condition Row -->
                <div class="bg-[#0a0a0a] border border-[#222222] p-4 rounded-lg space-y-3">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-white uppercase tracking-wider w-12">If</span>
                        <select v-model="newRule.field" class="bg-[#111111] border border-[#333333] p-2 px-3 text-[#ddd] text-xs font-bold rounded-md focus:border-[#f6821f] transition-all w-40">
                            <option value="country">Country</option>
                            <option value="ip">IP Address</option>
                            <option value="path">URI Path</option>
                            <option value="header">HTTP Header</option>
                            <option value="query">Query Parameter</option>
                        </select>

                        <select v-model="newRule.operator" class="bg-[#111111] border border-[#333333] p-2 px-3 text-[#f6821f] text-xs font-bold rounded-md focus:border-[#f6821f] transition-all flex-1 max-w-[140px]">
                            <option value="contains" v-if="newRule.field !== 'country' && newRule.field !== 'ip'">contains</option>
                            <option value="equals">equals</option>
                            <option value="starts_with" v-if="newRule.field !== 'country' && newRule.field !== 'ip'">starts with</option>
                            <option value="not_equals">does not equal</option>
                        </select>

                        <input v-model="newRule.match" type="text" placeholder="Value..." class="flex-1 bg-[#050505] border border-[#222222] text-[#f5f5f5] placeholder-[#555] font-mono focus:outline-none focus:border-[#f6821f] transition-all rounded-md px-3 py-2 text-xs shadow-inner">
                    </div>

                    <!-- Additional Context based on field -->
                    <div v-if="newRule.field === 'header' || newRule.field === 'query'" class="flex items-center gap-2 pl-[56px] text-xs animate-in fade-in slide-in-from-top-1 duration-200">
                      <span class="text-[#666] font-mono font-bold">{{ newRule.field === 'header' ? 'Header Name:' : 'Query Param:' }}</span>
                      <input v-model="newRule.subField" type="text" placeholder="e.g. User-Agent or id" class="bg-[#050505] border border-[#222222] text-[#eee] font-mono rounded-md px-2 py-1 focus:border-[#f6821f] focus:outline-none">
                    </div>
                </div>

                <div class="flex justify-end pt-2">
                    <button @click="addRule" :disabled="loading || !newRule.match" class="terminal-button text-xs gap-2 min-w-[140px] flex justify-center">
                        <Plus class="w-4 h-4" /> Deploy Rule
                    </button>
                </div>
            </div>
        </div>

        <!-- Rules List -->
        <div>
          <h4 class="text-[11px] font-bold text-[#888] uppercase tracking-widest mb-3">Live Edge Rules</h4>
          
          <div v-if="loading" class="flex justify-center py-8">
              <Loader2 class="w-6 h-6 animate-spin text-[#f6821f]" />
          </div>
          
          <div v-else-if="rules.length === 0" class="text-center py-8 text-[#555] text-xs border border-[#1a1a1a] border-dashed rounded-xl bg-[#0a0a0a]/50">
              No custom rules deployed to the edge.
          </div>
          
          <div v-else class="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              <div v-for="rule in rules" :key="rule.id" class="flex flex-col p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl hover:border-[#333] transition-colors group relative overflow-hidden">
                  <div class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" :class="{
                      'bg-red-500': ruleAction(rule) === 'BLOCK',
                      'bg-[#f6821f]': ruleAction(rule) === 'CHALLENGE',
                      'bg-green-500': ruleAction(rule) === 'ALLOW',
                      'bg-blue-500': ruleAction(rule) === 'LOG'
                  }"></div>
                  <div class="flex items-center justify-between pl-3">
                      <div class="flex items-start gap-4">
                          <div class="flex flex-col gap-1">
                              <span class="text-xs font-bold text-white uppercase flex items-center gap-1.5" :class="{
                                'text-red-400': ruleAction(rule) === 'BLOCK',
                                'text-[#f6821f]': ruleAction(rule) === 'CHALLENGE',
                                'text-green-400': ruleAction(rule) === 'ALLOW',
                                'text-blue-400': ruleAction(rule) === 'LOG'
                              }">
                                 {{ ruleAction(rule) }}
                              </span>
                              <div class="bg-[#111] border border-[#222] rounded-md px-2 py-1 text-xs font-mono text-[#ddd] flex items-center gap-1.5 mt-1">
                                  <span class="text-[#f6821f] font-bold">{{ ruleField(rule) }}<span v-if="ruleSubField(rule)">({{ ruleSubField(rule) }})</span></span>
                                  <span class="text-[#888]">{{ ruleOperator(rule) }}</span>
                                  <span class="text-white">"{{ ruleMatch(rule) }}"</span>
                              </div>
                          </div>
                      </div>
                      <div class="flex flex-col items-end gap-2">
                        <button @click="deleteRule(rule.id)" class="text-[#555] hover:text-red-500 p-1.5 rounded bg-[#111] hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100" title="Delete Rule">
                            <Trash2 class="w-4 h-4" />
                        </button>
                        <p class="text-[10px] text-[#666] font-mono">
                            {{ rule.hits || 0 }} hits &bull; {{ new Date(rule.createdAt).toLocaleDateString() }}
                        </p>
                      </div>
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
import { Plus, Trash2, ShieldAlert, Loader2 } from 'lucide-vue-next';

const props = defineProps<{
  siteId: string,
  siteDomain: string
}>();

const emit = defineEmits(['close']);

const rules = ref<any[]>([]);
const loading = ref(true);

const newRule = ref({
    action: 'BLOCK',
    field: 'country',
    operator: 'equals',
    match: '',
    subField: ''
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
    loading.value = true;
    
    let payload = { type: '', value: '' }; // Translate to old logic
    
    if (newRule.value.field === 'ip' && newRule.value.operator === 'equals') {
        payload.type = newRule.value.action === 'BLOCK' ? 'BLOCK_IP' : (newRule.value.action === 'ALLOW' ? 'ALLOW_IP' : 'CUSTOM_RULE');
        payload.value = payload.type === 'CUSTOM_RULE' ? JSON.stringify(newRule.value) : newRule.value.match;
    } else if (newRule.value.field === 'country' && newRule.value.operator === 'equals') {
        payload.type = newRule.value.action === 'BLOCK' ? 'BLOCK_COUNTRY' : 'CUSTOM_RULE';
        payload.value = payload.type === 'CUSTOM_RULE' ? JSON.stringify(newRule.value) : newRule.value.match;
    } else {
        payload.type = 'CUSTOM_RULE';
        // For backwards compat with backend matching
        const advancedPayload = {
            action: newRule.value.action,
            field: newRule.value.field,
            operator: newRule.value.operator,
            match: newRule.value.match,
            headerName: newRule.value.field === 'header' ? newRule.value.subField : undefined,
            queryName: newRule.value.field === 'query' ? newRule.value.subField : undefined
        };
        payload.value = JSON.stringify(advancedPayload);
    }

    try {
        await axios.post(`${API_URL}/sites/${props.siteId}/rules`, payload);
        newRule.value.match = ''; // Reset UI
        await fetchRules();
    } catch (e) {
        console.error(e);
        alert('Failed to deploy rule to edge');
    } finally {
        loading.value = false;
    }
}

const deleteRule = async (id: string) => {
    if (!confirm('Permanently delete this firewall rule?')) return;
    try {
        await axios.delete(`${API_URL}/sites/${props.siteId}/rules/${id}`);
        await fetchRules();
    } catch (e) { console.error(e); }
}

const ruleAction = (rule: any) => {
    if (rule.type.includes('ALLOW')) return 'ALLOW';
    if (rule.type === 'CHALLENGE') return 'CHALLENGE';
    if (rule.type === 'BLOCK_IP' || rule.type === 'BLOCK_COUNTRY') return 'BLOCK';
    if (rule.type === 'CUSTOM_RULE') {
        try { return JSON.parse(rule.value).action || 'BLOCK'; } catch { return 'BLOCK'; }
    }
    return 'BLOCK';
}

const ruleField = (rule: any) => {
    if (rule.type === 'BLOCK_IP' || rule.type === 'ALLOW_IP') return 'ip';
    if (rule.type === 'BLOCK_COUNTRY') return 'country';
    if (rule.type === 'CUSTOM_RULE') {
        try { return JSON.parse(rule.value).field || 'unknown'; } catch { return 'unknown'; }
    }
    return 'ip';
}

const ruleSubField = (rule: any) => {
    if (rule.type === 'CUSTOM_RULE') {
        try { 
            const parsed = JSON.parse(rule.value);
            return parsed.headerName || parsed.queryName || '';
        } catch { return ''; }
    }
    return '';
}

const ruleOperator = (rule: any) => {
    if (rule.type !== 'CUSTOM_RULE') return 'equals';
    try { return JSON.parse(rule.value).operator || 'equals'; } catch { return 'equals'; }
}

const ruleMatch = (rule: any) => {
    if (rule.type !== 'CUSTOM_RULE') return rule.value;
    try { return JSON.parse(rule.value).match || rule.value; } catch { return rule.value; }
}

onMounted(() => {
    fetchRules();
});
</script>
