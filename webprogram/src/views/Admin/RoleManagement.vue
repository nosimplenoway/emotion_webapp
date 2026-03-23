<template>
  <div class="container">
    <div style="display:flex;align-items:center;justify-content:space-between">
      <h2>角色与权限管理</h2>
    </div>

    <div class="card" style="margin-top:12px;display:flex;gap:18px">
      <!-- left: controls -->
      <div style="flex:0 0 320px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <button class="btn btn-primary" @click="openAdd">新增+</button>
          <input class="search" v-model="searchKey" placeholder="按角色名称" />
          <button class="btn btn-ghost" @click="doQuery">查询</button>
        </div>

        <div style="margin-top:8px">
          <h4 style="margin:0 0 8px 0">角色一览</h4>
          <ul style="list-style:none;padding:0;margin:0">
            <li v-for="r in roles" :key="r.id" style="padding:8px 6px;border-bottom:1px solid var(--surface-border);display:flex;justify-content:space-between;align-items:center">
              <div>
                <div style="font-weight:600">{{r.name}}</div>
                <div style="font-size:12px;color:var(--muted)">{{r.desc}}</div>
              </div>
              <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
                <div style="font-size:12px;color:var(--muted)">创建：{{r.createdAt}}</div>
                <div style="font-size:12px;color:var(--muted)">更新：{{r.updatedAt}}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- right: details table -->
      <div style="flex:1">
        <table class="table">
          <thead><tr><th>名称</th><th>描述</th><th>创建时间</th><th>修改时间</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="r in filteredRoles" :key="r.id">
              <td>{{r.name}}</td>
              <td>{{r.desc}}</td>
              <td>{{r.createdAt}}</td>
              <td>{{r.updatedAt}}</td>
              <td><span :class="r.disabled ? 'status-disabled' : 'status-normal'">{{ r.disabled ? '禁用' : '正常' }}</span></td>
              <td>
                <button class="btn btn-ghost" @click="viewDetails(r)">角色详情</button>
                <button class="btn btn-ghost" @click="toggleStatus(r)">{{ r.disabled ? '启用' : '禁用' }}</button>
                <button class="btn btn-ghost" @click="openEdit(r)">编辑</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Role add/edit modal -->
    <Modal v-if="showModal" :title="editing? '编辑角色' : '添加角色'" @close="cancel">
      <div>
        <div>
          <label class="label">角色类</label>
          <select class="input" v-model="form.roleClass">
            <option value="system">系统角色</option>
            <option value="custom">自定义角色</option>
          </select>
        </div>

        <div style="margin-top:8px">
          <label class="label">角色名称</label>
          <input class="input" v-model="form.name" />
        </div>

        <div style="margin-top:8px">
          <label class="label">描述</label>
          <input class="input" v-model="form.desc" />
        </div>

        <div style="margin-top:12px">
          <label class="label">赋予权限（可选）</label>
          <div v-for="(items, group) in permissionGroups" :key="group" style="margin-bottom:8px">
            <div style="font-weight:600;margin-bottom:6px">{{group}}</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              <label v-for="p in items" :key="p.id" style="display:flex;align-items:center;gap:6px">
                <input type="checkbox" :value="p.id" v-model="form.perms" /> {{p.action}}
              </label>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-ghost" @click="cancel">返回</button>
        <button class="btn btn-primary" @click="save">保存</button>
      </template>
    </Modal>

    <!-- Role details / permission modal -->
    <Modal v-if="showPerms" :title="`角色详情：${currentRole?.name || ''}`" @close="closePerms">
      <div>
        <div style="margin-bottom:8px">
          <label class="label">名称</label>
          <div>{{ currentRole?.name }}</div>
        </div>
        <div style="margin-bottom:8px">
          <label class="label">描述</label>
          <div>{{ currentRole?.desc }}</div>
        </div>

        <div style="margin-top:8px">
          <label class="label">权限信息</label>
          <div v-for="(items, group) in permissionGroups" :key="group" style="margin-bottom:10px">
            <div style="font-weight:600;margin-bottom:6px">{{group}}</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              <label v-for="p in items" :key="p.id" style="display:flex;align-items:center;gap:6px">
                <input type="checkbox" :value="p.id" v-model="permForm" /> {{p.action}}
              </label>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-ghost" @click="closePerms">返回</button>
        <button class="btn btn-primary" @click="confirmSavePerms">确定修改</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Modal from '../../components/Modal.vue'

