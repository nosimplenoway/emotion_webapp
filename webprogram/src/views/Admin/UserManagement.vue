<template>
  <div class="container">
    <div style="display:flex;align-items:center;justify-content:space-between">
      <h2>用户管理</h2>
    </div>
    <div class="card" style="margin-top:12px">
      <div class="top-controls">
        <div class="left">
          <input class="search" placeholder="搜索用户手机号或姓名" v-model="q" />
          <select class="input role-filter" v-model="roleFilter">
            <option value="">全部角色</option>
            <option value="student">学生</option>
            <option value="teacher">教师</option>
            <option value="admin">管理员</option>
          </select>
        </div>
        <div class="right">
          <button class="btn btn-primary" @click="openAdd">添加用户</button>
          <button class="btn btn-primary" @click="openBatchImport">批量导入</button>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>用户ID</th>
            <th>学号/职工号</th>
            <th>姓名</th>
            <th>手机号</th>
            <th>角色</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filtered" :key="u.id">
            <td>{{u.id}}</td>
            <td>{{u.studentId || u.employeeId}}</td>
            <td>{{u.name}}</td>
            <td>{{u.phone}}</td>
            <td>{{u.role}}</td>
            <td>
              <button class="btn btn-ghost" @click="viewInfo(u)">查看个人信息</button>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- Modal for add -->
      <Modal v-if="showAddModal" title="添加用户" @close="cancelAdd">
        <div>
          <label class="label">姓名</label>
          <input class="input" v-model="addForm.name" />
        </div>
        <div style="margin-top:8px">
          <label class="label">手机号</label>
          <input class="input" v-model="addForm.phone" />
        </div>
        <div style="margin-top:8px">
          <label class="label">性别</label>
          <select class="input" v-model="addForm.gender">
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
        </div>
        <div style="margin-top:8px">
          <label class="label">年龄</label>
          <input class="input" type="number" v-model="addForm.age" />
        </div>
        <div style="margin-top:8px">
          <label class="label">邮箱</label>
          <input class="input" v-model="addForm.email" />
        </div>
        <div style="margin-top:8px">
          <label class="label">角色</label>
          <select class="input" v-model="addForm.role">
            <option value="student">学生</option>
            <option value="teacher">教师</option>
            <option value="admin">管理员</option>
          </select>
        </div>
        <div style="margin-top: 16px;">
          <div class="info-section" v-if="addForm.role === 'student'">
            <div class="info-title">学生信息</div>
            <div class="form-row">
              <label class="label">学院</label>
              <input class="input" v-model="addForm.college" />
            </div>
            <div class="form-row">
              <label class="label">专业</label>
              <input class="input" v-model="addForm.major" />
            </div>
            <div class="form-row">
              <label class="label">班级</label>
              <input class="input" v-model="addForm.class" />
            </div>
          </div>
          <div class="info-section" v-if="addForm.role === 'teacher'">
            <div class="info-title">教师信息</div>
            <div class="form-row">
              <label class="label">学院</label>
              <input class="input" v-model="addForm.college" />
            </div>
            <div class="form-row">
              <label class="label">职位</label>
              <input class="input" v-model="addForm.position" />
            </div>
          </div>
          <div class="info-section" v-if="addForm.role === 'admin'">
            <div class="info-title">管理员信息</div>
            <div class="form-row">
              <label class="label">权限等级</label>
              <input class="input" v-model="addForm.permissionLevel" />
            </div>
          </div>
        </div>
        <template #footer>
          <button class="btn btn-ghost" @click="cancelAdd">取消</button>
          <button class="btn btn-primary" @click="saveAdd">添加</button>
        </template>
      </Modal>
      <!-- Modal for edit -->
      <Modal v-if="showEditModal" title="编辑用户" @close="cancelEdit">
        <div class="info-section">
          <div class="info-row"><span class="info-label">用户ID</span><span class="info-value">{{editForm.id}}</span></div>
          <div class="form-row">
            <label class="label">手机号</label>
            <input class="input" v-model="editForm.phone" />
          </div>
          <div class="form-row">
            <label class="label">性别</label>
            <select class="input" v-model="editForm.gender">
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>
          <div class="form-row">
            <label class="label">年龄</label>
            <input class="input" type="number" v-model="editForm.age" />
          </div>
          <div class="form-row">
            <label class="label">邮箱</label>
            <input class="input" v-model="editForm.email" />
          </div>
        </div>
        <div class="info-section" v-if="editForm.role === 'student'">
          <div class="info-title">学生信息</div>
          <div class="form-row">
            <label class="label">学院</label>
            <input class="input" v-model="editForm.college" />
          </div>
          <div class="form-row">
            <label class="label">专业</label>
            <input class="input" v-model="editForm.major" />
          </div>
          <div class="form-row">
            <label class="label">班级</label>
            <input class="input" v-model="editForm.class" />
          </div>
        </div>
        <div class="info-section" v-if="editForm.role === 'teacher'">
          <div class="info-title">教师信息</div>
          <div class="form-row">
            <label class="label">学院</label>
            <input class="input" v-model="editForm.college" />
          </div>
          <div class="form-row">
            <label class="label">职位</label>
            <input class="input" v-model="editForm.position" />
          </div>
        </div>
        <div class="info-section" v-if="editForm.role === 'admin'">
          <div class="info-title">管理员信息</div>
          <div class="form-row">
            <label class="label">权限等级</label>
            <input class="input" v-model="editForm.permissionLevel" />
          </div>
        </div>
        <template #footer>
          <button class="btn btn-ghost" @click="cancelEdit">取消</button>
          <button class="btn btn-primary" @click="saveEdit">保存</button>
        </template>
      </Modal>
      <!-- Modal for view info -->
      <Modal v-if="showInfoModal" title="个人信息" @close="closeInfo">
        <div class="info-section" style="position:relative">
          <div class="avatar-absolute">
            <img :src="viewingUser.avatar || defaultAvatar" alt="用户头像" class="user-avatar" />
          </div>
          <div class="info-row"><span class="info-label">用户 ID</span><span class="info-value">{{viewingUser.id}}</span></div>
          <div class="info-row"><span class="info-label">学号/职工号</span><span class="info-value">{{viewingUser.studentId || viewingUser.employeeId}}</span></div>
          <div class="info-row"><span class="info-label">昵称</span><span class="info-value">{{viewingUser.nickname}}</span></div>
          <div class="info-row"><span class="info-label">姓名</span><span class="info-value">{{viewingUser.name}}</span></div>
          <div class="info-row"><span class="info-label">手机号</span><span class="info-value">{{viewingUser.phone}}</span></div>
          <div class="info-row"><span class="info-label">性别</span><span class="info-value">{{viewingUser.gender}}</span></div>
          <div class="info-row"><span class="info-label">年龄</span><span class="info-value">{{viewingUser.age}}</span></div>
          <div class="info-row"><span class="info-label">邮箱</span><span class="info-value">{{viewingUser.email}}</span></div>
          <div class="info-row"><span class="info-label">用户类型</span><span class="info-value">{{viewingUser.role === 'student' ? '学生' : viewingUser.role === 'teacher' ? '教师' : '管理员'}}</span></div>
          <div class="info-row"><span class="info-label">账号状态</span><span class="info-value">{{viewingUser.status}}</span></div>
        </div>
        <div class="info-section" v-if="viewingUser.role === 'student'">
          <div class="info-title">学生信息</div>
          <div class="info-row"><span class="info-label">学院</span><span class="info-value">{{viewingUser.college}}</span></div>
          <div class="info-row"><span class="info-label">专业</span><span class="info-value">{{viewingUser.major}}</span></div>
          <div class="info-row"><span class="info-label">年级</span><span class="info-value">{{viewingUser.grade}}</span></div>
          <div class="info-row"><span class="info-label">班级</span><span class="info-value">{{viewingUser.class}}</span></div>
          <div class="info-row"><span class="info-label">辅导员</span><span class="info-value">{{viewingUser.counselor}}</span></div>
        </div>
        <div class="info-section" v-if="viewingUser.role === 'teacher'">
          <div class="info-title">教师信息</div>
          <div class="info-row"><span class="info-label">学院</span><span class="info-value">{{viewingUser.college}}</span></div>
          <div class="info-row"><span class="info-label">职位</span><span class="info-value">{{viewingUser.position}}</span></div>
        </div>
        <div class="info-section" v-if="viewingUser.role === 'admin'">
          <div class="info-title">管理员信息</div>
          <div class="info-row"><span class="info-label">管理员状态</span><span class="info-value">{{viewingUser.adminStatus}}</span></div>
          <div class="info-row"><span class="info-label">权限等级</span><span class="info-value">{{viewingUser.permissionLevel}}</span></div>
        </div>
        <template #footer>
          <button class="btn btn-danger" @click="deleteUser">删除</button>
          <button class="btn btn-danger" @click="resetPassword">重置密码</button>
          <button class="btn btn-primary" @click="openEdit(viewingUser)">编辑</button>
          
        </template>
      </Modal>
      <!-- Reset password confirm modal -->
      <Modal v-if="showResetConfirm" title="重置密码" @close="closeResetConfirm">
        <p>是否重置用户 <strong>{{viewingUser.name}}</strong> 的密码？</p>
        <template #footer>
          <button class="btn btn-ghost" @click="closeResetConfirm">取消</button>
          <button class="btn btn-danger" @click="confirmReset">确定</button>
        </template>
      </Modal>
      <!-- Reset password success modal -->
      <Modal v-if="showResetSuccess" title="重置成功" @close="closeResetSuccess">
        <p>密码已重置为默认密码：<strong>12345678</strong></p>
        <template #footer>
          <button class="btn btn-primary" @click="closeResetSuccess">确定</button>
        </template>
      </Modal>
      <!-- Delete user confirm modal -->
      <Modal v-if="showDeleteConfirm" title="删除用户" @close="closeDeleteConfirm">
        <p>是否删除用户 <strong>{{viewingUser.name}}</strong>？</p>
        <template #footer>
          <button class="btn btn-ghost" @click="closeDeleteConfirm">取消</button>
          <button class="btn btn-danger" @click="confirmDelete">确定</button>
        </template>
      </Modal>
      <!-- Batch import modal -->
      <Modal v-if="showImportModal" title="批量导入用户" @close="closeImport">
        <div class="import-container">
          <div class="import-format-tip">支持格式：Excel (.xlsx, .xls)、CSV</div>
          <div class="upload-area">
            <input type="file" ref="fileInput" accept=".xlsx,.xls,.csv" style="display:none" @change="handleFileChange" />
            <div class="upload-placeholder" @click="$refs.fileInput.click()">
              <div class="upload-icon">📁</div>
              <div class="upload-text">点击选择文件或拖拽文件到此处</div>
              <div class="upload-tip">支持 Excel (.xlsx, .xls) 和 CSV 格式</div>
            </div>
            <div v-if="selectedFile" class="file-info">
              <span class="file-name">{{ selectedFile.name }}</span>
              <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
            </div>
          </div>
          <div class="import-note">
            <strong>注意：</strong> 导入文件需包含以下列：姓名、手机号、角色、性别、年龄、邮箱
          </div>
        </div>
        <template #footer>
          <button class="btn btn-ghost" @click="closeImport">取消</button>
          <button class="btn btn-primary" @click="confirmImport">导入</button>
        </template>
      </Modal>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Modal from '../../components/Modal.vue'

