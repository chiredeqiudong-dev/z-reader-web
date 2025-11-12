<script setup lang="ts">
import { ref, watch } from 'vue'

interface UserProfile {
  id: number
  username: string
  nickname: string
  email: string | null
  avatar_url: string | null
  gender: 0 | 1
  bio: string | null
  role: 0 | 1
}

interface Props {
  show: boolean
  user: UserProfile | null
}

interface Emits {
  (e: 'close'): void
  (e: 'save', profile: Partial<UserProfile>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 表单数据
const formData = ref({
  nickname: '',
  email: '',
  avatar_url: '',
  gender: 0 as 0 | 1,
  bio: ''
})

// 错误信息
const errors = ref({
  nickname: '',
  email: '',
  avatar_url: '',
  bio: ''
})

// 监听 user 变化，初始化表单
watch(() => props.user, (user) => {
  if (user) {
    formData.value = {
      nickname: user.nickname || '',
      email: user.email || '',
      avatar_url: user.avatar_url || '',
      gender: user.gender,
      bio: user.bio || ''
    }
  }
}, { immediate: true })

// 验证昵称
const validateNickname = (): boolean => {
  const nickname = formData.value.nickname.trim()
  if (!nickname) {
    errors.value.nickname = '昵称不能为空'
    return false
  }
  if (nickname.length < 2 || nickname.length > 20) {
    errors.value.nickname = '昵称长度必须在2-20个字符之间'
    return false
  }
  errors.value.nickname = ''
  return true
}

// 验证邮箱
const validateEmail = (): boolean => {
  const email = formData.value.email.trim()
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errors.value.email = '请输入有效的邮箱地址'
      return false
    }
  }
  errors.value.email = ''
  return true
}

// 验证头像 URL
const validateAvatarUrl = (): boolean => {
  const url = formData.value.avatar_url.trim()
  if (url) {
    try {
      new URL(url)
      errors.value.avatar_url = ''
      return true
    } catch {
      errors.value.avatar_url = '请输入有效的图片URL'
      return false
    }
  }
  errors.value.avatar_url = ''
  return true
}

// 验证个人简介
const validateBio = (): boolean => {
  const bio = formData.value.bio.trim()
  if (bio.length > 255) {
    errors.value.bio = '个人简介不能超过255个字符'
    return false
  }
  errors.value.bio = ''
  return true
}

// 处理关闭
const handleClose = () => {
  // 清空错误
  errors.value = {
    nickname: '',
    email: '',
    avatar_url: '',
    bio: ''
  }
  emit('close')
}

// 处理保存
const handleSave = () => {
  // 验证所有字段
  const isNicknameValid = validateNickname()
  const isEmailValid = validateEmail()
  const isAvatarUrlValid = validateAvatarUrl()
  const isBioValid = validateBio()

  if (!isNicknameValid || !isEmailValid || !isAvatarUrlValid || !isBioValid) {
    return
  }

  // 准备更新数据
  const updateData: Partial<UserProfile> = {
    nickname: formData.value.nickname.trim(),
    email: formData.value.email.trim() || null,
    avatar_url: formData.value.avatar_url.trim() || null,
    gender: formData.value.gender,
    bio: formData.value.bio.trim() || null
  }

  emit('save', updateData)
}
</script>

