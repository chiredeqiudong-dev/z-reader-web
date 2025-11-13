<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import CategoryManager from '@/components/CategoryManager.vue'
import StorageProviderManager from '@/components/StorageProviderManager.vue'
import UserProfileModal from '@/components/UserProfileModal.vue'
import { authApi, categoryApi, getToken, removeToken, type UpdateUserDTO } from '@/api'

const router = useRouter()
const showUserDropdown = ref(false)
const userDropdownRef = ref<HTMLElement | null>(null)
const showCategoryManager = ref(false)
const showStorageManager = ref(false)
const showUserProfileModal = ref(false)

interface BookCategory {
  id: string
  name: string
  books: Book[]
}

interface Book {
  id: string
  title: string
  author: string
  cover: string
}

const currentUser = ref<any>(null)
const searchQuery = ref('')
const isLoadingCategories = ref(false)

// 书籍分类数据（从后端加载）
const bookCategories = ref<BookCategory[]>([])

// 添加分类占位符
const addCategoryPlaceholder = {
  id: 'add',
  name: '',
  books: []
}

const allCategories = computed(() => {
  return [...bookCategories.value, addCategoryPlaceholder]
})

const goBack = () => {
  router.push('/')
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value.trim() } })
  }
}

const handleAddCategory = () => {
  console.log('添加新分类')
  // TODO: 实现添加分类功能
}

const handleCategoryClick = (categoryId: string) => {
  if (categoryId !== 'add') {
    router.push({ path: '/bookshelf/category', query: { id: categoryId } })
  }
}

// 检查用户是否为管理员
const isAdmin = computed(() => {
  return currentUser.value?.role === 0
})

// 加载分类数据
const loadCategories = async () => {
  if (!isAdmin.value) {
    return // 非管理员不加载分类数据
  }

  isLoadingCategories.value = true
  try {
    const response = await categoryApi.listCategories()
    if (response.code === '2000' && response.data) {
      // 将后端数据映射到前端数据结构
      // 注意：这里暂时没有书籍数据，后续需要与书籍模块集成
      bookCategories.value = response.data.map(cat => ({
        id: cat.id.toString(),
        name: cat.categoryName,
        books: [] // 暂时为空，等待书籍接口集成
      }))
    }
  } catch (error) {
    console.error('加载分类失败:', error)
  } finally {
    isLoadingCategories.value = false
  }
}

// 分类管理相关
const categoriesForManager = computed(() => {
  return bookCategories.value.map(cat => ({
    id: parseInt(cat.id),
    name: cat.name,
    bookCount: cat.books.length
  }))
})

// 刷新分类列表（CategoryManager emit 的 refresh 事件）
const handleRefreshCategories = () => {
  loadCategories()
}

const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
}

const handleClickOutside = (event: MouseEvent) => {
  if (userDropdownRef.value && !userDropdownRef.value.contains(event.target as Node)) {
    showUserDropdown.value = false
  }
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
    showUserDropdown.value = false
    router.push('/')
  }
}

const handleNavigateToUpload = () => {
  showUserDropdown.value = false
  console.log('导航到书籍上传')
  // TODO: 实现上传页面路由
}

// 打开个人信息编辑模态框
const handleOpenProfileModal = () => {
  showUserDropdown.value = false
  showUserProfileModal.value = true
}

// 保存用户信息
const handleSaveUserProfile = async (profileData: UpdateUserDTO) => {
  try {
    const response = await authApi.updateUserInfo(profileData)
    
    if (response.code === '2000' && response.data) {
      // 更新本地用户信息
      const userInfo = response.data
      const userData = {
        id: userInfo.id,
        username: userInfo.username,
        nickname: userInfo.nickname,
        email: userInfo.email,
        avatar_url: userInfo.avatarUrl,
        gender: userInfo.gender,
        bio: userInfo.bio,
        role: userInfo.role
      }
      
      // 更新 currentUser
      currentUser.value = userData
      
      // 更新 localStorage
      localStorage.setItem('zr_current_user', JSON.stringify(userData))
      
      // 关闭模态框
      showUserProfileModal.value = false
      
      console.log('用户信息更新成功:', userData)
    } else {
      console.error('更新用户信息失败:', response.msg)
      alert('更新失败：' + response.msg)
    }
  } catch (error) {
    console.error('更新用户信息出错:', error)
    alert('更新失败，请检查网络连接')
  }
}

