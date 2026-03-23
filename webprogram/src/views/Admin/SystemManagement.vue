<template>
  <div>
    <h2>系统管理</h2>
    <p>系统设置、日志、备份等操作（示例）。</p>
    <div class="btn-row">
      <button @click="backup">备份数据</button>
      <button @click="logs">查看日志</button>
    </div>
  </div>
</template>

<script setup>
function backup(){ alert('触发备份（示例）') }
function logs(){ alert('打开日志（示例）') }
</script>

<style scoped>
.btn-row{display:flex;gap:12px;margin-top:12px}
button{padding:8px 12px;border-radius:4px;border:1px solid #dce6f1;background:#fff;cursor:pointer}
</style>
