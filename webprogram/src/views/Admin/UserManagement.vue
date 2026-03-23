<template>
  <div>
    <h2>用户管理</h2>
    <div class="toolbar">
      <button @click="addUser">添加用户</button>
      <input placeholder="搜索用户手机号或姓名" v-model="q" />
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
          <td><button @click="edit(u)">编辑</button> <button @click="remove(u)">删除</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const q = ref('')
const users = ref([
  { id: 1, name: '张三', phone: '13800138000', role: 'teacher' },
  { id: 2, name: '李四', phone: '13800138001', role: 'student' }
])

const filtered = computed(() => {
  if (!q.value) return users.value
  return users.value.filter(u => u.name.includes(q.value) || u.phone.includes(q.value))
})

function addUser(){
  const id = users.value.length + 1
  users.value.push({id, name:'新用户'+id, phone:'1300000'+id, role:'teacher'})
}
function edit(u){ alert('编辑用户：' + u.name) }
function remove(u){ if(confirm('删除用户 '+u.name+' ?')) users.value = users.value.filter(x=>x.id!==u.id) }
</script>

<style scoped>
.toolbar{display:flex;gap:12px;align-items:center;margin-bottom:12px}
.table{width:100%;border-collapse:collapse;background:#fff}
.table th,.table td{padding:8px;border:1px solid #eef2f6}
</style>
