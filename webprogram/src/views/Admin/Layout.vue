<template>
  <div class="admin-root">
    <aside class="sidebar">
      <div class="brand">情绪管理后台</div>
      <nav>
  <router-link to="/admin" class="nav-item" exact-active-class="router-link-active">
          <span class="icon" aria-hidden>
            <!-- home icon -->
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          <span class="label">首页</span>
        </router-link>

  <router-link to="/admin/users" class="nav-item" active-class="router-link-active">
          <span class="icon" aria-hidden>
            <!-- users icon -->
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 11c1.657 0 3-1.567 3-3.5S17.657 4 16 4s-3 1.567-3 3.5S14.343 11 16 11zM8 11c1.657 0 3-1.567 3-3.5S9.657 4 8 4 5 5.567 5 7.5 6.343 11 8 11z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 20a6 6 0 0 1 6-6h8a6 6 0 0 1 6 6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          <span class="label">用户管理</span>
        </router-link>

  <router-link to="/admin/roles" class="nav-item" active-class="router-link-active">
          <span class="icon" aria-hidden>
            <!-- roles icon -->
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3 6 6 .5-4.5 3.5L19 20l-7-4-7 4 .5-8-4.5-3.5L9 8 12 2z" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/></svg>
          </span>
          <span class="label">角色与权限</span>
        </router-link>

  <router-link to="/admin/permissions" class="nav-item" active-class="router-link-active">
          <span class="icon" aria-hidden>
            <!-- logs icon -->
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 6h8M8 12h8M8 18h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          <span class="label">日志管理</span>
        </router-link>

  <router-link to="/admin/system" class="nav-item" active-class="router-link-active">
          <span class="icon" aria-hidden>
            <!-- organization icon -->
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18M12 7v14" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="4" r="1.8" stroke="currentColor" stroke-width="1.2"/><circle cx="18" cy="4" r="1.8" stroke="currentColor" stroke-width="1.2"/></svg>
          </span>
          <span class="label">组织管理</span>
        </router-link>
      </nav>
    </aside>

    <div class="main">
      <header class="header">
        <div class="header-left"><strong>欢迎，管理员</strong></div>
          <div class="actions">
            <div class="username">Admin</div>
            <button class="logout-btn" @click="logout">退出登录</button>
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
.sidebar{width:240px;background:#fff;border-right:1px solid rgba(0,0,0,0.04);padding:20px 16px}
.brand{font-weight:700;color:var(--text);margin-bottom:18px}
.nav-item{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;color:var(--muted);margin-bottom:6px}
.nav-item .icon{display:inline-flex;align-items:center;justify-content:center;color:var(--muted)}
.nav-item .label{font-weight:600}
.nav-item.router-link-active{background:linear-gradient(180deg,#f0fff6,#f8fff9);color:var(--accent)}
.nav-item.router-link-active .label{color:var(--accent)}
.nav-item.router-link-active .icon{color:var(--accent)}
.main{flex:1;display:flex;flex-direction:column}
.header{height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 18px}
.header .actions{display:flex;gap:12px;align-items:center}
.container-pad{padding:22px}

.logout-btn{background:#fff;border:1px solid #ff4d4f;color:#ff4d4f;padding:8px 12px;border-radius:10px;font-weight:600}
.logout-btn:hover{background:#ff4d4f;color:#fff}
</style>
