<template>
  <div class="container">
    <h2>系统管理</h2>
    <div class="card" style="margin-top:12px">
      <p>系统设置、日志、备份等操作（示例）。</p>
      <div style="margin-top:12px;display:flex;gap:12px">
        <button class="btn btn-primary" @click="backup">备份数据</button>
        <button class="btn btn-ghost" @click="openLogs">查看日志</button>
      </div>
    </div>

    <Modal v-if="showLogs" title="系统日志" @close="closeLogs">
      <div style="max-height:300px;overflow:auto">
        <pre style="white-space:pre-wrap">{{ logs.join('\n') }}</pre>
      </div>
      <template #footer>
        <button class="btn btn-ghost" @click="closeLogs">关闭</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Modal from '../../components/Modal.vue'

const showLogs = ref(false)
const logs = ref([
  '2026-03-23 09:12 管理员 admin 登录',
  '2026-03-23 10:05 系统备份执行 完成',
  '2026-03-23 11:20 用户 张三 提交情绪报告'
])

function backup(){
  if (!confirm('确认要立即备份系统数据吗？')) return
  alert('备份任务已排队（示例）')
}
function openLogs(){ showLogs.value = true }
function closeLogs(){ showLogs.value = false }
</script>

<style scoped>
.btn-row{display:flex;gap:12px;margin-top:12px}
button{padding:8px 12px;border-radius:6px;border:1px solid var(--surface-border);background:#fff;cursor:pointer}
</style>
