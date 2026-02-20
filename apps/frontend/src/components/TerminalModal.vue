<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto" @click.self="$emit('close')">
    <div class="bg-zinc-950 border border-zinc-700 w-full max-w-md shadow-2xl rounded-xl transform transition-all flex flex-col max-h-full" role="dialog" aria-modal="true">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50 rounded-t-xl shrink-0">
        <h3 class="text-sm font-semibold text-white pl-2">
          <slot name="title">Modal Title</slot>
        </h3>
        <button @click="$emit('close')" class="text-zinc-500 hover:text-white transition-colors focus:outline-none">
          <span class="sr-only">Close</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      
      <!-- Content -->
      <div class="p-6 overflow-y-auto min-h-[100px]">
        <slot></slot>
      </div>

      <!-- Footer (Optional) -->
      <div v-if="$slots.footer" class="p-4 border-t border-zinc-800 bg-zinc-900/30 rounded-b-xl flex justify-end gap-3 shrink-0">
        <slot name="footer"></slot>
      </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['close']);

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('close');
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>
