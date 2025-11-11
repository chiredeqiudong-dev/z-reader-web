<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

const currentYear = new Date().getFullYear()
</script>

<template>
  <div class="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
    <header class="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <nav class="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <RouterLink to="/" class="text-lg font-semibold tracking-tight">
          Z Reader
        </RouterLink>
        <div class="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <RouterLink class="transition hover:text-blue-600 dark:hover:text-blue-400" to="/">首页</RouterLink>
        </div>
      </nav>
    </header>

    <main class="flex-1">
      <RouterView />
    </main>

    <footer class="border-t border-slate-200 py-4 text-center text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
      © {{ currentYear }} Z Reader. 保留所有权利。
    </footer>
  </div>
</template>