const getUserInitial = () => {
  return currentUser.value?.username?.charAt(0).toUpperCase() || 'U'
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
      
      // 如果是管理员，加载分类数据
      if (userInfo.role === 0) {
        await loadCategories()
      }
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
          <div ref="userDropdownRef" class="relative">
            <button
              v-if="currentUser"
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
                class="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5"
              >
                <!-- 菜单项 -->
                <div class="py-1">
                  <button
                    class="flex w-full items-center gap-3 px-4 py-2 text-sm text-wread-text transition hover:bg-wread-bg"
                  >
                    <svg class="h-5 w-5 text-wread-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                    </svg>
                    我的书架
                  </button>

                  <button
                    @click="handleNavigateToUpload"
                    class="flex w-full items-center gap-3 px-4 py-2 text-sm text-wread-text transition hover:bg-wread-bg"
                  >
                    <svg class="h-5 w-5 text-wread-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    书籍上传
                  </button>
                </div>

                <!-- 退出登录 -->
                <div class="border-t border-wread-divider pt-1">
                  <button
                    @click="handleLogout"
                    class="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50"
                  >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                    </svg>
                    退出登录
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="mx-auto max-w-[1400px] px-6 py-8">
      <!-- 用户信息和按钮 -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold text-wread-text">{{ currentUser?.nickname || currentUser?.username }}</h1>
            <!-- 性别符号 -->
            <span v-if="currentUser?.gender === 1" class="text-xl text-blue-500" title="男">♂</span>
            <span v-else-if="currentUser?.gender === 0" class="text-xl text-pink-500" title="女">♀</span>
            <button
              @click="handleOpenProfileModal"
              class="rounded-full p-1.5 text-wread-text-secondary transition hover:bg-wread-bg hover:text-[#1b88ee]"
              title="编辑个人信息"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </button>
          </div>
          <p class="mt-1 text-xs text-wread-text-secondary">{{ currentUser?.bio || '暂无个人简介' }}</p>
          <p v-if="currentUser?.email" class="mt-0.5 text-xs text-wread-text-secondary">{{ currentUser.email }}</p>
        </div>
        
        <div class="flex items-center gap-3">
          <button
            v-if="isAdmin"
            @click="showCategoryManager = true"
            class="rounded-full border border-wread-divider bg-white px-5 py-1.5 text-xs font-medium text-wread-text transition hover:bg-wread-bg"
          >
            分类管理
          </button>
          <button
            v-if="isAdmin"
            @click="showStorageManager = true"
            class="rounded-full border border-wread-divider bg-white px-5 py-1.5 text-xs font-medium text-wread-text transition hover:bg-wread-bg"
          >
            存储管理
          </button>
          <button class="rounded-full bg-[#1b88ee] px-5 py-1.5 text-xs font-medium text-white transition hover:opacity-90">
            下载 Z Reader App 管理书架
          </button>
        </div>
      </div>

      <!-- 书籍分类网格 -->
      <div class="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <div
          v-for="category in allCategories"
          :key="category.id"
          class="group"
        >
          <!-- 添加分类按钮 -->
          <div
            v-if="category.id === 'add'"
            @click="handleAddCategory"
            class="flex aspect-[3/4] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-wread-divider bg-wread-bg transition hover:border-[#1b88ee] hover:bg-blue-50"
          >
            <svg class="h-12 w-12 text-wread-placeholder" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>

          <!-- 分类卡片 -->
          <div
            v-else
            class="space-y-3 cursor-pointer"
            @click="handleCategoryClick(category.id)"
          >
            <!-- 书籍封面网格 -->
            <div class="relative aspect-[3/4] overflow-hidden rounded-lg bg-wread-bg shadow-sm transition group-hover:shadow-lg">
              <!-- 单本书籍 -->
              <div v-if="category.books.length === 1 && category.books[0]" class="h-full w-full">
                <img
                  :src="category.books[0].cover"
                  :alt="category.books[0].title"
                  class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <!-- 多本书籍 -->
              <div v-else-if="category.books.length > 1" class="grid h-full w-full grid-cols-2 gap-0.5 bg-white p-0.5">
                <div
                  v-for="book in category.books.slice(0, 4)"
                  :key="book.id"
                  class="overflow-hidden"
                >
                  <img
                    :src="book.cover"
                    :alt="book.title"
                    class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
              <!-- 空分类 -->
              <div v-else class="flex h-full w-full items-center justify-center">
                <svg class="h-16 w-16 text-wread-placeholder" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                </svg>
              </div>
            </div>

            <!-- 分类名称 -->
            <div class="space-y-1">
              <h3 class="text-sm font-medium text-wread-text">{{ category.name }}</h3>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 分类管理器 -->
    <CategoryManager
      :show="showCategoryManager"
      :categories="categoriesForManager"
      @close="showCategoryManager = false"
      @refresh="handleRefreshCategories"
    />

    <!-- 存储提供商管理器 -->
    <StorageProviderManager
      :show="showStorageManager"
      @close="showStorageManager = false"
    />

    <!-- 用户信息编辑模态框 -->
    <UserProfileModal
      :show="showUserProfileModal"
      :user="currentUser"
      @close="showUserProfileModal = false"
      @save="handleSaveUserProfile"
    />
  </div>
</template>

<style scoped>
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

