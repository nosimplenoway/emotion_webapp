<template>
  <div class="container">
    <h2>组织管理</h2>
    <div class="card" style="margin-top:12px">
      <!-- 顶部工具栏 -->
      <div class="top-controls">
        <div class="left">
          <input
            class="search"
            v-model="searchQuery"
            placeholder="搜索学院 / 专业 / 班级"
            @keyup.enter="search"
          />
          <button class="btn btn-ghost" @click="search">查询</button>
        </div>
        <div class="right">
          <button class="btn btn-primary" @click="openAddCollege">+ 添加学院</button>
          <button class="btn btn-primary" @click="openAddMajor">+ 添加专业</button>
          <button class="btn btn-primary" @click="openAddClass">+ 添加班级</button>
        </div>
      </div>

      <!-- 树形结构 -->
      <div class="org-tree" style="margin-top:16px">
        <template v-for="college in filteredTree" :key="college.id">
          <!-- 学院 -->
          <div class="tree-node">
            <div class="node-header" @click="toggleExpand(college.id)">
              <span class="expand-icon">{{ expanded[college.id] ? '▼' : '▶' }}</span>
              <strong>{{ college.name }}</strong>
              <span
                v-if="getStatus(college) === 'disabled'"
                class="status-disabled"
                style="margin-left:8px"
              >禁用</span>
            </div>

            <!-- 专业层 -->
            <div v-if="expanded[college.id]" class="children">
              <div v-for="major in college.children" :key="major.id" class="tree-node">
                <div class="node-header" @click="toggleExpand(major.id)" style="margin-left:28px">
                  <span class="expand-icon">{{ expanded[major.id] ? '▼' : '▶' }}</span>
                  <strong>{{ major.name }}</strong>
                  <span
                    v-if="getStatus(major) === 'disabled'"
                    class="status-disabled"
                    style="margin-left:8px"
                  >禁用</span>
                </div>

                <!-- 班级层 -->
                <div v-if="expanded[major.id]" class="children">
                  <div
                    v-for="cls in major.children"
                    :key="cls.id"
                    class="tree-node leaf"
                  >
                    <div class="node-header" style="margin-left:56px">
                      <span>{{ cls.name }}</span>
                      <span
                        :class="cls.status === 'normal' ? 'status-normal' : 'status-disabled'"
                        style="margin-left:12px"
                      >
                        {{ cls.status === 'normal' ? '正常' : '禁用' }}
                      </span>

                      <!-- 班级操作 -->
                      <div class="actions" style="margin-left:auto">
                        <button class="btn btn-sm btn-ghost" @click.stop="toggleClassStatus(cls)">
                          切换状态
                        </button>
                        <button class="btn btn-sm btn-ghost" @click.stop="editNode(cls)">编辑</button>
                        <button class="btn btn-sm btn-danger" @click.stop="deleteNode(cls)">删除</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- 空状态 -->
        <div v-if="filteredTree.length === 0" class="empty-state" style="margin-top:20px">
          <strong>暂无匹配的组织结构</strong>
        </div>
      </div>
    </div>

    <!-- 添加 / 编辑 Modal（复用已有的 Modal 组件） -->
    <Modal
      v-if="showModal"
      :title="modalTitle"
      @close="closeModal"
    >
      <div>
        <label class="label">组织名称</label>
        <input class="input" v-model="form.name" placeholder="请输入名称" />
      </div>

      <div v-if="form.type !== 'college'" style="margin-top:12px">
        <label class="label">所属上级</label>
        <select class="input" v-model="form.parentId">
          <option v-for="p in possibleParents" :key="p.id" :value="p.id">
            {{ p.displayName }}
          </option>
        </select>
      </div>

      <template #footer>
        <button class="btn btn-ghost" @click="closeModal">取消</button>
        <button class="btn btn-primary" @click="saveModal">保存</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Modal from '../../components/Modal.vue'

/* ==================== 数据结构 ==================== */
const treeData = ref([
  {
    id: 1,
    name: '计算机学院',
    type: 'college',
    children: [
      {
        id: 11,
        name: '软件工程',
        type: 'major',
        children: [
          { id: 111, name: '软件工程2024-1班', type: 'class', status: 'normal' },
          { id: 112, name: '软件工程2024-2班', type: 'class', status: 'disabled' },
          { id: 113, name: '软件工程2024-3班', type: 'class', status: 'normal' }
        ]
      },
      {
        id: 12,
        name: '计算机科学与技术',
        type: 'major',
        children: [
          { id: 121, name: '计科2024-1班', type: 'class', status: 'disabled' },
          { id: 122, name: '计科2024-2班', type: 'class', status: 'disabled' }
        ]
      }
    ]
  },
  {
    id: 2,
    name: '电子信息学院',
    type: 'college',
    children: [
      {
        id: 21,
        name: '通信工程',
        type: 'major',
        children: [
          { id: 211, name: '通信2024-1班', type: 'class', status: 'normal' },
          { id: 212, name: '通信2024-2班', type: 'class', status: 'disabled' }
        ]
      }
    ]
  }
])

/* ==================== 状态 ==================== */
const searchQuery = ref('')
const expanded = ref({})                    // { id: true/false }
const showModal = ref(false)
const modalTitle = ref('')
const form = ref({ type: '', name: '', parentId: null })

