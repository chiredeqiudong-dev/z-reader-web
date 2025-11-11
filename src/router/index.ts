import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: '概览',
    },
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/views/SearchView.vue'),
    meta: {
      title: '搜索',
    },
  },
  {
    path: '/bookshelf',
    name: 'bookshelf',
    component: () => import('@/views/BookShelfView.vue'),
    meta: {
      title: '我的书架',
    },
  },
  {
    path: '/bookshelf/category',
    name: 'category-detail',
    component: () => import('@/views/CategoryDetailView.vue'),
    meta: {
      title: '分类详情',
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = `Z Reader · ${to.meta.title as string}`
  }
})

export default router

