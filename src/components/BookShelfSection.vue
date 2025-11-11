<script setup lang="ts">
interface BookCard {
  id: string
  title: string
  author: string
  cover: string
  tag?: string
  description?: string
  highlight?: string
}

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    books: BookCard[]
    showIndex?: boolean
    columns?: number
  }>(),
  {
    subtitle: '',
    showIndex: false,
    columns: 4
  }
)
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <h2 class="text-base font-semibold text-wread-text">{{ props.title }}</h2>
      <button class="text-[13px] font-medium text-wread-primary md:self-center">
        {{ props.subtitle || '查看全部' }}
      </button>
    </header>

    <div class="book-grid" :data-cols="props.columns">
      <article
        v-for="(book, index) in props.books"
        :key="book.id"
        class="wread-book-card group flex flex-col gap-3 p-4"
      >
        <div class="relative flex items-center justify-center">
          <span
            v-if="props.showIndex"
            class="absolute -left-3 -top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs font-semibold text-white"
          >
            {{ index + 1 }}
          </span>
          <img :src="book.cover" :alt="book.title" class="wread-book-cover object-cover shadow-sm" />
        </div>
        <div class="flex flex-1 flex-col gap-2 text-center">
          <div class="space-y-1">
            <h3 class="text-[15px] font-semibold text-wread-text leading-tight">{{ book.title }}</h3>
            <p class="text-xs text-wread-text-secondary">{{ book.author }}</p>
            <p v-if="book.description" class="text-xs leading-relaxed text-wread-text-secondary line-clamp-2">
              {{ book.description }}
            </p>
          </div>
          <div class="mt-auto flex flex-wrap items-center justify-center gap-2 text-xs text-wread-text-secondary">
            <span v-if="book.tag" class="rounded-full bg-wread-bg-light px-2 py-1 text-wread-text-secondary">
              {{ book.tag }}
            </span>
            <span v-if="book.highlight" class="text-wread-primary">
              {{ book.highlight }}
            </span>
            <span v-if="!book.tag && !book.highlight" class="text-wread-text-secondary">
              大家都在读
            </span>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.book-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 12px;
}

@media (min-width: 768px) {
  .book-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
}

@media (min-width: 1024px) {
  .book-grid[data-cols="3"] {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .book-grid[data-cols="4"] {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>

