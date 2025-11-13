// API 基础配置
// 开发环境使用代理，生产环境需要配置实际的后端地址
const API_BASE_URL = import.meta.env.PROD ? 'http://localhost:8080' : ''

// API 响应类型
interface ApiResponse<T = any> {
  code: string
  msg: string
  data: T
}

// 登录相关类型
export interface LoginDTO {
  username: string
  password: string
}

export interface UserInfoVO {
  id: number
  username: string
  nickname: string
  email: string | null
  avatarUrl: string | null
  gender: 0 | 1
  bio: string | null
  role: 0 | 1  // 0=管理员, 1=普通用户
  createdAt: string
}

export interface LoginVO {
  token: string
  userInfo: UserInfoVO
}

// 更新用户信息 DTO
export interface UpdateUserDTO {
  nickname?: string
  email?: string | null
  avatar_url?: string | null
  gender?: 0 | 1
  bio?: string | null
}

// 书籍分类相关类型
export interface CategoryDTO {
  categoryName: string
}

export interface CategoryVO {
  id: number
  categoryName: string
  bookCount: number
  createdAt: string
  updatedAt: string
}

// 存储提供商相关类型
export type StorageType = 'LOCAL' | 'S3' | 'COS' | 'OSS' | 'KODO'

export interface StorageProviderDTO {
  providerName: string
  storageType: StorageType
  isActive?: 0 | 1
  localRootPath?: string
  endpoint?: string
  region?: string
  accessKey?: string
  secretKey?: string
  bucketName?: string
  basePath?: string
}

export interface StorageProviderVO {
  id: number
  providerName: string
  storageType: StorageType
  isActive: 0 | 1
  localRootPath?: string
  endpoint?: string
  region?: string
  accessKey?: string
  secretKey?: string
  bucketName?: string
  basePath?: string
  createdAt: string
  updatedAt: string
}

// Token 管理
const TOKEN_KEY = 'zr_auth_token'

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
}

// 统一请求方法
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // 如果有 token，添加到请求头
  // Sa-Token 框架从请求头读取 token，字段名为 Authentication
  if (token) {
    headers['Authentication'] = token
  }

  // 合并额外的 headers
  if (options.headers) {
    Object.assign(headers, options.headers)
  }

  const url = `${API_BASE_URL}${endpoint}`
  
  console.log('请求头:', headers)
  console.log('请求 URL:', url)

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    console.log('响应状态:', response.status, response.statusText)
    
    const data = await response.json()
    console.log('响应数据:', data)

    // 处理未登录错误
    if (data.code === 'A1004') {
      removeToken()
      localStorage.removeItem('zr_current_user')
      window.location.href = '/'
      throw new Error('登录已过期，请重新登录')
    }

    return data
  } catch (error) {
    console.error('API 请求失败:', error)
    throw error
  }
}

// 认证相关 API
export const authApi = {
  // 登录
  async login(dto: LoginDTO): Promise<ApiResponse<LoginVO>> {
    return request<LoginVO>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(dto),
    })
  },

  // 获取当前用户信息
  async getCurrentUser(): Promise<ApiResponse<UserInfoVO>> {
    return request<UserInfoVO>('/api/auth/current-user', {
      method: 'GET',
    })
  },

  // 退出登录
  async logout(): Promise<ApiResponse<void>> {
    return request<void>('/api/auth/logout', {
      method: 'POST',
    })
  },

  // 更新用户信息
  async updateUserInfo(dto: UpdateUserDTO): Promise<ApiResponse<UserInfoVO>> {
    // 将前端的 snake_case 转换为后端的 camelCase
    // 如果 avatar_url 是 null 或 undefined，转换为空字符串
    const requestData = {
      nickname: dto.nickname,
      email: dto.email,
      avatarUrl: dto.avatar_url ?? '',
      gender: dto.gender,
      bio: dto.bio
    }
    return request<UserInfoVO>('/api/auth/update/info', {
      method: 'PUT',
      body: JSON.stringify(requestData),
    })
  },
}

// 书籍分类管理 API
export const categoryApi = {
  // 创建分类
  async createCategory(dto: CategoryDTO): Promise<ApiResponse<void>> {
    return request<void>('/api/setting/category/add', {
      method: 'POST',
      body: JSON.stringify(dto),
    })
  },

  // 查询所有分类
  async listCategories(): Promise<ApiResponse<CategoryVO[]>> {
    return request<CategoryVO[]>('/api/setting/category', {
      method: 'GET',
    })
  },

  // 更新分类
  async updateCategory(id: number, dto: CategoryDTO): Promise<ApiResponse<void>> {
    return request<void>(`/api/setting/category/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    })
  },

  // 删除分类
  async deleteCategory(id: number): Promise<ApiResponse<void>> {
    return request<void>(`/api/setting/category/delete/${id}`, {
      method: 'DELETE',
    })
  },
}

// 存储提供商管理 API
export const storageApi = {
  // 创建存储提供商
  async createProvider(dto: StorageProviderDTO): Promise<ApiResponse<void>> {
    return request<void>('/api/setting/storage/add', {
      method: 'POST',
      body: JSON.stringify(dto),
    })
  },

  // 查询所有存储提供商
  async listProviders(): Promise<ApiResponse<StorageProviderVO[]>> {
    return request<StorageProviderVO[]>('/api/setting/storage', {
      method: 'GET',
    })
  },

  // 查询单个存储提供商
  async getProviderById(id: number): Promise<ApiResponse<StorageProviderVO>> {
    return request<StorageProviderVO>(`/api/setting/storage/${id}`, {
      method: 'GET',
    })
  },

  // 更新存储提供商
  async updateProvider(id: number, dto: StorageProviderDTO): Promise<ApiResponse<void>> {
    return request<void>(`/api/setting/storage/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    })
  },

  // 删除存储提供商
  async deleteProvider(id: number): Promise<ApiResponse<void>> {
    return request<void>(`/api/setting/storage/delete/${id}`, {
      method: 'DELETE',
    })
  },

  // 启用/停用存储提供商
  async toggleActive(id: number): Promise<ApiResponse<void>> {
    return request<void>(`/api/setting/storage/active/${id}`, {
      method: 'PUT',
    })
  },
}

// 错误码映射
export const ERROR_MESSAGES: Record<string, string> = {
  // 认证相关
  'A1001': '用户名或密码错误',
  'A1004': '未登录或登录已过期',
  'A1007': '仅管理员可操作',
  
  // 用户相关
  'U2001': '用户不存在',
  
  // 分类相关
  'S3001': '分类名称已存在',
  'S3002': '分类不存在',
  'S3003': '分类正在被使用，无法删除',
  
  // 存储提供商相关
  'S3101': '存储提供商名称已存在',
  'S3102': '存储提供商不存在',
  
  // 成功
  '2000': '操作成功',
}

export const getErrorMessage = (code: string): string => {
  return ERROR_MESSAGES[code] || '操作失败，请稍后重试'
}

