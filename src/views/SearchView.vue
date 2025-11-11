<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FooterLinks from '@/components/FooterLinks.vue'

const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const searchResults = ref<any[]>([])
const isLoading = ref(false)
const showMore = ref(false)

interface BookResult {
  id: string
  title: string
  author: string
  cover: string
  category: string
  rating: number
  progress?: number
  tags?: string[]
}

// 模拟搜索结果数据
const mockSearchResults: BookResult[] = [
  {
    id: '1',
    title: '黄金时代',
    author: '王小波',
    cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=240&q=80',
    category: '小说',
    rating: 80.3,
    tags: ['畅销入口']
  },
  {
    id: '2',
    title: '黄金时代（轻经典）',
    author: '王小波',
    cover: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=240&q=80',
    category: '小说',
    rating: 79.5,
    progress: 45
  },
  {
    id: '3',
    title: '一只特立独行的猪',
    author: '王小波',
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=240&q=80',
    category: '小说',
    rating: 75.1,
    tags: ['畅销一族']
  },
  {
    id: '4',
    title: '沉默的大多数',
    author: '王小波',
    cover: 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&w=240&q=80',
    category: '小说',
    rating: 78.5,
    tags: ['畅销一族']
  }
]

const performSearch = async (query: string) => {
  isLoading.value = true
  searchQuery.value = query
  
  // 模拟API调用
  setTimeout(() => {
    // TODO: 实际应该调用后端搜索API
    searchResults.value = mockSearchResults.filter(book => 
      book.title.includes(query) || book.author.includes(query)
    )
    isLoading.value = false
  }, 500)
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ query: { q: searchQuery.value.trim() } })
    performSearch(searchQuery.value.trim())
  }
}

const goBack = () => {
  router.back()
}

const loadMore = () => {
  showMore.value = true
  // TODO: 加载更多结果
}

onMounted(() => {
  const query = route.query.q as string
  if (query) {
    performSearch(query)
  }
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <main>
      <!-- 搜索头部 -->
      <section class="sticky top-0 z-10 bg-white shadow-sm">
        <div class="mx-auto flex max-w-[1200px] items-center gap-3 px-3 py-4">
          <!-- 返回按钮 -->
          <button
            @click="goBack"
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-wread-text-secondary transition hover:bg-wread-bg"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- 搜索框 -->
          <form @submit.prevent="handleSearch" class="flex-1">
            <div class="relative flex items-center rounded-full border border-wread-divider bg-white px-4 py-2.5 shadow-sm">
              <svg
                class="h-5 w-5 flex-shrink-0 text-wread-placeholder"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索书名或作者名"
                class="ml-3 flex-1 border-none bg-transparent text-sm text-wread-text placeholder:text-sm placeholder:text-wread-placeholder focus:outline-none"
                autofocus
              />
              <button
                v-if="searchQuery"
                type="button"
                @click="searchQuery = ''"
                class="ml-2 flex h-5 w-5 items-center justify-center rounded-full text-wread-placeholder hover:bg-wread-bg"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </form>

          <!-- 搜索按钮 -->
          <button
            @click="handleSearch"
            class="flex-shrink-0 rounded-full bg-[#1b88ee] px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            搜索
          </button>
        </div>
      </section>

      <!-- 搜索结果 -->
      <section class="mx-auto max-w-[1200px] px-3 py-6">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="flex justify-center py-12">
          <div class="flex items-center gap-2 text-wread-text-secondary">
            <svg class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-sm">搜索中...</span>
          </div>
        </div>

        <!-- 无结果 -->
        <div v-else-if="searchResults.length === 0 && searchQuery" class="py-12 text-center">
          <svg class="mx-auto mb-4 h-16 w-16 text-wread-placeholder" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <p class="text-wread-text-secondary">未找到相关结果</p>
          <p class="mt-2 text-sm text-wread-text-secondary">换个关键词试试吧</p>
        </div>

        <!-- 结果列表 -->
        <div v-else-if="searchResults.length > 0">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-base font-semibold text-wread-text">电子书</h2>
            <span class="text-xs text-wread-text-secondary">共 {{ searchResults.length }} 本</span>
          </div>

          <div class="space-y-4">
            <article
              v-for="book in searchResults"
              :key="book.id"
              class="flex gap-4 rounded-lg bg-white p-4 transition hover:shadow-md"
            >
              <!-- 封面 -->
              <img
                :src="book.cover"
                :alt="book.title"
                class="h-24 w-16 flex-shrink-0 rounded object-cover shadow-sm"
              />

              <!-- 信息 -->
              <div class="flex flex-1 flex-col">
                <div class="flex-1">
                  <h3 class="text-base font-semibold text-wread-text">
                    {{ book.title }}
                    <span v-if="book.progress" class="ml-2 text-xs text-wread-text-secondary">
                      ({{ book.progress }}%)
                    </span>
                  </h3>
                  <p class="mt-1 text-sm text-wread-text-secondary">{{ book.category }}</p>
                  <div class="mt-2 flex items-center gap-2">
                    <span class="text-xs text-wread-text-secondary">
                      推荐值 {{ book.rating }}%
                    </span>
                    <span v-if="book.tags && book.tags.length > 0" class="rounded bg-blue-50 px-2 py-0.5 text-xs text-[#1b88ee]">
                      {{ book.tags[0] }}
                    </span>
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="mt-2 flex items-center justify-end gap-2">
                  <button class="rounded-full bg-wread-bg px-4 py-1.5 text-xs text-wread-text transition hover:bg-wread-divider">
                    详情
                  </button>
                  <button class="rounded-full bg-[#1b88ee] px-4 py-1.5 text-xs text-white transition hover:opacity-90">
                    {{ book.progress ? '继续阅读' : '开始阅读' }}
                  </button>
                </div>
              </div>

              <!-- 收藏数 -->
              <div class="flex flex-col items-end justify-between">
                <button class="flex h-8 w-8 items-center justify-center rounded-full text-wread-text-secondary transition hover:bg-wread-bg">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                </button>
                <span class="text-xs text-wread-text-secondary">{{ Math.floor(Math.random() * 1000) + 100 }}</span>
              </div>
            </article>
          </div>

          <!-- 加载更多 -->
          <div v-if="searchResults.length >= 4 && !showMore" class="mt-6 flex justify-center">
            <button
              @click="loadMore"
              class="flex items-center gap-1 rounded-full px-6 py-2 text-sm text-wread-text-secondary transition hover:bg-wread-bg"
            >
              <span>展开更多</span>
              <span class="text-xs">· {{ searchResults.length + 33 }} 本</span>
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="m19 9-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

