<script setup lang="ts">
import { ref, watch } from 'vue'

interface Category {
  id: string
  name: string
  bookCount: number
}

const props = defineProps<{
  show: boolean
  categories: Category[]
}>()

const emit = defineEmits<{
  close: []
  create: [name: string]
  update: [id: string, name: string]
  delete: [id: string]
}>()

const mode = ref<'list' | 'create' | 'edit'>('list')
const categoryName = ref('')
const editingCategoryId = ref('')
const nameError = ref('')

watch(() => props.show, (newVal) => {
  if (newVal) {
    mode.value = 'list'
    categoryName.value = ''
    editingCategoryId.value = ''
    nameError.value = ''
  }
})

const validateName = () => {
  const name = categoryName.value.trim()
  if (!name) {
    nameError.value = '请输入分类名称'
    return false
  }
  if (name.length < 2 || name.length > 20) {
    nameError.value = '分类名称长度必须在2-20个字符之间'
    return false
  }
  nameError.value = ''
  return true
}

const handleCreate = () => {
  mode.value = 'create'
  categoryName.value = ''
  nameError.value = ''
}

const handleEdit = (category: Category) => {
  mode.value = 'edit'
  categoryName.value = category.name
  editingCategoryId.value = category.id
  nameError.value = ''
}

const handleDelete = (categoryId: string) => {
  if (confirm('确定要删除该分类吗？分类内的书籍将会移到未分类。')) {
    emit('delete', categoryId)
  }
}

const handleSubmit = () => {
  if (!validateName()) return

  if (mode.value === 'create') {
    emit('create', categoryName.value.trim())
  } else if (mode.value === 'edit') {
    emit('update', editingCategoryId.value, categoryName.value.trim())
  }
  
  mode.value = 'list'
  categoryName.value = ''
  editingCategoryId.value = ''
}

const handleCancel = () => {
  mode.value = 'list'
  categoryName.value = ''
  editingCategoryId.value = ''
  nameError.value = ''
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- 遮罩层 -->
      <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>
      
      <!-- 弹窗内容 -->
      <div class="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <!-- 列表模式 -->
        <div v-if="mode === 'list'" class="max-h-[80vh] overflow-y-auto p-6">
          <!-- 标题 -->
          <div class="mb-6 flex items-center justify-between">
            <h2 class="text-xl font-bold text-wread-text">分类管理</h2>
            <button
              @click="handleClose"
              class="flex h-8 w-8 items-center justify-center rounded-full text-wread-text-secondary transition hover:bg-wread-bg"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 创建按钮 -->
          <button
            @click="handleCreate"
            class="mb-4 w-full rounded-lg border-2 border-dashed border-wread-divider bg-wread-bg py-3 text-sm font-medium text-wread-text transition hover:border-[#1b88ee] hover:bg-blue-50 hover:text-[#1b88ee]"
          >
            + 创建新分类
          </button>

          <!-- 分类列表 -->
          <div class="space-y-2">
            <div
              v-for="category in categories"
              :key="category.id"
              class="flex items-center justify-between rounded-lg border border-wread-divider bg-white p-4 transition hover:border-[#1b88ee] hover:shadow-sm"
            >
              <div class="flex-1">
                <h3 class="font-medium text-wread-text">{{ category.name }}</h3>
                <p class="mt-1 text-xs text-wread-text-secondary">{{ category.bookCount }} 本书籍</p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="handleEdit(category)"
                  class="rounded-full p-2 text-wread-text-secondary transition hover:bg-wread-bg hover:text-[#1b88ee]"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </button>
                <button
                  @click="handleDelete(category.id)"
                  class="rounded-full p-2 text-wread-text-secondary transition hover:bg-red-50 hover:text-red-600"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="categories.length === 0" class="py-12 text-center">
            <svg class="mx-auto mb-4 h-16 w-16 text-wread-placeholder" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
            </svg>
            <p class="text-sm text-wread-text-secondary">暂无分类</p>
          </div>
        </div>

        <!-- 创建/编辑模式 -->
        <div v-else class="p-6">
          <!-- 标题 -->
          <div class="mb-6 flex items-center justify-between">
            <h2 class="text-xl font-bold text-wread-text">{{ mode === 'create' ? '创建分类' : '编辑分类' }}</h2>
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
            <div>
              <label class="mb-2 block text-sm font-medium text-wread-text">分类名称</label>
              <input
                v-model="categoryName"
                type="text"
                placeholder="请输入分类名称"
                class="w-full rounded-lg border px-4 py-3 text-sm text-wread-text placeholder:text-wread-placeholder focus:border-[#1b88ee] focus:outline-none focus:ring-2 focus:ring-[#1b88ee]/20"
                :class="nameError ? 'border-red-500' : 'border-wread-divider'"
                autofocus
              />
              <p v-if="nameError" class="mt-1 text-xs text-red-500">{{ nameError }}</p>
            </div>

            <!-- 按钮组 -->
            <div class="flex gap-3">
              <button
                type="button"
                @click="handleCancel"
                class="flex-1 rounded-lg border border-wread-divider bg-white py-3 text-sm font-medium text-wread-text transition hover:bg-wread-bg"
              >
                取消
              </button>
              <button
                type="submit"
                class="flex-1 rounded-lg bg-[#1b88ee] py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                {{ mode === 'create' ? '创建' : '保存' }}
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

