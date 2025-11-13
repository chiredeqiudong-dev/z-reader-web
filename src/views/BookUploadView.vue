<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authApi, getToken, removeToken } from '@/api'

const router = useRouter()
const currentUser = ref<any>(null)
const showUserDropdown = ref(false)
const userDropdownRef = ref<HTMLElement | null>(null)

const goBack = () => {
  router.push('/bookshelf')
}

const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
}

const handleClickOutside = (event: MouseEvent) => {
  if (userDropdownRef.value && !userDropdownRef.value.contains(event.target as Node)) {
    showUserDropdown.value = false
  }
}

const getUserInitial = () => {
  return currentUser.value?.username?.charAt(0).toUpperCase() || 'U'
}

const handleLogout = async () => {
  try {
    await authApi.logout()
    console.log('后端登出成功')
  } catch (error) {
    console.error('后端登出失败:', error)
  } finally {
    removeToken()
    localStorage.removeItem('zr_current_user')
    showUserDropdown.value = false
    router.push('/')
  }
}

const handleNavigateToShelf = () => {
  showUserDropdown.value = false
  router.push('/bookshelf')
}

onMounted(async () => {
  // 验证用户登录状态
  try {
    const token = getToken()
    if (!token) {
      router.push('/')
      return
    }

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
      localStorage.setItem('zr_current_user', JSON.stringify(currentUser.value))
    } else {
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
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-10 border-b border-wread-divider bg-white">
      <div class="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
        <!-- Logo -->
        <div class="flex items-center gap-6">
          <button @click="goBack" class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-lg font-semibold text-white">
              ZR
            </div>
            <span class="text-xl font-bold text-wread-text">极简阅读</span>
          </button>
        </div>

        <!-- 右侧菜单 -->
        <div class="flex items-center gap-6 text-sm text-wread-text-secondary">
          <button @click="goBack" class="hover:text-wread-text">我的书架</button>
          
          <!-- 用户头像和下拉菜单 -->
          <div v-if="currentUser" ref="userDropdownRef" class="relative">
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
                class="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5"
              >
                <div class="py-1">
                  <button
                    @click="handleNavigateToShelf"
                    class="flex w-full items-center gap-3 px-4 py-2 text-sm text-wread-text transition hover:bg-wread-bg"
                  >
                    <svg class="h-5 w-5 text-wread-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                    </svg>
                    我的书架
                  </button>

                  <button
                    class="flex w-full items-center gap-3 px-4 py-2 text-sm text-[#1b88ee] transition hover:bg-blue-50"
                  >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    书籍上传
                  </button>
                </div>

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
      <!-- 页面标题 -->
      <div class="mb-8">
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
            <h1 class="text-2xl font-bold text-wread-text">书籍上传</h1>
            <p class="mt-1 text-sm text-wread-text-secondary">上传你的电子书到书架</p>
          </div>
        </div>
      </div>

      <!-- 上传区域占位 -->
      <div class="mx-auto max-w-3xl">
        <div class="rounded-2xl border-2 border-dashed border-wread-divider bg-wread-bg p-12 text-center">
          <svg class="mx-auto mb-6 h-20 w-20 text-wread-placeholder" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
          <h3 class="mb-2 text-lg font-semibold text-wread-text">书籍上传功能</h3>
          <p class="mb-6 text-sm text-wread-text-secondary">
            此功能正在开发中，敬请期待
          </p>
          <div class="flex flex-col gap-3 text-xs text-wread-text-secondary">
            <p>支持格式：EPUB、MOBI、AZW3、PDF、TXT</p>
            <p>单个文件大小限制：100MB</p>
            <p>您可以将书籍上传到不同的分类中</p>
          </div>
        </div>

        <!-- 功能说明 -->
        <div class="mt-8 rounded-xl border border-wread-divider bg-white p-6">
          <h3 class="mb-4 text-base font-semibold text-wread-text">上传功能说明</h3>
          <ul class="space-y-3 text-sm text-wread-text-secondary">
            <li class="flex items-start gap-2">
              <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1b88ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <span>支持批量上传多个文件</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1b88ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <span>自动提取书籍元数据（标题、作者、封面等）</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1b88ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <span>可选择将书籍添加到指定分类</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1b88ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <span>支持断点续传，大文件上传更稳定</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
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

