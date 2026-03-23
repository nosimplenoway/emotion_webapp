<template>
  <div class="container">
    <h2>组织管理</h2>
    <div class="card" style="margin-top:12px">
      <p>在此管理组织结构（学院 / 班级）与成员的归属关系（示例界面）。</p>
      <div class="top-controls" style="margin-top:12px">
        <div class="left">
          <input class="search" v-model="q" placeholder="搜索组织或成员" />
          <button class="btn btn-ghost" @click="search">查询</button>
        </div>
        <div class="right">
          <button class="btn btn-primary" @click="addOrg">添加组织</button>
        </div>
      </div>

      <div style="margin-top:16px">
        <table class="table">
          <thead><tr><th>ID</th><th>组织名称</th><th>类型</th><th>成员数</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="o in filteredOrgs" :key="o.id">
              <td>{{o.id}}</td>
              <td>{{o.name}}</td>
              <td>{{o.type}}</td>
              <td>{{o.members.length}}</td>
              <td>
                <button class="btn btn-ghost" @click="viewOrg(o)">查看成员</button>
                <button class="btn btn-ghost" @click="editOrg(o)">编辑</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- org modal -->
    <Modal v-if="showOrgModal" :title="orgEditing? '编辑组织' : '添加组织'" @close="closeOrg">
      <div>
        <label class="label">组织名称</label>
        <input class="input" v-model="orgForm.name" />
      </div>
      <div style="margin-top:8px">
        <label class="label">类型</label>
        <select class="input" v-model="orgForm.type"><option>学院</option><option>班级</option><option>其他</option></select>
      </div>
      <template #footer>
        <button class="btn btn-ghost" @click="closeOrg">取消</button>
        <button class="btn btn-primary" @click="saveOrg">保存</button>
      </template>
    </Modal>

    <!-- members modal -->
    <Modal v-if="showMembers" title="成员列表" @close="closeMembers">
      <div style="max-height:300px;overflow:auto">
        <table class="table">
          <thead><tr><th>ID</th><th>姓名</th><th>手机号</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="m in currentOrg?.members || []" :key="m.id">
              <td>{{m.id}}</td>
              <td>{{m.name}}</td>
              <td>{{m.phone}}</td>
              <td><button class="btn btn-ghost" @click="removeMember(m)">移除</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <template #footer>
        <button class="btn btn-ghost" @click="closeMembers">关闭</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Modal from '../../components/Modal.vue'

const q = ref('')
const orgs = ref([
  { id: 1, name: '计算机学院', type: '学院', members: [{id:1,name:'张三',phone:'13800138000'},{id:2,name:'李四',phone:'13800138001'}] },
  { id: 2, name: '软件工程 2024', type: '班级', members: [{id:3,name:'王五',phone:'13800138002'}] }
])

const filteredOrgs = computed(() => {
  if (!q.value) return orgs.value
  const kw = q.value.toLowerCase()
  return orgs.value.filter(o => o.name.toLowerCase().includes(kw) || o.members.some(m=>m.name.toLowerCase().includes(kw) || m.phone.includes(kw)))
})

const showOrgModal = ref(false)
const orgEditing = ref(null)
const orgForm = ref({ name: '', type: '学院' })

const showMembers = ref(false)
const currentOrg = ref(null)

function addOrg(){ orgEditing.value = null; orgForm.value = { name: '', type: '学院' }; showOrgModal.value = true }
function editOrg(o){ orgEditing.value = o.id; orgForm.value = { name: o.name, type: o.type }; showOrgModal.value = true }
function saveOrg(){
  if (!orgForm.value.name) { alert('请输入组织名称'); return }
  if (orgEditing.value) {
    const idx = orgs.value.findIndex(x=>x.id===orgEditing.value)
    if (idx!==-1) orgs.value[idx].name = orgForm.value.name, orgs.value[idx].type = orgForm.value.type
  } else {
    const id = orgs.value.length ? Math.max(...orgs.value.map(x=>x.id))+1 : 1
    orgs.value.push({ id, name: orgForm.value.name, type: orgForm.value.type, members: [] })
  }
  showOrgModal.value = false
}
function closeOrg(){ showOrgModal.value = false }

function viewOrg(o){ currentOrg.value = o; showMembers.value = true }
function closeMembers(){ showMembers.value = false }
function removeMember(m){ if(confirm('确定从组织中移除成员 '+m.name+' ?')) { currentOrg.value.members = currentOrg.value.members.filter(x=>x.id!==m.id) } }

function search(){ /* filter already reactive; keep this for explicit query action */ }
</script>

<style scoped>
.toolbar{display:flex;gap:12px;align-items:center;margin-bottom:12px}
.table{width:100%;border-collapse:collapse;background:transparent}
.table th,.table td{padding:12px;border-bottom:1px solid var(--surface-border);text-align:left}
</style>
