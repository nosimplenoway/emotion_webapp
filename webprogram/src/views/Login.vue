<template>
  <div class="login-container">
    <div class="login-card card">
      <div class="login-header" style="align-items:center;gap:14px">
        <div class="logo">
          <!-- 干净的心型 logo：背景为粉色渐变，心为纯白色（无多余点状元素） -->
          <svg width="56" height="56" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="heartGradLogin" x1="0" x2="1">
                <stop offset="0" stop-color="#ff8a9b" />
                <stop offset="1" stop-color="#ff5c7a" />
              </linearGradient>
            </defs>
            <!-- 仅保留心形（透明背景），使用粉色渐变填充 -->
            <path d="M28 14c-3.5-4.5-9.5-4.5-13 0-3 4-1 9 6 15 2 1.7 3.9 2.9 6.1 2.9 2.2 0 4.1-1.2 6.1-2.9 7-6 9-11 6-15-3.5-4.5-9.5-4.5-13 0z" fill="url(#heartGradLogin)" transform="translate(0 6) scale(1.02)" />
          </svg>
        </div>
        <div style="flex:1;min-width:0">
          <div class="login-title">情绪管理系统</div>
          <div class="login-sub">请使用手机号与密码登录</div>
        </div>
      </div>

      <form @submit.prevent="onSubmit">
        <div>
          <label class="label">手机号</label>
          <input class="input" v-model="phone" type="tel" placeholder="请输入手机号" aria-label="手机号" />
        </div>

        <div style="margin-top:12px">
          <label class="label">密码</label>
          <div class="input-with-icon">
            <input class="input" v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="请输入密码" aria-label="密码" />
            <button type="button" class="icon-toggle" @click="showPassword = !showPassword" :aria-pressed="showPassword" :title="showPassword ? '隐藏密码' : '显示密码'">
              <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4C7 4 3 9.5 3 12s4 8 9 8 9-5.5 9-8-4-8-9-8z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.2"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3l18 18" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                <path d="M10.59 10.59A3 3 0 0 0 13.41 13.41" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div style="margin-top:18px">
          <label class="label">身份</label>
          <div class="role-row role-card">
            <button type="button" :class="['role-btn-card', role==='admin' ? 'active' : '']" @click="role='admin'" aria-pressed="role==='admin'">
              <div class="role-icon admin-icon" aria-hidden="true">
                <!-- 更具设计感的管理员图标 -->
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" stroke-width="1.2" />
                  <path d="M12 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" stroke="currentColor" stroke-width="1.2"/>
                </svg>
              </div>
              <div class="role-label">管理员</div>
            </button>
            <button type="button" :class="['role-btn-card', role==='teacher' ? 'active' : '']" @click="role='teacher'" aria-pressed="role==='teacher'">
              <div class="role-icon teacher-icon" aria-hidden="true">
                <!-- 更具设计感的教师图标 -->
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2l8 4-8 4-8-4 8-4z" stroke="currentColor" stroke-width="1.2"/>
                  <path d="M4 10v6a8 8 0 0 0 16 0v-6" stroke="currentColor" stroke-width="1.2"/>
                </svg>
              </div>
              <div class="role-label">教师</div>
            </button>
          </div>
        </div>

        <div class="login-actions centered-actions" style="margin-top:22px">
          <button class="btn login-main" type="submit" aria-label="登录">登录</button>
          <a class="forget" href="#" @click.prevent="openForgot">忘记密码？</a>
        </div>
      </form>

      <Modal v-if="showForgot" :title="'找回密码'" @close="closeForgot">
        <div>
          <template v-if="forgotStep===1">
            <div class="label">请输入注册时使用的手机号以接收验证码</div>
            <div class="forgot-field" style="margin-top:8px">
              <input class="input" v-model="forgotPhone" placeholder="手机号" aria-label="找回手机号" />
              <button class="btn btn-primary" @click="sendForgotCode" :disabled="forgotSending">{{ forgotSending ? (forgotCooldown+'s') : '发送验证码' }}</button>
            </div>
          </template>
          <template v-else-if="forgotStep===2">
            <div class="label">输入收到的验证码并设置新密码</div>
            <div style="margin-top:8px;display:flex;flex-direction:column;gap:8px">
              <input class="input" v-model="forgotCode" placeholder="验证码" />
              <input class="input" v-model="newPassword" type="password" placeholder="新的密码（至少6位）" />
              <input class="input" v-model="confirmPassword" type="password" placeholder="确认新密码" />
              <button class="btn btn-primary" @click="submitReset">提交重置</button>
            </div>
          </template>
          <template v-else>
            <div class="label">已完成</div>
            <div style="margin-top:8px">密码已重置（示例）。请使用新密码登录。</div>
          </template>
        </div>
        <template #footer>
          <button class="btn btn-ghost" @click="closeForgot">关闭</button>
        </template>
      </Modal>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Modal from '../components/Modal.vue'

const phone = ref('')
const password = ref('')
const role = ref('admin')
const showForgot = ref(false)
const forgotPhone = ref('')
const showPassword = ref(false)
// 忘记密码流程状态
const forgotStep = ref(1)
const forgotCode = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const forgotSending = ref(false)
const forgotCooldown = ref(0)
let forgotTimer = null
const router = useRouter()
const route = useRoute()

function openForgot(){
  forgotStep.value = 1
  forgotPhone.value = ''
  forgotCode.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  showForgot.value = true
}

function closeForgot(){
  showForgot.value = false
}

