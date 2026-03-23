import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Login.vue'
import Teacher from '../views/Teacher.vue'
import AdminLayout from '../views/Admin/Layout.vue'
import AdminHome from '../views/Admin/Home.vue'
import UserManagement from '../views/Admin/UserManagement.vue'
import RoleManagement from '../views/Admin/RoleManagement.vue'
import PermissionManagement from '../views/Admin/LogManagement.vue'
import SystemManagement from '../views/Admin/SystemManagement.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/teacher', component: Teacher },
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: '', component: AdminHome },
      { path: 'users', component: UserManagement },
      { path: 'roles', component: RoleManagement },
      { path: 'permissions', component: PermissionManagement },
      { path: 'system', component: SystemManagement }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
