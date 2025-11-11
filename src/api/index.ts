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
  role: 0 | 1
  createdAt: string
}

export interface LoginVO {
  token: string
  userInfo: UserInfoVO
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
}

// 错误码映射
export const ERROR_MESSAGES: Record<string, string> = {
  'A1001': '用户名或密码错误',
  'A1004': '未登录或登录已过期',
  'U2001': '用户不存在',
  '2000': '操作成功',
}

export const getErrorMessage = (code: string): string => {
  return ERROR_MESSAGES[code] || '操作失败，请稍后重试'
}

