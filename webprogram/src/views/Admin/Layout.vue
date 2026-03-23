<template>
  <div class="admin-root">
    <aside class="sidebar">
      <div class="brand">情绪管理后台</div>
      <nav>
        <router-link to="/admin" class="nav-item">首页</router-link>
        <router-link to="/admin/users" class="nav-item">用户管理</router-link>
        <router-link to="/admin/roles" class="nav-item">角色管理</router-link>
        <router-link to="/admin/permissions" class="nav-item">权限管理</router-link>
        <router-link to="/admin/system" class="nav-item">系统管理</router-link>
      </nav>
    </aside>

    <div class="main">
      <header class="header">
        <div></div>
        <div>
          <button class="logout" @click="logout">退出登录</button>
        </div>
      </header>

      <section class="container">
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
.sidebar{width:220px;background:#1f2d3d;color:#fff;padding:20px 12px;box-sizing:border-box}
.brand{font-weight:700;margin-bottom:18px}
.nav-item{display:block;color:#cbd6df;padding:10px;border-radius:4px;margin:6px 0;text-decoration:none}
.nav-item.router-link-active{background:rgba(255,255,255,0.06);color:#fff}
.main{flex:1;display:flex;flex-direction:column}
.header{height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;border-bottom:1px solid #eee}
.container{padding:18px;overflow:auto}
.logout{background:#ff4d4f;border:none;color:#fff;padding:8px 12px;border-radius:4px;cursor:pointer}
</style>
