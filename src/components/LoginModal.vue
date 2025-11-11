<script setup lang="ts">
import { ref } from 'vue'
import { authApi, setToken, getErrorMessage, type UserInfoVO } from '@/api'

const props = defineProps<{
  show: boolean
}>()

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

const emit = defineEmits<{
  close: []
  loginSuccess: [username: string, email: string | null, userData: UserData]
}>()

const mode = ref<'login' | 'forgot'>('login')
const username = ref('')
const password = ref('')
const email = ref('')
const usernameError = ref('')
const passwordError = ref('')
const emailError = ref('')
const resetEmailSent = ref(false)
const showPassword = ref(false)
const isLoading = ref(false)

const validateUsername = () => {
  const value = username.value
  if (!value) {
    usernameError.value = '请输入账号'
    return false
  }
  if (value.length < 5 || value.length > 20) {
    usernameError.value = '账号长度必须在5-20个字符之间'
    return false
  }
  if (!/^[a-zA-Z0-9_]+$/.test(value)) {
    usernameError.value = '账号只能包含字母、数字和下划线'
    return false
  }
  usernameError.value = ''
  return true
}

const validatePassword = () => {
  const value = password.value
  if (!value) {
    passwordError.value = '请输入密码'
    return false
  }
  if (value.length < 6 || value.length > 20) {
    passwordError.value = '密码长度必须在6-20个字符之间'
    return false
  }
  passwordError.value = ''
  return true
}

const validateEmail = () => {
  const value = email.value
  if (!value) {
    emailError.value = '请输入邮箱'
    return false
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    emailError.value = '请输入有效的邮箱地址'
    return false
  }
  emailError.value = ''
  return true
}

const handleSubmit = async () => {
  if (mode.value === 'login') {
    const isUsernameValid = validateUsername()
    const isPasswordValid = validatePassword()
    
    if (!isUsernameValid || !isPasswordValid) {
      return
    }

    isLoading.value = true
    
    try {
      // 调用后端登录 API
      const response = await authApi.login({
        username: username.value,
        password: password.value
      })

      if (response.code === '2000' && response.data) {
        // 保存 token
        setToken(response.data.token)
        
        // 转换后端返回的用户信息格式
        const userInfo = response.data.userInfo
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
        
        emit('loginSuccess', userData.username, userData.email, userData)
        handleClose()
      } else {
        passwordError.value = getErrorMessage(response.code)
      }
    } catch (error) {
      console.error('登录失败:', error)
      passwordError.value = '登录失败，请检查网络连接'
    } finally {
      isLoading.value = false
    }
  }
}

const handleForgotPassword = () => {
  mode.value = 'forgot'
  resetEmailSent.value = false
}

const handleBackToLogin = () => {
  mode.value = 'login'
  email.value = ''
  emailError.value = ''
  resetEmailSent.value = false
}

