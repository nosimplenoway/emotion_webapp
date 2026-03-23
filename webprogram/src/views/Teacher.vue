<template>
  <div class="teacher-wrap">
    <header class="topbar header">
      <div style="font-weight:700">情绪管理系统 - 教师端</div>
      <div class="actions">
        <div class="username">Teacher</div>
        <button class="btn btn-ghost" @click="logout">退出登录</button>
      </div>
    </header>

    <main class="content container-pad">
      <div class="card">
        <h3>教师面板</h3>
        <p>此处为教师端的简要视图（示例）。</p>
      </div>
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
.topbar{height:64px}
.content{padding:22px}
.topbar button{background:transparent;border:1px solid rgba(0,0,0,0.06);padding:6px 10px;border-radius:6px;cursor:pointer}
</style>
