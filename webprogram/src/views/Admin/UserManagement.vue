<template>
  <div class="container">
    <div style="display:flex;align-items:center;justify-content:space-between">
      <h2>用户管理</h2>
    </div>
    <div class="card" style="margin-top:12px">
      <div class="toolbar">
        <button class="btn btn-primary" @click="openAdd">添加用户</button>
        <input class="search" placeholder="搜索用户手机号或姓名" v-model="q" />
      </div>

      <table class="table">
        <thead>
          <tr><th>用户ID</th><th>姓名</th><th>手机号</th><th>角色</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="u in filtered" :key="u.id">
            <td>{{u.id}}</td>
            <td>{{u.name}}</td>
            <td>{{u.phone}}</td>
            <td>{{u.role}}</td>
            <td>
              <button class="btn btn-ghost" @click="openEdit(u)">编辑</button>
              <button class="btn btn-danger" @click="remove(u)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- Modal for add / edit -->
      <Modal v-if="showModal" :title="editing ? '编辑用户' : '添加用户'" @close="cancel">
        <div>
          <label class="label">姓名</label>
          <input class="input" v-model="form.name" />
        </div>
        <div style="margin-top:8px">
          <label class="label">手机号</label>
          <input class="input" v-model="form.phone" />
        </div>
        <div style="margin-top:8px">
          <label class="label">角色</label>
          <select class="input" v-model="form.role">
            <option value="teacher">教师</option>
            <option value="student">学生</option>
            <option value="admin">管理员</option>
          </select>
        </div>
        <template #footer>
          <button class="btn btn-ghost" @click="cancel">取消</button>
          <button class="btn btn-primary" @click="save">保存</button>
        </template>
      </Modal>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Modal from '../../components/Modal.vue'

const q = ref('')
const users = ref([
  { id: 1, name: '张三', phone: '13800138000', role: 'teacher' },
  { id: 2, name: '李四', phone: '13800138001', role: 'student' }
])

const filtered = computed(() => {
  if (!q.value) return users.value
  return users.value.filter(u => u.name.includes(q.value) || u.phone.includes(q.value))
})

const showModal = ref(false)
const editing = ref(null)
const form = ref({ name: '', phone: '', role: 'teacher' })

function openAdd(){
  editing.value = null
  form.value = { name: '', phone: '', role: 'teacher' }
  showModal.value = true
}

function openEdit(u){
  editing.value = u.id
  form.value = { name: u.name, phone: u.phone, role: u.role }
  showModal.value = true
}

function save(){
  if (!form.value.name) { alert('请输入姓名'); return }
  if (!form.value.phone) { alert('请输入手机号'); return }
  if (editing.value) {
    const idx = users.value.findIndex(x => x.id === editing.value)
    if (idx !== -1) users.value[idx] = { id: editing.value, ...form.value }
  } else {
    const id = users.value.length ? Math.max(...users.value.map(u=>u.id))+1 : 1
    users.value.push({ id, ...form.value })
  }
  showModal.value = false
}

function remove(u){ if(confirm('删除用户 '+u.name+' ?')) users.value = users.value.filter(x=>x.id!==u.id) }

function cancel(){ showModal.value = false }
</script>

<style scoped>
.toolbar{display:flex;gap:12px;align-items:center;margin-bottom:12px}
.table{width:100%;border-collapse:collapse;background:transparent}
.table th,.table td{padding:12px;border-bottom:1px solid var(--surface-border);text-align:left}
</style>