const handleResetPassword = () => {
  const isEmailValid = validateEmail()
  
  if (isEmailValid) {
    console.log('发送密码重置邮件至:', email.value)
    // TODO: 实现实际的密码重置逻辑
    resetEmailSent.value = true
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleClose = () => {
  emit('close')
  // 清空表单
  setTimeout(() => {
    mode.value = 'login'
    username.value = ''
    password.value = ''
    email.value = ''
    usernameError.value = ''
    passwordError.value = ''
    emailError.value = ''
    resetEmailSent.value = false
    showPassword.value = false
  }, 300)
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- 遮罩层 -->
      <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>
      
      <!-- 弹窗内容 -->
      <div class="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <!-- 关闭按钮 -->
        <button
          @click="handleClose"
          class="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-wread-text-secondary transition hover:bg-wread-bg"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- 登录模式 -->
        <div v-if="mode === 'login'">
          <!-- Logo 和标题 -->
          <div class="mb-8 flex flex-col items-center">
            <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-xl font-semibold text-white">
              ZR
            </div>
            <h2 class="text-2xl font-bold text-wread-text">欢迎回来</h2>
            <p class="mt-2 text-sm text-wread-text-secondary">登录您的极简阅读账户</p>
          </div>

          <!-- 表单 -->
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- 账号 -->
            <div>
              <label class="mb-2 block text-sm font-medium text-wread-text">账号</label>
              <input
                v-model="username"
                type="text"
                placeholder="请输入账号"
                @blur="validateUsername"
                class="w-full rounded-lg border px-4 py-3 text-sm text-wread-text placeholder:text-wread-placeholder focus:border-[#1b88ee] focus:outline-none focus:ring-2 focus:ring-[#1b88ee]/20"
                :class="usernameError ? 'border-red-500' : 'border-wread-divider'"
              />
              <p v-if="usernameError" class="mt-1 text-xs text-red-500">{{ usernameError }}</p>
            </div>

            <!-- 密码 -->
            <div>
              <label class="mb-2 block text-sm font-medium text-wread-text">密码</label>
              <div class="relative">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入密码"
                  @blur="validatePassword"
                  class="w-full rounded-lg border px-4 py-3 pr-10 text-sm text-wread-text placeholder:text-wread-placeholder focus:border-[#1b88ee] focus:outline-none focus:ring-2 focus:ring-[#1b88ee]/20"
                  :class="passwordError ? 'border-red-500' : 'border-wread-divider'"
                />
                <button
                  type="button"
                  @click="togglePasswordVisibility"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-wread-text-secondary hover:text-wread-text"
                >
                  <svg v-if="showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                  <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </button>
              </div>
              <p v-if="passwordError" class="mt-1 text-xs text-red-500">{{ passwordError }}</p>
            </div>

            <!-- 忘记密码 -->
            <div class="flex justify-end">
              <button type="button" @click="handleForgotPassword" class="text-sm text-[#1b88ee] hover:opacity-80">
                忘记密码？
              </button>
            </div>

            <!-- 提交按钮 -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full rounded-lg bg-[#1b88ee] py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span v-if="!isLoading">登录</span>
              <span v-else class="flex items-center justify-center gap-2">
                <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                登录中...
              </span>
            </button>
          </form>
        </div>

        <!-- 找回密码模式 -->
        <div v-else-if="mode === 'forgot'">
          <!-- Logo 和标题 -->
          <div class="mb-8 flex flex-col items-center">
            <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-xl font-semibold text-white">
              ZR
            </div>
            <h2 class="text-2xl font-bold text-wread-text">找回密码</h2>
            <p class="mt-2 text-sm text-wread-text-secondary">
              {{ resetEmailSent ? '邮件已发送' : '请输入您的邮箱地址' }}
            </p>
          </div>

          <!-- 成功提示 -->
          <div v-if="resetEmailSent" class="space-y-6">
            <div class="rounded-lg bg-green-50 p-4 text-center">
              <svg class="mx-auto mb-3 h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <p class="text-sm text-wread-text">
                密码重置邮件已发送至
              </p>
              <p class="mt-1 font-medium text-wread-text">{{ email }}</p>
              <p class="mt-3 text-xs text-wread-text-secondary">
                请查收邮件并按照提示重置密码
              </p>
            </div>

            <button
              @click="handleBackToLogin"
              class="w-full rounded-lg border border-wread-divider bg-white py-3 text-sm font-medium text-wread-text transition hover:bg-wread-bg"
            >
              返回登录
            </button>
          </div>

          <!-- 找回表单 -->
          <form v-else @submit.prevent="handleResetPassword" class="space-y-4">
            <!-- 邮箱 -->
            <div>
              <label class="mb-2 block text-sm font-medium text-wread-text">邮箱</label>
              <input
                v-model="email"
                type="email"
                placeholder="请输入您的邮箱地址"
                @blur="validateEmail"
                class="w-full rounded-lg border px-4 py-3 text-sm text-wread-text placeholder:text-wread-placeholder focus:border-[#1b88ee] focus:outline-none focus:ring-2 focus:ring-[#1b88ee]/20"
                :class="emailError ? 'border-red-500' : 'border-wread-divider'"
              />
              <p v-if="emailError" class="mt-1 text-xs text-red-500">{{ emailError }}</p>
              <p v-else class="mt-1 text-xs text-wread-text-secondary">
                我们将向该邮箱发送密码重置链接
              </p>
            </div>

            <!-- 按钮组 -->
            <div class="space-y-3">
              <button
                type="submit"
                class="w-full rounded-lg bg-[#1b88ee] py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                发送重置邮件
              </button>
              <button
                type="button"
                @click="handleBackToLogin"
                class="w-full rounded-lg border border-wread-divider bg-white py-3 text-sm font-medium text-wread-text transition hover:bg-wread-bg"
              >
                返回登录
              </button>
            </div>
          </form>
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

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>

