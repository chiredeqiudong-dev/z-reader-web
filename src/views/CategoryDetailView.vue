<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authApi, getToken, removeToken } from '@/api'

const router = useRouter()
const route = useRoute()

const selectedBooks = ref<Set<string>>(new Set())
const showMoveMenu = ref(false)
const showContextMenu = ref(false)
const contextMenuBook = ref<string | null>(null)
const contextMenuPosition = ref({ x: 0, y: 0 })
const isSelectionMode = ref(false)
const showUserDropdown = ref(false)
const userDropdownRef = ref<HTMLElement | null>(null)

interface Book {
  id: string
  title: string
  author: string
  cover: string
}

const currentUser = ref<any>(null)
const searchQuery = ref('')
const categoryName = ref('')
const books = ref<Book[]>([])

// 模拟分类数据
const mockCategoryData: Record<string, { name: string; books: Book[] }> = {
  fiction: {
    name: '网文',
    books: [
      { id: '1', title: '全职高手', author: '蝴蝶蓝', cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=240&q=80' },
      { id: '2', title: '斗破苍穹', author: '天蚕土豆', cover: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=240&q=80' },
      { id: '3', title: '盗墓笔记', author: '南派三叔', cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=240&q=80' },
      { id: '4', title: '诛仙', author: '萧鼎', cover: 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&w=240&q=80' }
    ]
  },
  novel: {
    name: '传统小说',
    books: [
      { id: '5', title: '活着', author: '余华', cover: 'https://images.unsplash.com/photo-1470499122001-449c5239351a?auto=format&fit=crop&w=240&q=80' },
      { id: '6', title: '白夜行', author: '东野圭吾', cover: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=240&q=80' }
    ]
  }
}

const goBack = () => {
  router.push('/bookshelf')
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value.trim() } })
  }
}

// 书籍选择相关
const toggleBookSelection = (bookId: string) => {
  if (selectedBooks.value.has(bookId)) {
    selectedBooks.value.delete(bookId)
  } else {
    selectedBooks.value.add(bookId)
  }
}

const toggleSelectionMode = () => {
  isSelectionMode.value = !isSelectionMode.value
  if (!isSelectionMode.value) {
    selectedBooks.value.clear()
  }
}

const selectAll = () => {
  if (selectedBooks.value.size === books.value.length) {
    selectedBooks.value.clear()
  } else {
    books.value.forEach(book => selectedBooks.value.add(book.id))
  }
}

// 右键菜单相关
const handleContextMenu = (event: MouseEvent, bookId: string) => {
  event.preventDefault()
  contextMenuBook.value = bookId
  contextMenuPosition.value = { x: event.clientX, y: event.clientY }
  showContextMenu.value = true
}

const handleClickOutside = (event: MouseEvent) => {
  showContextMenu.value = false
  contextMenuBook.value = null
  
  // 处理用户下拉菜单的外部点击
  if (userDropdownRef.value && !userDropdownRef.value.contains(event.target as Node)) {
    showUserDropdown.value = false
  }
}

// 批量移动相关
const handleBatchMove = () => {
  if (selectedBooks.value.size === 0) {
    alert('请先选择要移动的书籍')
    return
  }
  showMoveMenu.value = true
}

const handleMoveToCategory = (categoryId: string) => {
  const bookIdsToMove = Array.from(selectedBooks.value)
  
  // 从当前分类中移除选中的书籍
  books.value = books.value.filter(book => !bookIdsToMove.includes(book.id))
  
  // 保存到 localStorage（模拟后端数据变更）
  // 实际应用中这里应该调用后端API
  const currentCategoryId = route.query.id as string
  if (mockCategoryData[currentCategoryId]) {
    mockCategoryData[currentCategoryId].books = books.value
  }
  
  // TODO: 将书籍添加到目标分类（需要后端API支持）
  console.log('批量移动书籍:', bookIdsToMove, '到分类:', categoryId)
  
  showMoveMenu.value = false
  isSelectionMode.value = false
  selectedBooks.value.clear()
}

// 单本书移动
const handleSingleBookMove = (bookId: string, categoryId: string) => {
  // 从当前分类中移除该书籍
  const bookIndex = books.value.findIndex(book => book.id === bookId)
  if (bookIndex !== -1) {
    const [removedBook] = books.value.splice(bookIndex, 1)
    
    // 保存到 localStorage（模拟后端数据变更）
    const currentCategoryId = route.query.id as string
    if (mockCategoryData[currentCategoryId]) {
      mockCategoryData[currentCategoryId].books = books.value
    }
    
    // TODO: 将书籍添加到目标分类（需要后端API支持）
    console.log('单本移动书籍:', removedBook.title, '到分类:', categoryId)
  }
  
  showContextMenu.value = false
}

// 模拟可用分类
const availableCategories = [
  { id: 'fiction', name: '网文' },
  { id: 'novel', name: '传统小说' },
  { id: 'computer', name: '计算机' },
  { id: 'society', name: '社会' }
]

// 用户相关
const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
}