// permissions items structured per requirement (user management & role management)
const permissions = ref([
  // 用户管理 permissions
  { id: 101, group: '用户管理', action: '新增用户', resource: 'user:add' },
  { id: 102, group: '用户管理', action: '修改用户基础信息', resource: 'user:edit' },
  { id: 103, group: '用户管理', action: '修改用户状态', resource: 'user:change_status' },
  { id: 104, group: '用户管理', action: '重置密码', resource: 'user:reset_password' },
  { id: 105, group: '用户管理', action: '查询用户', resource: 'user:query' },
  { id: 106, group: '用户管理', action: '删除用户', resource: 'user:delete' },
  // 角色管理 permissions
  { id: 201, group: '角色管理', action: '新增角色', resource: 'role:add' },
  { id: 202, group: '角色管理', action: '修改角色基础信息', resource: 'role:edit' },
  { id: 203, group: '角色管理', action: '修改角色状态', resource: 'role:change_status' },
  { id: 204, group: '角色管理', action: '修改角色权限', resource: 'role:modify_perms' },
  { id: 205, group: '角色管理', action: '查询角色', resource: 'role:query' }
])

const permissionGroups = computed(() => {
  const groups = {}
  permissions.value.forEach(p => {
    if (!groups[p.group]) groups[p.group] = []
    groups[p.group].push(p)
  })
  return groups
})

const roles = ref([
  { id: 1, roleClass: 'system', name: '管理员', desc: '系统拥有所有权限', perms: permissions.value.map(p=>p.id), createdAt: '2026-01-01', updatedAt: '2026-03-01', disabled: false },
  { id: 2, roleClass: 'system', name: '教师', desc: '可以查看与管理学生情绪', perms: [105,202], createdAt: '2026-02-03', updatedAt: '2026-03-10', disabled: false }
])

const showModal = ref(false)
const editing = ref(null)
const form = ref({ roleClass: 'custom', name: '', desc: '', perms: [] })

const showPerms = ref(false)
const currentRole = ref(null)
const permForm = ref([])

// controls for left search area
const searchKey = ref('')
const searchResult = ref(null)

function openAdd(){ editing.value = null; form.value = { roleClass: 'custom', name: '', desc: '', perms: [] }; showModal.value = true }
function openEdit(r){ editing.value = r.id; form.value = { roleClass: r.roleClass || 'custom', name: r.name, desc: r.desc, perms: Array.from(r.perms || []) }; showModal.value = true }
function save(){
  if (!form.value.name) { alert('请输入角色名称'); return }
  const now = new Date().toISOString().slice(0,10)
  if (editing.value) {
    const idx = roles.value.findIndex(x=>x.id===editing.value)
    if (idx!==-1) {
      roles.value[idx].name = form.value.name
      roles.value[idx].desc = form.value.desc
      roles.value[idx].roleClass = form.value.roleClass
      roles.value[idx].perms = Array.from(form.value.perms || [])
      roles.value[idx].updatedAt = now
    }
  } else {
    const id = roles.value.length ? Math.max(...roles.value.map(x=>x.id))+1 : 1
    roles.value.push({ id, name: form.value.name, desc: form.value.desc, roleClass: form.value.roleClass, perms: Array.from(form.value.perms || []), createdAt: now, updatedAt: now, disabled: false })
  }
  showModal.value = false
}
function remove(r){ if(confirm('删除角色 '+r.name+' ?')) roles.value = roles.value.filter(x=>x.id!==r.id) }
function cancel(){ showModal.value = false }

function openPerms(r){ currentRole.value = r; permForm.value = Array.from(r.perms || []); showPerms.value = true }
function closePerms(){ showPerms.value = false }
function savePerms(){
  if (!currentRole.value) return
  const idx = roles.value.findIndex(x=>x.id===currentRole.value.id)
  if (idx!==-1) {
    roles.value[idx].perms = Array.from(permForm.value)
    roles.value[idx].updatedAt = new Date().toISOString().slice(0,10)
  }
  showPerms.value = false
}

function confirmSavePerms(){
  // show confirmation; if canceled, keep modal open for more edits
  if (!confirm('确定要保存对该角色权限的修改吗？')) {
    return
  }
  savePerms()
}

function viewDetails(r){
  // open detail modal with checkboxes and confirm flow
  openPerms(r)
}

function toggleStatus(r){ r.disabled = !r.disabled; r.updatedAt = new Date().toISOString().slice(0,10) }

// search / query
function doQuery(){
  const kw = searchKey.value.trim().toLowerCase()
  if (!kw) { searchResult.value = null; return }
  searchResult.value = roles.value.filter(r => r.name.toLowerCase().includes(kw))
}

const filteredRoles = computed(() => {
  return searchResult.value !== null ? searchResult.value : roles.value
})
</script>

<style scoped>
.toolbar{display:flex;gap:12px;align-items:center;margin-bottom:12px}
.table{width:100%;border-collapse:collapse;background:transparent}
.table th,.table td{padding:12px;border-bottom:1px solid var(--surface-border);text-align:left}
.status-normal{color:var(--accent);font-weight:600}
.status-disabled{color:#ff4d4f;font-weight:600}
</style>
