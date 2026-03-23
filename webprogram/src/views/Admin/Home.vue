<template>
  <div class="home">
    <h2>首页 - 概览</h2>
    <div class="cards">
      <div class="card">活跃用户： <strong>124</strong></div>
      <div class="card">今日情绪报告： <strong>38</strong></div>
      <div class="card">待处理反馈： <strong>5</strong></div>
    </div>

    <section class="section">
      <h3>最近概览</h3>
      <p>这里可以放图表或最近的数据摘要（示例静态展示）。</p>
    </section>
  </div>
</template>

<script setup>
</script>

<style scoped>
.home .cards{display:flex;gap:12px;margin-top:12px}
.card{flex:1;padding:16px;background:#fff;border:1px solid #eef2f6;border-radius:6px}
.section{margin-top:18px;padding:12px;background:#fff;border-radius:6px;border:1px solid #eef2f6}
</style>