function sendForgotCode(){
  const p = forgotPhone.value && forgotPhone.value.trim()
  if(!p){ alert('请输入手机号'); return }
  if(forgotSending.value) return
  forgotSending.value = true
  forgotCooldown.value = 60
  forgotTimer = setInterval(()=>{
    forgotCooldown.value -= 1
    if(forgotCooldown.value <= 0){ clearInterval(forgotTimer); forgotTimer = null; forgotSending.value = false; forgotCooldown.value = 0 }
  }, 1000)
  // 模拟发送验证码
  setTimeout(()=>{ alert('已发送验证码（示例）：123456') }, 300)
  // 进入下一步
  forgotStep.value = 2
}

function submitReset(){
  if(!forgotCode.value.trim()){ alert('请输入验证码'); return }
  if(!newPassword.value || newPassword.value.length < 6){ alert('请输入至少6位的新密码'); return }
  if(newPassword.value !== confirmPassword.value){ alert('两次密码输入不一致'); return }
  // 模拟重置成功
  alert('密码已重置（示例）。请使用新密码登录。')
  forgotStep.value = 3
}

onBeforeUnmount(()=>{ if(forgotTimer) clearInterval(forgotTimer) })

function validate() {
  const p = phone.value && phone.value.trim()
  if (!p) { alert('请输入手机号'); return false }
  // 简单的中国手机号校验
  if (!/^1[3-9]\d{9}$/.test(p)) { alert('请输入有效的手机号'); return false }
  if (!password.value || password.value.length < 6) { alert('请输入至少6位的密码'); return false }
  return true
}

function onSubmit() {
  if (!validate()) return

  // 示例 token 结构：JSON + base64（注意：生产请使用后端返回的安全 token）
  const tokenObj = { phone: phone.value.trim(), role: role.value, issuedAt: Date.now() }
  localStorage.setItem('auth_token', btoa(JSON.stringify(tokenObj)))
  localStorage.setItem('auth_role', role.value)

  const redirect = route.query.redirect
  const target = Array.isArray(redirect) ? redirect[0] : redirect
  if (target) { router.push(String(target)); return }
  router.push(role.value === 'admin' ? '/admin' : '/teacher')
}
</script>

<style scoped>
/* container */
.login-container{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:28px;background:var(--surface)}
.login-card{max-width:520px;padding:32px;border-radius:14px;box-shadow:0 8px 30px rgba(2,6,23,0.08);background:linear-gradient(180deg,#fff,#fbfffd)}
.logo{width:56px;height:56px;border-radius:12px;overflow:visible;flex:0 0 56px;background:transparent !important}
.login-header .login-title{font-size:20px;font-weight:600}
.login-sub{color:var(--muted);font-size:13px}

.label{display:block;color:var(--muted);font-size:13px;margin-bottom:6px}
.input{width:100%;padding:10px 12px;border-radius:10px;border:1px solid var(--surface-border);background:#fff}

.input-with-icon{position:relative}
.input-with-icon .icon-toggle{position:absolute;right:8px;top:50%;transform:translateY(-50%);background:transparent;border:none;padding:6px;cursor:pointer;color:var(--muted);border-radius:8px}
.input-with-icon .icon-toggle:hover{background:rgba(15,23,36,0.03)}

/* role card style */
.role-row{display:flex;gap:12px;margin-top:8px}
.role-card{align-items:stretch}
.role-btn-card{flex:1;display:flex;flex-direction:row;align-items:center;gap:12px;padding:12px;border-radius:12px;border:1px solid rgba(15,23,36,0.06);background:#fff;cursor:pointer;transition:all .18s}
.role-btn-card .role-icon{width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:linear-gradient(180deg,rgba(0,0,0,0.03),rgba(0,0,0,0.01))}
.role-btn-card .role-label{font-weight:500}
.role-btn-card:hover{transform:translateY(-3px);box-shadow:0 10px 30px rgba(2,6,23,0.06)}
.role-btn-card.active{background:linear-gradient(180deg,var(--primary),var(--accent));color:#fff;border-color:transparent;box-shadow:0 12px 30px rgba(16,185,129,0.14)}
.role-btn-card.active .role-icon{background:rgba(255,255,255,0.12)}

.role-btn-card .role-icon svg{width:20px;height:20px;color:var(--primary);stroke:currentColor}
.role-btn-card.active .role-icon{background:linear-gradient(90deg,var(--primary),var(--accent));}
.role-btn-card.active .role-icon svg{color:#fff;stroke:currentColor}

/* actions */
.login-actions{display:flex;align-items:center;gap:12px}
.centered-actions{justify-content:center;flex-direction:column;align-items:center}
.login-main{width:60%;padding:14px 18px;border-radius:12px;background:linear-gradient(90deg,var(--primary),var(--accent));color:#fff;border:none;font-size:16px;font-weight:600;box-shadow:0 12px 30px rgba(16,185,129,0.12);cursor:pointer;display:block;margin:0 auto;text-align:center}
.btn.login-main{background:linear-gradient(90deg,var(--primary),var(--accent));color:#fff;border:none}
.login-main:active{transform:translateY(1px)}
.forget{color:var(--muted);text-decoration:none;font-size:13px;margin-top:8px}

.forgot-field{display:flex;gap:8px;align-items:center}
.forgot-field .input{max-width:240px}

.btn{padding:8px 12px;border-radius:10px;border:1px solid var(--surface-border);background:#fff}
.btn-primary{background:linear-gradient(90deg,var(--primary),var(--accent));color:#fff;border:none}
.btn-ghost{background:transparent;border:1px solid rgba(15,23,36,0.06)}

/* utility */
.card{background:transparent}

</style>