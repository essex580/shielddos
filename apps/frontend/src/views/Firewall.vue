<template>
  <div class="p-6 space-y-6 max-w-full font-mono text-sm">
    
    <header class="flex justify-between items-end pb-4 border-b border-[color:var(--border-subtle)]">
      <div>
        <h2 class="text-xl font-bold text-[color:var(--text-main)] flex items-center gap-3">
          <ShieldAlert class="w-5 h-5 text-red-500" /> Web Application Firewall
        </h2>
        <p class="text-[color:var(--text-muted)] mt-1 text-xs">Manage custom firewall rules and rate limits across the edge network.</p>
      </div>
      <button @click="showCreateModal = true" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2">
        <Plus class="w-4 h-4" /> Create Rule
      </button>
    </header>

    <div v-if="loading" class="flex justify-center py-12">
        <Loader2 class="w-6 h-6 animate-spin text-blue-500" />
    </div>

    <!-- Rules List -->
    <div v-else class="space-y-4">
        <div v-if="rules.length === 0" class="text-center py-12 border border-dashed border-[color:var(--border-subtle)] rounded-xl text-[color:var(--text-muted)]">
            <Shield class="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p>No custom WAF rules defined.</p>
            <p class="text-xs mt-1">Traffic is only filtered by global bot protection and rate limits.</p>
        </div>

        <div v-for="rule in rules" :key="rule.id" class="terminal-card p-4 border border-[color:var(--border-subtle)] flex items-center justify-between transition-colors hover:border-[color:var(--border-color)]">
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-lg bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] flex items-center justify-center">
                    <Activity v-if="rule.action === 'block'" class="w-5 h-5 text-red-500" />
                    <HelpCircle v-else-if="rule.action === 'challenge'" class="w-5 h-5 text-amber-500" />
                    <CheckCircle v-else class="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                    <h3 class="font-bold text-[color:var(--text-main)] text-sm">{{ rule.name }}</h3>
                    <div class="flex items-center gap-2 mt-1 text-xs text-[color:var(--text-muted)]">
                        <span class="font-bold text-blue-400">{{ rule.field }}</span>
                        <span class="italic">{{ rule.operator }}</span>
                        <span class="bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] px-1.5 py-0.5 rounded text-[color:var(--text-main)]">{{ rule.value }}</span>
                    </div>
                </div>
            </div>
            
            <div class="flex items-center gap-6">
                <div class="flex flex-col items-end">
                    <span class="text-[10px] uppercase tracking-wider text-[color:var(--text-muted)] font-bold mb-1">Action</span>
                    <span class="text-xs font-bold px-2 py-1 rounded" :class="{
                        'bg-red-500/10 text-red-500 border border-red-500/20': rule.action === 'block',
                        'bg-amber-500/10 text-amber-500 border border-amber-500/20': rule.action === 'challenge',
                        'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20': rule.action === 'bypass',
                    }">{{ rule.action.toUpperCase() }}</span>
                </div>
                
                <button @click="deleteRule(rule.id)" class="p-2 hover:bg-red-500/10 hover:text-red-500 text-[color:var(--text-muted)] rounded-lg transition-colors" title="Delete Rule">
                    <Trash2 class="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div class="bg-[color:var(--bg-panel)] border border-[color:var(--border-subtle)] rounded-xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div class="px-6 py-4 border-b border-[color:var(--border-subtle)] flex justify-between items-center">
                <h3 class="font-bold text-[color:var(--text-main)] text-lg">Create WAF Rule</h3>
                <button @click="showCreateModal = false" class="text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]">
                    <X class="w-5 h-5" />
                </button>
            </div>
            
            <div class="p-6 space-y-4">
                <div>
                    <label class="block text-xs font-bold text-[color:var(--text-muted)] uppercase tracking-wider mb-2">Rule Name</label>
                    <input v-model="newRule.name" type="text" placeholder="e.g. Block bad bots" class="w-full bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-lg px-3 py-2.5 text-[color:var(--text-main)] focus:outline-none focus:border-blue-500 text-sm">
                </div>
                
                <div class="grid grid-cols-3 gap-3">
                    <div>
                        <label class="block text-xs font-bold text-[color:var(--text-muted)] uppercase tracking-wider mb-2">Field</label>
                        <select v-model="newRule.field" class="w-full bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-lg px-3 py-2.5 text-[color:var(--text-main)] focus:outline-none focus:border-blue-500 text-sm">
                            <option value="ip">IP Address</option>
                            <option value="country">Country (ISO)</option>
                            <option value="path">URI Path</option>
                            <option value="user_agent">User Agent</option>
                            <option value="method">HTTP Method</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-[color:var(--text-muted)] uppercase tracking-wider mb-2">Operator</label>
                        <select v-model="newRule.operator" class="w-full bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-lg px-3 py-2.5 text-[color:var(--text-main)] focus:outline-none focus:border-blue-500 text-sm">
                            <option value="equals">Equals</option>
                            <option value="not_equals">Does not equal</option>
                            <option value="contains">Contains</option>
                            <option value="in">In List</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-[color:var(--text-muted)] uppercase tracking-wider mb-2">Action</label>
                        <select v-model="newRule.action" class="w-full bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-lg px-3 py-2.5 text-[color:var(--text-main)] focus:outline-none focus:border-blue-500 text-sm">
                            <option value="block">Block</option>
                            <option value="challenge">JS Challenge</option>
                            <option value="bypass">Bypass</option>
                        </select>
                    </div>
                </div>
                
                <div>
                    <label class="block text-xs font-bold text-[color:var(--text-muted)] uppercase tracking-wider mb-2">Value</label>
                    <input v-model="newRule.value" type="text" placeholder="e.g. 192.168.1.1 or RU,CN" class="w-full bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-lg px-3 py-2.5 text-[color:var(--text-main)] focus:outline-none focus:border-blue-500 text-sm">
                    <p v-if="newRule.operator === 'in'" class="text-[10px] text-zinc-500 mt-1">Comma-separated values allowed.</p>
                </div>
            </div>
            
            <div class="px-6 py-4 border-t border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] flex justify-end gap-3">
                <button @click="showCreateModal = false" class="px-4 py-2 text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] text-sm font-semibold">Cancel</button>
                <button @click="createRule" :disabled="saving" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
                    <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
                    Deploy Rule
                </button>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ShieldAlert, Plus, Trash2, Activity, HelpCircle, CheckCircle, Shield, X, Loader2 } from 'lucide-vue-next';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const rules = ref<any[]>([]);
const loading = ref(true);
const showCreateModal = ref(false);
const saving = ref(false);

const newRule = ref({
    name: '',
    field: 'ip',
    operator: 'equals',
    value: '',
    action: 'block'
});

const fetchRules = async () => {
    try {
        const res = await axios.get(`${apiUrl}/waf/rules`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        rules.value = res.data;
    } catch (e) {
        console.error('Error fetching rules', e);
    } finally {
        loading.value = false;
    }
};

const createRule = async () => {
    if (!newRule.value.name || !newRule.value.value) return;
    saving.value = true;
    try {
        await axios.post(`${apiUrl}/waf/rules`, newRule.value, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        showCreateModal.value = false;
        newRule.value = { name: '', field: 'ip', operator: 'equals', value: '', action: 'block' };
        await fetchRules();
    } catch (e) {
        console.error('Error creating rule', e);
    } finally {
        saving.value = false;
    }
};

const deleteRule = async (id: string) => {
    try {
        await axios.delete(`${apiUrl}/waf/rules/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        await fetchRules();
    } catch (e) {
        console.error('Error deleting rule', e);
    }
};

onMounted(fetchRules);
</script>
