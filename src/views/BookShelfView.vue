<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import CategoryManager from '@/components/CategoryManager.vue'
import { authApi, getToken, removeToken } from '@/api'

const router = useRouter()
const showUserDropdown = ref(false)
const userDropdownRef = ref<HTMLElement | null>(null)
const showCategoryManager = ref(false)

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

// 模拟书籍分类数据
const bookCategories = ref<BookCategory[]>([
  {
    id: 'fiction',
    name: '网文',
    books: [
      {
        id: '1',
        title: '全职高手',
        author: '蝴蝶蓝',
        cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=240&q=80'
      },
      {
        id: '2',
        title: '斗破苍穹',
        author: '天蚕土豆',
        cover: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=240&q=80'
      },
      {
        id: '3',
        title: '盗墓笔记',
        author: '南派三叔',
        cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=240&q=80'
      },
      {
        id: '4',
        title: '诛仙',
        author: '萧鼎',
        cover: 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&w=240&q=80'
      }
    ]
  },
  {
    id: 'novel',
    name: '传统小说',
    books: [
      {
        id: '5',
        title: '活着',
        author: '余华',
        cover: 'https://images.unsplash.com/photo-1470499122001-449c5239351a?auto=format&fit=crop&w=240&q=80'
      },
      {
        id: '6',
        title: '白夜行',
        author: '东野圭吾',
        cover: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=240&q=80'
      }
    ]
  },
  {
    id: 'computer',
    name: '计算机',
    books: [
      {
        id: '7',
        title: '深入理解计算机系统',
        author: 'Randal E. Bryant',
        cover: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=240&q=80'
      },
      {
        id: '8',
        title: 'JavaScript高级程序设计',
        author: 'Nicholas C. Zakas',
        cover: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=240&q=80'
      }
    ]
  },
  {
    id: 'society',
    name: '社会',
    books: [
      {
        id: '9',
        title: '人类简史',
        author: '尤瓦尔·赫拉利',
        cover: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=240&q=80'
      },
      {
        id: '10',
        title: '乌合之众',
        author: '古斯塔夫·勒庞',
        cover: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=240&q=80'
      }
    ]
  },
  {
    id: 'philosophy',
    name: '推理',
    books: [
      {
        id: '11',
        title: '无人生还',
        author: '阿加莎·克里斯蒂',
        cover: 'https://images.unsplash.com/photo-1544716278-e513176f20b5?auto=format&fit=crop&w=240&q=80'
      },
      {
        id: '12',
        title: '东方快车谋杀案',
        author: '阿加莎·克里斯蒂',
        cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=240&q=80'
      }
    ]
  },
  {
    id: 'featured',
    name: '挪威的森林（2023修订版）',
    books: [
      {
        id: '13',
        title: '挪威的森林',
        author: '村上春树',
        cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=240&q=80'
      }
    ]
  },
  {
    id: 'scifi',
    name: '科幻',
    books: [
      {
        id: '14',
        title: '三体',
        author: '刘慈欣',
        cover: 'https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=240&q=80'
      },
      {
        id: '15',
        title: '银河帝国',
        author: '阿西莫夫',
        cover: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=240&q=80'
      },
      {
        id: '16',
        title: '球状闪电',
        author: '刘慈欣',
        cover: 'https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=240&q=80'
      },
      {
        id: '17',
        title: '流浪地球',
        author: '刘慈欣',
        cover: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=240&q=80'
      }
    ]
  },
  {
    id: 'literature',
    name: '世界文学',
    books: [
      {
        id: '18',
        title: '百年孤独',
        author: '加西亚·马尔克斯',
        cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=240&q=80'
      },
      {
        id: '19',
        title: '追风筝的人',
        author: '卡勒德·胡赛尼',
        cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=240&q=80'
      }
    ]
  }
])

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

// 分类管理相关
const categoriesForManager = computed(() => {
  return bookCategories.value.map(cat => ({
    id: cat.id,
    name: cat.name,
    bookCount: cat.books.length
  }))
})

const handleCreateCategory = (name: string) => {
  const newCategory: BookCategory = {
    id: `cat_${Date.now()}`,
    name,
    books: []
  }
  bookCategories.value.push(newCategory)
}

const handleUpdateCategory = (id: string, name: string) => {
  const category = bookCategories.value.find(cat => cat.id === id)
  if (category) {
    category.name = name
  }
}

const handleDeleteCategory = (id: string) => {
  const index = bookCategories.value.findIndex(cat => cat.id === id)
  if (index !== -1) {
    // 将分类中的书籍移到"未分类"
    // TODO: 实现未分类逻辑
    bookCategories.value.splice(index, 1)
  }
}

const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
}

const handleClickOutside = (event: MouseEvent) => {
  if (userDropdownRef.value && !userDropdownRef.value.contains(event.target as Node)) {
    showUserDropdown.value = false
  }
}

const handleLogout = () => {
  removeToken()
  localStorage.removeItem('zr_current_user')
  showUserDropdown.value = false
  router.push('/')
}

const handleNavigateToUpload = () => {
  showUserDropdown.value = false
  console.log('导航到书籍上传')
  // TODO: 实现上传页面路由
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
          <h1 class="text-2xl font-bold text-wread-text">{{ currentUser?.nickname || currentUser?.username }}</h1>
          <p class="mt-1 text-xs text-wread-text-secondary">{{ currentUser?.bio || '体验卡今日到期' }}</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="showCategoryManager = true"
            class="rounded-full border border-wread-divider bg-white px-5 py-1.5 text-xs font-medium text-wread-text transition hover:bg-wread-bg"
          >
            分类管理
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
              <div v-if="category.books.length === 1" class="h-full w-full">
                <img
                  :src="category.books[0].cover"
                  :alt="category.books[0].title"
                  class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div v-else class="grid h-full w-full grid-cols-2 gap-0.5 bg-white p-0.5">
                <div
                  v-for="(book, index) in category.books.slice(0, 4)"
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
      @create="handleCreateCategory"
      @update="handleUpdateCategory"
      @delete="handleDeleteCategory"
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

