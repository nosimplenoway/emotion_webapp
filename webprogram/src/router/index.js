import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Login.vue'
import Teacher from '../views/Teacher.vue'
import AdminLayout from '../views/Admin/Layout.vue'
import AdminHome from '../views/Admin/Home.vue'
import UserManagement from '../views/Admin/UserManagement.vue'
import RoleManagement from '../views/Admin/RoleManagement.vue'
import PermissionManagement from '../views/Admin/PermissionManagement.vue'
import OrganizationManagement from '../views/Admin/OrganizationManagement.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/teacher', component: Teacher, meta: { requiresAuth: true, role: 'teacher' } },
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: '', component: AdminHome, meta: { requiresAuth: true, role: 'admin' } },
      { path: 'users', component: UserManagement, meta: { requiresAuth: true, role: 'admin' } },
      { path: 'roles', component: RoleManagement, meta: { requiresAuth: true, role: 'admin' } },
      { path: 'permissions', component: PermissionManagement, meta: { requiresAuth: true, role: 'admin' } },
  { path: 'system', component: OrganizationManagement, meta: { requiresAuth: true, role: 'admin' } }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global route guard - check auth token and role stored in localStorage
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token')
  const role = localStorage.getItem('auth_role')

  // If user is already logged in, prevent visiting login page
  if (to.path === '/login' && token) {
    if (role === 'admin') return next('/admin')
    if (role === 'teacher') return next('/teacher')
    return next('/admin')
  }

  const requiresAuth = to.matched.some(r => r.meta && r.meta.requiresAuth)
  if (!requiresAuth) {
    return next()
  }
  if (!token) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }
  // If route requires a specific role, check it
  const requiredRole = to.matched.find(r => r.meta && r.meta.role)?.meta.role
  if (requiredRole && role !== requiredRole) {
    // Redirect to appropriate home for the role
    if (role === 'admin') return next('/admin')
    if (role === 'teacher') return next('/teacher')
    return next('/login')
  }
  next()
})

export default router
