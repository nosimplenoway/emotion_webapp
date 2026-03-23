<template>
  <div class="login-container">
    <div class="login-box">
      <h2>情绪管理系统 - 登录</h2>
      <form @submit.prevent="onSubmit">
        <label>手机号</label>
        <input v-model="phone" type="tel" placeholder="请输入手机号" />

        <label>密码</label>
        <input v-model="password" type="password" placeholder="请输入密码" />

        <label>身份</label>
        <div class="role-row">
          <label><input type="radio" value="admin" v-model="role" /> 管理员</label>
          <label><input type="radio" value="teacher" v-model="role" /> 教师</label>
        </div>

        <div class="actions">
          <button class="primary" type="submit">登录</button>
          <a class="forget" href="#" @click.prevent="forgot">忘记密码？</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const phone = ref('')
const password = ref('')
const role = ref('admin')
const router = useRouter()

function forgot() {
  alert('请联系管理员重置密码或使用注册时的手机号进行找回（示例页面）。')
}

function validate() {
  if (!phone.value) { alert('请输入手机号'); return false }
  if (!password.value) { alert('请输入密码'); return false }
  return true
}

function onSubmit() {
  if (!validate()) return

  // 这里示例使用本地 mock 授权
  const token = btoa(phone.value + ':' + role.value)
  localStorage.setItem('auth_token', token)
  localStorage.setItem('auth_role', role.value)

  if (role.value === 'admin') {
    router.push('/admin')
  } else {
    router.push('/teacher')
  }
}
</script>

<style scoped>
.login-container{display:flex;align-items:center;justify-content:center;height:100vh;background:#f5f7fb}
.login-box{width:360px;padding:28px;border-radius:8px;background:#fff;box-shadow:0 6px 18px rgba(0,0,0,0.08)}
.login-box h2{margin:0 0 16px;font-size:18px;text-align:center}
.login-box label{display:block;margin-top:10px;color:#333;font-size:13px}
.login-box input[type="tel"],.login-box input[type="password"]{width:100%;padding:10px;border:1px solid #e6eaf0;border-radius:4px;margin-top:6px}
.role-row{display:flex;gap:12px;margin-top:8px}
.actions{display:flex;align-items:center;justify-content:space-between;margin-top:18px}
.primary{background:#409EFF;border:none;color:#fff;padding:10px 16px;border-radius:4px;cursor:pointer}
.forget{color:#999;text-decoration:none;font-size:13px}
</style>
