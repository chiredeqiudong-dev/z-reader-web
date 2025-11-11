import axios from 'axios'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10_000,
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    // 可以在此处统一处理错误，比如弹出通知或记录日志
    return Promise.reject(error)
  },
)

export default http

