<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import FooterLinks from '@/components/FooterLinks.vue'
import LoginModal from '@/components/LoginModal.vue'
import UserMenu from '@/components/UserMenu.vue'
import { authApi, getToken, removeToken } from '@/api'

const router = useRouter()

interface UserData {
  id: number
  username: string
  nickname: string
  email: string | null
  avatar_url: string | null
  gender: 0 | 1
  bio: string | null
  role: 0 | 1
}

const showLoginModal = ref(false)
const searchQuery = ref('')
const searchHistory = ref<string[]>([])
const currentUser = ref<UserData | null>(null)

const USER_KEY = 'zr_current_user'

const SEARCH_HISTORY_KEY = 'zr_search_history'
const MAX_HISTORY_COUNT = 10

// 加载搜索历史
const loadSearchHistory = () => {
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY)
    if (stored) {
      searchHistory.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error('加载搜索历史失败:', error)
    searchHistory.value = []
  }
}

// 保存搜索历史
const saveSearchHistory = () => {
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory.value))
  } catch (error) {
    console.error('保存搜索历史失败:', error)
  }
}

// 添加搜索记录
const addSearchHistory = (query: string) => {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) return

  // 移除已存在的相同记录
  searchHistory.value = searchHistory.value.filter(item => item !== trimmedQuery)
  
  // 添加到开头
  searchHistory.value.unshift(trimmedQuery)
  
  // 限制数量
  if (searchHistory.value.length > MAX_HISTORY_COUNT) {
    searchHistory.value = searchHistory.value.slice(0, MAX_HISTORY_COUNT)
  }
  
  saveSearchHistory()
}

// 搜索处理
const handleSearch = () => {
  const query = searchQuery.value.trim()
  if (query) {
    addSearchHistory(query)
    // 跳转到搜索结果页
    router.push({ path: '/search', query: { q: query } })
  }
}

// 点击搜索历史项
const handleHistoryClick = (query: string) => {
  searchQuery.value = query
  handleSearch()
}

// 清空搜索历史
const clearSearchHistory = () => {
  searchHistory.value = []
  localStorage.removeItem(SEARCH_HISTORY_KEY)
}

// 加载当前用户
const loadCurrentUser = async () => {
  try {
    const token = getToken()
    if (!token) {
      // 没有 token，清除本地用户信息
      localStorage.removeItem(USER_KEY)
      currentUser.value = null
      return
    }

    // 有 token，验证并获取最新用户信息
    const response = await authApi.getCurrentUser()
    
    if (response.code === '2000' && response.data) {
      const userInfo = response.data
      const userData: UserData = {
        id: userInfo.id,
        username: userInfo.username,
        nickname: userInfo.nickname,
        email: userInfo.email,
        avatar_url: userInfo.avatarUrl,
        gender: userInfo.gender,
        bio: userInfo.bio,
        role: userInfo.role
      }
      saveCurrentUser(userData)
    } else {
      // token 无效，清除数据
      removeToken()
      localStorage.removeItem(USER_KEY)
      currentUser.value = null
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
    // 出错时也清除数据
    removeToken()
    localStorage.removeItem(USER_KEY)
    currentUser.value = null
  }
}

// 保存当前用户
const saveCurrentUser = (user: UserData) => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    currentUser.value = user
  } catch (error) {
    console.error('保存用户信息失败:', error)
  }
}

// 退出登录
const handleLogout = async () => {
  try {
    // 调用后端登出 API
    await authApi.logout()
    console.log('后端登出成功')
  } catch (error) {
    console.error('后端登出失败:', error)
    // 即使后端登出失败，也继续清除前端数据
  } finally {
    // 清除前端数据
    removeToken()
    localStorage.removeItem(USER_KEY)
    currentUser.value = null
  }
}

// 导航到书架
const handleNavigateToShelf = () => {
  router.push('/bookshelf')
}

// 导航到上传
const handleNavigateToUpload = () => {
  console.log('导航到书籍上传')
  // TODO: 实现上传页面路由
}

const openLoginModal = () => {
  showLoginModal.value = true
}

const closeLoginModal = () => {
  showLoginModal.value = false
}

// 登录成功处理
const handleLoginSuccess = (_username: string, _email: string | null, userData: UserData) => {
  saveCurrentUser(userData)
  closeLoginModal()
}

onMounted(() => {
  loadSearchHistory()
  loadCurrentUser()
})

