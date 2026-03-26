<template>
  <div class="container">
    <h2>组织管理</h2>
    <div class="card" style="margin-top:12px">
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
      </div>

      <div class="org-tree" style="margin-top:16px">
        <template v-for="college in treeData" :key="college.id">
          <div class="tree-node">
            <div class="node-header" @click="toggleExpand(college, 'college')">
              <span class="expand-icon">{{ expanded[college.id] ? '▼' : '▶' }}</span>
              <strong>{{ college.name }}</strong>
              <span :class="college.status === 'normal' ? 'status-normal' : 'status-disabled'" style="margin-left:12px">
                {{ college.status === 'normal' ? '正常' : '禁用' }}
              </span>
            </div>

            <div v-if="expanded[college.id]" class="children">
              <div v-for="major in college.children" :key="major.id" class="tree-node">
                <div class="node-header" @click="toggleExpand(major, 'major')" style="margin-left:32px">
                  <span class="expand-icon">{{ expanded[major.id] ? '▼' : '▶' }}</span>
                  <strong>{{ major.name }}</strong>
                  <span :class="major.status === 'normal' ? 'status-normal' : 'status-disabled'" style="margin-left:12px">
                    {{ major.status === 'normal' ? '正常' : '禁用' }}
                  </span>
                </div>

                <div v-if="expanded[major.id]" class="children">
                  <div v-for="cls in major.children" :key="cls.id" class="tree-node leaf" style="margin-left:64px">
                    <span>{{ cls.name }}</span>
                    <span :class="cls.status === 'normal' ? 'status-normal' : 'status-disabled'" style="margin-left:12px">
                      {{ cls.status === 'normal' ? '正常' : '禁用' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <div v-if="treeData.length === 0" class="empty-state" style="margin-top:30px">
          <strong>暂无数据</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

const treeData = ref([])
const searchQuery = ref('')
const expanded = ref({})

const fetchWithAuth = async (url) => {
  // 修复 Bug 4：将 token 获取移入函数内部。防止用户登录状态变化后，这里使用的还是旧的 null 值
  const token = localStorage.getItem('auth_token')
  const res = await fetch(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    }
  })
  if (!res.ok) throw new Error('网络请求失败')
  const json = await res.json()
  if (json.code !== 200) throw new Error(json.message || '接口错误')
  return json.data
}

// 删除了导致性能问题的 getNodeStatus() 函数

const loadColleges = async () => {
  try {
    // 提醒：这里我将搜索参数改为了 keyword，以符合你“搜索学院/专业/班级”的全局搜索逻辑。
    // 如果后端接口没有全局搜索，且强制要求传 collegeName，请将 `keyword=` 改回 `collegeName=`
    const params = searchQuery.value ? `?keyword=${encodeURIComponent(searchQuery.value)}` : ''
    const data = await fetchWithAuth(`${API_BASE}/api/org/college${params}`)

    treeData.value = data.college_list.map(c => ({
      id: c.college_id,
      name: c.college_name,
      status: c.status === 1 ? 'normal' : 'disabled',
      children: []
    }))
  } catch (err) {
    console.error(err)
    alert('加载学院失败，请检查后端是否启动')
  }
}

// 修复 Bug 5：通过 node 和 type 参数，彻底消除 `node.id < 100` 这种极度危险的魔术数字判断
const toggleExpand = async (node, type) => {
  expanded.value[node.id] = !expanded.value[node.id]
  
  // 如果是收起节点，或者节点已经加载过子数据，则不再发送网络请求
  if (!expanded.value[node.id] || node.children.length > 0) return

  try {
    if (type === 'college') {  
      const data = await fetchWithAuth(`${API_BASE}/api/org/college/${node.id}/major`)
      node.children = data.major_list.list.map(m => ({
        id: m.major_id,
        name: m.major_name,
        status: m.status === 1 ? 'normal' : 'disabled',
        children: []
      }))
    } else if (type === 'major') {  
      const data = await fetchWithAuth(`${API_BASE}/api/org/major/${node.id}/grade-class`)
      node.children = data.class_list.list.map(cls => ({
        id: cls.class_id,
        name: cls.class_name,
        // 确保班级的数据状态也能被正常映射
        status: cls.status === 1 ? 'normal' : 'disabled', 
      }))
    }
  } catch (err) {
    console.error(err)
  }
}

const search = () => loadColleges()

onMounted(() => {
  loadColleges()
})
</script>

<style scoped>
/* 样式原封不动，完全保持你原有的设计 */
.card { background:#fff; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.05); padding:24px; }
.top-controls { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
.search { width:340px; padding:11px 14px; border:1px solid #e5e7eb; border-radius:10px; font-size:15px; }
.mode-badge { font-size:13px; padding:4px 12px; border-radius:9999px; background:#fef2f2; color:#ef4444; }

.tree-node { margin-bottom: 12px; }
.node-header { 
  display:flex; align-items:center; gap:10px; 
  padding:12px 14px; border-radius:10px; cursor:pointer; 
}
.node-header:hover { background:#f0fdf4; }
.expand-icon { width:22px; font-size:15px; font-weight:bold; color:#666; }

.children { margin-left:22px; margin-top:4px; }

.leaf .node-header { 
  padding:10px 14px; 
  background:#fafcfc; 
  border-left:3px solid #10b981; 
  margin-left:42px; 
  font-size:14.5px; 
  cursor:default;
}

.status-normal { background:#ecfdf5; color:#10b981; padding:3px 11px; border-radius:9999px; font-size:13px; font-weight:600; }
.status-disabled { background:#fef2f2; color:#ef4444; padding:3px 11px; border-radius:9999px; font-size:13px; font-weight:600; }
</style>