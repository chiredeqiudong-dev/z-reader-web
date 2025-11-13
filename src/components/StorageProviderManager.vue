<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { storageApi, getErrorMessage, type StorageProviderVO, type StorageProviderDTO } from '@/api'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const mode = ref<'list' | 'create' | 'edit'>('list')
const providers = ref<StorageProviderVO[]>([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

// 表单数据
const formData = ref<StorageProviderDTO>({
  providerName: '',
  storageType: 'LOCAL',
  isActive: 1,
  localRootPath: '',
  endpoint: '',
  region: '',
  accessKey: '',
  secretKey: '',
  bucketName: '',
  basePath: '',
})
const editingProviderId = ref<number>(0)
const formErrors = ref<Record<string, string>>({})

watch(() => props.show, (newVal) => {
  if (newVal) {
    mode.value = 'list'
    loadProviders()
    resetForm()
  }
})

// 加载存储提供商列表
const loadProviders = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await storageApi.listProviders()
    if (response.code === '2000' && response.data) {
      providers.value = response.data
    } else {
      errorMessage.value = getErrorMessage(response.code)
    }
  } catch (error) {
    console.error('加载存储提供商失败:', error)
    errorMessage.value = '加载失败，请检查网络连接'
  } finally {
    isLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  formData.value = {
    providerName: '',
    storageType: 'LOCAL',
    isActive: 1,
    localRootPath: '',
    endpoint: '',
    region: '',
    accessKey: '',
    secretKey: '',
    bucketName: '',
    basePath: '',
  }
  editingProviderId.value = 0
  formErrors.value = {}
  errorMessage.value = ''
}

// 验证表单
const validateForm = () => {
  formErrors.value = {}
  
  if (!formData.value.providerName.trim()) {
    formErrors.value.providerName = '请输入提供商名称'
  } else if (formData.value.providerName.length > 32) {
    formErrors.value.providerName = '提供商名称不能超过32个字符'
  }

  if (formData.value.storageType === 'LOCAL') {
    if (!formData.value.localRootPath?.trim()) {
      formErrors.value.localRootPath = '请输入本地绝对路径'
    }
  } else {
    // S3, COS, OSS, KODO 都需要云存储配置
    if (!formData.value.endpoint?.trim()) {
      formErrors.value.endpoint = '请输入云存储端点'
    }
    if (!formData.value.accessKey?.trim()) {
      formErrors.value.accessKey = '请输入访问密钥'
    }
    if (!formData.value.secretKey?.trim()) {
      formErrors.value.secretKey = '请输入私密密钥'
    }
    if (!formData.value.bucketName?.trim()) {
      formErrors.value.bucketName = '请输入存储桶名称'
    }
  }

  return Object.keys(formErrors.value).length === 0
}

// 创建
const handleCreate = () => {
  mode.value = 'create'
  resetForm()
}

// 编辑
const handleEdit = async (provider: StorageProviderVO) => {
  mode.value = 'edit'
  editingProviderId.value = provider.id
  
  // 如果是编辑模式，需要获取完整的数据（包括未脱敏的密钥）
  try {
    const response = await storageApi.getProviderById(provider.id)
    if (response.code === '2000' && response.data) {
      const data = response.data
      formData.value = {
        providerName: data.providerName,
        storageType: data.storageType,
        isActive: data.isActive,
        localRootPath: data.localRootPath || '',
        endpoint: data.endpoint || '',
        region: data.region || '',
        accessKey: data.accessKey || '',
        secretKey: data.secretKey || '',
        bucketName: data.bucketName || '',
        basePath: data.basePath || '',
      }
    }
  } catch (error) {
    console.error('获取提供商详情失败:', error)
    alert('获取提供商详情失败')
  }
}

// 删除
const handleDelete = async (providerId: number) => {
  if (!confirm('确定要删除该存储提供商吗？')) {
    return
  }

  try {
    const response = await storageApi.deleteProvider(providerId)
    if (response.code === '2000') {
      await loadProviders()
    } else {
      alert(getErrorMessage(response.code))
    }
  } catch (error) {
    console.error('删除存储提供商失败:', error)
    alert('删除失败，请稍后重试')
  }
}

// 切换启用状态
const handleToggleActive = async (providerId: number) => {
  try {
    const response = await storageApi.toggleActive(providerId)
    if (response.code === '2000') {
      await loadProviders()
    } else {
      alert(getErrorMessage(response.code))
    }
  } catch (error) {
    console.error('切换状态失败:', error)
    alert('操作失败，请稍后重试')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return
  if (isSubmitting.value) return

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    if (mode.value === 'create') {
      const response = await storageApi.createProvider(formData.value)
      if (response.code === '2000') {
        mode.value = 'list'
        await loadProviders()
        resetForm()
      } else {
        errorMessage.value = getErrorMessage(response.code)
      }
    } else if (mode.value === 'edit') {
      const response = await storageApi.updateProvider(editingProviderId.value, formData.value)
      if (response.code === '2000') {
        mode.value = 'list'
        await loadProviders()
        resetForm()
      } else {
        errorMessage.value = getErrorMessage(response.code)
      }
    }
  } catch (error) {
    console.error('操作失败:', error)
    errorMessage.value = '操作失败，请检查网络连接'
  } finally {
    isSubmitting.value = false
  }
}

// 取消
const handleCancel = () => {
  mode.value = 'list'
  resetForm()
}

// 关闭
const handleClose = () => {
  emit('close')
}

// 是否显示本地存储字段
const isLocalStorage = computed(() => formData.value.storageType === 'LOCAL')
// 是否显示云存储字段
const isCloudStorage = computed(() => ['S3', 'COS', 'OSS', 'KODO'].includes(formData.value.storageType))

// 存储类型选项
const storageTypeOptions = [
  { value: 'LOCAL', label: '本地存储' },
  { value: 'S3', label: 'AWS S3' },
  { value: 'COS', label: '腾讯云 COS' },
  { value: 'OSS', label: '阿里云 OSS' },
  { value: 'KODO', label: '七牛云 KODO' }
]

// 获取存储类型显示名称
const getStorageTypeLabel = (type: string) => {
  const option = storageTypeOptions.find(opt => opt.value === type)
  return option?.label || type
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- 遮罩层 -->
      <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>
      
      <!-- 弹窗内容 -->
      <div class="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <!-- 列表模式 -->
        <div v-if="mode === 'list'" class="max-h-[80vh] overflow-y-auto p-6">
          <!-- 标题 -->
          <div class="mb-6 flex items-center justify-between">
            <h2 class="text-xl font-bold text-wread-text">存储提供商管理</h2>
            <button
              @click="handleClose"
              class="flex h-8 w-8 items-center justify-center rounded-full text-wread-text-secondary transition hover:bg-wread-bg"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 错误提示 -->
          <div v-if="errorMessage" class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {{ errorMessage }}
          </div>

          <!-- 创建按钮 -->
          <button
            @click="handleCreate"
            class="mb-4 w-full rounded-lg border-2 border-dashed border-wread-divider bg-wread-bg py-3 text-sm font-medium text-wread-text transition hover:border-[#1b88ee] hover:bg-blue-50 hover:text-[#1b88ee]"
          >
            + 创建存储提供商
          </button>

          <!-- 加载状态 -->
          <div v-if="isLoading" class="py-12 text-center">
            <div class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#1b88ee] border-t-transparent"></div>
            <p class="mt-2 text-sm text-wread-text-secondary">加载中...</p>
          </div>

          <!-- 提供商列表 -->
          <div v-else-if="providers.length > 0" class="space-y-2">
            <div
              v-for="provider in providers"
              :key="provider.id"
              class="rounded-lg border border-wread-divider bg-white p-4 transition hover:border-[#1b88ee] hover:shadow-sm"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <h3 class="font-medium text-wread-text">{{ provider.providerName }}</h3>
                    <span
                      class="rounded-full px-2 py-0.5 text-xs"
                      :class="provider.storageType === 'LOCAL' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'"
                    >
                      {{ getStorageTypeLabel(provider.storageType) }}
                    </span>
                  </div>
                  <div class="mt-2 space-y-1 text-xs text-wread-text-secondary">
                    <p v-if="provider.storageType === 'LOCAL'">路径: {{ provider.localRootPath }}</p>
                    <p v-if="provider.storageType !== 'LOCAL' && provider.endpoint">端点: {{ provider.endpoint }}</p>
                    <p v-if="provider.storageType !== 'LOCAL' && provider.bucketName">存储桶: {{ provider.bucketName }}</p>
                    <p v-if="provider.basePath">资源访问前缀: {{ provider.basePath }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <!-- 启用/停用开关 -->
                  <button
                    @click="handleToggleActive(provider.id)"
                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                    :class="provider.isActive === 1 ? 'bg-[#1b88ee]' : 'bg-gray-300'"
                  >
                    <span
                      class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                      :class="provider.isActive === 1 ? 'translate-x-6' : 'translate-x-1'"
                    ></span>
                  </button>
                  <button
                    @click="handleEdit(provider)"
                    class="rounded-full p-2 text-wread-text-secondary transition hover:bg-wread-bg hover:text-[#1b88ee]"
                  >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </button>
                  <button
                    @click="handleDelete(provider.id)"
                    class="rounded-full p-2 text-wread-text-secondary transition hover:bg-red-50 hover:text-red-600"
                  >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="py-12 text-center">
            <svg class="mx-auto mb-4 h-16 w-16 text-wread-placeholder" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
            <p class="text-sm text-wread-text-secondary">暂无存储提供商</p>
          </div>
        </div>

        <!-- 创建/编辑模式 -->
        <div v-else class="max-h-[80vh] overflow-y-auto p-6">
          <!-- 标题 -->
          <div class="mb-6 flex items-center justify-between">
            <h2 class="text-xl font-bold text-wread-text">{{ mode === 'create' ? '创建存储提供商' : '编辑存储提供商' }}</h2>
            <button
              @click="handleCancel"
              class="flex h-8 w-8 items-center justify-center rounded-full text-wread-text-secondary transition hover:bg-wread-bg"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 表单 -->
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- 错误提示 -->
            <div v-if="errorMessage" class="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {{ errorMessage }}
            </div>

            <!-- 提供商名称 -->
            <div>
              <label class="mb-2 block text-sm font-medium text-wread-text">提供商名称 <span class="text-red-500">*</span></label>
              <input
                v-model="formData.providerName"
                type="text"
                placeholder="请输入提供商名称"
                class="w-full rounded-lg border px-4 py-2.5 text-sm text-wread-text placeholder:text-wread-placeholder focus:border-[#1b88ee] focus:outline-none focus:ring-2 focus:ring-[#1b88ee]/20"
                :class="formErrors.providerName ? 'border-red-500' : 'border-wread-divider'"
                :disabled="isSubmitting"
              />
              <p v-if="formErrors.providerName" class="mt-1 text-xs text-red-500">{{ formErrors.providerName }}</p>
            </div>

            <!-- 存储类型 -->
            <div>
              <label class="mb-2 block text-sm font-medium text-wread-text">存储类型 <span class="text-red-500">*</span></label>
              <select
                v-model="formData.storageType"
                :disabled="isSubmitting || mode === 'edit'"
                class="w-full rounded-lg border border-wread-divider px-4 py-2.5 text-sm text-wread-text focus:border-[#1b88ee] focus:outline-none focus:ring-2 focus:ring-[#1b88ee]/20 disabled:cursor-not-allowed disabled:bg-gray-50"
              >
                <option v-for="option in storageTypeOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <p v-if="mode === 'edit'" class="mt-1 text-xs text-wread-text-secondary">编辑时无法修改存储类型</p>
            </div>

            <!-- 本地存储字段 -->
            <template v-if="isLocalStorage">
              <div>
                <label class="mb-2 block text-sm font-medium text-wread-text">本地绝对路径 <span class="text-red-500">*</span></label>
                <input
                  v-model="formData.localRootPath"
                  type="text"
                  placeholder="/var/books/"
                  class="w-full rounded-lg border px-4 py-2.5 text-sm text-wread-text placeholder:text-wread-placeholder focus:border-[#1b88ee] focus:outline-none focus:ring-2 focus:ring-[#1b88ee]/20"
                  :class="formErrors.localRootPath ? 'border-red-500' : 'border-wread-divider'"
                  :disabled="isSubmitting"
                />
                <p v-if="formErrors.localRootPath" class="mt-1 text-xs text-red-500">{{ formErrors.localRootPath }}</p>
              </div>
            </template>

            <!-- 云存储字段 -->
            <template v-if="isCloudStorage">
              <div>
                <label class="mb-2 block text-sm font-medium text-wread-text">端点 <span class="text-red-500">*</span></label>
                <input
                  v-model="formData.endpoint"
                  type="text"
                  placeholder="https://oss-cn-hangzhou.aliyuncs.com"
                  class="w-full rounded-lg border px-4 py-2.5 text-sm text-wread-text placeholder:text-wread-placeholder focus:border-[#1b88ee] focus:outline-none focus:ring-2 focus:ring-[#1b88ee]/20"
                  :class="formErrors.endpoint ? 'border-red-500' : 'border-wread-divider'"
                  :disabled="isSubmitting"
                />
                <p v-if="formErrors.endpoint" class="mt-1 text-xs text-red-500">{{ formErrors.endpoint }}</p>
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-wread-text">区域</label>
                <input
                  v-model="formData.region"
                  type="text"
                  placeholder="cn-hangzhou"
                  class="w-full rounded-lg border border-wread-divider px-4 py-2.5 text-sm text-wread-text placeholder:text-wread-placeholder focus:border-[#1b88ee] focus:outline-none focus:ring-2 focus:ring-[#1b88ee]/20"
                  :disabled="isSubmitting"
                />
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-wread-text">访问密钥 <span class="text-red-500">*</span></label>
                <input
                  v-model="formData.accessKey"
                  type="text"
                  placeholder="LTAI5t..."
                  class="w-full rounded-lg border px-4 py-2.5 text-sm text-wread-text placeholder:text-wread-placeholder focus:border-[#1b88ee] focus:outline-none focus:ring-2 focus:ring-[#1b88ee]/20"
                  :class="formErrors.accessKey ? 'border-red-500' : 'border-wread-divider'"
                  :disabled="isSubmitting"
                />
                <p v-if="formErrors.accessKey" class="mt-1 text-xs text-red-500">{{ formErrors.accessKey }}</p>
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-wread-text">私密密钥 <span class="text-red-500">*</span></label>
                <input
                  v-model="formData.secretKey"
                  type="password"
                  placeholder="abc123..."
                  class="w-full rounded-lg border px-4 py-2.5 text-sm text-wread-text placeholder:text-wread-placeholder focus:border-[#1b88ee] focus:outline-none focus:ring-2 focus:ring-[#1b88ee]/20"
                  :class="formErrors.secretKey ? 'border-red-500' : 'border-wread-divider'"
                  :disabled="isSubmitting"
                />
                <p v-if="formErrors.secretKey" class="mt-1 text-xs text-red-500">{{ formErrors.secretKey }}</p>
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-wread-text">存储桶名称 <span class="text-red-500">*</span></label>
                <input
                  v-model="formData.bucketName"
                  type="text"
                  placeholder="my-books"
                  class="w-full rounded-lg border px-4 py-2.5 text-sm text-wread-text placeholder:text-wread-placeholder focus:border-[#1b88ee] focus:outline-none focus:ring-2 focus:ring-[#1b88ee]/20"
                  :class="formErrors.bucketName ? 'border-red-500' : 'border-wread-divider'"
                  :disabled="isSubmitting"
                />
                <p v-if="formErrors.bucketName" class="mt-1 text-xs text-red-500">{{ formErrors.bucketName }}</p>
              </div>
            </template>

            <!-- 资源访问前缀（通用） -->
            <div>
              <label class="mb-2 block text-sm font-medium text-wread-text">资源访问前缀</label>
              <input
                v-model="formData.basePath"
                type="text"
                placeholder="/books/"
                class="w-full rounded-lg border border-wread-divider px-4 py-2.5 text-sm text-wread-text placeholder:text-wread-placeholder focus:border-[#1b88ee] focus:outline-none focus:ring-2 focus:ring-[#1b88ee]/20"
                :disabled="isSubmitting"
              />
            </div>

            <!-- 按钮组 -->
            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="handleCancel"
                :disabled="isSubmitting"
                class="flex-1 rounded-lg border border-wread-divider bg-white py-2.5 text-sm font-medium text-wread-text transition hover:bg-wread-bg disabled:cursor-not-allowed disabled:opacity-50"
              >
                取消
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="flex-1 rounded-lg bg-[#1b88ee] py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {{ isSubmitting ? '提交中...' : (mode === 'create' ? '创建' : '保存') }}
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