interface RecentRead {
  id: string
  title: string
  author: string
  cover: string
  progress: string
  chapter: string
}

const recentReads: RecentRead[] = [
  {
    id: 'r1',
    title: '不要担心 2 小时和 8 公里以外的事情',
    author: '李松涛',
    cover: 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&w=160&q=80',
    progress: '已读 36%',
    chapter: '读至 第六章 · 当下的半径'
  },
  {
    id: 'r2',
    title: '从内耗到心流',
    author: '杨鸣',
    cover: 'https://images.unsplash.com/photo-1470499122001-449c5239351a?auto=format&fit=crop&w=160&q=80',
    progress: '已读 52%',
    chapter: '读至 第三章 · 协同的核心'
  },
  {
    id: 'r3',
    title: '进化心理学',
    author: '[美] 戴维·巴斯',
    cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=160&q=80',
    progress: '已读 12%',
    chapter: '读至 第一章 · 演化的视角'
  },
  {
    id: 'r4',
    title: '贵婿',
    author: '堵上西楼',
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=160&q=80',
    progress: '已读 78%',
    chapter: '读至 第十四章 · 烟火长街'
  }
] as const
</script>

<template>
  <div class="wreader-home min-h-screen bg-white">
    <main>
      <section class="bg-white">
        <div class="mx-auto flex max-w-[1200px] flex-col gap-4 px-3 py-4">
          <!-- Logo -->
          <div class="flex flex-col items-center pt-8 pb-4">
            <div class="flex items-center gap-4">
              <div class="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-xl font-semibold text-white">
                ZR
              </div>
              <h1 class="text-3xl font-bold text-wread-text">极简阅读</h1>
            </div>
            <p class="mt-4 text-sm text-wread-text-secondary">极简阅读，一页一世界！</p>
          </div>

          <!-- 搜索框 -->
          <div class="w-full mt-3">
            <form @submit.prevent="handleSearch">
              <div class="relative flex items-center wread-search">
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
                />
              </div>
            </form>
          </div>

          <!-- 搜索历史 -->
          <div v-if="searchHistory.length > 0" class="w-full mt-5">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-xs text-wread-text-secondary">搜索历史</span>
              <button
                @click="clearSearchHistory"
                class="text-xs text-wread-text-secondary hover:text-wread-text"
              >
                清空
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="(search, index) in searchHistory"
                :key="index"
                @click="handleHistoryClick(search)"
                class="wread-tag hover:bg-wread-bg"
              >
                {{ search }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="mx-auto flex max-w-[1200px] flex-col gap-4 px-3 py-4">
        <section class="wreader-categories">
          <header class="mb-6 flex items-center justify-between">
            <h2 class="text-base font-semibold text-wread-text">最近阅读</h2>
            <!-- 未登录显示登录按钮 -->
            <button
              v-if="!currentUser"
              @click="openLoginModal"
              class="text-sm text-[#1b88ee] hover:opacity-80"
            >
              登录
            </button>
            <!-- 已登录显示用户菜单 -->
            <UserMenu
              v-else
              :user="currentUser"
              @logout="handleLogout"
              @navigate-to-shelf="handleNavigateToShelf"
              @navigate-to-upload="handleNavigateToUpload"
            />
          </header>

          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <article
              v-for="book in recentReads"
              :key="book.id"
              class="flex gap-4 rounded-card bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <img :src="book.cover" :alt="book.title" class="h-24 w-16 flex-shrink-0 rounded-cover object-cover shadow-sm" />
              <div class="flex flex-1 flex-col gap-2">
                <div class="space-y-1">
                  <h3 class="text-[15px] font-semibold text-wread-text leading-tight">{{ book.title }}</h3>
                  <p class="text-xs text-wread-text-secondary">{{ book.author }}</p>
                </div>
                <p class="text-xs text-wread-text-secondary">{{ book.chapter }}</p>
                <div class="mt-auto flex items-center justify-between">
                  <span class="text-xs text-wread-primary">{{ book.progress }}</span>
                  <button class="text-sm text-[#1b88ee] hover:opacity-80">继续阅读</button>
                </div>
              </div>
            </article>
          </div>
        </section>
      </section>
    </main>

    <FooterLinks />
    
    <!-- 登录弹窗 -->
    <LoginModal
      :show="showLoginModal"
      @close="closeLoginModal"
      @login-success="handleLoginSuccess"
    />
  </div>
</template>
