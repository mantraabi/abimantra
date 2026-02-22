// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'

const routes = [
  // ... (Rute Publik Tetap Sama)
  { path: '/', name: 'Home', component: () => import('../views/HomeView.vue') },
  { path: '/login', name: 'Login', component: () => import('../views/LoginView.vue') },
  { path: '/project/:slug', name: 'ProjectDetail', component: () => import('../views/ProjectDetailView.vue') },
  {
    path: '/blog',
    name: 'BlogList',
    component: () => import('../views/BlogListView.vue')
  },
  {
    path: '/blog/:slug',
    name: 'BlogDetail',
    component: () => import('../views/BlogDetailView.vue')
  },


  // ==========================================
  // RUTE ADMIN (Dibungkus oleh AdminLayout)
  // ==========================================
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAdmin: true }, // <-- TANDA BAHWA INI AREA TERLARANG
    children: [
      { path: '', redirect: '/admin/projects' },
      { path: 'projects', name: 'AdminProjectList', component: () => import('../views/AdminProjectListView.vue') },
      { path: 'project/add', name: 'AdminProjectAdd', component: () => import('../views/AdminProjectView.vue') },
      {
        path: 'project/edit/:slug',
        name: 'AdminProjectEdit',
        component: () => import('../views/AdminProjectEditView.vue')
      },
      {
        path: 'blogs',
        name: 'AdminBlogList',
        component: () => import('../views/AdminBlogListView.vue')
      },
      {
        path: 'blog/add',
        name: 'AdminBlogAdd',
        component: () => import('../views/AdminBlogView.vue')
      },
      {
        path: 'blog/edit/:slug',
        name: 'AdminBlogEdit',
        component: () => import('../views/AdminBlogEditView.vue')
    },
    ]
  },
        // ==========================================
        // RUTE CATCH-ALL (404 NOT FOUND)
        // ==========================================
        {
          path: '/:pathMatch(.*)*',
          name: 'NotFound',
          component: () => import('../views/NotFoundView.vue')
        }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ==========================================
// NAVIGATION GUARD ("Satpam" Frontend)
// ==========================================
// PASTIKAN HANYA ADA (to, from) DI SINI. JANGAN ADA KATA 'next'.
router.beforeEach((to, from) => {
  if (to.meta.requiresAdmin) {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    const user = userData ? JSON.parse(userData) : null
    
    if (!token || !user || user.role !== 'admin') {
      alert('Akses Ditolak! Halaman ini khusus Administrator.')
      return '/login' // Gunakan return, bukan next()
    }
  }
  
  return true // Wajib mengembalikan true jika aman
})

export default router