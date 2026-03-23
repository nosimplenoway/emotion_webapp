<template>
  <div class="admin-root">
    <aside class="sidebar">
      <div class="brand">情绪管理后台</div>
      <nav>
        <router-link to="/admin" class="nav-item">首页</router-link>
        <router-link to="/admin/users" class="nav-item">用户管理</router-link>
        <router-link to="/admin/roles" class="nav-item">角色与权限</router-link>
  <router-link to="/admin/permissions" class="nav-item">日志管理</router-link>
  <router-link to="/admin/system" class="nav-item">组织管理</router-link>
      </nav>
    </aside>

    <div class="main">
      <header class="header">
        <div class="header-left"><strong>欢迎，管理员</strong></div>
        <div class="actions">
          <div class="username">Admin</div>
          <button class="btn btn-ghost" @click="logout">退出登录</button>
        </div>
      </header>

      <section class="container-pad">
        <router-view />
      </section>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
function logout(){
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_role')
  router.push('/login')
}
</script>

<style scoped>
.admin-root{display:flex;height:100vh}
.sidebar{width:240px}
.brand{font-weight:700}
.nav-item{display:block}
.main{flex:1;display:flex;flex-direction:column}
.header{height:64px}
.header .actions{display:flex;gap:12px;align-items:center}
.container-pad{padding:22px}
</style>
