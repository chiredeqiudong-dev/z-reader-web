<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

const currentYear = new Date().getFullYear()
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white">
    <main class="flex-1">
      <RouterView />
    </main>
  </div>
</template>