const users = ref([
  { 
    id: 1, name: '张三', phone: '13800138000', role: 'teacher',
    employeeId: 'T001', nickname: '张老师', gender: '男', age: 35, avatar: '',
    status: '正常', email: 'zhangsan@school.edu.cn',
    college: '计算机学院', position: '副教授'
  },
  { 
    id: 2, name: '李四', phone: '13800138001', role: 'student',
    studentId: 'S2021001', nickname: '小李', gender: '女', age: 20, avatar: '',
    status: '正常', email: 'lisi@stu.school.edu.cn',
    college: '计算机学院', major: '软件工程', grade: '2021', class: '软工1班', counselor: '王老师'
  },
  { 
    id: 3, name: '管理员', phone: '13800138002', role: 'admin',
    employeeId: 'A001', nickname: 'admin', gender: '男', age: 30, avatar: '',
    status: '正常', email: 'admin@school.edu.cn',
    adminStatus: '在职', permissionLevel: '超级管理员'
  }
])

const q = ref('')
const roleFilter = ref('')

const filtered = computed(() => {
  let result = users.value
  if (roleFilter.value) {
    result = result.filter(u => u.role === roleFilter.value)
  }
  if (q.value) {
    result = result.filter(u => u.name.includes(q.value) || u.phone.includes(q.value))
  }
  return result
})