<template>
  <Transition name="modal">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="handleClose"
    >
      <div class="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <!-- 标题 -->
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-2xl font-bold text-wread-text">编辑个人资料</h2>
          <button
            @click="handleClose"
            class="rounded-full p-1 text-wread-text-secondary transition hover:bg-wread-bg"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 表单 -->
        <div class="space-y-4">
          <!-- 昵称 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-wread-text">
              昵称 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.nickname"
              type="text"
              placeholder="请输入昵称（2-20字符）"
              class="w-full rounded-lg border px-4 py-3 text-sm text-wread-text placeholder:text-wread-placeholder focus:outline-none focus:ring-2"
              :class="errors.nickname ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-wread-divider focus:border-[#1b88ee] focus:ring-[#1b88ee]/20'"
              @blur="validateNickname"
            />
            <p v-if="errors.nickname" class="mt-1 text-xs text-red-500">{{ errors.nickname }}</p>
          </div>

          <!-- 邮箱 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-wread-text">邮箱</label>
            <input
              v-model="formData.email"
              type="email"
              placeholder="请输入邮箱地址"
              class="w-full rounded-lg border px-4 py-3 text-sm text-wread-text placeholder:text-wread-placeholder focus:outline-none focus:ring-2"
              :class="errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-wread-divider focus:border-[#1b88ee] focus:ring-[#1b88ee]/20'"
              @blur="validateEmail"
            />
            <p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email }}</p>
          </div>

          <!-- 头像 URL -->
          <div>
            <label class="mb-2 block text-sm font-medium text-wread-text">头像 URL</label>
            <input
              v-model="formData.avatar_url"
              type="url"
              placeholder="请输入头像图片链接"
              class="w-full rounded-lg border px-4 py-3 text-sm text-wread-text placeholder:text-wread-placeholder focus:outline-none focus:ring-2"
              :class="errors.avatar_url ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-wread-divider focus:border-[#1b88ee] focus:ring-[#1b88ee]/20'"
              @blur="validateAvatarUrl"
            />
            <p v-if="errors.avatar_url" class="mt-1 text-xs text-red-500">{{ errors.avatar_url }}</p>
            <!-- 头像预览 -->
            <div v-if="formData.avatar_url && !errors.avatar_url" class="mt-2 flex items-center gap-2">
              <span class="text-xs text-wread-text-secondary">预览:</span>
              <img
                :src="formData.avatar_url"
                alt="头像预览"
                class="h-12 w-12 rounded-full object-cover"
                @error="errors.avatar_url = '图片加载失败，请检查URL'"
              />
            </div>
          </div>

          <!-- 性别 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-wread-text">性别</label>
            <div class="flex gap-4">
              <label class="flex cursor-pointer items-center gap-2">
                <input
                  v-model="formData.gender"
                  type="radio"
                  :value="1"
                  class="h-4 w-4 cursor-pointer text-[#1b88ee] focus:ring-2 focus:ring-[#1b88ee]/20"
                />
                <span class="text-sm text-wread-text">男</span>
              </label>
              <label class="flex cursor-pointer items-center gap-2">
                <input
                  v-model="formData.gender"
                  type="radio"
                  :value="0"
                  class="h-4 w-4 cursor-pointer text-[#1b88ee] focus:ring-2 focus:ring-[#1b88ee]/20"
                />
                <span class="text-sm text-wread-text">女</span>
              </label>
            </div>
          </div>

          <!-- 个人简介 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-wread-text">个人简介</label>
            <textarea
              v-model="formData.bio"
              placeholder="介绍一下自己吧（最多255字符）"
              rows="3"
              class="w-full rounded-lg border px-4 py-3 text-sm text-wread-text placeholder:text-wread-placeholder focus:outline-none focus:ring-2"
              :class="errors.bio ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-wread-divider focus:border-[#1b88ee] focus:ring-[#1b88ee]/20'"
              @blur="validateBio"
            ></textarea>
            <p v-if="errors.bio" class="mt-1 text-xs text-red-500">{{ errors.bio }}</p>
            <p class="mt-1 text-xs text-wread-text-secondary">{{ formData.bio.length }} / 255</p>
          </div>
        </div>

        <!-- 按钮 -->
        <div class="mt-6 flex gap-3">
          <button
            @click="handleSave"
            class="flex-1 rounded-lg bg-[#1b88ee] py-3 font-medium text-white transition hover:opacity-90"
          >
            保存
          </button>
          <button
            @click="handleClose"
            class="flex-1 rounded-lg border border-wread-divider bg-white py-3 font-medium text-wread-text transition hover:bg-wread-bg"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
}
</style>

