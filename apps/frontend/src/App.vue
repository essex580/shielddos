<script setup lang="ts">
import { ref } from 'vue'

const message = ref('ShieldDOS Dashboard Active')
</script>

<template>
  <div class="container">
    <h1>{{ message }}</h1>
    <p>Welcome to your anti-DDoS dashboard.</p>
  </div>
</template>

<style scoped>
.container {
  font-family: Arial, sans-serif;
  padding: 2rem;
  text-align: center;
}
</style>