/* ==================== 递归计算状态 ==================== */
const getStatus = (node) => {
  if (node.type === 'class') return node.status
  if (!node.children || node.children.length === 0) return 'normal'

  // 只要有一个子节点（最终到班级）是 normal，父节点就是 normal
  const allDisabled = node.children.every(child => getStatus(child) === 'disabled')
  return allDisabled ? 'disabled' : 'normal'
}

/* ==================== 展开/收起 ==================== */
const toggleExpand = (id) => {
  expanded.value[id] = !expanded.value[id]
}

/* ==================== 搜索（支持子节点匹配） ==================== */
const matchesSubtree = (node, kw) => {
  if (node.name.toLowerCase().includes(kw)) return true
  if (node.children) {
    return node.children.some(child => matchesSubtree(child, kw))
  }
  return false
}

const filteredTree = computed(() => {
  if (!searchQuery.value.trim()) return treeData.value
  const kw = searchQuery.value.toLowerCase().trim()
  return treeData.value.filter(college => matchesSubtree(college, kw))
})

/* ==================== 班级状态切换 ==================== */
const toggleClassStatus = (cls) => {
  cls.status = cls.status === 'normal' ? 'disabled' : 'normal'
}

/* ==================== 删除节点 ==================== */
const deleteNode = (node) => {
  if (!confirm(`确定删除「${node.name}」吗？`)) return

  const removeFromArray = (arr) => {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].id === node.id) {
        arr.splice(i, 1)
        return true
      }
      if (arr[i].children && removeFromArray(arr[i].children)) return true
    }
    return false
  }
  removeFromArray(treeData.value)
}

/* ==================== 编辑节点（仅改名称） ==================== */
const editNode = (node) => {
  form.value = { type: node.type, name: node.name, parentId: null }
  modalTitle.value = `编辑 ${node.type === 'college' ? '学院' : node.type === 'major' ? '专业' : '班级'}`
  showModal.value = true
  // 编辑时临时记录原节点（后面 saveModal 会用到）
  window.__editingNode = node
}

/* ==================== 添加学院 ==================== */
const openAddCollege = () => {
  form.value = { type: 'college', name: '', parentId: null }
  modalTitle.value = '添加学院'
  showModal.value = true
}

/* ==================== 添加专业 ==================== */
const openAddMajor = () => {
  form.value = { type: 'major', name: '', parentId: null }
  modalTitle.value = '添加专业'
  showModal.value = true
}

/* ==================== 添加班级 ==================== */
const openAddClass = () => {
  form.value = { type: 'class', name: '', parentId: null }
  modalTitle.value = '添加班级'
  showModal.value = true
}

/* ==================== Modal 动态上级选项 ==================== */
const possibleParents = computed(() => {
  if (form.value.type === 'major') {
    return treeData.value.map(c => ({
      id: c.id,
      displayName: c.name
    }))
  }
  if (form.value.type === 'class') {
    const list = []
    treeData.value.forEach(college => {
      college.children?.forEach(major => {
        list.push({
          id: major.id,
          displayName: `${college.name} → ${major.name}`
        })
      })
    })
    return list
  }
  return []
})

/* ==================== 保存 Modal ==================== */
const saveModal = () => {
  if (!form.value.name.trim()) {
    alert('请输入名称')
    return
  }

  const newId = Date.now() // 简单唯一ID

  if (form.value.type === 'college') {
    treeData.value.push({
      id: newId,
      name: form.value.name,
      type: 'college',
      children: []
    })
  } else if (form.value.type === 'major') {
    const parent = findNodeById(form.value.parentId)
    if (parent && parent.type === 'college') {
      parent.children.push({
        id: newId,
        name: form.value.name,
        type: 'major',
        children: []
      })
    }
  } else if (form.value.type === 'class') {
    const parent = findNodeById(form.value.parentId)
    if (parent && parent.type === 'major') {
      parent.children.push({
        id: newId,
        name: form.value.name,
        type: 'class',
        status: 'normal'
      })
    }
  } else if (window.__editingNode) {
    // 编辑模式
    window.__editingNode.name = form.value.name
    window.__editingNode = null
  }

  closeModal()
}

/* ==================== 查找节点（递归） ==================== */
const findNodeById = (id, nodes = treeData.value) => {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNodeById(id, node.children)
      if (found) return found
    }
  }
  return null
}

/* ==================== 关闭 Modal ==================== */
const closeModal = () => {
  showModal.value = false
  form.value = { type: '', name: '', parentId: null }
  window.__editingNode = null
}

/* ==================== 搜索按钮（触发 computed） ==================== */
const search = () => {
  // 只需要触发响应式即可
}
</script>

<style scoped>
.org-tree {
  user-select: none;
}
.tree-node {
  margin-bottom: 4px;
}
.node-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.node-header:hover {
  background: #f0fff6;
}
.expand-icon {
  font-size: 13px;
  width: 18px;
  display: inline-block;
}
.children {
  margin-top: 2px;
}
.leaf .node-header {
  cursor: default;
}
.actions {
  display: flex;
  gap: 6px;
  margin-left: auto;
}
.status-normal,
.status-disabled {
  font-size: 13px;
  padding: 2px 10px;
  border-radius: 9999px;
  font-weight: 700;
}
</style>