const getUserInitial = () => {
  if (!currentUser.value) return 'A'
  const name = currentUser.value.nickname || currentUser.value.username || 'Anonymous'
  return name.charAt(0).toUpperCase()
}

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
    localStorage.removeItem('zr_current_user')
    router.push('/')
  }
}

const handleNavigateToShelf = () => {
  router.push('/bookshelf')
}

const handleNavigateToUpload = () => {
  console.log('导航到书籍上传页面')
  // TODO: 实现书籍上传页面
}

onMounted(async () => {
  // 验证用户登录状态
  try {
    const token = getToken()
    if (!token) {
      router.push('/')
      return
    }

    // 从后端获取用户信息
    const response = await authApi.getCurrentUser()
    
    if (response.code === '2000' && response.data) {
      const userInfo = response.data
      currentUser.value = {
        id: userInfo.id,
        username: userInfo.username,
        nickname: userInfo.nickname,
        email: userInfo.email,
        avatar_url: userInfo.avatarUrl,
        gender: userInfo.gender,
        bio: userInfo.bio,
        role: userInfo.role
      }
      // 同步到 localStorage
      localStorage.setItem('zr_current_user', JSON.stringify(currentUser.value))
    } else {
      // token 无效，清除并跳转
      removeToken()
      localStorage.removeItem('zr_current_user')
      router.push('/')
      return
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
    removeToken()
    localStorage.removeItem('zr_current_user')
    router.push('/')
    return
  }

  // 加载分类数据
  const categoryId = route.query.id as string
  if (categoryId && mockCategoryData[categoryId]) {
    categoryName.value = mockCategoryData[categoryId].name
    books.value = mockCategoryData[categoryId].books
  } else {
    // 分类不存在，返回书架
    router.push('/bookshelf')
  }

  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-10 border-b border-wread-divider bg-white">
      <div class="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
        <!-- Logo 和搜索 -->
        <div class="flex items-center gap-6">
          <button @click="goBack" class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-lg font-semibold text-white">
              ZR
            </div>
            <span class="text-xl font-bold text-wread-text">极简阅读</span>
          </button>

          <!-- 搜索框 -->
          <form @submit.prevent="handleSearch" class="hidden md:block">
            <div class="relative flex items-center">
              <svg class="absolute left-3 h-4 w-4 text-wread-placeholder" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索书名或作者名"
                class="h-9 w-96 rounded-full border-none bg-wread-bg pl-9 pr-4 text-sm text-wread-text placeholder:text-wread-placeholder focus:outline-none focus:ring-2 focus:ring-[#1b88ee]/20"
              />
            </div>
          </form>
        </div>

        <!-- 右侧菜单 -->
        <div class="flex items-center gap-6 text-sm text-wread-text-secondary">
          <button @click="goBack" class="hover:text-wread-text">首页</button>
          
          <!-- 用户头像和下拉菜单 -->
          <div v-if="currentUser" class="relative" ref="userDropdownRef">
            <button
              @click="toggleUserDropdown"
              class="flex h-8 w-8 items-center justify-center rounded-full bg-[#1b88ee] text-sm font-semibold text-white transition hover:opacity-90"
              :class="{ 'ring-2 ring-[#1b88ee] ring-offset-2': showUserDropdown }"
            >
              <img
                v-if="currentUser.avatar_url"
                :src="currentUser.avatar_url"
                :alt="currentUser.nickname || currentUser.username"
                class="h-full w-full rounded-full object-cover"
                @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
              />
              <span v-if="!currentUser.avatar_url" class="flex h-full w-full items-center justify-center">{{ getUserInitial() }}</span>
            </button>

            <!-- 下拉菜单 -->
            <Transition name="dropdown">
              <div
                v-if="showUserDropdown"
                class="absolute right-0 top-full mt-2 w-40 rounded-lg border border-wread-divider bg-white py-2 shadow-lg"
              >
                <button
                  @click="handleNavigateToShelf"
                  class="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-wread-text transition hover:bg-wread-bg"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                  我的书架
                </button>
                <button
                  @click="handleNavigateToUpload"
                  class="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-wread-text transition hover:bg-wread-bg"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                  书籍上传
                </button>
                <div class="my-1 border-t border-wread-divider"></div>
                <button
                  @click="handleLogout"
                  class="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                  </svg>
                  退出登录
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="mx-auto max-w-[1400px] px-6 py-8">
      <!-- 分类标题和工具栏 -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button
              @click="goBack"
              class="flex h-10 w-10 items-center justify-center rounded-full text-wread-text-secondary transition hover:bg-wread-bg"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 class="text-2xl font-bold text-wread-text">{{ categoryName }}</h1>
              <p class="mt-1 text-xs text-wread-text-secondary">
                {{ currentUser?.nickname || currentUser?.username }} - {{ categoryName }}
                <span v-if="isSelectionMode" class="ml-2">
                  (已选择 {{ selectedBooks.size }} 本)
                </span>
              </p>
            </div>
          </div>

          <!-- 工具栏 -->
          <div class="flex items-center gap-2">
            <button
              v-if="!isSelectionMode"
              @click="toggleSelectionMode"
              class="rounded-full border border-wread-divider bg-white px-4 py-2 text-xs font-medium text-wread-text transition hover:bg-wread-bg"
            >
              批量管理
            </button>
            <template v-else>
              <button
                @click="selectAll"
                class="rounded-full border border-wread-divider bg-white px-4 py-2 text-xs font-medium text-wread-text transition hover:bg-wread-bg"
              >
                {{ selectedBooks.size === books.length ? '取消全选' : '全选' }}
              </button>
              <button
                @click="handleBatchMove"
                class="rounded-full bg-[#1b88ee] px-4 py-2 text-xs font-medium text-white transition hover:opacity-90"
                :disabled="selectedBooks.size === 0"
                :class="{ 'opacity-50 cursor-not-allowed': selectedBooks.size === 0 }"
              >
                移动到
              </button>
              <button
                @click="toggleSelectionMode"
                class="rounded-full border border-wread-divider bg-white px-4 py-2 text-xs font-medium text-wread-text transition hover:bg-wread-bg"
              >
                取消
              </button>
            </template>
          </div>
        </div>
      </div>

      <!-- 书籍列表 -->
      <div class="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        <div
          v-for="book in books"
          :key="book.id"
          class="group cursor-pointer"
          @click="isSelectionMode ? toggleBookSelection(book.id) : null"
          @contextmenu="handleContextMenu($event, book.id)"
        >
          <div class="space-y-3">
            <!-- 书籍封面 -->
            <div class="relative aspect-[3/4] overflow-hidden rounded-lg bg-wread-bg shadow-sm transition group-hover:shadow-lg">
              <img
                :src="book.cover"
                :alt="book.title"
                class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              
              <!-- 选择复选框 -->
              <div
                v-if="isSelectionMode"
                class="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md"
                :class="selectedBooks.has(book.id) ? 'bg-[#1b88ee]' : 'bg-white'"
              >
                <svg v-if="selectedBooks.has(book.id)" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
            </div>

            <!-- 书籍信息 -->
            <div class="space-y-1">
              <h3 class="text-sm font-medium text-wread-text line-clamp-2">{{ book.title }}</h3>
              <p class="text-xs text-wread-text-secondary">{{ book.author }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 右键菜单 -->
      <Transition name="fade">
        <div
          v-if="showContextMenu && contextMenuBook"
          :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }"
          class="fixed z-50 w-48 rounded-lg bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5"
          @click.stop
        >
          <div class="py-1">
            <div class="px-3 py-2 text-xs font-medium text-wread-text-secondary">移动到分类</div>
            <button
              v-for="category in availableCategories"
              :key="category.id"
              @click="handleSingleBookMove(contextMenuBook, category.id)"
              class="flex w-full items-center px-4 py-2 text-sm text-wread-text transition-colors duration-150 hover:bg-blue-50 hover:text-[#1b88ee]"
            >
              {{ category.name }}
            </button>
          </div>
        </div>
      </Transition>

      <!-- 批量移动菜单 -->
      <Transition name="modal">
        <div v-if="showMoveMenu" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/50" @click="showMoveMenu = false"></div>
          <div class="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 class="mb-4 text-lg font-bold text-wread-text">移动到分类</h3>
            <div class="space-y-2">
              <button
                v-for="category in availableCategories"
                :key="category.id"
                @click="handleMoveToCategory(category.id)"
                class="flex w-full items-center justify-between rounded-lg border border-wread-divider bg-white p-3 text-sm text-wread-text transition hover:border-[#1b88ee] hover:bg-blue-50"
              >
                <span>{{ category.name }}</span>
                <svg class="h-5 w-5 text-wread-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
            <button
              @click="showMoveMenu = false"
              class="mt-4 w-full rounded-lg border border-wread-divider bg-white py-3 text-sm font-medium text-wread-text transition hover:bg-wread-bg"
            >
              取消
            </button>
          </div>
        </div>
      </Transition>

      <!-- 空状态 -->
      <div v-if="books.length === 0" class="py-20 text-center">
        <svg class="mx-auto mb-4 h-16 w-16 text-wread-placeholder" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
        <p class="text-wread-text-secondary">该分类暂无书籍</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

