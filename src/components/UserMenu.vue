<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface User {
  id?: number
  username: string
  nickname?: string
  avatar_url?: string | null
  email?: string | null
  gender?: 0 | 1
  bio?: string | null
  role?: 0 | 1
}

const props = defineProps<{
  user: User
}>()

const emit = defineEmits<{
  logout: []
  navigateToShelf: []
  navigateToUpload: []
}>()

const showDropdown = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    showDropdown.value = false
  }
}

const handleLogout = () => {
  showDropdown.value = false
  emit('logout')
}

const handleNavigateToShelf = () => {
  showDropdown.value = false
  emit('navigateToShelf')
}

const handleNavigateToUpload = () => {
  showDropdown.value = false
  emit('navigateToUpload')
}

// 获取用户名首字母作为默认头像
const getUserInitial = () => {
  return props.user.username?.charAt(0).toUpperCase() || 'U'
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="flex items-center gap-3">
    <!-- 我的书架链接 -->
    <button
      @click="handleNavigateToShelf"
      class="text-sm text-[#1b88ee] hover:opacity-80"
    >
      我的书架
    </button>

    <!-- 用户头像和下拉菜单 -->
    <div ref="dropdownRef" class="relative">
      <button
        @click="toggleDropdown"
        class="flex h-8 w-8 items-center justify-center rounded-full bg-[#1b88ee] text-sm font-semibold text-white transition hover:opacity-90"
        :class="{ 'ring-2 ring-[#1b88ee] ring-offset-2': showDropdown }"
      >
        <img
          v-if="user.avatar_url"
          :src="user.avatar_url"
          :alt="user.nickname || user.username"
          class="h-full w-full rounded-full object-cover"
          @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
        />
        <span v-if="!user.avatar_url" class="flex h-full w-full items-center justify-center">{{ getUserInitial() }}</span>
      </button>

      <!-- 下拉菜单 -->
      <Transition name="dropdown">
        <div
          v-if="showDropdown"
          class="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5"
        >
          <!-- 菜单项 -->
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

