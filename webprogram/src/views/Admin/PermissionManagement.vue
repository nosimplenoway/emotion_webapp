<template>
  <div class="container">
    <h2>日志管理</h2>
    <div class="card" style="margin-top:12px">
      <div class="top-controls">
        <div class="left">
          <input class="search" placeholder="按用户/操作/时间搜索" v-model="q" />
        </div>
        <div class="right">
          <button class="btn btn-ghost" @click="refresh">刷新</button>
          <button class="btn btn-ghost" @click="exportLogs">导出</button>
        </div>
      </div>

      <table class="table">
        <thead><tr><th>时间</th><th>用户</th><th>操作</th><th>详情</th></tr></thead>
        <tbody>
          <tr v-for="l in filtered" :key="l.id">
            <td>{{l.time}}</td>
            <td>{{l.user}}</td>
            <td>{{l.action}}</td>
            <td><button class="btn btn-ghost" @click="view(l)">查看</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal v-if="showView" :title="'日志详情'" @close="closeView">
      <div style="white-space:pre-wrap;max-height:320px;overflow:auto">{{ currentLog?.detail }}</div>
      <template #footer>
        <button class="btn btn-ghost" @click="closeView">关闭</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Modal from '../../components/Modal.vue'

const q = ref('')
const logs = ref([
  { id: 1, time: '2026-03-23 09:12', user: 'admin', action: '登录', detail: '管理员 admin 在后台登录' },
  { id: 2, time: '2026-03-23 10:05', user: 'system', action: '备份', detail: '系统备份任务完成' },
  { id: 3, time: '2026-03-23 11:20', user: '张三', action: '提交情绪报告', detail: '情绪种类：焦虑，分数：3' }
])

const filtered = computed(() => {
  if (!q.value) return logs.value
  const kw = q.value.toLowerCase()
  return logs.value.filter(l => l.user.toLowerCase().includes(kw) || l.action.toLowerCase().includes(kw) || l.time.includes(kw) || (l.detail && l.detail.toLowerCase().includes(kw)))
})

const showView = ref(false)
const currentLog = ref(null)

function refresh(){ /* placeholder: 可从后端拉取 */ alert('刷新完成（示例）') }
function exportLogs(){ alert('导出已触发（示例）') }
function view(l){ currentLog.value = l; showView.value = true }
function closeView(){ showView.value = false }
</script>

<style scoped>
.toolbar{display:flex;gap:12px;align-items:center;margin-bottom:12px}
.table{width:100%;border-collapse:collapse;background:transparent}
.table th,.table td{padding:12px;border-bottom:1px solid var(--surface-border);text-align:left}
</style>
