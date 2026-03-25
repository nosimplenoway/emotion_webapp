<template>
  <div class="container">
    <div style="display:flex;align-items:center;justify-content:space-between">
      <h2>角色与权限管理</h2>
    </div>

    <div class="card" style="margin-top:12px;">
        <div class="top-controls horizontal" style="padding:18px 12px;align-items:center">
        <div class="left" style="display:flex;align-items:center;gap:10px;flex:1">
          <input class="search" v-model="searchKey" placeholder="按角色名称 / 支持模糊搜索" />
          <button class="btn btn-search" @click="doQuery">查询</button>
        </div>
        <div class="right">
          <button class="btn btn-add" @click="openAdd">+ 新增角色</button>
        </div>
      </div>

      <div style="padding:12px 18px">
        <div class="top-meta" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div style="color:var(--muted)">共 <strong>{{ filteredRoles.length }}</strong> 个角色</div>
          <div style="color:var(--muted);font-size:13px">Tip: 点击“角色详情”查看描述与权限</div>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th style="width:220px">名称</th>
              <th>创建时间</th>
              <th>修改时间</th>
              <th style="width:120px">状态</th>
              <th style="width:360px"> 操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filteredRoles" :key="r.id" v-show="!loading">
              <td class="role-name-cell" data-title="名称"><span v-html="highlightName(r.name)"></span></td>
              <td data-title="创建时间">{{ r.createdAt }}</td>
              <td data-title="修改时间">{{ r.updatedAt }}</td>
              <td data-title="状态"><span :class="r.disabled ? 'status-disabled' : 'status-normal'">{{ r.disabled ? '禁用' : '正常' }}</span></td>
              <td class="actions" data-title="操作">
                <button class="btn btn-outline" @click="viewDetails(r)">
                  <span class="icon" aria-hidden>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.2"/><path d="M12 8v4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/></svg>
                  </span>
                  <span class="text">角色详情</span>
                </button>
                <button :class="[ 'btn', r.disabled ? 'btn-success-filled' : 'btn-danger-filled' ]" @click="toggleStatus(r)">
                  <span class="icon" aria-hidden>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M5 9a7 7 0 1 0 14 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </span>
                  <span class="text">{{ r.disabled ? '启用' : '禁用' }}</span>
                </button>
                <button class="btn btn-primary-filled" @click="openEdit(r)">
                  <span class="icon" aria-hidden>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 21l3-1 11-11a2.828 2.828 0 0 0 0-4l-1-1a2.828 2.828 0 0 0-4 0L3 16v5z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </span>
                  <span class="text">编辑</span>
                </button>
              </td>
            </tr>
            <!-- loading skeleton -->
            <tr v-if="loading">
              <td colspan="5">
                <div style="display:flex;gap:12px;align-items:center">
                  <div style="width:220px;height:18px" class="skeleton"></div>
                  <div style="width:100px;height:18px" class="skeleton"></div>
                  <div style="width:100px;height:18px" class="skeleton"></div>
                  <div style="width:80px;height:18px" class="skeleton"></div>
                </div>
              </td>
            </tr>
            <!-- empty state -->
            <tr v-if="!loading && filteredRoles.length===0">
              <td colspan="5">
                <div class="empty-state">
                  <strong>未找到匹配的角色</strong>
                  <div style="margin-bottom:12px">尝试更宽泛的关键词，或新建一个角色。</div>
                  <button class="btn btn-primary" @click="openAdd">+ 新建角色</button>
                </div>
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

// UI state
const loading = ref(false)

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
  // simple loading micro-interaction
  loading.value = true
  setTimeout(() => {
    if (!kw) { searchResult.value = null; loading.value = false; return }
    searchResult.value = roles.value.filter(r => r.name.toLowerCase().includes(kw))
    loading.value = false
  }, 240)
}

const filteredRoles = computed(() => {
  return searchResult.value !== null ? searchResult.value : roles.value
})

// highlight matched substring in name for search guidance
function highlightName(name){
  const kw = searchKey.value.trim()
  if (!kw) return name
  try{
    const esc = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`(${esc})`, 'ig')
    return name.replace(re, '<mark>$1</mark>')
  }catch(e){ return name }
}
</script>

