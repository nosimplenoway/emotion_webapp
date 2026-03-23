<template>
  <div class="teacher-wrap">
    <header class="topbar">
      <div class="title">情绪管理系统 - 教师端</div>
      <div class="right">
        <button @click="logout">退出登录</button>
      </div>
    </header>

    <main class="content">
      <h3>教师面板</h3>
      <p>此处为教师端的简要视图（示例）。</p>
    </main>
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
.teacher-wrap{height:100vh;display:flex;flex-direction:column}
.topbar{height:56px;background:#2c3e50;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 18px}
.content{padding:24px}
.topbar button{background:transparent;border:1px solid rgba(255,255,255,0.2);color:#fff;padding:6px 10px;border-radius:4px;cursor:pointer}
</style>
