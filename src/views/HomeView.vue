<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCounterStore } from '@/stores/modules/counter'

const counter = useCounterStore()
const { count, doubleCount } = storeToRefs(counter)
</script>

<template>
  <section class="mx-auto flex max-w-4xl flex-col gap-6 p-8">
    <header class="space-y-2">
      <h1 class="text-3xl font-semibold tracking-tight">
        欢迎使用 Z Reader Web
      </h1>
      <p class="text-base text-slate-500">
        这是项目的基础骨架，集成了 Vue Router、Pinia、Axios 与 TailwindCSS。
      </p>
    </header>

    <article class="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800/60">
      <h2 class="text-xl font-medium text-slate-700 dark:text-slate-200">计数器示例</h2>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        来自 Pinia store 的响应式状态，可用于演示全局状态管理。
      </p>

      <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div class="flex-1 space-y-1">
          <p class="text-4xl font-bold text-slate-900 dark:text-white">
            {{ count }}
          </p>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            双倍值：{{ doubleCount }}
          </p>
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            class="inline-flex min-w-[6rem] items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
            @click="counter.increment()"
          >
            增加
          </button>
          <button
            type="button"
            class="inline-flex min-w-[6rem] items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60 dark:focus-visible:ring-offset-slate-900"
            @click="counter.reset()"
          >
            重置
          </button>
        </div>
      </div>
    </article>
  </section>
</template>

