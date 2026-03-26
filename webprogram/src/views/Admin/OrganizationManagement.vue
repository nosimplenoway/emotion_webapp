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
        <div v-if="isLoading" class="loading-state" style="padding: 40px 0; text-align: center; color: #666;">
          <strong>数据加载中，请稍候...</strong>
        </div>

        <template v-else-if="treeData.length > 0">
          <template v-for="college in treeData" :key="`college_${college.id}`">
            <div class="tree-node">
              <div class="node-header" @click="toggleExpand(college, 'college')">
                <span class="expand-icon">{{ expanded[`college_${college.id}`] ? '▼' : '▶' }}</span>
                <strong>{{ college.name }}</strong>
                <span :class="college.status === 'normal' ? 'status-normal' : 'status-disabled'" style="margin-left:12px">
                  {{ college.status === 'normal' ? '正常' : '禁用' }}
                </span>
              </div>

              <div v-if="expanded[`college_${college.id}`]" class="children">
                <div v-for="major in college.children" :key="`major_${major.id}`" class="tree-node">
                  <div class="node-header" @click="toggleExpand(major, 'major')" style="margin-left:32px">
                    <span class="expand-icon">{{ expanded[`major_${major.id}`] ? '▼' : '▶' }}</span>
                    <strong>{{ major.name }}</strong>
                    <span :class="major.status === 'normal' ? 'status-normal' : 'status-disabled'" style="margin-left:12px">
                      {{ major.status === 'normal' ? '正常' : '禁用' }}
                    </span>
                  </div>

                  <div v-if="expanded[`major_${major.id}`]" class="children">
                    <div v-for="cls in major.children" :key="`class_${cls.id}`" class="tree-node leaf" style="margin-left:64px">
                      <div class="node-header">
                        <span>{{ cls.name }}</span>
                        <span :class="cls.status === 'normal' ? 'status-normal' : 'status-disabled'" style="margin-left:12px">
                          {{ cls.status === 'normal' ? '正常' : '禁用' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </template>

        <div v-else class="empty-state" style="margin-top:30px">
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
const isLoading = ref(false) // 控制加载状态

const fetchWithAuth = async (url) => {
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

const loadColleges = async () => {
  try {
    isLoading.value = true // 开启加载遮罩
    const params = searchQuery.value ? `?keyword=${encodeURIComponent(searchQuery.value)}` : ''
    const data = await fetchWithAuth(`${API_BASE}/api/org/college${params}`)

    let colleges = data.college_list.map(c => ({
      id: c.college_id,
      name: c.college_name,
      status: c.status === 1 ? 'normal' : 'disabled',
      children: [],
      loaded: false
    }))

    // 阻塞式请求所有子节点数据并计算状态
    await Promise.all(colleges.map(async (college) => {
      try {
        const majorData = await fetchWithAuth(`${API_BASE}/api/org/college/${college.id}/major`)
        const majors = majorData.major_list.list.map(m => ({
          id: m.major_id,
          name: m.major_name,
          status: m.status === 1 ? 'normal' : 'disabled',
          children: [],
          loaded: false
        }))
        
        college.children = majors
        college.loaded = true

        await Promise.all(majors.map(async (major) => {
          try {
            const classData = await fetchWithAuth(`${API_BASE}/api/org/major/${major.id}/grade-class`)
            const classes = classData.class_list.list.map(cls => ({
              id: cls.class_id,
              name: cls.class_name,
              status: cls.status === 0 ? 'disabled' : 'normal' 
            }))
            
            major.children = classes
            major.loaded = true
            
            // 加入 classes.length > 0 判断。只有当“有班级数据”并且“所有班级都是禁用”时，才往上推导禁用。防止空专业把学院给禁了。
            if (classes.length > 0 && classes.every(cls => cls.status === 'disabled')) {
              major.status = 'disabled'
              college.status = 'disabled'
            }
          } catch (e) {
            console.error(`加载专业 ${major.name} 的班级失败`, e)
          }
        }))

        if (majors.length > 0 && majors.every(m => m.status === 'disabled')) {
          college.status = 'disabled'
        }

      } catch (err) {
        console.error(`加载学院 ${college.name} 的数据失败`, err)
      }
    }))

    //所有状态全部计算好后赋值
    treeData.value = colleges

  } catch (err) {
    console.error(err)
    alert('加载数据失败，请检查后端是否启动')
  } finally {
    isLoading.value = false 
  }
}

const toggleExpand = async (node, type) => {
  const expandKey = `${type}_${node.id}`
  expanded.value[expandKey] = !expanded.value[expandKey]
  // 展开时直接使用预先计算好的树数据，纯本地交互
}

const search = () => loadColleges()

onMounted(() => {
  loadColleges()
})
</script>

<style scoped>
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

/* 叶子节点（班级）样式现在可以正确生效了 */
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