const showAddModal = ref(false)
const addForm = ref({ name: '', phone: '', gender: '男', age: 18, email: '', role: 'student', college: '', major: '', class: '', position: '', permissionLevel: '' })
const showEditModal = ref(false)
const editForm = ref({})
const showInfoModal = ref(false)
const viewingUser = ref({})
const showResetConfirm = ref(false)
const showResetSuccess = ref(false)
const showDeleteConfirm = ref(false)
const showImportModal = ref(false)
const selectedFile = ref(null)
const defaultAvatar = '/src/image/默认照片.jpg'

function openAdd(){
  addForm.value = { name: '', phone: '', gender: '男', age: 18, email: '', role: 'student', college: '', major: '', class: '', position: '', permissionLevel: '' }
  showAddModal.value = true
}

function openBatchImport(){
  selectedFile.value = null
  showImportModal.value = true
}

function handleFileChange(e){
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
  }
}

function formatFileSize(bytes){
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

function cancelAdd(){ showAddModal.value = false }

function saveAdd(){
  if (!addForm.value.name) { alert('请输入姓名'); return }
  if (!addForm.value.phone) { alert('请输入手机号'); return }
  const id = users.value.length ? Math.max(...users.value.map(u=>u.id))+1 : 1
  const newUser = { 
    id, 
    name: addForm.value.name, 
    phone: addForm.value.phone, 
    gender: addForm.value.gender, 
    age: addForm.value.age, 
    email: addForm.value.email, 
    role: addForm.value.role, 
    nickname: addForm.value.name,
    status: '正常' 
  }
  if (addForm.value.role === 'student') {
    Object.assign(newUser, { studentId: 'S' + id, college: addForm.value.college, major: addForm.value.major, grade: '', class: addForm.value.class, counselor: '' })
  } else if (addForm.value.role === 'teacher') {
    Object.assign(newUser, { employeeId: 'T' + id, college: addForm.value.college, position: addForm.value.position })
  } else {
    Object.assign(newUser, { employeeId: 'A' + id, adminStatus: '在职', permissionLevel: addForm.value.permissionLevel })
  }
  users.value.push(newUser)
  showAddModal.value = false
}

function openEdit(u){
  showInfoModal.value = false
  editForm.value = { ...u }
  showEditModal.value = true
}

function cancelEdit(){ showEditModal.value = false }

function saveEdit(){
  const idx = users.value.findIndex(x => x.id === editForm.value.id)
  if (idx !== -1) users.value[idx] = { ...users.value[idx], ...editForm.value }
  showEditModal.value = false
}

function remove(u){ if(confirm('删除用户 '+u.name+' ?')) users.value = users.value.filter(x=>x.id!==u.id) }

function viewInfo(u){
  viewingUser.value = { ...u }
  showInfoModal.value = true
}

function closeInfo(){ showInfoModal.value = false }

function resetPassword(){
  showResetConfirm.value = true
}

function closeResetConfirm(){ showResetConfirm.value = false }

function confirmReset(){
  showResetConfirm.value = false
  showResetSuccess.value = true
}

function closeResetSuccess(){ showResetSuccess.value = false }

function closeImport(){ showImportModal.value = false }

function confirmImport(){
  // 批量导入逻辑待实现
}

function deleteUser(){
  showDeleteConfirm.value = true
}

function closeDeleteConfirm(){ showDeleteConfirm.value = false }

function confirmDelete(){
  showDeleteConfirm.value = false
  showInfoModal.value = false
  const u = viewingUser.value
  users.value = users.value.filter(x => x.id !== u.id)
}
</script>

<style scoped>
.toolbar{display:flex;gap:12px;align-items:center;margin-bottom:12px}
.table{width:100%;border-collapse:collapse;background:transparent}
.table th,.table td{padding:12px;border-bottom:1px solid var(--surface-border);text-align:center}
.info-section{margin-bottom:16px}
.info-section:last-of-type{margin-bottom:0}
.info-title{font-weight:600;color:var(--primary);margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--surface-border)}
.avatar-absolute{position:absolute;top:0;right:0}
.user-avatar{width:200px;height:280px;object-fit:contain;border:3px solid #000}
.info-row{display:flex;align-items:center;padding:10px 0;border-bottom:1px solid var(--surface-border)}
.info-row:last-child{border-bottom:none}
.info-label{width:100px;color:var(--muted);font-size:14px}
.info-value{flex:1;font-weight:500}
.form-row{margin-top:8px}
.form-row .label{margin-bottom:4px}
.role-filter{width:120px;margin-left:12px}
.import-container{padding:8px 0}
.import-format-tip{font-size:13px;color:var(--muted);margin-bottom:16px;text-align:center}
.upload-area{border:2px dashed var(--surface-border);border-radius:12px;padding:40px 20px;text-align:center;background:linear-gradient(180deg,#fff,#f9fbfb);transition:all .2s}
.upload-area:hover{border-color:var(--primary);background:linear-gradient(180deg,#fff,#f0fdf5)}
.upload-placeholder{cursor:pointer}
.upload-icon{font-size:48px;margin-bottom:12px}
.upload-text{font-size:15px;color:var(--text);margin-bottom:6px}
.upload-tip{font-size:13px;color:var(--muted)}
.file-info{margin-top:16px;padding:12px;background:#f9fbfb;border-radius:8px;display:flex;justify-content:space-between;align-items:center}
.file-name{font-size:14px;color:var(--text);font-weight:500}
.file-size{font-size:13px;color:var(--muted)}
.import-note{margin-top:16px;padding:12px;background:#fff8e6;border-radius:8px;font-size:13px;color:#856404}
</style>