<style scoped>
.toolbar{display:flex;gap:12px;align-items:center;margin-bottom:12px}
.table{width:100%;border-collapse:collapse;background:transparent}
.table th,.table td{padding:12px 10px;border-bottom:1px solid var(--surface-border);text-align:left}
.status-normal{color:var(--accent);font-weight:700;background:linear-gradient(180deg,#e9fff4,#f6fff9);padding:6px 8px;border-radius:12px;display:inline-block}
.status-disabled{color:#ff4d4f;font-weight:700;background:#fff0f0;padding:6px 8px;border-radius:12px;display:inline-block}

.top-controls.horizontal{display:flex;align-items:center;justify-content:space-between;gap:12px}
.top-controls .left{display:flex;gap:8px;align-items:center;flex:1}
.search{padding:10px 12px;border-radius:10px;border:1px solid var(--surface-border);width:260px;min-width:160px;max-width:380px}
.btn-add{background:linear-gradient(180deg,#0fb07a,#0aa36b);color:#fff;border:none;padding:10px 16px;border-radius:24px;box-shadow:0 4px 12px rgba(10,163,107,0.12);}
.role-name{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.role-name-cell{font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.actions{display:flex;gap:12px;align-items:center;justify-content:center}
.btn-outline{background:#fbfdfe;border:1px solid rgba(15,23,36,0.06);padding:8px 12px;border-radius:12px;color:var(--text);display:inline-flex;align-items:center;gap:8px;min-width:88px;justify-content:center}
.btn-danger-filled{background:#ff4d4f;color:#fff;padding:10px 14px;border-radius:12px;display:inline-flex;align-items:center;gap:8px;min-width:92px;justify-content:center;border:none;box-shadow:0 8px 20px rgba(255,77,79,0.12)}
.btn-success-filled{background:linear-gradient(180deg,#10b981,#059669);color:#fff;padding:10px 14px;border-radius:12px;display:inline-flex;align-items:center;gap:8px;min-width:92px;justify-content:center;border:none;box-shadow:0 8px 20px rgba(16,185,129,0.12)}
.btn-primary-filled{background:linear-gradient(180deg,#3b82f6,#2563eb);color:#fff;padding:10px 14px;border-radius:12px;display:inline-flex;align-items:center;gap:8px;min-width:92px;justify-content:center;border:none;box-shadow:0 8px 20px rgba(37,99,235,0.12)}
.btn-primary-outline{background:#fff;border:1px solid #3b82f6;color:#2563eb;padding:8px 12px;border-radius:12px;display:inline-flex;align-items:center;gap:8px;min-width:88px;justify-content:center}
/* button icon + text layout */
.btn .icon{display:inline-flex;align-items:center;justify-content:center;color:inherit}
.btn .text{display:inline-block}
.btn:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(10,163,107,0.06)}

/* Responsive: convert table rows into stacked cards on small screens */
@media (max-width:800px){
  .top-controls.horizontal{flex-direction:column;align-items:stretch;gap:12px}
  .top-controls .left{width:100%}
  .top-controls .right{width:100%;display:flex;justify-content:flex-end}

  /* hide table header and render each row as a card */
  .table thead{display:none}
  .table tbody tr{display:block;background:var(--card);border-radius:12px;padding:12px;margin-bottom:12px;box-shadow:var(--shadow)}
  .table tbody td{display:flex;justify-content:space-between;padding:8px 6px;border-bottom:none}
  .table tbody td::before{content:attr(data-title);color:var(--muted);font-size:12px;margin-right:8px}

  /* action buttons: show icon-only to save space */
  .btn .text{display:none}
  .btn{padding:8px;border-radius:10px}
  .actions{justify-content:flex-end;gap:8px}
}

.btn-search{background:linear-gradient(180deg,#3b82f6,#2563eb);color:#fff;padding:8px 12px;border-radius:12px;border:none;box-shadow:0 6px 18px rgba(37,99,235,0.12)}
.search{min-width:220px}

</style>
