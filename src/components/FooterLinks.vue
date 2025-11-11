<template>
  <footer class="wreader-footer border-t border-wread-divider bg-white">
    <div class="mx-auto max-w-[1200px] px-4 py-6 text-center">
      <p class="text-xs text-wread-text-secondary">
        © {{ currentYear }} Z Reader. 保留所有权利。
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

