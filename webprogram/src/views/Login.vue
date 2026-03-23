<template>
  <div class="login-container">
    <div class="login-card card">
      <div class="login-header">
        <div class="logo">情</div>
        <div>
          <div class="login-title">情绪管理系统</div>
          <div class="login-sub">请使用手机号与密码登录</div>
        </div>
      </div>

      <form @submit.prevent="onSubmit">
        <div>
          <label class="label">手机号</label>
          <input class="input" v-model="phone" type="tel" placeholder="请输入手机号" />
        </div>

        <div style="margin-top:12px">
          <label class="label">密码</label>
          <input class="input" v-model="password" type="password" placeholder="请输入密码" />
        </div>

        <div style="margin-top:12px">
          <label class="label">身份</label>
          <div class="role-row">
            <label><input type="radio" value="admin" v-model="role" /> 管理员</label>
            <label><input type="radio" value="teacher" v-model="role" /> 教师</label>
          </div>
        </div>

        <div class="login-actions">
          <button class="btn btn-primary" type="submit">登录</button>
          <a class="forget" href="#" @click.prevent="forgot">忘记密码？</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const phone = ref('')
const password = ref('')
const role = ref('admin')
const router = useRouter()
const route = useRoute()

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

  // Respect redirect query param if present
  const redirect = route.query.redirect
  if (redirect) {
    router.push(redirect)
    return
  }
  if (role.value === 'admin') {
    router.push('/admin')
  } else {
    router.push('/teacher')
  }
}
</script>

<style scoped>
/* scoped overrides keep local tweaks while using global theme */
.login-card{max-width:420px}
.logo{font-size:18px}
.role-row input{margin-right:6px}
.forget{color:var(--muted);text-decoration:none}
</style>
